'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiShoppingBag } from 'react-icons/fi';
import { GiDiamondRing } from 'react-icons/gi';
import clsx from 'clsx';



const navLinks = [
  { href: '/', label: 'سەرەکی' },
  { href: '/products', label: 'بەرهەمەکان' },
  { href: '/gold-prices', label: 'نرخی زێڕ' },
  { href: '/calculator', label: '🧮 حیسابکەر' },
  { href: '/about', label: 'دەربارەی ئێمە' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#0d0a04]/95 backdrop-blur shadow-lg shadow-black/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <GiDiamondRing className="text-2xl text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-display text-2xl font-bold text-white tracking-wide">
              <span className="gold-shimmer">زێر</span>
              <span className="text-white/80 font-light mr-1"></span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-gold-400 bg-gold-400/10'
                    : 'text-white/70 hover:text-gold-300 hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Admin link + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 text-xs text-gold-500/70 hover:text-gold-400 transition-colors"
            >
              <FiShoppingBag size={14} />
              ئادمین
            </Link>

            <button
              className="md:hidden text-white/80 hover:text-white p-1"
              onClick={() => setOpen(!open)}
              aria-label="تۆگڵی مینۆ"
            >
              {open ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#0d0a04]/98 backdrop-blur border-t border-gold-800/30 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-gold-400 bg-gold-400/10'
                    : 'text-white/70 hover:text-gold-300 hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gold-600/70 hover:text-gold-500"
            >
              پانێلی ئادمین
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
