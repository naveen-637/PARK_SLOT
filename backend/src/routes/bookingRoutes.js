import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/check-availability', validateRequest(schemas.checkAvailability), checkAvailability);
router.post('/', authenticate, validateRequest(schemas.createBooking), createBooking);
router.get('/', authenticate, getMyBookings);
router.get('/owner', authenticate, authorize('owner', 'admin'), getOwnerBookings);
router.get('/:id', authenticate, getBookingById);
router.put('/:id/cancel', authenticate, cancelBooking);

export default router;
