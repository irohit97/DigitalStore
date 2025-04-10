const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ message: 'No items in the order' });
    }
    
    // Create a new order
    const newOrder = new Order({
      user: req.user._id,
      items: items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount,
      status: 'completed',  // For digital products, set as completed immediately
      paymentMethod: 'Razorpay'
    });

    // Save the order
    await newOrder.save();
    
    // Return the order
    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/orders
// @desc    Get all orders for the current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router; 