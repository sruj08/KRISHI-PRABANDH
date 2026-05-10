"""
Single Supabase client for the API process.

Uses the **service role** key — bypasses RLS. All authorization MUST be enforced
in FastAPI (middleware + services). Mirror critical rules in Supabase RLS for defense in depth.
"""

from functools import lru_cache
from typing import Optional

from supabase import Client, create_client

from config.settings import get_settings


@lru_cache
def get_supabase() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_role_key)


def clear_supabase_cache() -> None:
    """Test hook."""
    get_supabase.cache_clear()
