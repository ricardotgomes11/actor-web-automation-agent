import { mkdir, readFile, writeFile } from 'fs/promises';
import { extractManualTranscriptFromHtml, buildFullProjectPlan, renderProjectPlanMarkdown } from './transcript_migrator.js';

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'transcript';
}

async function loadHtml(source: string): Promise<string> {
    const isRemote = source.startsWith('http://') || source.startsWith('https://');
    if (!isRemote) {
        return readFile(source, 'utf8');
    }

    const response = await fetch(source, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebAutomationAgent/1.0)',
            Accept: 'text/html,application/xhtml+xml',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${source}: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

async function main() {
    const args = process.argv.slice(2);
    const source = args[0];
    const projectName = args[1];
    if (!source) {
        throw new Error('Usage: npm run transcript:plan -- <url-or-html-file|transcript:PATH> [project-name]');
    }

    const isTranscriptSource = source.startsWith('transcript:');
    const transcript = isTranscriptSource
        ? await readFile(source.replace(/^transcript:/, ''), 'utf8')
        : extractManualTranscriptFromHtml(await loadHtml(source));
    const plan = buildFullProjectPlan(transcript, projectName || 'Transcript Migration Project');
    const markdown = renderProjectPlanMarkdown(plan);

    const fallbackName = source.startsWith('http') ? new URL(source).hostname : source;
    const fileName = `${slugify(projectName || fallbackName)}-project-plan.md`;
    const outputPath = `docs/${fileName}`;

    await mkdir('docs', { recursive: true });
    await writeFile(outputPath, markdown, 'utf8');
    process.stdout.write(`Saved project plan to ${outputPath}\n`);
}

await main();
