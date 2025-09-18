# Audit Ledger Template

Use this template to implement an append-only, tamper-evident ledger for runtime self-modification events.
Each entry should be serialized as JSON Lines (one JSON object per line). Chain integrity by hashing each
entry together with the previous entry hash.

## JSON Line Structure
```json
{
  "entry_id": "UUID",
  "timestamp": "2025-01-15T00:00:00Z",
  "proposal_id": "change-request-123",
  "actor": {
    "id": "agent-42",
    "type": "automated" | "human",
    "signature": "BASE64_SIGNATURE"
  },
  "change_summary": "Update email classification model weights",
  "risk_class": "medium",
  "verification_attest_id": "attest-789",
  "governance_decision": {
    "status": "approved" | "rejected" | "rolled_back",
    "approvers": ["governance-chair", "compliance-officer"],
    "notes": "Approved after additional adversarial testing"
  },
  "promotion_stage": "sandbox" | "canary" | "staged" | "production",
  "previous_hash": "sha3-512:HASH_OF_PREVIOUS_ENTRY",
  "entry_hash": "sha3-512:CURRENT_ENTRY_HASH",
  "artifacts": [
    {
      "type": "model",
      "uri": "s3://artifacts/models/email-classifier/v5",
      "hash": "sha256:MODEL_HASH",
      "signature": "BASE64_SIGNATURE"
    }
  ]
}
```

## Operational Guidance
- Store ledger files in WORM (write once, read many) storage, replicated to offsite backup.
- Rotate ledger files based on size or time, ensuring hash continuity between files.
- Provide read APIs for auditors; write access is restricted to the orchestrator service.
- Periodically reconcile ledger entries with monitoring data to detect orphaned promotions.
