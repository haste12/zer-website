'use client';
import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { api, formatIQD, formatNumber, getImageUrl, KARAT_COLORS, CATEGORY_LABELS } from '@/lib/api';
import type { Item, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit3, FiTrash2, FiSearch, FiPackage, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiDiamondRing } from 'react-icons/gi';
import clsx from 'clsx';
import AnimatedNumber from '@/components/AnimatedNumber';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function AdminItemsPage() {
  const [search, setSearch] = useState('');
  const [karat, setKarat] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch, karat]);

  const buildUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set('search', debouncedSearch);
    if (karat) p.set('karat', karat);
    p.set('page', String(page));
    p.set('limit', '20');
    return `/admin/items?${p.toString()}`;
  }, [debouncedSearch, karat, page]);

  const { data, mutate, isLoading } = useSWR<PaginatedResponse<Item>>(buildUrl(), fetcher, {
    keepPreviousData: true,
  });

  const items = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async (item: Item) => {
    if (!confirm(`"؋${item.name}"؋ بسبەڕدەیتنەوە؟ ئەمە گەڕدێدەڕایی کراوە.`)) return;
    setDeletingId(item._id);
    try {
      await api.delete(`/items/${item._id}`);
      toast.success(`"؋${item.name}"؋ سبردرایی`);
      mutate();
    } catch {
      toast.error('سبردرایی بوونەژووەر');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (item: Item) => {
    try {
      const formData = new FormData();
      formData.append('isAvailable', String(!item.isAvailable));
      await api.put(`/items/${item._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`کاڵا ${!item.isAvailable ? 'بەردەستکرا' : 'ناچینکرا'}`);
      mutate();
    } catch {
      toast.error('نوێکردنەوەی کاڵا بوونەژووەر');
    }
  };

  return (
    <AdminGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">بەڕێوەبردنی کاڵاکان</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {pagination ? `کۆی ${pagination.total} کاڵا` : 'هەموو کاڵا زێڕییەکان'}
            </p>
          </div>
          <Link href="/admin/items/new" className="btn-primary">
            <FiPlus />
            زیادکردنی کاڵای نوێ
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="بەدوابە..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
          {['', '18K', '21K', '22K', '24K'].map((k) => (
            <button
              key={k || 'all'}
              onClick={() => setKarat(k)}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm border font-medium transition-all',
                karat === k ? 'bg-gold-600 text-white border-gold-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gold-400'
              )}
            >
              {k || 'هەموو'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="skeleton w-14 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-48 rounded" />
                    <div className="skeleton h-3 w-32 rounded" />
                  </div>
                  <div className="skeleton h-6 w-24 rounded" />
                  <div className="skeleton h-6 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <FiPackage size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">کاڵایەک نەدۆزرایەوە</p>
              <Link href="/admin/items/new" className="btn-primary mt-4 inline-flex">
                <FiPlus />
                یەکەم زیادبکە
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>کاڵا</th>
                    <th>عەیار</th>
                    <th>کێشە</th>
                    <th>نرخی زیندوو</th>
                    <th>بالیووز</th>
                    <th>کردارەکان</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gold-50 flex-shrink-0">
                            <Image
                              src={getImageUrl(item.images?.[0]?.url)}
                              alt={item.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-jewelry.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-400">
                              {CATEGORY_LABELS[item.category] || item.category}
                              {item.sku && ` · ${item.sku}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={clsx('badge', KARAT_COLORS[item.karat])}>{item.karat}</span>
                      </td>
                      <td className="font-medium">{item.weight} مسقاڵ</td>
                      <td className="font-semibold text-gray-900">
                        {(item.livePrice ?? 0) > 0
                          ? <AnimatedNumber value={item.livePrice!} asIQD duration={700} />
                          : '—'}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={clsx('badge cursor-pointer hover:opacity-80 transition-opacity', item.isAvailable ? 'badge-green' : 'badge-red')}
                        >
                          {item.isAvailable ? 'بەردەست' : 'نەبەردەست'}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/items/${item._id}/edit`}
                            className="btn-ghost px-2 py-1.5 text-xs"
                            title="Edit"
                          >
                            <FiEdit3 size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item._id}
                            className="btn-ghost px-2 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            {deletingId === item._id ? (
                              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiTrash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:border-gold-400 transition-all">
              پێشووتر
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {pagination.pages}
            </span>
            <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:border-gold-400 transition-all">
              داهاتوو
            </button>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
