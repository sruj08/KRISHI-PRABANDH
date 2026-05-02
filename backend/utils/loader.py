import json
import os
from typing import Any

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "applications.json")

def load_applications() -> list[dict]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_applications(data: list[dict]) -> None:
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def find_by_id(application_id: str) -> dict | None:
    apps = load_applications()
    return next((a for a in apps if a.get("application_id") == application_id), None)

def safe_get(record: dict, key: str, default: Any = "") -> Any:
    return record.get(key) or default
