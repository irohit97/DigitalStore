// client/src/redux/store.js

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';

// Custom transform to handle cart serialization
const cartTransform = {
  in: (state, key) => {
    if (key === 'cart') {
      // Ensure we don't have any redundant properties in cart items
      if (state && state.items) {
        // Map to normalize cart item structure
        const normalizedItems = state.items.map(item => ({
          _id: item._id,
          title: item.title || 'Unknown Product',
          price: item.price || 0,
          image: item.image || '',
          category: item.category || 'Unknown',
          quantity: item.quantity || 1
        }));
        
        // Remove duplicates by _id (keeping only the last occurrence)
        const uniqueItems = [];
        const seenIds = new Set();
        
        // Process items in reverse to keep the most recent version
        for (let i = normalizedItems.length - 1; i >= 0; i--) {
          const item = normalizedItems[i];
          if (!seenIds.has(item._id)) {
            uniqueItems.unshift(item); // Add to front to maintain original order
            seenIds.add(item._id);
          }
        }
        
        // Return a new state object instead of modifying the existing one
        return {
          ...state,
          items: uniqueItems
        };
      }
    }
    return state;
  },
  out: (state, key) => {
    return state;
  }
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart', 'wishlist'], // Persist auth, cart, and wishlist slices
  blacklist: ['auth.isLoading'], // Don't persist loading state
  transforms: [cartTransform]
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  orders: orderReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store);
