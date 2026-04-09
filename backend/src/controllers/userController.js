import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'address', 'city', 'photo'];
  const payload = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      payload[key] = req.body[key];
    }
  }

  const updated = await User.findByIdAndUpdate(req.user.id, payload, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({ success: true, data: updated });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id })
    .populate('parkingId', 'title address city pricePerHour images')
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, count: bookings.length, data: bookings });
});
