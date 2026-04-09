import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  refundPayment,
  getInvoice
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(authenticate);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getPaymentHistory);
router.post('/:id/refund', refundPayment);
router.get('/:id/invoice', getInvoice);

export default router;
