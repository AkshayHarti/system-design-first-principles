import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the same build works on GitHub Pages, Cloudflare Pages,
// and `file://`-ish previews without config changes.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
