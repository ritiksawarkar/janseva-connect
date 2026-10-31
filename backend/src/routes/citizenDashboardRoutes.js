import { Router } from 'express';
import {
  getDashboardStats,
  getRecentComplaints,
  getDashboardNearbyComplaints,
  getRecentActivity
} from '../controllers/citizenDashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/recent-complaints', getRecentComplaints);
router.get('/nearby-complaints', getDashboardNearbyComplaints);
router.get('/recent-activity', getRecentActivity);

export default router;

