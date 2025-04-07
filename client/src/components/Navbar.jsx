import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useState } from 'react';

const Navbar = () => {
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">DigitalStore</Link>
        <div className="hidden md:flex space-x-6">
          <Link to="/about" className="hover:text-blue-600">About Us</Link>
          <Link to="/contact" className="hover:text-blue-600">Contact Us</Link>
          
          {/* Products Dropdown */}
          <div className="relative group">
            <div className="flex items-center hover:text-blue-600 cursor-pointer">
              <span>Products</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
              <Link to="/ebooks" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                eBooks
              </Link>
              <Link to="/software" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Software
              </Link>
              <Link to="/graphics" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Graphics
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="border rounded-full py-1 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <Link to="/wishlist" className="relative p-2">
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {wishlistItems.length}
          </span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </Link>
        
        <Link to="/cart" className="relative p-2">
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {cartItems.length}
          </span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </Link>
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 flex items-center space-x-1 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {user && (
              <span className="hidden md:inline text-sm">{user.name.split(' ')[0]}</span>
            )}
          </button>
          
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-20"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              {token ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Hi, {user.name.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link 
                    to="/cart" 
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Cart
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;