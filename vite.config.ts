import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const componentsDirectory = fileURLToPath(new URL("./src/components/", import.meta.url));
const stylesDirectory = fileURLToPath(new URL("./src/styles/", import.meta.url));

const routesDirectory = fileURLToPath(new URL("./src/routes/", import.meta.url));
const routeEntries = readdirSync(routesDirectory, { recursive: true, encoding: "utf8" })
  .filter((entry) => entry.endsWith(".html"))
  .map((entry) => resolve(routesDirectory, entry));

if (routeEntries.length === 0) {
  throw new Error(`No .html routes found in ${routesDirectory}`);
}

const publicDirectory = fileURLToPath(new URL("./public/", import.meta.url));
const outputDirectory = fileURLToPath(new URL("./dist/", import.meta.url));

export default defineConfig({
  root: routesDirectory,
  appType: "mpa",
  publicDir: publicDirectory,
  resolve: {
    alias: {
      "/components": componentsDirectory,
      "/styles": stylesDirectory,
    },
  },
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    rollupOptions: {
      input: routeEntries,
    },
  },
});
