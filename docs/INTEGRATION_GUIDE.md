# JanSeva Connect – Team Integration Guide & Coordination Notes
**Lead & Grievance Module Architect:** Member 1 (Ritik Sawarkar)  
**Target Audience:** Development Team Members 1, 2, 3, and 4

---

## 1. Team Responsibilities & Ownership Matrix

| Member | Domain & Ownership | Key Shared Entities & Handoffs |
|---|---|---|
| **Member 1 (You - Lead)** | **Core Grievance Management & Citizen Experience**<br>• Citizen Dashboard<br>• Grievance Registration & Unique Tracking ID<br>• Nearby Complaint Discovery<br>• Community Complaint Joining & Support<br>• Complaint Timeline History<br>• Department Routing Suggestions<br>• Project Integration Lead | • Generates `complaints`<br>• Maintains `complaint_supporters`<br>• Enforces unique constraints and tracking IDs<br>• Integrates shared UI layout & language switcher |
| **Member 2** | **Public Services & Government Schemes**<br>• Public Services Directory<br>• Government Schemes & Welfare Portal<br>• Eligibility Checker<br>• Informational Citizen Guides | • Links into Citizen navigation layout<br>• Shares user auth token and multilingual context<br>• Reuses header & footer |
| **Member 3** | **Admin Panel & Operations Management**<br>• Admin Dashboard & Analytics<br>• Complaint Verification (`UNDER_VERIFICATION` → `VERIFIED`)<br>• Department Assignment (`ASSIGNED`)<br>• SLA Configuration & Escalation<br>• Department & Officer Administration | • Reads `complaints` created by Member 1<br>• Updates `department_id` based on Member 1's `suggested_department_id`<br>• Inserts assignments into `assignments` table<br>• Appends audit entries to `complaint_history` |
| **Member 4** | **Department Officer & Resolution Panel**<br>• Officer Work Order Queue<br>• Assignment Acceptance (`ACCEPTED`)<br>• Progress Updates (`IN_PROGRESS`)<br>• Evidence Photo Uploads (Before & After)<br>• Resolution Submission (`RESOLUTION_SUBMITTED` → `RESOLVED`) | • Reads complaints assigned to officer's department<br>• Appends progress notes in `complaint_history`<br>• Attaches before/after photos into `attachments`<br>• Triggers resolution notifications for citizens & supporters |

---

## 2. Shared Complaint Status Lifecycle

All members **must strictly use** the shared status enum:

```
[Citizen Registers]
SUBMITTED
   ↓
[Admin Reviews]
UNDER_VERIFICATION ────→ REJECTED (Out of jurisdiction / Invalid)
   ↓
VERIFIED
   ↓
[Admin Dispatches]
ASSIGNED (to Department)
   ↓
[Officer Reviews]
ACCEPTED ────→ REASSIGNED / TRANSFERRED
   ↓
[Field Work Starts]
IN_PROGRESS
   ↓
[Officer Submits Evidence]
RESOLUTION_SUBMITTED
   ↓
[Admin / Supervisor Approves]
RESOLVED
```

Alternative statuses supported across all tables:
- `NEEDS_INFORMATION`: Citizen must supply more details before verification.
- `ESCALATED`: Slipped SLA or high-priority civic hazard.
- `REOPENED`: Citizen indicates resolution was incomplete.

---

## 3. Privacy & Security Rules

1. **Location Privacy:** Exact residential coordinates (`latitude`, `longitude`) and full street names must never be exposed to unauthorized public visitors. Nearby discovery APIs round coordinates and display approximate distance labels (e.g. `250 m away`, `1.2 km away`) and generalized areas (`Shivaji Nagar, Pune`).
2. **Citizen Identity Privacy:** Public tracking (`/api/complaints/track/:trackingId`) displays status, department, and timeline, but hides citizen names, mobile numbers, and emails.
3. **Internal vs. Citizen Visibility:** Audit history entries marked `visibility = 'INTERNAL'` are strictly filtered out for citizen requests. Only `ADMIN` and `DEPARTMENT_OFFICER` roles can inspect internal notes.
4. **Community Support Rules:**
   - One citizen can support a complaint only once (`UNIQUE(complaint_id, citizen_id)`).
   - Citizen cannot join their own complaint.
   - Resolved and rejected complaints cannot be joined.
   - Community support count is indicative of community interest, not verified physical presence.

---

## 4. Git Collaboration & Branching Strategy

- **Main Branch (`main`):** Production-ready, fully integrated code only.
- **Member 1 Branch:** `feature/grievance-management`
- **Member 2 Branch:** `feature/public-services`
- **Member 3 Branch:** `feature/admin-management`
- **Member 4 Branch:** `feature/officer-resolution`

**Rules:**
- Never commit `.env` or `node_modules`.
- Always run `npm test` and `npm run test:e2e` in `backend` before opening a pull request into `main`.
- Always verify frontend build with `npm run build` in `frontend`.
