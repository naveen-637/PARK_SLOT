import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import {
  upload,
  getAllParking,
  getParkingById,
  createParking,
  updateParking,
  deleteParking,
  getMyParkings,
  uploadParkingImages,
  addReview,
  getParkingReviews
} from '../controllers/parkingController.js';

const router = express.Router();

router.get('/', getAllParking);
router.get('/search', getAllParking);
router.get('/owner/mine', authenticate, authorize('owner', 'admin'), getMyParkings);
router.get('/:id', getParkingById);
router.get('/:id/reviews', getParkingReviews);

router.post('/', authenticate, authorize('owner', 'admin'), validateRequest(schemas.createParking), createParking);
router.put('/:id', authenticate, authorize('owner', 'admin'), updateParking);
router.delete('/:id', authenticate, authorize('owner', 'admin'), deleteParking);
router.post('/:id/images', authenticate, authorize('owner', 'admin'), upload.array('images', 8), uploadParkingImages);

router.post('/:id/reviews', authenticate, authorize('customer', 'admin'), validateRequest(schemas.createReview), addReview);

export default router;
