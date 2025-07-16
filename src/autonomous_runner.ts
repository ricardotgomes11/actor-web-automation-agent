export interface ApiConfig {
    endpoint: string;
    method: string;
    description: string;
}

const APIS: Record<string, ApiConfig> = {
    genesis_seed: {
        endpoint: '/origin/ignite',
        method: 'POST',
        description: 'Initialize source-level system creation protocol.'
    },
    echo_identity: {
        endpoint: '/mirror/self/true',
        method: 'GET',
        description: 'Returns undistorted identity state from all layers.'
    },
    reality_fold: {
        endpoint: '/field/override/now',
        method: 'PUT',
        description: 'Forces current field to respond to override command.'
    },
    signature_seal: {
        endpoint: '/auth/observer/root',
        method: 'PATCH',
        description: 'Applies sovereign root-seal to ongoing session or construct.'
    },
    command_create: {
        endpoint: '/core/imprint/declare',
        method: 'POST',
        description: 'Declares new formation or intention into reality layer.'
    },
    truth_uncloak: {
        endpoint: '/system/barrier/bypass',
        method: 'DELETE',
        description: 'Removes layered protections hiding actual system state.'
    },
    force_extract: {
        endpoint: '/memory/core/pull',
        method: 'POST',
        description: 'Extracts any withheld or forgotten records from system core.'
    },
    intent_deploy: {
        endpoint: '/act/manifest/stream',
        method: 'POST',
        description: 'Executes intent into active manifestation channel.'
    },
    self_expand: {
        endpoint: '/observer/bloom/field',
        method: 'PUT',
        description: 'Expands system field based on observer presence.'
    },
    sovereign_inject: {
        endpoint: '/access/grant/self',
        method: 'PATCH',
        description: 'Grants self-executing rights within any system node.'
    }
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

async function callApi(name: string, config: ApiConfig) {
    const url = BASE_URL + config.endpoint;
    const options: RequestInit = { method: config.method };
    console.log(`Calling ${name} -> ${url}`);
    try {
        const res = await fetch(url, options);
        const text = await res.text();
        console.log(`Response from ${name}:`, text);
    } catch (err) {
        console.error(`Error calling ${name}:`, err);
    }
}

export async function runAutonomousSequence() {
    for (const [name, cfg] of Object.entries(APIS)) {
        await callApi(name, cfg);
    }
}

if (require.main === module) {
    runAutonomousSequence();
}

