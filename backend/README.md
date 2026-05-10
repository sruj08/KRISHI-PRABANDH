# KRISHI-PRABANDH — Backend (FastAPI + Supabase)

Survey-centric workflow: **FARMER → FARM → SURVEY → EVIDENCE → APPROVAL → COMPENSATION**.

See `BACKEND_REFACTOR.md` for the audit, boundaries, and migration notes.

## Stack

- FastAPI, Pydantic v2, Uvicorn  
- Supabase (PostgreSQL) via **service role** server key  
- JWT auth (HS256) issued by this API  

## Setup

```bash
cd backend
cp .env.example .env   # fill SUPABASE_* and JWT_SECRET
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- OpenAPI: `http://localhost:8000/docs`  
- Health: `GET /healthz`

## Layout

```
api/           # Routers — validation + service calls only
services/      # Workflow & policy
db/            # Supabase client + repositories
schemas/       # Pydantic models
middleware/    # JWT, RBAC helpers, request logging
config/        # Settings & role constants
utils/         # Response envelope, helpers
docs/sql/      # Reference DDL
tests/
```

## Environment

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key (bypasses RLS — enforce auth in API) |
| `JWT_SECRET` | Signing key for API JWTs |
| `CORS_ORIGINS` | Comma-separated browser origins |

Legacy JSON loaders, `applications`, `mandals`, `sahayaks`, and MKA/GR routes have been **removed**.
