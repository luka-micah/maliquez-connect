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
          50: '#F9F7FB',
          100: '#F0EAF2',
          200: '#D8B4D1',
          300: '#C15A9D',
          400: '#A03D7C',
          500: '#8F2D6B',
          600: '#7A1F5C',
          700: '#611547',
          800: '#4A0E38',
          900: '#2A1032',
        },
        brand: {
          main: '#7A1F5C',
          dark: '#611547',
          highlight: '#D8B4D1',
          accent: '#C15A9D',
          white: '#FFFFFF',
          darkText: '#2D2D2D',
          bodyText: '#6B7280',
        },
      },
    },
  },
  plugins: [],
};
