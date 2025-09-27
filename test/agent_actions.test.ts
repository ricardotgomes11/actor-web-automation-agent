import { describe, expect, test } from '@jest/globals';
import { goToUrl, clickElement, fillForm } from '../src/agent_actions.js';
import { HTML_CURRENT_PAGE_PREFIX, UNIQUE_ID_ATTRIBUTE } from '../src/consts.js';

jest.mock('../src/shrink_html.js', () => ({
    tagAllElementsOnPage: jest.fn(),
    shrinkHtmlForWebAutomation: jest.fn(async () => '<html/>'),
}));

jest.mock('../src/tokens.js', () => ({
    maybeShortsTextByTokenLength: jest.fn((t: string) => t),
}));

jest.mock('crawlee', () => ({
    utils: { puppeteer: { closeCookieModals: jest.fn() } },
}));

const { tagAllElementsOnPage } = require('../src/shrink_html.js');
const { maybeShortsTextByTokenLength } = require('../src/tokens.js');
const { utils } = require('crawlee');

const createPage = () => ({
    goto: jest.fn(),
    waitForNavigation: jest.fn(),
    url: jest.fn(() => 'http://example.com'),
    evaluate: jest.fn(),
    keyboard: { press: jest.fn() },
    $: jest.fn(),
});

describe('agent actions', () => {
    test('goToUrl navigates and returns page HTML', async () => {
        const page = createPage();
        const result = await goToUrl({ page }, { url: 'http://example.com' });
        expect(page.goto).toHaveBeenCalledWith('http://example.com');
        expect(tagAllElementsOnPage).toHaveBeenCalledWith(page, UNIQUE_ID_ATTRIBUTE);
        expect(result).toBe(`Previous action was: go_to_url, ${HTML_CURRENT_PAGE_PREFIX} <html/>`);
    });

    test('clickElement clicks by gid', async () => {
        const element = { click: jest.fn() };
        const page = createPage();
        page.$ = jest.fn((selector: string) => selector === 'a[gid="1"]' ? element : null);
        const result = await clickElement({ page }, { text: 'Link', gid: 1, tagName: 'a' });
        expect(page.$).toHaveBeenCalledWith('a[gid="1"]');
        expect(element.click).toHaveBeenCalled();
        expect(result).toBe(`Previous action was: click_element, ${HTML_CURRENT_PAGE_PREFIX} <html/>`);
    });

    test('clickElement throws when element missing', async () => {
        const page = createPage();
        await expect(clickElement({ page }, { text: 'Missing', gid: 2, tagName: 'a' })).rejects.toThrow('Element not found');
        expect(utils.puppeteer.closeCookieModals).not.toHaveBeenCalled();
    });

    test('fillForm fills inputs and submits', async () => {
        const input = { type: jest.fn() };
        const button = { click: jest.fn() };
        const page = createPage();
        page.$ = jest.fn((selector: string) => {
            if (selector === `[${UNIQUE_ID_ATTRIBUTE}="1"]`) return input;
            if (selector === 'button[type="submit"]') return button;
            return null;
        });
        const formData = [{ gid: 1, value: ' test ' }];
        const result = await fillForm({ page }, { formData });
        expect(input.type).toHaveBeenCalledWith('test');
        expect(button.click).toHaveBeenCalled();
        expect(result).toBe(`Previous action was: fill_form_and_submit, ${HTML_CURRENT_PAGE_PREFIX} <html/>`);
    });
});
