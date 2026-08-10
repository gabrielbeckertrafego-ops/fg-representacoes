import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";
import tailwindConfig from "./tailwind.config.js";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwind(tailwindConfig), autoprefixer()],
    },
  },
});
