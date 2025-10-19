import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const deploymentRoot = join(projectRoot, 'deployment');
const bundleDir = join(deploymentRoot, 'bundle');

function run(command) {
    execSync(command, { stdio: 'inherit', cwd: projectRoot });
}

if (existsSync(deploymentRoot)) {
    rmSync(deploymentRoot, { recursive: true, force: true });
}

mkdirSync(bundleDir, { recursive: true });

console.log('Building project...');
run('npm run build');

const entriesToCopy = [
    'dist',
    '.actor',
    'package.json',
    'package-lock.json',
    'README.md',
];

for (const entry of entriesToCopy) {
    const sourcePath = join(projectRoot, entry);
    const targetPath = join(bundleDir, entry);
    if (existsSync(sourcePath)) {
        cpSync(sourcePath, targetPath, { recursive: true });
    }
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const archiveName = `web-automation-agent-${timestamp}.tar.gz`;
const archivePath = join(deploymentRoot, archiveName);

console.log(`Creating archive ${archiveName}...`);
run(`tar -czf ${archivePath} -C ${bundleDir} .`);

rmSync(bundleDir, { recursive: true, force: true });

console.log('Deployment package created successfully.');
console.log(`Location: ${archivePath}`);
console.log('Upload the archive to Apify with: npx apify@latest push');
