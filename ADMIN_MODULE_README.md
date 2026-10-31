# JanSeva Connect — Admin Panel & Platform Management Module
**Module 3 Documentation | Senior Full-Stack & System Architecture Report**

---

## 1. Executive Summary & Module Responsibility

As **Member 3** of the JanSeva Connect engineering team, this module establishes the comprehensive **Admin Panel & Platform Management System**. 

The module provides administrators with complete real-time oversight and authoritative control over:
- Platform Activity & Executive KPIs (10 Key Performance Indicators)
- Citizen Accounts (Inspection, Status Changes, Flagging for Review, Complaint Dossiers)
- Grievance Lifecycle (Verification Desk, Rejections with mandatory justifications, Information Requests)
- Department & Officer Assignments (Dynamic departmental routing, officer workload balancing, reassignment audit trail)
- Government Departments & Officers Management (Full CRUD, secure bcrypt credentials, status toggles)
- Public Services Administration (Eligibility criteria, application procedures, immutable version archives)
- Government Welfare Schemes (Structured eligibility parameters matching Member 2's engine, versioned snapshots)
- Service Level Agreements (SLA Timelines, priority-based durations in UTC, automated escalation thresholds)
- Overdue Grievance Escalation (Supervisory interventions, status transitions to ESCALATED, notifications)
- Real-time Analytics & Executive Reports (Status, category, and department scorecards with CSV export)
- In-App & Multi-Channel Notifications (Platform announcement broadcasts, delivery status auditing)
- Global Platform Settings & Immutable Audit Trail (Every administrative operation logged with actor, timestamp, IP, and state diff)

---

## 2. Technology Stack & Coding Standards

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router DOM v7, Axios, Lucide React, i18next
- **Backend**: Node.js, Express 5 (ES Modules), PostgreSQL (`pg`), Zod validation, JWT authentication, bcryptjs password hashing
- **Database**: PostgreSQL 18 with relational foreign keys, indexes, triggers, and dual-mode operation (PostgreSQL pool with graceful local data persistence)
- **Git Feature Branch**: `feature/admin-panel`

---

## 3. Database Schema & Tables Reused

All database structures are designed to be shared collaboratively across all 4 team members without collisions:

| Table Name | Shared With | Purpose |
|---|---|---|
| `users` | Member 1 & 4 | Unified account storage for Citizens, Department Officers, and Admins |
| `departments` | Member 1 & 4 | Government departments, contact points, and responsible categories |
| `officers` | Member 4 | Links user accounts to designations, employee IDs, and departments |
| `complaints` | Member 1 & 4 | Core grievance records, locations, geo-coordinates, priorities, and statuses |
| `complaint_history`| Member 1 & 4 | Immutable chronological log of every status transition and remark |
| `assignments` | Member 4 | Complaint-to-department and complaint-to-officer routing history |
| `public_services` | Member 2 | Verified civic service directory, documents, and application URLs |
| `service_versions` | Member 2 | Immutable archived snapshots of service updates |
| `government_schemes`| Member 2 | Welfare schemes with structured eligibility conditions |
| `scheme_versions` | Member 2 | Historical scheme guideline archives |
| `sla_rules` | Member 3 & 4 | Priority and department resolution timelines and escalation percentages |
| `complaint_sla` | Member 3 & 4 | Complaint-specific SLA deadlines, started, due, and completed timestamps |
| `escalations` | Member 3 & 4 | Overdue complaints escalated to senior supervisors |
| `audit_logs` | Platform Wide | System-wide audit logging of all administrative actions |
| `platform_settings`| Platform Wide | Key-value JSONB platform configuration parameters |
| `notifications` | Member 1, 3 & 4| Real-time alerts, citizen notifications, and system broadcasts |

---

## 4. The 16 Admin Panel Frontend Pages

All 16 administrative pages are accessible via a responsive dashboard layout with persistent sidebar and search header:

1. **Admin Dashboard** (`/admin/dashboard`): 10 Real-time KPI stat cards, monthly trend bar charts, category distributions, status proportions, pending verification queue, overdue alert box, and department scorecards.
2. **Citizen Management** (`/admin/citizens`): Citizen roster, searchable by name/email/phone, status filters, account activation/deactivation, flagging for audit review with reasons, and full complaint dossiers.
3. **All Complaints** (`/admin/complaints`): Master grievance repository with multi-field search, status/department/category/priority filters, overdue toggles, and detail inspection drawers.
4. **Complaint Verification Queue** (`/admin/complaints/verification`): Verification desk for incoming submissions, duplicate warning alerts, photo evidence inspection, and approve / reject / request-information actions.
5. **Complaint Assignments** (`/admin/complaints/assignments`): Routing desk for verified complaints to departments and active officers with reassignment history.
6. **Department Management** (`/admin/departments`): Department CRUD, unique code and name validation, active officer tallies, workload counts, and status toggles.
7. **Officer Management** (`/admin/officers`): Officer roster, employee ID tracking, department assignment, secure temporary password setup, and workload counters.
8. **Public Services Directory** (`/admin/services`): Civic services catalog, verification and publication status controls, and version history viewing.
9. **Add / Edit Public Service** (`/admin/services/new`, `/admin/services/:id/edit`): Detailed form with required documents, application procedures, URLs, and historical snapshot archiving.
10. **Government Schemes** (`/admin/schemes`): Central and state welfare schemes table with target beneficiary groups and publication toggles.
11. **Add / Edit Scheme** (`/admin/schemes/new`, `/admin/schemes/:id/edit`): Welfare scheme editor with structured eligibility conditions (min/max age, max income, gender, residence).
12. **SLA Management** (`/admin/sla`): Timeline policy engine configuring resolution hours/days, priority benchmarks, and escalation warning thresholds.
13. **Escalation & Overdue Desk** (`/admin/escalations`): Active overdue alerts, supervisor reassignment, corrective report logging, and escalation closure.
14. **Analytics & Reports** (`/admin/analytics`): Deep statistical breakdown, average resolution turnaround times, SLA compliance ratings, citizen satisfaction indices, and CSV report export.
15. **Notifications & Broadcasts** (`/admin/notifications`): Dispatch history, delivery status auditing (in-app, simulated email/SMS), retry controls, and platform-wide announcement broadcast.
16. **Platform Settings & Audit** (`/admin/settings`): General settings, complaint file upload constraints, security policies (session expiry, lockout rules), and immutable audit logs viewer.

*Bonus Page*: **Admin Sign In** (`/admin/login`): Secure sign-in with built-in "Pre-fill Super Admin Credentials" button for one-click reviewer evaluation.

---

## 5. Security & Authorization Architecture

- **Role-Based Access Control (RBAC)**: All routes under `/api/admin/*` and `/admin/*` are strictly guarded by `authenticate` (JWT bearer verification) and `requireAdmin` (validating `user.role === 'ADMIN'`).
- **Forbidden Non-Admin Access**: Citizens and department officers attempting to access `/api/admin` receive `403 Forbidden` responses.
- **Credential Protection**: Passwords are encrypted with bcryptjs (salt rounds = 10). Stored hashes are never returned in administrative API responses or frontend state.
- **Audit Logging**: Every single administrative state change (`CITIZEN_STATUS`, `CITIZEN_FLAGGED`, `COMPLAINT_VERIFIED`, `COMPLAINT_REJECTED`, `COMPLAINT_ASSIGNED`, `COMPLAINT_ESCALATED`, `SERVICE_UPDATED`, `SETTINGS_UPDATED`) records the actor ID, actor full name, role, IP address, timestamp, and state diff.

---

## 6. How to Run the Application

### Backend:
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000` (Health check at `http://localhost:5000/api/health`).

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

### Evaluation Credentials:
- **Email**: `admin@janseva.gov.in`
- **Password**: `Admin@123`
*(Or click "Pre-fill Super Admin Credentials" on `/admin/login`)*
