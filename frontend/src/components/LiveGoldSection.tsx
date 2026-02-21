'use client';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { GoldPrice } from '@/types';
import { GiGoldBar } from 'react-icons/gi';
import { FiRefreshCw } from 'react-icons/fi';
import AnimatedNumber from '@/components/AnimatedNumber';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

const karatRows = [
  { key: 'price18K' as keyof GoldPrice, karat: '18K', purity: '75%', desc: 'زێڕی گوڵاوی و سپی' },
  { key: 'price21K' as keyof GoldPrice, karat: '21K', purity: '87.5%', desc: 'زێڕی کلاسیکی خۆرهەڵاتی ناوین' },
  { key: 'price22K' as keyof GoldPrice, karat: '22K', purity: '91.7%', desc: 'زێڕی بەرز بۆ وەبەرهێنان' },
  { key: 'price24K' as keyof GoldPrice, karat: '24K', purity: '99.9%', desc: 'زێڕی پاک و شمشاڵ' },
];

export default function LiveGoldSection() {
  const { data: price, isLoading, mutate } = useSWR<GoldPrice>('/gold-price', fetcher, {
    refreshInterval: 3_000,
    dedupingInterval: 2_000,
    revalidateOnFocus: true,
  });

  const usdRate = price?.usdRate && price.usdRate > 0 ? price.usdRate : 1530;

  return (
    <section className="py-16 bg-[#0d0a04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            بازاڕی ڕاستەوخۆ
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            نرخی ئێستای زێڕ
          </h2>
          <p className="text-white/50 max-w-lg mx-auto">
            نرخ بۆ هەر مسقاڵێک (5 گرام) — {price?.market || 'بازاڕی زێڕی هەولێر'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 skeleton h-44" />
            ))}
          </div>
        ) : price ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {karatRows.map(({ key, karat, purity, desc }) => {
                const iqd = price[key] as number;
                const usdPerMithqal = usdRate > 0 ? Math.round(iqd / usdRate) : 0;
                return (
                  <div
                    key={karat}
                    className="bg-white/5 hover:bg-white/10 border border-gold-800/30 rounded-2xl p-5 text-center transition-all group"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <GiGoldBar className="text-gold-500 text-lg" />
                      <span className="text-gold-400 text-xs font-semibold uppercase tracking-wider">
                        {purity} پاک
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-white font-display mb-2">{karat}</div>

                    {/* IQD Price — animated */}
                    <div className="text-xl font-semibold text-gold-300 mb-0.5">
                      <AnimatedNumber value={iqd} duration={800} />
                    </div>
                    <div className="text-xs text-white/40 mb-2">د.ع / مسقاڵ</div>

                    {/* USD price per mithqal */}
                    <div className="bg-white/10 rounded-xl px-3 py-1.5 mt-1">
                      <div className="text-xs text-white/50 mb-0.5">بە دۆلار</div>
                      <div className="text-sm font-semibold text-green-400">
                        <AnimatedNumber value={usdPerMithqal} prefix="≈ $" duration={800} />
                      </div>
                      <div className="text-xs text-white/30">$ / مسقاڵ</div>
                    </div>

                    <div className="text-xs text-white/30 hidden group-hover:block transition-all mt-2">{desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Exchange rate row */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white/5 border border-gold-800/20 rounded-2xl px-6 py-4 gap-3">
              <div className="flex items-center gap-4">
                <span className="text-green-400 font-bold text-lg">نرخی دۆلار</span>
                <span className="text-white/60 text-sm">نرخی بازاڕ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xl">
                  100 $ = <AnimatedNumber value={Math.round(usdRate * 100)} suffix=" IQD" duration={800} />
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <FiRefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                نوێکردنەوە: هەر 3 چرکە
                <button
                  onClick={() => mutate()}
                  className="mr-2 text-gold-500 hover:text-gold-300 transition-colors"
                  title="نوێکردنەوەی نرخەکان ئێستا"
                >
                  <FiRefreshCw size={14} className="hover:rotate-180 transition-transform duration-700" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-white/30">
            <p>نرخی زێڕ بەردەست نییە. تکایە دواتر هەوڵ بدەرەوە.</p>
          </div>
        )}
      </div>
    </section>
  );
}
