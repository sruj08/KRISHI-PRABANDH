<p align="center">
  <img src="./logo/KRISHI_PRABANDH_LOGO.png" width="120" alt="Krishi Prabandh Logo" />
</p>

<h1 align="center">Krishi Prabandh Web Portal</h1>

<p align="center">
  <strong>Agricultural Scheme Management & Officer Dashboard</strong>
</p>

<p align="center">
  <a href="./DETAIL.md">Technical Documentation</a> &nbsp;&bull;&nbsp;
  <a href="../README.md">Main Project</a>
</p>

---

The **Krishi Prabandh Web Portal** is a full-stack field operations and scheme processing command center built for agricultural officers. It provides a clean, modern React 18 interface for managing incoming agricultural claims, evaluating AI-generated fraud risks, and executing field visits.

---

## Core Features

### 📊 Applications Dashboard
Filter, sort, and action scheme applications with live priority scoring. Officers can review claims submitted by farmers in real-time.

### 🗺️ Visit Planner
Provides a daily route for field officers, complete with risk-level tracking and post-visit state transitions (Approve / Reject).

### 🚨 Fraud Alerts & Intelligence
Automated dashboard alerts for duplicate claims and anomalous applications based on backend confidence scoring and geolocation mismatches.

### 🌐 Multilingual UI
Supports English and Marathi toggling out-of-the-box via a centralized Language Context, ensuring local officers can work in their native language.

---

## Quick Start

### Prerequisites
- **Node.js** v18+

### Setup Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
UI runs at: `http://localhost:5173`

### Setup Backend Mock (FastAPI)
*(Note: This repository contains an integrated mock Python FastAPI server for frontend-only testing. For the full system backend, refer to the Core Backend repository).*
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API runs at: `http://localhost:8000`

---

## Default Login Credentials

| Role    | Username | Password |
|---------|----------|----------|
| Officer | `officer`| `pass`   |
| Farmer  | `farmer` | `pass`   |

---

For a comprehensive breakdown of the project structure and integration details, please read [DETAIL.md](./DETAIL.md).
