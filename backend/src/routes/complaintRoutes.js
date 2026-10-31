import { Router } from 'express';
import {
  registerComplaint,
  getCitizenComplaints,
  getComplaint,
  updateComplaint
} from '../controllers/complaintController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadComplaintAttachments } from '../middleware/uploadMiddleware.js';

const router = Router();

// Citizen personal complaints list
router.get('/my', authenticate, getCitizenComplaints);

// Register a new complaint (supports multipart/form-data for attachments)
router.post(
  '/',
  authenticate,
  uploadComplaintAttachments.array('attachments', 5),
  registerComplaint
);

// Get specific complaint details
router.get('/:id', optionalAuth, getComplaint);

// Modify submitted complaint (only before verification/assignment)
router.patch('/:id', authenticate, updateComplaint);

export default router;
