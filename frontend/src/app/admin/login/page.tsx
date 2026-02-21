'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { GiDiamondRing } from 'react-icons/gi';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('تکایە ناوی بەکارهێنەر و تێپەڕەوشە داخڵ بکە');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('بەخێربێیتەوە!');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'تێکچووی چوونەژووەرەوە. تکایە زانیارییەکانت پشکنینەوە.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0a04]">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-gradient px-4">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #d4a820 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-gold-800/30 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-800/30 mb-4">
              <GiDiamondRing className="text-3xl text-gold-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              <span className="gold-shimmer">زێر</span> ئادمین
            </h1>
            <p className="text-white/40 text-sm">بچۆژووەرەوە بۆ بەڕێوەبردنی فرۆشگاکەت</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                ناوی بەکارهێنەر
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                تێپەڕەوشە
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gold-gradient text-[#1a1105] font-bold rounded-xl hover:opacity-90 active:scale-98 transition-all shadow-lg shadow-gold-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  چوونەژووەرەوە...
                </>
              ) : (
                'چوونەژووەرەوە'
              )}
            </button>
          </form>

          <p className="text-center text-white/25 text-xs mt-6">
            بنەڕەتی: admin / admin123456 (دوای یەکەم چوونەژووەرەوە بیگۆڕە)
          </p>
        </div>
      </div>
    </div>
  );
}
