import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#11213a',
        tide: '#2f5f5c',
        paper: '#f2efe7',
        ember: '#d96c3c',
        mist: '#d9e4dd',
      },
      boxShadow: {
        card: '0 10px 30px rgba(17, 33, 58, 0.08)',
      },
      animation: {
        rise: 'rise 0.6s ease-out forwards',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
