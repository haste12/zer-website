/**
 * Live Gold Price Auto-Updater — Erbil/Kurdistan Market
 *
 * PRIMARY source: rudawindex.net/api/prices
 *   - Returns real Kurdistan market prices directly (no conversion needed)
 *   - Endpoint requires header: referer: https://rudawindex.net/
 *   - Returns: kurdistanPrices.mithqal18K, mithqal21K, mithqal22K (IQD/mithqal)
 *   - Returns: currencies USD buy/sale per 100 USD
 *
 * FALLBACK source: goldprice.org/dbXRates/IQD
 *   - International spot price (IQD/troy oz)
 *   - Applies GOLD_ERBIL_FACTOR for local market calibration
 */

const axios = require('axios');
const GoldPrice = require('../models/GoldPrice');
const Item = require('../models/Item');

// ── Constants (used only for fallback calculation) ─────────────────────────
const TROY_OZ_IN_GRAMS = 31.1035;
const MITHQAL_IN_GRAMS = 5.0;    // Erbil/Iraq standard: 1 mithqal = 5 grams
const ERBIL_FACTOR = parseFloat(process.env.GOLD_ERBIL_FACTOR || '1.182');
const FALLBACK_USD_RATE = parseFloat(process.env.FALLBACK_USD_RATE || '1530');

const http = axios.create({ timeout: 12000 });

// ────────────────────────────────────────────────────────────────────────────
// PRIMARY: Fetch directly from rudawindex.net
// Returns { price18K, price21K, price22K, price24K, usdRate } or null
// ────────────────────────────────────────────────────────────────────────────
async function fetchFromRudawIndex() {
    try {
        const res = await http.get('https://rudawindex.net/api/prices', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://rudawindex.net/',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ku,ar;q=0.9,en;q=0.8',
            },
        });

        const data = res.data;
        const kp = data?.kurdistanPrices;
        const currencies = Array.isArray(data?.currencies) ? data.currencies : [];

        if (!kp || !kp.mithqal21K) {
            console.warn('⚠️  rudawindex: kurdistanPrices missing or empty');
            return null;
        }

        const price18K = Math.round(kp.mithqal18K);
        const price21K = Math.round(kp.mithqal21K);
        const price22K = Math.round(kp.mithqal22K);

        // Derive 24K from 21K ratio (standard karat math)
        const price24K = Math.round(price21K * 24 / 21);

        // USD rate — rudawindex gives rate per 100 USD, convert to per 1 USD
        let usdRate = FALLBACK_USD_RATE;
        const usdEntry = currencies.find(c => c.id === 'us' || c.code === 'us' || c.name === 'دۆلار');
        if (usdEntry && usdEntry.buy > 0) {
            // buy price is per 100 USD → divide by 100 to get per 1 USD
            usdRate = Math.round(usdEntry.buy / 100);
        }

        console.log('✅ rudawindex.net prices:');
        console.log(`   18K: ${price18K.toLocaleString()} | 21K: ${price21K.toLocaleString()} | 22K: ${price22K.toLocaleString()} | 24K: ${price24K.toLocaleString()} IQD/mithqal`);
        console.log(`   USD rate: ${usdRate} IQD = 1 USD (buy per 100: ${usdEntry?.buy?.toLocaleString() ?? 'N/A'})`);

        return { price18K, price21K, price22K, price24K, usdRate };

    } catch (e) {
        console.warn('⚠️  rudawindex.net fetch failed:', e.message);
        return null;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// FALLBACK A: goldprice.org → IQD/troy oz + Erbil factor
// ────────────────────────────────────────────────────────────────────────────
async function fetchGoldIQDPerOz() {
    // Primary fallback: goldprice.org in IQD
    try {
        const res = await http.get(
            'https://data-asg.goldprice.org/dbXRates/IQD',
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        const xauPrice = res.data?.items?.[0]?.xauPrice;
        if (xauPrice && xauPrice > 0) {
            console.log(`🥇 Gold spot (goldprice.org/IQD): ${Math.round(xauPrice).toLocaleString()} IQD/troy oz`);
            return xauPrice;
        }
    } catch (e) {
        console.warn('goldprice.org/IQD fallback failed:', e.message);
    }

    // Secondary fallback: Yahoo Finance
    try {
        const res = await http.get(
            'https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1m&range=1d',
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        const usdPerOz = res.data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (usdPerOz > 0) {
            const iqdPerOz = usdPerOz * FALLBACK_USD_RATE;
            console.log(`🥇 Gold (Yahoo Finance): $${usdPerOz} → ${Math.round(iqdPerOz).toLocaleString()} IQD/oz`);
            return iqdPerOz;
        }
    } catch (e) {
        console.warn('Yahoo Finance fallback failed:', e.message);
    }

    return null;
}

// ────────────────────────────────────────────────────────────────────────────
// FALLBACK B: compute prices from goldprice.org data + Erbil factor
// ────────────────────────────────────────────────────────────────────────────
async function fetchFromFallback() {
    const xauIQDPerOz = await fetchGoldIQDPerOz();
    if (!xauIQDPerOz) return null;

    const iqdPerGram = xauIQDPerOz / TROY_OZ_IN_GRAMS;
    const iqdPerMithqal = iqdPerGram * MITHQAL_IN_GRAMS;
    const price24K = Math.round(iqdPerMithqal * ERBIL_FACTOR);
    const price22K = Math.round(price24K * 22 / 24);
    const price21K = Math.round(price24K * 21 / 24);
    const price18K = Math.round(price24K * 18 / 24);
    const usdRate = parseFloat(process.env.MARKET_USD_RATE || String(FALLBACK_USD_RATE));

    console.log(`   🏪 Fallback Erbil prices (factor ×${ERBIL_FACTOR}):`);
    console.log(`   18K: ${price18K.toLocaleString()} | 21K: ${price21K.toLocaleString()} | 22K: ${price22K.toLocaleString()} | 24K: ${price24K.toLocaleString()} IQD/mithqal`);

    return { price18K, price21K, price22K, price24K, usdRate };
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN: Try rudawindex first, fallback to goldprice.org
// ────────────────────────────────────────────────────────────────────────────
async function updateGoldPricesFromAPI() {
    console.log('\n🔄 Fetching live Kurdistan gold prices from rudawindex.net...');

    try {
        // Try primary source first
        let prices = await fetchFromRudawIndex();

        // Fall back if primary fails
        if (!prices) {
            console.log('⚡ Primary source failed — switching to goldprice.org fallback...');
            prices = await fetchFromFallback();
        }

        if (!prices) {
            console.warn('⚠️  All price sources failed — keeping existing prices.\n');
            return null;
        }

        const { price18K, price21K, price22K, price24K, usdRate } = prices;

        // Archive old record, save new active record
        await GoldPrice.updateMany({ isActive: true }, { $set: { isActive: false } });

        const newPrice = await GoldPrice.create({
            price18K,
            price21K,
            price22K,
            price24K,
            usdRate,
            goldUsdPerGram: +(price24K / (usdRate * MITHQAL_IN_GRAMS)).toFixed(2),
            market: 'Kurdistan Gold Market',
            isActive: true,
            updatedBy: null,
        });

        const itemCount = await Item.recalculateAll(newPrice);
        console.log(`✅ Saved — ${itemCount} item prices recalculated.\n`);

        return newPrice;

    } catch (err) {
        console.error('❌ Auto-update error:', err.message, '\n');
        return null;
    }
}

// ── Legacy exports (kept for goldPrice.js route compatibility) ─────────────
async function fetchGoldSpotUSD() {
    try {
        const res = await http.get(
            'https://data-asg.goldprice.org/dbXRates/USD',
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        return res.data?.items?.[0]?.xauPrice || null;
    } catch { return null; }
}

async function fetchUsdIqdRate() {
    return parseFloat(process.env.MARKET_USD_RATE || process.env.FALLBACK_USD_RATE || '1530');
}

module.exports = {
    updateGoldPricesFromAPI,
    fetchGoldIQDPerOz,
    fetchGoldSpotUSD,
    fetchUsdIqdRate,
};
