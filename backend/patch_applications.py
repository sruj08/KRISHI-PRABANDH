"""
patch_applications.py
Adds mandal_id and sahayak_id to every record in applications.json
using a deterministic round-robin assignment across 6 sahayaks.
Safe to re-run: skips records that already have the field set.
"""
import json
import os

BASE = os.path.dirname(__file__)
APPS_PATH  = os.path.join(BASE, "data", "applications.json")

# Ordered sahayak → mandal mapping (must match sahayaks.json exactly)
SAHAYAK_MANDAL = [
    ("S001", "M001"),
    ("S002", "M001"),
    ("S003", "M002"),
    ("S004", "M002"),
    ("S005", "M003"),
    ("S006", "M003"),
]

def main():
    with open(APPS_PATH, "r", encoding="utf-8") as f:
        apps = json.load(f)

    changed = 0
    for i, app in enumerate(apps):
        if "sahayak_id" not in app:
            sid, mid = SAHAYAK_MANDAL[i % len(SAHAYAK_MANDAL)]
            app["sahayak_id"] = sid
            app["mandal_id"]  = mid
            changed += 1

    with open(APPS_PATH, "w", encoding="utf-8") as f:
        json.dump(apps, f, indent=2, ensure_ascii=False)

    print(f"Patched {changed} records.  Total: {len(apps)}")

if __name__ == "__main__":
    main()
