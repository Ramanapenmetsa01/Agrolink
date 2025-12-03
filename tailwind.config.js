/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669', // emerald-600
          light: '#34d399',   // emerald-400
          dark: '#047857',    // emerald-700
        },
        accent: '#84cc16',    // lime-500
      },
    },
  },
  plugins: [],
}
