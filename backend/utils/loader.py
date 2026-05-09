import os
from typing import Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
supabase: Client = create_client(url, key)

def fetch_all(table: str) -> list[dict]:
    # Supabase has a default limit of 1000 rows per request
    # To get all data, we paginate
    all_data = []
    page_size = 1000
    for i in range(10): # Max 10000 rows
        start = i * page_size
        end = start + page_size - 1
        res = supabase.table(table).select("*").range(start, end).execute()
        all_data.extend(res.data)
        if len(res.data) < page_size:
            break
    return all_data

# ── Applications ──────────────────────────────────────────────────────────────

def load_applications() -> list[dict]:
    return fetch_all("applications")

def save_applications(data: list[dict]) -> None:
    # Deprecated in favor of single-row updates, but implemented for compatibility if needed.
    # In Supabase, we should update individually instead of saving the whole array.
    pass

def find_by_id(application_id: str) -> dict | None:
    res = supabase.table("applications").select("*").eq("application_id", application_id).limit(1).execute()
    return res.data[0] if res.data else None


# ── Mandals ───────────────────────────────────────────────────────────────────

def load_mandals() -> list[dict]:
    return fetch_all("mandals")

def find_mandal_by_id(mandal_id: str) -> dict | None:
    res = supabase.table("mandals").select("*").eq("mandal_id", mandal_id).limit(1).execute()
    return res.data[0] if res.data else None


# ── Sahayaks ──────────────────────────────────────────────────────────────────

def load_sahayaks() -> list[dict]:
    return fetch_all("sahayaks")

def find_sahayak_by_id(sahayak_id: str) -> dict | None:
    res = supabase.table("sahayaks").select("*").eq("sahayak_id", sahayak_id).limit(1).execute()
    return res.data[0] if res.data else None

def get_sahayaks_by_mandal(mandal_id: str) -> list[dict]:
    res = supabase.table("sahayaks").select("*").eq("mandal_id", mandal_id).execute()
    return res.data


# ── Scoped application queries ────────────────────────────────────────────────

def get_applications_by_sahayak(sahayak_id: str) -> list[dict]:
    res = supabase.table("applications").select("*").eq("sahayak_id", sahayak_id).execute()
    return res.data

def get_applications_by_mandal(mandal_id: str) -> list[dict]:
    res = supabase.table("applications").select("*").eq("mandal_id", mandal_id).execute()
    return res.data


# ── Generic helper ────────────────────────────────────────────────────────────

def safe_get(record: dict, key: str, default: Any = "") -> Any:
    return record.get(key) or default
