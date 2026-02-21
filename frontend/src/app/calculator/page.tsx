'use client';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, formatNumber, KARAT_COLORS } from '@/lib/api';
import type { GoldPrice } from '@/types';
import { FiRefreshCw, FiInfo } from 'react-icons/fi';
import { GiGoldBar, GiScales } from 'react-icons/gi';
import AnimatedNumber from '@/components/AnimatedNumber';
import clsx from 'clsx';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

// Grams per mithqal (Erbil standard)
const GRAMS_PER_MITHQAL = 5;

const karats = [
    { key: 'price18K' as keyof GoldPrice, karat: '18K', purity: '75%', label: '18 عەیار', color: 'from-yellow-400 to-yellow-600', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { key: 'price21K' as keyof GoldPrice, karat: '21K', purity: '87.5%', label: '21 عەیار', color: 'from-amber-400 to-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
    { key: 'price22K' as keyof GoldPrice, karat: '22K', purity: '91.7%', label: '22 عەیار', color: 'from-orange-400 to-orange-500', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
    { key: 'price24K' as keyof GoldPrice, karat: '24K', purity: '99.9%', label: '24 عەیار', color: 'from-gold-400 to-gold-600', badge: 'bg-gold-100 text-gold-800 border-gold-200' },
] as const;

type Unit = 'mithqal' | 'gram';

export default function CalculatorPage() {
    const { data: price, isLoading, mutate } = useSWR<GoldPrice>('/gold-price', fetcher, {
        refreshInterval: 30_000,
        revalidateOnFocus: true,
    });

    const [amount, setAmount] = useState('1');
    const [unit, setUnit] = useState<Unit>('mithqal');
    const [selectedKarat, setSelectedKarat] = useState<string>('21K');

    const usdRate = price?.usdRate && price.usdRate > 0 ? price.usdRate : 1530;

    // Normalise input to mithqal regardless of unit
    const mithqalValue = useMemo(() => {
        const n = parseFloat(amount) || 0;
        return unit === 'gram' ? n / GRAMS_PER_MITHQAL : n;
    }, [amount, unit]);

    const gramValue = useMemo(() => mithqalValue * GRAMS_PER_MITHQAL, [mithqalValue]);

    // Calculate IQD for every karat
    const results = useMemo(() => {
        return karats.map((k) => {
            const pricePerMithqal = price ? (price[k.key] as number) : 0;
            const iqd = Math.round(pricePerMithqal * mithqalValue);
            const usd = usdRate > 0 ? Math.round(iqd / usdRate) : 0;
            const pricePerGram = Math.round(pricePerMithqal / GRAMS_PER_MITHQAL);
            return { ...k, iqd, usd, pricePerMithqal, pricePerGram };
        });
    }, [price, mithqalValue, usdRate]);

    const selectedResult = results.find((r) => r.karat === selectedKarat) ?? results[1];

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-20 bg-cream-50" dir="rtl">
                {/* ── Hero header ── */}
                <div className="bg-[#0d0a04] py-14 px-4 text-center">
                    <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        داتای بازاڕی ڕاستەوخۆ
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
                        حیساب<span className="gold-shimmer">کەری</span> زێڕ
                    </h1>
                    <p className="text-white/50 max-w-lg mx-auto text-sm">
                        نرخی مسقاڵ یان گرامی زێڕت بزانە بەپێی نرخی ڕاستەکەی بازاڕ
                    </p>
                    {price && (
                        <p className="text-white/30 text-xs mt-3 flex items-center justify-center gap-1.5">
                            <FiRefreshCw size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
                            دوایین نوێکردنەوە: {new Date(price.updatedAt).toLocaleString('ckb')} · {price.market}
                        </p>
                    )}
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">

                    {/* ── Main calculator card ── */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gold-100 p-6 md:p-8 mb-6">

                        {/* Unit toggle + amount input */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            {/* Unit tabs */}
                            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 self-start">
                                {(['mithqal', 'gram'] as Unit[]).map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => setUnit(u)}
                                        className={clsx(
                                            'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                                            unit === u
                                                ? 'bg-[#0d0a04] text-gold-400 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        )}
                                    >
                                        {u === 'mithqal' ? 'مسقاڵ' : 'گرام'}
                                    </button>
                                ))}
                            </div>

                            {/* Amount input */}
                            <div className="flex-1 relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full text-3xl font-bold text-gray-900 font-display border-2 border-gold-200 focus:border-gold-500 rounded-2xl px-5 py-3 outline-none transition-all bg-gold-50/30 text-right ltr-num"
                                    style={{ direction: 'ltr', textAlign: 'right' }}
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                                    {unit === 'mithqal' ? 'مسقاڵ' : 'گ'}
                                </span>
                            </div>
                        </div>

                        {/* Gram/mithqal info row */}
                        {parseFloat(amount) > 0 && (
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="inline-flex items-center gap-1.5 bg-gold-50 border border-gold-200 px-3 py-1.5 rounded-full text-sm text-gold-700">
                                    <GiScales className="text-gold-500" />
                                    <span className="font-bold ltr-num">{formatNumber(parseFloat(mithqalValue.toFixed(4)))}</span> مسقاڵ
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full text-sm text-blue-700">
                                    <GiGoldBar className="text-blue-400" />
                                    <span className="font-bold ltr-num">{formatNumber(parseFloat(gramValue.toFixed(4)))}</span> گرام
                                </span>
                                {usdRate > 0 && (
                                    <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full text-sm text-green-700">
                                        💵 1 USD = <span className="font-bold ltr-num">{formatNumber(usdRate)}</span> د.ع
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Karat selector */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {karats.map((k) => (
                                <button
                                    key={k.karat}
                                    onClick={() => setSelectedKarat(k.karat)}
                                    className={clsx(
                                        'flex flex-col items-center py-3 px-2 rounded-2xl border-2 transition-all font-semibold text-sm',
                                        selectedKarat === k.karat
                                            ? 'border-gold-500 bg-[#0d0a04] text-gold-300 shadow-lg scale-105'
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gold-300'
                                    )}
                                >
                                    <span className="text-lg font-bold">{k.karat}</span>
                                    <span className="text-xs opacity-70">{k.purity}</span>
                                </button>
                            ))}
                        </div>

                        {/* Big result display */}
                        {isLoading ? (
                            <div className="skeleton h-32 rounded-2xl" />
                        ) : selectedResult && parseFloat(amount) > 0 ? (
                            <div className={`rounded-2xl p-6 bg-gradient-to-br ${selectedResult.color} text-white text-center shadow-lg mb-2`}>
                                <p className="text-white/70 text-sm font-medium mb-1">
                                    {formatNumber(parseFloat(mithqalValue.toFixed(4)))} مسقاڵ × {selectedResult.karat} ({selectedResult.purity} پاک)
                                </p>
                                <p className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                                    <AnimatedNumber value={selectedResult.iqd} duration={600} />
                                </p>
                                <p className="text-white/80 text-base mt-1 font-semibold">دینار عێراقی</p>
                                {selectedResult.usd > 0 && (
                                    <p className="text-white/60 text-sm mt-2">
                                        ≈ <AnimatedNumber value={selectedResult.usd} prefix="$" duration={600} /> دۆلار
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl p-8 bg-gray-50 border-2 border-dashed border-gray-200 text-center text-gray-400">
                                <GiGoldBar className="text-4xl mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">ژمارەیەک داخڵ بکە بۆ دیتنی نرخ</p>
                            </div>
                        )}
                    </div>

                    {/* ── All karats result grid ── */}
                    {!isLoading && parseFloat(amount) > 0 && price && (
                        <div className="mb-6">
                            <h2 className="font-display text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <GiGoldBar className="text-gold-500" />
                                بەراوردی هەموو عەیارەکان
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {results.map((r) => (
                                    <button
                                        key={r.karat}
                                        onClick={() => setSelectedKarat(r.karat)}
                                        className={clsx(
                                            'bg-white rounded-2xl border-2 p-5 text-center transition-all hover:shadow-md',
                                            selectedKarat === r.karat
                                                ? 'border-gold-400 shadow-gold-100 shadow-md scale-[1.02]'
                                                : 'border-gray-100'
                                        )}
                                    >
                                        <span className={clsx('badge border mb-2', r.badge)}>
                                            {r.karat}
                                        </span>
                                        <p className="font-display text-2xl font-bold text-gray-900 mt-2">
                                            <AnimatedNumber value={r.iqd} duration={600} />
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">د.ع</p>
                                        {r.usd > 0 && (
                                            <p className="text-sm text-green-600 font-semibold mt-1">
                                                <AnimatedNumber value={r.usd} prefix="≈ $" duration={600} />
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Reference table: price per mithqal & per gram ── */}
                    {!isLoading && price && (
                        <div className="bg-white rounded-2xl border border-gold-100 overflow-hidden mb-6">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <FiInfo className="text-gold-500" />
                                <h2 className="font-semibold text-gray-800 text-sm">نرخی بازاڕ (بۆ هەر مسقاڵ / گرام)</h2>
                                <button
                                    onClick={() => mutate()}
                                    className="mr-auto text-gold-500 hover:text-gold-700 transition-colors"
                                    title="نوێکردنەوە"
                                >
                                    <FiRefreshCw size={14} />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                            <th className="px-5 py-3 text-right font-semibold">عەیار</th>
                                            <th className="px-5 py-3 text-right font-semibold">پاکی</th>
                                            <th className="px-5 py-3 text-right font-semibold">نرخ / مسقاڵ (د.ع)</th>
                                            <th className="px-5 py-3 text-right font-semibold">نرخ / گرام (د.ع)</th>
                                            <th className="px-5 py-3 text-right font-semibold">نرخ / مسقاڵ ($)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {results.map((r) => (
                                            <tr
                                                key={r.karat}
                                                onClick={() => setSelectedKarat(r.karat)}
                                                className={clsx(
                                                    'cursor-pointer transition-colors',
                                                    selectedKarat === r.karat
                                                        ? 'bg-gold-50'
                                                        : 'hover:bg-gray-50'
                                                )}
                                            >
                                                <td className="px-5 py-3">
                                                    <span className={clsx('badge border', r.badge)}>{r.karat}</span>
                                                </td>
                                                <td className="px-5 py-3 text-gray-500">{r.purity}</td>
                                                <td className="px-5 py-3 font-bold text-gray-900">
                                                    <AnimatedNumber value={r.pricePerMithqal} duration={600} />
                                                </td>
                                                <td className="px-5 py-3 font-medium text-gray-700">
                                                    <AnimatedNumber value={r.pricePerGram} duration={600} />
                                                </td>
                                                <td className="px-5 py-3 font-medium text-green-600">
                                                    <AnimatedNumber
                                                        value={usdRate > 0 ? Math.round(r.pricePerMithqal / usdRate) : 0}
                                                        prefix="$"
                                                        duration={600}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Quick amount buttons ── */}
                    <div className="bg-white rounded-2xl border border-gold-100 p-5 mb-6">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">ژمارەی خێرا</p>
                        <div className="flex flex-wrap gap-2">
                            {[0.5, 1, 1.5, 2, 3, 4, 5, 10, 20, 50].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => { setAmount(String(n)); setUnit('mithqal'); }}
                                    className={clsx(
                                        'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                                        parseFloat(amount) === n && unit === 'mithqal'
                                            ? 'bg-[#0d0a04] text-gold-400 border-gold-600'
                                            : 'border-gray-100 text-gray-600 hover:border-gold-300 bg-white'
                                    )}
                                >
                                    {n} مسقاڵ
                                </button>
                            ))}
                            {[5, 10, 20, 50, 100].map((n) => (
                                <button
                                    key={`g${n}`}
                                    onClick={() => { setAmount(String(n)); setUnit('gram'); }}
                                    className={clsx(
                                        'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                                        parseFloat(amount) === n && unit === 'gram'
                                            ? 'bg-[#0d0a04] text-gold-400 border-gold-600'
                                            : 'border-gray-100 text-gray-600 hover:border-gold-300 bg-white'
                                    )}
                                >
                                    {n} گ
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Disclaimer ── */}
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                        <FiInfo className="shrink-0 mt-0.5 text-amber-500" size={16} />
                        <p>
                            نرخەکان بە پێی بازاڕی زێڕی هەولێر نوێدەکرێنەوە. نرخی کارسازی یان سوود تێدا نییە.
                            بۆ نرخی دیاریکردراو لەگەڵ فرۆشگا پەیوەندی بکە.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
