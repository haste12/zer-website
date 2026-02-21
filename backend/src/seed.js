/**
 * Seed script: creates default admin user + sample gold prices + sample items
 * Run with: node src/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const GoldPrice = require('./models/GoldPrice');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zer-jewelry';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── Admin user ──────────────────────────────────────────────────────────
  const existingAdmin = await User.findOne({ username: 'admin' });
  if (!existingAdmin) {
    await User.create({
      username: 'admin',
      password: 'admin123456',
      displayName: 'Zer Admin',
      role: 'superadmin',
    });
    console.log('✅ Admin user created  →  username: admin  |  password: admin123456');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // ── Gold prices (Erbil market example) ──────────────────────────────────
  const existingPrice = await GoldPrice.getCurrent();
  let goldPrice;
  if (!existingPrice) {
    goldPrice = await GoldPrice.create({
      price18K: 912_000,   // IQD per mithqal
      price21K: 1_064_000,
      price22K: 1_115_000,
      price24K: 1_216_000,
      usdRate: 1310,
      market: 'Erbil Gold Market',
      goldUsdPerGram: 63.5,
      isActive: true,
    });
    console.log('✅ Gold prices created');
  } else {
    goldPrice = existingPrice;
    console.log('ℹ️  Gold prices already exist');
  }

  // ── Sample jewelry items ─────────────────────────────────────────────────
  const existingItems = await Item.countDocuments();
  if (existingItems === 0) {
    const sampleItems = [
      { name: 'Classic Gold Ring', nameAr: 'خاتم ذهب كلاسيك', weight: 2.5, karat: '21K', category: 'ring', description: 'An elegant classic gold ring crafted with precision.', isFeatured: true },
      { name: 'Twisted Gold Bangle', nameAr: 'أسورة ذهب ملتوية', weight: 5.0, karat: '21K', category: 'bangle', description: 'A beautiful twisted bangle made of fine 21K gold.', isFeatured: true },
      { name: 'Gold Chain Necklace', nameAr: 'قلادة سلسلة ذهب', weight: 4.2, karat: '18K', category: 'necklace', description: 'Delicate 18K gold chain necklace, perfect for all occasions.', isFeatured: true },
      { name: 'Diamond-Cut Earrings', nameAr: 'أقراط قطع ألماس', weight: 1.8, karat: '18K', category: 'earring', description: 'Diamond-cut 18K gold earrings with a sparkling finish.' },
      { name: 'Heavy Gold Bracelet', nameAr: 'سوار ذهب ثقيل', weight: 8.5, karat: '22K', category: 'bracelet', description: 'A heavy-duty 22K gold bracelet for a bold statement.' },
      { name: 'Gold Pendant', nameAr: 'قلادة ذهب', weight: 1.2, karat: '24K', category: 'pendant', description: 'Pure 24K gold pendant for maximum purity enthusiasts.' },
      { name: 'Wedding Ring Set', nameAr: 'طقم خواتم الزفاف', weight: 6.0, karat: '21K', category: 'set', description: 'Beautiful matching wedding ring set for couples.', isFeatured: true },
      { name: 'Rope Chain Bracelet', nameAr: 'سوار سلسلة حبل', weight: 3.3, karat: '18K', category: 'bracelet', description: 'Classic rope-chain style bracelet in 18K gold.' },
    ];

    for (const data of sampleItems) {
      const calculated = Item.calculatePrice(data, goldPrice);
      await Item.create({ ...data, calculatedPrice: calculated, priceLastUpdated: new Date(), isAvailable: true });
    }
    console.log(`✅ ${sampleItems.length} sample items created`);
  } else {
    console.log('ℹ️  Items already exist, skipping sample data');
  }

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Admin Login:  username=admin  |  password=admin123456');
  console.log('─────────────────────────────────');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
