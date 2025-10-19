import { Page } from 'puppeteer';
import { describe, expect, test } from '@jest/globals';
import cheerio from 'cheerio';
import { shrinkHtmlForWebAutomation, tagAllElementsOnPage } from '../src/shrink_html.js';

const createPage = (html: string) => {
    return {
        async content() {
            return html
        }
    } as Page
}

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
</html>`

describe('shrink HTML', () => {
    test('shrinkHtmlForWebAutomation can be run twice', async () => {
        const shrinkedHtml = await shrinkHtmlForWebAutomation(createPage(DUMMY_HTML));
        const shrinkedHtml2 = await shrinkHtmlForWebAutomation(createPage(shrinkedHtml));
        expect(shrinkedHtml).toEqual(shrinkedHtml2);
    });

    test('removes non-whitelisted tags but preserves text content and allowed attributes', async () => {
        const html = `<!DOCTYPE html>
<html>
  <body>
    <div data-ignore="1">
      <span gid="42" class="highlight">Keep <em>me</em></span>
      <script>console.log('remove me');</script>
      <a href="/path" data-tracking="id">Link <strong>text</strong></a>
    </div>
  </body>
</html>`;

        const shrinkedHtml = await shrinkHtmlForWebAutomation(createPage(html));
        const $ = cheerio.load(shrinkedHtml);

        expect($('script').length).toBe(0);
        expect($('strong').length).toBe(0);
        expect($('em').length).toBe(0);

        const span = $('span').first();
        expect(span.attr('gid')).toBe('42');
        expect(span.attr('class')).toBeUndefined();
        expect(span.text()).toBe('Keep me');

        const link = $('a').first();
        expect(link.attr('href')).toBe('/path');
        expect(link.attr('data-tracking')).toBeUndefined();
        expect(link.text()).toBe('Link text');

        const div = $('div').first();
        expect(div.attr('data-ignore')).toBeUndefined();
    });
});
