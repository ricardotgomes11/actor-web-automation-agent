# Verifier Checklist

Use this checklist to evaluate every proposed change before it leaves the sandbox. All items must be satisfied
unless explicitly waived by governance (document waiver ID in the ledger).

## Functional Tests
- [ ] Unit tests covering modified modules passed.
- [ ] Integration/regression suite against critical user journeys passed.
- [ ] Contract tests with external adapters (mocked) passed.

## Safety & Invariant Checks
- [ ] Anchor State invariants evaluated via automated monitor (no violations).
- [ ] Authorization and authentication flows formally verified or model-checked.
- [ ] Idempotency and rate-limit guards validated under stress scenarios.

## Statistical & ML Validation (if applicable)
- [ ] Training vs production distribution drift quantified; drift < Anchor thresholds.
- [ ] Performance metrics (accuracy, precision/recall, calibration) meet or exceed Anchor baselines.
- [ ] Adversarial/fuzz testing executed with no critical findings.

## Security & Privacy
- [ ] Static analysis and dependency vulnerability scan clean.
- [ ] Secrets scanning ensures no credentials embedded in artifacts.
- [ ] Data minimization review confirms no new PII exposure pathways.

## Operational Readiness
- [ ] Monitoring dashboards and alerts updated for new signals.
- [ ] Rollback plan verified with automated rehearsal or simulation.
- [ ] Documentation updated (runbooks, playbooks, user-facing help as needed).

## Evidence Packaging
- [ ] Verification attestation file generated with artifact hashes.
- [ ] Logs, metrics, and traces stored in immutable storage with retention policy.
- [ ] Checklist signed digitally by verifier and attached to audit ledger entry.
