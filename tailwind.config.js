/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#00ff88',
          cyan: '#00d4ff',
          purple: '#a855f7',
        },
        dark: {
          900: '#000000',
          800: '#0a0a0a',
          700: '#0d0d0d',
          600: '#121212',
          500: '#1a1a1a',
          400: '#242424',
        },
      },
      boxShadow: {
        'neon-green': '0 0 12px rgba(0,255,136,0.45), 0 0 28px rgba(0,255,136,0.15)',
        'neon-cyan': '0 0 12px rgba(0,212,255,0.45), 0 0 28px rgba(0,212,255,0.15)',
        'neon-purple': '0 0 12px rgba(168,85,247,0.45), 0 0 28px rgba(168,85,247,0.15)',
      },
      borderWidth: { DEFAULT: '1px', '05': '0.5px' },
      animation: {
        'pulse-mic': 'pulse 1.2s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
