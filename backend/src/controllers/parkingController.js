import multer from 'multer';
import Parking from '../models/Parking.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';
import { BOOKING_STATUS } from '../config/constants.js';

const toRadians = (value) => (value * Math.PI) / 180;

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const upload = multer({ storage: multer.memoryStorage() });

export const getAllParking = asyncHandler(async (req, res) => {
  const {
    city,
    minPrice,
    maxPrice,
    available,
    vehicleType,
    lat,
    lng,
    distance = 10,
    q
  } = req.query;

  const query = { isApproved: true };

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { address: { $regex: q, $options: 'i' } },
      { amenities: { $elemMatch: { $regex: q, $options: 'i' } } }
    ];
  }

  if (minPrice || maxPrice) {
    query.pricePerHour = {};
    if (minPrice) query.pricePerHour.$gte = Number(minPrice);
    if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
  }

  if (available === 'true') {
    query.availableSlots = { $gt: 0 };
  }

  if (vehicleType) {
    query.vehicleTypes = vehicleType;
  }

  const maxPriceNumber = Number(maxPrice);
  const hasMaxPriceFilter = Number.isFinite(maxPriceNumber);

  let parkings = await Parking.find(query)
    .populate('ownerId', 'name phone')
    .sort({ createdAt: -1 });

  if (lat && lng) {
    const baseLat = Number(lat);
    const baseLng = Number(lng);
    const parsedDistance = Number(distance);
    const maxDistance = Number.isFinite(parsedDistance) && parsedDistance > 0 ? parsedDistance : 10;
    const suggestionRadius = Math.min(maxDistance, 3);

    parkings = parkings
      .map((parking) => {
        const computedDistance = distanceKm(
          baseLat,
          baseLng,
          parking.location.lat,
          parking.location.lng
        );

        return {
          ...parking.toObject(),
          distanceKm: Number(computedDistance.toFixed(2))
        };
      })
      .filter((parking) => parking.distanceKm <= maxDistance)
      .sort((a, b) => a.distanceKm - b.distanceKm || a.pricePerHour - b.pricePerHour);

    const suggestedIds = new Set(
      parkings
        .filter((parking) => {
          const isNearby = parking.distanceKm <= suggestionRadius;
          if (!isNearby) return false;

          if (!hasMaxPriceFilter) return true;
          return parking.pricePerHour <= maxPriceNumber;
        })
        .slice(0, 5)
        .map((parking) => String(parking._id))
    );

    parkings = parkings
      .map((parking) => ({
        ...parking,
        isSuggested: suggestedIds.has(String(parking._id))
      }))
      .sort((a, b) => {
        const suggestionDiff = Number(b.isSuggested) - Number(a.isSuggested);
        if (suggestionDiff !== 0) return suggestionDiff;

        if (a.distanceKm !== b.distanceKm) {
          return a.distanceKm - b.distanceKm;
        }

        return a.pricePerHour - b.pricePerHour;
      });
  }

  return res.status(200).json({ success: true, count: parkings.length, data: parkings });
});

export const getParkingById = asyncHandler(async (req, res) => {
  const parking = await Parking.findById(req.params.id)
    .populate('ownerId', 'name phone email')
    .populate({
      path: 'reviews',
      populate: { path: 'userId', select: 'name photo' },
      options: { sort: { createdAt: -1 } }
    });

  if (!parking) {
    return res.status(404).json({ message: 'Parking not found' });
  }

  return res.status(200).json({ success: true, data: parking });
});

export const createParking = asyncHandler(async (req, res) => {
  const amenities = Array.isArray(req.body.amenities)
    ? req.body.amenities.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const vehicleTypes = Array.isArray(req.body.vehicleTypes)
    ? req.body.vehicleTypes
    : [];

  const operatingHours = req.body.operatingHours || {};

  const payload = {
    ...req.body,
    title: String(req.body.title || '').trim(),
    description: String(req.body.description || '').trim(),
    address: String(req.body.address || '').trim(),
    city: String(req.body.city || '').trim(),
    amenities,
    vehicleTypes,
    operatingHours: {
      open: String(operatingHours.open || '').trim(),
      close: String(operatingHours.close || '').trim()
    },
    location: {
      lat: Number(req.body.location?.lat),
      lng: Number(req.body.location?.lng)
    },
    pricePerHour: Number(req.body.pricePerHour),
    totalSlots: Number(req.body.totalSlots),
    ownerId: req.user.id,
    availableSlots: Number(req.body.totalSlots || 0),
    isApproved: true
  };

  const parking = await Parking.create(payload);
  return res.status(201).json({ success: true, data: parking });
});

export const updateParking = asyncHandler(async (req, res) => {
  const parking = await Parking.findById(req.params.id);

  if (!parking) {
    return res.status(404).json({ message: 'Parking not found' });
  }

  if (String(parking.ownerId) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed to update this parking' });
  }

  const editableFields = ['title', 'description', 'address', 'city', 'pricePerHour', 'totalSlots', 'amenities', 'vehicleTypes'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      parking[field] = req.body[field];
    }
  });

  if (req.body.title !== undefined) parking.title = String(req.body.title || '').trim();
  if (req.body.description !== undefined) parking.description = String(req.body.description || '').trim();
  if (req.body.address !== undefined) parking.address = String(req.body.address || '').trim();
  if (req.body.city !== undefined) parking.city = String(req.body.city || '').trim();
  if (req.body.pricePerHour !== undefined) parking.pricePerHour = Number(req.body.pricePerHour);

  if (req.body.amenities !== undefined) {
    parking.amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities.map((item) => String(item).trim()).filter(Boolean)
      : [];
  }

  if (req.body.vehicleTypes !== undefined) {
    parking.vehicleTypes = Array.isArray(req.body.vehicleTypes) ? req.body.vehicleTypes : [];
  }

  if (req.body.location?.lat !== undefined && req.body.location?.lng !== undefined) {
    parking.location = {
      lat: Number(req.body.location.lat),
      lng: Number(req.body.location.lng)
    };
  }

  if (req.body.operatingHours !== undefined) {
    const hours = req.body.operatingHours || {};
    parking.operatingHours = {
      open: String(hours.open || '').trim(),
      close: String(hours.close || '').trim()
    };
  }

  if (req.body.totalSlots !== undefined) {
    const nextTotalSlots = Number(req.body.totalSlots);
    const activeBookingCount = await Booking.countDocuments({
      parkingId: parking._id,
      bookingStatus: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACTIVE] }
    });

    if (!Number.isFinite(nextTotalSlots) || nextTotalSlots < 1) {
      return res.status(400).json({ message: 'totalSlots must be at least 1' });
    }

    if (nextTotalSlots < activeBookingCount) {
      return res.status(400).json({
        message: `totalSlots cannot be less than currently occupied slots (${activeBookingCount})`
      });
    }

    parking.totalSlots = nextTotalSlots;
    parking.availableSlots = Math.max(0, nextTotalSlots - activeBookingCount);
  }

  await parking.save();

  return res.status(200).json({ success: true, data: parking });
});

export const deleteParking = asyncHandler(async (req, res) => {
  const parking = await Parking.findById(req.params.id);

  if (!parking) {
    return res.status(404).json({ message: 'Parking not found' });
  }

  if (String(parking.ownerId) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed to delete this parking' });
  }

  await parking.deleteOne();
  return res.status(200).json({ success: true, message: 'Parking deleted' });
});

export const getMyParkings = asyncHandler(async (req, res) => {
  const parkings = await Parking.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, count: parkings.length, data: parkings });
});

export const uploadParkingImages = asyncHandler(async (req, res) => {
  const parking = await Parking.findById(req.params.id);

  if (!parking) {
    return res.status(404).json({ message: 'Parking not found' });
  }

  if (String(parking.ownerId) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed to upload images to this parking' });
  }

  const files = req.files || [];

  if (!files.length) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const uploaded = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, 'parking-slot/listings'))
  );

  const imageUrls = uploaded.map((item) => item.secure_url);
  parking.images = [...parking.images, ...imageUrls];
  await parking.save();

  return res.status(200).json({ success: true, data: parking });
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const parkingId = req.params.id;

  const parking = await Parking.findById(parkingId);
  if (!parking) {
    return res.status(404).json({ message: 'Parking not found' });
  }

  const priorBooking = await Booking.findOne({ userId: req.user.id, parkingId });

  let review = await Review.findOne({ parkingId, userId: req.user.id });
  if (review) {
    review.rating = rating;
    review.comment = comment;
    review.verified = Boolean(priorBooking);
    await review.save();
  } else {
    review = await Review.create({
      parkingId,
      userId: req.user.id,
      rating,
      comment,
      verified: Boolean(priorBooking)
    });
    parking.reviews.push(review._id);
  }

  const allReviews = await Review.find({ parkingId });
  const totalRatings = allReviews.reduce((sum, item) => sum + item.rating, 0);

  parking.reviewsCount = allReviews.length;
  parking.ratings = allReviews.length ? totalRatings / allReviews.length : 0;
  await parking.save();

  return res.status(200).json({ success: true, data: review });
});

export const getParkingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ parkingId: req.params.id })
    .populate('userId', 'name photo')
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, count: reviews.length, data: reviews });
});
