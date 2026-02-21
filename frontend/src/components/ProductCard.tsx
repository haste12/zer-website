'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';
import type { Item } from '@/types';
import { formatIQD, formatNumber, getImageUrl, KARAT_COLORS, CATEGORY_LABELS, PLACEHOLDER_IMG } from '@/lib/api';
import AnimatedNumber from '@/components/AnimatedNumber';
import clsx from 'clsx';

interface Props {
  item: Item;
  usdRate?: number;
}

export default function ProductCard({ item, usdRate }: Props) {
  const price = item.livePrice ?? item.calculatedPrice ?? 0;
  const imageUrl = getImageUrl(item.images?.[0]?.url);
  const rate = usdRate && usdRate > 0 ? usdRate : 1530;
  const priceUsd = price > 0 ? Math.round(price / rate) : 0;

  return (
    <Link href={`/products/${item._id}`}>
      <article className="card-hover bg-white rounded-2xl overflow-hidden border border-gold-100 group cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-cream-100 to-gold-50 overflow-hidden">
          <Image
            src={imageUrl}
            alt={item.images?.[0]?.alt || item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
            }}
          />
          {item.isFeatured && (
            <div className="absolute top-2 right-2">
              <span className="badge bg-gold-500 text-white shadow-sm">
                <FiStar size={10} className="ml-1" />
                هەڵبژێردراو
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className={clsx('badge', KARAT_COLORS[item.karat])}>
              {item.karat}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-gold-600 font-medium mb-1 uppercase tracking-wide">
            {CATEGORY_LABELS[item.category] || item.category}
          </p>
          <h3 className="font-display font-semibold text-gray-900 text-base leading-tight mb-2 line-clamp-2 group-hover:text-gold-700 transition-colors">
            {item.name}
          </h3>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                {item.weight} مسقاڵ · {item.karat}
              </p>
              <p className="text-lg font-bold text-gray-900 font-display">
                {price > 0
                  ? <AnimatedNumber value={price} asIQD duration={700} />
                  : 'نرخ بە داواکاری'}
              </p>
              {price > 0 && priceUsd > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  <AnimatedNumber value={priceUsd} prefix="≈ $" duration={700} />
                </p>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
