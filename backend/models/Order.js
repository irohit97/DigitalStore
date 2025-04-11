// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        downloadLinkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'DownloadLink'
        },
        purchaseDate: {
          type: Date,
          default: Date.now
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'completed'  // For digital products, default to completed
    },
    paymentMethod: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Order', orderSchema);