# Audit log format

Audit events are stored as JSON Lines (JSONL). Each line represents a single event with the following fields:

- `email` – email address of the actor generating the event.
- `action` – description of the action performed.
- `timestamp` – ISO 8601 timestamp indicating when the action occurred.
- `hard_deleted` – boolean flag showing whether the record was permanently removed.

## Example

```json
{"email": "user@example.com", "action": "account_deleted", "timestamp": "2024-04-01T12:00:00Z", "hard_deleted": true}
```

Future audit logs should follow this structure to be ingested successfully.
