-- JanSeva Connect: Master Database Schema
-- Shared Tables across Members 1, 2, 3, and 4

-- 1. Users Table (Citizens, Admins, Department Officers)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN', -- 'ADMIN', 'DEPARTMENT_OFFICER', 'CITIZEN'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'FLAGGED'
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    email VARCHAR(150),
    phone VARCHAR(50),
    address TEXT,
    responsible_categories TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Officers Profile Table
CREATE TABLE IF NOT EXISTS officers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(100) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    designation VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(50) UNIQUE NOT NULL,
    citizen_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED', 
    -- 'SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLUTION_SUBMITTED', 'RESOLVED', 'REJECTED', 'NEEDS_INFORMATION', 'REASSIGNED', 'ESCALATED', 'REOPENED'
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    assigned_officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    verification_remarks TEXT,
    rejection_reason TEXT,
    info_request_reason TEXT,
    is_overdue BOOLEAN DEFAULT FALSE,
    supporters_count INTEGER DEFAULT 0,
    duplicate_warning BOOLEAN DEFAULT FALSE,
    similar_complaint_ids JSONB DEFAULT '[]'::jsonb,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Complaint History Table (Status Changes & Audit)
CREATE TABLE IF NOT EXISTS complaint_history (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assignment_status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'REASSIGNED', 'COMPLETED'
    remarks TEXT,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reassigned_at TIMESTAMPTZ
);

-- 7. Public Services Table
CREATE TABLE IF NOT EXISTS public_services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    eligibility TEXT,
    required_documents JSONB DEFAULT '[]'::jsonb,
    fees VARCHAR(255),
    application_steps JSONB DEFAULT '[]'::jsonb,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    official_application_url TEXT,
    official_source_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    publication_status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'PUBLISHED', 'UNPUBLISHED'
    current_version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Service Versions Table
CREATE TABLE IF NOT EXISTS service_versions (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES public_services(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    service_snapshot JSONB NOT NULL,
    source_url TEXT,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Government Schemes Table
CREATE TABLE IF NOT EXISTS government_schemes (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    objectives TEXT,
    benefits TEXT,
    category VARCHAR(100) NOT NULL,
    scheme_level VARCHAR(50) NOT NULL DEFAULT 'CENTRAL', -- 'CENTRAL', 'STATE'
    state VARCHAR(100),
    beneficiary_group VARCHAR(255),
    eligibility_criteria TEXT,
    structured_eligibility JSONB DEFAULT '{}'::jsonb,
    required_documents JSONB DEFAULT '[]'::jsonb,
    application_procedure TEXT,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    official_application_url TEXT,
    official_source_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    publication_status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'PUBLISHED', 'UNPUBLISHED'
    current_version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Scheme Versions Table
CREATE TABLE IF NOT EXISTS scheme_versions (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    scheme_snapshot JSONB NOT NULL,
    source_url TEXT,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. SLA Rules Table
CREATE TABLE IF NOT EXISTS sla_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'
    duration_value INTEGER NOT NULL,
    duration_unit VARCHAR(20) NOT NULL DEFAULT 'HOURS', -- 'HOURS', 'DAYS'
    escalation_threshold INTEGER NOT NULL DEFAULT 80,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Complaint SLA Table
CREATE TABLE IF NOT EXISTS complaint_sla (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    sla_rule_id INTEGER REFERENCES sla_rules(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    sla_status VARCHAR(50) DEFAULT 'RUNNING', -- 'RUNNING', 'BREACHED', 'COMPLIED', 'PAUSED'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Escalations Table
CREATE TABLE IF NOT EXISTS escalations (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    escalation_level INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    escalated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'INVESTIGATING', 'RESOLVED'
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- 14. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(150),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB DEFAULT '{}'::jsonb,
    new_values JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    category VARCHAR(100) DEFAULT 'GENERAL',
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipient_role VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    delivery_channel VARCHAR(50) DEFAULT 'IN_APP', -- 'IN_APP', 'EMAIL_SIMULATED', 'SMS_SIMULATED'
    delivery_status VARCHAR(50) DEFAULT 'DELIVERED', -- 'PENDING', 'DELIVERED', 'FAILED', 'SIMULATED'
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 17. Resolutions Table (Submitted by Department Officers for Verification)
CREATE TABLE IF NOT EXISTS resolutions (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    officer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resolution_title VARCHAR(255) NOT NULL,
    resolution_description TEXT NOT NULL,
    work_completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    officer_remarks TEXT,
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'APPROVED', 'REJECTED'
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 18. Resolution Evidence Table (Before/After photographs and supporting docs)
CREATE TABLE IF NOT EXISTS resolution_evidence (
    id SERIAL PRIMARY KEY,
    resolution_id INTEGER NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL, -- URL or local path
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    evidence_type VARCHAR(50) NOT NULL DEFAULT 'AFTER', -- 'BEFORE', 'AFTER', 'SUPPORTING'
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_complaints_tracking_id ON complaints(tracking_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_assignments_complaint ON assignments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_complaint ON resolutions(complaint_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_officer ON resolutions(officer_id);
CREATE INDEX IF NOT EXISTS idx_evidence_resolution ON resolution_evidence(resolution_id);
