import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/content/index.ts"),
      name: "content",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
