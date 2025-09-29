import { Actor } from 'apify';
import { Input } from './input.js';
import { runAgent } from './agent_runner.js';

const input = await Actor.getInput() as Input;
await runAgent(input);

