import { findNearbyComplaints } from '../services/nearbyComplaintService.js';
import { getComplaintById } from '../services/complaintService.js';
import { nearbySearchSchema } from '../validators/nearbyComplaintValidator.js';

export const getNearbyComplaints = async (req, res) => {
  try {
    const parseRes = nearbySearchSchema.safeParse(req.query);
    if (!parseRes.success) {
      return res.status(400).json({
        success: false,
        message: parseRes.error.issues[0].message
      });
    }

    const currentUserId = req.user ? req.user.id : null;
    const result = await findNearbyComplaints({
      ...parseRes.data,
      currentUserId
    });

    return res.json({
      success: true,
      data: result.results,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('getNearbyComplaints error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to search nearby complaints.'
    });
  }
};

export const searchNearbyComplaintsPost = async (req, res) => {
  try {
    const parseRes = nearbySearchSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({
        success: false,
        message: parseRes.error.issues[0].message
      });
    }

    const currentUserId = req.user ? req.user.id : null;
    const result = await findNearbyComplaints({
      ...parseRes.data,
      currentUserId
    });

    return res.json({
      success: true,
      data: result.results,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('searchNearbyComplaintsPost error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to search nearby complaints.'
    });
  }
};

export const getNearbyComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await getComplaintById(parseInt(id, 10), req.user);

    return res.json({
      success: true,
      data: complaint
    });
  } catch (err) {
    console.error('getNearbyComplaintDetails error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || 'Failed to retrieve nearby complaint details.'
    });
  }
};

