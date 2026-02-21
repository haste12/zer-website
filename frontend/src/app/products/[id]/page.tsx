'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { api, formatIQD, formatNumber, getImageUrl, KARAT_COLORS, CATEGORY_LABELS, PLACEHOLDER_IMG } from '@/lib/api';
import type { Item, GoldPrice } from '@/types';
import { FiArrowRight, FiInfo } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';
import clsx from 'clsx';
import AnimatedNumber from '@/components/AnimatedNumber';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: item, isLoading } = useSWR<Item>(
    id ? `/items/${id}` : null,
    fetcher,
    { refreshInterval: 30_000 }
  );

  const { data: goldPrice } = useSWR<GoldPrice>('/gold-price', fetcher, { refreshInterval: 60_000 });
  const usdRate = goldPrice?.usdRate && goldPrice.usdRate > 0 ? goldPrice.usdRate : 1310;

  if (isLoading) {
    return (
      <>

        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="skeleton aspect-square rounded-2xl" />
              <div className="space-y-4">
                <div className="skeleton h-5 w-24 rounded" />
                <div className="skeleton h-8 w-3/4 rounded" />
                <div className="skeleton h-10 w-48 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-gray-800 mb-4">بەرهەمەکە نەدۆزرایەوە</h1>
            <Link href="/products" className="btn-primary">گەڕانەوە بۆ کۆلێکشن</Link>
          </div>
        </main>
      </>
    );
  }

  const price = item.livePrice ?? item.calculatedPrice ?? 0;
  const priceUsd = price > 0 && usdRate > 0 ? Math.round(price / usdRate) : 0;
  const pricePerKarat = item.goldPrice ? (item.goldPrice[`price${item.karat}`] as number || 0) : 0;

  return (
    <>

      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-cream-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gold-600 transition-colors">سەرەکی</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gold-600 transition-colors">کۆلێکشن</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{item.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cream-100 to-gold-50 mb-3 border border-gold-100">
                <Image
                  src={getImageUrl(item.images?.[selectedImage]?.url)}
                  alt={item.images?.[selectedImage]?.alt || item.name}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                  }}
                />
              </div>
              {/* Thumbnails */}
              {item.images.length > 1 && (
                <div className="flex gap-2">
                  {item.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={clsx(
                        'relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                        i === selectedImage ? 'border-gold-500 scale-105' : 'border-transparent'
                      )}
                    >
                      <Image
                        src={getImageUrl(img.url)}
                        alt={img.alt}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {/* Category & Karat */}
              <div className="flex items-center gap-3 mb-3">
                <span className={clsx('badge', KARAT_COLORS[item.karat])}>{item.karat}</span>
                <span className="badge badge-gray">{CATEGORY_LABELS[item.category]}</span>
                {!item.isAvailable && (
                  <span className="badge badge-red">تەواو بووە</span>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {item.name}
              </h1>
              {item.nameAr && (
                <p className="text-xl text-gray-400 font-arabic mb-4 text-right" dir="rtl">
                  {item.nameAr}
                </p>
              )}

              {/* Price */}
              <div className="bg-[#0d0a04] rounded-2xl p-5 mb-6">
                <p className="text-gold-500 text-xs font-semibold uppercase tracking-widest mb-1">
                  نرخی ئێستا
                </p>
                {/* IQD Price — animated */}
                <p className="font-display text-3xl font-bold text-gold-300">
                  {price > 0
                    ? <AnimatedNumber value={price} asIQD duration={800} />
                    : 'نرخ بە داواکاری'}
                </p>
                {/* USD Equivalent */}
                {price > 0 && priceUsd > 0 && (
                  <p className="text-green-400 text-lg font-semibold mt-1">
                    <AnimatedNumber value={priceUsd} prefix="≈ $" suffix=" دۆلار" duration={800} />
                  </p>
                )}
                {pricePerKarat > 0 && (
                  <p className="text-white/40 text-xs mt-2">
                    <AnimatedNumber value={pricePerKarat} suffix=" د.ع/مسقاڵ" duration={600} />
                    {' × '}{item.weight} مسقاڵ
                    {item.profitMargin > 0 && (
                      <> + <AnimatedNumber value={item.profitMargin} suffix=" د.ع کارسازی" duration={600} /></>
                    )}
                  </p>
                )}
                <p className="text-white/30 text-xs mt-2 flex items-center gap-1">
                  <FiInfo size={11} />
                  نرخ بە خودکارانە بە پێی نرخی بازاڕ نوێدەکرێتەوە
                </p>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-2xl border border-gold-100 p-5 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <GiGoldBar className="text-gold-600" />
                  تایبەتمەندیەکان
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'کاراتی', value: item.karat },
                    { label: 'کێشە', value: `${item.weight} مەثقاڵ (${item.weightInGrams || (item.weight * 5).toFixed(2)}گ)` },
                    { label: 'جۆر', value: CATEGORY_LABELS[item.category] },
                    { label: 'کۆدی کاڵا', value: item.sku || 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                      <p className="font-medium text-gray-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">وەسف</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                </div>
              )}

              {/* Gold price info */}
              {item.goldPrice && (
                <div className="bg-gold-50 border border-gold-100 rounded-xl p-4 text-sm">
                  <p className="text-gold-700 font-medium mb-1">
                    بازاڕ: {item.goldPrice.market as string}
                  </p>
                  <p className="text-gold-600 text-xs ltr-num">
                    نرخی {item.karat}: {formatNumber(pricePerKarat)} د.ع/مەثقاڵ ·
                    دوایین نوێکردنەوە: {new Date(item.goldPrice.updatedAt as string).toLocaleString('ckb')}
                  </p>
                </div>
              )}

              {/* Back button */}
              <Link href="/products" className="mt-6 btn-ghost self-start">
                <FiArrowRight />
                گەڕانەوە بۆ کۆلێکشن
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
