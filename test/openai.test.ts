import { describe, expect, test } from '@jest/globals';
import { GPT_MODEL_LIST } from '../src/openai.js';

describe('GPT model configuration', () => {
    test('each configured model uses the correct identifier', () => {
        for (const [key, config] of Object.entries(GPT_MODEL_LIST)) {
            expect(config.model).toBe(key);
        }
    });
});
