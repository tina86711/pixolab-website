/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./en/**/*.html",
    "./services/**/*.html",
    "./en/services/**/*.html",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fb',
          300: '#adc0f7',
          400: '#8ca7f4',
          500: '#5e6ad2', // Linear Primary
          600: '#4b55a8',
          700: '#38407e',
          800: '#252a54',
          900: '#13152a',
        },
        slate: {
          950: '#0a0a0c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'premium-hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
