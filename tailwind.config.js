// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        floatX: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(120px)" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-100px)" },
        },
        floatDiagonal: {
          "0%": { transform: "translate(0,0) rotate(-10deg)" },
          "25%": { transform: "translate(150px,-80px) rotate(10deg)" },
          "50%": { transform: "translate(-120px,100px) rotate(-5deg)" },
          "75%": { transform: "translate(80px,-120px) rotate(5deg)" },
          "100%": { transform: "translate(0,0) rotate(-10deg)" },
        },
      },
      animation: {
        floatX: "floatX 18s ease-in-out infinite",
        floatY: "floatY 22s ease-in-out infinite",
        floatDiagonal: "floatDiagonal 25s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};