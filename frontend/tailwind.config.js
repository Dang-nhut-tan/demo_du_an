/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#004ba0',
          deep: '#003366',
          accent: '#0066cc',
          lightBlue: '#e8f1fa',
          orange: '#f37021',
          orangeLight: '#ff8533',
          orangeSoft: '#fff3ea',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      screens: {
        'xs': '390px',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 51, 102, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'float': '0 10px 30px -5px rgba(0, 75, 160, 0.25)',
      }
    },
  },
  plugins: [],
}
