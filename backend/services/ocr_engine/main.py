"""ASGI entry for Uvicorn when started from ``backend/``.

``api.py`` uses package-relative imports, so the app must be loaded as
``backend.api``. This module adds the repo root to ``sys.path`` then
re-exports ``app``, so this works::

    cd backend
    uvicorn main:app --reload

Prefer from repo root (no path hacks)::

    python -m uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
"""

from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from backend.api import app  # noqa: E402

__all__ = ["app"]
