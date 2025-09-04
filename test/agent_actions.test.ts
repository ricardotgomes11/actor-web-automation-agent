import { describe, expect, test, jest } from '@jest/globals';
import type { Page } from 'puppeteer';
import { clickElement, fillForm } from '../src/agent_actions.js';

jest.mock('crawlee', () => ({ utils: { puppeteer: { closeCookieModals: jest.fn() } } }));
jest.mock('../src/shrink_html.js', () => ({
    shrinkHtmlForWebAutomation: (jest.fn() as any).mockResolvedValue('<html></html>'),
    tagAllElementsOnPage: jest.fn(),
}));

describe('agent actions', () => {
    test('clickElement throws detailed error when element missing', async () => {
        const page: any = {
            $: (jest.fn() as any).mockResolvedValue(null),
            $x: (jest.fn() as any).mockResolvedValue([]),
            url: () => 'http://example.com',
        };
        await expect(clickElement({ page }, { text: 'Link', gid: 1, tagName: 'a' })).rejects.toThrow('Element not found');
        expect(page.$).toHaveBeenCalledTimes(2);
        expect(page.$x).toHaveBeenCalledTimes(1);
    });

    test('fillForm presses Enter when submit button missing', async () => {
        const page: any = {
            $: (jest.fn() as any).mockResolvedValue(null),
            keyboard: { press: jest.fn() },
            waitForNavigation: (jest.fn() as any).mockResolvedValue(undefined),
            url: () => 'http://example.com',
        };
        await fillForm({ page }, { formData: [{ gid: 1, value: 'value' }] });
        expect(page.keyboard.press).toHaveBeenCalledWith('Enter');
    });
});
