'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GiDiamondRing } from 'react-icons/gi';
import {
  FiGrid,
  FiPackage,
  FiTrendingUp,
  FiLogOut,
  FiUser,
  FiSettings,
  FiX,
} from 'react-icons/fi';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin/dashboard', icon: <FiGrid size={18} />, label: 'داشبۆرد' },
  { href: '/admin/items', icon: <FiPackage size={18} />, label: 'بەڕێوەبردنی کاڵاکان' },
  { href: '/admin/gold-price', icon: <FiTrendingUp size={18} />, label: 'نرخی زێڕ' },
  { href: '/admin/settings', icon: <FiSettings size={18} />, label: 'ڕێکخستنەکان' },
];

interface Props {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('چوویتە دەرەوە');
    router.replace('/admin/login');
  };

  return (
    <aside className="h-full flex flex-col bg-[#0d0a04] border-r border-gold-800/30 w-64">
      {/* Logo area */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-gold-800/20">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <GiDiamondRing className="text-2xl text-gold-400" />
          <span className="font-display text-xl font-bold text-white">
            <span className="gold-shimmer">زێر</span>
            <span className="text-white/60 text-sm font-light ml-1">ئادمین</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors lg:hidden">
            <FiX />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gold-800/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-800/40 flex items-center justify-center">
            <FiUser className="text-gold-400" size={16} />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.displayName}</p>
            <p className="text-white/40 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-gold-800/30 text-gold-300 border border-gold-700/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gold-800/20 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          سەردانی فرۆشگا ↗
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-xl transition-all"
        >
          <FiLogOut size={16} />
          چوونەدەرەوە
        </button>
      </div>
    </aside>
  );
}
