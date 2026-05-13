"""Config-driven regex field extraction from OCR text."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, Optional

import dateparser

__all__ = [
    "extract",
    "list_schemas",
    "get_schemas_dir",
    "load_schema",
]


def get_schemas_dir() -> Path:
    """Return the directory containing JSON schema files (created if missing)."""
    override = os.environ.get("OCR_SCHEMAS_DIR", "").strip()
    if override:
        path = Path(override).expanduser()
    else:
        path = Path(__file__).resolve().parent / "schemas"
    path.mkdir(parents=True, exist_ok=True)
    return path


def list_schemas() -> list[str]:
    """Return available schema basenames (``*.json`` files without extension)."""
    names: list[str] = []
    for p in sorted(get_schemas_dir().glob("*.json")):
        if p.is_file():
            names.append(p.stem)
    return names


def load_schema(schema_name: str) -> Dict[str, str]:
    """Load a schema mapping ``field -> regex_pattern`` from ``schemas/<name>.json``."""
    if not schema_name or schema_name.lower() == "none":
        return {}
    safe = Path(schema_name).name
    path = get_schemas_dir() / f"{safe}.json"
    if not path.is_file():
        raise FileNotFoundError(f"Unknown schema: {schema_name}")
    with path.open(encoding="utf-8") as f:
        data: Any = json.load(f)
    if not isinstance(data, dict):
        raise ValueError("Schema JSON must be an object mapping fields to regex strings.")
    out: Dict[str, str] = {}
    for k, v in data.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        out[k] = v
    return out


def _maybe_normalize_date(field: str, value: str) -> str:
    """If ``field`` looks date-related, try ``dateparser`` and return ISO date when possible."""
    lower = field.lower()
    if "date" not in lower:
        return value
    parsed = dateparser.parse(value, settings={"PREFER_DAY_OF_MONTH": "first"})
    if parsed is None:
        return value
    return parsed.date().isoformat()


def extract(text: str, schema_name: str) -> Dict[str, Optional[str]]:
    """Apply all regex patterns from ``schema_name`` to ``text``.

    Returns a dict ``field -> matched string or None``. The first capturing group
    is returned when present; otherwise the full match is used.
    """
    if not schema_name or schema_name.lower() == "none":
        return {}

    patterns = load_schema(schema_name)
    source = text or ""
    results: Dict[str, Optional[str]] = {}

    for field, pattern in patterns.items():
        value: Optional[str] = None
        try:
            m = re.search(pattern, source, flags=re.IGNORECASE | re.MULTILINE | re.DOTALL)
        except re.error:
            m = None
        if m:
            if m.lastindex:
                value = (m.group(1) or "").strip() or None
            else:
                value = (m.group(0) or "").strip() or None
        if value:
            value = _maybe_normalize_date(field, value)
        results[field] = value
    return results
