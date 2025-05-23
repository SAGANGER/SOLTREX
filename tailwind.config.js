/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
     colors: {
        'space-dark': '#000000',
        'space-light': '#000000',
        'space-accent': '#ffffff',
        'space-accent-light': '#ffffff',
        'space-text': '#ffffff',
        'space-text-light': '#ffffff',
      },
fontFamily: {
        sans: ['"Baloo 2"', 'sans-serif'],
        mono: ['"Baloo 2"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 4s infinite',
        'float': 'float 4s ease-in-out infinite',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px 2px rgba(153, 69, 255, 0.1)' },
          '50%': { boxShadow: '0 0 15px 5px rgba(153, 69, 255, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'space-gradient': "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('https://i.imgur.com/AkQRckz.png')",
      },
    },
  },
  plugins: [],
};
