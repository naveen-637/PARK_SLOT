import User from '../models/User.js';
import Parking from '../models/Parking.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalParkings, pendingParkings, totalBookings, totalPayments, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Parking.countDocuments(),
    Parking.countDocuments({ isApproved: false }),
    Booking.countDocuments(),
    Payment.countDocuments({ status: PAYMENT_STATUS.SUCCESS }),
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.SUCCESS } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ])
  ]);

  const activeBookings = await Booking.countDocuments({ bookingStatus: BOOKING_STATUS.ACTIVE });

  return res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalParkings,
      pendingParkings,
      totalBookings,
      activeBookings,
      totalPayments,
      totalRevenue: revenueAgg[0]?.totalRevenue || 0
    }
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return res.status(200).json({ success: true, count: users.length, data: users });
});

export const getPendingParkings = asyncHandler(async (req, res) => {
  const parkings = await Parking.find({ isApproved: false })
    .populate('ownerId', 'name email phone')
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, count: parkings.length, data: parkings });
});

export const approveParking = asyncHandler(async (req, res) => {
  const parking = await Parking.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

  if (!parking) {
    return res.status(404).json({ message: 'Parking not found' });
  }

  return res.status(200).json({ success: true, message: 'Parking approved', data: parking });
});

export const rejectParking = asyncHandler(async (req, res) => {
  const parking = await Parking.findByIdAndDelete(req.params.id);
  if (!parking) {
    return res.status(404).json({ message: 'Parking not found' });
  }

  return res.status(200).json({ success: true, message: 'Parking rejected and removed' });
});
