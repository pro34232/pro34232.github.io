import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";

// GitHub project sites are served at /<repo>/, so match the main config's base
// logic; otherwise /assets/* 404 and the page renders unstyled.
const repository = process.env["GITHUB_REPOSITORY"]?.split("/")[1];
const isUserSite = repository?.endsWith(".github.io");
const base =
  process.env["GITHUB_ACTIONS"] && repository && !isUserSite ? `/${repository}/` : "/";

export default defineConfig({
  base,
  define: {
    "import.meta.env.GITHUB_PAGES": "true",
  },
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
