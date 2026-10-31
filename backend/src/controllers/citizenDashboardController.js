import { getCitizenDashboardData } from '../services/complaintService.js';
import { findNearbyComplaints } from '../services/nearbyComplaintService.js';
import { query } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const data = await getCitizenDashboardData(citizenId);
    return res.json({
      success: true,
      data: data.stats
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve citizen dashboard statistics.'
    });
  }
};

export const getRecentComplaints = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const data = await getCitizenDashboardData(citizenId);
    return res.json({
      success: true,
      data: data.recentComplaints
    });
  } catch (err) {
    console.error('getRecentComplaints error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent complaints.'
    });
  }
};

export const getDashboardNearbyComplaints = async (req, res) => {
  try {
    // If coordinates supplied in query, use them. Otherwise, default to user's most recent complaint location or city center
    let lat = req.query.lat ? parseFloat(req.query.lat) : null;
    let lng = req.query.lng ? parseFloat(req.query.lng) : null;

    if (!lat || !lng) {
      // Find coordinates from citizen's latest complaint
      const lastComp = await query(
        'SELECT latitude, longitude FROM complaints WHERE citizen_id = $1 AND latitude IS NOT NULL ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );
      if (lastComp.rows.length > 0) {
        lat = parseFloat(lastComp.rows[0].latitude);
        lng = parseFloat(lastComp.rows[0].longitude);
      } else {
        // Default to Pune Shivaji Nagar coordinates for demo
        lat = 18.5308;
        lng = 73.8475;
      }
    }

    const nearby = await findNearbyComplaints({
      latitude: lat,
      longitude: lng,
      radius: 5,
      currentUserId: req.user.id,
      limit: 4
    });

    return res.json({
      success: true,
      data: nearby.results
    });
  } catch (err) {
    console.error('getDashboardNearbyComplaints error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby active complaints.'
    });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const data = await getCitizenDashboardData(citizenId);
    return res.json({
      success: true,
      data: data.notifications
    });
  } catch (err) {
    console.error('getRecentActivity error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activity.'
    });
  }
};

export default {
  getDashboardStats,
  getRecentComplaints,
  getDashboardNearbyComplaints,
  getRecentActivity
};
