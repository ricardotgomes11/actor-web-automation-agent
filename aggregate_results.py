#!/usr/bin/env python3
"""Aggregate metrics produced by containers.

This script scans provided container result directories for a
``metrics.json`` file produced by :class:`SandboxMetrics` and
merges the collected metrics into a single JSON report printed to
stdout.
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, Optional


def _load_metrics(path: Path) -> Optional[Dict[str, Any]]:
    try:
        with path.open(encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        return {"error": f"invalid json in {path}"}


def main() -> None:
    report: Dict[str, Any] = {"containers": {}}
    for dir_arg in sys.argv[1:]:
        container = Path(dir_arg)
        metrics = _load_metrics(container / "metrics.json")
        if metrics is not None:
            report["containers"][container.name] = metrics
    json.dump(report, sys.stdout, indent=2)


if __name__ == "__main__":
    main()
