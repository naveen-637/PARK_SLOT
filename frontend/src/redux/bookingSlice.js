import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { bookingService } from '../services/bookingService.js';

const unwrapData = (payload) => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
};

export const fetchMyBookings = createAsyncThunk('booking/fetchMine', async (_, thunkAPI) => {
  try {
    const response = await bookingService.getMyBookings();
    return unwrapData(response);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch bookings');
  }
});

export const createBookingThunk = createAsyncThunk('booking/create', async (payload, thunkAPI) => {
  try {
    const response = await bookingService.createBooking(payload);
    return unwrapData(response);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      'Unable to create booking'
    );
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    items: [],
    latest: null,
    loading: false,
    error: null
  },
  reducers: {
    clearLatestBooking: (state) => {
      state.latest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBookingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBookingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.latest = action.payload;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createBookingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearLatestBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
