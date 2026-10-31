import { query, withTransaction } from '../config/db.js';
import { generateTrackingId } from './trackingIdService.js';
import { suggestDepartment } from './departmentRoutingService.js';
import { getComplaintHistory } from './complaintHistoryService.js';

/**
 * Core Grievance & Citizen Complaint Lifecycle Service
 */

export const createComplaint = async (citizenId, complaintData, uploadedFiles = []) => {
  return await withTransaction(async (client) => {
    // 1. Generate concurrency-safe unique tracking ID
    const trackingId = await generateTrackingId(client);

    // 2. Compute Department Routing Suggestion
    const routingSuggestion = await suggestDepartment(
      complaintData.category,
      complaintData.title,
      complaintData.description
    );

    // 3. Insert complaint
    const insertSql = `
      INSERT INTO complaints (
        tracking_id, citizen_id, title, description, category, subcategory,
        state, district, area, landmark, location_address,
        latitude, longitude, priority, status,
        suggested_department_id, preferred_contact_method,
        is_emergency, is_public, supporter_count
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, 'SUBMITTED',
        $15, $16,
        $17, $18, 0
      ) RETURNING *;
    `;

    const values = [
      trackingId,
      citizenId,
      complaintData.title,
      complaintData.description,
      complaintData.category,
      complaintData.subcategory || null,
      complaintData.state || 'Maharashtra',
      complaintData.district,
      complaintData.area,
      complaintData.landmark || null,
      complaintData.location_address,
      complaintData.latitude || null,
      complaintData.longitude || null,
      complaintData.priority || 'MEDIUM',
      routingSuggestion.suggestedDepartmentId,
      complaintData.preferred_contact_method || 'IN_APP',
      Boolean(complaintData.is_emergency),
      complaintData.is_public !== undefined ? Boolean(complaintData.is_public) : true
    ];

    const compRes = await client.query(insertSql, values);
    const newComplaint = compRes.rows[0];

    // 4. Save attachments if any
    const attachments = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        const attachRes = await client.query(
          `INSERT INTO attachments (
            complaint_id, uploaded_by, file_name, storage_path, storage_key, mime_type, file_size, attachment_type, visibility
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'EVIDENCE', 'CITIZEN')
          RETURNING id, file_name, mime_type, file_size, created_at;`,
          [
            newComplaint.id,
            citizenId,
            file.originalname,
            file.filename,
            file.filename,
            file.mimetype,
            file.size
          ]
        );
        attachments.push(attachRes.rows[0]);
      }
    }

    // 5. Initial history entry
    await client.query(
      `INSERT INTO complaint_history (
        complaint_id, old_status, new_status, changed_by, action_title, remarks, visibility
      ) VALUES ($1, NULL, 'SUBMITTED', $2, 'Complaint Registered', 'Complaint submitted by citizen.', 'CITIZEN')`,
      [newComplaint.id, citizenId]
    );

    // 6. Citizen notification
    await client.query(
      `INSERT INTO notifications (user_id, complaint_id, title, message, type)
       VALUES ($1, $2, 'Complaint Submitted', $3, 'COMPLAINT_SUBMITTED')`,
      [
        citizenId,
        newComplaint.id,
        `Your complaint has been successfully registered with Tracking ID: ${trackingId}.`
      ]
    );

    return {
      complaint: newComplaint,
      trackingId,
      routingSuggestion,
      attachments
    };
  });
};

export const getMyComplaints = async (citizenId, {
  status = null,
  category = null,
  priority = null,
  search = null,
  sortBy = 'created_at',
  sortOrder = 'DESC',
  page = 1,
  limit = 10
}) => {
  const conditions = ['c.citizen_id = $1'];
  const params = [citizenId];
  let paramIdx = 2;

  if (status && status !== 'ALL') {
    conditions.push(`c.status = $${paramIdx}`);
    params.push(status);
    paramIdx++;
  }

  if (category && category !== 'ALL') {
    conditions.push(`c.category = $${paramIdx}`);
    params.push(category);
    paramIdx++;
  }

  if (priority && priority !== 'ALL') {
    conditions.push(`c.priority = $${paramIdx}`);
    params.push(priority);
    paramIdx++;
  }

  if (search && search.trim()) {
    conditions.push(`(c.tracking_id ILIKE $${paramIdx} OR c.title ILIKE $${paramIdx} OR c.area ILIKE $${paramIdx})`);
    params.push(`%${search.trim()}%`);
    paramIdx++;
  }

  const whereClause = conditions.join(' AND ');
  const validSortColumns = ['created_at', 'updated_at', 'supporter_count', 'priority', 'status'];
  const sortCol = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const sql = `
    SELECT 
      c.id,
      c.tracking_id,
      c.title,
      c.description,
      c.category,
      c.subcategory,
      c.state,
      c.district,
      c.area,
      c.landmark,
      c.location_address,
      c.priority,
      c.status,
      c.supporter_count,
      c.created_at,
      c.updated_at,
      d.name AS department_name,
      d.code AS department_code,
      (SELECT COUNT(*) FROM attachments a WHERE a.complaint_id = c.id) AS attachment_count
    FROM complaints c
    LEFT JOIN departments d ON c.department_id = d.id
    WHERE ${whereClause}
    ORDER BY c.${sortCol} ${sortDir}
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1};
  `;

  params.push(limit, offset);

  const countSql = `
    SELECT COUNT(*) AS total
    FROM complaints c
    WHERE ${whereClause};
  `;

  const [dataRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, params.slice(0, paramIdx - 1))
  ]);

  const total = parseInt(countRes.rows[0].total, 10);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    complaints: dataRes.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

export const getJoinedComplaints = async (citizenId, {
  status = null,
  search = null,
  page = 1,
  limit = 10
}) => {
  const conditions = ['cs.citizen_id = $1'];
  const params = [citizenId];
  let paramIdx = 2;

  if (status && status !== 'ALL') {
    conditions.push(`c.status = $${paramIdx}`);
    params.push(status);
    paramIdx++;
  }

  if (search && search.trim()) {
    conditions.push(`(c.tracking_id ILIKE $${paramIdx} OR c.title ILIKE $${paramIdx} OR c.area ILIKE $${paramIdx})`);
    params.push(`%${search.trim()}%`);
    paramIdx++;
  }

  const whereClause = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const sql = `
    SELECT 
      c.id,
      c.tracking_id,
      c.title,
      c.description,
      c.category,
      c.area,
      c.district,
      c.state,
      c.status,
      c.priority,
      c.supporter_count,
      c.created_at,
      cs.created_at AS joined_at,
      d.name AS department_name
    FROM complaint_supporters cs
    JOIN complaints c ON cs.complaint_id = c.id
    LEFT JOIN departments d ON c.department_id = d.id
    WHERE ${whereClause}
    ORDER BY cs.created_at DESC
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1};
  `;

  params.push(limit, offset);

  const countSql = `
    SELECT COUNT(*) AS total
    FROM complaint_supporters cs
    JOIN complaints c ON cs.complaint_id = c.id
    WHERE ${whereClause};
  `;

  const [dataRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, params.slice(0, paramIdx - 1))
  ]);

  const total = parseInt(countRes.rows[0].total, 10);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    complaints: dataRes.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

export const getComplaintById = async (complaintId, requestingUser = null) => {
  const sql = `
    SELECT 
      c.*,
      u.full_name AS citizen_name,
      d.name AS department_name,
      d.contact_email AS department_email,
      d.contact_phone AS department_phone,
      sd.name AS suggested_department_name
    FROM complaints c
    JOIN users u ON c.citizen_id = u.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN departments sd ON c.suggested_department_id = sd.id
    WHERE c.id = $1;
  `;

  const res = await query(sql, [complaintId]);
  if (res.rows.length === 0) {
    const error = new Error('Complaint not found.');
    error.statusCode = 404;
    throw error;
  }

  const row = res.rows[0];
  const isOwner = requestingUser && requestingUser.id === row.citizen_id;
  const isStaff = requestingUser && ['ADMIN', 'DEPARTMENT_OFFICER'].includes(requestingUser.role);

  // Check if current user has joined
  let hasJoined = false;
  if (requestingUser) {
    const supRes = await query(
      'SELECT id FROM complaint_supporters WHERE complaint_id = $1 AND citizen_id = $2',
      [complaintId, requestingUser.id]
    );
    hasJoined = supRes.rows.length > 0;
  }

  // Fetch attachments
  const attachRes = await query(
    `SELECT id, file_name, storage_key, mime_type, file_size, attachment_type, created_at 
     FROM attachments 
     WHERE complaint_id = $1 AND (visibility = 'CITIZEN' OR $2 = TRUE)
     ORDER BY created_at ASC`,
    [complaintId, isStaff]
  );

  // Fetch timeline history
  const timeline = await getComplaintHistory(complaintId, requestingUser ? requestingUser.role : 'CITIZEN');

  // Privacy protection: Generalized location unless owner or staff
  const safeLocation = (isOwner || isStaff) ? {
    locationAddress: row.location_address,
    area: row.area,
    district: row.district,
    state: row.state,
    landmark: row.landmark,
    latitude: row.latitude,
    longitude: row.longitude
  } : {
    locationAddress: `${row.area}, ${row.district}, ${row.state}`,
    area: row.area,
    district: row.district,
    state: row.state,
    landmark: row.landmark,
    latitude: row.latitude ? Math.round(row.latitude * 100) / 100 : null,
    longitude: row.longitude ? Math.round(row.longitude * 100) / 100 : null
  };

  return {
    id: row.id,
    trackingId: row.tracking_id,
    title: row.title,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory,
    priority: row.priority,
    status: row.status,
    location: safeLocation,
    supporterCount: row.supporter_count || 0,
    hasJoined,
    isOwner: Boolean(isOwner),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    resolutionNotes: row.resolution_notes,
    department: row.department_name ? {
      name: row.department_name,
      contactEmail: isOwner || isStaff ? row.department_email : null,
      contactPhone: isOwner || isStaff ? row.department_phone : null
    } : null,
    suggestedDepartment: row.suggested_department_name ? {
      name: row.suggested_department_name
    } : null,
    attachments: attachRes.rows.map(a => ({
      id: a.id,
      fileName: a.file_name,
      storageKey: a.storage_key,
      mimeType: a.mime_type,
      fileSize: a.file_size,
      attachmentType: a.attachment_type,
      url: `/uploads/complaints/${a.storage_key}`
    })),
    timeline
  };
};

export const trackComplaintByTrackingId = async (trackingId, requestingUser = null) => {
  const sql = `
    SELECT 
      c.id,
      c.tracking_id,
      c.title,
      c.description,
      c.category,
      c.subcategory,
      c.area,
      c.district,
      c.state,
      c.status,
      c.priority,
      c.supporter_count,
      c.created_at,
      c.updated_at,
      c.resolved_at,
      c.resolution_notes,
      c.citizen_id,
      d.name AS department_name
    FROM complaints c
    LEFT JOIN departments d ON c.department_id = d.id
    WHERE UPPER(c.tracking_id) = UPPER($1);
  `;

  const res = await query(sql, [trackingId.trim()]);
  if (res.rows.length === 0) {
    const error = new Error(`No complaint found with Tracking ID: ${trackingId}`);
    error.statusCode = 404;
    throw error;
  }

  const row = res.rows[0];
  const isOwner = requestingUser && requestingUser.id === row.citizen_id;

  // Retrieve public timeline
  const timeline = await getComplaintHistory(row.id, requestingUser ? requestingUser.role : 'CITIZEN');

  // Check if current user has joined
  let hasJoined = false;
  if (requestingUser) {
    const supRes = await query(
      'SELECT id FROM complaint_supporters WHERE complaint_id = $1 AND citizen_id = $2',
      [row.id, requestingUser.id]
    );
    hasJoined = supRes.rows.length > 0;
  }

  // Public safe response (excludes phone, email, private house coordinates)
  return {
    id: row.id,
    trackingId: row.tracking_id,
    title: row.title,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory,
    generalArea: `${row.area}, ${row.district}`,
    state: row.state,
    status: row.status,
    priority: row.priority,
    supporterCount: row.supporter_count || 0,
    departmentName: row.department_name || 'Pending Verification & Assignment',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    resolutionNotes: row.status === 'RESOLVED' ? row.resolution_notes : null,
    hasJoined,
    isOwner: Boolean(isOwner),
    timeline
  };
};

export const getCitizenDashboardData = async (citizenId) => {
  // 1. Stats
  const statsSql = `
    SELECT 
      COUNT(*) AS total_complaints,
      COUNT(CASE WHEN status = 'SUBMITTED' THEN 1 END) AS pending_complaints,
      COUNT(CASE WHEN status = 'UNDER_VERIFICATION' THEN 1 END) AS under_verification,
      COUNT(CASE WHEN status = 'ASSIGNED' THEN 1 END) AS assigned_complaints,
      COUNT(CASE WHEN status IN ('ACCEPTED', 'IN_PROGRESS') THEN 1 END) AS in_progress,
      COUNT(CASE WHEN status = 'RESOLUTION_SUBMITTED' THEN 1 END) AS resolution_submitted,
      COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) AS resolved_complaints
    FROM complaints
    WHERE citizen_id = $1;
  `;

  // 2. Joined count
  const joinedCountSql = `
    SELECT COUNT(*) AS joined_complaints 
    FROM complaint_supporters 
    WHERE citizen_id = $1;
  `;

  // 3. Recent 5 complaints submitted by citizen
  const recentSql = `
    SELECT 
      c.id, c.tracking_id, c.title, c.category, c.area, c.district, c.priority, c.status, c.supporter_count, c.created_at,
      d.name AS department_name
    FROM complaints c
    LEFT JOIN departments d ON c.department_id = d.id
    WHERE c.citizen_id = $1
    ORDER BY c.created_at DESC
    LIMIT 5;
  `;

  // 4. Recent activity/notifications
  const notifSql = `
    SELECT id, title, message, type, is_read, created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 6;
  `;

  const [statsRes, joinedRes, recentRes, notifRes] = await Promise.all([
    query(statsSql, [citizenId]),
    query(joinedCountSql, [citizenId]),
    query(recentSql, [citizenId]),
    query(notifSql, [citizenId])
  ]);

  const s = statsRes.rows[0];
  const j = joinedRes.rows[0];

  return {
    stats: {
      totalComplaints: parseInt(s.total_complaints || 0, 10),
      pendingComplaints: parseInt(s.pending_complaints || 0, 10),
      underVerification: parseInt(s.under_verification || 0, 10),
      assignedComplaints: parseInt(s.assigned_complaints || 0, 10),
      inProgress: parseInt(s.in_progress || 0, 10),
      resolutionSubmitted: parseInt(s.resolution_submitted || 0, 10),
      resolvedComplaints: parseInt(s.resolved_complaints || 0, 10),
      joinedComplaints: parseInt(j.joined_complaints || 0, 10)
    },
    recentComplaints: recentRes.rows,
    notifications: notifRes.rows
  };
};

export default {
  createComplaint,
  getMyComplaints,
  getJoinedComplaints,
  getComplaintById,
  trackComplaintByTrackingId,
  getCitizenDashboardData
};

