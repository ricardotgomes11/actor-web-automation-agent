import { readFile } from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function loadReadme(path: string): Promise<string> {
    try {
        return await readFile(`${path}/README.md`, 'utf-8');
    } catch {
        return '';
    }
}

async function main() {
    const projectPath = process.argv[2] || '.';
    const question = process.argv.slice(3).join(' ') || 'Explain this project.';
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_API_KEY env variable is required');

    const readme = await loadReadme(projectPath);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = readme
        ? `You are a helpful assistant. Use the following README to answer questions:\n${readme}`
        : 'You are a helpful assistant for the project.';

    const chat = model.startChat({
        history: [
            { role: 'system', parts: [{ text: systemPrompt }] },
        ],
    });

    const result = await chat.sendMessage(question);
    console.log(result.response.text());
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
