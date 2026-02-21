const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    nameAr: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    // Weight in mithqal (1 mithqal = 5 grams in Erbil/Iraq gold market)
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0.01, 'Weight must be at least 0.01 mithqal'],
    },
    // Gold karat
    karat: {
      type: String,
      required: [true, 'Karat is required'],
      enum: {
        values: ['18K', '21K', '22K', '24K'],
        message: 'Karat must be 18K, 21K, 22K, or 24K',
      },
    },
    // Category
    category: {
      type: String,
      enum: ['ring', 'necklace', 'bracelet', 'earring', 'pendant', 'bangle', 'set', 'other'],
      default: 'other',
    },
    // Image URL (stored locally)
    images: [
      {
        url: { type: String },
        alt: { type: String, default: '' },
      },
    ],
    // Manual profit/markup added on top of gold value (in IQD)
    profitMargin: {
      type: Number,
      default: 0,
      min: [0, 'Profit margin cannot be negative'],
    },
    // Whether item is available for display on store
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Featured item shown prominently
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // SKU / item code
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    // Cached calculated price (updated when gold price changes)
    calculatedPrice: {
      type: Number,
      default: 0,
    },
    // When the price was last computed
    priceLastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: weight in grams ──────────────────────────────────────────────
itemSchema.virtual('weightInGrams').get(function () {
  return +(this.weight * 5.0).toFixed(3); // 1 mithqal = 5 grams (Erbil standard)
});

// ─── Index for search/filter performance ──────────────────────────────────
itemSchema.index({ karat: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ isAvailable: 1 });
itemSchema.index({ name: 'text', description: 'text' });

// ─── Static: calculate price for given gold price doc ─────────────────────
itemSchema.statics.calculatePrice = function (item, goldPrice) {
  if (!goldPrice) return 0;
  const pricePerMithqal = {
    '18K': goldPrice.price18K,
    '21K': goldPrice.price21K,
    '22K': goldPrice.price22K,
    '24K': goldPrice.price24K,
  }[item.karat] || 0;

  return Math.round(pricePerMithqal * item.weight + (item.profitMargin || 0));
};

// ─── Static: recalculate all items' cached prices ──────────────────────────
itemSchema.statics.recalculateAll = async function (goldPrice) {
  const items = await this.find({});
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: {
        $set: {
          calculatedPrice: this.calculatePrice(item, goldPrice),
          priceLastUpdated: new Date(),
        },
      },
    },
  }));
  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
  return bulkOps.length;
};

module.exports = mongoose.model('Item', itemSchema);
