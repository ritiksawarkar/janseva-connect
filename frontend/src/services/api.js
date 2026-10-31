import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Intercept requests to add JWT token (checks officerToken for officer routes or adminToken)
api.interceptors.request.use(
  (config) => {
    const isOfficerRequest = config.url && config.url.includes("/officer");
    const officerToken = localStorage.getItem("officerToken");
    const adminToken = localStorage.getItem("adminToken");
    const token = isOfficerRequest ? (officerToken || adminToken) : (adminToken || officerToken);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith("/officer") && !window.location.pathname.includes("/officer/login")) {
        localStorage.removeItem("officerToken");
        localStorage.removeItem("officerUser");
        window.location.href = "/officer/login?expired=true";
      } else if (!window.location.pathname.includes("/admin/login") && !window.location.pathname.startsWith("/officer")) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        window.location.href = "/admin/login?expired=true";
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

// Auth Endpoints
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me")
};

// Dashboard Endpoints
export const dashboardApi = {
  getStats: (params) => api.get("/admin/dashboard/stats", { params }),
  getTrends: () => api.get("/admin/dashboard/complaint-trends"),
  getDepartmentPerformance: () => api.get("/admin/dashboard/department-performance"),
  getRecentActivity: () => api.get("/admin/dashboard/recent-activity")
};

// Citizen Management
export const citizensApi = {
  getCitizens: (params) => api.get("/admin/citizens", { params }),
  getCitizenById: (id) => api.get(`/admin/citizens/${id}`),
  updateStatus: (id, payload) => api.patch(`/admin/citizens/${id}/status`, payload),
  flagCitizen: (id, payload) => api.patch(`/admin/citizens/${id}/flag`, payload),
  getCitizenComplaints: (id) => api.get(`/admin/citizens/${id}/complaints`)
};

// Complaint Management
export const complaintsApi = {
  getComplaints: (params) => api.get("/admin/complaints", { params }),
  getPendingVerification: () => api.get("/admin/complaints/pending-verification"),
  getComplaintById: (id) => api.get(`/admin/complaints/${id}`),
  verify: (id, payload) => api.patch(`/admin/complaints/${id}/verify`, payload),
  reject: (id, payload) => api.patch(`/admin/complaints/${id}/reject`, payload),
  requestInformation: (id, payload) => api.patch(`/admin/complaints/${id}/request-information`, payload),
  getHistory: (id) => api.get(`/admin/complaints/${id}/history`)
};

// Assignments
export const assignmentsApi = {
  getAssignments: (params) => api.get("/admin/assignments", { params }),
  createAssignment: (payload) => api.post("/admin/assignments", payload),
  reassign: (id, payload) => api.patch(`/admin/assignments/${id}/reassign`, payload),
  getForComplaint: (complaintId) => api.get(`/admin/complaints/${complaintId}/assignments`)
};

// Departments
export const departmentsApi = {
  getDepartments: (params) => api.get("/admin/departments", { params }),
  getDepartmentById: (id) => api.get(`/admin/departments/${id}`),
  create: (payload) => api.post("/admin/departments", payload),
  update: (id, payload) => api.put(`/admin/departments/${id}`, payload),
  updateStatus: (id, payload) => api.patch(`/admin/departments/${id}/status`, payload),
  getOfficers: (id) => api.get(`/admin/departments/${id}/officers`),
  getComplaints: (id) => api.get(`/admin/departments/${id}/complaints`)
};

// Officers
export const officersApi = {
  getOfficers: (params) => api.get("/admin/officers", { params }),
  getOfficerById: (id) => api.get(`/admin/officers/${id}`),
  create: (payload) => api.post("/admin/officers", payload),
  update: (id, payload) => api.put(`/admin/officers/${id}`, payload),
  updateStatus: (id, payload) => api.patch(`/admin/officers/${id}/status`, payload),
  getAssignments: (id) => api.get(`/admin/officers/${id}/assignments`)
};

// Services
export const servicesApi = {
  getServices: (params) => api.get("/admin/services", { params }),
  getServiceById: (id) => api.get(`/admin/services/${id}`),
  create: (payload) => api.post("/admin/services", payload),
  update: (id, payload) => api.put(`/admin/services/${id}`, payload),
  verify: (id, payload) => api.patch(`/admin/services/${id}/verify`, payload),
  publish: (id, payload) => api.patch(`/admin/services/${id}/publish`, payload),
  getVersions: (id) => api.get(`/admin/services/${id}/versions`)
};

// Schemes
export const schemesApi = {
  getSchemes: (params) => api.get("/admin/schemes", { params }),
  getSchemeById: (id) => api.get(`/admin/schemes/${id}`),
  create: (payload) => api.post("/admin/schemes", payload),
  update: (id, payload) => api.put(`/admin/schemes/${id}`, payload),
  verify: (id, payload) => api.patch(`/admin/schemes/${id}/verify`, payload),
  publish: (id, payload) => api.patch(`/admin/schemes/${id}/publish`, payload),
  getVersions: (id) => api.get(`/admin/schemes/${id}/versions`)
};

// SLA Rules
export const slaApi = {
  getRules: (params) => api.get("/admin/sla-rules", { params }),
  createRule: (payload) => api.post("/admin/sla-rules", payload),
  updateRule: (id, payload) => api.put(`/admin/sla-rules/${id}`, payload),
  updateStatus: (id, payload) => api.patch(`/admin/sla-rules/${id}/status`, payload)
};

// Escalations
export const escalationsApi = {
  getEscalations: (params) => api.get("/admin/escalations", { params }),
  getEscalationById: (id) => api.get(`/admin/escalations/${id}`),
  create: (payload) => api.post("/admin/escalations", payload),
  reassign: (id, payload) => api.patch(`/admin/escalations/${id}/reassign`, payload),
  resolve: (id, payload) => api.patch(`/admin/escalations/${id}/resolve`, payload)
};

// Analytics
export const analyticsApi = {
  getComplaints: (params) => api.get("/admin/analytics/complaints", { params }),
  getDepartments: () => api.get("/admin/analytics/departments"),
  getCategories: () => api.get("/admin/analytics/categories"),
  getResolutionTime: () => api.get("/admin/analytics/resolution-time"),
  getSlaPerformance: () => api.get("/admin/analytics/sla-performance"),
  getFeedback: () => api.get("/admin/analytics/feedback")
};

// Notifications
export const notificationsApi = {
  getNotifications: (params) => api.get("/admin/notifications", { params }),
  getNotificationById: (id) => api.get(`/admin/notifications/${id}`),
  createAnnouncement: (payload) => api.post("/admin/notifications/announcement", payload),
  retry: (id) => api.post(`/admin/notifications/${id}/retry`)
};

// Settings & Audit
export const settingsApi = {
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (payload) => api.put("/admin/settings", payload),
  getAuditLogs: (params) => api.get("/admin/audit-logs", { params })
};

// Department Officer Module APIs (Member 4)
export const officerApi = {
  // Dashboard
  getStats: (params) => api.get("/officer/dashboard/stats", { params }),
  getRecentAssignments: () => api.get("/officer/dashboard/recent-assignments"),
  getPriorityComplaints: () => api.get("/officer/dashboard/priority-complaints"),
  getSlaOverview: () => api.get("/officer/dashboard/sla-overview"),
  getRecentActivity: () => api.get("/officer/dashboard/recent-activity"),

  // Assigned Complaints
  getComplaints: (params) => api.get("/officer/complaints", { params }),
  getCompletedComplaints: (params) => api.get("/officer/complaints/completed", { params }),
  getComplaintDetails: (id) => api.get(`/officer/complaints/${id}`),

  // Assignments
  getAssignments: () => api.get("/officer/assignments"),
  getNewAssignments: () => api.get("/officer/assignments/new"),
  acceptAssignment: (id, payload) => api.post(`/officer/assignments/${id}/accept`, payload),
  acknowledgeAssignment: (id, payload) => api.post(`/officer/assignments/${id}/acknowledge`, payload),

  // Work Progress Updates
  addProgress: (complaintId, payload) => api.post(`/officer/complaints/${complaintId}/progress`, payload),
  getProgressHistory: (complaintId) => api.get(`/officer/complaints/${complaintId}/progress`),
  updateStatus: (complaintId, payload) => api.patch(`/officer/complaints/${complaintId}/status`, payload),

  // Resolution & Evidence
  submitResolution: (complaintId, payload) => api.post(`/officer/complaints/${complaintId}/resolution`, payload),
  getResolutionDetails: (complaintId) => api.get(`/officer/complaints/${complaintId}/resolution`),
  getEvidence: (complaintId) => api.get(`/officer/complaints/${complaintId}/evidence`),
  uploadEvidence: (payload) => api.post("/officer/upload", payload),

  // Notifications
  getNotifications: (params) => api.get("/officer/notifications", { params }),
  getUnreadCount: () => api.get("/officer/notifications/unread-count"),
  markRead: (id) => api.patch(`/officer/notifications/${id}/read`),
  markAllRead: () => api.patch("/officer/notifications/read-all"),

  // Profile
  getProfile: () => api.get("/officer/profile"),
  updateProfile: (payload) => api.patch("/officer/profile", payload),
  changePassword: (payload) => api.post("/officer/profile/change-password", payload)
};

export default api;
