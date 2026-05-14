"""
db/json_store.py
================
Thread-safe, file-backed JSON persistence layer.

All data lives in ``backend/data/<table>.json`` files as JSON arrays.
Each record MUST have an ``"id"`` string field (UUID).

Public API
----------
load(table)                         -> list[dict]
save(table, rows)                   -> None   (atomic write)
find_one(table, **filters)          -> dict | None
find_many(table, **filters)         -> list[dict]
insert(table, row)                  -> dict   (auto-sets id + created_at)
update(table, record_id, patch)     -> dict | None
delete(table, record_id)            -> bool
count(table, **filters)             -> int
"""

from __future__ import annotations

import json
import os
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── storage root ────────────────────────────────────────────────────────────

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Per-table locks so concurrent requests don't corrupt files
_locks: dict[str, threading.Lock] = {}
_locks_meta = threading.Lock()


def _get_lock(table: str) -> threading.Lock:
    with _locks_meta:
        if table not in _locks:
            _locks[table] = threading.Lock()
        return _locks[table]


def _table_path(table: str) -> Path:
    return _DATA_DIR / f"{table}.json"


# ── low-level I/O ────────────────────────────────────────────────────────────


def load(table: str) -> list[dict[str, Any]]:
    """Read all rows from a table (returns [] if file doesn't exist yet)."""
    path = _table_path(table)
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as fh:
        try:
            data = json.load(fh)
            return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            return []


def save(table: str, rows: list[dict[str, Any]]) -> None:
    """Atomically write rows to the table file."""
    path = _table_path(table)
    tmp = path.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2, default=str)
    # atomic replace
    os.replace(tmp, path)


# ── query helpers ────────────────────────────────────────────────────────────


def _matches(row: dict[str, Any], filters: dict[str, Any]) -> bool:
    for k, v in filters.items():
        if row.get(k) != v:
            return False
    return True


def find_one(table: str, **filters: Any) -> dict[str, Any] | None:
    with _get_lock(table):
        for row in load(table):
            if _matches(row, filters):
                return dict(row)
    return None


def find_many(table: str, **filters: Any) -> list[dict[str, Any]]:
    with _get_lock(table):
        rows = load(table)
        if not filters:
            return [dict(r) for r in rows]
        return [dict(r) for r in rows if _matches(r, filters)]


def insert(table: str, row: dict[str, Any]) -> dict[str, Any]:
    """Insert a new row, auto-generating id and created_at if absent."""
    record = dict(row)
    if "id" not in record or not record["id"]:
        record["id"] = str(uuid.uuid4())
    if "created_at" not in record:
        record["created_at"] = datetime.now(timezone.utc).isoformat()
    with _get_lock(table):
        rows = load(table)
        rows.append(record)
        save(table, rows)
    return dict(record)


def update(table: str, record_id: str, patch: dict[str, Any]) -> dict[str, Any] | None:
    """Patch an existing row by id. Returns updated row or None if not found."""
    updated: dict[str, Any] | None = None
    with _get_lock(table):
        rows = load(table)
        for i, row in enumerate(rows):
            if str(row.get("id")) == record_id:
                rows[i] = {**row, **patch, "updated_at": datetime.now(timezone.utc).isoformat()}
                updated = dict(rows[i])
                break
        if updated is not None:
            save(table, rows)
    return updated


def delete(table: str, record_id: str) -> bool:
    """Remove a row by id. Returns True if deleted."""
    deleted = False
    with _get_lock(table):
        rows = load(table)
        new_rows = [r for r in rows if str(r.get("id")) != record_id]
        if len(new_rows) < len(rows):
            save(table, new_rows)
            deleted = True
    return deleted


def count(table: str, **filters: Any) -> int:
    """Count rows matching optional filters."""
    return len(find_many(table, **filters))
