// routes/products.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const {
  getProducts,
  getProductById,
  addProduct
} = require('../controllers/productController');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Get all products (optionally filter by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Add new product
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/products/:id/download
// @desc    Download a purchased product
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    // Check if user has purchased this product
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': req.params.id,
      status: 'completed'
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'You have not purchased this product'
      });
    }

    // Get product file path
    const product = await Product.findById(req.params.id);
    if (!product || !product.filePath) {
      return res.status(404).json({
        success: false,
        message: 'Product file not found'
      });
    }

    // Send file
    res.download(product.filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/products/:id/send-email
// @desc    Send product download link to user's email
// @access  Private
router.post('/:id/send-email', protect, async (req, res) => {
  try {
    // Check if user has purchased this product
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': req.params.id,
      status: 'completed'
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'You have not purchased this product'
      });
    }

    // Get product details
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create download link
    const downloadLink = `${process.env.FRONTEND_URL}/api/products/${product._id}/download`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: `Your Digital Product: ${product.title}`,
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Here is your download link for ${product.title}:</p>
        <a href="${downloadLink}">Download ${product.title}</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you have any questions, please contact our support team.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Download link sent to your email'
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
