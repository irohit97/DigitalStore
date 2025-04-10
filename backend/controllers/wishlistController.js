const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    console.log('Fetching wishlist for user:', req.user._id);
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items');
    
    if (!wishlist) {
      console.log('No wishlist found, returning empty');
      return res.status(200).json({ items: [], totalItems: 0 });
    }
    
    console.log('Found wishlist with items:', wishlist.items.length);
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error in getWishlist:', error);
    res.status(500).json({ 
      message: 'Error fetching wishlist', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log('Adding product to wishlist:', productId);
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create user's wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      console.log('Creating new wishlist for user');
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check if product already in wishlist
    if (wishlist.items.includes(productId)) {
      console.log('Product already in wishlist');
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.items.push(productId);
    wishlist.totalItems = wishlist.items.length;
    await wishlist.save();
    await wishlist.populate('items');
    
    console.log('Product added to wishlist successfully');
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    res.status(500).json({ 
      message: 'Error adding to wishlist', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('Removing product from wishlist:', productId);
    
    // Find the wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.log('No wishlist found');
      return res.status(200).json({
        success: true,
        items: [],
        totalItems: 0,
        message: 'No wishlist found'
      });
    }

    // Convert productId to string for comparison
    const productIdStr = productId.toString();
    
    // Filter out the item to be removed
    wishlist.items = wishlist.items.filter(item => item.toString() !== productIdStr);
    wishlist.totalItems = wishlist.items.length;
    
    // Save the updated wishlist
    await wishlist.save();
    
    // Populate the items before sending response
    await wishlist.populate('items');
    
    console.log('Product removed from wishlist successfully');
    res.status(200).json({
      success: true,
      items: wishlist.items,
      totalItems: wishlist.totalItems,
      message: 'Product removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Error in removeFromWishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    console.log('Clearing wishlist for user:', req.user._id);
    
    // Find the wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.log('No wishlist found, creating new one');
      wishlist = new Wishlist({ user: req.user._id, items: [], totalItems: 0 });
    }

    // Clear the wishlist
    wishlist.items = [];
    wishlist.totalItems = 0;
    
    // Save the changes
    await wishlist.save();
    
    console.log('Wishlist cleared successfully');
    
    // Return success response
    res.status(200).json({
      success: true,
      items: [],
      totalItems: 0,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Error in clearWishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist',
      error: error.message
    });
  }
}; 