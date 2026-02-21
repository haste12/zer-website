const express = require('express');
const Item = require('../models/Item');
const GoldPrice = require('../models/GoldPrice');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/admin/dashboard ── Admin: get dashboard stats ──────────────
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const [totalItems, availableItems, featuredItems, goldPrice, itemsByKarat, itemsByCategory] =
      await Promise.all([
        Item.countDocuments(),
        Item.countDocuments({ isAvailable: true }),
        Item.countDocuments({ isFeatured: true }),
        GoldPrice.getCurrent(),
        Item.aggregate([
          { $group: { _id: '$karat', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Item.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalItems,
          availableItems,
          featuredItems,
          unavailableItems: totalItems - availableItems,
        },
        goldPrice,
        itemsByKarat,
        itemsByCategory,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/items ── Admin: all items (including unavailable) ─────
router.get('/items', protect, async (req, res, next) => {
  try {
    const {
      karat,
      category,
      search,
      page = 1,
      limit = 50,
      sort = '-createdAt',
    } = req.query;

    const filter = {};
    if (karat) filter.karat = karat;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));

    const [items, total, goldPrice] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(filter),
      GoldPrice.getCurrent(),
    ]);

    const enriched = items.map((item) => ({
      ...item,
      livePrice: Item.calculatePrice(item, goldPrice),
      weightInGrams: +(item.weight * 4.608).toFixed(3),
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/recalculate ── Admin: force recalculate all prices ───
router.post('/recalculate', protect, async (req, res, next) => {
  try {
    const goldPrice = await GoldPrice.getCurrent();
    if (!goldPrice) {
      return res.status(400).json({ success: false, message: 'No gold price set. Please set gold prices first.' });
    }
    const count = await Item.recalculateAll(goldPrice);
    res.json({ success: true, message: `Recalculated prices for ${count} items.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
