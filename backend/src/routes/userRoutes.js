import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMe, updateMe, getMyBookings } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.get('/me/bookings', authenticate, getMyBookings);

export default router;
