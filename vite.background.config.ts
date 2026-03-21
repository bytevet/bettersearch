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
      entry: resolve(__dirname, "src/background/service-worker.ts"),
      name: "serviceWorker",
      formats: ["iife"],
      fileName: () => "service-worker.js",
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
