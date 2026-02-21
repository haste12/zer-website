const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Item = require('../models/Item');
const GoldPrice = require('../models/GoldPrice');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Multer setup for image uploads ───────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `item-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// ─── GET /api/items ── Public: list items with filtering ──────────────────
router.get('/', async (req, res, next) => {
  try {
    const {
      karat,
      category,
      search,
      featured,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const filter = { isAvailable: true };

    if (karat && ['18K', '21K', '22K', '24K'].includes(karat)) filter.karat = karat;
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const [items, total, goldPrice] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(filter),
      GoldPrice.getCurrent(),
    ]);

    // Attach live calculated price
    const enriched = items.map((item) => ({
      ...item,
      livePrice: Item.calculatePrice(item, goldPrice),
      weightInGrams: +(item.weight * 4.608).toFixed(3),
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/items/:id ── Public: single item ────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const [item, goldPrice] = await Promise.all([
      Item.findById(req.params.id).lean(),
      GoldPrice.getCurrent(),
    ]);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const enriched = {
      ...item,
      livePrice: Item.calculatePrice(item, goldPrice),
      weightInGrams: +(item.weight * 4.608).toFixed(3),
      goldPrice: goldPrice
        ? {
            [`price${item.karat}`]: goldPrice[`price${item.karat}`],
            usdRate: goldPrice.usdRate,
            market: goldPrice.market,
            updatedAt: goldPrice.updatedAt,
          }
        : null,
    };

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/items ── Admin: create item ────────────────────────────────
router.post(
  '/',
  protect,
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Item name is required'),
    body('weight').isFloat({ min: 0.01 }).withMessage('Weight must be a positive number'),
    body('karat').isIn(['18K', '21K', '22K', '24K']).withMessage('Invalid karat value'),
    body('category').optional(),
    body('profitMargin').optional().isFloat({ min: 0 }),
    body('description').optional().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const images = (req.files || []).map((file) => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.name || '',
      }));

      const itemData = {
        name: req.body.name,
        nameAr: req.body.nameAr || '',
        description: req.body.description || '',
        weight: parseFloat(req.body.weight),
        karat: req.body.karat,
        category: req.body.category || 'other',
        profitMargin: parseFloat(req.body.profitMargin) || 0,
        isAvailable: req.body.isAvailable !== 'false',
        isFeatured: req.body.isFeatured === 'true',
        sku: req.body.sku || '',
        images,
      };

      const goldPrice = await GoldPrice.getCurrent();
      itemData.calculatedPrice = Item.calculatePrice(itemData, goldPrice);
      itemData.priceLastUpdated = new Date();

      const item = await Item.create(itemData);
      res.status(201).json({ success: true, message: 'Item created successfully.', data: item });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/items/:id ── Admin: update item ─────────────────────────────
router.put(
  '/:id',
  protect,
  upload.array('images', 5),
  [
    body('name').optional().trim().notEmpty(),
    body('weight').optional().isFloat({ min: 0.01 }),
    body('karat').optional().isIn(['18K', '21K', '22K', '24K']),
    body('profitMargin').optional().isFloat({ min: 0 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found.' });
      }

      // Fields that can be updated
      const updatable = ['name', 'nameAr', 'description', 'weight', 'karat', 'category', 'profitMargin', 'isAvailable', 'isFeatured', 'sku'];
      updatable.forEach((field) => {
        if (req.body[field] !== undefined) {
          item[field] = req.body[field];
        }
      });

      // Handle numeric conversions
      if (req.body.weight) item.weight = parseFloat(req.body.weight);
      if (req.body.profitMargin !== undefined) item.profitMargin = parseFloat(req.body.profitMargin);
      if (req.body.isAvailable !== undefined) item.isAvailable = req.body.isAvailable !== 'false';
      if (req.body.isFeatured !== undefined) item.isFeatured = req.body.isFeatured === 'true';

      // Handle new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => ({
          url: `/uploads/${file.filename}`,
          alt: item.name,
        }));
        item.images = [...item.images, ...newImages];
      }

      // Recalculate price
      const goldPrice = await GoldPrice.getCurrent();
      item.calculatedPrice = Item.calculatePrice(item, goldPrice);
      item.priceLastUpdated = new Date();

      await item.save();
      res.json({ success: true, message: 'Item updated successfully.', data: item });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/items/:id ── Admin: delete item ──────────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    await item.deleteOne();
    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/items/:id/image/:imageIndex ── Admin: remove image ───────
router.delete('/:id/image/:imageIndex', protect, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const idx = parseInt(req.params.imageIndex);
    if (idx < 0 || idx >= item.images.length) {
      return res.status(400).json({ success: false, message: 'Invalid image index.' });
    }

    const removed = item.images.splice(idx, 1)[0];
    // Optionally delete file from disk
    const filePath = path.join(__dirname, '../../', removed.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await item.save();
    res.json({ success: true, message: 'Image removed.', data: item });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
