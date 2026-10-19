import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        radar: { 50: '#ecfdf5', 400: '#34d399', 500: '#10b981', 600: '#059669', 900: '#064e3b' },
      },
    },
  },
  plugins: [],
};

export default config;
