import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('zer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally (redirect to login)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('zer_token');
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Formatters ───────────────────────────────────────────────────────────────
export const formatIQD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-US').format(n);

export const KARAT_COLORS: Record<string, string> = {
  '18K': 'bg-yellow-100 text-yellow-800',
  '21K': 'bg-amber-100 text-amber-800',
  '22K': 'bg-orange-100 text-orange-800',
  '24K': 'bg-gold-100 text-gold-800',
};

export const KARAT_LABEL: Record<string, string> = {
  '18K': '١٨ کاراتی',
  '21K': '٢١ کاراتی',
  '22K': '٢٢ کاراتی',
  '24K': '٢٤ کاراتی (پاک)',
};

export const CATEGORY_LABELS: Record<string, string> = {
  ring: 'ئەنگووشت',
  necklace: 'گەردەنبەند',
  bracelet: 'دەستبەند',
  earring: 'گوێزارە',
  pendant: 'ئازمێر',
  bangle: 'خەڵخاڵ',
  set: 'کۆمەڵی زێڕ',
  other: 'جۆری دیکە',
};

export const UPLOADS_URL =
  process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5000';

// Tiny gold-ring SVG encoded as a data URI — safe fallback for onError on <Image>
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="400" height="400" fill="#fdf8e8"/>` +
    `<circle cx="200" cy="185" r="85" fill="none" stroke="#d4a820" stroke-width="26"/>` +
    `<circle cx="200" cy="185" r="85" fill="none" stroke="#f5e165" stroke-width="8"/>` +
    `<polygon points="200,98 235,133 200,165 165,133" fill="#b8860b"/>` +
    `<polygon points="200,98 235,133 200,122" fill="#f5e165"/>` +
    `<polygon points="200,98 165,133 200,122" fill="#d4a820"/>` +
    `<text x="200" y="328" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#b8860b">زێر جووێلری</text>` +
    `</svg>`
  );

export const getImageUrl = (url?: string): string => {
  if (!url) return PLACEHOLDER_IMG;
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:')) return url;
  return `${UPLOADS_URL}${url}`;
};

