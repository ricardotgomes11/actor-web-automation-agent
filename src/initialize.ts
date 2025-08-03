import { writeFile } from 'fs/promises';
import { Input } from './input.js';

/**
 * Generates an input file for the actor using environment variables.
 */
async function generateSeed(): Promise<void> {
    const input: Input = {
        startUrl: process.env.START_URL ?? 'https://example.com',
        instructions: process.env.INSTRUCTIONS ?? 'Run the automation.',
        openaiApiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL ?? 'gpt-4',
    };

    await writeFile('generated_input.json', JSON.stringify(input, null, 2));
    console.log('generated_input.json created');
}

generateSeed().catch((err) => {
    console.error('Failed to generate input', err);
    process.exit(1);
});
