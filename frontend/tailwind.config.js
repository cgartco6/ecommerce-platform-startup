/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e6e8f0',
          100: '#cdd1e1',
          200: '#9ba3c3',
          300: '#6975a5',
          400: '#374787',
          500: '#051969',
          600: '#041454',
          700: '#030f3f',
          800: '#020a2a',
          900: '#010515',
        },
        primary: '#1E3A8A',
        secondary: '#3B82F6',
        accent: '#60A5FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
