import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [join(root, "index.html"), join(root, "src/**/*.{ts,tsx}")],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FBF7EC",
          100: "#F4E9C8",
          200: "#E9D399",
          300: "#DEBD6A",
          400: "#D4AA4C",
          500: "#C9A24B",
          600: "#B4863A",
          700: "#8F6A2E",
          800: "#6B4F23",
          900: "#4A3717",
        },
        graphite: {
          50: "#F5F5F6",
          100: "#E7E7E9",
          200: "#C9C9CE",
          300: "#A3A3AB",
          400: "#71717A",
          500: "#52525B",
          600: "#3F3F46",
          700: "#2E2E34",
          800: "#1F1F24",
          900: "#141417",
        },
        cream: "#FBFAF7",
        ink: "#0C0C0F",
        night: "#131318",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(120deg, #B4863A 0%, #E9D399 30%, #C9A24B 55%, #F4E9C8 75%, #B4863A 100%)",
        "gold-soft":
          "linear-gradient(135deg, #F4E9C8 0%, #DEBD6A 100%)",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(20, 20, 23, 0.18)",
        gold: "0 12px 40px -10px rgba(180, 134, 58, 0.45)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
