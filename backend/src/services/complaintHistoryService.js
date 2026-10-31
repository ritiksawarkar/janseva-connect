import { query } from '../config/db.js';

/**
 * Complaint History and Status Timeline Service
 * Enforces strict visibility controls to prevent leaking internal administrative notes.
 */
export const getComplaintHistory = async (complaintId, userRole = 'CITIZEN') => {
  let visibilityClause = "ch.visibility = 'CITIZEN'";

  // Internal and admin staff can view officer/internal remarks
  if (['ADMIN', 'DEPARTMENT_OFFICER'].includes(userRole)) {
    visibilityClause = "ch.visibility IN ('CITIZEN', 'OFFICER', 'INTERNAL')";
  }

  const sql = `
    SELECT 
      ch.id,
      ch.complaint_id,
      ch.old_status,
      ch.new_status,
      ch.action_title,
      ch.remarks,
      ch.visibility,
      ch.created_at,
      u.full_name AS actor_name,
      u.role AS actor_role,
      d.name AS actor_department
    FROM complaint_history ch
    LEFT JOIN users u ON ch.changed_by = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE ch.complaint_id = $1 AND ${visibilityClause}
    ORDER BY ch.created_at ASC;
  `;

  const result = await query(sql, [complaintId]);

  return result.rows.map((row) => ({
    id: row.id,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    actionTitle: row.action_title,
    remarks: row.remarks,
    visibility: row.visibility,
    timestamp: row.created_at,
    actor: {
      name: ['ADMIN', 'DEPARTMENT_OFFICER'].includes(userRole) ? row.actor_name : (row.actor_role === 'ADMIN' ? 'JanSeva Admin' : (row.actor_role === 'DEPARTMENT_OFFICER' ? (row.actor_department || 'Department Officer') : 'Citizen')),
      role: row.actor_role
    }
  }));
};

export default {
  getComplaintHistory
};
