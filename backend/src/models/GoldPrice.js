const mongoose = require('mongoose');

const goldPriceSchema = new mongoose.Schema(
  {
    // Price per mithqal in IQD for each karat
    price18K: {
      type: Number,
      required: [true, '18K price is required'],
      min: [0, 'Price must be positive'],
    },
    price21K: {
      type: Number,
      required: [true, '21K price is required'],
      min: [0, 'Price must be positive'],
    },
    price22K: {
      type: Number,
      required: [true, '22K price is required'],
      min: [0, 'Price must be positive'],
    },
    price24K: {
      type: Number,
      required: [true, '24K price is required'],
      min: [0, 'Price must be positive'],
    },
    // USD exchange rate (1 USD = X IQD)
    usdRate: {
      type: Number,
      required: [true, 'USD rate is required'],
      min: [0, 'Rate must be positive'],
      default: 1310,
    },
    // Gold price per gram in USD (international spot price)
    goldUsdPerGram: {
      type: Number,
      default: 0,
    },
    // Market label
    market: {
      type: String,
      default: 'Erbil Gold Market',
    },
    // Who last updated
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Only one active price record at a time
goldPriceSchema.statics.getCurrent = async function () {
  return this.findOne({ isActive: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('GoldPrice', goldPriceSchema);
