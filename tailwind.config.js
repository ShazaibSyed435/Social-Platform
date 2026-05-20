/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172026',
        mist: '#F5F7FA',
        line: '#DDE3EA',
        brand: {
          50: '#EEF7FF',
          100: '#D9EEFF',
          500: '#1877F2',
          600: '#0D65D9',
          700: '#0A55B8',
        },
        coral: '#F26D5B',
        teal: '#0FA3B1',
        gold: '#E0A526',
      },
      boxShadow: {
        panel: '0 12px 40px rgba(23, 32, 38, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
