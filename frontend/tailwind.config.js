/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e3e3e7',
          800: '#18181b',
          900: '#09090b',
          950: '#030304',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
