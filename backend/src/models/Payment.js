import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'wallet', 'upi'],
      default: 'razorpay'
    },
    status: {
      type: String,
      enum: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED, PAYMENT_STATUS.REFUNDED],
      default: PAYMENT_STATUS.PENDING
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    orderId: String,
    signature: String,
    refundId: String,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundedAt: Date,
    failureReason: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
paymentSchema.index({ userId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ transactionId: 1 });

export default mongoose.model('Payment', paymentSchema);
