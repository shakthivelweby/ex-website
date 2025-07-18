/** @type {import('tailwindcss').Config} */
/* eslint-disable */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out forwards',
      },
      colors: {
        // primary: {
        //   DEFAULT: "#FF004D",
        //   50: "#ffe5ef",
        //   100: "#ffb3cc",
        //   200: "#ff80a8",
        //   300: "#ff4d85",
        //   400: "#ff1a61",
        //   500: "#FF004D",
        //   600: "#cc003e",
        //   700: "#99002e",
        //   800: "#66001f",
        //   900: "#33000f",
        // },
        primary: {
          DEFAULT: "#069494",
          50: "#e6f7f7",
          100: "#b3e6e6",
          200: "#80d4d4",
          300: "#4dc3c3",
          400: "#1ab2b2",
          500: "#069494",
          600: "#057676",
          700: "#045858",
          800: "#023a3a",
          900: "#011c1c",
        },
      },
    },
  },
  plugins: [],
};
