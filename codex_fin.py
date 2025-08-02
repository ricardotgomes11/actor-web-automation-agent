"""CodexFin: Demo financial automation with a Plaid-like API.

This module shows how a codex can analyze financial patterns and suggest
simple automation actions. It uses a mock bank API for demonstration
purposes and can be run directly as a script.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Dict, Any, Set


@dataclass
class MockBankAPI:
    """A fake bank API used for local testing."""

    def exchange_token(self, auth_token: str) -> str:
        return f"mock_access_token_{auth_token}"

    def get_transactions(self, access_token: str) -> List[Dict[str, Any]]:
        return [
            {"name": "Salary", "amount": 3000, "type": "credit"},
            {"name": "Rent", "amount": 1000, "type": "debit"},
            {"name": "Netflix", "amount": 15, "type": "debit"},
            {"name": "Groceries", "amount": 300, "type": "debit"},
            {"name": "Spotify", "amount": 10, "type": "debit"},
        ]


@dataclass
class CodexFin:
    """Analyze transactions and suggest automation actions."""

    user_id: str
    bank_api: MockBankAPI
    patterns: Dict[str, Any] = field(default_factory=dict)
    codex_actions: List[str] = field(default_factory=list)
    save_percentage: float = 0.10
    subscription_keywords: Set[str] = field(default_factory=lambda: {"netflix", "spotify"})

    access_token: str = ""

    def connect_account(self, auth_token: str) -> str:
        """Exchange a temporary token for an access token."""
        self.access_token = self.bank_api.exchange_token(auth_token)
        return self.access_token

    def fetch_transactions(self) -> List[Dict[str, Any]]:
        """Retrieve recent transactions."""
        return self.bank_api.get_transactions(self.access_token)

    def analyze_patterns(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate income, expenses and detect recurring subscriptions."""
        income = sum(t["amount"] for t in transactions if t["type"] == "credit")
        expenses = sum(t["amount"] for t in transactions if t["type"] == "debit")
        recurring = [
            t for t in transactions if t["name"].lower() in self.subscription_keywords
        ]
        self.patterns = {
            "total_income": income,
            "total_expenses": expenses,
            "subscriptions": recurring,
        }
        return self.patterns

    def deploy_codex(self) -> List[str]:
        """Suggest actions based on detected patterns."""
        if self.patterns.get("total_income", 0) > 0:
            amount = self.patterns["total_income"] * self.save_percentage
            self.codex_actions.append(f"Deploy: Auto-save {amount:.2f}")
        if self.patterns.get("subscriptions"):
            self.codex_actions.append("Flag: Review recurring subscriptions")
        return self.codex_actions


if __name__ == "__main__":
    api = MockBankAPI()
    codex = CodexFin(user_id="user_123", bank_api=api)
    codex.connect_account("temporary_user_token")
    txns = codex.fetch_transactions()
    patterns = codex.analyze_patterns(txns)
    actions = codex.deploy_codex()
    print("Patterns Detected:", patterns)
    print("Codex Actions:", actions)
