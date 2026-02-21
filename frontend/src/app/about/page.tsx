import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { GiDiamondRing, GiGoldBar } from 'react-icons/gi';
import { FiMapPin, FiPhone, FiClock } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'دەربارەی ئێمە',
  description: 'زیاتر بزانە دەربارەی زێر جووێلری – فرۆشگای زێڕی متمانەپێکراوت لە هەولێر، هەرێمی کوردستان.',
};

export default function AboutPage() {
  return (
    <>

      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        {/* Hero */}
        <section className="bg-dark-gradient py-20 text-center px-4">
          <GiDiamondRing className="text-5xl text-gold-400 mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold text-white mb-4">
            دەربارەی <span className="gold-shimmer">زێر جووێلری</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            دروستکردنی زێڕی هەمیشەیی بە خودانەت و ورییەت لە کاتی دامەزراندنمان لە هەولێر.
          </p>
        </section>

        {/* Story */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold-600 text-sm font-semibold uppercase tracking-widest mb-2">چیرۆکی ئێمە</p>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
                میراتێکی زێڕ
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                زێر جووێلری بە ئامانجێکی دیاری دامەزرا: هێنانی زێڕی پاک و بەرزکیفایەت
                بۆ خەڵکی هەولێر و کوردستان بە نرخێکی دادپەروەرانە و ئاشکرا بە پێی نرخی
                ڕاستەکەی بازاڕ.
              </p>
              <p className="text-gray-600 leading-relaxed">
                هەر پارچەیەک لە فرۆشگاکەمان دروستکراوە بە دەستی ئوستادانی کارپێکراو و
                نرخیان بە خودکارانە بە پێی بازاڕی زێڕی هەولێر دیاردەکرێت، بۆ ئەوەی
                هەمیشە نرخێکی دادپەروەرانە بپێدەیت. باوەڕ بە ئەوەیە کە زێڕ دەبێت هەم
                جوان و هەم وەبەرهێنانێکی بەرجەم بێت.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gold-50 to-cream-100 rounded-3xl p-10 text-center border border-gold-100">
              <GiGoldBar className="text-gold-500 text-6xl mx-auto mb-4" />
              <p className="font-display text-4xl font-bold text-gold-700 mb-2 ltr-num">18K – 24K</p>
              <p className="text-gray-600">زێڕی گواستراو لە هەموو کارەتەکانی بەناوبانگ</p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-gray-900">سەردانمان بکە</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <FiMapPin size={24} />, title: 'شوێن', info: 'بازاڕی زێڕی هەولێر\nهەرێمی کوردستان، عێراق' },
                { icon: <FiPhone size={24} />, title: 'تەلەفۆن', info: '+964 750 000 0000\n+964 770 000 0000' },
                { icon: <FiClock size={24} />, title: 'کاتژمێری کار', info: 'شەممە – پێنجشەممە: ٩ص – ٨ع\nهەینی: داخراوە' },
              ].map((c) => (
                <div key={c.title} className="bg-white rounded-2xl border border-gold-100 p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold-100 text-gold-700 mb-3">
                    {c.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{c.title}</h3>
                  <p className="text-gray-500 text-sm whitespace-pre-line">{c.info}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
