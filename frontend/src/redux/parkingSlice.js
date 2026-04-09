import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { parkingService } from '../services/parkingService.js';

export const fetchParkings = createAsyncThunk('parking/fetchAll', async (filters = {}, thunkAPI) => {
  try {
    const response = await parkingService.getAllParking(filters);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch parkings');
  }
});

export const fetchParkingById = createAsyncThunk('parking/fetchById', async (id, thunkAPI) => {
  try {
    const response = await parkingService.getParkingById(id);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch parking details');
  }
});

const parkingSlice = createSlice({
  name: 'parking',
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParkings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParkings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchParkings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchParkingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParkingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchParkingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default parkingSlice.reducer;
