# JanSeva Connect – Team Shared API Contract
**Version:** 1.0.0  
**Project Lead:** Member 1 (Ritik Sawarkar)  
**Modules Covered:** Member 1 (Grievance Core), Member 2 (Services & Schemes), Member 3 (Admin Management), Member 4 (Officer Resolution)

---

## 1. Global Standards & Conventions

- **Base URL:** `http://localhost:5000/api`
- **Authentication:** HTTP Header `Authorization: Bearer <JWT_TOKEN>`
- **User Roles:** `CITIZEN`, `DEPARTMENT_OFFICER`, `ADMIN`
- **Standard Success Response Format:**
  ```json
  {
    "success": true,
    "message": "Optional descriptive message",
    "data": { ... }
  }
  ```
- **Standard Error Response Format:**
  ```json
  {
    "success": false,
    "message": "Human readable error description",
    "errors": [ ... ]
  }
  ```

---

## 2. Authentication APIs (`/api/auth`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Register new Citizen account |
| `/api/auth/login` | `POST` | Public | Login with email and password |
| `/api/auth/me` | `GET` | Authenticated | Get currently authenticated profile |

---

## 3. Citizen Grievance & Dashboard APIs (`/api/citizen`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/citizen/dashboard/stats` | `GET` | `CITIZEN` | Actual count of Total, Pending, Under Verification, Assigned, In Progress, Resolution Submitted, Resolved, and Joined complaints |
| `/api/citizen/dashboard/recent-complaints` | `GET` | `CITIZEN` | Latest 5 complaints submitted by authenticated citizen |
| `/api/citizen/dashboard/nearby-complaints` | `GET` | `CITIZEN` | Active public neighborhood complaints within 5km |
| `/api/citizen/dashboard/recent-activity` | `GET` | `CITIZEN` | Recent status change notifications |
| `/api/citizen/joined-complaints` | `GET` | `CITIZEN` | Complaints joined/supported by citizen (distinct from own complaints) |

---

## 4. Complaint Management APIs (`/api/complaints`)

| Endpoint | Method | Role | Request Body / Params | Description |
|---|---|---|---|---|
| `/api/complaints` | `POST` | `CITIZEN` | `multipart/form-data`: `title`, `description`, `category`, `subcategory`, `state`, `district`, `area`, `landmark`, `location_address`, `latitude`, `longitude`, `priority`, `preferred_contact_method`, `is_emergency`, `attachments` (up to 5 files) | Register grievance with atomic unique tracking ID (`JSC-YYYY-000000`) & auto-routing suggestion |
| `/api/complaints/my` | `GET` | `CITIZEN` | Query: `status`, `category`, `priority`, `search`, `page`, `limit`, `sortBy`, `sortOrder` | List personal complaints |
| `/api/complaints/:id` | `GET` | Any | Path: `id` | Get full complaint details, attachments, safe location, and timeline |
| `/api/complaints/:id` | `PATCH` | `CITIZEN`, `ADMIN` | Body: `title`, `description`, `landmark`, `preferred_contact_method` | Edit complaint before assignment/verification |

---

## 5. Nearby Complaint Discovery APIs (`/api/complaints/nearby`)

| Endpoint | Method | Query Parameters | Description |
|---|---|---|---|
| `/api/complaints/nearby` | `GET` | `latitude`, `longitude`, `radius` (0.5 to 5 km), `category`, `keywords`, `page`, `limit` | Haversine distance search returning approximate distance, generalized area, and similarity explanation |
| `/api/complaints/nearby/search` | `POST` | Same parameters in JSON body | POST alternative for advanced discovery queries |
| `/api/complaints/nearby/:id` | `GET` | Path: `id` | Safe public preview of nearby complaint |

---

## 6. Community Support APIs (`/api/complaints/:id/join`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/complaints/:id/join` | `POST` | `CITIZEN` | Support/join a neighborhood complaint. Atomic transaction, updates supporter count, logs timeline event. Returns 409 on duplicate and 400 on own complaint |
| `/api/complaints/:id/join` | `DELETE` | `CITIZEN` | Withdraw community support |
| `/api/complaints/:id/supporters` | `GET` | Public / Auth | Anonymized list and count of supporters |
| `/api/complaints/:id/support-status` | `GET` | Public / Auth | Check if current user has joined |

---

## 7. Complaint Tracking & History APIs

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/complaints/track/:trackingId` | `GET` | Public / Auth | Public grievance status tracking using Unique Tracking ID. Protects citizen personal identity and phone number |
| `/api/complaints/:id/history` | `GET` | Public / Auth | Audit history timeline. Automatically hides internal administrative remarks from citizens |

---

## 8. Metadata APIs

| Endpoint | Method | Description |
|---|---|---|
| `/api/departments` | `GET` | List active departments (Sanitation, PWD, Electrical, Water, Drainage, Health, General) |
| `/api/complaints/meta/categories` | `GET` | Standard categories and subcategories |

