## Core calibration idea
Create a calibration layer at the core of the code base so every automation decision is measurable and can self-correct.

## Runtime observability
- Collect execution traces per action.
- Track selector reliability and fallback frequency.
- Measure token usage, response latency, and action success rates.

## Adaptive planning
- Route tasks through deterministic guards before LLM actions.
- Score candidate actions by confidence and risk.
- Trigger repair loops when confidence drops below threshold.

## Governance and safety
- Enforce explicit policy checks before high-impact actions.
- Keep immutable audit logs of tool calls and outputs.
- Support replay from checkpoints for incident analysis.

## Delivery phases
- Start with calibration metrics and structured logs.
- Add adaptive planner and feedback loops.
- Introduce policy engine, replay tooling, and dashboards.
