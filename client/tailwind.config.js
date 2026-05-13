/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dark: '#8B6914',
        },
        vn: {
          black: '#050507',
          deep: '#0A0A12',
          surface: '#0F0F1A',
          surface2: '#151522',
          surface3: '#1C1C2E',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 40px rgba(201, 168, 76, 0.15)',
        'glow-gold-lg': '0 0 60px rgba(201, 168, 76, 0.22)',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
