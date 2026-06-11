import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { spawnSync } from "node:child_process";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const gitCommit =
  spawnSync("git", ["rev-parse", "--short", "HEAD"]).stdout.toString().trim() || "unknown";
const buildAtUtc =
  process.env.BUILD_AT_UTC || new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const buildAtParis =
  process.env.BUILD_AT_PARIS ||
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace("T", " ");
const buildId =
  process.env.BUILD_ID || process.env.GITHUB_RUN_ID || process.env.VERCEL_GIT_COMMIT_SHA || gitCommit;

export default defineConfig({
  plugins: [vue()],
  define: {
    __GIT_COMMIT__: JSON.stringify(gitCommit),
    __BUILD_ID__: JSON.stringify(buildId),
    __BUILD_AT_PARIS__: JSON.stringify(buildAtParis),
    __BUILD_AT_UTC__: JSON.stringify(buildAtUtc),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "src": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: resolve(process.cwd(), "dist/tauri"),
    emptyOutDir: true,
  },
});
