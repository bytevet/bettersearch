import { execSync } from "child_process";
import { cpSync, mkdirSync, existsSync, renameSync, rmSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

const run = (cmd: string) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
};

// Build side panel (React app) — this empties dist/
run("npx vite build --config vite.config.ts");

// Build content script (IIFE) — emptyOutDir: false
run("npx vite build --config vite.content.config.ts");

// Build service worker (IIFE) — emptyOutDir: false
run("npx vite build --config vite.background.config.ts");

// Move sidepanel.html to dist root and fix asset paths
const nestedHtml = resolve(dist, "src/sidepanel/sidepanel.html");
if (existsSync(nestedHtml)) {
  let html = readFileSync(nestedHtml, "utf-8");
  html = html.replace(/src="\.\.\/\.\.\/"/g, 'src="./').replace(/href="\.\.\/\.\.\/"/g, 'href="./');
  html = html.replace(/\.\.\/\.\.\//g, "./");
  writeFileSync(resolve(dist, "sidepanel.html"), html);
  rmSync(resolve(dist, "src"), { recursive: true, force: true });
}

// Copy manifest.json
cpSync(resolve(root, "public/manifest.json"), resolve(dist, "manifest.json"));

// Copy icons
const iconsDir = resolve(root, "public/icons");
if (existsSync(iconsDir)) {
  mkdirSync(resolve(dist, "icons"), { recursive: true });
  cpSync(iconsDir, resolve(dist, "icons"), { recursive: true });
}

console.log("Build complete → dist/");
