#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'node:fs';
import { shrinkHtml } from '../shrink_html.js';
import {
    WHITELIST_ATTRIBUTES_WEB_AUTOMATION,
    WHITELIST_TAGS_WEB_AUTOMATION,
} from '../consts.js';

// Fake Page adapter so we can reuse shrinkHtml(page, …) without Puppeteer
const fakePage = (html) => ({ async content() { return html; } });

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(`Usage:
  shrink-html <input.html> [--out output.html]
  cat input.html | shrink-html > output.html
`);
    process.exit(0);
}

const outIdx = Math.max(args.indexOf('--out'), args.indexOf('-o'));
let outPath = null;
if (outIdx >= 0 && args[outIdx + 1]) outPath = args[outIdx + 1];

async function readStdin() {
    return new Promise((res, rej) => {
        let b = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (c) => {
            b += c;
        });
        process.stdin.on('end', () => res(b));
        process.stdin.on('error', rej);
    });
}

async function main() {
    let input = '';
    if (!process.stdin.isTTY) input = await readStdin();
    else input = fs.readFileSync(args[0], 'utf8');

    const html = await shrinkHtml(fakePage(input), {
        whiteListTags: WHITELIST_TAGS_WEB_AUTOMATION,
        whiteListAttributes: WHITELIST_ATTRIBUTES_WEB_AUTOMATION,
        attributePrefixes: ['data-', 'aria-'],
        keepTextOnly: false,
        removeEmpty: true,
        preserveWhitespaceIn: ['pre', 'code', 'textarea'],
        normalizeWhitespace: true,
    });

    if (outPath) fs.writeFileSync(outPath, html, 'utf8');
    else process.stdout.write(html);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
