import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'زێر  – فرۆشگای زێڕی پرۆفێشناڵ | هەولێر',
    template: '%s | زێر جووێلری',
  },
  description:
    'دۆزینەوەی زێڕی بەرزکیفایەت لە زێر جووێلری. بازاڕکردنی ئەنگووشت، گەردەنبەند، دەستبەند و زیاتر کە لە زێڕی 18K, 21K, 22K و 24K دروستکراون. نرخی زێڕ ڕۆژانە نوێدەکرێتەوە.',
  keywords: ['زێڕ', 'جووێلری', 'هەولێر', 'ئەنگووشت', 'گەردەنبەند', 'زێڕی 21K', 'زێڕی 18K'],
  openGraph: {
    siteName: 'زێر جووێلری',
    type: 'website',
    locale: 'ckb_IQ',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ckb" dir="rtl">
      <body>
        {children}
        <Toaster
          position="top-left"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1105',
              color: '#f5e165',
              borderRadius: '8px',
              border: '1px solid #d4a820',
              fontFamily: "'Noto Naskh Arabic', sans-serif",
            },
            success: {
              iconTheme: { primary: '#d4a820', secondary: '#1a1105' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
              style: { background: '#1a1105', color: '#fca5a5', border: '1px solid #ef4444' },
            },
          }}
        />
      </body>
    </html>
  );
}
