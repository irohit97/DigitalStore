// redux/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Async thunks for API operations
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: getAuthToken() }
      });
      return response.data;
    } catch (error) {
      console.error('Fetch wishlist error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addToWishlistAsync',
  async (product, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/wishlist`, {
        productId: product._id
      }, {
        headers: { Authorization: getAuthToken() }
      });
      return response.data;
    } catch (error) {
      console.error('Add to wishlist error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to wishlist');
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: getAuthToken() }
      });
      return response.data;
    } catch (error) {
      console.error('Remove from wishlist error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from wishlist');
    }
  }
);

export const clearWishlistAsync = createAsyncThunk(
  'wishlist/clearWishlistAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/wishlist`, {
        headers: { Authorization: getAuthToken() }
      });
      
      return response.data;
    } catch (error) {
      console.error('Clear wishlist error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to clear wishlist');
    }
  }
);

const initialState = {
  items: [],
  totalItems: 0,
  loading: false,
  error: null,
  isDeleting: false,
  deleteSuccess: false,
  deleteError: null,
  addSuccess: false,
  addError: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
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
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.loading = false;
      state.error = null;
      state.isDeleting = false;
      state.deleteSuccess = false;
      state.deleteError = null;
      state.addSuccess = false;
      state.addError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to wishlist
      .addCase(addToWishlistAsync.pending, (state) => {
        state.loading = true;
        state.addSuccess = false;
        state.addError = null;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.addSuccess = true;
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.addError = action.payload;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlistAsync.pending, (state) => {
        state.isDeleting = true;
        state.deleteSuccess = false;
        state.deleteError = null;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.deleteSuccess = true;
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      })
      
      // Clear wishlist
      .addCase(clearWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
      })
      .addCase(clearWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetDeleteStatus, resetAddStatus, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;