-- JanSeva Connect Seed Data
-- Member 1: Core Grievance Management & Integration Lead

-- 1. Seed Departments
INSERT INTO departments (id, name, code, description, contact_email, contact_phone) VALUES
(1, 'Sanitation & Solid Waste Management', 'SANITATION', 'Handles solid waste collection, street cleaning, garbage dumping, and sanitation issues.', 'sanitation@janseva.gov.in', '+91 20 2550 1101'),
(2, 'Public Works Department (PWD)', 'PWD', 'Responsible for roads, potholes, pavements, footpaths, bridges, and civil public infrastructure.', 'pwd@janseva.gov.in', '+91 20 2550 1102'),
(3, 'Electrical & Power Supply', 'ELECTRICAL', 'Maintains streetlights, public illumination, electrical poles, and transformers.', 'electrical@janseva.gov.in', '+91 20 2550 1103'),
(4, 'Water Supply & Sewerage', 'WATER', 'Oversees drinking water pipelines, leakage repairs, water supply timing, and meters.', 'watersupply@janseva.gov.in', '+91 20 2550 1104'),
(5, 'Drainage & Stormwater Management', 'DRAINAGE', 'Manages drainage channels, storm water overflows, gutter blockage, and flood control.', 'drainage@janseva.gov.in', '+91 20 2550 1105'),
(6, 'Public Health & Environment', 'HEALTH', 'Supervises pest control, mosquito fogging, public hygiene, and environmental sanitation.', 'health@janseva.gov.in', '+91 20 2550 1106'),
(7, 'General Administration & Citizen Services', 'GENERAL', 'Handles complaints requiring multi-departmental coordination or general review.', 'admin@janseva.gov.in', '+91 20 2550 1100')
ON CONFLICT (id) DO NOTHING;
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- 2. Seed Users (Citizens, Officers, Admin)
-- Passwords:
-- Citizen@123 -> $2b$10$/QFqxDRYn2aBlvAOdKkOrOBkGcue7o6pXk6ItUZe/Ru6tdhBfbEaW
-- Officer@123 -> $2b$10$KkCnkMVpWR16WElGTzjxCemZzwzJtTuhK2BzOWx.pqMLxJ9pnwsPi
-- Admin@123   -> $2b$10$ZoeucUvBxbijxLw7AXySDOjPVOUrsmags5f/bJdgDfcUp.KDYrILy

INSERT INTO users (id, full_name, email, phone, password_hash, role, department_id) VALUES
(1, 'Ritik Sawarkar', 'citizen@janseva.gov.in', '+91 9876543210', '$2b$10$/QFqxDRYn2aBlvAOdKkOrOBkGcue7o6pXk6ItUZe/Ru6tdhBfbEaW', 'CITIZEN', NULL),
(2, 'Priya Sharma', 'priya@janseva.gov.in', '+91 9876543211', '$2b$10$/QFqxDRYn2aBlvAOdKkOrOBkGcue7o6pXk6ItUZe/Ru6tdhBfbEaW', 'CITIZEN', NULL),
(3, 'Amit Patel', 'amit@janseva.gov.in', '+91 9876543212', '$2b$10$/QFqxDRYn2aBlvAOdKkOrOBkGcue7o6pXk6ItUZe/Ru6tdhBfbEaW', 'CITIZEN', NULL),
(4, 'Ramesh Shinde (Sanitation Officer)', 'officer@janseva.gov.in', '+91 9876543213', '$2b$10$KkCnkMVpWR16WElGTzjxCemZzwzJtTuhK2BzOWx.pqMLxJ9pnwsPi', 'DEPARTMENT_OFFICER', 1),
(5, 'Sunita Jadhav (PWD Engineer)', 'pwd.officer@janseva.gov.in', '+91 9876543214', '$2b$10$KkCnkMVpWR16WElGTzjxCemZzwzJtTuhK2BzOWx.pqMLxJ9pnwsPi', 'DEPARTMENT_OFFICER', 2),
(6, 'JanSeva Admin', 'admin@janseva.gov.in', '+91 9876543215', '$2b$10$ZoeucUvBxbijxLw7AXySDOjPVOUrsmags5f/bJdgDfcUp.KDYrILy', 'ADMIN', NULL)
ON CONFLICT (id) DO NOTHING;
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Seed Initial Complaints with coordinates
-- Locations in Pune:
-- Shivaji Nagar: 18.5308, 73.8475
-- FC Road / Deccan: 18.5196, 73.8410 (~1.4 km from Shivaji Nagar)
-- Kothrud: 18.5074, 73.8077 (~5 km)
-- Model Colony: 18.5362, 73.8340 (~1.5 km)

INSERT INTO complaints (
    id, tracking_id, citizen_id, title, description, category, subcategory,
    state, district, area, landmark, location_address,
    latitude, longitude, priority, status,
    department_id, suggested_department_id, preferred_contact_method,
    is_emergency, is_public, supporter_count, resolution_notes, resolved_at, created_at, updated_at
) VALUES
(
    1, 'JSC-2026-000001', 2,
    'Uncollected Garbage Heap creating foul smell',
    'Severe garbage accumulation outside municipal park corner. Uncollected for past 4 days, causing foul smell and street dog issues.',
    'Sanitation', 'Garbage Accumulation',
    'Maharashtra', 'Pune', 'Shivaji Nagar', 'Near Model Colony Park Gate',
    'Plot 14, FC Road Lane 2, Shivaji Nagar, Pune 411005',
    18.5308000, 73.8475000, 'HIGH', 'IN_PROGRESS',
    1, 1, 'IN_APP',
    FALSE, TRUE, 8, NULL, NULL,
    CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
    2, 'JSC-2026-000002', 3,
    'Open garbage dump on pedestrian pavement',
    'Citizens dumping commercial food waste directly on the pavement. Dustbins are overflowing.',
    'Sanitation', 'Overflowing Dustbin',
    'Maharashtra', 'Pune', 'Shivaji Nagar', 'Opposite Agriculture College Gate',
    'Near Agriculture College, Shivaji Nagar, Pune 411005',
    18.5330000, 73.8490000, 'MEDIUM', 'UNDER_VERIFICATION',
    1, 1, 'IN_APP',
    FALSE, TRUE, 4, NULL, NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
    3, 'JSC-2026-000003', 1,
    'Dangerous pothole near Shivaji Nagar bus station',
    'Deep potholes formed after heavy rain near the bus depot entrance. Risk of two-wheeler accidents.',
    'Public Works', 'Pothole',
    'Maharashtra', 'Pune', 'Shivaji Nagar', 'Bus Stand Entrance',
    'Old Mumbai-Pune Highway, Shivaji Nagar, Pune 411005',
    18.5320000, 73.8460000, 'HIGH', 'ASSIGNED',
    2, 2, 'IN_APP',
    FALSE, TRUE, 12, NULL, NULL,
    CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    4, 'JSC-2026-000004', 1,
    'Non-functioning streetlights along Ghole Road',
    'Four consecutive streetlights have been dark for over a week, leading to unsafe night pedestrian movement.',
    'Electrical', 'Streetlight Failure',
    'Maharashtra', 'Pune', 'Shivaji Nagar', 'Ghole Road Municipal Library',
    'Ghole Road, Ward 12, Shivaji Nagar, Pune 411004',
    18.5280000, 73.8440000, 'MEDIUM', 'SUBMITTED',
    NULL, 3, 'IN_APP',
    FALSE, TRUE, 1, NULL, NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
    5, 'JSC-2026-000005', 2,
    'Clean drinking water pipeline fracture and heavy leakage',
    'Main supply pipe burst resulting in thousands of litres of potable water flooding the street since early morning.',
    'Water Supply', 'Pipe Burst',
    'Maharashtra', 'Pune', 'Kothrud', 'Near Karve Statue',
    'Karve Road, Kothrud, Pune 411038',
    18.5074000, 73.8077000, 'EMERGENCY', 'RESOLVED',
    4, 4, 'IN_APP',
    TRUE, TRUE, 15,
    'Main pipeline section replaced and tested under 4.5 bar pressure. Road reinstated and water flow restored.',
    CURRENT_TIMESTAMP - INTERVAL '6 hours',
    CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '6 hours'
)
ON CONFLICT (id) DO NOTHING;

SELECT setval('complaints_id_seq', (SELECT MAX(id) FROM complaints));
-- Sync sequence for tracking ID generator
SELECT setval('complaint_tracking_seq', 5);

-- 4. Seed Complaint Supporters
INSERT INTO complaint_supporters (complaint_id, citizen_id, created_at) VALUES
(1, 1, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 3, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 2, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 3, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(5, 1, CURRENT_TIMESTAMP - INTERVAL '4 days')
ON CONFLICT (complaint_id, citizen_id) DO NOTHING;

-- 5. Seed Complaint History (with Citizen vs Internal visibility)
INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, action_title, remarks, visibility, created_at) VALUES
-- Complaint 1 History
(1, NULL, 'SUBMITTED', 2, 'Complaint Registered', 'Grievance submitted by citizen with 2 photographic attachments.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(1, 'SUBMITTED', 'UNDER_VERIFICATION', 6, 'Verification Initiated', 'Location and category matched with Ward 12 sanitation registry.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '2 days 18 hours'),
(1, 'UNDER_VERIFICATION', 'UNDER_VERIFICATION', 6, 'Internal Ward Verification', 'Assessed sanitary inspector route checklist.', 'INTERNAL', CURRENT_TIMESTAMP - INTERVAL '2 days 12 hours'),
(1, 'UNDER_VERIFICATION', 'VERIFIED', 6, 'Complaint Verified', 'Grievance verified as genuine municipal jurisdiction issue.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 'VERIFIED', 'ASSIGNED', 6, 'Assigned to Department', 'Assigned to Sanitation & Solid Waste Management.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '1 day 18 hours'),
(1, 'ASSIGNED', 'ACCEPTED', 4, 'Assignment Accepted', 'Sanitation Officer Ramesh Shinde accepted assignment.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '1 day 12 hours'),
(1, 'ACCEPTED', 'IN_PROGRESS', 4, 'Work Started', 'Solid waste collection crew and mini-compactor vehicle dispatched to site.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- Complaint 3 History
(3, NULL, 'SUBMITTED', 1, 'Complaint Registered', 'Citizen Ritik Sawarkar registered road pothole complaint.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(3, 'SUBMITTED', 'UNDER_VERIFICATION', 6, 'Verification Initiated', 'Assessing road classification (Municipal vs State Highway).', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '3 days 18 hours'),
(3, 'UNDER_VERIFICATION', 'VERIFIED', 6, 'Complaint Verified', 'Road falls under PWD Central Division.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 'VERIFIED', 'ASSIGNED', 6, 'Assigned to PWD', 'Work order generated for asphalt road patching team.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- Complaint 5 History (Resolved)
(5, NULL, 'SUBMITTED', 2, 'Complaint Registered', 'Water pipe leakage reported.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 'SUBMITTED', 'VERIFIED', 6, 'Verified as Emergency', 'Escalated due to high-pressure potable water wastage.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '4 days 20 hours'),
(5, 'VERIFIED', 'ASSIGNED', 6, 'Assigned to Water Supply', 'Emergency repair valve isolation crew alerted.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '4 days 18 hours'),
(5, 'ASSIGNED', 'IN_PROGRESS', 4, 'Repair in Progress', 'Section isolated and excavation underway.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(5, 'IN_PROGRESS', 'RESOLUTION_SUBMITTED', 4, 'Resolution Submitted', 'Pipe replaced, tested, and pressure normalized.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
(5, 'RESOLUTION_SUBMITTED', 'RESOLVED', 6, 'Complaint Resolved', 'Site inspection completed. Verified by Municipal Engineer.', 'CITIZEN', CURRENT_TIMESTAMP - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

-- 6. Seed Notifications
INSERT INTO notifications (user_id, complaint_id, title, message, type, is_read, created_at) VALUES
(1, 3, 'Complaint Assigned', 'Your complaint JSC-2026-000003 has been assigned to Public Works Department.', 'STATUS_CHANGE', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 1, 'Community Complaint Progress', 'Complaint JSC-2026-000001 that you joined is now IN_PROGRESS.', 'STATUS_CHANGE', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 5, 'Resolution Complete', 'Complaint JSC-2026-000005 that you supported has been successfully resolved!', 'RESOLVED', TRUE, CURRENT_TIMESTAMP - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;
