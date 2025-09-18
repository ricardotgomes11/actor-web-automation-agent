import { strict as assert } from 'node:assert';
import test from 'node:test';

let shrinkHtmlForWebAutomation;
let depsPresent = true;
try {
    ({ shrinkHtmlForWebAutomation } = await import('../src/shrink_html.js'));
} catch {
    depsPresent = false;
}

const createPage = (html) => ({
    async content() {
        return html;
    },
});

const DUMMY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page live view</title>
    <!--  Ensures page refresh every 1 sec  -->
     <meta http-equiv="refresh" content="1">
</head>
<body>
   <img src="test.jpg" />
</body>
</html>`;

test('shrinkHtmlForWebAutomation can be run twice', { skip: !depsPresent }, async () => {
    const shrinkedHtml = await shrinkHtmlForWebAutomation(createPage(DUMMY_HTML));
    const shrinkedHtml2 = await shrinkHtmlForWebAutomation(createPage(shrinkedHtml));
    assert.equal(shrinkedHtml, shrinkedHtml2);
});

test('removes non-whitelisted tags but keeps children', { skip: !depsPresent }, async () => {
    const html = `<div><foo><span>A</span></foo><p>B</p></div>`;
    const out = await shrinkHtmlForWebAutomation(createPage(html));
    assert.match(out, /<span>A<\/span>/);
    assert.match(out, /<p>B<\/p>/);
    assert.doesNotMatch(out, /<foo/);
});

test('preserves data-/aria- attributes', { skip: !depsPresent }, async () => {
    const html = `<div data-id="123" aria-label="pic" onclick="evil()"></div>`;
    const out = await shrinkHtmlForWebAutomation(createPage(html));
    assert.match(out, /data-id="123"/);
    assert.match(out, /aria-label="pic"/);
    assert.doesNotMatch(out, /onclick=/);
});

test('does not collapse whitespace in <textarea>', { skip: !depsPresent }, async () => {
    const html = `<textarea>line 1
    line    2</textarea>`;
    const out = await shrinkHtmlForWebAutomation(createPage(html));
    assert.ok(out.includes('line 1\n    line    2'));
});

test('removes empty elements after pruning', { skip: !depsPresent }, async () => {
    const html = `<div><span></span><span>text</span></div>`;
    const out = await shrinkHtmlForWebAutomation(createPage(html));
    assert.doesNotMatch(out, /<span><\/span>/);
    assert.match(out, /<span>text<\/span>/);
});
