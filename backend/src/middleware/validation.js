import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((e) => e.message)
      });
    }

    req.body = value;
    next();
  };
};

// Validation Schemas
export const schemas = {
  register: Joi.object({
    name: Joi.string().required().min(3).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(100),
    phone: Joi.string().required(),
    role: Joi.string().valid('customer', 'owner', 'admin')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createParking: Joi.object({
    title: Joi.string().required().max(200),
    description: Joi.string().allow('').max(1000),
    address: Joi.string().required(),
    city: Joi.string().required(),
    pricePerHour: Joi.number().required().min(0),
    totalSlots: Joi.number().required().min(1),
    amenities: Joi.array().items(Joi.string()),
    vehicleTypes: Joi.array().items(Joi.string().valid('Car', 'Bike', 'EV', 'Truck')),
    operatingHours: Joi.object({
      open: Joi.string().allow(''),
      close: Joi.string().allow('')
    }).optional(),
    location: Joi.object({
      lat: Joi.number().required().min(-90).max(90),
      lng: Joi.number().required().min(-180).max(180)
    })
  }),

  createBooking: Joi.object({
    parkingId: Joi.string().required(),
    slotNumber: Joi.number().required().min(1),
    checkInTime: Joi.date().required(),
    checkOutTime: Joi.date().required()
  }),

  checkAvailability: Joi.object({
    parkingId: Joi.string().required(),
    slotNumber: Joi.number().min(1),
    checkInTime: Joi.date().required(),
    checkOutTime: Joi.date().required()
  }),

  createReview: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).allow('', null)
  })
};
