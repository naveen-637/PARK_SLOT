import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import parkingReducer from './parkingSlice.js';
import bookingReducer from './bookingSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parking: parkingReducer,
    booking: bookingReducer,
  }
});
