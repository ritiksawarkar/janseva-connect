import {
  createComplaint,
  getMyComplaints,
  getComplaintById
} from '../services/complaintService.js';
import { createComplaintSchema, updateComplaintSchema } from '../validators/complaintValidator.js';
import { query } from '../config/db.js';

export const registerComplaint = async (req, res) => {
  try {
    const parseRes = createComplaintSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({
        success: false,
        message: parseRes.error.issues[0].message,
        errors: parseRes.error.format()
      });
    }

    const citizenId = req.user.id;
    const uploadedFiles = req.files || [];

    const result = await createComplaint(citizenId, parseRes.data, uploadedFiles);

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully. Your tracking ID has been generated.',
      data: {
        complaintId: result.complaint.id,
        trackingId: result.trackingId,
        status: result.complaint.status,
        suggestedDepartment: result.routingSuggestion.departmentName,
        routingExplanation: result.routingSuggestion.explanation,
        attachmentCount: result.attachments.length
      }
    });
  } catch (err) {
    console.error('registerComplaint error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit grievance. Please try again later.'
    });
  }
};

export const getCitizenComplaints = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const { status, category, priority, search, sortBy, sortOrder, page, limit } = req.query;

    const data = await getMyComplaints(citizenId, {
      status,
      category,
      priority,
      search,
      sortBy,
      sortOrder,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    });

    return res.json({
      success: true,
      data: data.complaints,
      pagination: data.pagination
    });
  } catch (err) {
    console.error('getCitizenComplaints error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your complaints.'
    });
  }
};

export const getComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await getComplaintById(parseInt(id, 10), req.user);

    return res.json({
      success: true,
      data: complaint
    });
  } catch (err) {
    console.error('getComplaint error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || 'Failed to retrieve complaint details.'
    });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenId = req.user.id;

    // Check ownership and current status
    const existing = await query(
      'SELECT id, citizen_id, status FROM complaints WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    const comp = existing.rows[0];
    if (comp.citizen_id !== citizenId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this complaint.'
      });
    }

    if (!['SUBMITTED', 'NEEDS_INFORMATION'].includes(comp.status)) {
      return res.status(400).json({
        success: false,
        message: `Complaint cannot be modified while it is ${comp.status.toLowerCase().replace('_', ' ')}.`
      });
    }

    const parseRes = updateComplaintSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({
        success: false,
        message: parseRes.error.issues[0].message
      });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(parseRes.data)) {
      if (val !== undefined) {
        updates.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update.'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateSql = `UPDATE complaints SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *;`;
    const result = await query(updateSql, values);

    return res.json({
      success: true,
      message: 'Complaint updated successfully.',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('updateComplaint error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint.'
    });
  }
};

