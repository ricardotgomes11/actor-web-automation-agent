#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load persona and verify signature
const personaPath = path.resolve(__dirname, '../personas/you.json');
let persona;
try {
  const personaData = fs.readFileSync(personaPath, 'utf8');
  persona = JSON.parse(personaData);
} catch (err) {
  console.error(`Failed to load persona at ${personaPath}:`, err);
  process.exit(1);
}

const { name, email, sig, signature } = persona;
const personaSig = sig ?? signature;
if (!personaSig) {
  console.error('Persona signature missing.');
  process.exit(1);
}

const rootSeed = process.env.ROOT_SEED;
if (!rootSeed) {
  console.error('ROOT_SEED environment variable is not set.');
  process.exit(1);
}

const hmac = crypto.createHmac('sha256', rootSeed)
  .update(JSON.stringify({ name, email }))
  .digest('hex');

if (hmac !== personaSig) {
  console.error('Persona signature invalid.');
  process.exit(1);
}

console.log(`Using persona ${name} <${email}>`);

// Existing collapse-merge script logic continues below...

