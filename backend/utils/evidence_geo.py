"""Helpers for interpreting embedded Supabase rows (no database imports)."""

from __future__ import annotations

from typing import Any, Optional


def _unwrap(obj: Any) -> Any:
    if isinstance(obj, list) and obj:
        return obj[0]
    return obj


def extract_geo_context(record: dict[str, Any]) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """Return (village_name, taluka_id, district_id) from an embedded Supabase row."""
    surveys = _unwrap(record.get("surveys"))
    if not isinstance(surveys, dict):
        return None, None, None
    farms = _unwrap(surveys.get("farms"))
    if not isinstance(farms, dict):
        return None, None, None
    villages = _unwrap(farms.get("villages"))
    if not isinstance(villages, dict):
        return None, None, None
    vname = villages.get("name")
    circles = _unwrap(villages.get("circles"))
    if not isinstance(circles, dict):
        return str(vname) if vname is not None else None, None, None
    talukas = _unwrap(circles.get("talukas"))
    if not isinstance(talukas, dict):
        return str(vname) if vname is not None else None, None, None
    t_id = talukas.get("id")
    districts = _unwrap(talukas.get("districts"))
    d_id = None
    if isinstance(districts, dict):
        d_id = districts.get("id")
    return (
        str(vname) if vname is not None else None,
        str(t_id) if t_id is not None else None,
        str(d_id) if d_id is not None else None,
    )
