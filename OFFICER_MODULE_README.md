# JanSeva Connect | Member 4: Department Officer & Complaint Resolution Module

## 1. Module Overview

**JanSeva Connect** is an accessible, multi-role public grievance redressal and public services delivery portal for urban governance.

As **Member 4** of the development team, this module delivers the end-to-end **Department Officer Panel & Complaint Resolution System**. Government field officers use this portal to:
- Inspect assigned grievances within their municipal department.
- Acknowledge and formally accept new assignments (`ASSIGNED` $\to$ `ACCEPTED`).
- Record work progress, field remarks, and inspection updates (`ACCEPTED` $\to$ `IN_PROGRESS`).
- Upload before-and-after photographic evidence and work completion reports.
- Submit grievances for administrative verification and closure (`IN_PROGRESS` $\to$ `RESOLUTION_SUBMITTED`).
- Review completed work, audit trails, and administrative feedback.
- Monitor SLA countdowns and overdue alerts.
- Manage department profile details and secure credentials.

> **CRITICAL WORKFLOW RULE**: Government officers are **never** permitted to silently or directly close a complaint. Field officers submit verified completion evidence, moving the complaint to `RESOLUTION_SUBMITTED`. The complaint becomes `RESOLVED` only after official Administrative desk verification and sign-off.

---

## 2. Complaint Lifecycle & Shared Team Coordination

```
[Citizen Submits]
       │
       ▼
[SUBMITTED] ──(Admin Review)──► [UNDER_VERIFICATION] ──► [VERIFIED]
                                                               │
                                                       (Admin Assigns)
                                                               │
                                                               ▼
                                                      [ASSIGNED] (New)
                                                               │
                                                    (Officer Accepts)
                                                               │
                                                               ▼
                                                      [ACCEPTED]
                                                               │
                                                    (Field Work Starts)
                                                               │
                                                               ▼
                                                      [IN_PROGRESS]
                                                               │
                                                (Officer Submits Evidence)
                                                               │
                                                               ▼
                                                  [RESOLUTION_SUBMITTED]
                                                               │
                                                    (Admin Verification)
                                                               │
                                                               ▼
                                                      [RESOLVED] (Closed)
```

---

## 3. Department Officer Frontend Pages (9 Pages)

All officer routes are wrapped in `OfficerLayout` with responsive drawer navigation and authentication guards:

| # | Route | Page Component | Purpose |
|---|---|---|---|
| **1** | `/officer/dashboard` | `OfficerDashboard.jsx` | Workload analytics, 8 statistic cards, SLA timers, priority queue, and recent audit activity. |
| **2** | `/officer/complaints` | `AssignedComplaints.jsx` | Full complaints table with multi-filter (status, priority, category, date), search, sort, and action triggers. |
| **3** | `/officer/assignments/new` | `NewAssignments.jsx` | Queue of newly assigned grievances awaiting officer acceptance and acknowledgement. |
| **4** | `/officer/complaints/:id` | `OfficerComplaintDetails.jsx` | Full complaint inspection: description, sanitized citizen contact, location, citizen before-evidence, and full audit timeline. |
| **5** | `/officer/complaints/:id/progress` | `UpdateProgress.jsx` | Work progress logging form, remarks, status transition to `IN_PROGRESS`, and previous update log. |
| **6** | `/officer/complaints/:id/resolution` | `SubmitResolution.jsx` | Mandatory work completion report with mandatory after-photograph evidence submission for closure. |
| **7** | `/officer/complaints/completed` | `CompletedComplaints.jsx` | Log of completed work, distinguishing between `RESOLUTION_SUBMITTED` (Pending Verification) and `RESOLVED` (Approved). |
| **8** | `/officer/notifications` | `OfficerNotifications.jsx` | Operational alerts, assignment notices, SLA breaches, and administrative remarks. |
| **9** | `/officer/profile` | `OfficerProfile.jsx` | Officer details, workload metrics, contact information update, and secure password modification. |
| **Auth** | `/officer/login` | `OfficerLogin.jsx` | Dedicated officer portal sign-in with 1-click test fill presets for all 4 municipal department officers. |

---

## 4. Reusable UI Components

Located in `frontend/src/components/officer/` and `frontend/src/layouts/`:

1. `OfficerLayout.jsx`: Master layout with mobile responsive drawer, authentication guard, and header.
2. `OfficerSidebar.jsx`: Clean gov-tech sidebar with dynamic new assignment badge and unread notification counter.
3. `OfficerHeader.jsx`: Header with breadcrumbs, department badge, notification preview, and user status.
4. `StatusBadge.jsx`: Unified status pills for `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `RESOLUTION_SUBMITTED`, `RESOLVED`, `ESCALATED`.
5. `PriorityBadge.jsx`: Color-coded priority badges for `EMERGENCY`, `HIGH`, `MEDIUM`, `LOW`.
6. `StatCard.jsx`: Metric display cards with icons, labels, and trend subtitles.
7. `ComplaintTimeline.jsx`: Chronological event audit trail showing actor role, timestamp, and progress notes.
8. `EvidenceUploader.jsx`: Photographic evidence uploader with validation, base64 conversion, URL fallback, and image preview.
9. `ConfirmationModal.jsx`: Modal confirmation for assignment acceptance and resolution submission.
10. `UIFeedback.jsx`: Exports `LoadingSkeleton`, `EmptyState`, `ErrorState`, `Pagination`, and `ToastNotification`.

---

## 5. Backend REST API Endpoints

All officer routes are prefixed with `/api/officer` and protected by `authenticate` (JWT) and `requireOfficer` (`DEPARTMENT_OFFICER` role check):

### A. Dashboard APIs
- `GET /api/officer/dashboard/stats`: Returns 8 workload metrics (Total assigned, New assignments, Accepted, In-progress, Resolution submitted, Completed, Overdue, High priority) with timeframe filters (`today`, `7days`, `30days`, `all`).
- `GET /api/officer/dashboard/recent-assignments`: Returns latest grievances assigned to officer.
- `GET /api/officer/dashboard/priority-complaints`: Returns high & emergency priority active grievances.
- `GET /api/officer/dashboard/sla-overview`: Returns complaints with countdown hours and breach indicators.
- `GET /api/officer/dashboard/recent-activity`: Returns latest audit trail events on officer's complaints.

### B. Assigned Complaint APIs
- `GET /api/officer/complaints`: Lists grievances assigned to authenticated officer. Supports search (tracking ID, title, location), status filter, priority filter, category filter, sorting, and pagination.
- `GET /api/officer/complaints/:id`: Complete complaint details, sanitized citizen contact, location coordinates, citizen evidence, assignment data, SLA timer, and full history timeline.
- `GET /api/officer/complaints/completed`: Lists completed and resolution-submitted grievances.

### C. Assignment APIs
- `GET /api/officer/assignments`: Active assignment records for officer.
- `GET /api/officer/assignments/new`: Newly assigned complaints awaiting acceptance.
- `POST /api/officer/assignments/:id/accept`: Atomically moves status from `ASSIGNED` to `ACCEPTED`, sets `accepted_at`, adds complaint history, and notifies citizen. Prevents duplicate acceptance.
- `POST /api/officer/assignments/:id/acknowledge`: Logs officer acknowledgement remarks.

### D. Progress APIs
- `POST /api/officer/complaints/:id/progress`: Logs work progress description, remarks, and optional photo. Transitions status to `IN_PROGRESS` and notifies citizen.
- `GET /api/officer/complaints/:id/progress`: Retrieves historical progress updates.
- `PATCH /api/officer/complaints/:id/status`: Controlled status transition (`ACCEPTED` $\to$ `IN_PROGRESS`). Rejects direct change to `RESOLVED`.

### E. Resolution & Evidence APIs
- `POST /api/officer/complaints/:id/resolution`: Submits completion report with mandatory after-photograph evidence. Transitions status to `RESOLUTION_SUBMITTED`, records in `resolutions` and `resolution_evidence`, creates history entry, and notifies Admin and Citizen.
- `GET /api/officer/complaints/:id/resolution`: Retrieves submitted resolution details.
- `GET /api/officer/complaints/:id/evidence`: Retrieves citizen before-evidence and officer resolution evidence.
- `POST /api/officer/upload`: Validates file MIME (JPEG, PNG, WebP) and size ($\le 10\text{ MB}$), generates safe unique filename, stores file, and returns storage reference.

### F. Notification APIs
- `GET /api/officer/notifications`: List officer notifications with type and read filters.
- `GET /api/officer/notifications/unread-count`: Returns unread count for sidebar badge.
- `PATCH /api/officer/notifications/:id/read`: Marks individual notification read.
- `PATCH /api/officer/notifications/read-all`: Marks all officer notifications read.

### G. Profile APIs
- `GET /api/officer/profile`: Officer personal details, official department data, employee ID, and actual workload metrics.
- `PATCH /api/officer/profile`: Updates permitted personal details (`full_name`, `phone`). Rejects self-modification of `role`, `department_id`, `employee_id`, or `status`.
- `POST /api/officer/profile/change-password`: Validates current password via bcrypt, verifies 8+ character length, and updates password hash.

---

## 6. Database Integration & Reused Tables

Reused existing shared tables without conflicts:
- `users`: Authenticates officers (`role = 'DEPARTMENT_OFFICER'`).
- `departments`: Municipal departments (Sanitation, PWD, Water Supply, Electrical, Drainage).
- `officers`: Links `user_id` to `department_id`, `employee_id`, and `designation`.
- `complaints`: Core grievance records, updated through `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `RESOLUTION_SUBMITTED`, `RESOLVED`.
- `complaint_history`: Immutable audit trail for all officer transitions and remarks.
- `assignments`: Records assignment timestamps and `accepted_at`.
- `notifications`: In-app notification queue for officers and citizens.
- `complaint_sla`: SLA deadlines and breach tracking.

Added tables (in `schema.sql` and initialized in DB store):
- `resolutions`: Stores `resolution_title`, `resolution_description`, `work_completed_at`, `officer_remarks`, `status` ('SUBMITTED', 'APPROVED', 'REJECTED'), review remarks, and timestamps.
- `resolution_evidence`: Stores `file_name`, `storage_key`, `mime_type`, `file_size`, `evidence_type` ('BEFORE', 'AFTER', 'SUPPORTING').

---

## 7. Seed Officers & Test Credentials

Use these pre-seeded accounts to test department-specific workflows:

| Department | Officer Name | Email | Password | Employee ID |
|---|---|---|---|---|
| **Solid Waste & Sanitation** | Rajesh Kumar | `officer.sanitation@janseva.gov.in` | `Officer@123` | `EMP-SWM-101` |
| **Public Works (PWD)** | Sunil Shinde | `officer.pwd@janseva.gov.in` | `Officer@123` | `EMP-PWD-204` |
| **Water Supply & Sewerage** | Meena Iyer | `officer.water@janseva.gov.in` | `Officer@123` | `EMP-WTR-305` |
| **Electrical & Streetlights** | Vikas Joshi | `officer.electrical@janseva.gov.in` | `Officer@123` | `EMP-ELC-409` |

> The `/officer/login` page includes **1-Click Quick Fill buttons** for each of these officers for rapid testing.

---

## 8. Verification & Test Report

All 15 required automated test cases passed with 100% success rate:
- ✅ **Test 1**: Officer login returns valid JWT and officer metadata.
- ✅ **Test 2**: Unauthorized `CITIZEN` token rejected with 403 on officer endpoints.
- ✅ **Test 3**: Officer dashboard statistics and SLA overview computed accurately.
- ✅ **Test 4**: Assigned complaints listing enforces strict officer ownership.
- ✅ **Test 5**: Rejects viewing complaints assigned to another officer (403).
- ✅ **Test 6**: New assignments queue lists complaints in `ASSIGNED` status.
- ✅ **Test 7**: Accept assignment transitions status to `ACCEPTED` and updates timestamp.
- ✅ **Test 8**: Prevents duplicate acceptance on already accepted assignment.
- ✅ **Test 9**: Work progress update transitions status from `ACCEPTED` to `IN_PROGRESS`.
- ✅ **Test 10**: Rejects direct transition to `RESOLVED` (enforces verification workflow).
- ✅ **Test 11**: Submit resolution with mandatory after-evidence transitions status to `RESOLUTION_SUBMITTED`.
- ✅ **Test 12**: Completed complaints listing reflects resolution-submitted and closed items.
- ✅ **Test 13**: Officer notifications retrieved, unread count badge accurate, mark as read working.
- ✅ **Test 14**: Profile updates permitted fields; rejects unauthorized role/department alterations.
- ✅ **Test 15**: Password change verifies current password and accepts secure update.
- ✅ **Frontend Production Build**: `npm run build` succeeded in 3.58s with 0 errors.

---

## 9. Instructions to Run the Application

### Backend:
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### Accessing the Officer Portal:
1. Open `http://localhost:5173` in your browser.
2. Click **"Department Officer Portal"** or navigate directly to `http://localhost:5173/officer/login`.
3. Click any of the quick-fill officer buttons (e.g. *Sanitation Officer* or *PWD Engineer*) or type the credentials.
4. Click **Sign In to Officer Console**.
