// controllers/productController.js
const Product = require('../models/Product');

// ✅ Get all products (with optional category filter)
const getProducts = async (req, res) => {
  try {
    let { category } = req.query;
    category = 'graphic'; // hardcoded for now
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get product by ID
const getProductById = async (req, res) => {
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
};

// ✅ Add new product
const addProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ CommonJS export
module.exports = {
  getProducts,
  getProductById,
  addProduct
};
