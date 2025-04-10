const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
    if (!wishlist) {
      return res.status(200).json({ items: [], totalItems: 0 });
    }
    res.status(200).json(wishlist);
  } catch (err) {
    console.error('Error getting wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlist
// @desc    Add item to wishlist
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create user's wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id });
    }

    // Add item to wishlist using the model method
    await wishlist.addItem(product);
    await wishlist.populate('items.product');
    
    res.status(200).json(wishlist);
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove item using the model method
    await wishlist.removeItem(productId);
    await wishlist.populate('items.product');
    
    res.status(200).json(wishlist);
  } catch (err) {
    console.error('Error removing wishlist item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Clear wishlist using the model method
    await wishlist.clearWishlist();
    
    res.status(200).json(wishlist);
  } catch (err) {
    console.error('Error clearing wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 