# KRISHI-PRABANDH — Backend Refactor: Audit & Architecture (Survey-Centric)

This document is the **principal-engineering record** for retiring the hackathon-era backend and operating as **enterprise workflow software** around:

**FARMER → FARM → SURVEY → EVIDENCE → APPROVAL → COMPENSATION**

---

## 1. Full backend audit (brutally honest)

### What existed (pre-refactor)

| Area | Finding |
|------|---------|
| **Data model** | Dominated by `applications`, `mandals`, `sahayaks`, `vistar_sessions`, GR parser coupling — **not** the survey workflow you now require. |
| **Persistence** | README still claimed JSON flat-file; code had **partial** Supabase in `app/db/client.py` using **frontend publishable keys** (`NEXT_PUBLIC_*`) — **wrong** for a server: no service role, RLS bypass risk, credential leakage pattern. |
| **Structure** | `app/api/v1/*` called `app/domain/*` with repositories sometimes **bypassed**; business rules mixed into routes (e.g. GR upload, MKA aggregations). |
| **Coupling** | `gr.py` imports `ApplicationRepository` — **survey workflow is not the spine**. |
| **Security** | No JWT, no RBAC middleware, no password verification layer in FastAPI — “stateless frontend LocalStorage” from README. |
| **Responses** | Inconsistent: some routes used ad-hoc `ok(data)` helpers; no global error schema. |
| **Ops** | `patch_applications.py`, `supabase_migration.sql` targeting **deprecated** tables — technical debt. |
| **Noise** | `backend/package.json` + Express/pg — **dead weight** next to FastAPI; `src/index.js` orphan. |
| **Tests** | No `tests/` package — regressions inevitable. |

### Verdict

The old backend was a **demo API + document parser + mandal dashboard feeds**, not a **geo-survey orchestration engine**. Keeping it “for compatibility” would **cement the wrong product**.

---

## 2. File-by-file cleanup plan (legacy)

| Path | Action |
|------|--------|
| `app/api/v1/applications.py` | **Delete** |
| `app/api/v1/mandals.py` | **Delete** |
| `app/api/v1/sahayaks.py` | **Delete** |
| `app/api/v1/mka.py` | **Delete** |
| `app/api/v1/insights.py` | **Delete** |
| `app/api/v1/logs.py` | **Delete** |
| `app/api/v1/gr.py` | **Delete** (GR re-build later as survey evidence AI step if needed) |
| `app/domain/applications/*` | **Delete** |
| `app/domain/mandals/*` | **Delete** |
| `app/domain/sahayaks/*` | **Delete** |
| `app/domain/vistar/*` | **Delete** |
| `app/domain/insights/*` | **Delete** |
| `app/domain/gr_parser/*` | **Delete** (reintroduce as `services/evidence_ai_service.py` when product owns scope) |
| `app/db/client.py` | **Delete** (replaced by `db/supabase.py` + settings) |
| `patch_applications.py` | **Delete** |
| `supabase_migration.sql` | **Replace** with `docs/sql/survey_schema_bootstrap.sql` (reference DDL aligned to your table list — adjust types in Supabase UI) |
| `backend/package.json`, `package-lock.json`, `src/index.js` | **Delete** (Python is the runtime) |

---

## 3. Folder restructuring (target)

```
backend/
├── api/                    # HTTP adapters only
├── services/               # All workflow + policy logic
├── db/
│   ├── supabase.py         # Single client factory
│   ├── queries/            # (optional) raw SQL / RPC helpers
│   └── repositories/       # Table-centric data access
├── schemas/                # Pydantic v2 models
├── middleware/             # JWT, RBAC, request logging
├── utils/                  # response envelope, geo, validators
├── config/                 # settings + constants (roles)
├── tests/
├── docs/sql/               # DDL reference for Supabase
├── main.py
├── requirements.txt
└── BACKEND_REFACTOR.md     # this file
```

---

## 4. API architecture (REST)

| Method | Path | Handler module |
|--------|------|------------------|
| GET | `/` | `api/health.py` |
| POST | `/auth/login` | `api/auth.py` |
| POST | `/auth/logout` | `api/auth.py` (client discards token; server audit optional) |
| GET | `/users/me` | `api/users.py` |
| GET | `/farmers/{id}` | `api/farmers.py` |
| GET | `/farms/{id}` | `api/farms.py` |
| GET | `/farmers/{farmer_id}/farms` | `api/farmers.py` |
| POST | `/surveys` | `api/surveys.py` |
| GET | `/surveys` | `api/surveys.py` |
| GET | `/surveys/{id}` | `api/surveys.py` |
| POST | `/surveys/{id}/evidence` | `api/surveys.py` |
| POST | `/surveys/{id}/approve` | `api/approvals.py` |
| GET | `/analytics/dashboard` | `api/analytics.py` |
| GET | `/analytics/weather` | `api/analytics.py` |
| GET | `/analytics/satellite` | `api/analytics.py` |
| GET | `/compensation/{survey_id}` | `api/compensation.py` |

**Note:** Frontend previously used `http://localhost:8000/api/v1/...`. New base URL is **`http://localhost:8000`**. A dedicated frontend migration should update `shared/api/client.js` and feature modules.

---

## 5. Service boundaries

| Service | Responsibility |
|---------|----------------|
| `auth_service` | Verify credentials (Supabase `users` or Auth), issue JWT, refresh policy hooks |
| `survey_service` | Create/list/get surveys; state machine; evidence attachment orchestration |
| `farm_service` | Resolve farms by farmer / id; jurisdiction filter |
| `approval_service` | Approve/reject/escalate; writes `survey_approvals` + `audit_logs` |
| `analytics_service` | Aggregate dashboard; delegates weather/satellite |
| `weather_service` | Read `weather_analytics` with filters |
| `satellite_service` | Read `satellite_analytics` with filters |
| `compensation_service` | Read `compensation_payments` by `survey_id` |
| `audit_service` | Central append to `audit_logs` |

Routes **never** import Supabase directly.

---

## 6. Dependency flow

```
HTTP Request
  → middleware/logging.py (request id, timing)
  → middleware/auth.py (optional JWT → request.state.user)
  → middleware/roles.py (Depends enforce hierarchy)
  → api/*.py (validate body/query → call service)
  → services/*.py (workflow)
  → db/repositories/*.py (CRUD)
  → db/supabase.py (single client)
```

---

## 7. Middleware structure

| Middleware | Role |
|------------|------|
| `logging.py` | Structured request/response logging; correlation ID |
| `auth.py` | Extract `Authorization: Bearer`, validate JWT, attach `UserContext` |
| `roles.py` | `require_roles(...)` dependency; **hierarchy scope** checks against `users` + geo tables |

---

## 8. RBAC implementation

- **Constants** in `config/constants.py`: `STATE_AUTHORITY`, `DIVISIONAL_AUTHORITY`, … `FARMER`.
- JWT payload claims (minimum): `sub` (user id), `role`, `state_id`, `division_id`, `district_id`, `taluka_id`, `circle_id`, `village_id` (nullable stack).
- **Rule:** every list/read/write must filter by **lowest assigned jurisdiction** (e.g. `TALUKA_AUTHORITY` → `WHERE taluka_id = :mine` on surveys joined through farm → village → circle → taluka).
- **Farmers** may only access **own** `farmer_profiles` / `farms` / `surveys` where `created_by` or ownership link matches.

*Full row-level enforcement should eventually mirror in **Supabase RLS**; FastAPI layer is the first gate.*

---

## 9. Supabase integration strategy

1. **One client** in `db/supabase.py` using **`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`** (server only, never `NEXT_PUBLIC_*`).
2. **Repositories** per aggregate: `SurveyRepository`, `FarmRepository`, `UserRepository`, `AuditRepository`, etc.
3. **PostGIS**: store geometry in `farms.boundary` (or `geom`); use RPC/SQL for heavy geo — add `db/queries/geo.sql` when needed.
4. **Migrations**: author in Supabase Dashboard or `supabase db diff`; keep **`docs/sql/`** as human-readable reference aligned to product.

---

## 10. Migration strategy

1. **Create** new tables in Supabase (your canonical list): hierarchy → users → farmer_profiles → farms → schemes → surveys → evidence → AI interviews → approvals → analytics → compensation → audit_logs.
2. **Backfill** scripts (one-off, not in repo until needed): map old `applications` → `surveys` only if legally allowed; otherwise **cold start**.
3. **Deploy** backend with new env vars; **cut** old routes.
4. **Frontend** phase: replace mandal/sahayak/application APIs with survey APIs.

---

## 11–14. Code modifications, deletes, creates, production improvements

- **Implemented** in this repository: modules under `api/`, `services/`, `schemas/`, `middleware/`, `db/`, `config/`, `utils/`, `tests/`, `docs/sql/`, `main.py`, `requirements.txt`, `.env.example`.
- **Deleted**: entire `backend/app/` tree, `patch_applications.py`, `supabase_migration.sql` (legacy applications FK script), `package.json` / `package-lock.json`, `src/index.js`.
- **Production hardening (next ops steps)**: TLS terminator in front of Uvicorn, secrets manager for `SUPABASE_SERVICE_ROLE_KEY` / `JWT_SECRET`, Supabase RLS mirroring API jurisdiction rules, rate limiting, structured log shipping, OpenTelemetry.

### Implementation status

- `pytest` smoke: `tests/test_health.py` (2 tests) passes with `.env` defaults from `tests/conftest.py`.
- **Frontend** still targets legacy `/api/v1/*` routes — a dedicated FE migration must repoint to `/auth`, `/surveys`, etc. (see §4).

---

## Honest gap list (post-merge)

- **GR PDF pipeline** removed — re-scope as **evidence ingestion** + `survey_ai_interviews` when PM specs it.
- **RLS policies** not SQL-generated here — must be applied in Supabase for defense in depth.
- **Integration tests** against a real Supabase project are still required before prod sign-off.
