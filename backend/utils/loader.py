import json
import os
from typing import Any

BASE = os.path.join(os.path.dirname(__file__), "..", "data")

APPS_PATH     = os.path.join(BASE, "applications.json")
MANDALS_PATH  = os.path.join(BASE, "mandals.json")
SAHAYAKS_PATH = os.path.join(BASE, "sahayaks.json")


# ── Applications ──────────────────────────────────────────────────────────────

def load_applications() -> list[dict]:
    with open(APPS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_applications(data: list[dict]) -> None:
    with open(APPS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def find_by_id(application_id: str) -> dict | None:
    apps = load_applications()
    return next((a for a in apps if a.get("application_id") == application_id), None)


# ── Mandals ───────────────────────────────────────────────────────────────────

def load_mandals() -> list[dict]:
    with open(MANDALS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def find_mandal_by_id(mandal_id: str) -> dict | None:
    return next((m for m in load_mandals() if m["mandal_id"] == mandal_id), None)


# ── Sahayaks ──────────────────────────────────────────────────────────────────

def load_sahayaks() -> list[dict]:
    with open(SAHAYAKS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def find_sahayak_by_id(sahayak_id: str) -> dict | None:
    return next((s for s in load_sahayaks() if s["sahayak_id"] == sahayak_id), None)

def get_sahayaks_by_mandal(mandal_id: str) -> list[dict]:
    return [s for s in load_sahayaks() if s.get("mandal_id") == mandal_id]


# ── Scoped application queries ────────────────────────────────────────────────

def get_applications_by_sahayak(sahayak_id: str) -> list[dict]:
    """Return only applications assigned to the given sahayak."""
    return [a for a in load_applications() if a.get("sahayak_id") == sahayak_id]

def get_applications_by_mandal(mandal_id: str) -> list[dict]:
    """Return all applications within a mandal (across all its sahayaks)."""
    return [a for a in load_applications() if a.get("mandal_id") == mandal_id]


# ── Generic helper ────────────────────────────────────────────────────────────

def safe_get(record: dict, key: str, default: Any = "") -> Any:
    return record.get(key) or default
