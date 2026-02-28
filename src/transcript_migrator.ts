import * as cheerio from 'cheerio';

export interface TranscriptSection {
    title: string;
    bullets: string[];
    notes: string[];
}

export interface FullProjectPlan {
    projectName: string;
    sourceSummary: string;
    transcript: string;
    sections: TranscriptSection[];
    architecture: {
        modules: string[];
        dataFlow: string[];
    };
    roadmap: {
        phase: string;
        outcomes: string[];
    }[];
}

function normalizeWhitespace(text: string): string {
    return text
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function toSentenceCase(title: string): string {
    return title
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function extractManualTranscriptFromHtml(html: string): string {
    const $ = cheerio.load(html);

    $('script, style, noscript, iframe, svg').remove();

    const blocks: string[] = [];
    $('h1, h2, h3, h4, p, li').each((_, element) => {
        const tag = element.tagName.toLowerCase();
        const text = normalizeWhitespace($(element).text());
        if (!text) return;

        if (tag.startsWith('h')) {
            blocks.push(`## ${text}`);
            return;
        }

        if (tag === 'li') {
            blocks.push(`- ${text}`);
            return;
        }

        blocks.push(text);
    });

    return normalizeWhitespace(blocks.join('\n'));
}

export function parseTranscriptSections(transcript: string): TranscriptSection[] {
    const lines = transcript.split(/\r?\n/);
    const sections: TranscriptSection[] = [];
    let current: TranscriptSection | null = null;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (line.startsWith('## ')) {
            if (current) sections.push(current);
            current = {
                title: line.replace(/^##\s+/, ''),
                bullets: [],
                notes: [],
            };
            continue;
        }

        if (!current) {
            current = {
                title: 'Overview',
                bullets: [],
                notes: [],
            };
        }

        if (line.startsWith('- ')) {
            current.bullets.push(line.replace(/^-\s+/, ''));
        } else {
            current.notes.push(line);
        }
    }

    if (current) sections.push(current);
    return sections;
}

export function buildFullProjectPlan(transcript: string, projectName = 'Migrated Project'): FullProjectPlan {
    const sections = parseTranscriptSections(transcript);

    const modules = sections.map((section) => `${toSentenceCase(section.title)} Module`);
    const dataFlow = sections.map((section, idx) => {
        const next = sections[idx + 1];
        if (!next) return `${toSentenceCase(section.title)} -> Delivery`;
        return `${toSentenceCase(section.title)} -> ${toSentenceCase(next.title)}`;
    });

    const roadmap = [
        {
            phase: 'Phase 1 - Foundation',
            outcomes: [
                'Capture the source transcript and align scope with explicit goals.',
                'Define interfaces, contracts, and baseline quality gates.',
            ],
        },
        {
            phase: 'Phase 2 - Build',
            outcomes: modules.map((module) => `Implement ${module}.`),
        },
        {
            phase: 'Phase 3 - Validation & Launch',
            outcomes: [
                'Run integration tests and reliability checks.',
                'Prepare deployment playbook and monitoring dashboards.',
            ],
        },
    ];

    const sourceSummary = sections.length
        ? `Expanded ${sections.length} transcript sections into an implementation-ready project plan.`
        : 'Expanded transcript into an implementation-ready project plan.';

    return {
        projectName,
        sourceSummary,
        transcript,
        sections,
        architecture: {
            modules,
            dataFlow,
        },
        roadmap,
    };
}

export function renderProjectPlanMarkdown(plan: FullProjectPlan): string {
    const sectionText = plan.sections.map((section) => {
        const bulletText = section.bullets.length
            ? section.bullets.map((item) => `- ${item}`).join('\n')
            : '- No explicit bullets in transcript section.';
        const notesText = section.notes.length
            ? section.notes.map((note) => `- ${note}`).join('\n')
            : '- No extra notes in transcript section.';

        return `## ${section.title}\n\n### Extracted points\n${bulletText}\n\n### Notes\n${notesText}`;
    }).join('\n\n');

    const modules = plan.architecture.modules.map((module) => `- ${module}`).join('\n');
    const dataFlow = plan.architecture.dataFlow.map((item) => `- ${item}`).join('\n');
    const roadmap = plan.roadmap.map((phase) => {
        const outcomes = phase.outcomes.map((outcome) => `- ${outcome}`).join('\n');
        return `### ${phase.phase}\n${outcomes}`;
    }).join('\n\n');

    const markdownSections = [
        `# ${plan.projectName}`,
        plan.sourceSummary,
        '# Manual Transcript',
        plan.transcript,
        '# Project Expansion',
        '## Architecture',
        '### Modules',
        modules,
        '### Data flow',
        dataFlow,
        '## Delivery Roadmap',
        roadmap,
        '## Source Sections',
        sectionText,
    ];

    return `${markdownSections.join('\n\n')}\n`;
}
