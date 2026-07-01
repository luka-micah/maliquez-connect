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
          50: '#E9D4F0',
          100: '#E0C5E8',
          200: '#D0ADD8',
          300: '#BD91C8',
          400: '#A06EB0',
          500: '#884DA0',
          600: '#6F2C91',
          700: '#5C237A',
          800: '#4A2C54',
          900: '#3A1F42',
        },
      },
    },
  },
  plugins: [],
};
