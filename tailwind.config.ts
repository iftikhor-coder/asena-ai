import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        oxanium: ['var(--font-oxanium)', 'Oxanium', 'sans-serif'],
      },
      colors: {
        dark: '#09090f',
        sidebar: '#0d0d16',
        card: '#13131f',
        input: '#18182a',
        border: '#252538',
        'text-primary': '#e8e8f2',
        'text-secondary': '#7777a0',
        cyan: '#00e5ff',
        purple: '#8b5cf6',
        green: '#22c55e',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 40px rgba(139,92,246,0.4)' },
          '50%': { boxShadow: '0 0 70px rgba(139,92,246,0.7), 0 0 110px rgba(6,182,212,0.3)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
