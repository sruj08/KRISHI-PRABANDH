"""File upload helpers: save, delete, and filename validation for the OCR backend."""

from __future__ import annotations

import os
import re
import tempfile
import uuid
from pathlib import Path

__all__ = [
    "save_upload",
    "cleanup",
    "allowed_file",
    "get_upload_dir",
]

_ALLOWED_EXTENSIONS = frozenset(
    {"jpg", "jpeg", "png", "tiff", "tif", "bmp", "webp", "pdf"}
)


def get_upload_dir() -> Path:
    """Return the directory used for temporary uploads, creating it if needed.

    Uses the ``OCR_UPLOAD_DIR`` environment variable when set; otherwise
    ``<system_temp>/ocr_uploads``.
    """
    base = os.environ.get("OCR_UPLOAD_DIR", "").strip()
    if base:
        path = Path(base)
    else:
        path = Path(tempfile.gettempdir()) / "ocr_uploads"
    path.mkdir(parents=True, exist_ok=True)
    return path


def allowed_file(filename: str) -> bool:
    """Return True if ``filename`` has an allowed image/PDF extension (case-insensitive)."""
    if not filename or not isinstance(filename, str):
        return False
    name = filename.rsplit("/", maxsplit=1)[-1].rsplit("\\", maxsplit=1)[-1]
    if "." not in name:
        return False
    ext = name.rsplit(".", maxsplit=1)[-1].lower()
    return ext in _ALLOWED_EXTENSIONS


def save_upload(file_bytes: bytes, filename: str) -> str:
    """Persist ``file_bytes`` under a unique name in the upload directory.

    Returns the absolute path of the saved file. The stored extension is taken
    from ``filename`` when allowed; otherwise ``.bin`` is used.
    """
    upload_dir = get_upload_dir()
    safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(filename).name)[:120] or "upload"
    ext = Path(safe_stem).suffix.lower()
    if ext.startswith("."):
        ext_token = ext[1:]
    else:
        ext_token = ""
    if ext_token not in _ALLOWED_EXTENSIONS:
        ext = ".bin"
    unique = f"{uuid.uuid4().hex}{ext}"
    dest = upload_dir / unique
    dest.write_bytes(file_bytes)
    return str(dest.resolve())


def cleanup(path: str) -> None:
    """Delete a file at ``path`` if it exists; ignore errors (best-effort)."""
    if not path:
        return
    try:
        p = Path(path)
        if p.is_file():
            p.unlink()
    except OSError:
        return
