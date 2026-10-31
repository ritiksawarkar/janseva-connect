import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireOfficer } from "../middleware/roleMiddleware.js";

import {
  getDashboardStats,
  getRecentAssignments,
  getPriorityComplaints,
  getSlaOverview,
  getRecentActivity
} from "../controllers/officerDashboardController.js";

import {
  getAssignedComplaints,
  getComplaintDetails,
  getCompletedComplaints
} from "../controllers/officerComplaintController.js";

import {
  getAssignments,
  getNewAssignments,
  acceptAssignment,
  acknowledgeAssignment
} from "../controllers/officerAssignmentController.js";

import {
  addProgressUpdate,
  getProgressHistory,
  updateComplaintStatus
} from "../controllers/officerProgressController.js";

import {
  submitResolution,
  getResolutionDetails,
  getComplaintEvidence
} from "../controllers/officerResolutionController.js";

import {
  getOfficerNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead
} from "../controllers/officerNotificationController.js";

import {
  getOfficerProfile,
  updateOfficerProfile,
  changeOfficerPassword
} from "../controllers/officerProfileController.js";

import { uploadEvidence } from "../controllers/officerUploadController.js";

const router = Router();

// Apply authentication and DEPARTMENT_OFFICER role authorization to all officer routes
router.use(authenticate, requireOfficer);

// A. Dashboard APIs
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/recent-assignments", getRecentAssignments);
router.get("/dashboard/priority-complaints", getPriorityComplaints);
router.get("/dashboard/sla-overview", getSlaOverview);
router.get("/dashboard/recent-activity", getRecentActivity);

// B. Assigned Complaints APIs
router.get("/complaints", getAssignedComplaints);
router.get("/complaints/completed", getCompletedComplaints);
router.get("/complaints/:id", getComplaintDetails);

// C. Assignments APIs
router.get("/assignments", getAssignments);
router.get("/assignments/new", getNewAssignments);
router.post("/assignments/:id/accept", acceptAssignment);
router.post("/assignments/:id/acknowledge", acknowledgeAssignment);

// D. Progress APIs
router.post("/complaints/:id/progress", addProgressUpdate);
router.get("/complaints/:id/progress", getProgressHistory);
router.patch("/complaints/:id/status", updateComplaintStatus);

// E. Resolution APIs
router.post("/complaints/:id/resolution", submitResolution);
router.get("/complaints/:id/resolution", getResolutionDetails);
router.get("/complaints/:id/evidence", getComplaintEvidence);

// F. Evidence Upload API
router.post("/upload", uploadEvidence);

// G. Notifications APIs
router.get("/notifications", getOfficerNotifications);
router.get("/notifications/unread-count", getUnreadCount);
router.patch("/notifications/:id/read", markNotificationRead);
router.patch("/notifications/read-all", markAllNotificationsRead);

// H. Profile APIs
router.get("/profile", getOfficerProfile);
router.patch("/profile", updateOfficerProfile);
router.post("/profile/change-password", changeOfficerPassword);

export default router;
