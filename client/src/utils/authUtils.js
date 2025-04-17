/**
 * Clears all user-related data from localStorage
 * This includes auth tokens, user info, cart, wishlist, and any other user-specific data
 */
export const clearUserData = () => {
  // Clear authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear cart and wishlist data
  localStorage.removeItem('cart');
  localStorage.removeItem('wishlist');
  
  // Clear any other user-specific data that might be stored
  // Add more items here as needed
  
  // You can also clear sessionStorage if needed
  // sessionStorage.clear();
};

/**
 * Checks if a user is logged in by verifying the token exists
 * @returns {boolean} True if user is logged in, false otherwise
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

/**
 * Gets the current user from localStorage
 * @returns {Object|null} User object or null if not logged in
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}; 