import { webAgentLog } from './utils.js';
import { WebAgentExecutor } from './agent_executor.js';

/**
 * Runs the WebAgentExecutor in "Jules self mode".
 * In this mode the agent executes the given instructions
 * multiple times, each time feeding the previous result
 * back as the next instruction. This demonstrates a very
 * simple form of self-adaptation.
 */
export async function runJulesSelfMode(
    executor: WebAgentExecutor,
    initialInstructions: string,
    iterations = 3,
): Promise<string> {
    let instructions = initialInstructions;
    let result = '';
    for (let i = 0; i < iterations; i++) {
        webAgentLog.info(`Jules self mode iteration ${i + 1}`);
        result = await executor.run(instructions);
        instructions = `Continue with: ${result}`;
    }
    return result;
}
