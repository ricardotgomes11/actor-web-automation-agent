import { Actor, log } from 'apify';
import { readFile } from 'fs/promises';
import { launchPuppeteer, sleep } from 'crawlee';
import { OpenAIAgent } from 'langchain/agents';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { AgentStep } from 'langchain/schema';
import { DynamicStructuredTool } from 'langchain/tools';
import { BufferMemory } from 'langchain/memory';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { WebAgentExecutor } from './agent_executor.js';
import { Input } from './input.js';
import { ACTION_LIST } from './agent_actions.js';
import { createServer } from './screenshotter_server.js';
import { webAgentLog } from './utils.js';
import { HTML_CURRENT_PAGE_PREFIX } from './consts.js';
import { CostHandler } from './cost_handler.js';

const LIVE_VIEW_URL = process.env.ACTOR_WEB_SERVER_URL ? process.env.ACTOR_WEB_SERVER_URL : 'http://localhost:4000';
const RECORDING_PATH = 'recording.mp4';

export interface RunResult {
    result: string;
    costUSD: number;
}

export async function runAgent(input: Input): Promise<RunResult> {
    const {
        startUrl,
        instructions,
        proxyConfiguration,
        openaiApiKey,
        model = 'gpt-3.5-turbo-16k',
    } = input;

    if (!process.env.OPENAI_API_KEY && !openaiApiKey) {
        await Actor.fail('You need to set open AI API key in input.');
        throw new Error('The openai API key cannot be empty!');
    }

    log.info('Starting Actor..', { startUrl, instructions });

    const initialContext = {
        role: 'system',
        content: '## OBJECTIVE ##\n'
            + 'You have been tasked with automate action on web page based on a task given by the user. '
            + 'You are connected to a web browser which you can control via function calls to navigate to pages and list elements on the page. '
            + 'You can also type into search boxes and other input fields and send forms. '
            + 'If you open or go to a page content from the page will be scraped and returned to you. '
            + 'You can do just one action in time from available actions.'
            + 'You can also click links on the page. You will behave as a human browsing the web.\n'
            + '## NOTES ##\n'
            + 'You will try to navigate directly to the most relevant web address. '
            + 'If you were given a URL, go to it directly. If you encounter a Page Not Found error, try another URL. '
            + 'If multiple URLs don\'t work, you are probably using an outdated version of the URL scheme of that website. '
            + 'In that case, try navigating to their front page and using their search bar or try navigating to the right place with links.',
    };

    let proxyUrl;
    if (proxyConfiguration) {
        const proxy = await Actor.createProxyConfiguration(proxyConfiguration);
        if (proxy) proxyUrl = await proxy.newUrl();
    }

    let browser;
    let page;
    let recorder;
    let server;
    let result = '';
    let costUSD = 0;
    try {
        browser = await launchPuppeteer({
            useChrome: true,
            launchOptions: {
                headless: false,
                args: [
                    '--window-size=1920,1080',
                ],
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                },
            },
            proxyUrl,
        });
        page = await browser.newPage();
        log.info('Browser opened');

        log.info('Start recording');
        recorder = new PuppeteerScreenRecorder(page, {
            fps: 30,
            videoFrame: {
                width: 1920,
                height: 1080,
            },
            videoCrf: 18,
            videoCodec: 'libx264',
            videoPreset: 'ultrafast',
            videoBitrate: 1000,
            autopad: {
                color: 'black',
            },
            ffmpeg_Path: process.env.FFMPEG_PATH || undefined,
        });
        await recorder.start(RECORDING_PATH);

        server = await createServer(page);
        log.info(`Live view started, you can see Web Automation Agent in action on in Live View tab or ${LIVE_VIEW_URL}`);

        const tools = ACTION_LIST.map((action) => new DynamicStructuredTool({
            name: action.name,
            description: action.description,
            schema: action.parameters,
            func: async (args) => action.action({ page }, args),
        }));

        const costHandler = new CostHandler(model);
        const llm = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY || openaiApiKey,
            modelName: model,
            temperature: 0,
            callbacks: [
                costHandler,
            ],
        });

        const executor = WebAgentExecutor.fromAgentAndTools({
            tags: ['openai-functions'],
            agent: OpenAIAgent.fromLLMAndTools(llm, tools, {
                prefix: initialContext.content,
            }),
            tools,
            memory: new BufferMemory({
                returnMessages: true,
                memoryKey: 'chat_history',
                inputKey: 'input',
                outputKey: 'output',
            }),
            updatePreviousStepMethod: (previousStep: AgentStep) => {
                if (previousStep?.observation) {
                    return {
                        ...previousStep,
                        observation: previousStep.observation.replace(new RegExp(`${HTML_CURRENT_PAGE_PREFIX} .*`), 'HTML of page was omitted'),
                    } as AgentStep;
                }
                return previousStep;
            },
            verbose: log.getLevel() >= log.LEVELS.DEBUG,
        });

        const finalInstructions = startUrl
            ? `Open url ${startUrl} and continue with ${instructions}`
            : instructions;
        webAgentLog.info(`Starting agent with instructions: ${finalInstructions}`);
        result = await executor.run(finalInstructions);
        const costs = costHandler.getTotalCost();
        costUSD = costs.usd;
        webAgentLog.info(`Agent finished its work.`, { costUSD });
        webAgentLog.info(result);

        await sleep(3000);
    } finally {
        if (server) await server.destroy();
        if (recorder) await recorder.stop();
        if (browser) await browser.close();
        try {
            const store = await Actor.openKeyValueStore();
            const recordingBuffer = await readFile(RECORDING_PATH);
            await store.setValue('recording.mp4', recordingBuffer, { contentType: 'video/mp4' });
            log.info(`Recording finished, you can see it or download it in on ${store.getPublicUrl(RECORDING_PATH)}`);
        } catch (err) {
            log.error('Error while saving recording to key-value store', { err });
        }
    }

    return { result, costUSD };
}
