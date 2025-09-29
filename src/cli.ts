import { readFile } from 'fs/promises';
import { runAgent } from './agent_runner.js';
import { Input } from './input.js';

export async function main(args = process.argv.slice(2)) {
    const inputIndex = args.findIndex((arg) => arg === '--input' || arg === '-i');
    if (inputIndex === -1 || !args[inputIndex + 1]) {
        console.error('Usage: node cli.js --input <path_to_input.json>');
        process.exit(1);
    }
    const inputPath = args[inputIndex + 1];
    const raw = await readFile(inputPath, 'utf-8');
    const input = JSON.parse(raw) as Input;
    await runAgent(input);
}

if (process.argv[1] && (process.argv[1].endsWith('cli.js') || process.argv[1].endsWith('cli.ts'))) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
