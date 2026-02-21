'use client';
import { useState, useCallback, useEffect, Suspense } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { api } from '@/lib/api';
import type { Item, PaginatedResponse } from '@/types';
import { FiPackage } from 'react-icons/fi';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

function ProductsContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [karat, setKarat] = useState(searchParams.get('karat') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, karat, category]);

  const buildUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set('search', debouncedSearch);
    if (karat) p.set('karat', karat);
    if (category) p.set('category', category);
    p.set('page', String(page));
    p.set('limit', '20');
    return `/items?${p.toString()}`;
  }, [debouncedSearch, karat, category, page]);

  const { data, isLoading } = useSWR<PaginatedResponse<Item>>(buildUrl(), fetcher, {
    keepPreviousData: true,
    refreshInterval: 30_000,
  });

  const items = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>

      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-widest mb-1">فرۆشگاکەمان</p>
            <h1 className="font-display text-4xl font-bold text-gray-900">کۆلێکشنی زێڕ</h1>
            {pagination && (
              <p className="text-gray-500 mt-1 ltr-num">{pagination.total} دانە بەردەستە</p>
            )}
          </div>

          {/* Filters */}
          <ProductFilters
            search={search}
            karat={karat}
            category={category}
            onSearch={setSearch}
            onKarat={setKarat}
            onCategory={setCategory}
          />

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gold-100">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-14 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-5 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <FiPackage size={56} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">هیچ دانەیەک نەدۆزرایەوە</h3>
              <p className="text-gray-400">تکایە فلتەرەکانت یان گەڕانەکەت بگۆڕە.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 animate-fade-in">
              {items.map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-5 py-2.5 rounded-xl border border-gold-200 text-sm font-medium disabled:opacity-40 hover:border-gold-400 transition-all"
              >
                پێشووتر
              </button>
              {[...Array(pagination.pages)].map((_, i) => {
                const p = i + 1;
                if (Math.abs(p - page) > 2 && p !== 1 && p !== pagination.pages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ltr-num ${page === p ? 'bg-gold-600 text-white' : 'border border-gold-200 hover:border-gold-400'
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-5 py-2.5 rounded-xl border border-gold-200 text-sm font-medium disabled:opacity-40 hover:border-gold-400 transition-all"
              >
                داهاتوو
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50" />}>
      <ProductsContent />
    </Suspense>
  );
}
