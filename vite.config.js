import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Moderne browsers (2021+); nodig met esbuild 0.28, dat oudere targets niet meer volledig omzet.
  build: { target: "es2022" },
});
