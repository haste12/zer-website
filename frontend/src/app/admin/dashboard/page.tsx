'use client';
import useSWR from 'swr';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { api, formatIQD, formatNumber, KARAT_COLORS } from '@/lib/api';
import type { DashboardStats } from '@/types';
import { FiPackage, FiTrendingUp, FiStar, FiAlertCircle, FiPlus, FiEdit3 } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';
import clsx from 'clsx';
import AnimatedNumber from '@/components/AnimatedNumber';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function DashboardPage() {
  const { data: stats, isLoading, mutate } = useSWR<DashboardStats>('/admin/dashboard', fetcher, {
    refreshInterval: 30_000,
  });

  return (
    <AdminGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-display">داشبۆرد</h1>
          <p className="text-gray-500 text-sm mt-1">پێشاندانی گشتی فرۆشگای زێڕەکەت</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { label: 'کۆی کاڵاکان', value: stats.stats.totalItems, icon: <FiPackage />, color: 'bg-blue-50 text-blue-600' },
                { label: 'بەردەست', value: stats.stats.availableItems, icon: <FiTrendingUp />, color: 'bg-green-50 text-green-600' },
                { label: 'تایبەتمەند', value: stats.stats.featuredItems, icon: <FiStar />, color: 'bg-gold-50 text-gold-700' },
                { label: 'نەبەردەست', value: stats.stats.unavailableItems, icon: <FiAlertCircle />, color: 'bg-red-50 text-red-600' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Gold prices + quick actions row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              {/* Current gold prices */}
              <div className="lg:col-span-2 bg-[#0d0a04] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gold-400 font-semibold">
                    <GiGoldBar />
                    نرخی ئێستای زێڕ
                  </div>
                  <Link href="/admin/gold-price" className="text-xs text-gold-600 hover:text-gold-400 transition-colors flex items-center gap-1">
                    <FiEdit3 size={12} />
                    نوێکردنەوە
                  </Link>
                </div>
                {stats.goldPrice ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['18K', '21K', '22K', '24K'] as const).map((k) => {
                      const priceKey = `price${k}` as keyof typeof stats.goldPrice;
                      return (
                        <div key={k} className="bg-white/5 rounded-xl p-3 text-center">
                          <span className={clsx('badge text-xs mb-1', KARAT_COLORS[k])}>{k}</span>
                          <p className="text-white font-bold text-sm">
                            <AnimatedNumber value={stats.goldPrice![priceKey] as number} duration={700} />
                          </p>
                          <p className="text-white/30 text-xs">د.ع/مسقاڵ</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-white/40 text-sm">
                    نرخی زێڕ دانەنراوە.{' '}
                    <Link href="/admin/gold-price" className="text-gold-500 underline">
                      ئێستا دابنێ
                    </Link>
                  </div>
                )}
                {stats.goldPrice && (
                  <p className="text-white/30 text-xs mt-3">
                    دوایین نوێکردنەوە: {new Date(stats.goldPrice.updatedAt).toLocaleString('ckb')}
                    &nbsp;· USD: {formatNumber(stats.goldPrice.usdRate)} IQD
                  </p>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">کردارە خێراکان</h3>
                <div className="space-y-3">
                  <Link href="/admin/items/new" className="btn-primary w-full justify-center text-sm">
                    <FiPlus />
                    زیادکردنی کاڵای نوێ
                  </Link>
                  <Link href="/admin/gold-price" className="btn-secondary w-full justify-center text-sm">
                    <GiGoldBar />
                    نوێکردنەوەی نرخی زێڕ
                  </Link>
                  <Link href="/admin/items" className="btn-ghost w-full justify-center text-sm border border-gray-200">
                    <FiPackage />
                    بەڕێوەبردنی کاڵاکان
                  </Link>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* By Karat */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">کاڵاکان بەپێی عەیار</h3>
                <div className="space-y-3">
                  {stats.itemsByKarat.map((k) => (
                    <div key={k._id} className="flex items-center gap-3">
                      <span className={clsx('badge w-10 justify-center', KARAT_COLORS[k._id as string])}>{k._id}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gold-500 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${Math.round((k.count / stats.stats.totalItems) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-6 text-right">{k.count}</span>
                    </div>
                  ))}
                  {stats.itemsByKarat.length === 0 && (
                    <p className="text-gray-400 text-sm">هێشتا کاڵایەک نییە.</p>
                  )}
                </div>
              </div>

              {/* By Category */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">کاڵاکان بەپێی جۆر</h3>
                <div className="space-y-3">
                  {stats.itemsByCategory.slice(0, 6).map((c) => (
                    <div key={c._id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 capitalize w-20 truncate">{c._id}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${Math.round((c.count / stats.stats.totalItems) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-6 text-right">{c.count}</span>
                    </div>
                  ))}
                  {stats.itemsByCategory.length === 0 && (
                    <p className="text-gray-400 text-sm">هێشتا کاڵایەک نییە.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400">داتاکانی داشبۆرد دەخوێنرێت...</p>
        )}
      </div>
    </AdminGuard>
  );
}
