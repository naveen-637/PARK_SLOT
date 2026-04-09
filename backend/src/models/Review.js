import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    verified: {
      type: Boolean,
      default: false // True if user has booked this parking
    },
    helpful: {
      type: Number,
      default: 0
    },
    ownerResponse: {
      comment: String,
      respondedAt: Date
    },
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
reviewSchema.index({ parkingId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: -1 });

export default mongoose.model('Review', reviewSchema);
