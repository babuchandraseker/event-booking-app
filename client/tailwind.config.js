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
          DEFAULT: '#D7AC28',
          light: '#E8C55A',
          dark: '#C78D17',
          pale: 'rgba(215,172,40,0.1)',
        },
        vn: {
          black: '#F7F1FA',
          deep: '#EFE7F7',
          surface: '#F8F4FB',
          surface2: '#EFE7F7',
          surface3: 'rgba(255,255,255,0.72)',
          violet: '#481875',
          'violet-deep': '#3D0066',
          'violet-glow': '#8238B3',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 40px rgba(215,172,40,0.18)',
        'glow-gold-lg': '0 0 60px rgba(215,172,40,0.24)',
        'glow-violet': '0 0 60px rgba(130,56,179,0.16)',
        'glow-dual': '0 0 40px rgba(215,172,40,0.14), 0 0 80px rgba(130,56,179,0.1)',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      borderRadius: {
        luxury: '26px',
        'luxury-lg': '30px',
      },
    },
  },
  plugins: [],
}
