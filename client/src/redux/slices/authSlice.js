// client/src/redux/slices/authSlice.js

import { createSlice } from '@reduxjs/toolkit';

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
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;
      state.isLoading = false;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  setUser
} = authSlice.actions;

// Optional: load from localStorage if you still use it in App.jsx
const loadUserFromStorage = () => (dispatch) => {
  const token = localStorage.getItem('token');
  if (token) {
    dispatch(setUser({ token }));
  } else {
    dispatch(setUser({ token: null, user: null }));
  }
};

export { loadUserFromStorage };

export default authSlice.reducer;
