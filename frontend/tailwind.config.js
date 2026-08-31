/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mandal: {
          bg: '#0B0B0F',
          card: '#14141C',
          cardHover: '#1B1B26',
          border: '#2A2735',
          gold: {
            DEFAULT: '#D4AF37',
            light: '#F3E5AB',
            dark: '#9A7B1C',
            accent: '#FFD700'
          },
          saffron: {
            DEFAULT: '#E65100',
            light: '#FF7D3B',
            dark: '#B23B00',
            glow: '#FF5722'
          },
          cream: '#FDFBF7',
          red: {
            DEFAULT: '#B91C1C',
            dark: '#7F1D1D'
          },
          muted: '#8E8EA0'
        }
      },
      fontFamily: {
        devanagari: ['"Noto Sans Devanagari"', '"Mukta"', 'sans-serif'],
        heading: ['"Outfit"', '"Noto Sans Devanagari"', 'sans-serif'],
        body: ['"Inter"', '"Noto Sans Devanagari"', 'sans-serif']
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(212, 175, 55, 0.15)',
        'gold-md': '0 0 20px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 0 30px rgba(212, 175, 55, 0.35)',
        'saffron-sm': '0 0 12px rgba(230, 81, 0, 0.25)',
        'saffron-md': '0 0 24px rgba(230, 81, 0, 0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #FFF3B0 50%, #B89020 100%)',
        'saffron-gradient': 'linear-gradient(135deg, #FF7D3B 0%, #E65100 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(27, 27, 38, 0.8) 0%, rgba(20, 20, 28, 0.95) 100%)'
      }
    },
  },
  plugins: [],
}
