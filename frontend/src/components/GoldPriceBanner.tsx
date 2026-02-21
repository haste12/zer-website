'use client';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { api, formatNumber } from '@/lib/api';
import type { GoldPrice } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

// Flash animation when a number changes
function AnimatedNumber({ value }: { value: number }) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef<number>(value);

  useEffect(() => {
    if (prevRef.current !== value && prevRef.current !== 0) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
    prevRef.current = value;
  }, [value]);

  return (
    <span
      className="ltr-num transition-colors duration-300"
      style={{ color: flash ? '#fbbf24' : undefined }}
    >
      {formatNumber(value)}
    </span>
  );
}

export default function GoldPriceBanner() {
  const { data: price, isLoading } = useSWR<GoldPrice>('/gold-price', fetcher, {
    refreshInterval: 3_000,   // poll every 3 seconds
    revalidateOnFocus: true,
    dedupingInterval: 2_000,
  });

  if (isLoading) {
    return (
      <div className="bg-[#1a1105] border-b border-gold-800/30 py-2">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-4 w-28 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!price) return null;

  const karats: Array<{ key: keyof GoldPrice; label: string }> = [
    { key: 'price18K', label: '18K' },
    { key: 'price21K', label: '21K' },
    { key: 'price22K', label: '22K' },
    { key: 'price24K', label: '24K' },
  ];

  // Safe usdRate — fallback to 1530 if zero/null so we never divide by 0
  const usdRate = price.usdRate && price.usdRate > 0 ? price.usdRate : 1530;

  return (
    <div className="bg-[#1a1105] border-b border-gold-800/40 py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs md:text-sm overflow-x-auto scrollbar-none">
          {/* Live dot + market label */}
          <span className="flex items-center gap-1.5 text-gold-600 font-semibold whitespace-nowrap shrink-0 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            📍 {price.market}
          </span>
          <span className="text-white/30 shrink-0">|</span>

          {/* Karat prices */}
          {karats.map(({ key, label }) => {
            const iqd = price[key] as number;
            return (
              <div key={label} className="flex items-center gap-1.5 whitespace-nowrap shrink-0 px-2">
                <span className="text-gold-500 font-semibold">{label}</span>
                <AnimatedNumber value={iqd} />
                <span className="text-white/40 text-xs">د.ع</span>
                <span className="text-white/20 mx-1">|</span>
              </div>
            );
          })}

          {/* USD Rate — shown as 100 USD = X IQD */}
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0 px-2">
            <span className="text-green-400 font-semibold">100 $</span>
            <span className="text-white/40 text-xs">=</span>
            <AnimatedNumber value={Math.round(usdRate * 100)} />
            <span className="text-white/40 text-xs">د.ع</span>
          </div>

          <span className="mr-auto text-white/30 text-xs whitespace-nowrap shrink-0 hidden sm:block">
            نوێکراوەتەوە: {new Date(price.updatedAt).toLocaleTimeString('ckb')}
          </span>
        </div>
      </div>
    </div>
  );
}
