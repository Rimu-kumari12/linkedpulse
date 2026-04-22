/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        pulse: '#0055ff',
        mint: '#00c986',
        amber: '#ffb800',
        danger: '#ff3b00',
        ink: '#0a0a0f',
        paper: '#f4f1eb',
      },
      animation: {
        'blink': 'blink 1.4s infinite',
        'sweep': 'sweep 1.8s linear infinite',
        'float': 'float 5s ease-in-out infinite',
        'ticker': 'ticker 20s linear infinite',
        'fadeUp': 'fadeUp 0.5s forwards',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.2 } },
        sweep: { 'to': { left: '140%' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        ticker: { 'from': { transform: 'translateX(0)' }, 'to': { transform: 'translateX(-50%)' } },
        fadeUp: { 'to': { opacity: 1, transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
