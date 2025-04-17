// client/src/redux/slices/authSlice.js

import { createSlice } from '@reduxjs/toolkit';
import { clearUserData } from '../../utils/authUtils';

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      
      // Clear all user-related data from localStorage
      clearUserData();
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload.user || action.payload;
      state.token = action.payload.token || localStorage.getItem('token');
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    loadUserFromStorage: (state) => {
      state.isLoading = true;
      state.token = localStorage.getItem('token');
      
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          state.user = JSON.parse(savedUser);
        }
      } catch (err) {
        console.error('Error parsing user from localStorage', err);
      }
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  setUser,
  setLoading,
  loadUserFromStorage
} = authSlice.actions;

export default authSlice.reducer;
