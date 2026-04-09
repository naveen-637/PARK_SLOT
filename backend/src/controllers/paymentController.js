import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Parking from '../models/Parking.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRazorpayClient, isRazorpayConfigured } from '../config/razorpay.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const releaseParkingSlot = async (booking, io) => {
  const parking = await Parking.findById(booking.parkingId);
  if (!parking) return;

  parking.availableSlots = Math.min(parking.totalSlots, parking.availableSlots + 1);
  await parking.save();

  if (io) {
    io.emit('slot-updated', {
      parkingId: parking._id,
      availableSlots: parking.availableSlots
    });
  }
};

export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (String(booking.userId) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to create order for this booking' });
  }

  let order;
  if (isRazorpayConfigured()) {
    const razorpay = getRazorpayClient();
    order = await razorpay.orders.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: 'INR',
      receipt: `booking_${booking._id}`
    });
  } else {
    order = {
      id: `mock_order_${Date.now()}`,
      amount: Math.round(booking.totalAmount * 100),
      currency: 'INR',
      receipt: `booking_${booking._id}`
    };
  }

  const payment = await Payment.create({
    bookingId: booking._id,
    userId: booking.userId,
    amount: booking.totalAmount,
    paymentMethod: 'razorpay',
    status: PAYMENT_STATUS.PENDING,
    orderId: order.id
  });

  booking.paymentId = payment._id;
  await booking.save();

  return res.status(201).json({
    success: true,
    data: {
      order,
      payment,
      razorpayEnabled: isRazorpayConfigured()
    }
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    bookingId,
    orderId,
    razorpayPaymentId,
    razorpaySignature,
    success = true
  } = req.body;

  const booking = await Booking.findById(bookingId).populate('paymentId');
  if (!booking || !booking.paymentId) {
    return res.status(404).json({ message: 'Payment record not found for booking' });
  }

  if (String(booking.userId) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to verify this payment' });
  }

  const payment = await Payment.findById(booking.paymentId._id);
  const io = req.app.get('io');

  let isValid = Boolean(success);

  if (isRazorpayConfigured() && razorpayPaymentId && razorpaySignature) {
    const body = `${orderId}|${razorpayPaymentId}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    isValid = expected === razorpaySignature;
  }

  if (isValid) {
    payment.status = PAYMENT_STATUS.SUCCESS;
    payment.transactionId = razorpayPaymentId || `mock_txn_${Date.now()}`;
    payment.signature = razorpaySignature;

    booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
    booking.bookingStatus = BOOKING_STATUS.ACTIVE;
  } else {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = 'Signature verification failed';

    booking.paymentStatus = PAYMENT_STATUS.FAILED;
    if (booking.bookingStatus !== BOOKING_STATUS.CANCELLED) {
      booking.bookingStatus = BOOKING_STATUS.CANCELLED;
      await releaseParkingSlot(booking, io);
    }
  }

  await payment.save();
  await booking.save();

  return res.status(200).json({
    success: true,
    message: isValid ? 'Payment verified successfully' : 'Payment verification failed',
    data: { payment, booking }
  });
});

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
  const payments = await Payment.find(query)
    .populate('bookingId', 'parkingId totalAmount checkInTime checkOutTime')
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, count: payments.length, data: payments });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (String(payment.userId) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to refund this payment' });
  }

  payment.status = PAYMENT_STATUS.REFUNDED;
  payment.refundAmount = payment.amount;
  payment.refundId = `refund_${Date.now()}`;
  payment.refundedAt = new Date();
  await payment.save();

  const booking = await Booking.findById(payment.bookingId);
  if (booking) {
    const io = req.app.get('io');
    booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
    if (booking.bookingStatus !== BOOKING_STATUS.CANCELLED) {
      booking.bookingStatus = BOOKING_STATUS.CANCELLED;
      await releaseParkingSlot(booking, io);
    }
    await booking.save();
  }

  return res.status(200).json({ success: true, message: 'Payment refunded', data: payment });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate({
      path: 'bookingId',
      populate: { path: 'parkingId', select: 'title address city' }
    })
    .populate('userId', 'name email phone');

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (String(payment.userId._id) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to access invoice' });
  }

  return res.status(200).json({
    success: true,
    data: {
      invoiceNumber: `INV-${payment._id.toString().slice(-8).toUpperCase()}`,
      generatedAt: new Date(),
      payment
    }
  });
});
