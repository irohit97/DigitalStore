const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const DownloadLink = require('../models/DownloadLink');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    
    const { items, totalAmount, paymentMethod } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ message: 'No items in the order' });
    }
    
    // Validate each item
    for (const item of items) {
      if (!item.product || !item.product._id) {
        return res.status(400).json({ message: 'Invalid product data in order items' });
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity in order items' });
      }
    }
    
    // Find download links for each product
    const orderItems = await Promise.all(items.map(async (item) => {
      try {
        // Find existing download link or create new one
        let downloadLink = await DownloadLink.findOne({ product: item.product._id });
        
        if (!downloadLink) {
          // Generate a default download URL if none is provided
          const defaultDownloadUrl = `https://example.com/downloads/${item.product._id}`;
          
          downloadLink = await DownloadLink.create({
            product: item.product._id,
            link: item.product.downloadUrl || defaultDownloadUrl
          });
        }
        
        return {
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          downloadLinkId: downloadLink._id
        };
      } catch (err) {
        console.error('Error processing item:', err);
        throw new Error(`Error processing item: ${err.message}`);
      }
    }));
    
    // Create a new order
    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      status: 'completed',  // For digital products, set as completed immediately
      paymentMethod: paymentMethod || 'Razorpay'  // Use the provided payment method or default to Razorpay
    });

    // Save the order
    await newOrder.save();
    
    // Populate the order with product and download link details
    await newOrder.populate([
      { path: 'items.product' },
      { path: 'items.downloadLinkId' }
    ]);
    
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
      .populate('items.downloadLinkId')
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

// @route   GET /api/orders/download/:orderId/:itemId
// @desc    Get download link for a purchased item
// @access  Private
router.get('/download/:orderId/:itemId', protect, async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    // Find the order and verify it belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      'items._id': itemId
    }).populate('items.downloadLinkId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or item not in order'
      });
    }

    // Find the specific item in the order
    const orderItem = order.items.find(item => item._id.toString() === itemId);
    
    if (!orderItem || !orderItem.downloadLinkId) {
      return res.status(404).json({
        success: false,
        message: 'Download link not found'
      });
    }

    // Check if the download link has expired
    if (orderItem.downloadLinkId.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Download link has expired'
      });
    }

    // Return the download link
    res.json({
      success: true,
      downloadUrl: orderItem.downloadLinkId.link
    });
  } catch (error) {
    console.error('Error getting download link:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 