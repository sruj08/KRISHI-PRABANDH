"""Remove probe / duplicate rows from earlier schema investigation.

Probe rows used non-deterministic UUIDs and may have created duplicates.
We keep only rows with deterministic UUIDs from seed.py.

Run after seed.py to clean up extras.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from db.supabase import get_supabase

sb = get_supabase()

# Deterministic UUID prefixes from seed.py
KEEP_PREFIXES = {
    "states":      "10000000-",
    "divisions":   "20000000-",
    "districts":   "30000000-",
    "talukas":     "41000000-",
    "circles":     "50000000-",
    "villages":    "60000000-",
    "users":       "70000000-",
    "farmer_profiles": "80000000-",
    "farms":       "a1000000-",
    "schemes":     "90000000-",
}

TO_DELETE = ["states","divisions","districts","talukas","circles","villages","users","farmer_profiles","farms","schemes"]

for table in TO_DELETE:
    prefix = KEEP_PREFIXES.get(table)
    if not prefix:
        continue
    try:
        all_rows = sb.table(table).select("id").execute()
        if not all_rows.data:
            continue
        ids = [r["id"] for r in all_rows.data if not str(r["id"]).startswith(prefix)]
        if not ids:
            continue
        for i in range(0, len(ids), 50):
            batch = ids[i:i+50]
            sb.table(table).delete().in_("id", batch).execute()
        print(f"{table}: deleted {len(ids)} probe row(s)")
    except Exception as e:
        print(f"{table}: ERROR - {str(e)[:80]}")

print("Cleanup complete.")
