import { readFile, writeFile } from 'fs/promises';
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
    const [source, projectName] = process.argv.slice(2);
    if (!source) {
        throw new Error('Usage: npm run transcript:plan -- <url-or-html-file> [project-name]');
    }

    const html = await loadHtml(source);
    const transcript = extractManualTranscriptFromHtml(html);
    const plan = buildFullProjectPlan(transcript, projectName || 'Transcript Migration Project');
    const markdown = renderProjectPlanMarkdown(plan);

    const fallbackName = source.startsWith('http') ? new URL(source).hostname : source;
    const fileName = `${slugify(projectName || fallbackName)}-project-plan.md`;
    const outputPath = `docs/${fileName}`;

    await writeFile(outputPath, markdown, 'utf8');
    console.log(`Saved project plan to ${outputPath}`);
}

await main();
