"""
db/supabase.py  (stub — Supabase removed, kept for import safety)

All production code now uses db.json_store. This file is kept so that
any legacy import of `from db.supabase import get_supabase` fails loudly
rather than silently pulling in the removed dependency.
"""


def get_supabase():  # type: ignore[return]
    raise RuntimeError(
        "Supabase has been removed from this project. "
        "Use db.json_store instead."
    )


def clear_supabase_cache() -> None:
    pass  # no-op
