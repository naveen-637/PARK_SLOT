# 🚗 Parking Slot Reservation System - MERN Stack

A comprehensive web application for smart parking slot management, booking, and payment processing.

---

## 📋 Project Overview

A full-featured MERN stack application that connects parking owners with customers seeking convenient parking solutions. Features real-time availability tracking, multiple payment options, and intelligent slot management.

---

## 🧠 Product Vision

- **Users** can find, book, and pay for parking slots
- **Owners** can list and manage parking spaces
- **Admin** controls the entire ecosystem

---

## 🏗️ Tech Stack

### 🔹 Frontend
- **React.js** (with Vite)
- **Tailwind CSS** - UI styling
- **Redux Toolkit** - State management
- **Axios** - API client
- **React Router** - Navigation

### 🔹 Backend
- **Node.js + Express.js** - Server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Input validation
- **CORS** - Cross-origin handling

### 🔹 Database
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM

### 🔹 External Services
- **Razorpay** - Payment gateway
- **Cloudinary** - Image upload & storage
- **Firebase** - Real-time notifications (optional)
- **Socket.io** - Real-time slot updates

---

## 👥 User Roles & Features

### 1️⃣ Customer (User)
- ✅ Register/Login with email & password
- ✅ Google OAuth login
- ✅ Search parking listings quickly
- ✅ Filter by price, availability, and vehicle type
- ✅ Book parking slots
- ✅ Make payments via Razorpay
- ✅ View booking history
- ✅ Cancel/modify bookings
- ✅ Rate & review parking
- ✅ QR code generation for entry

### 2️⃣ Parking Owner
- ✅ Register as owner
- ✅ Add multiple parking spaces
- ✅ Manage pricing & availability
- ✅ View all bookings
- ✅ Track earnings & analytics
- ✅ Upload parking images
- ✅ List amenities (CCTV, EV charging, etc.)
- ✅ Manual slot management

### 3️⃣ Admin
- ✅ Approve/reject parking listings
- ✅ Manage all users
- ✅ View revenue analytics
- ✅ Handle disputes
- ✅ System-wide statistics

---

## 🧩 Core Features

### 🔐 Authentication System
- Email + Password registration
- Google OAuth integration
- JWT token management
- Forgot password functionality
- Role-based access control (RBAC)
- Refresh tokens

### 🗺️ Smart Parking Search
- List-based filtering
- Advanced filters:
  - Price range
  - Availability
  - Vehicle type (Car/Bike/EV)
  - Amenities

### 🅿️ Slot Management
- Real-time slot availability
- Slot categories: Car, Bike, EV charging
- Time-based booking (hourly/daily)
- Manual slot numbering
- Bulk import capability

### 📅 Booking System
- Date & time selection
- Live availability check
- Booking confirmation
- QR code generation for entry
- Cancellation with refund logic
- Booking status tracking

### 💳 Payment System
- Razorpay integration
- Multiple payment methods
- Wallet system (optional)
- Transaction history
- Refund handling & status tracking
- Receipt generation

### 📊 Dashboard Analytics
**User Dashboard:**
- Booking history
- Active bookings
- Payment history
- Saved favorites

**Owner Dashboard:**
- Revenue tracking
- Slot occupancy analytics
- Booking calendar
- Income statements

**Admin Dashboard:**
- Total users & revenue
- Parking listings count
- Pending approvals
- System health metrics

### 🔔 Notifications
- Booking confirmation emails
- Slot availability reminders
- Payment success/failure notifications
- Owner booking alerts

### ⭐ Review & Rating System
- 5-star rating system
- User reviews with text
- Owner response to reviews
- Rating-based sorting

### 📷 Parking Photo Gallery
- Multiple image uploads via Cloudinary
- Amenity icons
- High-quality image storage

---

## 📊 Database Design (MongoDB)

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (user/owner/admin),
  photo: String (URL),
  isVerified: Boolean,
  address: String,
  createdAt: Date,
  updatedAt: Date,
  bookings: [ObjectId] // refs to Booking
}
```

### Parking Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  ownerId: ObjectId (ref: User),
  location: {
    lat: Number,
    lng: Number
  },
  address: String,
  city: String,
  pricePerHour: Number,
  totalSlots: Number,
  availableSlots: Number,
  amenities: [String], // CCTV, Covered, EV Charging
  images: [String], // Cloudinary URLs
  isApproved: Boolean,
  ratings: Number (avg),
  reviews: [ObjectId], // refs to Review
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  parkingId: ObjectId (ref: Parking),
  slotNumber: Number,
  checkInTime: Date,
  checkOutTime: Date,
  totalHours: Number,
  totalAmount: Number,
  paymentId: ObjectId (ref: Payment),
  paymentStatus: String (pending/completed/failed),
  bookingStatus: String (active/completed/cancelled),
  qrCode: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Collection
```javascript
{
  _id: ObjectId,
  bookingId: ObjectId (ref: Booking),
  userId: ObjectId (ref: User),
  amount: Number,
  paymentMethod: String (razorpay/wallet),
  status: String (pending/success/failed),
  transactionId: String (Razorpay ID),
  createdAt: Date,
  updatedAt: Date
}
```

### Review Collection
```javascript
{
  _id: ObjectId,
  parkingId: ObjectId (ref: Parking),
  userId: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 System Flow

### Booking Flow
1. User opens search and applies filters
2. System lists matching parking results
3. User selects parking & views details
4. User chooses date/time slot
5. System checks real-time availability
6. User proceeds to payment
7. Payment gateway processes transaction
8. Booking confirmed with QR code
9. Email confirmation sent

### Admin Approval Flow
1. Owner submits parking listing
2. Admin reviews submission
3. Admin approves/rejects
4. Listing goes live or rejected email sent

---

## 📂 Folder Structure

```
park_slot/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── parkingController.js
│   │   │   ├── bookingController.js
│   │   │   ├── paymentController.js
│   │   │   └── adminController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Parking.js
│   │   │   ├── Booking.js
│   │   │   ├── Payment.js
│   │   │   └── Review.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── parkingRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── env.js
│   │   │   └── constants.js
│   │   └── server.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ParkingCard.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── ParkingDetail.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── redux/
│   │   │   ├── authSlice.js
│   │   │   ├── parkingSlice.js
│   │   │   ├── bookingSlice.js
│   │   │   └── store.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── parkingService.js
│   │   │   └── bookingService.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useParking.js
│   │   │   └── useBooking.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## 🚀 Execution Plan

### Phase 1️⃣: Setup & Initial Configuration
- [x] Create folder structure
- [x] Initialize backend with Node.js & Express
- [x] Initialize frontend with React & Vite
- [x] Configure environment variables
- [x] Setup MongoDB connection

### Phase 2️⃣: Authentication & User Management
- [x] Create User model
- [x] Setup JWT authentication
- [x] Implement registration & login
- [x] Google OAuth integration
- [x] Password hashing with bcrypt
- [x] Role-based access control middleware

### Phase 3️⃣: Parking Management
- [x] Create Parking model
- [x] Create Parking controller & routes
- [x] Admin approval system
- [x] Image upload to Cloudinary
- [x] Amenities management

### Phase 4️⃣: Booking System
- [x] Create Booking model
- [x] Real-time slot management
- [x] Availability checking logic
- [x] QR code generation
- [x] Booking confirmation emails

### Phase 5️⃣: Payment Integration
- [x] Create Payment model
- [x] Razorpay integration
- [x] Payment success/failure handling
- [x] Receipt generation
- [x] Refund logic

### Phase 6️⃣: Frontend Components
- [x] Build authentication pages (Login/Register)
- [x] Search & filter parking UI
- [x] Parking detail page
- [x] Booking form & confirmation
- [x] Payment modal
- [x] User, Owner, Admin dashboards

### Phase 7️⃣: Redux & State Management
- [x] Configure Redux store
- [x] Create slices for auth, parking, booking
- [x] Connect components to Redux

### Phase 8️⃣: Advanced Features
- [x] Review & rating system
- [x] Smart list filtering and recommendations
- [x] Real-time notifications with Socket.io
- [x] Analytics dashboard

### Phase 9️⃣: Testing & Deployment
- [x] Unit tests
- [x] Integration tests
- [x] Deploy backend to Heroku/Railway
- [x] Deploy frontend to Vercel/Netlify

### Phase 🔟: Release Operations
- [x] Staging and production branch deployments
- [x] Manual deployment with environment selection
- [x] One-click rollback workflow by git ref
- [x] CI/CD workflow hardening

Deployment automation is configured with CI/CD workflows.
Add these GitHub repository secrets before triggering deployment:

- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE` (optional)
- `RAILWAY_SERVICE_STAGING` (optional)
- `RAILWAY_SERVICE_PRODUCTION` (optional)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing using bcrypt (salt rounds: 10)
- ✅ Input validation with Joi
- ✅ Rate limiting on API endpoints
- ✅ HTTPS enforcement
- ✅ CORS configuration
- ✅ Environment variable management
- ✅ SQL injection prevention via Mongoose

---

## 🌟 Advanced Features (For Enhancement)

- 🤖 AI-based parking prediction (peak hour analysis)
- 📍 Personalized parking recommendations
- 🧾 PDF invoice generation
- 💰 Smart dynamic pricing (peak hours)
- 🔌 EV charging station integration
- 📱 Mobile app (React Native)
- 🚨 IoT integration for real-time slot tracking

---

## 📦 Required Packages

### Backend
```
express, mongoose, jwt, bcrypt, cors, dotenv, joi, multer, 
cloudinary, razorpay, nodemailer, qrcode, socket.io
```

### Frontend
```
react, react-router-dom, redux, redux-toolkit, axios, tailwindcss,
socket.io-client, zustand, react-query
```

---

## 🚀 Quick Start Commands

```bash
# Clone repository
git clone <repo-url>
cd park_slot

# Backend setup
cd backend
npm install
cp .env.example .env
npm start

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 📞 Support & Contribution

For issues, feature requests, or contributions, please open an issue or submit a PR.

---

## 📄 License

MIT License - Feel free to use this project for educational and commercial purposes.

---

**Created:** April 2026 | **Version:** 1.0.0
