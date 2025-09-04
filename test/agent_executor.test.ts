import { describe, expect, test } from '@jest/globals';
import { WebAgentExecutor } from '../src/agent_executor.js';

const dummyAgent: any = {
    _agentActionType: () => 'single',
    inputKeys: [],
    returnValues: [],
    plan: () => ({}),
    prepareForOutput: () => ({}),
};

describe('WebAgentExecutor', () => {
    test('throws when maxIterations is non-positive', () => {
        expect(() => WebAgentExecutor.fromAgentAndTools({
            agent: dummyAgent,
            tools: [],
            maxIterations: 0,
        })).toThrow('maxIterations must be a positive integer');
    });
});
