'use client';
import useSWR from 'swr';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { api, formatNumber } from '@/lib/api';
import type { GoldPrice } from '@/types';
import { FiRefreshCw, FiClock, FiArrowLeft } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';
import Link from 'next/link';
import AnimatedNumber from '@/components/AnimatedNumber';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);
const historyFetcher = (url: string) => api.get(url).then((r) => r.data.data);

const karatDetails = [
  { key: 'price18K' as keyof GoldPrice, karat: '18K', purity: '75%', color: 'border-yellow-300 bg-yellow-50', textColor: 'text-yellow-800', badgeColor: 'bg-yellow-100 text-yellow-800' },
  { key: 'price21K' as keyof GoldPrice, karat: '21K', purity: '87.5%', color: 'border-amber-300 bg-amber-50', textColor: 'text-amber-800', badgeColor: 'bg-amber-100 text-amber-700' },
  { key: 'price22K' as keyof GoldPrice, karat: '22K', purity: '91.7%', color: 'border-orange-300 bg-orange-50', textColor: 'text-orange-800', badgeColor: 'bg-orange-100 text-orange-700' },
  { key: 'price24K' as keyof GoldPrice, karat: '24K', purity: '99.9%', color: 'border-gold-300 bg-gold-50', textColor: 'text-gold-800', badgeColor: 'bg-gold-100 text-gold-800' },
];

export default function GoldPricesPage() {
  const { data: price, isLoading, mutate } = useSWR<GoldPrice>('/gold-price', fetcher, { refreshInterval: 60_000 });
  const { data: history } = useSWR<GoldPrice[]>('/gold-price/history', historyFetcher);

  // Safe usdRate
  const usdRate = price?.usdRate && price.usdRate > 0 ? price.usdRate : 1530;

  return (
    <>

      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-cream-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              داتای بازاڕی ڕاستەوخۆ
            </div>
            <h1 className="font-display text-5xl font-bold text-gray-900 mb-3">
              نرخی بازاڕی زێڕ
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              نرخی ئێستای زێڕ بۆ هەر مسقاڵێک (٥ گرام) — {price?.market || 'بازاڕی زێڕی هەولێر'}
            </p>
            {price && (
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400">
                <FiClock size={14} />
                دوایین نوێکردنەوە: {new Date(price.updatedAt).toLocaleString('ckb')}
                <button onClick={() => mutate()} className="mr-1 text-gold-500 hover:text-gold-700 transition-colors" title="نوێکردنەوە">
                  <FiRefreshCw size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Karat Cards */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-48" />
              ))}
            </div>
          ) : price ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              {karatDetails.map(({ key, karat, purity, color, textColor, badgeColor }) => {
                const iqd = price[key] as number;
                const usdPerMithqal = usdRate > 0 ? Math.round(iqd / usdRate) : 0;
                const iqPerGram = Math.round(iqd / 5.0);
                return (
                  <div key={karat} className={`border-2 rounded-2xl p-6 text-center ${color} hover:shadow-md transition-shadow`}>
                    <span className={`badge text-sm font-bold px-3 py-1 mb-3 ${badgeColor}`}>{karat}</span>
                    <p className={`text-xs font-semibold mb-3 ${textColor} opacity-70 ltr-num`}>{purity} پاکی زێڕ</p>

                    {/* IQD Price — animated */}
                    <p className={`text-2xl font-bold font-display ${textColor} mb-1`}>
                      <AnimatedNumber value={iqd} duration={700} />
                    </p>
                    <p className="text-xs text-gray-500 mb-2">د.ع / مسقاڵ</p>

                    {/* USD Equivalent */}
                    <div className="bg-white/60 rounded-xl px-2 py-2 mb-2">
                      <p className="text-lg font-bold text-green-700">
                        <AnimatedNumber value={usdPerMithqal} prefix="≈ $" duration={700} />
                      </p>
                      <p className="text-xs text-gray-400">دۆلار / مسقاڵ</p>
                    </div>

                    <p className="text-xs text-gray-400">
                      <AnimatedNumber value={iqPerGram} suffix=" د.ع/گرام" prefix="≈ " duration={700} />
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gold-100 mb-8 text-gray-400">
              نرخی زێڕ بەردەست نییە.
            </div>
          )}

          {/* USD Rate */}
          {price && (
            <div className="bg-white border border-gold-100 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💵</span>
                <div>
                  <p className="font-semibold text-gray-800">نرخی دوو دراوی USD / IQD</p>
                  <p className="text-sm text-gray-400">بۆ سەرنجدانی نرخی نێودەوڵەتی</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 font-display">
                  100 $ = <AnimatedNumber value={Math.round(usdRate * 100)} suffix=" IQD" duration={700} />
                </p>
                {price.goldUsdPerGram > 0 && (
                  <p className="text-sm text-gray-400 ltr-num">
                    نرخی نێودەوڵەتی: ${price.goldUsdPerGram.toFixed(2)} / گرام
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Price History */}
          {history && history.length > 1 && (
            <div className="bg-white border border-gold-100 rounded-2xl p-6 mb-8">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GiGoldBar className="text-gold-600" />
                مێژووی نرخی نوێ
              </h2>
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>بەروار</th>
                      <th>18K</th>
                      <th>21K</th>
                      <th>22K</th>
                      <th>24K</th>
                      <th>نرخی USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 10).map((h) => (
                      <tr key={h._id}>
                        <td className="text-gray-500 text-xs">{new Date(h.createdAt).toLocaleDateString('ckb')}</td>
                        <td className="font-medium ltr-num">{formatNumber(h.price18K)}</td>
                        <td className="font-medium ltr-num">{formatNumber(h.price21K)}</td>
                        <td className="font-medium ltr-num">{formatNumber(h.price22K)}</td>
                        <td className="font-medium ltr-num">{formatNumber(h.price24K)}</td>
                        <td className="text-green-600 ltr-num">{formatNumber(h.usdRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-[#0d0a04] rounded-2xl p-8 text-center">
            <GiGoldBar className="text-gold-400 text-4xl mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              بە متمانە بکڕە
            </h2>
            <p className="text-white/60 mb-6">
              هەموو نرخەکانی زێڕەکانمان بە خودکارانە بە پێی ئەم نرخانەی بازاڕ دیاردەکرێن.
            </p>
            <Link href="/products" className="btn-primary">
              کۆلێکشن ببینە
              <FiArrowLeft />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
