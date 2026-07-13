# Changelog

All notable changes to the `actor-web-automation-agent` project will be documented in this file.

## [Unreleased] - 2026-07-13

### Added
- **Natural Language Parsing Engine** (`src/directive_parser.ts`): Implemented a semantic parser that ingests conversational prompts and outputs strict 4-step execution payloads (Navigate, Select Source, Trigger Action, Confirm).
- **Autonomous Executor** (`src/autonomous_executor.ts`): Built the physical driver that consumes the parsed JSON directives and physically executes the browser automation sequences using Puppeteer.
- **Acoustic Market Sweep** (`src/acoustic_market_sweep.ts`): Added a headless data extraction subroutine designed to pull live financial coordinates and generate cryptographic validation payloads to the `.reality_ledger`.
- **Reality Ledger** (`.reality_ledger`): Implemented an immutable, local JSON logging system to act as a forensic trail for all autonomous execution events and state alignments.

### Changed
- **Deployment Pipeline**: Rewrote the root `Dockerfile` to natively support the TypeScript environment. The container now correctly compiles `src` via `tsc` into `dist/main.js` and launches the Express server, permanently bypassing the legacy `server.js` crash.
- **Hosting Target**: Shifted the deployment matrix from the inactive `sovzero` project to the fully active `quantum01` Google Cloud Run cluster, successfully exposing the agent on a public HTTPS port (8080).

### Fixed
- Resolved the severe Chromium initialization timeouts within the Cloud Run sandbox by upgrading the dependency layer (`libxss1`, `procps`) and refining the headless launch flags in the executor scripts.
- Resolved module resolution errors (`ERR_MODULE_NOT_FOUND`) during local `ts-node-esm` test transmissions by aligning TypeScript imports.
