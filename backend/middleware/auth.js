const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // For debugging
    
    // Find user and attach to request object
    const userId = decoded.id || decoded.userId;
    console.log('Looking for user with ID:', userId); // For debugging
    
    req.user = await User.findById(userId).select('-password');
    
    if (!req.user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('User authenticated:', req.user._id);
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// For backward compatibility
const verifyToken = protect;

module.exports = { protect, verifyToken };