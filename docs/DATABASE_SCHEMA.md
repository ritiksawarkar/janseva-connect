# JanSeva Connect – Unified PostgreSQL Database Schema
**Schema Version:** 1.0.0  
**Database:** PostgreSQL 18+  
**Architecture:** Relational with Concurrency-Safe Sequence & Haversine Geolocation

---

## 1. Shared Database Tables & Entities

```
+---------------------------------------------------------------------------------+
|                                 DATABASE SCHEMA                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  +---------------+      +-------------------+      +-------------------------+  |
|  |  departments  | <--- |       users       | ---> |  complaint_supporters   |  |
|  +---------------+      +-------------------+      +-------------------------+  |
|          ^                        |                             |               |
|          |                        v                             v               |
|          +----------------- complaints -------------------------+               |
|                                   |                                             |
|        +--------------------------+--------------------------+                  |
|        |                          |                          |                  |
|        v                          v                          v                  |
|  +--------------------+   +-------------------+   +--------------------+        |
|  |  complaint_history |   |    attachments    |   |    assignments     |        |
|  +--------------------+   +-------------------+   +--------------------+        |
+---------------------------------------------------------------------------------+
```

### Table 1: `departments`
Stores government and municipal service departments.
- `id` SERIAL PRIMARY KEY
- `name` VARCHAR(100) NOT NULL UNIQUE
- `code` VARCHAR(50) NOT NULL UNIQUE (e.g. `SANITATION`, `PWD`, `ELECTRICAL`, `WATER`, `DRAINAGE`, `HEALTH`, `GENERAL`)
- `description` TEXT
- `contact_email` VARCHAR(255)
- `contact_phone` VARCHAR(50)
- `is_active` BOOLEAN DEFAULT TRUE
- `created_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

### Table 2: `users`
Shared user identity entity for Citizens, Officers, and Admins.
- `id` SERIAL PRIMARY KEY
- `full_name` VARCHAR(255) NOT NULL
- `email` VARCHAR(255) UNIQUE NOT NULL
- `phone` VARCHAR(20)
- `password_hash` VARCHAR(255) NOT NULL
- `role` VARCHAR(50) NOT NULL DEFAULT 'CITIZEN' CHECK (`role IN ('CITIZEN', 'ADMIN', 'DEPARTMENT_OFFICER')`)
- `department_id` INT REFERENCES `departments(id)` ON DELETE SET NULL
- `created_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

### Table 3: `complaints`
Primary grievance entity owned by Member 1 and consumed by Members 3 and 4.
- `id` SERIAL PRIMARY KEY
- `tracking_id` VARCHAR(50) UNIQUE NOT NULL (Format: `JSC-YYYY-000000`, generated from sequence `complaint_tracking_seq`)
- `citizen_id` INT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
- `title` VARCHAR(255) NOT NULL
- `description` TEXT NOT NULL
- `category` VARCHAR(100) NOT NULL
- `subcategory` VARCHAR(100)
- `state` VARCHAR(100) NOT NULL DEFAULT 'Maharashtra'
- `district` VARCHAR(100) NOT NULL
- `area` VARCHAR(150) NOT NULL
- `landmark` VARCHAR(255)
- `location_address` TEXT NOT NULL
- `latitude` NUMERIC(10, 7)
- `longitude` NUMERIC(10, 7)
- `priority` VARCHAR(20) DEFAULT 'MEDIUM' CHECK (`priority IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')`)
- `status` VARCHAR(50) DEFAULT 'SUBMITTED' CHECK (`status IN ('SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLUTION_SUBMITTED', 'RESOLVED', 'REJECTED', 'NEEDS_INFORMATION', 'REASSIGNED', 'ESCALATED', 'REOPENED')`)
- `department_id` INT REFERENCES `departments(id)` ON DELETE SET NULL
- `suggested_department_id` INT REFERENCES `departments(id)` ON DELETE SET NULL
- `preferred_contact_method` VARCHAR(50) DEFAULT 'IN_APP' CHECK (`preferred_contact_method IN ('IN_APP', 'EMAIL', 'SMS')`)
- `is_emergency` BOOLEAN DEFAULT FALSE
- `is_public` BOOLEAN DEFAULT TRUE
- `supporter_count` INT DEFAULT 0
- `resolution_notes` TEXT
- `resolved_at` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

### Table 4: `complaint_supporters`
Tracks citizen community support for consolidating multiple reports into one work order.
- `id` SERIAL PRIMARY KEY
- `complaint_id` INT NOT NULL REFERENCES `complaints(id)` ON DELETE CASCADE
- `citizen_id` INT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
- `created_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
- **Constraint:** `CONSTRAINT uq_complaint_supporter UNIQUE (complaint_id, citizen_id)`

### Table 5: `complaint_history`
Full audit history and transparent citizen-facing lifecycle timeline.
- `id` SERIAL PRIMARY KEY
- `complaint_id` INT NOT NULL REFERENCES `complaints(id)` ON DELETE CASCADE
- `old_status` VARCHAR(50)
- `new_status` VARCHAR(50) NOT NULL
- `changed_by` INT REFERENCES `users(id)` ON DELETE SET NULL
- `action_title` VARCHAR(150) NOT NULL
- `remarks` TEXT
- `visibility` VARCHAR(20) DEFAULT 'CITIZEN' CHECK (`visibility IN ('CITIZEN', 'INTERNAL', 'OFFICER')`)
- `created_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

### Table 6: `attachments`
Upload evidence and before/after verification photos.
- `id` SERIAL PRIMARY KEY
- `complaint_id` INT NOT NULL REFERENCES `complaints(id)` ON DELETE CASCADE
- `uploaded_by` INT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
- `file_name` VARCHAR(255) NOT NULL
- `storage_path` VARCHAR(500) NOT NULL
- `storage_key` VARCHAR(255) NOT NULL
- `mime_type` VARCHAR(100) NOT NULL
- `file_size` INT NOT NULL
- `attachment_type` VARCHAR(50) DEFAULT 'EVIDENCE' CHECK (`attachment_type IN ('EVIDENCE', 'RESOLUTION_BEFORE', 'RESOLUTION_AFTER', 'DOCUMENT')`)
- `visibility` VARCHAR(20) DEFAULT 'CITIZEN' CHECK (`visibility IN ('CITIZEN', 'INTERNAL')`)
- `created_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

### Table 7: `notifications`
In-app alerts for status transitions and community support.
- `id` SERIAL PRIMARY KEY
- `user_id` INT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
- `complaint_id` INT REFERENCES `complaints(id)` ON DELETE CASCADE
- `title` VARCHAR(255) NOT NULL
- `message` TEXT NOT NULL
- `type` VARCHAR(50) DEFAULT 'STATUS_CHANGE'
- `is_read` BOOLEAN DEFAULT FALSE
- `created_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

### Table 8: `assignments`
Administrative dispatch linking complaints to departments and field officers (Member 3 & 4 handoff).
- `id` SERIAL PRIMARY KEY
- `complaint_id` INT NOT NULL REFERENCES `complaints(id)` ON DELETE CASCADE
- `department_id` INT NOT NULL REFERENCES `departments(id)` ON DELETE CASCADE
- `assigned_by` INT REFERENCES `users(id)` ON DELETE SET NULL
- `assigned_to_officer_id` INT REFERENCES `users(id)` ON DELETE SET NULL
- `status` VARCHAR(50) DEFAULT 'PENDING' CHECK (`status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'TRANSFERRED', 'COMPLETED')`)
- `notes` TEXT
- `created_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

---

## 2. Sequence
`complaint_tracking_seq` starts with 1, increment 1.
Used exclusively by `trackingIdService` to generate monotonic, unique IDs (`JSC-YYYY-000000`) atomically under concurrent transactions.

