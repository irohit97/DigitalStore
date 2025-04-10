// redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Get all orders for the current user
export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          Authorization: getAuthToken()
        }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

// Create a new order
export const createOrderAsync = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthToken()
        }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create order'
      );
    }
  }
);

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
  createOrderLoading: false,
  createOrderSuccess: false,
  createOrderError: null
};

// Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCreateOrderStatus: (state) => {
      state.createOrderSuccess = false;
      state.createOrderError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrdersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.orders || [];
      })
      .addCase(fetchOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create order
      .addCase(createOrderAsync.pending, (state) => {
        state.createOrderLoading = true;
        state.createOrderSuccess = false;
        state.createOrderError = null;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderSuccess = true;
        // Add the new order to the beginning of the items array
        state.items = [action.payload.order, ...state.items];
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderError = action.payload;
      })
  }
});

export const { resetCreateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer; 