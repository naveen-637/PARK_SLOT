import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { fetchParkings, fetchParkingById } from '../redux/parkingSlice.js';

export const useParking = () => {
  const dispatch = useDispatch();
  const parking = useSelector((state) => state.parking);

  const loadParkings = useCallback((filters) => dispatch(fetchParkings(filters)), [dispatch]);
  const loadParkingById = useCallback((id) => dispatch(fetchParkingById(id)), [dispatch]);

  return {
    ...parking,
    loadParkings,
    loadParkingById
  };
};
