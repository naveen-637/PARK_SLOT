import { useDispatch, useSelector } from 'react-redux';
import { createBookingThunk, fetchMyBookings, clearLatestBooking } from '../redux/bookingSlice.js';

export const useBooking = () => {
  const dispatch = useDispatch();
  const booking = useSelector((state) => state.booking);

  return {
    ...booking,
    loadMyBookings: () => dispatch(fetchMyBookings()),
    createBooking: (payload) => dispatch(createBookingThunk(payload)),
    resetLatest: () => dispatch(clearLatestBooking())
  };
};
