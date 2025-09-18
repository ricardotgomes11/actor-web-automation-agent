import { strict as assert } from 'node:assert';
import test, { mock } from 'node:test';

let clickElement: typeof import('../src/agent_actions.js')['clickElement'];
let agentActionDependencies: typeof import('../src/agent_actions.js')['agentActionDependencies'];
let depsPresent = true;

try {
    ({ clickElement, agentActionDependencies } = await import('../src/agent_actions.js'));
} catch (error) {
    depsPresent = false;
    console.warn('Skipping clickElement fallback tests due to missing dependencies', error);
}

test('clickElement uses fallback text selector for complex labels', { skip: !depsPresent }, async (t) => {
    const tagName = 'button';
    agentActionDependencies.tagAllElementsOnPage = mock.fn(async () => {});
    agentActionDependencies.shrinkHtmlForWebAutomation = mock.fn(async () => '<html></html>');
    agentActionDependencies.closeCookieModals = mock.fn(async () => {});
    agentActionDependencies.maybeShortsTextByTokenLength = mock.fn((text: string) => text);

    const cases = [
        {
            name: 'multi-word label',
            text: 'Submit Form',
        },
        {
            name: 'text containing quotes',
            text: 'He said "Go"',
        },
        {
            name: 'text with punctuation',
            text: 'Save & Continue?',
        },
    ].map(({ name, text }) => ({
        name,
        text,
        expected: `${tagName}::-p-text(${JSON.stringify(text)})`,
    }));

    for (const { name, text, expected } of cases) {
        await t.test(name, async () => {
            const selectors: string[] = [];
            let clickCount = 0;
            const element = {
                click: async () => {
                    clickCount += 1;
                },
            };
            const page = {
                async $(selector: string) {
                    selectors.push(selector);
                    if (selector === expected) {
                        return element as any;
                    }
                    return null;
                },
                evaluate: async (fn: (el: typeof element) => any, el: typeof element) => {
                    await fn(el);
                },
                url: () => 'https://example.com/',
                waitForNavigation: async () => {},
            };

            await clickElement({ page } as any, { text, gid: 0, tagName });

            assert.equal(selectors.length, 1);
            assert.equal(selectors[0], expected);
            assert.ok(!selectors[0].includes(' ::-p-text'));
            assert.equal(clickCount, 2);
        });
    }
});
