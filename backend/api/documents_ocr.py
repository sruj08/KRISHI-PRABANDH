"""Farmer document vault — upload + OCR + optional schema extraction (same engine as surveys)."""

from __future__ import annotations

import asyncio
from typing import Any, Dict

from fastapi import APIRouter, Depends, File, Form, UploadFile

from middleware.auth import get_current_user_optional
from schemas.auth import JwtUserClaims
from services.ocr_engine import extract, list_schemas, ocr as run_ocr_engine, postprocess
from services.ocr_engine.utils import allowed_file, cleanup, save_upload
from utils.response import failure, success

router = APIRouter(prefix="/api/documents", tags=["Documents OCR"])

# Vault card titles (mock) → ocr_engine/schemas/*.json basename
TITLE_TO_SCHEMA: Dict[str, str] = {
    "Aadhaar": "aadhaar",
    "PAN": "none",
    "7/12 Extract": "satbara",
    "Bank Passbook": "bank_passbook",
    "Income Certificate": "income_certificate",
    "Caste Certificate": "caste_certificate",
    "Crop Declaration": "crop_sowing",
    "Insurance Receipt": "insurance_document",
    "Equipment Invoice": "equipment_invoice",
}


def _resolve_schema(document_title: str) -> str:
    key = (document_title or "").strip()
    s = TITLE_TO_SCHEMA.get(key, "none")
    if s != "none" and s not in set(list_schemas()):
        return "none"
    return s


def _run_ocr_sync(saved_path: str, document_title: str) -> Dict[str, Any]:
    ocr_out = run_ocr_engine(saved_path)
    engine_used = str(ocr_out.get("engine_used") or "none")
    if engine_used == "none":
        return {"error": "ocr_unavailable", "detail": "Neither Tesseract nor EasyOCR is available on this server."}

    raw_text = postprocess(str(ocr_out.get("text") or ""))
    confidence = float(ocr_out.get("confidence") or 0.0)
    schema = _resolve_schema(document_title)
    fields: Dict[str, Any] = {}
    if schema != "none":
        fields = extract(raw_text, schema)

    filled = sum(1 for v in fields.values() if v not in (None, "", []))
    preview_len = 2000
    return {
        "document_title": (document_title or "").strip(),
        "schema": schema,
        "engine_used": engine_used,
        "confidence": confidence,
        "fields": fields,
        "fields_filled_count": filled,
        "text_length": len(raw_text),
        "text_preview": raw_text[:preview_len],
    }


@router.post("/ocr")
async def farmer_document_ocr(
    file: UploadFile = File(..., description="PDF or image"),
    document_title: str = Form("", description="Document type label from vault card"),
    user: JwtUserClaims | None = Depends(get_current_user_optional),
):
    if not file.filename:
        return failure("Uploaded file must include a filename")
    if not allowed_file(file.filename):
        return failure("Unsupported file type", details="Allowed: jpg, jpeg, png, tiff, bmp, webp, pdf.")

    raw_bytes = await file.read()
    if not raw_bytes:
        return failure("Uploaded file is empty")

    saved_path = None
    try:
        saved_path = await asyncio.to_thread(save_upload, raw_bytes, file.filename)
        result = await asyncio.to_thread(_run_ocr_sync, saved_path, document_title)
        if "error" in result:
            return failure(result.get("detail", "OCR unavailable"), status_code=503)
        if user:
            result["actor_sub"] = user.sub
        return success("OCR complete", result)
    except Exception as exc:  # noqa: BLE001 — return safe message to client
        return failure("OCR processing failed", details=str(exc), status_code=500)
    finally:
        if saved_path:
            await asyncio.to_thread(cleanup, saved_path)
