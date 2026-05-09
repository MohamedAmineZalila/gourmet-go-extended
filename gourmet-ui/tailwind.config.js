/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT: '#f97316', dark: '#ea6a0a', light: '#fb923c' },
        surface: { DEFAULT: '#1e2130', deep: '#0f1117', border: '#2d3148' },
      },
    },
  },
  plugins: [],
}
