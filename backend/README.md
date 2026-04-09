# Backend - Parking Slot Reservation System

Express.js + MongoDB backend API for the Parking Slot Reservation System

## 📁 Project Structure

```
src/
├── controllers/      # Business logic
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── middleware/      # Custom middleware
├── config/          # Configuration files
├── utils/           # Utility functions
└── server.js        # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Razorpay account (for payments)
- Cloudinary account (for image uploads)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your configuration to .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Parking
- `GET /api/parking` - Get all parking (with filters)
- `GET /api/parking/:id` - Get parking details
- `POST /api/parking` - Create parking (owner only)
- `PUT /api/parking/:id` - Update parking (owner only)
- `DELETE /api/parking/:id` - Delete parking (owner only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Cancel booking
- `GET /api/bookings/:id` - Get booking details

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/parkings` - Get pending approvals
- `PUT /api/admin/parkings/:id/approve` - Approve parking

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 🧪 Testing

```bash
npm test
```

## 🛠️ Technologies

- Express.js
- MongoDB
- JWT
- Bcryptjs
- Razorpay
- Cloudinary
- Nodemailer
- Socket.io

## 📝 License

MIT
