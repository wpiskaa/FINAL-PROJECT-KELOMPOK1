/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        coffee: {
          50: '#FDFBF7',
          100: '#F7F2EA',
          200: '#EFE6D8',
          300: '#DCCCB4',
          400: '#C4A882',
          500: '#A68256',
          600: '#8C6438',
          700: '#6F4E2B',
          800: '#4A331A',
          900: '#2E1E0E',
          950: '#1D1208',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EBE2D7',
          400: '#DFD2C2',
          500: '#CBBBA8',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(74, 51, 26, 0.06), 0 2px 6px -1px rgba(74, 51, 26, 0.04)',
        'card': '0 10px 30px -4px rgba(74, 51, 26, 0.08)',
        'elevated': '0 20px 40px -15px rgba(74, 51, 26, 0.15)',
      }
    },
  },
  plugins: [],
}
