/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}','./src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        teal: { DEFAULT: '#0D9488', light: '#14B8A6', dark: '#0F766E' },
      }
    }
  },
  plugins: [],
}
