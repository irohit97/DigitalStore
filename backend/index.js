require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Corrected route imports
const authRoutes = require('./routes/auth');  // Changed from './middleware/auth'
const productRoutes = require('./routes/products');  // Changed from './routes/product'
const paymentRoutes = require('./routes/payment');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const { verifyToken } = require('./middleware/auth');

// Load models
require('./models/User');
require('./models/Product');
require('./models/Order');
require('./models/Cart');
require('./models/Wishlist');
require('./models/DownloadLink');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));