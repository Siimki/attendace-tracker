/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F36A06',
          dark: '#C65504',
          light: '#FF8A33',
        },
      },
    },
  },
  plugins: [],
};
