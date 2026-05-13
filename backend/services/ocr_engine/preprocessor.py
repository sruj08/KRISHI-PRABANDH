"""Image preprocessing pipeline for OCR (OpenCV)."""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np

__all__ = [
    "preprocess",
    "preprocess_tesseract",
    "preprocess_easyocr",
    "preprocess_colored_dark_bg",
    "load_image_bgr",
    "debug_preprocess_path",
    "_is_dark_panel_with_colored_text",
    "_neutralize_colored_fills",
    "_maybe_upscale_binary",
]

_MIN_UPSCALE_WIDTH = 1500
_UPSCALE_FACTOR = 2


def _env_float(name: str, default: float) -> float:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def _percentile_stats(gray: np.ndarray) -> tuple[float, float, float, float, float, float]:
    med = float(np.median(gray))
    p10 = float(np.percentile(gray, 10))
    p25 = float(np.percentile(gray, 25))
    p75 = float(np.percentile(gray, 75))
    p90 = float(np.percentile(gray, 90))
    std = float(np.std(gray))
    return med, p10, p25, p75, p90, std


def _looks_like_mixed_light_chrome_dark_panel(gray: np.ndarray) -> bool:
    """True only for a true dark *middle* panel on an otherwise light document (not header bars)."""
    if os.environ.get("OCR_CROP_DARK_PANEL", "1").strip().lower() in ("0", "false", "no", "off"):
        return False
    med, p10, p25, p75, p90, std = _percentile_stats(gray)
    _ = p25, p75
    if med < 150.0:
        return False
    if std < 40.0:
        return False
    spread = p90 - p10
    spread_min = _env_float("OCR_CROP_PANEL_SPREAD_MIN", 100.0)
    if spread < spread_min:
        return False
    if p10 >= 60.0 or p90 <= 200.0:
        return False
    h = gray.shape[0]
    top_band = gray[: int(h * 0.15), :]
    bot_band = gray[int(h * 0.85) :, :]
    mid_band = gray[int(h * 0.15) : int(h * 0.85), :]
    top_dark = float(np.mean(top_band < 80))
    bot_dark = float(np.mean(bot_band < 80))
    mid_dark = float(np.mean(mid_band < 80))
    if (top_dark > 0.3 or bot_dark > 0.3) and mid_dark < 0.15:
        return False
    return mid_dark > 0.10


def _dark_panel_crop_slice(gray: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
    """Return ``(y0, y1, x0, x1)`` for the largest dark island, or ``None`` if no crop."""
    if not _looks_like_mixed_light_chrome_dark_panel(gray):
        return None

    thr = int(_env_float("OCR_DARK_ISLAND_THRESH", 102.0))
    mask = (gray < thr).astype(np.uint8) * 255
    k = max(3, int(_env_float("OCR_DARK_ISLAND_CLOSE", 11.0)))
    if k % 2 == 0:
        k += 1
    kernel = np.ones((k, k), dtype=np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    best = max(contours, key=cv2.contourArea)
    area = float(cv2.contourArea(best))
    h, w = gray.shape[:2]
    page = float(h * w)
    if area < 0.20 * page or area > 0.80 * page:
        return None
    x, y, cw, ch = cv2.boundingRect(best)
    if y < 40:
        return None
    img_w = gray.shape[1]
    if cw > img_w * 0.85:
        return None
    pad = int(_env_float("OCR_DARK_ISLAND_PAD", 14.0))
    x0 = max(0, x - pad)
    y0 = max(0, y - pad)
    x1 = min(w, x + cw + pad)
    y1 = min(h, y + ch + pad)
    if x1 <= x0 + 8 or y1 <= y0 + 8:
        return None
    return (y0, y1, x0, x1)


def _maybe_crop_dark_editor_panel(gray: np.ndarray) -> np.ndarray:
    """If light browser chrome surrounds a dark code block, crop to that block."""
    sl = _dark_panel_crop_slice(gray)
    if sl is None:
        return gray
    y0, y1, x0, x1 = sl
    return gray[y0:y1, x0:x1]


def _apply_crop_slice(img: np.ndarray, sl: Optional[Tuple[int, int, int, int]]) -> np.ndarray:
    if sl is None:
        return img
    y0, y1, x0, x1 = sl
    return img[y0:y1, x0:x1]


def _clean_page_border(bgr: np.ndarray, border_px: Optional[int] = None) -> np.ndarray:
    """White out outer border strips only when each strip is near-black (scanner edge artifact)."""
    if bgr.ndim != 3 or bgr.shape[2] != 3:
        return bgr
    if border_px is None:
        border_px = int(os.environ.get("OCR_BORDER_CLEAN_PX", "4"))
    border_px = max(1, min(border_px, 20))
    h, w = bgr.shape[:2]
    by = min(border_px, h // 4)
    bx = min(border_px, w // 4)
    out = bgr.copy()
    strips = [
        out[:by, :],
        out[-by:, :],
        out[:, :bx],
        out[:, -bx:],
    ]
    slices_coords: List[Tuple[slice, slice]] = [
        (slice(None, by), slice(None)),
        (slice(-by, None), slice(None)),
        (slice(None), slice(None, bx)),
        (slice(None), slice(-bx, None)),
    ]
    for strip, (sr, sc) in zip(strips, slices_coords):
        gray_strip = cv2.cvtColor(strip, cv2.COLOR_BGR2GRAY)
        if float(np.mean(gray_strip)) < 30.0:
            out[sr, sc] = 255
    return out


def _neutralize_colored_fills(bgr: np.ndarray) -> np.ndarray:
    """Replace clearly saturated non-white fills (e.g. redaction pink) with white."""
    if bgr.ndim != 3 or bgr.shape[2] != 3:
        return bgr
    out = bgr.copy()
    hsv = cv2.cvtColor(out, cv2.COLOR_BGR2HSV)
    s = hsv[:, :, 1].astype(np.int16)
    v = hsv[:, :, 2].astype(np.int16)
    mask = ((s > 60) & (v > 80) & (v < 220)).astype(np.uint8) * 255
    kernel = np.ones((3, 3), dtype=np.uint8)
    mask_dilated = cv2.dilate(mask, kernel, iterations=1)
    out[mask_dilated > 0] = (255, 255, 255)
    return out


def _normalize_light_on_dark(gray: np.ndarray) -> np.ndarray:
    """If the page looks like light glyphs on a dark background, invert to dark-on-light.

    Skipped for saturated colored panels: use :func:`preprocess_colored_dark_bg` / LAB path
    instead so green/orange syntax is not flattened before OCR.

    Polarity:

    - ``OCR_FORCE_POLARITY=invert`` / ``keep`` — force or forbid inversion.
    - Auto: median below ``OCR_INVERT_MEDIAN_MAX`` (default ``120``) and ``std >= 12``.
    """
    forced = os.environ.get("OCR_FORCE_POLARITY", "").strip().lower()
    if forced in ("keep", "none", "no", "original"):
        return gray
    if forced in ("invert", "1", "true", "yes"):
        return cv2.bitwise_not(gray)

    std = float(np.std(gray))
    if std < 12.0:
        return gray
    med = float(np.median(gray))
    max_dark = _env_float("OCR_INVERT_MEDIAN_MAX", 120.0)
    if med < max_dark:
        return cv2.bitwise_not(gray)
    return gray


def load_image_bgr(img_path: str) -> np.ndarray:
    """Load an image or PDF (first page only) as a BGR ``uint8`` numpy array.

    Raster images are read with OpenCV. PDFs are rendered via PyMuPDF
    (``OCR_PDF_DPI`` env, default 200).
    """
    path = Path(img_path)
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return _load_pdf_first_page_bgr(str(path))
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Could not read image file: {img_path}")
    return img


def _load_pdf_first_page_bgr(pdf_path: str) -> np.ndarray:
    """Render the first page of a PDF to a BGR image using PyMuPDF."""
    try:
        import fitz  # type: ignore[import-untyped]
    except ImportError as exc:  # pragma: no cover - guarded by requirements
        raise ImportError("PyMuPDF (pymupdf) is required for PDF inputs.") from exc

    dpi = int(os.environ.get("OCR_PDF_DPI", "200"))
    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)
    doc = fitz.open(pdf_path)
    try:
        page = doc.load_page(0)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
            pix.height, pix.width, pix.n
        )
    finally:
        doc.close()

    if arr.shape[2] == 4:
        arr = cv2.cvtColor(arr, cv2.COLOR_RGBA2BGR)
    elif arr.shape[2] == 3:
        arr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    else:
        arr = cv2.cvtColor(arr, cv2.COLOR_GRAY2BGR)
    return arr


def _deskew_pair(bgr: np.ndarray, gray: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """Apply the same rotation to BGR and grayscale (``_deskew_gray`` geometry on both)."""
    if gray.size == 0:
        return bgr, gray
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(thresh > 0))
    if coords.shape[0] < 5:
        return bgr, gray
    rect = cv2.minAreaRect(coords.astype(np.float32))
    angle = rect[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    if abs(angle) < 0.05:
        return bgr, gray
    h, w = gray.shape[:2]
    center = (w // 2, h // 2)
    rot_mat = cv2.getRotationMatrix2D(center, angle, 1.0)
    gray_rot = cv2.warpAffine(
        gray,
        rot_mat,
        (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )
    bgr_rot = cv2.warpAffine(
        bgr,
        rot_mat,
        (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )
    return bgr_rot, gray_rot


def _maybe_upscale_gray(gray: np.ndarray) -> np.ndarray:
    """Upscale narrow images before thresholding / neural OCR (thin fonts)."""
    h, w = gray.shape[:2]
    if w >= _MIN_UPSCALE_WIDTH:
        return gray
    return cv2.resize(
        gray,
        (w * _UPSCALE_FACTOR, h * _UPSCALE_FACTOR),
        interpolation=cv2.INTER_CUBIC,
    )


def _maybe_upscale_binary(binary: np.ndarray) -> np.ndarray:
    """Upscale binary output after thresholding (nearest neighbor avoids gray halos)."""
    h, w = binary.shape[:2]
    if w >= _MIN_UPSCALE_WIDTH:
        return binary
    return cv2.resize(
        binary,
        (w * _UPSCALE_FACTOR, h * _UPSCALE_FACTOR),
        interpolation=cv2.INTER_NEAREST,
    )


def _maybe_upscale_bgr(bgr: np.ndarray) -> np.ndarray:
    h, w = bgr.shape[:2]
    if w >= _MIN_UPSCALE_WIDTH:
        return bgr
    return cv2.resize(
        bgr,
        (w * _UPSCALE_FACTOR, h * _UPSCALE_FACTOR),
        interpolation=cv2.INTER_CUBIC,
    )


def _is_likely_light_ui_screenshot(gray: np.ndarray) -> bool:
    """Heuristic: bright background + moderate contrast (app / web screenshots)."""
    m = float(np.mean(gray))
    s = float(np.std(gray))
    return m > 185.0 and s < 85.0


def _ensure_dark_text_on_white(binary: np.ndarray) -> np.ndarray:
    """Tesseract expects dark glyphs on a light background (high = paper)."""
    if float(np.mean(binary)) < 127.0:
        return cv2.bitwise_not(binary)
    return binary


def _binarize_tesseract(gray: np.ndarray) -> np.ndarray:
    """Binarize for classical OCR: Otsu on light UI, adaptive elsewhere."""
    if _is_likely_light_ui_screenshot(gray):
        _, bin_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return _ensure_dark_text_on_white(bin_img)

    bin_img = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        9,
    )
    bin_img = _ensure_dark_text_on_white(bin_img)
    return cv2.medianBlur(bin_img, 3)


def _colored_dark_tesseract_from_panel_bgr(bgr_panel: np.ndarray) -> np.ndarray:
    """LAB **L** pipeline on an already-cropped BGR panel; returns binary for Tesseract."""
    lab = cv2.cvtColor(bgr_panel, cv2.COLOR_BGR2LAB)
    l_ch, _, _ = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l_enh = clahe.apply(l_ch)
    l_inv = cv2.bitwise_not(l_enh)
    _, binary = cv2.threshold(l_inv, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    binary = _ensure_dark_text_on_white(binary)
    return _maybe_upscale_binary(binary)


def _is_dark_panel_with_colored_text(bgr: np.ndarray) -> bool:
    """True only for truly dark, highly saturated syntax-style panels (not light medical forms)."""
    if bgr.ndim != 3 or bgr.shape[2] != 3:
        return False
    if float(np.mean(bgr)) > 180.0:
        return False
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    l_med = float(np.median(lab[:, :, 0]))
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    s_std = float(np.std(hsv[:, :, 1].astype(np.float32)))
    l_max = _env_float("OCR_COLOR_PANEL_L_MAX", 60.0)
    s_min = _env_float("OCR_COLOR_PANEL_S_STD_MIN", 50.0)
    return l_med < l_max and s_std > s_min


def debug_preprocess_path(img_path: str) -> Dict[str, Any]:
    """Return which preprocessing decisions were made, for debugging regressions."""
    bgr = load_image_bgr(img_path)
    bgr_cleaned = _clean_page_border(bgr)
    bgr_neutral = _neutralize_colored_fills(bgr_cleaned)
    gray = cv2.cvtColor(bgr_neutral, cv2.COLOR_BGR2GRAY)
    bgr_d, gray_d = _deskew_pair(bgr_neutral, gray)
    sl = _dark_panel_crop_slice(gray_d)
    gray_w = _apply_crop_slice(gray_d, sl)
    bgr_w = _apply_crop_slice(bgr_d, sl)
    med, p10, p25, p75, p90, std = _percentile_stats(gray_d)
    _ = p25, p75
    crop_serial: Optional[List[int]] = None if sl is None else [int(sl[0]), int(sl[1]), int(sl[2]), int(sl[3])]
    return {
        "image_size": [int(bgr.shape[0]), int(bgr.shape[1]), int(bgr.shape[2])],
        "gray_median": round(med, 1),
        "gray_std": round(std, 1),
        "gray_p10": round(p10, 1),
        "gray_p90": round(p90, 1),
        "looks_like_panel": _looks_like_mixed_light_chrome_dark_panel(gray_d),
        "crop_slice": crop_serial,
        "is_dark_colored_panel": _is_dark_panel_with_colored_text(bgr_w),
        "mean_bgr_after_crop": round(float(np.mean(bgr_w)), 1),
    }


def _preprocess_easyocr_colored_panel(bgr_panel: np.ndarray) -> np.ndarray:
    """CLAHE on LAB **L** only, merge back to BGR for EasyOCR (no global RGB grayscale)."""
    lab = cv2.cvtColor(bgr_panel, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l2 = clahe.apply(l_ch)
    merged = cv2.merge([l2, a_ch, b_ch])
    out = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    return _maybe_upscale_bgr(out)


def preprocess_colored_dark_bg(img_path: str) -> np.ndarray:
    """LAB luminance pipeline for dark, **saturated** UI panels (syntax-highlighted code).

    Loads BGR, deskews, crops the dark island when present, then: BGR→LAB, CLAHE on **L**,
    inverts **L** (dark page → light), Otsu, optional 2× upscale. Returns **binary** uint8
    suitable for Tesseract (same contract as :func:`preprocess_tesseract` default branch).
    """
    bgr = load_image_bgr(img_path)
    bgr = _clean_page_border(bgr)
    bgr = _neutralize_colored_fills(bgr)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    bgr_d, gray_d = _deskew_pair(bgr, gray)
    sl = _dark_panel_crop_slice(gray_d)
    panel_bgr = _apply_crop_slice(bgr_d, sl)
    return _colored_dark_tesseract_from_panel_bgr(panel_bgr)


def preprocess_tesseract(img_path: str) -> np.ndarray:
    """Pipeline tuned for Tesseract: deskew, optional dark-panel crop, then binarize.

    If the cropped panel is **dark and colorful** (syntax-highlighted code), runs
    the LAB path and skips grayscale invert + destructive binarization on flattened color.
    """
    bgr = load_image_bgr(img_path)
    bgr = _clean_page_border(bgr)
    bgr = _neutralize_colored_fills(bgr)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    bgr_d, gray_d = _deskew_pair(bgr, gray)
    sl = _dark_panel_crop_slice(gray_d)
    gray_w = _apply_crop_slice(gray_d, sl)
    bgr_w = _apply_crop_slice(bgr_d, sl)

    debug_on = os.environ.get("OCR_DEBUG_TRACEBACK", "").strip().lower() in ("1", "true", "yes")
    if debug_on:
        branch = "lab_colored_dark" if _is_dark_panel_with_colored_text(bgr_w) else "normal_grayscale_binarize"
        print(
            "[OCR preprocess_tesseract]",
            {"branch": branch, "crop_applied": sl is not None, "crop_slice": sl},
            file=sys.stderr,
        )

    if _is_dark_panel_with_colored_text(bgr_w):
        return _colored_dark_tesseract_from_panel_bgr(bgr_w)

    gray_n = _normalize_light_on_dark(gray_w)
    binary = _binarize_tesseract(gray_n)
    return _maybe_upscale_binary(binary)


def preprocess_easyocr(img_path: str) -> np.ndarray:
    """Mild pipeline for EasyOCR; uses LAB **L** CLAHE on saturated dark panels."""
    bgr = load_image_bgr(img_path)
    bgr = _clean_page_border(bgr)
    bgr = _neutralize_colored_fills(bgr)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    bgr_d, gray_d = _deskew_pair(bgr, gray)
    sl = _dark_panel_crop_slice(gray_d)
    gray_w = _apply_crop_slice(gray_d, sl)
    bgr_w = _apply_crop_slice(bgr_d, sl)

    debug_on = os.environ.get("OCR_DEBUG_TRACEBACK", "").strip().lower() in ("1", "true", "yes")
    if debug_on:
        branch = "lab_colored_dark" if _is_dark_panel_with_colored_text(bgr_w) else "normal_clahe_bgr"
        print(
            "[OCR preprocess_easyocr]",
            {"branch": branch, "crop_applied": sl is not None, "crop_slice": sl},
            file=sys.stderr,
        )

    if _is_dark_panel_with_colored_text(bgr_w):
        return _preprocess_easyocr_colored_panel(bgr_w)

    gray_n = _normalize_light_on_dark(gray_w)
    scaled = _maybe_upscale_gray(gray_n)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(scaled)
    smooth = cv2.bilateralFilter(enhanced, d=5, sigmaColor=40, sigmaSpace=40)
    return cv2.cvtColor(smooth, cv2.COLOR_GRAY2BGR)


def preprocess(img_path: str) -> np.ndarray:
    """Backward-compatible alias for :func:`preprocess_tesseract`."""
    return preprocess_tesseract(img_path)
