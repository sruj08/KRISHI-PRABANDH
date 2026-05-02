# KrishiPrabandh — Backend (FastAPI)

A production-style FastAPI backend serving the KrishiPrabandh agricultural scheme processing platform. Uses a JSON flat-file as its data store for portability.

---

## Stack

- **Framework**: FastAPI + Uvicorn
- **Language**: Python 3.11+
- **Data store**: `data/applications.json` (read/write via `utils/loader.py`)
- **Auth**: Stateless (frontend handles session via LocalStorage)

---

## Directory Structure

```
backend/
├── main.py                  # FastAPI app, CORS middleware, router registration
├── requirements.txt         # Python dependencies
│
├── routes/
│   ├── applications.py      # CRUD + status updates + photo upload
│   ├── insights.py          # Summary stats, priority list, fraud alerts
│   └── logs.py              # Audit log read/write
│
├── services/
│   ├── workflow.py          # Status transition rules & validation
│   └── fraud.py             # Fraud detection heuristics
│
├── models/
│   └── schemas.py           # Pydantic request/response models
│
├── utils/
│   └── loader.py            # load_applications / save_applications / find_by_id
│
└── data/
    └── applications.json    # Live flat-file database (source of truth)
```

---

## Running Locally

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- API base: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Key Routes

### Applications — `/applications`

| Method | Path                              | Description                              |
|--------|-----------------------------------|------------------------------------------|
| GET    | `/applications`                   | List all (supports `status`, `component`, `scheme_category`, `farmer_id`, `limit`, `offset` filters) |
| GET    | `/applications/{id}`              | Fetch single application + allowed transitions |
| POST   | `/applications/{id}/status`       | Update status (`new_status`, `remarks`)  |
| POST   | `/applications/{id}/upload-photo` | Upload field photo (`multipart/form-data`: `file`, optional `remarks`) |

### Insights — `/insights`

| Method | Path                        | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/insights/summary`         | Counts by status, recent activity  |
| GET    | `/insights/priority`        | Priority-ranked application list   |
| GET    | `/insights/priority/high`   | HIGH priority applications only    |
| GET    | `/insights/eligible-farmers`| Farmers eligible for schemes       |
| GET    | `/insights/fraud-alerts`    | Fraud-flagged applications         |

### Logs — `/logs`

| Method | Path    | Description             |
|--------|---------|-------------------------|
| GET    | `/logs` | Fetch audit log entries |
| POST   | `/logs` | Append a log entry      |

---

## Photo Upload

`POST /applications/{id}/upload-photo` accepts `multipart/form-data`:

| Field     | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| `file`    | binary | ✅        | Image file (JPEG/PNG, max 10 MB)         |
| `remarks` | string | ❌        | Defaults to `"Photo uploaded for verification"` |

The photo is stored as a base64 data-URI inside the application record (`photo` field). Filename and upload timestamp are also recorded.

---

## Status Workflow

Valid transitions are enforced in `services/workflow.py`:

```
Applied → Under Scrutiny → Approved
                        → Rejected
Applied → Rejected
```

---

## Utility Scripts

These scripts in `utils/` were used during initial data setup — they are **not part of the running server**:

- `rewrite.py` — One-time data normalization script
- `apply_changes.py` — One-time field correction script
- `add_hidden.py` — One-time field injection script
