import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        storm: {
          50: '#f5f7fb',
          100: '#e6edf5',
          500: '#42719d',
          700: '#254963',
          900: '#102838',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
