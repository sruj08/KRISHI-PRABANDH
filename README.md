# KrishiPrabandh — Agricultural Scheme Management Platform

> A full-stack field operations and scheme processing platform for Maharashtra Government agricultural officers.

---

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
├── backend/                   # FastAPI server
│   ├── main.py                # App entry point + CORS config
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic (workflow, fraud)
│   ├── models/                # Pydantic request/response schemas
│   ├── utils/                 # Data loader, file utilities
│   └── data/
│       └── applications.json  # Live application records (flat-file DB)
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.11+
- **pip** (for backend dependencies)

---

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API runs at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

UI runs at: `http://localhost:5173`

---

## Key API Endpoints

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

---

## Features

- **Applications Dashboard** — Filter, sort, and action scheme applications with live priority scoring
- **Visit Planner** — Field officer daily route with risk-level tracking; post-visit state transitions (Approve / Reject)
- **Capture Photo** — Live camera capture or file-picker upload; image sent as `multipart/form-data` to backend
- **Fraud Alerts** — Automated detection of duplicate claims and anomalous applications
- **Advanced Tools** — CV-based document analysis engine
- **Multilingual UI** — English / Marathi toggle via Language context
- **Audit Logs** — Every status change and upload is recorded server-side

---

## Default Login

| Role    | Username | Password |
|---------|----------|----------|
| Officer | `officer`| `pass`   |
| Farmer  | `farmer` | `pass`   |
