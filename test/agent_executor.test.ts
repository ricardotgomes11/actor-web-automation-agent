import { describe, expect, test } from '@jest/globals';
import { WebAgentExecutor } from '../src/agent_executor.js';

const createAgent = () => ({
    inputKeys: ['input'],
    returnValues: ['output'],
    _agentActionType: () => 'single',
    plan: jest.fn()
        .mockResolvedValueOnce({ tool: 'test', toolInput: 'foo', log: '' })
        .mockResolvedValueOnce({ returnValues: { output: 'done' }, log: '' }),
    prepareForOutput: jest.fn(async (r) => ({ prepared: true })),
    returnStoppedResponse: jest.fn(),
});

const tool = { name: 'test', call: jest.fn(async () => 'tool-result'), returnDirect: false };


describe('WebAgentExecutor workflow', () => {
    test('runs agent plan and updates previous step', async () => {
        const agent = createAgent();
        const updatePreviousStepMethod = jest.fn((s) => ({ ...s, observation: `${s.observation}-updated` }));
        const executor = new WebAgentExecutor({ agent, tools: [tool], updatePreviousStepMethod, returnIntermediateSteps: true });
        const result = await executor.call({ input: 'hello' });
        expect(agent.plan).toHaveBeenCalledTimes(2);
        expect(tool.call).toHaveBeenCalledWith('foo', undefined);
        expect(result.output).toBe('done');
        expect(result.intermediateSteps[0].observation).toBe('tool-result-updated');
    });
});
