import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export function canonicalizeText(input) {
    const withoutBom = input.replace(/^\uFEFF/, '');
    const normalizedLineEndings = withoutBom.replace(/\r\n?/g, '\n');
    const trimmedLines = normalizedLineEndings
        .split('\n')
        .map((line) => line.replace(/\s+$/u, ''));

    const collapsedLines = [];
    let blankCount = 0;
    for (const line of trimmedLines) {
        if (line === '') {
            blankCount += 1;
            if (blankCount > 1) {
                continue;
            }
        } else {
            blankCount = 0;
        }

        collapsedLines.push(line);
    }

    let canonical = collapsedLines.join('\n');
    if (!canonical.endsWith('\n')) {
        canonical += '\n';
    }

    return canonical;
}

async function writeFileEnsuringDir(filePath, content) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
}

async function signWithGpg({ canonicalPath, signaturePath, gpgKey }) {
    const args = ['--armor', '--detach-sign', '--output', signaturePath];
    if (gpgKey) {
        args.push('--local-user', gpgKey);
    }
    args.push(canonicalPath);

    await new Promise((resolve, reject) => {
        const child = spawn('gpg', args, { stdio: 'inherit' });

        child.on('error', (error) => {
            if (error.code === 'ENOENT') {
                reject(new Error('gpg is required to create signatures but was not found in PATH.'));
                return;
            }
            reject(error);
        });

        child.on('exit', (code) => {
            if (code === 0) {
                resolve(undefined);
            } else {
                reject(new Error(`gpg exited with code ${code}`));
            }
        });
    });
}

export async function canonicalizeFile(options) {
    const { inputPath, canonicalPath, shaPath, signaturePath, gpgKey, sign = true } = options;

    const source = await fs.readFile(inputPath, 'utf8');
    const canonical = canonicalizeText(source);
    await writeFileEnsuringDir(canonicalPath, canonical);

    const hash = createHash('sha256').update(canonical, 'utf8').digest('hex');
    const hashLine = `${hash}  ${path.basename(canonicalPath)}\n`;
    await writeFileEnsuringDir(shaPath, hashLine);

    if (sign) {
        await signWithGpg({ canonicalPath, signaturePath, gpgKey });
    }

    return {
        canonicalPath,
        shaPath,
        signaturePath: sign ? signaturePath : undefined,
        hash,
    };
}

function buildDefaultPaths(inputPath) {
    const { dir, name } = path.parse(inputPath);
    const canonicalPath = path.join(dir, `${name}.canonical.txt`);
    return {
        canonicalPath,
        shaPath: `${canonicalPath}.sha256`,
        signaturePath: `${canonicalPath}.asc`,
    };
}

function parseArgs(argv) {
    const args = argv.slice(2);
    if (args.length === 0) {
        throw new Error('Missing input file. Usage: canonicalize <input> [--canonical path] [--sha path] [--signature path] [--gpg-key key-id] [--no-sign]');
    }

    const inputPath = args[0];
    const defaults = buildDefaultPaths(inputPath);

    const options = {
        inputPath,
        canonicalPath: defaults.canonicalPath,
        shaPath: defaults.shaPath,
        signaturePath: defaults.signaturePath,
        sign: true,
        gpgKey: undefined,
    };

    for (let i = 1; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === '--canonical') {
            i += 1;
            if (i >= args.length) throw new Error('--canonical requires a value');
            options.canonicalPath = args[i];
        } else if (arg === '--sha') {
            i += 1;
            if (i >= args.length) throw new Error('--sha requires a value');
            options.shaPath = args[i];
        } else if (arg === '--signature') {
            i += 1;
            if (i >= args.length) throw new Error('--signature requires a value');
            options.signaturePath = args[i];
        } else if (arg === '--gpg-key') {
            i += 1;
            if (i >= args.length) throw new Error('--gpg-key requires a value');
            options.gpgKey = args[i];
        } else if (arg === '--no-sign') {
            options.sign = false;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    if (options.sign && !options.signaturePath) {
        throw new Error('Signature path must be provided when signing is enabled.');
    }

    return options;
}

async function runCli() {
    try {
        const { inputPath, canonicalPath, shaPath, signaturePath, sign, gpgKey } = parseArgs(process.argv);
        const result = await canonicalizeFile({
            inputPath,
            canonicalPath,
            shaPath,
            signaturePath,
            sign,
            gpgKey,
        });

        process.stdout.write(`Canonical file written to ${result.canonicalPath}\n`);
        process.stdout.write(`SHA-256 written to ${result.shaPath}\n`);
        if (result.signaturePath) {
            process.stdout.write(`Signature written to ${result.signaturePath}\n`);
        } else {
            process.stdout.write('Signature skipped.\n');
        }
    } catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    }
}

const isMainModule = (() => {
    try {
        return fileURLToPath(import.meta.url) === fileURLToPath(process.argv[1]);
    } catch {
        return false;
    }
})();

if (isMainModule) {
    runCli();
}
