const express = require('express');
const { body, validationResult } = require('express-validator');
const GoldPrice = require('../models/GoldPrice');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/gold-price ── Public: get current gold prices ───────────────
router.get('/', async (req, res, next) => {
  try {
    const price = await GoldPrice.getCurrent();
    if (!price) {
      return res.status(404).json({ success: false, message: 'Gold prices not set yet.' });
    }
    res.json({ success: true, data: price });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/gold-price/history ── Public: price history (last 30) ───────
router.get('/history', async (req, res, next) => {
  try {
    const history = await GoldPrice.find().sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/gold-price ── Admin: update gold prices ────────────────────
router.post(
  '/',
  protect,
  [
    body('price18K').isNumeric().withMessage('18K price must be a number').toFloat(),
    body('price21K').isNumeric().withMessage('21K price must be a number').toFloat(),
    body('price22K').isNumeric().withMessage('22K price must be a number').toFloat(),
    body('price24K').isNumeric().withMessage('24K price must be a number').toFloat(),
    body('usdRate').optional().isNumeric().withMessage('USD rate must be a number').toFloat(),
    body('market').optional().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { price18K, price21K, price22K, price24K, usdRate, market, goldUsdPerGram } = req.body;

      // Archive old entry by deactivating it
      await GoldPrice.updateMany({ isActive: true }, { $set: { isActive: false } });

      // Create new active price record
      const newPrice = await GoldPrice.create({
        price18K,
        price21K,
        price22K,
        price24K,
        usdRate: usdRate || 1310,
        market: market || 'Erbil Gold Market',
        goldUsdPerGram: goldUsdPerGram || 0,
        updatedBy: req.user._id,
        isActive: true,
      });

      // ── Recalculate all item prices ────────────────────────────────────
      const count = await Item.recalculateAll(newPrice);

      res.json({
        success: true,
        message: `Gold prices updated. ${count} item prices recalculated.`,
        data: newPrice,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/gold-price/refresh ── Admin: trigger immediate live fetch ───
router.post('/refresh', protect, async (req, res, next) => {
  try {
    const { updateGoldPricesFromAPI } = require('../services/goldPriceAutoUpdate');
    const newPrice = await updateGoldPricesFromAPI();
    if (newPrice) {
      res.json({
        success: true,
        message: `نرخی زێڕ بە سەرکەوتوویی نوێکرایەوە لە بازاڕی زێڕ.`,
        data: newPrice,
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'نرخی زێڕ نەتوانرا بهێنرێت. تکایە دواتر هەوڵ بدەرەوە.',
      });
    }
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/gold-price/live-preview ── Public: preview what API returns ──
router.get('/live-preview', async (req, res, next) => {
  try {
    const { fetchGoldSpotUSD, fetchUsdIqdRate } = require('../services/goldPriceAutoUpdate');
    const ERBIL_FACTOR = parseFloat(process.env.GOLD_ERBIL_FACTOR || '2.20');
    const MITHQAL_IN_GRAMS = 4.608;
    const TROY_OZ_IN_GRAMS = 31.1035;

    const [spotUsdPerOz, usdRate] = await Promise.all([fetchGoldSpotUSD(), fetchUsdIqdRate()]);
    if (!spotUsdPerOz) {
      return res.status(503).json({ success: false, message: 'Could not fetch live gold price.' });
    }
    const spotUsdPerGram = spotUsdPerOz / TROY_OZ_IN_GRAMS;
    const spotUsdPerMithqal = spotUsdPerGram * MITHQAL_IN_GRAMS;
    const base24K = spotUsdPerMithqal * usdRate * ERBIL_FACTOR;

    res.json({
      success: true,
      data: {
        spotUsdPerOz: +spotUsdPerOz.toFixed(2),
        spotUsdPerGram: +spotUsdPerGram.toFixed(2),
        usdRate,
        erbilFactor: ERBIL_FACTOR,
        price18K: Math.round(base24K * 18 / 24),
        price21K: Math.round(base24K * 21 / 24),
        price22K: Math.round(base24K * 22 / 24),
        price24K: Math.round(base24K),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

