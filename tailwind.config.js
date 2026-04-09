/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        'daf-teal': '#2DAABF',
        'daf-brown': '#4A2C1F',
        'daf-purple': '#9f3aff',
        'daf-bg': '#F5F5F5',
      },
      backgroundColor: {
        'daf-teal': '#2DAABF',
        'daf-brown': '#4A2C1F',
        'daf-purple': '#9f3aff',
        'daf-bg': '#F5F5F5',
      },
      textColor: {
        'daf-teal': '#2DAABF',
        'daf-brown': '#4A2C1F',
        'daf-purple': '#9f3aff',
      },
    },
  },
  plugins: [],
}

