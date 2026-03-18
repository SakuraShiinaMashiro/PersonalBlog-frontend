/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#35bfab',
        primary: '#334f52',
        secondary: '#7b888e',
      },
      fontFamily: {
        display: ['"Averia Gruesa Libre"', 'cursive'],
      },
    },
  },
  plugins: [],
}
