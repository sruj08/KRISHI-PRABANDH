"""Heuristic table-style layout from Tesseract ``image_to_data`` (words + rows[][]).

Tesseract has no native table API: we cluster word boxes into rows (vertical overlap)
and columns (horizontal gaps or optional 1-D k-means on x-centers). Merged PDF cells,
nested tables, and heavy skew are not modeled—tune ``OCR_TABLE_*`` env vars or fall back
to ``raw_text`` only.

Layout is only filled when the primary OCR engine was Tesseract (same preprocess pass).
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List

import numpy as np
import pytesseract
from PIL import Image

from . import engines
from .preprocessor import preprocess_tesseract

__all__ = ["layout_from_path"]


@dataclass(frozen=True)
class _Word:
    text: str
    conf: int
    left: int
    top: int
    width: int
    height: int

    @property
    def right(self) -> int:
        return self.left + self.width

    @property
    def bottom(self) -> int:
        return self.top + self.height

    @property
    def cx(self) -> float:
        return self.left + 0.5 * self.width


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def _median(vals: List[float]) -> float:
    if not vals:
        return 1.0
    a = sorted(vals)
    m = len(a) // 2
    if len(a) % 2:
        return float(a[m])
    return 0.5 * (a[m - 1] + a[m])


def _parse_words(data: Dict[str, Any], min_conf: int) -> List[_Word]:
    texts = data.get("text") or []
    confs = data.get("conf") or []
    lefts = data.get("left") or []
    tops = data.get("top") or []
    widths = data.get("width") or []
    heights = data.get("height") or []
    n = min(len(texts), len(confs), len(lefts), len(tops), len(widths), len(heights))
    out: List[_Word] = []
    for i in range(n):
        t = str(texts[i] or "").strip()
        if not t:
            continue
        try:
            c = int(float(confs[i]))
        except (TypeError, ValueError):
            continue
        if c < min_conf:
            continue
        try:
            left = max(0, int(lefts[i]))
            top = max(0, int(tops[i]))
            w = max(0, int(widths[i]))
            h = max(0, int(heights[i]))
        except (TypeError, ValueError):
            continue
        if w < 1 or h < 1:
            continue
        out.append(_Word(text=t, conf=c, left=left, top=top, width=w, height=h))
    return out


def _cluster_rows(words: List[_Word], pad_frac: float) -> List[List[_Word]]:
    """Greedy rows by vertical overlap with row envelope + padding (fraction of median height)."""
    if not words:
        return []
    heights = [float(w.height) for w in words]
    med_h = max(1.0, _median(heights))
    pad = pad_frac * med_h
    ordered = sorted(words, key=lambda w: (w.top + w.bottom) / 2.0)
    rows: List[List[_Word]] = []
    for w in ordered:
        placed = False
        for row in rows:
            y_min = min(x.top for x in row)
            y_max = max(x.bottom for x in row)
            if not (w.bottom < y_min - pad or w.top > y_max + pad):
                row.append(w)
                placed = True
                break
        if not placed:
            rows.append([w])
    rows.sort(key=lambda r: min(x.top for x in r))
    for row in rows:
        row.sort(key=lambda x: x.left)
    return rows


def _row_to_cells_gap(row: List[_Word], gap_frac: float) -> List[str]:
    """Split one row into cells by horizontal gaps vs median word width."""
    if not row:
        return []
    widths = [float(w.width) for w in row]
    med_w = max(1.0, _median(widths))
    gap_need = gap_frac * med_w
    cells: List[List[_Word]] = []
    cur: List[_Word] = [row[0]]
    for prev, w in zip(row, row[1:]):
        if w.left - prev.right > gap_need:
            cells.append(cur)
            cur = [w]
        else:
            cur.append(w)
    cells.append(cur)
    return [" ".join(c.text for c in cell).strip() for cell in cells]


def _kmeans1d(xs: np.ndarray, k: int, iters: int = 25) -> np.ndarray:
    """Return cluster id 0..k-1 per point (``xs`` 1-D float)."""
    n = int(xs.shape[0])
    if n == 0 or k < 1:
        return np.zeros(0, dtype=np.int32)
    if k == 1:
        return np.zeros(n, dtype=np.int32)
    lo, hi = float(np.min(xs)), float(np.max(xs))
    if lo >= hi:
        return np.zeros(n, dtype=np.int32)
    cents = np.linspace(lo, hi, k)
    for _ in range(iters):
        dist = np.abs(xs.reshape(-1, 1) - cents.reshape(1, -1))
        lab = np.argmin(dist, axis=1)
        new = np.array([float(xs[lab == j].mean()) if np.any(lab == j) else cents[j] for j in range(k)])
        if np.max(np.abs(new - cents)) < 1e-3:
            break
        cents = new
    dist = np.abs(xs.reshape(-1, 1) - cents.reshape(1, -1))
    return np.argmin(dist, axis=1).astype(np.int32)


def _rows_to_grid_kmeans(rows: List[List[_Word]], k: int) -> List[List[str]]:
    """Assign every word to one of ``k`` x-buckets; build ragged matrix."""
    flat = [w for r in rows for w in r]
    if not flat or k < 1:
        return [[] for _ in rows]
    xs = np.array([w.cx for w in flat], dtype=np.float64)
    labels = _kmeans1d(xs, k)
    idx = 0
    grid: List[List[str]] = []
    for row in rows:
        buckets: List[List[str]] = [[] for _ in range(k)]
        for w in row:
            j = int(labels[idx])
            idx += 1
            buckets[j].append(w.text)
        grid.append([" ".join(b).strip() for b in buckets])
    return grid


def layout_from_path(img_path: str) -> Dict[str, Any]:
    """Run Tesseract ``image_to_data`` on ``preprocess_tesseract`` output; return words + rows.

    Env (optional, code comments are the doc):

    - ``OCR_TABLE_MIN_CONF`` — min Tesseract word confidence (default ``0``).
    - ``OCR_TABLE_ROW_PAD_FRAC`` — vertical merge padding as fraction of median word height
      (default ``0.35``).
    - ``OCR_TABLE_COL_GAP_FRAC`` — horizontal gap to split columns, vs median word width
      (default ``0.45``); used when ``OCR_TABLE_COL_MODE=gap`` (default).
    - ``OCR_TABLE_COL_MODE`` — ``gap`` (default) or ``kmeans``.
    - ``OCR_TABLE_NUM_COLS`` — fixed column count for ``kmeans`` mode (``>= 1``); if unset in
      kmeans mode, falls back to ``gap``.
    """
    if not engines.tesseract_available():
        return {"words": [], "rows": []}

    engines.configure_tesseract_cmd()
    lang = os.environ.get("OCR_TESSERACT_LANG", "eng").strip() or "eng"
    min_conf = _env_int("OCR_TABLE_MIN_CONF", 0)
    row_pad = _env_float("OCR_TABLE_ROW_PAD_FRAC", 0.35)
    col_gap = _env_float("OCR_TABLE_COL_GAP_FRAC", 0.45)
    col_mode = os.environ.get("OCR_TABLE_COL_MODE", "gap").strip().lower() or "gap"
    num_cols = _env_int("OCR_TABLE_NUM_COLS", 0)

    processed = preprocess_tesseract(img_path)
    pil_img = Image.fromarray(processed)
    cfg = engines.tesseract_ocr_options()
    data = pytesseract.image_to_data(
        pil_img,
        lang=lang,
        config=cfg,
        output_type=pytesseract.Output.DICT,
    )
    words = _parse_words(data, min_conf)
    serializable = [
        {
            "text": w.text,
            "conf": w.conf,
            "left": w.left,
            "top": w.top,
            "width": w.width,
            "height": w.height,
        }
        for w in words
    ]

    row_groups = _cluster_rows(words, row_pad)
    if col_mode == "kmeans" and num_cols >= 1:
        rows_cells = _rows_to_grid_kmeans(row_groups, num_cols)
    else:
        rows_cells = [_row_to_cells_gap(r, col_gap) for r in row_groups]

    return {"words": serializable, "rows": rows_cells}
