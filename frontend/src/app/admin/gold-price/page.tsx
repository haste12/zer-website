'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import AdminGuard from '@/components/admin/AdminGuard';
import { api, formatNumber } from '@/lib/api';
import type { GoldPrice } from '@/types';
import toast from 'react-hot-toast';
import { FiSave, FiInfo, FiRefreshCw, FiZap } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';
import AnimatedNumber from '@/components/AnimatedNumber';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);
const historyFetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function AdminGoldPricePage() {
  const { data: current, mutate } = useSWR<GoldPrice>('/gold-price', fetcher, { refreshInterval: 60000 });
  const { data: history, mutate: mutateHistory } = useSWR<GoldPrice[]>('/gold-price/history', historyFetcher);

  const [form, setForm] = useState({
    price18K: '',
    price21K: '',
    price22K: '',
    price24K: '',
    usdRate: '1530',
    goldUsdPerGram: '',
    market: 'Erbil Gold Market',
  });

  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (current) {
      setForm({
        price18K: String(current.price18K),
        price21K: String(current.price21K),
        price22K: String(current.price22K),
        price24K: String(current.price24K),
        usdRate: String(current.usdRate || 1530),
        goldUsdPerGram: String(current.goldUsdPerGram || ''),
        market: current.market || 'Erbil Gold Market',
      });
    }
  }, [current]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Fetch live prices from goldprice.org via backend
  const handleFetchLive = async () => {
    setFetching(true);
    try {
      const res = await api.post('/gold-price/refresh');
      toast.success('✅ نرخی زێڕ بە سەرکەوتوویی نوێکرایەوە!');
      await mutate();
      await mutateHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'هەڵە ڕووی داو — تکایە دووبارە هەوڵ بدەرەوە');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/gold-price', {
        price18K: parseFloat(form.price18K),
        price21K: parseFloat(form.price21K),
        price22K: parseFloat(form.price22K),
        price24K: parseFloat(form.price24K),
        usdRate: parseFloat(form.usdRate) || 1530,
        goldUsdPerGram: parseFloat(form.goldUsdPerGram) || 0,
        market: form.market,
      });
      toast.success('نرخەکان نوێکرایەوە — هەموو کاڵاکان دووبارە حیسابکرایەوە!');
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'هەڵە ڕووی داو');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.post('/admin/recalculate');
      toast.success(res.data.message || 'کاڵاکان دووبارە حیسابکرایەوە');
    } catch {
      toast.error('هەڵە ڕووی داو');
    } finally {
      setRecalculating(false);
    }
  };

  const karatFields: Array<{ key: keyof typeof form; label: string; purity: string }> = [
    { key: 'price18K', label: '٩ عیار  — 18K', purity: '٧٥٪ پاک' },
    { key: 'price21K', label: '٢١ عیار — 21K', purity: '٨٧.٥٪ پاک' },
    { key: 'price22K', label: '٢٢ عیار — 22K', purity: '٩١.٧٪ پاک' },
    { key: 'price24K', label: '٢٤ عیار — 24K', purity: '٩٩.٩٪ پاک' },
  ];

  return (
    <AdminGuard>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">نرخی بازاڕی زێڕ</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              نرخەکان نوێ بکەرەوە — هەموو کاڵاکان خۆکارانە نوێ دەبنەوە
            </p>
          </div>
          <div className="flex gap-2">
            {/* 🚀 MAIN: Fetch Live from API */}
            <button
              onClick={handleFetchLive}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors shadow"
            >
              <FiZap size={16} className={fetching ? 'animate-spin' : ''} />
              {fetching ? 'دەهێنرێت...' : 'نرخی ئێستا بهێنە 🔴 Live'}
            </button>
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              <FiRefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
              دووبارە حیساب
            </button>
          </div>
        </div>

        {/* Live fetch info box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-6">
          <FiZap className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-amber-800 text-sm font-semibold mb-1">نرخی زێڕ بە خۆکاری نوێ دەبێتەوە هەموو ١ خولەک</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              سیستەم   نرخی نێودەوڵەتی زێڕ بە IQD دەهێنێت و لەگەڵ نرخی دۆلاری بازاڕ حیساب دەکات.
              دووگمەی <strong>"نرخی ئێستا بهێنە"</strong> بکە بۆ نوێکردنەوەی خێرا.
              یان نرخەکان بەدەستی لەخوارەوە دابنێ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Manual Price Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <GiGoldBar className="text-amber-500" />
                دابنانی نرخ بەدەستی (ئەگەر پێویست بوو)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {karatFields.map(({ key, label, purity }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        placeholder="نمونە: 1082000"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 pr-24"
                        required
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        د.ع/مەثقاڵ
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{purity}</p>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100 mb-4" />

              {/* USD Rate — Market Rate input */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  💵 نرخی دۆلار — بازاڕی هەولێر (نەک بانک)
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    name="usdRate"
                    value={form.usdRate}
                    onChange={handleChange}
                    placeholder="1530"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 pr-28"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400">
                    IQD = 1 USD
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ئەمڕۆ: <strong>{formatNumber(parseInt(form.usdRate || '1530'))} د.ع</strong> بە هاوبەشی ١ دۆلار
                  — ئەگەر نرخ گۆڕی، ئێرە نوێ بکەرەوە.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ناوی بازاڕ</label>
                  <input
                    type="text"
                    name="market"
                    value={form.market}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex gap-2 mb-5">
                <FiInfo className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-gray-500 text-xs leading-relaxed">
                  کاتێک پاشەکەوت دەکەیت، <strong>هەموو کاڵاکان خۆکارانە نرخیان نوێ دەبێتەوە.</strong>
                  نمونە: 21K = 1٬082٬000 → کاڵایەکی ٢ مەثقاڵ دەبێتە 2٬164٬000 د.ع.
                </p>
              </div>

              <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 font-semibold text-sm transition-colors">
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    پاشەکەوت دەکرێت...
                  </>
                ) : (
                  <>
                    <FiSave />
                    پاشەکەوتکردن و نوێکردنەوەی کاڵاکان
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Current prices + history */}
          <div className="space-y-5">
            {current && (
              <div className="bg-[#0d0a04] rounded-2xl p-5">
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  نرخی ئێستا
                </p>
                {(['18K', '21K', '22K', '24K'] as const).map((k) => (
                  <div key={k} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-amber-500 font-semibold text-sm">{k}</span>
                    <span className="text-white text-sm font-medium">
                      <AnimatedNumber value={(current as any)[`price${k}`]} suffix=" د.ع" duration={600} />
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-green-400 text-sm">💵 نرخی دۆلار</span>
                  <span className="text-white text-sm">{formatNumber(current.usdRate)} IQD</span>
                </div>
                <p className="text-white/30 text-xs mt-3">
                  نوێکراوە: {new Date(current.updatedAt).toLocaleString('ar-IQ')}
                </p>
              </div>
            )}

            {/* History table */}
            {history && history.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">مێژووی نرخەکان</h3>
                <div className="space-y-2">
                  {history.slice(0, 8).map((h) => (
                    <div key={h._id} className="text-xs flex justify-between text-gray-500 border-b border-gray-100 pb-1.5">
                      <span>{new Date(h.createdAt).toLocaleDateString('ar-IQ')}</span>
                      <span className="font-medium text-gray-700">21K: {formatNumber(h.price21K)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}