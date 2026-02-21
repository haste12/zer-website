import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import FeaturedProducts from '@/components/FeaturedProducts';
import LiveGoldSection from '@/components/LiveGoldSection';
import { GiDiamondRing, GiGoldBar } from 'react-icons/gi';
import { FiArrowLeft, FiAward, FiShield, FiRefreshCw } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'زێر  – فرۆشگای زێڕی بەرزکیفایەت | هەولێر',
  description: 'دۆزینەوەی زێڕی بەرزکیفایەت لە زێر جووێلری. بازاڕکردنی ئەنگووشت، گەردەنبەند، دەستبەند و زیاتر.',
};

const features = [
  { icon: <FiAward size={28} />, title: 'زێڕی گواستراوە', desc: 'هەر پارچەیەک گواستراوە و تاقیکراوەتەوە بۆ پاکی' },
  { icon: <FiShield size={28} />, title: 'کیفایەتی ڕاستەوخۆ', desc: 'کارپێکردنی بەرزکیفایەت بە زێڕی ڕاستەوخۆ' },
  { icon: <GiGoldBar size={28} />, title: 'نرخی دادپەروەرانە', desc: 'نرخدانی دینامیکی بە پێی بازاڕی زێڕی هەولێر' },
  { icon: <FiRefreshCw size={28} />, title: 'نوێکردنەوەی نرخی ڕۆژانە', desc: 'نرخی زێڕ ڕۆژانە نوێدەکرێتەوە بۆ تایبەتمەندی' },
];

export default function HomePage() {
  return (
    <>

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-gradient">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d4a820 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0a04]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-32 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gold-800/20 border border-gold-700/30 px-4 py-2 rounded-full text-gold-400 text-sm font-medium mb-8">
            <GiDiamondRing />
            زێڕی پرۆفێشناڵ · هەولێر
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
            بەرهەمی دڵخوازت 
            <br />
            <span className="gold-shimmer">ڵیرە بدۆزەوە </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
           هەر پەرچەیەکی زێرت بوێ لێرە بەردەستە بە هەموو تایبەت مەندیەکانیەوە
           <br />
            نرخی هەر پارچەیەک بە پێی نرخی ڕاستەوخۆی بازاڕی هەولێر دیاردەکرێت.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary text-base px-8 py-4 shadow-xl shadow-gold-900/30">
              بەرهەمەکان ببینە
              <FiArrowLeft />
            </Link>
            <Link href="/gold-prices" className="btn-secondary text-base px-8 py-4 text-gold-400 border-gold-700 hover:bg-gold-700">
              نرخی ڕاستەوخۆی زێڕ
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6 rounded-2xl hover:bg-gold-50 transition-colors group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-100 text-gold-700 mb-4 group-hover:bg-gold-200 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Gold Prices */}
      <LiveGoldSection />

      {/* Featured Products */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-widest mb-2">هەڵبژێردراو</p>
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">کۆلێکشنی تایبەت</h2>
            <hr className="gold-divider w-24 mx-auto" />
          </div>
          <FeaturedProducts />
          <div className="text-center mt-10">
            <Link href="/products" className="btn-secondary">
              هەموو زێڕەکان ببینە
              <FiArrowLeft />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
