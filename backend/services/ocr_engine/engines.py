"""OCR engine wrappers: Tesseract, EasyOCR, and a confidence-aware combined path."""

from __future__ import annotations

import os
import re
from typing import Any, Dict, List, Optional

import cv2
import numpy as np
import pytesseract
from PIL import Image

from .postprocessor import postprocess
from .preprocessor import preprocess_easyocr, preprocess_tesseract

__all__ = [
    "tesseract_ocr",
    "easyocr_ocr",
    "ocr",
    "ocr_with_region_split",
    "tesseract_available",
    "easyocr_available",
    "configure_tesseract_cmd",
    "tesseract_ocr_options",
    "_is_vertical_garbage",
    "_is_table_skipped",
    "_detect_layout_mode",
]

_EASYOCR_READER: Any = None
_CONFIDENCE_FALLBACK_THRESHOLD = 60.0


def _detect_layout_mode(processed: np.ndarray) -> int:
    """Pick Tesseract PSM: 6 for tall, narrow CC forests (row-wise block); 3 otherwise.

    ``processed`` may be binary ``uint8`` (Tesseract input) or single-channel.
    """
    if processed.size == 0:
        return 6
    if processed.ndim == 3:
        g = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
    else:
        g = processed
    _, bw = cv2.threshold(g, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    n, _labels, stats, _cent = cv2.connectedComponentsWithStats(bw)
    if n <= 2:
        return 6
    ratios: List[float] = []
    for i in range(1, n):
        area = int(stats[i, cv2.CC_STAT_AREA])
        if area < 60:
            continue
        h = int(stats[i, cv2.CC_STAT_HEIGHT])
        w = int(stats[i, cv2.CC_STAT_WIDTH])
        if w < 2:
            continue
        ratios.append(float(h) / float(w))
    if len(ratios) < 8:
        return 6
    med_r = float(np.median(ratios))
    if med_r > 2.0 and len(ratios) > 20:
        return 6
    return 3


def _tesseract_cli_extra(processed: Optional[np.ndarray] = None) -> str:
    """Tesseract CLI flags. ``OCR_TESSERACT_CONFIG`` overrides; else PSM 4 for mixed table+body."""
    del processed  # reserved for callers; PSM is fixed unless ``OCR_TESSERACT_CONFIG`` is set.
    raw = os.environ.get("OCR_TESSERACT_CONFIG", "").strip()
    if raw:
        return raw
    return "--oem 3 --psm 4"


def tesseract_ocr_options() -> str:
    """Return Tesseract CLI string for callers without a processed image (default PSM 4)."""
    return _tesseract_cli_extra(None)


def configure_tesseract_cmd() -> None:
    """Apply ``TESSERACT_CMD`` from the environment to ``pytesseract``, if set."""
    cmd = os.environ.get("TESSERACT_CMD", "").strip()
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd


def tesseract_available() -> bool:
    """Return True if the Tesseract binary is callable."""
    configure_tesseract_cmd()
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


def easyocr_available() -> bool:
    """Return True if EasyOCR can be imported (models may still download later)."""
    try:
        import easyocr  # noqa: F401, pylint: disable=unused-import

        return True
    except Exception:
        return False


def _average_tesseract_confidence(processed: np.ndarray, lang: str) -> float:
    """Compute mean Tesseract word confidence (0–100) from ``image_to_data``."""
    configure_tesseract_cmd()
    pil_img = Image.fromarray(processed)
    cfg = _tesseract_cli_extra(processed)
    data = pytesseract.image_to_data(
        pil_img,
        lang=lang,
        config=cfg,
        output_type=pytesseract.Output.DICT,
    )
    confs: List[int] = []
    for c in data.get("conf", []):
        try:
            v = int(float(c))
        except (TypeError, ValueError):
            continue
        if v >= 0:
            confs.append(v)
    if not confs:
        return 0.0
    return float(sum(confs)) / float(len(confs))


def _key_label_present(text: str, key: str) -> bool:
    """True if ``key`` already appears as a label before ``:`` in ``text``."""
    return bool(re.search(r"(?<![A-Za-z0-9])" + re.escape(key) + r"\s*:", text, flags=re.IGNORECASE))


def _merge_table_passes(text_psm6: str, text_psm11: str) -> str:
    """Merge PSM 6 (ordered) with PSM 11 (sparse); append missing KEY: VALUE pairs from PSM 11."""
    kv_pattern = re.compile(
        r"([A-Za-z][A-Za-z\s]{1,30})\s*:\s*([^\n:]{1,60})",
        re.MULTILINE,
    )
    extra_lines: List[str] = []
    seen: set[str] = set()
    for m in kv_pattern.finditer(text_psm11):
        key = m.group(1).strip()
        val = m.group(2).strip()
        if not val:
            continue
        lk = key.lower()
        if lk in seen:
            continue
        seen.add(lk)
        if _key_label_present(text_psm6, key):
            continue
        extra_lines.append(f"{key}: {val}")
    if extra_lines:
        return text_psm6.strip() + "\n" + "\n".join(extra_lines)
    return text_psm6.strip()


def _ocr_region_split_text(processed_full: np.ndarray, lang: str) -> str:
    """Merge PSM 4 full-page, PSM 6 + PSM 11 table band, and PSM 4 body when split wins."""
    pil_full = Image.fromarray(processed_full)
    text_full = (
        pytesseract.image_to_string(pil_full, lang=lang, config="--oem 3 --psm 4") or ""
    )
    full_lines = [ln for ln in text_full.splitlines() if ln.strip()]
    if len(full_lines) >= 10:
        return text_full.strip()

    h = int(processed_full.shape[0])
    if h < 24:
        return text_full.strip()

    table_region = processed_full[: int(h * 0.40), :]
    pil_table = Image.fromarray(table_region)
    text_table_psm6 = (
        pytesseract.image_to_string(pil_table, lang=lang, config="--oem 3 --psm 6") or ""
    )
    text_table_psm11 = (
        pytesseract.image_to_string(pil_table, lang=lang, config="--oem 3 --psm 11") or ""
    )
    text_table = _merge_table_passes(text_table_psm6, text_table_psm11)

    body_region = processed_full[int(h * 0.40) :, :]
    pil_body = Image.fromarray(body_region)
    text_body = (
        pytesseract.image_to_string(pil_body, lang=lang, config="--oem 3 --psm 4") or ""
    )

    merged_split = (text_table.strip() + "\n" + text_body.strip()).strip()
    if len(merged_split) > len(text_full.strip()) + 20:
        return merged_split
    return text_full.strip()


def _extract_table_region_text(img_path: str, top_frac: float = 0.35) -> str:
    """Run Tesseract on the top ``top_frac`` of the preprocessed image with PSM 11 (sparse text)."""
    configure_tesseract_cmd()
    lang = os.environ.get("OCR_TESSERACT_LANG", "eng").strip() or "eng"
    processed = preprocess_tesseract(img_path)
    h = int(processed.shape[0])
    if h < 8:
        return ""
    table_region = processed[: max(1, int(h * top_frac)), :]
    pil_table = Image.fromarray(table_region)
    text_psm11 = pytesseract.image_to_string(
        pil_table, lang=lang, config="--oem 3 --psm 11"
    ) or ""
    return text_psm11.strip()


def ocr_with_region_split(img_path: str) -> str:
    """Two-pass Tesseract: PSM 4 full page, then optional top/body split for richer text."""
    configure_tesseract_cmd()
    lang = os.environ.get("OCR_TESSERACT_LANG", "eng").strip() or "eng"
    processed_full = preprocess_tesseract(img_path)
    return postprocess(_ocr_region_split_text(processed_full, lang))


def tesseract_ocr(img_path: str, lang: str = "eng") -> str:
    """Run Tesseract OCR on ``img_path`` after :func:`preprocess_tesseract`."""
    configure_tesseract_cmd()
    processed = preprocess_tesseract(img_path)
    pil_img = Image.fromarray(processed)
    text = pytesseract.image_to_string(
        pil_img,
        lang=lang,
        config=_tesseract_cli_extra(processed),
    )
    return postprocess(text or "")


def _get_easyocr_reader(langs: List[str]):
    """Lazily construct a singleton EasyOCR ``Reader`` (CPU only, ``gpu=False``)."""
    global _EASYOCR_READER  # noqa: PLW0603 - intentional singleton cache
    import easyocr

    if _EASYOCR_READER is None:
        _EASYOCR_READER = easyocr.Reader(langs, gpu=False)
    return _EASYOCR_READER


def _resolve_easyocr_langs(langs: Optional[List[str]]) -> List[str]:
    """Normalize EasyOCR language list from explicit args or ``OCR_EASYOCR_LANGS``."""
    if langs is None:
        raw = os.environ.get("OCR_EASYOCR_LANGS", "en")
        langs = [x.strip() for x in raw.split(",") if x.strip()]
    if not langs:
        langs = ["en"]
    return langs


def _easyocr_run(img_path: str, langs: List[str]) -> tuple[str, float]:
    """Run EasyOCR on ``preprocess_easyocr`` output; pass BGR ``numpy`` array (no temp PNG)."""
    processed_bgr = preprocess_easyocr(img_path)
    reader = _get_easyocr_reader(langs)
    results = reader.readtext(processed_bgr, detail=1, paragraph=False)
    lines: List[str] = []
    scores: List[float] = []
    for item in results:
        if len(item) >= 2:
            lines.append(str(item[1]))
        if len(item) >= 3 and isinstance(item[2], (int, float)):
            scores.append(float(item[2]))
    text = "\n".join(lines).strip()
    if not scores:
        conf = 0.0
    else:
        mean01 = sum(scores) / len(scores)
        conf = float(mean01 * 100.0) if mean01 <= 1.5 else float(mean01)
    return text, conf


def easyocr_ocr(img_path: str, langs: Optional[List[str]] = None) -> str:
    """Run EasyOCR on ``img_path`` after :func:`preprocess_easyocr`."""
    langs = _resolve_easyocr_langs(langs)
    text, _conf = _easyocr_run(img_path, langs)
    return postprocess(text)


def _is_vertical_garbage(text: str) -> bool:
    """Detect column-by-column Tesseract reads: many very short lines."""
    lines = [ln.strip() for ln in text.strip().splitlines() if ln.strip()]
    if len(lines) < 8:
        return False
    total_chars = sum(len(ln) for ln in lines)
    if total_chars < 20:
        return False
    short_lines = sum(1 for ln in lines if len(ln) <= 3)
    return (short_lines / float(len(lines))) > 0.65


def _is_table_skipped(text: str) -> bool:
    """Detect when a table document's content is almost entirely missing."""
    lines = [ln.strip() for ln in text.strip().splitlines() if ln.strip()]
    if len(lines) >= 8:
        return False
    label_pattern_lines = sum(1 for ln in lines if ":" in ln)
    return len(lines) < 4 and label_pattern_lines >= 1


def _tesseract_suspiciously_empty(text: str, avg_conf: float, min_chars: int = 8) -> bool:
    """When Tesseract reports decent confidence but almost no text (common on bad binarization)."""
    alnum = sum(1 for c in text if c.isalnum())
    return avg_conf >= 72.0 and alnum < min_chars


def ocr(img_path: str) -> Dict[str, Any]:
    """Run Tesseract; fall back to EasyOCR on vertical garbage, low confidence, or empty text.

    Set ``OCR_DISABLE_EASYOCR_FALLBACK=1`` to skip all EasyOCR fallbacks when Tesseract exists.

    Returns a dict with keys: ``text``, ``engine_used``, ``confidence``.
    """
    tess_lang = os.environ.get("OCR_TESSERACT_LANG", "eng").strip() or "eng"
    easy_langs_env = os.environ.get("OCR_EASYOCR_LANGS", "en")
    easy_langs = [x.strip() for x in easy_langs_env.split(",") if x.strip()] or ["en"]

    processed = preprocess_tesseract(img_path)

    if not tesseract_available():
        if not easyocr_available():
            return {
                "text": "",
                "engine_used": "none",
                "confidence": 0.0,
            }
        ez_text, ez_conf = _easyocr_run(img_path, easy_langs)
        return {
            "text": postprocess(ez_text),
            "engine_used": "easyocr",
            "confidence": round(ez_conf, 2),
        }

    configure_tesseract_cmd()
    tess_text = _ocr_region_split_text(processed, tess_lang)
    avg_conf = _average_tesseract_confidence(processed, tess_lang)
    tess_stripped = tess_text.strip()

    disable_easy_fb = os.environ.get("OCR_DISABLE_EASYOCR_FALLBACK", "").strip().lower() in (
        "1",
        "true",
        "yes",
        "on",
    )

    if (
        not disable_easy_fb
        and (_is_vertical_garbage(tess_stripped) or _is_table_skipped(tess_stripped))
        and easyocr_available()
    ):
        ez_text, ez_conf = _easyocr_run(img_path, easy_langs)
        return {
            "text": postprocess(ez_text),
            "engine_used": "easyocr",
            "confidence": round(ez_conf, 2),
        }

    use_easy = not disable_easy_fb and avg_conf < _CONFIDENCE_FALLBACK_THRESHOLD
    if (
        not disable_easy_fb
        and not use_easy
        and easyocr_available()
        and _tesseract_suspiciously_empty(tess_stripped, avg_conf)
    ):
        use_easy = True

    if use_easy and easyocr_available():
        ez_text, ez_conf = _easyocr_run(img_path, easy_langs)
        return {
            "text": postprocess(ez_text),
            "engine_used": "easyocr",
            "confidence": round(ez_conf, 2),
        }

    return {
        "text": postprocess(tess_stripped),
        "engine_used": "tesseract",
        "confidence": round(float(avg_conf), 2),
    }
