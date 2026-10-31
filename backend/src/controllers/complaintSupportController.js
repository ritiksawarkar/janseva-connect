import {
  joinComplaint,
  leaveComplaint,
  checkSupportStatus
} from '../services/complaintSupportService.js';
import { getJoinedComplaints } from '../services/complaintService.js';
import { query } from '../config/db.js';

export const handleJoinComplaint = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const citizenId = req.user.id;

    const result = await joinComplaint(complaintId, citizenId);

    return res.status(200).json({
      success: true,
      message: 'You have successfully joined and supported this community complaint.',
      data: result
    });
  } catch (err) {
    console.error('handleJoinComplaint error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || 'Failed to join community complaint.'
    });
  }
};

export const handleLeaveComplaint = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const citizenId = req.user.id;

    const result = await leaveComplaint(complaintId, citizenId);

    return res.status(200).json({
      success: true,
      message: 'Community support withdrawn.',
      data: result
    });
  } catch (err) {
    console.error('handleLeaveComplaint error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || 'Failed to withdraw community support.'
    });
  }
};

export const getSupportersList = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id, 10);

    // Return supporter count and public supporter representation
    const result = await query(
      `SELECT cs.id, cs.created_at, 
              CONCAT(SUBSTRING(u.full_name, 1, 1), '*** ', SUBSTRING(u.full_name FROM POSITION(' ' IN u.full_name) + 1 FOR 1), '***') AS supporter_initials
       FROM complaint_supporters cs
       JOIN users u ON cs.citizen_id = u.id
       WHERE cs.complaint_id = $1
       ORDER BY cs.created_at DESC
       LIMIT 20;`,
      [complaintId]
    );

    return res.json({
      success: true,
      data: {
        total: result.rows.length,
        supporters: result.rows
      }
    });
  } catch (err) {
    console.error('getSupportersList error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve supporters.'
    });
  }
};

export const getCitizenJoinedComplaintsList = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const { status, search, page, limit } = req.query;

    const result = await getJoinedComplaints(citizenId, {
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    });

    return res.json({
      success: true,
      data: result.complaints,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('getCitizenJoinedComplaintsList error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve joined complaints.'
    });
  }
};

export const getSupportStatus = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const citizenId = req.user ? req.user.id : null;

    const status = await checkSupportStatus(complaintId, citizenId);

    return res.json({
      success: true,
      data: status
    });
  } catch (err) {
    console.error('getSupportStatus error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to check support status.'
    });
  }
};
