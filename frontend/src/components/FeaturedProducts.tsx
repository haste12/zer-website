'use client';
import useSWR from 'swr';
import { api } from '@/lib/api';
import ProductCard from './ProductCard';
import type { Item, GoldPrice, PaginatedResponse } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);
const goldFetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function FeaturedProducts() {
  const { data, isLoading } = useSWR<PaginatedResponse<Item>>(
    '/items?featured=true&limit=8',
    fetcher,
    { refreshInterval: 30_000 }
  );
  // Fetch gold price to pass usdRate to cards
  const { data: goldPrice } = useSWR<GoldPrice>('/gold-price', goldFetcher, { refreshInterval: 60_000 });
  const usdRate = goldPrice?.usdRate && goldPrice.usdRate > 0 ? goldPrice.usdRate : 1530;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gold-100">
            <div className="skeleton aspect-square" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-5 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = data?.data || [];

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>هێشتا هیچ بەرهەمی تایبەتی نەما.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {items.map((item) => (
        <ProductCard key={item._id} item={item} usdRate={usdRate} />
      ))}
    </div>
  );
}
