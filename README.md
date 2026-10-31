# JanSeva Connect
### Accessible Public Services & Grievance Resolution Portal

[![Frontend Vite Build](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-blue.svg)](./frontend)
[![Backend Express](https://img.shields.io/badge/Backend-Node%20%2B%20Express-green.svg)](./backend)
[![Database PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2018-navy.svg)](./database)
[![Multilingual Support](https://img.shields.io/badge/Languages-EN%20%7C%20HI%20%7C%20MR-orange.svg)](./frontend/src/i18n)

JanSeva Connect is a modern, citizen-centric public services and grievance redressal platform. It empowers citizens to report civic grievances, discover open neighborhood issues, and consolidate community support behind single actionable work orders for municipal departments.

---

## 🌟 Core Product Innovation

> **One Problem → One Main Complaint → Multiple Supporting Citizens → One Department Work Order → Verified Resolution.**

Instead of dozens of separate complaints being filed for the same uncollected garbage heap, road pothole, or water pipeline burst:
1. Citizen A reports the issue in their area.
2. The **Nearby Complaint Discovery Engine** automatically presents the open issue to nearby citizens.
3. Neighbors join and support the existing complaint rather than creating duplicate entries.
4. The responsible municipal department receives **one structured, consolidated grievance** backed by verified community support.

---

## 👥 Four-Member Team Structure & Module Ownership

| Member | Module | Ownership |
|---|---|---|
| **Member 1 (Ritik Sawarkar - Lead)** | **Core Grievance Management** | Citizen Portal (8 Pages), Complaint Registration, Concurrency-Safe Tracking IDs, Haversine Nearby Discovery, Community Support System, Complaint Timeline History, Multilingual Engine, Integration Lead |
| **Member 2** | **Public Services & Schemes** | Public Services Catalog, Government Welfare Schemes, Citizen Eligibility Checker |
| **Member 3** | **Admin Operations Panel** | Verification Desk, SLA Engine, Department Assignment, Officer Management, Audit Logs |
| **Member 4** | **Officer Resolution Panel** | Officer Work Order Queue, Before/After Photo Evidence, Field Progress Stepper, Resolution Approval |

---

## 🖥️ Citizen Panel – 8 Complete Frontend Pages

1. **Citizen Dashboard** (`/citizen/dashboard`): Dynamic overview displaying live counts for Total, Pending, Under Verification, Assigned, In Progress, Resolution Submitted, Resolved, and Joined complaints, plus recent complaints and nearby active previews.
2. **My Complaints** (`/citizen/complaints`): Filterable, searchable, and sortable view of citizen-submitted complaints with table/grid toggle and pagination.
3. **Register Grievance** (`/citizen/complaints/new`): 6-section accessible complaint submission flow including GPS auto-detect, manual correction, photo evidence upload, contact preferences, pre-submission nearby duplicate check, and instant tracking ID generation.
4. **Nearby Complaints Discovery** (`/citizen/nearby-complaints`): Interactive location-based discovery engine with configurable radius (500m, 1km, 2km, 5km), category filtering, and 1-click community join.
5. **Nearby Complaint Results** (`/citizen/nearby-complaints/results`): Dedicated match results screen detailing proximity distance and similarity explanations.
6. **Joined Community Complaints** (`/citizen/joined-complaints`): Separate dedicated interface for tracking complaints supported by the citizen, with support withdrawal capability.
7. **Complaint Details & Lifecycle Timeline** (`/citizen/complaints/:id`): Full complaint view, photo evidence gallery with zoom/download, department contact info, community supporter counter, and transparent history timeline (hiding internal admin remarks).
8. **Track Complaint Status** (`/track-complaint`): Public tracking interface requiring only the unique Tracking ID (`JSC-YYYY-000000`) while strictly protecting citizen personal privacy.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router DOM v7, Axios, Lucide React, i18next & react-i18next
- **Backend:** Node.js (ES Modules), Express.js, PostgreSQL (`pg` pool with transactions), Zod validation, JWT authentication, bcryptjs password hashing, Multer file upload
- **Database:** PostgreSQL 18 with concurrency-safe sequence `complaint_tracking_seq` and parameterized Haversine distance calculations

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) running on `localhost:5432` with a database named `janseva_connect`

### 1. Database Initialization
```bash
# Execute schema migration
psql -U postgres -d janseva_connect -f database/init.sql

# Seed initial departments, demo users, sample complaints, and history
psql -U postgres -d janseva_connect -f database/seeds.sql
```

### 2. Backend Setup
```bash
cd backend
npm install

# Verify your database connection in backend/.env:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/janseva_connect"

# Run tests
npm test
npm run test:e2e

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Pre-Configured Demo Accounts (1-Click Switcher Available in UI)

| Role | Email | Password | Purpose |
|---|---|---|---|
| **Citizen 1 (Lead)** | `citizen@janseva.gov.in` | `Citizen@123` | Default citizen with filed and supported complaints |
| **Citizen 2** | `priya@janseva.gov.in` | `Citizen@123` | Secondary citizen for testing community joining |
| **Sanitation Officer** | `officer@janseva.gov.in` | `Officer@123` | Department officer receiving assigned sanitation work |
| **Admin** | `admin@janseva.gov.in` | `Admin@123` | Central administrator managing verification |

---

## 📚 Technical Documentation

- [Shared Team API Contract](docs/API_CONTRACT.md)
- [Unified PostgreSQL Database Schema](docs/DATABASE_SCHEMA.md)
- [Team Integration Guide & Status Lifecycle](docs/INTEGRATION_GUIDE.md)

---

## 🔒 Security & Privacy Guarantees

1. **Location Privacy:** Exact residential coordinates and private house numbers are masked from public listings; only generalized area names and approximate distances (e.g. `250 m away`) are exposed.
2. **Citizen Anonymity:** Public tracking searches display status, department, and timeline without revealing the complainant's name, phone, or email.
3. **Confidential Remarks Protection:** Audit entries with `visibility = 'INTERNAL'` are strictly stripped out of citizen-facing responses.
4. **Duplicate Prevention:** Unique constraint `UNIQUE (complaint_id, citizen_id)` enforced at the database level with atomic transactions and graceful HTTP 409 responses.
