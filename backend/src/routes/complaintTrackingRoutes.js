import { Router } from 'express';
import { trackComplaint, getHistoryTimeline } from '../controllers/complaintTrackingController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Authenticated complaint tracking by Tracking ID (JSC-YYYY-000001)
router.get('/track/:trackingId', optionalAuth, trackComplaint);

// Complaint history timeline
router.get('/:id/history', optionalAuth, getHistoryTimeline);

export default router;

