// routes/products.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  addProduct
} = require('../controllers/productController');

// ✅ Use controller for getting all products
router.get('/', getProducts);

// ✅ Use controller for getting single product
router.get('/:id', getProductById);

// ✅ Use controller for adding a new product
router.post('/', addProduct);

module.exports = router;
