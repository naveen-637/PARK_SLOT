import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllUsers,
  getPendingParkings,
  approveParking,
  rejectParking
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/parkings/pending', getPendingParkings);
router.patch('/parkings/:id/approve', approveParking);
router.delete('/parkings/:id/reject', rejectParking);

export default router;
