import { query, withTransaction } from '../config/db.js';

/**
 * Community Complaint Joining Service
 * Implements atomic support join/leave, duplicate prevention, and supporter count sync.
 */
export const joinComplaint = async (complaintId, citizenId) => {
  return await withTransaction(async (client) => {
    // 1. Fetch complaint
    const compRes = await client.query(
      'SELECT id, tracking_id, citizen_id, title, status, supporter_count FROM complaints WHERE id = $1 FOR UPDATE',
      [complaintId]
    );

    if (compRes.rows.length === 0) {
      const error = new Error('Complaint not found.');
      error.statusCode = 404;
      throw error;
    }

    const complaint = compRes.rows[0];

    // 2. Validate eligibility
    if (['RESOLVED', 'REJECTED'].includes(complaint.status)) {
      const error = new Error(`Cannot join a complaint that is ${complaint.status.toLowerCase()}.`);
      error.statusCode = 400;
      throw error;
    }

    // 3. Citizen cannot support their own complaint
    if (complaint.citizen_id === citizenId) {
      const error = new Error('You cannot join your own complaint as a separate community supporter.');
      error.statusCode = 400;
      throw error;
    }

    // 4. Check if already joined
    const existingRes = await client.query(
      'SELECT id FROM complaint_supporters WHERE complaint_id = $1 AND citizen_id = $2',
      [complaintId, citizenId]
    );

    if (existingRes.rows.length > 0) {
      const error = new Error('You have already supported this complaint.');
      error.statusCode = 409;
      throw error;
    }

    // 5. Insert support record
    await client.query(
      'INSERT INTO complaint_supporters (complaint_id, citizen_id) VALUES ($1, $2)',
      [complaintId, citizenId]
    );

    // 6. Recalculate and update supporter count atomically
    const countRes = await client.query(
      'SELECT COUNT(*) AS total FROM complaint_supporters WHERE complaint_id = $1',
      [complaintId]
    );
    const newCount = parseInt(countRes.rows[0].total, 10);

    await client.query(
      'UPDATE complaints SET supporter_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newCount, complaintId]
    );

    // 7. Audit log in complaint_history
    await client.query(
      `INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, action_title, remarks, visibility)
       VALUES ($1, $2, $2, $3, 'Community Support Added', 'A neighborhood citizen joined in support of this complaint.', 'CITIZEN')`,
      [complaintId, complaint.status, citizenId]
    );

    // 8. Notify complaint creator
    await client.query(
      `INSERT INTO notifications (user_id, complaint_id, title, message, type)
       VALUES ($1, $2, 'New Supporter Added', 'A fellow citizen joined and supported your complaint (${complaint.tracking_id}).', 'COMMUNITY_SUPPORT')`,
      [complaint.citizen_id, complaintId]
    );

    return {
      complaintId: complaint.id,
      trackingId: complaint.tracking_id,
      supporterCount: newCount,
      joined: true
    };
  });
};

export const leaveComplaint = async (complaintId, citizenId) => {
  return await withTransaction(async (client) => {
    const compRes = await client.query(
      'SELECT id, tracking_id, citizen_id, status FROM complaints WHERE id = $1 FOR UPDATE',
      [complaintId]
    );

    if (compRes.rows.length === 0) {
      const error = new Error('Complaint not found.');
      error.statusCode = 404;
      throw error;
    }

    const complaint = compRes.rows[0];

    const delRes = await client.query(
      'DELETE FROM complaint_supporters WHERE complaint_id = $1 AND citizen_id = $2 RETURNING id',
      [complaintId, citizenId]
    );

    if (delRes.rows.length === 0) {
      const error = new Error('You are not currently a supporter of this complaint.');
      error.statusCode = 400;
      throw error;
    }

    // Recalculate supporter count
    const countRes = await client.query(
      'SELECT COUNT(*) AS total FROM complaint_supporters WHERE complaint_id = $1',
      [complaintId]
    );
    const newCount = parseInt(countRes.rows[0].total, 10);

    await client.query(
      'UPDATE complaints SET supporter_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newCount, complaintId]
    );

    await client.query(
      `INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, action_title, remarks, visibility)
       VALUES ($1, $2, $2, $3, 'Community Support Withdrawn', 'A citizen withdrew their community support.', 'INTERNAL')`,
      [complaintId, complaint.status, citizenId]
    );

    return {
      complaintId: complaint.id,
      trackingId: complaint.tracking_id,
      supporterCount: newCount,
      joined: false
    };
  });
};

export const checkSupportStatus = async (complaintId, citizenId) => {
  if (!citizenId) return { joined: false };
  const res = await query(
    'SELECT id, created_at FROM complaint_supporters WHERE complaint_id = $1 AND citizen_id = $2',
    [complaintId, citizenId]
  );
  return {
    joined: res.rows.length > 0,
    supportedAt: res.rows.length > 0 ? res.rows[0].created_at : null
  };
};

export default {
  joinComplaint,
  leaveComplaint,
  checkSupportStatus
};
