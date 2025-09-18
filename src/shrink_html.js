import cheerio from 'cheerio';
import {
    WHITELIST_ATTRIBUTES_WEB_AUTOMATION,
    WHITELIST_TAGS_WEB_AUTOMATION,
} from './consts.js';

/**
 * Tag each element in the HTML with a unique attribute.
 * @param {import('puppeteer').Page} page
 * @param {string} attributeName
 */
export async function tagAllElementsOnPage(page, attributeName) {
    return page.$$eval(
        'html *',
        (elements, attrName) => {
            for (let i = 1; i < elements.length; i++) {
                const el = elements[i];
                if (!el.getAttribute(attrName)) el.setAttribute(attrName, String(i));
            }
        },
        attributeName,
    );
}

/**
 * Remove all elements that are not whitelisted.
 * @param {import('puppeteer').Page} page
 * @param {{whiteListTags: string[], whiteListAttributes: string[]}} options
 */
export async function shrinkHtml(page, options) {
    const {
        whiteListTags,
        whiteListAttributes,
        attributePrefixes = ['data-', 'aria-'],
        keepTextOnly = false,
        skipSelectors = ['.no-shrink'],
        preserveWhitespaceIn = ['pre', 'code', 'textarea'],
        removeEmpty = true,
        normalizeWhitespace = true,
    } = options;

    const html = await page.content();
    const $ = cheerio.load(html);

    // Fast lookups
    const tagAllow = new Set(whiteListTags.map((t) => t.toLowerCase()));
    const attrAllow = new Set(whiteListAttributes.map((a) => a.toLowerCase()));

    // Skip islands we should not touch
    const skipNodes = new Set();
    for (const sel of skipSelectors) {
        $(sel).each((_, el) => {
            skipNodes.add(el);
            $(el)
                .find('*')
                .each((__, child) => skipNodes.add(child));
        });
    }

    // Reverse traversal so children go first
    const allElements = $('html *').toArray().reverse();
    for (const el of allElements) {
        if (skipNodes.has(el)) continue;
        const $el = $(el);
        const tag = ($el.prop('tagName') || '').toLowerCase();

        if (tagAllow.has(tag)) {
            // filter attributes by allowlist / prefixes
            const attribs = el.attribs || {};
            for (const name of Object.keys(attribs)) {
                const lower = name.toLowerCase();
                const hasPrefix = attributePrefixes.some((p) => lower.startsWith(p));
                if (!attrAllow.has(lower) && !hasPrefix) {
                    $el.removeAttr(name);
                }
            }
            continue;
        }

        // Not allowed: either lift children or keep text only
        if (keepTextOnly) {
            const text = $el.text();
            $el.replaceWith(text);
        } else {
            $el.before($el.contents());
            $el.remove();
        }
    }

    // Optional: remove empty elements (no children, no attrs, no text)
    if (removeEmpty) {
        $('html *').each((_, node) => {
            if (skipNodes.has(node)) return;
            const $n = $(node);
            const hasAttrs = Object.keys(node.attribs || {}).length > 0;
            const hasChildren = $n.children().length > 0;
            const hasText = $n.text().trim().length > 0;
            if (!hasAttrs && !hasChildren && !hasText) $n.remove();
        });
    }

    let out = $.html();

    // Whitespace normalization (but NOT inside preserved tags)
    if (normalizeWhitespace) {
        const placeholders = [];
        out = out.replace(
            new RegExp(`<(${preserveWhitespaceIn.join('|')})(\\b[^>]*)>([\\s\\S]*?)<\\/\\1>`, 'gi'),
            (_m, tagName, attrs, inner) => {
                const idx = placeholders.push(inner) - 1;
                return `<${tagName}${attrs}>__PRESERVE_${idx}__</${tagName}>`;
            },
        );
        out = out.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ');
        out = out.replace(/__PRESERVE_(\d+)__/g, (_m, i) => placeholders[Number(i)]);
    }

    return out;
}

export async function shrinkHtmlForWebAutomation(page) {
    return shrinkHtml(page, {
        whiteListTags: WHITELIST_TAGS_WEB_AUTOMATION,
        whiteListAttributes: WHITELIST_ATTRIBUTES_WEB_AUTOMATION,
        attributePrefixes: ['data-', 'aria-'],
        keepTextOnly: false,
        skipSelectors: ['.no-shrink'],
        preserveWhitespaceIn: ['pre', 'code', 'textarea'],
        removeEmpty: true,
        normalizeWhitespace: true,
    });
}
