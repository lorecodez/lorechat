/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-mono': 'Space Mono',
        'space-grotesk': 'Space Grotesk'
      }
    },
  },
  plugins: [],
}

