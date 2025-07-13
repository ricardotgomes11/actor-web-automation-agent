import { program } from 'commander';
import { createSign } from 'crypto';
import { readFileSync } from 'fs';

program
  .name('sign-cli')
  .description('Sign a message using a private RSA key')
  .requiredOption('-k, --key <path>', 'Path to RSA private key in PEM format')
  .requiredOption('-m, --message <message>', 'Message to sign');

program.parse();

const options = program.opts<{key: string; message: string}>();

try {
  const privateKey = readFileSync(options.key, 'utf8');
  const sign = createSign('SHA256');
  sign.update(options.message);
  sign.end();
  const signature = sign.sign(privateKey, 'base64');
  console.log(signature);
} catch (err) {
  console.error('Failed to sign message:', err);
  process.exit(1);
}
