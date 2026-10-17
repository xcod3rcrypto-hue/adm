import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  // `dark:` follows the OS, unless the page is told otherwise via data-theme (e.g. when embedded).
  darkMode: [
    'variant',
    [
      "@media (prefers-color-scheme: dark) { &:not([data-theme='light'] *, [data-theme='light']) }",
      "&:is([data-theme='dark'] *, [data-theme='dark'])",
    ],
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#D4AF37', soft: '#E9D489', deep: '#A8862A' },
        cream: '#FAF7F2',
        emerald: { brand: '#0E5C4A', deep: '#093D31' },
        ink: '#0D0D0D',
        // `deep` keeps coral text at WCAG AA on cream/white, `soft` on the green/black quiz gradient;
        // the brand coral stays for fills and the black dark-mode background.
        coral: { DEFAULT: '#FF6B5A', deep: '#B83A2E', soft: '#FFB4AB' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'quiz-gradient': 'linear-gradient(160deg, #0D0D0D 0%, #0E5C4A 50%, #0D0D0D 100%)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
