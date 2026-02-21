/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefdf0',
          100: '#fdf8d0',
          200: '#faf0a0',
          300: '#f5e165',
          400: '#eecb35',
          500: '#d4a820',
          600: '#b8860b',  // dark goldenrod
          700: '#946a08',
          800: '#7a540b',
          900: '#664510',
          950: '#3a2504',
        },
        cream: {
          50: '#fffef5',
          100: '#fefce8',
          200: '#fdf6c3',
        },
      },
      fontFamily: {
        serif: ['Noto Naskh Arabic', 'Georgia', 'Cambria', 'serif'],
        sans: ['Noto Naskh Arabic', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
        arabic: ['Noto Naskh Arabic', 'Noto Sans Arabic', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 168, 32, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212, 168, 32, 0)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4a820 0%, #f5e165 50%, #d4a820 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1a1105 0%, #2d1f08 50%, #1a1105 100%)',
      },
    },
  },
  plugins: [],
};
