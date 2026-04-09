import QRCode from 'qrcode';
import Booking from '../models/Booking.js';
import Parking from '../models/Parking.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/mailer.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const overlapCondition = (checkInTime, checkOutTime) => ({
  checkInTime: { $lt: new Date(checkOutTime) },
  checkOutTime: { $gt: new Date(checkInTime) },
  bookingStatus: { $in: [BOOKING_STATUS.ACTIVE, BOOKING_STATUS.PENDING] }
});

export const checkAvailability = asyncHandler(async (req, res) => {
  const { parkingId, checkInTime, checkOutTime, slotNumber } = req.body;

  if (!parkingId || !checkInTime || !checkOutTime) {
    return res.status(400).json({ message: 'parkingId, checkInTime and checkOutTime are required' });
  }

  const parking = await Parking.findById(parkingId);
  if (!parking) {
    return res.status(404).json({ message: 'Parking not found' });
  }

  if (new Date(checkOutTime) <= new Date(checkInTime)) {
    return res.status(400).json({ message: 'checkOutTime must be greater than checkInTime' });
  }

  const takenSlots = await Booking.find({
    parkingId,
    ...(slotNumber ? { slotNumber: Number(slotNumber) } : {}),
    ...overlapCondition(checkInTime, checkOutTime)
  }).select('slotNumber');

  return res.status(200).json({
    success: true,
    data: {
      availableSlots: parking.availableSlots,
      isAvailable: parking.availableSlots > 0 && takenSlots.length === 0,
      takenSlots: takenSlots.map((item) => item.slotNumber)
    }
  });
});

export const createBooking = asyncHandler(async (req, res) => {
  const { parkingId, slotNumber, checkInTime, checkOutTime } = req.body;
  const requestedSlotNumber = Number(slotNumber);

  if (new Date(checkOutTime) <= new Date(checkInTime)) {
    return res.status(400).json({ message: 'checkOutTime must be greater than checkInTime' });
  }

  const parking = await Parking.findById(parkingId);
  if (!parking || !parking.isApproved) {
    return res.status(404).json({ message: 'Parking is unavailable' });
  }

  if (parking.availableSlots <= 0) {
    return res.status(409).json({ message: 'No slots are available currently' });
  }

  if (requestedSlotNumber < 1 || requestedSlotNumber > parking.totalSlots) {
    return res.status(400).json({ message: `slotNumber must be between 1 and ${parking.totalSlots}` });
  }

  let slotToBook = requestedSlotNumber;

  const conflicting = await Booking.findOne({
    parkingId,
    slotNumber: slotToBook,
    ...overlapCondition(checkInTime, checkOutTime)
  });

  if (conflicting) {
    const takenSlots = await Booking.find({
      parkingId,
      ...overlapCondition(checkInTime, checkOutTime)
    }).select('slotNumber');

    const takenSet = new Set(takenSlots.map((item) => Number(item.slotNumber)));
    const fallbackSlot = Array.from({ length: parking.totalSlots }, (_, index) => index + 1)
      .find((slot) => !takenSet.has(slot));

    if (!fallbackSlot) {
      return res.status(409).json({ message: 'No slots are available for this time range' });
    }

    slotToBook = fallbackSlot;
  }

  const start = new Date(checkInTime);
  const end = new Date(checkOutTime);
  const durationMs = end.getTime() - start.getTime();
  const totalHours = Math.max(1, Math.ceil(durationMs / (60 * 60 * 1000)));
  const totalAmount = totalHours * parking.pricePerHour;

  const booking = await Booking.create({
    userId: req.user.id,
    parkingId,
    slotNumber: slotToBook,
    checkInTime: start,
    checkOutTime: end,
    totalHours,
    totalAmount,
    paymentStatus: PAYMENT_STATUS.PENDING,
    bookingStatus: BOOKING_STATUS.PENDING
  });

  booking.qrCode = await QRCode.toDataURL(
    JSON.stringify({
      bookingId: booking._id,
      parkingId,
      slotNumber: slotToBook,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime
    })
  );

  await booking.save();

  parking.availableSlots = Math.max(0, parking.availableSlots - 1);
  await parking.save();

  await User.findByIdAndUpdate(req.user.id, { $addToSet: { bookings: booking._id } });

  const user = await User.findById(req.user.id);
  if (user?.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: 'Booking Confirmation',
        text: `Booking ${booking._id} confirmed with status ${booking.bookingStatus}`,
        html: `<p>Your booking <strong>${booking._id}</strong> is created.</p>`
      });
    } catch (emailError) {
      console.warn('Booking created, but confirmation email failed:', emailError.message);
    }
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('slot-updated', {
      parkingId: parking._id,
      availableSlots: parking.availableSlots
    });
  }

  return res.status(201).json({ success: true, data: booking });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id })
    .populate('parkingId', 'title address city pricePerHour images')
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('parkingId', 'title address city ownerId')
    .populate('userId', 'name email phone');

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const canView =
    String(booking.userId._id) === req.user.id ||
    String(booking.parkingId.ownerId) === req.user.id ||
    req.user.role === 'admin';

  if (!canView) {
    return res.status(403).json({ message: 'Not authorized to view this booking' });
  }

  return res.status(200).json({ success: true, data: booking });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (String(booking.userId) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to cancel this booking' });
  }

  if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
    return res.status(400).json({ message: 'Booking already cancelled' });
  }

  booking.bookingStatus = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  await booking.save();

  const parking = await Parking.findById(booking.parkingId);
  if (parking) {
    parking.availableSlots = Math.min(parking.totalSlots, parking.availableSlots + 1);
    await parking.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('slot-updated', {
        parkingId: parking._id,
        availableSlots: parking.availableSlots
      });
    }
  }

  return res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
});

export const getOwnerBookings = asyncHandler(async (req, res) => {
  const ownerParkings = await Parking.find({ ownerId: req.user.id }).select('_id');
  const ids = ownerParkings.map((item) => item._id);

  const bookings = await Booking.find({ parkingId: { $in: ids } })
    .populate('parkingId', 'title address city')
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, count: bookings.length, data: bookings });
});
