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
          50: '#EBE4E5',
          100: '#DCD2D4',
          200: '#CDC2C4',
          300: '#B09EA3',
          400: '#937E85',
          500: '#8F5B77',
          600: '#8c3869',
          700: '#d84696',
          800: '#832D5C',
          900: '#2E1422',
        },
        brand: {
          main: '#d84696',
          dark: '#2E1422',
          highlight: '#8c3869',
          secondary: '#937E85',
          accent: '#CDC2C4',
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
