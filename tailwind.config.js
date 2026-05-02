/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        surface: '#111111',
        emerald: { DEFAULT: '#00C851', dark: '#009940' },
        crimson: { DEFAULT: '#CC2200', light: '#FF3B1F' },
        warning: '#FF9500',
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
