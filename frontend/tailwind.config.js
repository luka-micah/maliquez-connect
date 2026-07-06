/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F8F6FC',
          100: '#EDE4FF',
          200: '#D4BCFF',
          300: '#B894FF',
          400: '#9C6CFF',
          500: '#7E4FDB',
          600: '#6F2DBD',
          700: '#4B1D87',
          800: '#3B1570',
          900: '#2B0D55',
        },
        brand: {
          main: '#6F2DBD',
          dark: '#4B1D87',
          highlight: '#EDE4FF',
          white: '#FFFFFF',
          darkText: '#2B2B2B',
          bodyText: '#4B5563',
        },
      },
    },
  },
  plugins: [],
};
