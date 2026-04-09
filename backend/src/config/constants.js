// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  OWNER: 'owner',
  ADMIN: 'admin'
};

// Booking Status
export const BOOKING_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Parking Amenities
export const AMENITIES = [
  'CCTV Surveillance',
  'Covered Parking',
  'EV Charging',
  'Security Guard',
  'Car Wash',
  'Valet Service',
  '24/7 Access',
  'Wheelchair Accessible'
];

// Vehicle Types
export const VEHICLE_TYPES = [
  'Car',
  'Bike',
  'EV',
  'Truck'
];

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  SLOT_NOT_AVAILABLE: 'Parking slot not available',
  PAYMENT_FAILED: 'Payment processing failed'
};
