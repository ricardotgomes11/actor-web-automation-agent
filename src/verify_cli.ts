import { program } from 'commander';
import { createVerify } from 'crypto';
import { readFileSync } from 'fs';

program
  .name('verify-cli')
  .description('Verify a signature using a public RSA key')
  .requiredOption('-k, --key <path>', 'Path to RSA public key in PEM format')
  .requiredOption('-m, --message <message>', 'Message that was signed')
  .requiredOption('-s, --signature <signature>', 'Base64 signature to verify');

program.parse();

const options = program.opts<{ key: string; message: string; signature: string }>();

try {
  const publicKey = readFileSync(options.key, 'utf8');
  const verify = createVerify('SHA256');
  verify.update(options.message);
  verify.end();
  const valid = verify.verify(publicKey, options.signature, 'base64');
  if (valid) {
    console.log('Signature is valid');
  } else {
    console.error('Signature is invalid');
    process.exit(1);
  }
} catch (err) {
  console.error('Failed to verify signature:', err);
  process.exit(1);
}
