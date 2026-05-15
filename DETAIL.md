# Krishi Prabandh Web Portal - Technical Details

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + Vite, Vanilla CSS            |
| Backend   | FastAPI (Python 3.11+), Uvicorn         |
| Data      | JSON flat-file store (`backend/data/`)  |
| Auth      | LocalStorage-based session (mock auth)  |

---

## Project Structure

```
KRISHI-PRABANDH/
├── frontend/                  # React + Vite UI
│   └── src/
│       ├── pages/             # Route-level page components
│       ├── components/        # Reusable UI components
│       ├── context/           # Auth & Language context providers
│       ├── hooks/             # Custom hooks (useToast, etc.)
│       ├── utils/             # API client, translations, CV engine
│       └── styles/            # Global CSS design tokens
│
├── backend/                   # FastAPI server (Testing Mock)
│   ├── main.py                # App entry point + CORS config
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic (workflow, fraud)
│   ├── models/                # Pydantic request/response schemas
│   ├── utils/                 # Data loader, file utilities
│   └── data/
│       └── applications.json  # Live application records (flat-file DB)
```

---

## Key API Endpoints (Local FastAPI Mock)

| Method | Endpoint                                  | Description                        |
|--------|-------------------------------------------|------------------------------------|
| GET    | `/applications`                           | List all applications (filterable) |
| GET    | `/applications/{id}`                      | Get single application             |
| POST   | `/applications/{id}/status`               | Update application status          |
| POST   | `/applications/{id}/upload-photo`         | Upload field photo (multipart)     |
| GET    | `/insights/summary`                       | Dashboard summary stats            |
| GET    | `/insights/priority`                      | Priority-ranked applications       |
| GET    | `/insights/fraud-alerts`                  | Fraud detection results            |
| GET    | `/logs`                                   | Audit log entries                  |
| POST   | `/logs`                                   | Append audit log entry             |

## Audit Logs & Uploads
Every status change and document upload is recorded server-side for comprehensive audit trailing.
