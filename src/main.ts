import { runWidowProtocol, ExternalConnectivityRuntimeConfig } from './widow_protocol.js';

export function resolveExternalConnectivityConfig(
    env: NodeJS.ProcessEnv = process.env,
): ExternalConnectivityRuntimeConfig {
    return {
        externalConnectivityEnabled: env.EXTERNAL_CONNECTIVITY !== 'disabled',
        externalGatewayUrl: env.EXTERNAL_GATEWAY_URL || env.OPENAI_API_BASE || undefined,
        mcpTransportUrl: env.MCP_TRANSPORT_URL || undefined,
        runtimeApiKey: env.MODEL_PROVIDER_API_KEY || env.OPENAI_API_KEY || undefined,
        provenanceLoggingEnabled: env.PROVENANCE_LOGGING !== 'disabled',
    };
}

if (process.env.NODE_ENV !== 'test') {
    (async () => {
        await runWidowProtocol(resolveExternalConnectivityConfig());
    })();
}
