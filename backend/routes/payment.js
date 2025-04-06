// routes/payment.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const razorpay = require('../../client/src/utils/razorpay');
const { sendDownloadLinkEmail } = require('../../client/src/utils/email');

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, products, customerEmail } = req.body;
    
    // Create order in database
    const order = new Order({
      user: req.userId || null,
      products,
      amount,
      status: 'created'
    });
    await order.save();
    
    // Create Razorpay order
    const options = {
      amount: amount,
      currency: currency || 'INR',
      receipt: order._id.toString(),
      payment_capture: 1
    };
    
    const razorpayOrder = await razorpay.orders.create(options);
    
    // Update order with Razorpay details
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    
    res.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      orderId: order._id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'completed',
        paidAt: new Date()
      },
      { new: true }
    ).populate('products.product');
    
    // Send download links to customer email
    if (order.userEmail) {
      const downloadLinks = order.products.map(p => ({
        name: p.product.title,
        url: p.product.downloadUrl
      }));
      await sendDownloadLinkEmail(order.userEmail, downloadLinks);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;