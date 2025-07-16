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
