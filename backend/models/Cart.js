const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add a pre-save middleware to update totals
cartSchema.pre('save', function(next) {
  // Calculate total items
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Update lastUpdated timestamp
  this.lastUpdated = new Date();
  
  next();
});

// Add a method to add items to cart
cartSchema.methods.addItem = async function(product, quantity = 1) {
  const existingItem = this.items.find(item => item.product.toString() === product._id.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: product._id,
      quantity,
      price: product.price,
      title: product.title,
      image: product.image
    });
  }
  
  return this.save();
};

// Add a method to remove items from cart
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

// Add a method to update item quantity
cartSchema.methods.updateQuantity = async function(productId, quantity) {
  const item = this.items.find(item => item.product.toString() === productId.toString());
  if (item) {
    item.quantity = quantity;
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Add a method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.total = 0;
  this.totalItems = 0;
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema); 