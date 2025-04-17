// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Async thunks for API operations
export const getCartAsync = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: getAuthToken() }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart`, 
        { productId, quantity },
        { headers: { Authorization: getAuthToken() } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const deleteFromCartAsync = createAsyncThunk(
  'cart/deleteFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/cart/${productId}`, {
        headers: { Authorization: getAuthToken() }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const updateCartItemQuantityAsync = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/cart/${productId}`, 
        { quantity },
        { headers: { Authorization: getAuthToken() } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item quantity');
    }
  }
);

// Initial state
const initialState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  isDeleting: false,
  deleteSuccess: false,
  deleteError: null,
  addSuccess: false,
  addError: null,
  isUpdatingQuantity: false,
  updateQuantityError: null
};

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetDeleteStatus: (state) => {
      state.deleteSuccess = false;
      state.deleteError = null;
    },
    resetAddStatus: (state) => {
      state.addSuccess = false;
      state.addError = null;
    },
    resetUpdateQuantityStatus: (state) => {
      state.isUpdatingQuantity = false;
      state.updateQuantityError = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get cart
      .addCase(getCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(getCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.isLoading = true;
        state.addSuccess = false;
        state.addError = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.addSuccess = true;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.addError = action.payload;
      })
      
      // Delete from cart
      .addCase(deleteFromCartAsync.pending, (state) => {
        state.isDeleting = true;
        state.deleteSuccess = false;
        state.deleteError = null;
      })
      .addCase(deleteFromCartAsync.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.deleteSuccess = true;
        state.deleteError = null;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(deleteFromCartAsync.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteSuccess = false;
        state.deleteError = action.payload;
      })
      
      // Update cart item quantity
      .addCase(updateCartItemQuantityAsync.pending, (state) => {
        state.isUpdatingQuantity = true;
        state.updateQuantityError = null;
      })
      .addCase(updateCartItemQuantityAsync.fulfilled, (state, action) => {
        state.isUpdatingQuantity = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(updateCartItemQuantityAsync.rejected, (state, action) => {
        state.isUpdatingQuantity = false;
        state.updateQuantityError = action.payload;
      });
  }
});

export const { 
  resetDeleteStatus, 
  resetAddStatus,
  resetUpdateQuantityStatus,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;