/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // AgroCare brand palette — earthy, farm-appropriate
        agro: {
          50:  "#f4faf6",
          100: "#e2f3ea",
          200: "#b0f0d6",
          300: "#80bea6",
          400: "#4d9b79",
          500: "#2b6954",
          600: "#003527",
          700: "#064e3b",
          800: "#002117",
          900: "#00150e",
        },
        earth: {
          50:  "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",  // warm yellow
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
        risk: {
          low:      "#22c55e",
          medium:   "#f59e0b",
          high:     "#ef4444",
          critical: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Hanken Grotesk", "Inter", "ui-sans-serif", "system-ui"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
