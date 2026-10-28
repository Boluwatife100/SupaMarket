/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#D6F9DD', // page background
        mint: '#99F7AB',  // accent: buttons, highlights
        moss: '#60695C',  // secondary text, borders
        ink: '#262B23',   // main text (a darker shade of moss, for contrast)
        fg: '#262B23',
        mist: '#60695C',
        danger: '#B4443A'
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      transitionTimingFunction: { 'expo-out': 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        pageIn: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { to: { transform: 'translateX(100%)' } },
        bump: { '30%': { transform: 'scale(1.5)' }, '100%': { transform: 'scale(1)' } },
        toastIn: { from: { opacity: '0', transform: 'translateX(40px)' } },
        toastOut: { to: { opacity: '0', transform: 'translateX(40px)' } }
      },
      animation: {
        'page-in': 'pageIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.8s infinite',
        bump: 'bump 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
        'toast-in': 'toastIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'toast-out': 'toastOut 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards'
      }
    }
  },
  plugins: []
};
