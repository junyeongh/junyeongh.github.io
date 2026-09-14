import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { content } from "./plugins/content.ts";
import { routeEntries, routes } from "./plugins/routes.ts";

const sourceDirectory = fileURLToPath(new URL("./src/", import.meta.url));
const publicDirectory = fileURLToPath(new URL("./public/", import.meta.url));
const outputDirectory = fileURLToPath(new URL("./dist/", import.meta.url));

export default defineConfig({
  root: sourceDirectory,
  appType: "mpa",
  plugins: [routes(), content()],
  publicDir: publicDirectory,
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    rolldownOptions: {
      input: routeEntries(),
    },
  },
});
