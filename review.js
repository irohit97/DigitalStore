import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const productsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Improved dropdown hover handling
  useEffect(() => {
    const productsDropdown = productsDropdownRef.current;
    let productsTimeout;

    const handleProductsMouseEnter = () => {
      clearTimeout(productsTimeout);
      setIsProductsOpen(true);
    };

    const handleProductsMouseLeave = () => {
      productsTimeout = setTimeout(() => {
        setIsProductsOpen(false);
      }, 300); // 300ms delay before closing
    };

    if (productsDropdown) {
      productsDropdown.addEventListener('mouseenter', handleProductsMouseEnter);
      productsDropdown.addEventListener('mouseleave', handleProductsMouseLeave);
    }

    return () => {
      if (productsDropdown) {
        productsDropdown.removeEventListener('mouseenter', handleProductsMouseEnter);
        productsDropdown.removeEventListener('mouseleave', handleProductsMouseLeave);
      }
      clearTimeout(productsTimeout);
    };
  }, []);

  // Profile dropdown handling (similar to products)
  useEffect(() => {
    const profileDropdown = profileDropdownRef.current;
    let profileTimeout;

    const handleProfileMouseEnter = () => {
      clearTimeout(profileTimeout);
      setIsProfileOpen(true);
    };

    const handleProfileMouseLeave = () => {
      profileTimeout = setTimeout(() => {
        setIsProfileOpen(false);
      }, 300);
    };

    if (profileDropdown) {
      profileDropdown.addEventListener('mouseenter', handleProfileMouseEnter);
      profileDropdown.addEventListener('mouseleave', handleProfileMouseLeave);
    }

    return () => {
      if (profileDropdown) {
        profileDropdown.removeEventListener('mouseenter', handleProfileMouseEnter);
        profileDropdown.removeEventListener('mouseleave', handleProfileMouseLeave);
      }
      clearTimeout(profileTimeout);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Left side - Logo and main links */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">DigitalStore</Link>
        
        <div className="hidden md:flex space-x-6">
          <Link to="/about" className="hover:text-blue-600">About Us</Link>
          <Link to="/contact" className="hover:text-blue-600">Contact Us</Link>
          
          {/* Products Dropdown */}
          <div 
            className="relative" 
            ref={productsDropdownRef}
          >
            <button 
              className="hover:text-blue-600 flex items-center"
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              aria-expanded={isProductsOpen}
            >
              Products
              <svg 
                className={w-4 h-4 ml-1 transition-transform ${isProductsOpen ? 'rotate-180' : ''}}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu with larger hover area */}
            {isProductsOpen && (
              <div 
                className="absolute left-0 mt-0 w-48 bg-white shadow-lg rounded-md py-2 z-10"
                onMouseEnter={() => setIsProductsOpen(true)}
                onMouseLeave={() => setIsProductsOpen(false)}
              >
                <Link 
                  to="/ebooks" 
                  className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsProductsOpen(false)}
                >
                  eBooks
                </Link>
                <Link 
                  to="/software" 
                  className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsProductsOpen(false)}
                >
                  Software
                </Link>
                <Link 
                  to="/graphics" 
                  className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsProductsOpen(false)}
                >
                  Graphics
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side icons */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="border rounded-full py-1 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
<Link to="/wishlist" className="relative p-2">
  {/* Notification badge removed */}
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
</Link>

<Link to="/cart" className="relative p-2">
  {/* Notification badge removed */}
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
</Link>
  {/* Profile Dropdown */}
        <div 
          className="relative" 
          ref={profileDropdownRef}
        >
          <button 
            className="p-2"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          
          {isProfileOpen && (
            <div 
              className="absolute right-0 mt-0 w-36 bg-white shadow-lg rounded-md py-2 z-10"
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <Link 
                to="/login" 
                className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;