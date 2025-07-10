import { ProxyConfigurationOptions } from '@crawlee/core';
/**
 * Input schema in TypeScript format.
 */
export interface Input {
    startUrl: string;
    instructions: string;
    proxyConfiguration?: ProxyConfigurationOptions;
    openaiApiKey?: string; // We can pass openaiApiKey as env variable locally
    model?: string;
    /** When enabled the agent reruns in a simple self adapting loop. */
    julesSelfMode?: boolean;
    /** Number of iterations for the self mode. */
    julesIterations?: number;
}
