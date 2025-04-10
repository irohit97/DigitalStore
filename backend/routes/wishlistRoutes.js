const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add item to wishlist
router.post('/', wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router; 