'use client';
import { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiLock, FiSave } from 'react-icons/fi';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('تێپەڕەوشەکانی نوێ یەکسان نییەن');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('تێپەڕەوشەکە دەبێت ناکەم ٦ خانە بێت');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('تێپەڕەوشە بە سەرکەوتوویی گۆڕایی');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'گۆڕایینی تێپەڕەوشە بوونەژووەر');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-6">ڕێکخستنەکان</h1>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h2 className="font-semibold text-gray-800 mb-4">زانیاریی ھەژماڕە</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">ناوی بەکارهێنەر</span>
              <span className="font-medium text-gray-800">{user?.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">ناوی نیشاندان</span>
              <span className="font-medium text-gray-800">{user?.displayName}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">ڕۆڵ</span>
              <span className="badge badge-gold capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiLock className="text-gold-600" />
            گۆڕایینی تێپەڕەوشە
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تێپەڕەوشەی ھەندێک</label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="input-field"
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تێپەڕەوشەی نوێ</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="input-field"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">دووبارەکردنەوەی تێپەڕەوشەی نوێ</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-field"
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  پاشەکەوتکرەی...
                </>
              ) : (
                <>
                  <FiSave />
                  گۆڕایینی تێپەڕەوشە
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
