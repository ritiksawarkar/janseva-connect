import api from './api';

export const getDashboardStats = async () => {
  const res = await api.get('/citizen/dashboard/stats');
  return res.data;
};

export const getRecentComplaints = async () => {
  const res = await api.get('/citizen/dashboard/recent-complaints');
  return res.data;
};

export const getDashboardNearbyComplaints = async (lat, lng) => {
  const query = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
  const res = await api.get(`/citizen/dashboard/nearby-complaints${query}`);
  return res.data;
};

export const getDashboardActivity = async () => {
  const res = await api.get('/citizen/dashboard/recent-activity');
  return res.data;
};

export const getMyComplaints = async (params = {}) => {
  const res = await api.get('/complaints/my', { params });
  return res.data;
};

export const getJoinedComplaints = async (params = {}) => {
  const res = await api.get('/citizen/joined-complaints', { params });
  return res.data;
};

export const getComplaintById = async (id) => {
  const res = await api.get(`/complaints/${id}`);
  return res.data;
};

export const submitComplaint = async (formData) => {
  // formData is a FormData instance containing fields and attachments
  const res = await api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const findNearbyComplaints = async (params = {}) => {
  const res = await api.get('/complaints/nearby', { params });
  return res.data;
};

export const joinComplaint = async (complaintId) => {
  const res = await api.post(`/complaints/${complaintId}/join`);
  return res.data;
};

export const leaveComplaint = async (complaintId) => {
  const res = await api.delete(`/complaints/${complaintId}/join`);
  return res.data;
};

export const trackComplaint = async (trackingId) => {
  const res = await api.get(`/complaints/track/${encodeURIComponent(trackingId)}`);
  return res.data;
};

export const getComplaintHistory = async (id) => {
  const res = await api.get(`/complaints/${id}/history`);
  return res.data;
};

export const getDepartments = async () => {
  const res = await api.get('/departments');
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get('/complaints/meta/categories');
  return res.data;
};

export default {
  getDashboardStats,
  getRecentComplaints,
  getDashboardNearbyComplaints,
  getDashboardActivity,
  getMyComplaints,
  getJoinedComplaints,
  getComplaintById,
  submitComplaint,
  findNearbyComplaints,
  joinComplaint,
  leaveComplaint,
  trackComplaint,
  getComplaintHistory,
  getDepartments,
  getCategories
};

