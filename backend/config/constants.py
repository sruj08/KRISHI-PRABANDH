"""RBAC role literals — stored as uppercase in DB, mapped to lowercase in API."""

STATE_AUTHORITY = "STATE_AUTHORITY"
DIVISIONAL_AUTHORITY = "DIVISIONAL_AUTHORITY"
DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
TALUKA_AUTHORITY = "TALUKA_AUTHORITY"
CIRCLE_AUTHORITY = "CIRCLE_AUTHORITY"
VILLAGE_AUTHORITY = "VILLAGE_AUTHORITY"
TALATHI = "TALATHI"
KRUSHI_SAHAYAK = "KRUSHI_SAHAYAK"
KRUSHI_MITRA = "KRUSHI_MITRA"
FARMER = "FARMER"

# Mapped lowercase versions used in JWT claims and frontend
ROLE_STATE = "state"
ROLE_DIVISION = "division"
ROLE_DISTRICT = "district"
ROLE_TAO = "tao"
ROLE_CAO = "cao"
ROLE_VILLAGE = "village"
ROLE_TALATHI = "talathi"
ROLE_SAHAYAK = "sahayak"
ROLE_MITRA = "mitra"
ROLE_FARMER = "farmer"

ALL_ROLES = frozenset(
    {
        ROLE_STATE,
        ROLE_DIVISION,
        ROLE_DISTRICT,
        ROLE_TAO,
        ROLE_CAO,
        ROLE_VILLAGE,
        ROLE_TALATHI,
        ROLE_SAHAYAK,
        ROLE_MITRA,
        ROLE_FARMER,
    }
)

HIERARCHY_ROLES = frozenset(
    {
        ROLE_STATE,
        ROLE_DIVISION,
        ROLE_DISTRICT,
        ROLE_TAO,
        ROLE_CAO,
        ROLE_VILLAGE,
    }
)
