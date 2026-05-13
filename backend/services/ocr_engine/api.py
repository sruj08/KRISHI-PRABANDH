"""FastAPI REST surface for the OCR Engine (multipart upload, schemas, health)."""

from __future__ import annotations

import os
import traceback
from typing import Any, Dict, Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import engines, extractor, table_layout, utils

__all__ = ["app"]

app = FastAPI(title="OCR Engine API", version="1.0.0")

_cors_origins_raw = os.environ.get("OCR_CORS_ALLOW_ORIGINS", "*").strip()
if _cors_origins_raw in ("*", ""):
    _cors_origins = ["*"]
else:
    _cors_origins = [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def _validation_handler(_request, exc: RequestValidationError) -> JSONResponse:
    """Return JSON for request validation failures (never empty HTML errors)."""
    return JSONResponse(
        status_code=422,
        content={"error": "validation_error", "detail": jsonable_encoder(exc.errors())},
    )


@app.exception_handler(Exception)
async def _unhandled_exception_handler(_request, exc: Exception) -> JSONResponse:
    """Catch-all handler so the process always responds with JSON."""
    detail = str(exc)
    if os.environ.get("OCR_DEBUG_TRACEBACK", "").lower() in ("1", "true", "yes"):
        detail = traceback.format_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "detail": detail},
    )


@app.get("/health")
def health() -> Dict[str, Any]:
    """Liveness probe plus engine availability flags."""
    return {
        "status": "ok",
        "tesseract_available": engines.tesseract_available(),
        "easyocr_available": engines.easyocr_available(),
    }


@app.get("/schemas")
def list_schema_names() -> list[str]:
    """Return available extractor schema basenames (filenames without ``.json``)."""
    return extractor.list_schemas()


@app.post("/ocr")
async def run_ocr(
    file: UploadFile = File(..., description="Image or PDF (first page) to OCR."),
    schema_name: str = Form(
        "none",
        alias="schema",
        description='Extractor schema name, or "none".',
    ),
    include_layout: bool = Form(
        False,
        description="If true, add Tesseract word boxes and heuristic rows[][] (Tesseract runs only).",
    ),
    force_engine: str = Form(
        "auto",
        description='Force a specific engine: "auto" (default), "tesseract", or "easyocr".',
    ),
    table_mode: bool = Form(
        False,
        description="If true, uses region-split OCR (table top + body bottom) for mixed documents.",
    ),
    neutralize_fills: bool = Form(
        True,
        description="If true (default), replaces colored/redacted cell fills with white before OCR.",
    ),
) -> Any:
    """Run preprocessing, OCR (Tesseract with EasyOCR fallback), and optional field extraction."""
    saved_path: Optional[str] = None
    try:
        if not file.filename:
            return JSONResponse(
                status_code=400,
                content={"error": "missing_filename", "detail": "Uploaded file must include a filename."},
            )
        if not utils.allowed_file(file.filename):
            return JSONResponse(
                status_code=400,
                content={
                    "error": "unsupported_file_type",
                    "detail": "Allowed extensions: jpg, jpeg, png, tiff, tif, bmp, webp, pdf.",
                },
            )

        raw_bytes = await file.read()
        if not raw_bytes:
            return JSONResponse(
                status_code=400,
                content={"error": "empty_file", "detail": "Uploaded file is empty."},
            )

        saved_path = utils.save_upload(raw_bytes, file.filename)
        fe = (force_engine or "auto").strip().lower()
        if fe == "easyocr":
            if not engines.easyocr_available():
                return JSONResponse(
                    status_code=503,
                    content={
                        "error": "easyocr_unavailable",
                        "detail": "EasyOCR is not available on this host.",
                        "filename": file.filename,
                    },
                )
            ez_text = engines.easyocr_ocr(saved_path)
            ocr_out = {"text": ez_text, "engine_used": "easyocr", "confidence": 0.0}
        elif fe == "tesseract":
            if not engines.tesseract_available():
                return JSONResponse(
                    status_code=503,
                    content={
                        "error": "tesseract_unavailable",
                        "detail": "Tesseract is not available on this host.",
                        "filename": file.filename,
                    },
                )
            tess_text = engines.tesseract_ocr(saved_path)
            ocr_out = {"text": tess_text, "engine_used": "tesseract", "confidence": 0.0}
        elif fe in ("auto", ""):
            if table_mode and engines.tesseract_available():
                tess_text = engines.ocr_with_region_split(saved_path)
                ocr_out = {"text": tess_text, "engine_used": "tesseract_split", "confidence": 0.0}
            else:
                ocr_out = engines.ocr(saved_path)
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "invalid_force_engine",
                    "detail": 'force_engine must be "auto", "tesseract", or "easyocr".',
                    "filename": file.filename,
                },
            )

        raw_text = str(ocr_out.get("text") or "")
        engine_used = str(ocr_out.get("engine_used") or "none")
        confidence = float(ocr_out.get("confidence") or 0.0)

        if engine_used == "none":
            return JSONResponse(
                status_code=503,
                content={
                    "error": "ocr_unavailable",
                    "detail": "Neither Tesseract nor EasyOCR is available on this host.",
                    "filename": file.filename,
                    "schema": schema_name,
                },
            )

        resolved_schema = (schema_name or "none").strip() or "none"
        fields: Dict[str, Optional[str]] = {}
        if resolved_schema.lower() != "none":
            try:
                fields = extractor.extract(raw_text, resolved_schema)
            except FileNotFoundError:
                return JSONResponse(
                    status_code=400,
                    content={
                        "error": "unknown_schema",
                        "detail": f"Schema not found: {resolved_schema}",
                        "filename": file.filename,
                    },
                )
            except ValueError as exc:
                return JSONResponse(
                    status_code=400,
                    content={"error": "invalid_schema", "detail": str(exc), "filename": file.filename},
                )

        payload: Dict[str, Any] = {
            "raw_text": raw_text,
            "fields": fields,
            "engine_used": engine_used,
            "confidence": confidence,
            "schema": resolved_schema,
            "filename": file.filename,
            "force_engine": fe if fe else "auto",
            "table_mode": bool(table_mode),
            "neutralize_fills": bool(neutralize_fills),
        }
        if include_layout:
            if engine_used in ("tesseract", "tesseract_split"):
                lay = table_layout.layout_from_path(saved_path)
                payload["words"] = lay["words"]
                payload["rows"] = lay["rows"]
            else:
                payload["words"] = []
                payload["rows"] = []
        return JSONResponse(content=jsonable_encoder(payload))
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": "ocr_failed", "detail": str(exc), "filename": getattr(file, "filename", None)},
        )
    finally:
        if saved_path:
            utils.cleanup(saved_path)


if __name__ == "__main__":
    import uvicorn

    host = os.environ.get("OCR_API_HOST", "127.0.0.1")
    port = int(os.environ.get("OCR_API_PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
