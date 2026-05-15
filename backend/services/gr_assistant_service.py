"""GR (Government Resolution) assistant: PDF text + keyword summary + eligible farmer matching."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Optional

import db.json_store as store

_GR_SCHEMA_PATH = Path(__file__).resolve().parent / "ocr_engine" / "schemas" / "gr_document.json"


def _extract_gr_fields(text: str) -> dict[str, Optional[str]]:
    """Apply gr_document regex schema without importing ocr_engine (avoids cv2)."""
    if not _GR_SCHEMA_PATH.is_file():
        return {}
    with _GR_SCHEMA_PATH.open(encoding="utf-8") as fh:
        patterns: Any = json.load(fh)
    if not isinstance(patterns, dict):
        return {}
    source = text or ""
    results: dict[str, Optional[str]] = {}
    for field, pattern in patterns.items():
        if not isinstance(field, str) or not isinstance(pattern, str):
            continue
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
        results[field] = value
    return results

# Lines / phrases that signal useful GR content (Marathi + English)
_GR_KEYWORD_HINTS = (
    "योजना",
    "Scheme",
    "पात्रता",
    "Eligibility",
    "अनुदान",
    "Subsidy",
    "अंतिम दिनांक",
    "Deadline",
    "Last Date",
    "आदेश",
    "Resolution",
    "Government",
    "महाराष्ट्र",
    "कृषी",
    "शेतकरी",
    "Farmer",
    "हेक्टर",
    "hectare",
    "ha ",
    "OBC",
    "SC",
    "ST",
    "जात",
    "संवर्ग",
    "Category",
    "दस्तऐवज",
    "Document",
    "अटी",
    "Condition",
)


def extract_pdf_text(pdf_bytes: bytes) -> tuple[str, str]:
    """Return (raw_text, engine_label). Uses PyMuPDF when available."""
    try:
        import fitz  # PyMuPDF

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        parts: list[str] = []
        for page in doc:
            parts.append(page.get_text("text") or "")
        doc.close()
        text = "\n".join(parts).strip()
        return text, "pymupdf"
    except ImportError:
        return "", "missing_pymupdf"
    except Exception:
        return "", "pdf_read_error"


def extract_keyword_snippets(text: str, max_items: int = 14) -> list[str]:
    """Short bullet-like snippets from lines that contain GR-related keywords."""
    if not text:
        return []
    seen: set[str] = set()
    out: list[str] = []
    for line in text.splitlines():
        s = line.strip()
        if len(s) < 12 or len(s) > 220:
            continue
        if not any(h.lower() in s.lower() for h in _GR_KEYWORD_HINTS):
            continue
        key = s[:200]
        if key in seen:
            continue
        seen.add(key)
        out.append(s[:200])
        if len(out) >= max_items:
            break
    return out


def _parse_hectare_cap(full_text: str, eligibility: Optional[str]) -> Optional[float]:
    blob = f"{full_text}\n{eligibility or ''}"
    # e.g. "2 ha", "2.0 हेक्टर", "< 2 ha", "less than 2 hectare"
    patterns = [
        r"(?:less than|under|below|up to|maximum|जास्तीत जास्त|कमी)\s*([\d.]+)\s*(?:ha|हे\.|हेक्टर|hectare)\b",
        r"<\s*([\d.]+)\s*(?:ha|हेक्टर|hectare)\b",
        r"([\d.]+)\s*(?:ha|हेक्टर|hectare)\b(?:\s*(?:or below|पर्यंत))?",
    ]
    caps: list[float] = []
    for pat in patterns:
        for m in re.finditer(pat, blob, flags=re.IGNORECASE):
            try:
                caps.append(float(m.group(1)))
            except ValueError:
                continue
    if not caps:
        return None
    return min(caps)


def _parse_category_requirements(blob: str) -> set[str]:
    """Reserved categories the GR names explicitly (empty = no category filter)."""
    need: set[str] = set()
    if re.search(r"\bSC\b|अनुसूचित\s+जाती", blob, re.IGNORECASE):
        need.add("SC")
    if re.search(r"\bST\b|अनुसूचित\s+जमाती", blob, re.IGNORECASE):
        need.add("ST")
    if re.search(r"\bOBC\b|ओबीसी|OTHER\s+BACKWARD", blob, re.IGNORECASE):
        need.add("OBC")
    return need


def _farmer_total_holding_hectares(farmer_id: str, farms: list[dict[str, Any]]) -> float:
    total = 0.0
    for f in farms:
        if str(f.get("farmer_id")) != str(farmer_id):
            continue
        try:
            total += float(f.get("farm_area_hectare") or 0)
        except (TypeError, ValueError):
            continue
    return round(total, 3)


def match_eligible_farmers(
    full_text: str,
    fields: dict[str, Optional[str]],
) -> list[dict[str, Any]]:
    """Match local JSON farmers to GR hints (land cap + optional reserved category)."""
    farmers = store.load("farmer_profiles")
    farms = store.load("farms")
    blob = f"{full_text}\n" + "\n".join(v for v in fields.values() if v)

    ha_cap = _parse_hectare_cap(full_text, fields.get("eligibility"))
    cat_need = _parse_category_requirements(blob)

    rows: list[dict[str, Any]] = []
    for fr in farmers:
        fid = str(fr.get("id", ""))
        if not fid:
            continue
        cat = (fr.get("category") or "Open").strip()
        total_ha = _farmer_total_holding_hectares(fid, farms)

        reasons: list[str] = []
        ok = True

        if ha_cap is not None:
            if total_ha <= ha_cap + 1e-6:
                reasons.append(f"Total holding {total_ha} ha ≤ {ha_cap} ha (per GR)")
            else:
                ok = False
                reasons.append(f"Total holding {total_ha} ha exceeds {ha_cap} ha cap")

        if cat_need:
            allowed_norm = {c.strip().upper() for c in cat_need}
            if cat.strip().upper() not in allowed_norm:
                ok = False
                reasons.append(
                    f"Category “{cat}” — GR text mentions only: {', '.join(sorted(cat_need))}",
                )
            else:
                reasons.append(f"Category “{cat}” matches GR")

        if ok:
            rows.append(
                {
                    "farmer_id": fid,
                    "name": fr.get("name") or "—",
                    "farmer_id_external": fr.get("farmer_id_external") or fr.get("agristack_id") or "—",
                    "category": cat,
                    "phone": fr.get("phone") or "—",
                    "village_id": str(fr.get("village_id") or ""),
                    "total_land_ha": total_ha,
                    "match_reasons": reasons or ["Matches local registry (no strict cap parsed)"],
                }
            )

    rows.sort(key=lambda r: (r.get("name") or "").lower())
    return rows


def process_gr_pdf(pdf_bytes: bytes) -> dict[str, Any]:
    text, engine = extract_pdf_text(pdf_bytes)
    if engine == "missing_pymupdf":
        return {
            "ok": False,
            "error": "missing_dependency",
            "detail": "Install PyMuPDF on the server: pip install pymupdf",
        }
    if engine == "pdf_read_error" or not text:
        return {
            "ok": False,
            "error": "no_text",
            "detail": "Could not read text from this PDF (scanned-only PDFs need full OCR stack).",
        }

    fields = _extract_gr_fields(text)
    filled = sum(1 for v in fields.values() if v)
    keywords = extract_keyword_snippets(text)
    blob = f"{text}\n" + "\n".join(v for v in fields.values() if v)
    ha_cap = _parse_hectare_cap(text, fields.get("eligibility"))
    cat_need = sorted(_parse_category_requirements(blob))
    inferred_filters = {
        "land_cap_ha": ha_cap,
        "reserved_categories": cat_need,
        "has_structured_fields": filled > 0,
    }

    eligible = match_eligible_farmers(text, fields)

    confidence = min(
        98,
        max(
            42,
            int(55 + min(30, filled * 6) + min(13, min(len(text) // 800, 13))),
        ),
    )

    return {
        "ok": True,
        "engine": engine,
        "confidence": confidence,
        "fields": fields,
        "keywords": keywords,
        "inferred_filters": inferred_filters,
        "eligible_farmers": eligible,
        "eligible_count": len(eligible),
        "text_preview": (text or "")[:3500],
        "text_length": len(text),
    }
