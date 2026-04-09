import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { authService } from '../services/authService.js';
import { authStart, authSuccess, authFailure, logout as logoutAction } from '../redux/authSlice.js';

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0];
  }

  return responseData?.message || responseData?.error?.message || error?.message || fallbackMessage;
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const login = useCallback(async (credentials) => {
    dispatch(authStart());
    try {
      const response = await authService.login(credentials);
      dispatch(authSuccess(response));
      return response;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Login failed');
      dispatch(authFailure(message));
      throw new Error(message);
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    authService.logout();
    dispatch(logoutAction());
  }, [dispatch]);

  const register = useCallback(async (userData) => {
    dispatch(authStart());
    try {
      const response = await authService.register(userData);
      dispatch(authSuccess(response));
      return response;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Registration failed');
      dispatch(authFailure(message));
      throw new Error(message);
    }
  }, [dispatch]);

  return {
    ...auth,
    login,
    logout,
    register,
    isAuthenticated: !!auth.token
  };
};
