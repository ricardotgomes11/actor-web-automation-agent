# Canonicalization and Proof-of-Execution Artifacts

This project now includes a lightweight utility that transforms arbitrary text into a deterministic, canonical representation, computes a SHA-256 digest, and optionally emits a GPG detached signature. These artifacts can then be appended to the ledger workflow described in the Codex mission skeleton.

## Canonicalization rules

The `canonicalize` utility enforces the following rules:

1. Byte Order Marks (BOM) are stripped from the beginning of the file.
2. Windows (`CRLF`) and classic Mac (`CR`) line endings are normalized to Unix (`LF`).
3. Trailing whitespace on each line is removed.
4. Multiple consecutive blank lines are collapsed to a single blank line.
5. The canonical form always ends with a single trailing newline.

These heuristics intentionally preserve paragraph separation while eliminating incidental formatting differences that would otherwise produce divergent hashes.

## Usage

```bash
npm run canonicalize -- path/to/input.txt
```

By default this creates three sibling files next to the input:

- `input.canonical.txt` – normalized content
- `input.canonical.txt.sha256` – SHA-256 digest in the format `<hash>  <filename>`
- `input.canonical.txt.asc` – ASCII-armored detached signature (requires `gpg` and a configured default key)

### Optional flags

- `--canonical <path>`: override the canonical output file path
- `--sha <path>`: override the SHA file path
- `--signature <path>`: override the signature file path
- `--gpg-key <key-id>`: select a specific GPG key for signing
- `--no-sign`: skip the signing step entirely

Example producing artifacts in a custom directory and skipping signatures:

```bash
npm run canonicalize -- ./notes/draft.txt --canonical ./artifacts/draft.canonical.txt --sha ./artifacts/draft.sha --no-sign
```

## Integrating with the ledger workflow

The GitHub Actions workflow from the mission skeleton can invoke this utility after deployment to normalize the Proof-of-Execution payload before committing it to `ledger/LEGAL_MASTER_LOG.txt`. A typical pattern is:

1. Generate your ledger entry (e.g., JSON containing deployment metadata).
2. Write the entry to a temporary file.
3. Run the canonicalizer to produce `canonical.txt`, `canonical.txt.sha256`, and `canonical.txt.asc`.
4. Append the canonical text to the ledger and stash the accompanying `.sha256` and `.asc` artifacts for auditing.

This approach keeps ledger entries reproducible while providing a cryptographic audit trail you can anchor to your preferred transparency layer (signed git tags, IPFS, blockchain anchoring, etc.).
