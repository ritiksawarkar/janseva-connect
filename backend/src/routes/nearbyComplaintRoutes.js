import { Router } from 'express';
import {
  getNearbyComplaints,
  searchNearbyComplaintsPost,
  getNearbyComplaintDetails
} from '../controllers/nearbyComplaintController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getNearbyComplaints);
router.post('/search', optionalAuth, searchNearbyComplaintsPost);
router.get('/:id', optionalAuth, getNearbyComplaintDetails);

export default router;
