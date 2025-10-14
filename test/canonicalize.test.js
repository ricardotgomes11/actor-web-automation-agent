import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalizeText } from '../src/canonicalize.js';

const sample = '\ufeffLine with spaces   \r\n' +
    '\r\n' +
    'Second line\t\r\n' +
    'Third line\r\n' +
    '\r\n' +
    '\r\n';

test('canonicalizeText normalizes whitespace, line endings, and blank lines', () => {
    const canonical = canonicalizeText(sample);
    assert.equal(canonical, 'Line with spaces\n\nSecond line\nThird line\n');
});

test('canonicalizeText ensures trailing newline', () => {
    const canonical = canonicalizeText('No newline at end');
    assert.equal(canonical, 'No newline at end\n');
});
