/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF004D",
          50: "#ffe5ef",
          100: "#ffb3cc",
          200: "#ff80a8",
          300: "#ff4d85",
          400: "#ff1a61",
          500: "#FF004D",
          600: "#cc003e",
          700: "#99002e",
          800: "#66001f",
          900: "#33000f",
        },
      },
    },
  },
  plugins: [],
};
