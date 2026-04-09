import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      required: true
    },
    slotNumber: {
      type: Number,
      required: true
    },
    checkInTime: {
      type: Date,
      required: true
    },
    checkOutTime: {
      type: Date,
      required: true
    },
    totalHours: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    paymentStatus: {
      type: String,
      enum: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED],
      default: PAYMENT_STATUS.PENDING
    },
    bookingStatus: {
      type: String,
      enum: [BOOKING_STATUS.ACTIVE, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.PENDING],
      default: BOOKING_STATUS.PENDING
    },
    qrCode: String,
    cancellationReason: String,
    cancelledAt: Date,
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
bookingSchema.index({ userId: 1 });
bookingSchema.index({ parkingId: 1 });
bookingSchema.index({ checkInTime: 1 });

export default mongoose.model('Booking', bookingSchema);
