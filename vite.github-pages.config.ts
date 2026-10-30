import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@tanstack/react-start": resolve("src/lib/github-pages-start.ts"),
    },
  },
  build: {
    outDir: ".output/public",
    emptyOutDir: true,
  },
});
