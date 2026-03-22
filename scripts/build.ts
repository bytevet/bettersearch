import { build, type InlineConfig } from "vite";
import { cpSync, mkdirSync, existsSync, rmSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const watch = process.argv.includes("--watch");

const iifeEntries = [
  { entry: "src/content/index.ts", name: "content", fileName: "content.js" },
  { entry: "src/background/service-worker.ts", name: "serviceWorker", fileName: "service-worker.js" },
];

function makeIifeConfig(
  entry: string,
  name: string,
  fileName: string,
  watchMode: boolean,
): InlineConfig {
  return {
    configFile: false,
    resolve: { alias: { "@": resolve(root, "src") } },
    build: {
      outDir: dist,
      emptyOutDir: false,
      lib: {
        entry: resolve(root, entry),
        name,
        formats: ["iife"],
        fileName: () => fileName,
      },
      rollupOptions: { output: { extend: true } },
      watch: watchMode ? {} : null,
    },
  };
}

function copyStaticAssets() {
  const nestedHtml = resolve(dist, "src/sidepanel/sidepanel.html");
  if (existsSync(nestedHtml)) {
    let html = readFileSync(nestedHtml, "utf-8");
    html = html.replace(/src="\.\.\/\.\.\/"/g, 'src="./').replace(/href="\.\.\/\.\.\/"/g, 'href="./');
    html = html.replace(/\.\.\/\.\.\//g, "./");
    writeFileSync(resolve(dist, "sidepanel.html"), html);
    rmSync(resolve(dist, "src"), { recursive: true, force: true });
  }

  cpSync(resolve(root, "public/manifest.json"), resolve(dist, "manifest.json"));

  const iconsDir = resolve(root, "public/icons");
  if (existsSync(iconsDir)) {
    mkdirSync(resolve(dist, "icons"), { recursive: true });
    cpSync(iconsDir, resolve(dist, "icons"), { recursive: true });
  }
}

// Side panel (React app) — uses vite.config.ts
await build({ configFile: resolve(root, "vite.config.ts") });

// IIFE builds for content script and service worker
for (const { entry, name, fileName } of iifeEntries) {
  await build(makeIifeConfig(entry, name, fileName, false));
}

copyStaticAssets();
console.log("Build complete → dist/");

if (watch) {
  console.log("Watching for changes...");
  build({
    configFile: resolve(root, "vite.config.ts"),
    build: { watch: {} },
    plugins: [{
      name: "copy-assets-on-rebuild",
      closeBundle() { copyStaticAssets(); },
    }],
  });
  for (const { entry, name, fileName } of iifeEntries) {
    build(makeIifeConfig(entry, name, fileName, true));
  }
}
