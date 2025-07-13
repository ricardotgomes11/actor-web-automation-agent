import { Actor, log } from 'apify';
import { runAgent } from './agent_runner.js';
import { Input } from './input.js';

await Actor.init();

const input = await Actor.getInput() as Input;
const { result, costUSD } = await runAgent(input);
log.info('Run finished', { costUSD });
log.info(result);

await Actor.exit();

