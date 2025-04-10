const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      return res.status(200).json({ items: [], total: 0, totalItems: 0 });
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error getting cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id });
    }

    // Add item to cart using the model method
    await cart.addItem(product, quantity);
    await cart.populate('items.product');
    
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put('/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Update quantity using the model method
    await cart.updateQuantity(productId, quantity);
    await cart.populate('items.product');
    
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item using the model method
    await cart.removeItem(productId);
    await cart.populate('items.product');
    
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error removing cart item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Clear cart using the model method
    await cart.clearCart();
    
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 