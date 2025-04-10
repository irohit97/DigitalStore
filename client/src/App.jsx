import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserFromStorage, setUser, setLoading } from './redux/slices/authSlice';
import axios from 'axios';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import ProductDetails from './pages/ProductDetails';
import Ebooks from './pages/Ebooks';
import Software from './pages/Software';
import Graphics from './pages/Graphics';
import LoadingSpinner from './components/LoadingSpinner';
import { getCartAsync } from './redux/slices/cartSlice';
import { fetchWishlist } from './redux/slices/wishlistSlice';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isLoading, user, token } = useSelector((state) => state.auth);
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // First load user from storage to get token and basic user info
      dispatch(loadUserFromStorage());
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      
      if (token) {
        try {
          console.log('Authenticating with token...');
          // Get fresh user data from API
          const response = await axios.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('User data fetched successfully:', response.data);
          
          // Save complete user data to Redux
          dispatch(setUser({ 
            token: token,
            user: response.data.user || response.data
          }));
          
          // Update localStorage with the latest user data
          localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
          
          // Fetch cart and wishlist when user is authenticated
          dispatch(getCartAsync());
          dispatch(fetchWishlist());
        } catch (err) {
          console.error('Authentication error:', err);
          
          // If API call fails but we have stored user data, use that
          if (storedUser) {
            dispatch(setUser({ 
              token: token,
              user: storedUser
            }));
            
            // Still try to fetch cart and wishlist
            dispatch(getCartAsync());
            dispatch(fetchWishlist());
          } else {
            // Clear token only if we don't have stored user data
            localStorage.removeItem('token');
            dispatch(setLoading(false));
          }
        }
      } else {
        // If no token, make sure to set loading to false
        dispatch(setLoading(false));
      }
      
      setAppLoaded(true);
    };

    initApp();
  }, [dispatch]);

  // Only show loading spinner for a maximum of 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        dispatch(setLoading(false));
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, dispatch]);

  if (isLoading && !appLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/ebooks" element={<Ebooks />} />
        <Route path="/software" element={<Software />} />
        <Route path="/graphics" element={<Graphics />} />

        {/* Protected Routes */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } 
        />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
