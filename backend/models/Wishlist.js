const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = async function(product) {
  // Check if product already exists in wishlist
  const exists = this.items.some(item => item.product.toString() === product._id.toString());
  if (exists) {
    throw new Error('Product already in wishlist');
  }
  
  this.items.push({ product: product._id });
  this.totalItems = this.items.length;
  await this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId);
  this.totalItems = this.items.length;
  await this.save();
};

// Method to clear the wishlist
wishlistSchema.methods.clearWishlist = async function() {
  this.items = [];
  this.totalItems = 0;
  await this.save();
};

module.exports = mongoose.model('Wishlist', wishlistSchema); 