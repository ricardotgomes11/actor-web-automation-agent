import {Page} from "puppeteer";
import { describe, expect, test } from '@jest/globals';
import { shrinkHtmlForWebAutomation, shrinkHtml, tagAllElementsOnPage } from '../src/shrink_html.js';

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

    test('shrinkHtml removes empty elements', async () => {
        const html = '<html><body><div></div><p>text</p></body></html>';
        const result = await shrinkHtml(createPage(html), {
            whiteListTags: ['html', 'body', 'div', 'p'],
            whiteListAttributes: [],
        });
        expect(result.includes('<div></div>')).toBe(false);
    });

    test('shrinkHtml truncates long text nodes', async () => {
        const html = '<html><body><p>1234567890</p></body></html>';
        const result = await shrinkHtml(createPage(html), {
            whiteListTags: ['html', 'body', 'p'],
            whiteListAttributes: [],
            maxElementTextLength: 5,
        });
        expect(result).toContain('<p>12345</p>');
    });

    test('tagAllElementsOnPage assigns sequential gids', async () => {
        const mockElements = [
            { getAttribute: jest.fn().mockReturnValue(null), setAttribute: jest.fn() },
            { getAttribute: jest.fn().mockReturnValue(null), setAttribute: jest.fn() },
            { getAttribute: jest.fn().mockReturnValue('existing'), setAttribute: jest.fn() },
        ];
        const page = {
            $$eval: (_sel: string, fn: any, attr: string) => fn(mockElements as any, attr),
        } as unknown as Page;
        await tagAllElementsOnPage(page, 'gid');
        expect(mockElements[1].setAttribute).toHaveBeenCalledWith('gid', '1');
        expect(mockElements[2].setAttribute).not.toHaveBeenCalled();
    });
});
