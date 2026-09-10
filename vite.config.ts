import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { content } from "./plugins/content.ts";

const sourceDirectory = fileURLToPath(new URL("./src/", import.meta.url));

const routeEntries = readdirSync(sourceDirectory, { recursive: true, encoding: "utf8" })
  .filter((entry) => entry.endsWith(".html"))
  .map((entry) => resolve(sourceDirectory, entry));

if (routeEntries.length === 0) {
  throw new Error(`No .html routes found in ${sourceDirectory}`);
}

const publicDirectory = fileURLToPath(new URL("./public/", import.meta.url));
const outputDirectory = fileURLToPath(new URL("./dist/", import.meta.url));

export default defineConfig({
  root: sourceDirectory,
  appType: "mpa",
  plugins: [content()],
  publicDir: publicDirectory,
  resolve: {
    alias: {
      "@": sourceDirectory,
    },
  },
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    rolldownOptions: {
      input: routeEntries,
    },
  },
});
