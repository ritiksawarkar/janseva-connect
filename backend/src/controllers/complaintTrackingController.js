import { trackComplaintByTrackingId } from '../services/complaintService.js';
import { getComplaintHistory } from '../services/complaintHistoryService.js';

export const trackComplaint = async (req, res) => {
  try {
    const { trackingId } = req.params;
    if (!trackingId || !trackingId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID is required.'
      });
    }

    const data = await trackComplaintByTrackingId(trackingId, req.user);

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('trackComplaint error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || 'Error tracking complaint.'
    });
  }
};

export const getHistoryTimeline = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const userRole = req.user ? req.user.role : 'CITIZEN';

    const timeline = await getComplaintHistory(complaintId, userRole);

    return res.json({
      success: true,
      data: timeline
    });
  } catch (err) {
    console.error('getHistoryTimeline error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint history.'
    });
  }
};

export default {
  trackComplaint,
  getHistoryTimeline
};
