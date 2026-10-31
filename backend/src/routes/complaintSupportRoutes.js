import { Router } from 'express';
import {
  handleJoinComplaint,
  handleLeaveComplaint,
  getSupportersList,
  getSupportStatus
} from '../controllers/complaintSupportController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Community support endpoints
router.post('/:id/join', authenticate, handleJoinComplaint);
router.delete('/:id/join', authenticate, handleLeaveComplaint);
router.get('/:id/supporters', optionalAuth, getSupportersList);
router.get('/:id/support-status', optionalAuth, getSupportStatus);

export default router;
