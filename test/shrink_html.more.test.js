import { strict as assert } from 'node:assert';
import test from 'node:test';

let shrinkHtml;
let depsPresent = true;
try {
    ({ shrinkHtml } = await import('../src/shrink_html.js'));
} catch {
    depsPresent = false;
}

const page = (s) => ({ async content() { return s; } });

test('skipSelectors leaves islands untouched', { skip: !depsPresent }, async () => {
    const html = `<div class="no-shrink"><script>alert(1)</script></div>`;
    const out = await shrinkHtml(page(html), {
        whiteListTags: ['div'],
        whiteListAttributes: [],
        skipSelectors: ['.no-shrink'],
        removeEmpty: false,
    });
    assert.match(out, /<script>alert\(1\)<\/script>/);
});

