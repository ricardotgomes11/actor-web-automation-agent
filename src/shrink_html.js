import cheerio from 'cheerio';
import { WHITELIST_ATTRIBUTES_WEB_AUTOMATION, WHITELIST_TAGS_WEB_AUTOMATION } from './consts.js';

/**
 * Tag each element in the HTML with a unique attribute.
 * @param {import('puppeteer').Page} page
 * @param {string} attributeName
 */
export async function tagAllElementsOnPage(page, attributeName) {
    return page.$$eval('html *', (elements, attrName) => {
        for (let i = 1; i < elements.length; i++) {
            if (!elements[i].getAttribute(attrName)) elements[i].setAttribute(attrName, `${i}`);
        }
    }, attributeName);
}

/**
 * Remove all elements that are not whitelisted.
 * @param {import('puppeteer').Page} page
 * @param {{whiteListTags: string[], whiteListAttributes: string[]}} options
 */
export async function shrinkHtml(page, options) {
    const { whiteListTags, whiteListAttributes } = options;
    const html = await page.content();
    const $ = cheerio.load(html);
    const allElements = $('html *');
    // TODO: Remove empty elements
    for (const element of allElements.toArray().reverse()) {
        const $element = $(element);
        const tag = $element.prop('tagName').toLocaleLowerCase();
        if (whiteListTags.includes(tag)) {
            const attributes = element.attribs;
            Object.keys(attributes).forEach((attr) => {
                if (!whiteListAttributes.includes(attr)) delete attributes[attr];
            });
            element.attribs = attributes;
        } else {
            $element.before($element.children());
            $element.remove();
        }
    }
    return $.html()
        .replace(/\s{2,}/g, ' ')
        .replace(/>\s+</g, '><');
}

export async function shrinkHtmlForWebAutomation(page) {
    return shrinkHtml(page, {
        whiteListTags: WHITELIST_TAGS_WEB_AUTOMATION,
        whiteListAttributes: WHITELIST_ATTRIBUTES_WEB_AUTOMATION,
    });
}
