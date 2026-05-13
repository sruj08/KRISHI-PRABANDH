# Seed Supabase with data matching actual table schemas.

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from db.supabase import get_supabase

sb = get_supabase()


def ins(table, data):
    try:
        sb.table(table).upsert(data, ignore_duplicates=False).execute()
        return True
    except Exception as e:
        print(f"  ERROR {table}: {str(e)[:200]}")
        return False


# =====================================================================
# UUIDs (deterministic, valid v4 format)
# =====================================================================
S_MH  = "10000000-0000-4000-a000-000000000001"
D_PUNE= "20000000-0000-4000-a000-000000000001"
DT_PNE= "30000000-0000-4000-a000-000000000001"
T_HVL = "41000000-0000-4000-a000-000000000001"
T_SHR = "41000000-0000-4000-a000-000000000002"
C_WGL = "50000000-0000-4000-a000-000000000001"
C_KDK = "50000000-0000-4000-a000-000000000002"

V_WGL = "60000000-0000-4000-a000-000000000001"
V_LHN = "60000000-0000-4000-a000-000000000002"
V_DHN = "60000000-0000-4000-a000-000000000003"
V_KHD = "60000000-0000-4000-a000-000000000004"
V_VGS = "60000000-0000-4000-a000-000000000005"
V_KSN = "60000000-0000-4000-a000-000000000006"
V_SHR = "60000000-0000-4000-a000-000000000007"
V_PBL = "60000000-0000-4000-a000-000000000008"

U_STATE = "70000000-0000-4000-a000-000000000001"
U_DIV   = "70000000-0000-4000-a000-000000000002"
U_DIST  = "70000000-0000-4000-a000-000000000003"
U_TAO   = "70000000-0000-4000-a000-000000000004"
U_CAO   = "70000000-0000-4000-a000-000000000005"
U_CAO2  = "70000000-0000-4000-a000-000000000006"
U_SH1   = "70000000-0000-4000-a000-000000000007"
U_SH2   = "70000000-0000-4000-a000-000000000008"
U_SH3   = "70000000-0000-4000-a000-000000000009"

S_PMK   = "90000000-0000-4000-a000-000000000001"
S_DRIP  = "90000000-0000-4000-a000-000000000002"
S_SEED  = "90000000-0000-4000-a000-000000000003"
S_PMFBY = "90000000-0000-4000-a000-000000000004"
S_TRAC  = "90000000-0000-4000-a000-000000000005"
S_SPR   = "90000000-0000-4000-a000-000000000006"
S_HARV  = "90000000-0000-4000-a000-000000000007"
S_EPMP  = "90000000-0000-4000-a000-000000000008"

FP_IDS = [f"80000000-0000-4000-a000-000000000{i:03d}" for i in range(1, 37)]

# =====================================================================
# 1. HIERARCHY
# =====================================================================
print("1. Hierarchy tables...")
ins("states",    {"id": S_MH, "name": "Maharashtra"})
ins("divisions", {"id": D_PUNE, "state_id": S_MH, "name": "Pune Division"})
ins("districts", {"id": DT_PNE, "division_id": D_PUNE, "name": "Pune"})
ins("talukas",   {"id": T_HVL, "district_id": DT_PNE, "name": "Haveli"})
ins("talukas",   {"id": T_SHR, "district_id": DT_PNE, "name": "Shirur"})
ins("circles",   {"id": C_WGL, "taluka_id": T_HVL, "name": "Wagholi Circle"})
ins("circles",   {"id": C_KDK, "taluka_id": T_SHR, "name": "Khadakwasla Circle"})

for vid, cid, name in [
    (V_WGL, C_WGL, "Wagholi"), (V_LHN, C_WGL, "Lohegaon"),
    (V_DHN, C_WGL, "Dhanori"), (V_KHD, C_WGL, "Kharadi"),
    (V_VGS, C_WGL, "Vadgaon Sheri"), (V_KSN, C_WGL, "Kesnand"),
    (V_SHR, C_KDK, "Shirur"), (V_PBL, C_KDK, "Pabal"),
]:
    ins("villages", {"id": vid, "circle_id": cid, "name": name})

# =====================================================================
# 2. SCHEMES
# =====================================================================
print("2. Schemes...")
for sid, sname in [
    (S_PMK, "PM-KUSUM Solar Pump Yojana"),
    (S_DRIP, "Drip Irrigation (NHM)"),
    (S_SEED, "Seed Subsidy (Rabi)"),
    (S_PMFBY, "Crop Insurance (PMFBY)"),
    (S_TRAC, "Tractor Subsidy"),
    (S_SPR, "Sprinkler Set"),
    (S_HARV, "Harvester Subsidy"),
    (S_EPMP, "Electric Pump"),
]:
    ins("schemes", {"id": sid, "scheme_name": sname})

# =====================================================================
# 3. USERS
# =====================================================================
print("3. Users...")
import bcrypt
pw_hash = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()

for uid, email, role, name in [
    (U_STATE, "state@krishi.gov.in", "STATE_AUTHORITY", "Dr. Suhas Diwase"),
    (U_DIV,   "div@krishi.gov.in", "DIVISIONAL_AUTHORITY", "Vikram Kumar"),
    (U_DIST,  "district@krishi.gov.in", "DISTRICT_AUTHORITY", "Dr. Meera Kulkarni"),
    (U_TAO,   "tao@krishi.gov.in", "TALUKA_AUTHORITY", "Suresh Deshmukh"),
    (U_CAO,   "cao@krishi.gov.in", "CIRCLE_AUTHORITY", "Rajendra Kulkarni"),
    (U_CAO2,  "cao2@krishi.gov.in", "CIRCLE_AUTHORITY", "Prakash Shinde"),
    (U_SH1,   "sahayak1@krishi.gov.in", "KRUSHI_SAHAYAK", "Suresh Mane"),
    (U_SH2,   "sahayak2@krishi.gov.in", "KRUSHI_SAHAYAK", "Anil Shinde"),
    (U_SH3,   "sahayak3@krishi.gov.in", "KRUSHI_SAHAYAK", "Priya Desai"),
]:
    ins("users", {
        "id": uid, "email": email, "password_hash": pw_hash,
        "role": role, "name": name, "is_active": True,
    })

# =====================================================================
# 4. FARMER PROFILES
# =====================================================================
print("4. Farmer profiles...")
village_assign = [
    V_SHR, V_SHR, V_SHR, V_SHR, V_SHR, V_SHR, V_PBL, V_KSN,
    V_SHR, V_SHR, V_SHR, V_SHR, V_PBL, V_SHR, V_SHR, V_SHR,
    V_SHR, V_SHR, V_PBL, V_SHR, V_WGL, V_KSN, V_WGL, V_WGL,
    V_WGL, V_WGL, V_DHN, V_WGL, V_LHN, V_WGL, V_WGL, V_SHR,
    V_WGL, V_WGL, V_WGL, V_WGL,
]
farmer_names = [
    "Ramesh Gaikwad","Suresh Jadhav","Dilip Pawar","Mangesh Shinde",
    "Nilesh Aher","Vijay Gurav","Rajendra More","Sandip Kshirsagar",
    "Ganesh Sathe","Prakash Kharat","Sunil Dhumal","Deepak Tandale",
    "Baban Suryavanshi","Kailas Wagh","Hanumant Bhoite","Shivaji Dike",
    "Ankush Khillare","Tukaram Vairal","Yogesh Bhosale","Sachin Zende",
    "Mahesh Kakade","Arun Shitole","Sandip Shelar","Amol Kate",
    "Dattatray Kulkarni","Abhijit Joshi","Shrikant Deshmukh","Vishal Patil",
    "Rohan Kadam","Siddharth Kamble","Akshay Wagh","Pravin Bansode",
    "Hrishikesh Bhosale","Sagar Shinde","Prasad Takale","Kiran Ugale",
]
farmer_cats = ["Open","OBC","SC","ST"]
emails = [f"farmer{1001+i}@krishi.gov.in" for i in range(36)]

for i, vid in enumerate(village_assign):
    fp = {
        "id": FP_IDS[i],
        "farmer_id_external": f"MH-{1001+i}",
        "agristack_id": f"MH-{1001+i}",
        "village_id": vid,
        "name": farmer_names[i],
        "category": farmer_cats[i % 4],
    }
    try:
        fp["email"] = emails[i]
    except Exception:
        pass
    ins("farmer_profiles", fp)

# =====================================================================
# 5. FARMS
# =====================================================================
print("5. Farms...")
farms_data = [
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
for i, (fp_id, gat, area, vid) in enumerate(farms_data, 1):
    ins("farms", {
        "id": f"a1000000-0000-4000-a000-{i:04d}00000000",
        "farmer_id": fp_id,
        "gat_number": gat,
        "farm_area_hectare": area,
        "village_id": vid,
    })

# =====================================================================
# VERIFY
# =====================================================================
print("\nSeed complete!\n")
for table in ['states','divisions','districts','talukas','circles','villages','users','farmer_profiles','farms','schemes']:
    try:
        r = sb.table(table).select('*', count='exact').limit(1).execute()
        print(f"  {table}: {r.count} rows")
    except Exception as e:
        print(f"  {table}: ERROR - {str(e)[:60]}")
