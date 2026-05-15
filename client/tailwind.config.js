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
          DEFAULT: '#C8A84B',
          light: '#E2C46E',
          dark: '#7A5C10',
          pale: 'rgba(200,168,75,0.08)',
        },
        vn: {
          black: '#03030A',
          deep: '#07071A',
          surface: '#0C0C1E',
          surface2: '#111128',
          surface3: '#181832',
          violet: '#1C1642',
          'violet-deep': '#120F2E',
          'violet-glow': '#3D2C8A',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 40px rgba(200,168,75,0.15)',
        'glow-gold-lg': '0 0 60px rgba(200,168,75,0.22)',
        'glow-violet': '0 0 60px rgba(58,40,130,0.2)',
        'glow-dual': '0 0 40px rgba(200,168,75,0.12), 0 0 80px rgba(55,38,120,0.12)',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
