/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        nafees: {
          navy:    '#0F2D45',
          blue:    '#1B4A6B',
          'blue-mid': '#2D6A96',
          sky:     '#9CCCE8',
          copper:  '#C4956A',
          cream:   '#F7F5F2',
          'cream-dark': '#E6E0D8',
          sage:    '#7A9E8A',
          warm:    '#9E9087',
          'warm-dark': '#6B5E52',
        },
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}
