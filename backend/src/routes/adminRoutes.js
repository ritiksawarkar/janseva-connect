import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

// Import Controllers
import {
  getDashboardStats,
  getComplaintTrends,
  getDepartmentPerformance,
  getRecentActivity
} from "../controllers/adminDashboardController.js";

import {
  getCitizens,
  getCitizenById,
  updateCitizenStatus,
  flagCitizen,
  getCitizenComplaints
} from "../controllers/citizenManagementController.js";

import {
  getComplaints,
  getComplaintById,
  getPendingVerification,
  verifyComplaint,
  rejectComplaint,
  requestInformation,
  getComplaintHistory
} from "../controllers/complaintAdminController.js";

import {
  getAssignments,
  createAssignment,
  reassignComplaint,
  getAssignmentsForComplaint
} from "../controllers/assignmentController.js";

import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  getDepartmentOfficers,
  getDepartmentComplaints
} from "../controllers/departmentController.js";

import {
  getOfficers,
  getOfficerById,
  createOfficer,
  updateOfficer,
  updateOfficerStatus,
  getOfficerAssignments
} from "../controllers/officerController.js";

import {
  getServices,
  getServiceById,
  createService,
  updateService,
  verifyService,
  publishService,
  getServiceVersions
} from "../controllers/serviceAdminController.js";

import {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  verifyScheme,
  publishScheme,
  getSchemeVersions
} from "../controllers/schemeAdminController.js";

import {
  getSlaRules,
  createSlaRule,
  updateSlaRule,
  updateSlaRuleStatus
} from "../controllers/slaController.js";

import {
  getEscalations,
  createEscalation,
  getEscalationById,
  reassignEscalation,
  resolveEscalation
} from "../controllers/escalationController.js";

import {
  getAnalyticsComplaints,
  getAnalyticsDepartments,
  getAnalyticsCategories,
  getAnalyticsResolutionTime,
  getAnalyticsSlaPerformance,
  getAnalyticsFeedback
} from "../controllers/analyticsController.js";

import {
  getNotifications,
  getNotificationById,
  createPlatformAnnouncement,
  retryNotification
} from "../controllers/notificationAdminController.js";

import {
  getSettings,
  updateSettings,
  getAuditLogsEndpoint
} from "../controllers/platformSettingsController.js";

const router = Router();

// Protect ALL admin routes with authenticate + requireAdmin
router.use(authenticate, requireAdmin);

// A. Dashboard APIs
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/complaint-trends", getComplaintTrends);
router.get("/dashboard/department-performance", getDepartmentPerformance);
router.get("/dashboard/recent-activity", getRecentActivity);

// B. Citizen Management APIs
router.get("/citizens", getCitizens);
router.get("/citizens/:id", getCitizenById);
router.patch("/citizens/:id/status", updateCitizenStatus);
router.get("/citizens/:id/complaints", getCitizenComplaints);
router.patch("/citizens/:id/flag", flagCitizen);

// C. Complaint Management APIs
router.get("/complaints", getComplaints);
router.get("/complaints/pending-verification", getPendingVerification);
router.get("/complaints/:id", getComplaintById);
router.patch("/complaints/:id/verify", verifyComplaint);
router.patch("/complaints/:id/reject", rejectComplaint);
router.patch("/complaints/:id/request-information", requestInformation);
router.get("/complaints/:id/history", getComplaintHistory);

// D. Assignment APIs
router.get("/assignments", getAssignments);
router.post("/assignments", createAssignment);
router.patch("/assignments/:id/reassign", reassignComplaint);
router.get("/complaints/:id/assignments", getAssignmentsForComplaint);

// E. Department APIs
router.get("/departments", getDepartments);
router.get("/departments/:id", getDepartmentById);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.patch("/departments/:id/status", updateDepartmentStatus);
router.get("/departments/:id/officers", getDepartmentOfficers);
router.get("/departments/:id/complaints", getDepartmentComplaints);

// F. Officer APIs
router.get("/officers", getOfficers);
router.get("/officers/:id", getOfficerById);
router.post("/officers", createOfficer);
router.put("/officers/:id", updateOfficer);
router.patch("/officers/:id/status", updateOfficerStatus);
router.get("/officers/:id/assignments", getOfficerAssignments);

// G. Service Administration APIs
router.get("/services", getServices);
router.get("/services/:id", getServiceById);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.patch("/services/:id/verify", verifyService);
router.patch("/services/:id/publish", publishService);
router.get("/services/:id/versions", getServiceVersions);

// H. Scheme Administration APIs
router.get("/schemes", getSchemes);
router.get("/schemes/:id", getSchemeById);
router.post("/schemes", createScheme);
router.put("/schemes/:id", updateScheme);
router.patch("/schemes/:id/verify", verifyScheme);
router.patch("/schemes/:id/publish", publishScheme);
router.get("/schemes/:id/versions", getSchemeVersions);

// I. SLA APIs
router.get("/sla-rules", getSlaRules);
router.post("/sla-rules", createSlaRule);
router.put("/sla-rules/:id", updateSlaRule);
router.patch("/sla-rules/:id/status", updateSlaRuleStatus);

// J. Escalation APIs
router.get("/escalations", getEscalations);
router.post("/escalations", createEscalation);
router.get("/escalations/:id", getEscalationById);
router.patch("/escalations/:id/reassign", reassignEscalation);
router.patch("/escalations/:id/resolve", resolveEscalation);

// K. Analytics APIs
router.get("/analytics/complaints", getAnalyticsComplaints);
router.get("/analytics/departments", getAnalyticsDepartments);
router.get("/analytics/categories", getAnalyticsCategories);
router.get("/analytics/resolution-time", getAnalyticsResolutionTime);
router.get("/analytics/sla-performance", getAnalyticsSlaPerformance);
router.get("/analytics/feedback", getAnalyticsFeedback);

// L. Notification APIs
router.get("/notifications", getNotifications);
router.get("/notifications/:id", getNotificationById);
router.post("/notifications/announcement", createPlatformAnnouncement);
router.post("/notifications/:id/retry", retryNotification);

// M. Settings & Audit APIs
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/audit-logs", getAuditLogsEndpoint);

export default router;
