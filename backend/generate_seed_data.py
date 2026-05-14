"""
generate_seed_data.py
=====================
Run once to populate backend/data/*.json with demo data.
Safe to re-run: only writes files that don't exist yet (--force to overwrite).

Usage:
    cd backend
    python generate_seed_data.py           # skip existing files
    python generate_seed_data.py --force   # overwrite all
"""

import json
import os
import sys
from pathlib import Path

import bcrypt

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

FORCE = "--force" in sys.argv

# ── helpers ──────────────────────────────────────────────────────────────────

def write(filename: str, data: list) -> None:
    path = DATA_DIR / filename
    if path.exists() and not FORCE:
        print(f"  SKIP  {filename} (already exists, use --force to overwrite)")
        return
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  WROTE {filename} ({len(data)} rows)")


PW = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()

# ── UUIDs ────────────────────────────────────────────────────────────────────

S_MH   = "10000000-0000-4000-a000-000000000001"
D_PUNE = "20000000-0000-4000-a000-000000000001"
DT_PNE = "30000000-0000-4000-a000-000000000001"
T_HVL  = "41000000-0000-4000-a000-000000000001"
T_SHR  = "41000000-0000-4000-a000-000000000002"
C_WGL  = "50000000-0000-4000-a000-000000000001"
C_KDK  = "50000000-0000-4000-a000-000000000002"

V_WGL  = "60000000-0000-4000-a000-000000000001"
V_LHN  = "60000000-0000-4000-a000-000000000002"
V_DHN  = "60000000-0000-4000-a000-000000000003"
V_KHD  = "60000000-0000-4000-a000-000000000004"
V_VGS  = "60000000-0000-4000-a000-000000000005"
V_KSN  = "60000000-0000-4000-a000-000000000006"
V_SHR  = "60000000-0000-4000-a000-000000000007"
V_PBL  = "60000000-0000-4000-a000-000000000008"

U_STATE = "70000000-0000-4000-a000-000000000001"
U_DIV   = "70000000-0000-4000-a000-000000000002"
U_DIST  = "70000000-0000-4000-a000-000000000003"
U_TAO   = "70000000-0000-4000-a000-000000000004"
U_CAO   = "70000000-0000-4000-a000-000000000005"
U_CAO2  = "70000000-0000-4000-a000-000000000006"
U_SH1   = "70000000-0000-4000-a000-000000000007"
U_SH2   = "70000000-0000-4000-a000-000000000008"
U_SH3   = "70000000-0000-4000-a000-000000000009"

FP_IDS = [f"80000000-0000-4000-a000-{i:015d}" for i in range(1, 37)]

# ── 1. users ─────────────────────────────────────────────────────────────────

print("Generating users...")
users = [
    {"id": U_STATE, "email": "state@krishi.gov.in",    "password_hash": PW, "role": "STATE_AUTHORITY",      "name": "Dr. Suhas Diwase",    "is_active": True, "state_id": S_MH},
    {"id": U_DIV,   "email": "div@krishi.gov.in",      "password_hash": PW, "role": "DIVISIONAL_AUTHORITY", "name": "Vikram Kumar",        "is_active": True, "state_id": S_MH, "division_id": D_PUNE},
    {"id": U_DIST,  "email": "district@krishi.gov.in", "password_hash": PW, "role": "DISTRICT_AUTHORITY",   "name": "Dr. Meera Kulkarni",  "is_active": True, "state_id": S_MH, "division_id": D_PUNE, "district_id": DT_PNE},
    {"id": U_TAO,   "email": "tao@krishi.gov.in",      "password_hash": PW, "role": "TALUKA_AUTHORITY",     "name": "Suresh Deshmukh",     "is_active": True, "state_id": S_MH, "division_id": D_PUNE, "district_id": DT_PNE, "taluka_id": T_HVL},
    {"id": U_CAO,   "email": "cao@krishi.gov.in",      "password_hash": PW, "role": "CIRCLE_AUTHORITY",     "name": "Rajendra Kulkarni",   "is_active": True, "state_id": S_MH, "division_id": D_PUNE, "district_id": DT_PNE, "taluka_id": T_HVL, "circle_id": C_WGL},
    {"id": U_CAO2,  "email": "cao2@krishi.gov.in",     "password_hash": PW, "role": "CIRCLE_AUTHORITY",     "name": "Prakash Shinde",      "is_active": True, "state_id": S_MH, "division_id": D_PUNE, "district_id": DT_PNE, "taluka_id": T_SHR, "circle_id": C_KDK},
    {"id": U_SH1,   "email": "sahayak1@krishi.gov.in", "password_hash": PW, "role": "KRUSHI_SAHAYAK",       "name": "Suresh Mane",         "is_active": True, "state_id": S_MH, "division_id": D_PUNE, "district_id": DT_PNE, "taluka_id": T_HVL, "circle_id": C_WGL, "village_id": V_WGL},
    {"id": U_SH2,   "email": "sahayak2@krishi.gov.in", "password_hash": PW, "role": "KRUSHI_SAHAYAK",       "name": "Anil Shinde",         "is_active": True, "state_id": S_MH, "division_id": D_PUNE, "district_id": DT_PNE, "taluka_id": T_HVL, "circle_id": C_WGL, "village_id": V_DHN},
    {"id": U_SH3,   "email": "sahayak3@krishi.gov.in", "password_hash": PW, "role": "KRUSHI_SAHAYAK",       "name": "Priya Desai",         "is_active": True, "state_id": S_MH, "division_id": D_PUNE, "district_id": DT_PNE, "taluka_id": T_SHR, "circle_id": C_KDK, "village_id": V_SHR},
]
write("users.json", users)

# ── 2. farmer_profiles ───────────────────────────────────────────────────────

print("Generating farmer_profiles...")
village_assign = [
    V_SHR, V_SHR, V_SHR, V_SHR, V_SHR, V_SHR, V_PBL, V_KSN,
    V_SHR, V_SHR, V_SHR, V_SHR, V_PBL, V_SHR, V_SHR, V_SHR,
    V_SHR, V_SHR, V_PBL, V_SHR, V_WGL, V_KSN, V_WGL, V_WGL,
    V_WGL, V_WGL, V_DHN, V_WGL, V_LHN, V_WGL, V_WGL, V_SHR,
    V_WGL, V_WGL, V_WGL, V_WGL,
]
farmer_names = [
    "Ramesh Gaikwad", "Suresh Jadhav", "Dilip Pawar", "Mangesh Shinde",
    "Nilesh Aher", "Vijay Gurav", "Rajendra More", "Sandip Kshirsagar",
    "Ganesh Sathe", "Prakash Kharat", "Sunil Dhumal", "Deepak Tandale",
    "Baban Suryavanshi", "Kailas Wagh", "Hanumant Bhoite", "Shivaji Dike",
    "Ankush Khillare", "Tukaram Vairal", "Yogesh Bhosale", "Sachin Zende",
    "Mahesh Kakade", "Arun Shitole", "Sandip Shelar", "Amol Kate",
    "Dattatray Kulkarni", "Abhijit Joshi", "Shrikant Deshmukh", "Vishal Patil",
    "Rohan Kadam", "Siddharth Kamble", "Akshay Wagh", "Pravin Bansode",
    "Hrishikesh Bhosale", "Sagar Shinde", "Prasad Takale", "Kiran Ugale",
]
farmer_cats = ["Open", "OBC", "SC", "ST"]
farmers = []
for i, vid in enumerate(village_assign):
    farmers.append({
        "id": FP_IDS[i],
        "farmer_id_external": f"MH-{1001 + i}",
        "agristack_id": f"MH-{1001 + i}",
        "village_id": vid,
        "name": farmer_names[i],
        "category": farmer_cats[i % 4],
        "email": f"farmer{1001 + i}@krishi.gov.in",
        "phone": f"98{1000000 + i:07d}",
    })
write("farmer_profiles.json", farmers)

# ── 3. farms ─────────────────────────────────────────────────────────────────

print("Generating farms...")
farms_raw = [
    (FP_IDS[0],  "GN-145-A", 3.2, V_SHR),
    (FP_IDS[21], "GN-332-B", 1.8, V_KSN),
    (FP_IDS[22], "GN-889-C", 2.1, V_WGL),
    (FP_IDS[23], "GN-201-F", 1.2, V_WGL),
    (FP_IDS[24], "GN-555-G", 0.8, V_WGL),
    (FP_IDS[25], "GN-677-H", 1.5, V_WGL),
    (FP_IDS[26], "GN-741-J", 2.3, V_DHN),
    (FP_IDS[28], "GN-113-L", 0.5, V_LHN),
    (FP_IDS[29], "GN-332-B", 1.8, V_WGL),
    (FP_IDS[30], "GN-445-M", 0.3, V_WGL),
]
farms = []
for i, (fp_id, gat, area, vid) in enumerate(farms_raw, 1):
    farms.append({
        "id": f"a1000000-0000-4000-a000-{i:04d}00000000",
        "farmer_id": fp_id,
        "gat_number": gat,
        "farm_area_hectare": area,
        "village_id": vid,
    })
write("farms.json", farms)

# ── 4. empty operational tables (preserve if exist) ──────────────────────────

print("Generating empty operational tables (if needed)...")
for fname in [
    "surveys.json",
    "survey_evidence.json",
    "survey_approvals.json",
    "compensation_payments.json",
    "audit_logs.json",
    "weather_analytics.json",
    "satellite_analytics.json",
]:
    path = DATA_DIR / fname
    if not path.exists():
        path.write_text("[]", encoding="utf-8")
        print(f"  INIT  {fname}")
    else:
        print(f"  KEEP  {fname} (existing data preserved)")

print("\nSeed complete! All data written to backend/data/")
print("\nLogin credentials (all passwords: password123):")
print("  state@krishi.gov.in  -> STATE_AUTHORITY")
print("  div@krishi.gov.in    -> DIVISIONAL_AUTHORITY")
print("  district@krishi.gov.in -> DISTRICT_AUTHORITY")
print("  tao@krishi.gov.in    -> TALUKA_AUTHORITY")
print("  cao@krishi.gov.in    -> CIRCLE_AUTHORITY")
print("  cao2@krishi.gov.in   -> CIRCLE_AUTHORITY")
print("  sahayak1@krishi.gov.in -> KRUSHI_SAHAYAK")
print("  sahayak2@krishi.gov.in -> KRUSHI_SAHAYAK")
print("  sahayak3@krishi.gov.in -> KRUSHI_SAHAYAK")
