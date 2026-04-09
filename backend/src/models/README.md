# Database Models Documentation

## Collections Overview

### 1. Users Collection
Stores user information for customers, owners, and admins.

**Fields:**
- `_id` - MongoDB ID
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `phone` - Contact number
- `role` - User role (customer/owner/admin)
- `photo` - Profile picture URL
- `address` - Residential address
- `city` - City name
- `isVerified` - Email verification status
- `bookings` - Array of booking references
- `createdAt`, `updatedAt` - Timestamps

### 2. Parking Collection
Stores parking space listings created by owners.

**Fields:**
- `_id` - MongoDB ID
- `title` - Parking space name
- `description` - Detailed description
- `ownerId` - Reference to owner (User)
- `location` - Latitude/longitude coordinates for proximity filtering
- `address` - Full address
- `city` - City name
- `pricePerHour` - Hourly rate
- `totalSlots` - Total parking slots available
- `availableSlots` - Currently available slots
- `amenities` - Array of amenities
- `images` - Array of Cloudinary URLs
- `isApproved` - Admin approval status
- `ratings` - Average rating (0-5)
- `reviewsCount` - Total reviews count
- `reviews` - Array of review references
- `vehicleTypes` - Supported vehicle types
- `operatingHours` - Opening and closing times
- `createdAt`, `updatedAt` - Timestamps

### 3. Bookings Collection
Stores parking reservations made by customers.

**Fields:**
- `_id` - MongoDB ID
- `userId` - Customer reference
- `parkingId` - Parking space reference
- `slotNumber` - Specific slot number
- `checkInTime` - Booking start time
- `checkOutTime` - Booking end time
- `totalHours` - Duration of booking
- `totalAmount` - Total cost
- `paymentId` - Payment reference
- `paymentStatus` - Payment status (pending/success/failed)
- `bookingStatus` - Booking status (active/completed/cancelled/pending)
- `qrCode` - QR code for entry
- `cancellationReason` - Reason if cancelled
- `cancelledAt` - Cancellation timestamp
- `createdAt`, `updatedAt` - Timestamps

### 4. Payments Collection
Stores payment transaction information.

**Fields:**
- `_id` - MongoDB ID
- `bookingId` - Associated booking reference
- `userId` - Customer reference
- `amount` - Payment amount
- `paymentMethod` - Method used (razorpay/wallet/upi)
- `status` - Payment status (pending/success/failed/refunded)
- `transactionId` - Unique transaction ID (Razorpay)
- `orderId` - Order ID from payment gateway
- `signature` - Payment signature for verification
- `refundId` - Refund transaction ID
- `refundAmount` - Amount refunded
- `refundedAt` - Refund date
- `failureReason` - Reason if payment failed
- `createdAt`, `updatedAt` - Timestamps

### 5. Reviews Collection
Stores user reviews and ratings for parking spaces.

**Fields:**
- `_id` - MongoDB ID
- `parkingId` - Parking space reference
- `userId` - Reviewer reference
- `rating` - Star rating (1-5)
- `comment` - Review text
- `verified` - True if user has booked this parking
- `helpful` - Helpful votes count
- `ownerResponse` - Owner's response to review
- `createdAt`, `updatedAt` - Timestamps

## Relationships

```
User (1) ──┬─→ (N) Parking [ownerId]
           ├─→ (N) Booking [userId]
           ├─→ (N) Review [userId]
           └─→ (N) Payment [userId]

Parking (1) ──┬─→ (N) Booking [parkingId]
              ├─→ (N) Review [parkingId]
              └─→ (N) Payment [via Booking]

Booking (1) ──┬─→ (1) Payment [bookingId]
              └─→ (1) User [userId]

Payment ──→ (1) Booking
```

## Indexes

For optimal query performance:

**User Collection:**
- `email` (unique)

**Parking Collection:**
- `geoLocation` (2dsphere) - For proximity queries
- `city` - For city filters
- `ownerId` - For owner queries

**Booking Collection:**
- `userId` - For user's bookings
- `parkingId` - For parking's bookings
- `checkInTime` - For availability checks

**Payment Collection:**
- `userId` - For user's transactions
- `bookingId` - For booking payments
- `transactionId` - For transaction lookup

**Review Collection:**
- `parkingId` - For parking reviews
- `userId` - For user reviews
- `rating` - For sorting by rating
