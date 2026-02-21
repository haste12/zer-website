import Link from 'next/link';
import { GiDiamondRing } from 'react-icons/gi';
import { FiPhone, FiMapPin, FiClock } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-[#0d0a04] text-white/70 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <GiDiamondRing className="text-2xl text-gold-400" />
              <span className="font-display text-2xl font-bold">
                <span className="gold-shimmer">زێر</span>
                <span className="text-white/80 font-light mr-1">جووێلری</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              دروستکردنی زێڕی هەمیشەیی بە ورییەت و جوانی. هەر پارچەیەک چیرۆکی
              لوکس و میراتێک دەگێڕێتەوە.
            </p>
            <hr className="gold-divider" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              بەستەرە خێراکان
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'سەرەکی' },
                { href: '/products', label: 'کۆلێکشن' },
                { href: '/gold-prices', label: 'نرخی ڕاستەوخۆی زێڕ' },
                { href: '/about', label: 'دەربارەی ئێمە' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gold-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              پەیوەندی
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 text-gold-500 shrink-0" />
                <span>بازاڕی زێڕی هەولێر، هەرێمی کوردستان، عێراق</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-gold-500 shrink-0" />
                <span className="ltr-num">+964 750 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <FiClock className="text-gold-500 shrink-0" />
                <span>شەممە – پێنجشەممە: ٩ی بەیانی – ٨ی ئێوارە</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} زێر جووێلری. هەموو مافەکان پارێزراون.</p>
          <p>نرخەکان لە بازاڕی زێڕی هەولێر – ڕۆژانە نوێدەکرێتەوە</p>
        </div>
      </div>
    </footer>
  );
}
