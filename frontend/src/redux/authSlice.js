import { createSlice } from '@reduxjs/toolkit';

const parseUserFromToken = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return {
      _id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch {
    return null;
  }
};

const existingToken = localStorage.getItem('token');

const initialState = {
  user: parseUserFromToken(existingToken),
  token: existingToken || null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAuthToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    }
  }
});

export const { authStart, authSuccess, authFailure, logout, setUser, setAuthToken } = authSlice.actions;
export default authSlice.reducer;
