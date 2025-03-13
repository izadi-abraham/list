/** @type {import('tailwindcss').Config} */


console.log('log inside tailwind.config.js')
export default {
  content:  [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Include Vue files and other extensions
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

