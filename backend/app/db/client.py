import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")

if not url or not key:
    raise ValueError("Missing Supabase credentials in .env")

supabase: Client = create_client(url, key)

def fetch_all(table: str) -> list[dict]:
    """Helper to paginate through an entire Supabase table."""
    all_data = []
    page_size = 1000
    for i in range(10): # Max 10,000 rows
        start = i * page_size
        end = start + page_size - 1
        res = supabase.table(table).select("*").range(start, end).execute()
        all_data.extend(res.data)
        if len(res.data) < page_size:
            break
    return all_data
