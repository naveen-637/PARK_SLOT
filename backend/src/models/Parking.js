import mongoose from 'mongoose';

const parkingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Please provide price per hour'],
      min: [0, 'Price cannot be negative']
    },
    totalSlots: {
      type: Number,
      required: [true, 'Please provide total slots'],
      min: [1, 'Must have at least 1 slot']
    },
    availableSlots: {
      type: Number,
      required: true
    },
    amenities: [
      {
        type: String
      }
    ],
    images: [
      {
        type: String // Cloudinary URLs
      }
    ],
    isApproved: {
      type: Boolean,
      default: false
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
      }
    ],
    vehicleTypes: [
      {
        type: String,
        enum: ['Car', 'Bike', 'EV', 'Truck']
      }
    ],
    operatingHours: {
      open: String, // "08:00"
      close: String // "23:00"
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

parkingSchema.pre('save', function (next) {
  if (this.location?.lng !== undefined && this.location?.lat !== undefined) {
    this.geoLocation = {
      type: 'Point',
      coordinates: [this.location.lng, this.location.lat]
    };
  }

  next();
});

// Index for location-based search
parkingSchema.index({ geoLocation: '2dsphere' });
parkingSchema.index({ city: 1 });
parkingSchema.index({ ownerId: 1 });

export default mongoose.model('Parking', parkingSchema);
