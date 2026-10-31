-- JanSeva Connect Database Initialization Schema
-- Member 1: Core Grievance Management & Integration Lead

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'ADMIN', 'DEPARTMENT_OFFICER')),
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Dedicated Sequence for Concurrency-Safe Unique Tracking IDs
CREATE SEQUENCE IF NOT EXISTS complaint_tracking_seq START WITH 1 INCREMENT BY 1;

-- 4. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(50) UNIQUE NOT NULL,
    citizen_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    district VARCHAR(100) NOT NULL,
    area VARCHAR(150) NOT NULL,
    landmark VARCHAR(255),
    location_address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
    status VARCHAR(50) DEFAULT 'SUBMITTED' CHECK (status IN (
        'SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'ACCEPTED',
        'IN_PROGRESS', 'RESOLUTION_SUBMITTED', 'RESOLVED', 'REJECTED',
        'NEEDS_INFORMATION', 'REASSIGNED', 'ESCALATED', 'REOPENED'
    )),
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    suggested_department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    preferred_contact_method VARCHAR(50) DEFAULT 'IN_APP' CHECK (preferred_contact_method IN ('IN_APP', 'EMAIL', 'SMS')),
    is_emergency BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    supporter_count INT DEFAULT 0,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Complaint Community Supporters Table
CREATE TABLE IF NOT EXISTS complaint_supporters (
    id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_complaint_supporter UNIQUE (complaint_id, citizen_id)
);

-- 6. Complaint History & Audit Timeline Table
CREATE TABLE IF NOT EXISTS complaint_history (
    id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT REFERENCES users(id) ON DELETE SET NULL,
    action_title VARCHAR(150) NOT NULL,
    remarks TEXT,
    visibility VARCHAR(20) DEFAULT 'CITIZEN' CHECK (visibility IN ('CITIZEN', 'INTERNAL', 'OFFICER')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    uploaded_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    attachment_type VARCHAR(50) DEFAULT 'EVIDENCE' CHECK (attachment_type IN ('EVIDENCE', 'RESOLUTION_BEFORE', 'RESOLUTION_AFTER', 'DOCUMENT')),
    visibility VARCHAR(20) DEFAULT 'CITIZEN' CHECK (visibility IN ('CITIZEN', 'INTERNAL')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'STATUS_CHANGE',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    assigned_by INT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_officer_id INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'TRANSFERRED', 'COMPLETED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Complaint Feedback Table
CREATE TABLE IF NOT EXISTS complaint_feedback (
    id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    is_satisfied BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_complaint_feedback UNIQUE (complaint_id, citizen_id)
);

-- Indexes for Optimal Performance
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_tracking_id ON complaints(tracking_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_coords ON complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaint_supporters_comp_user ON complaint_supporters(complaint_id, citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaint_history_comp ON complaint_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_attachments_comp ON attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_comp ON assignments(complaint_id);

