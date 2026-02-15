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
          DEFAULT: '#5BE9B9',
          dark: '#48D5A5',
        },
        success: '#5BE9B9',
        danger: '#FF6B6B',
        info: '#4A90E2',
        warning: '#FFA726',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'card-lg': '24px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'primary': '0 4px 12px rgba(91, 233, 185, 0.3)',
        'primary-hover': '0 6px 20px rgba(91, 233, 185, 0.4)',
      },
    },
  },
  plugins: [],
}
