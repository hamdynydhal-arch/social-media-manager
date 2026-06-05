/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 – scan all source files for class names
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // RTL-aware font stack: Arabic-first
      fontFamily: {
        arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef8ff',
          100: '#d9efff',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a5f',
        },
      },
    },
  },
  plugins: [],
};
