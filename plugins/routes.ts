import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import type { Plugin } from "vite";

/* ------------------------------------------------------------------
  File-based routes, kept in src/routes/.

  Vite serves an HTML file at its path relative to the config root, so
  the root has to stay src/ — that is what the `/styles/...` and
  `/components/...` URLs inside a route resolve against, in dev and in
  the build alike. Left alone that would publish the routes under
  /routes/, so this plugin folds the directory away on both sides: dev
  rewrites /about to /routes/about.html, and the build renames
  routes/about.html back to about.html on the way out.
   ------------------------------------------------------------------ */

const routesDirectory = fileURLToPath(new URL("../src/routes/", import.meta.url));
const ROUTES_PREFIX = "routes/";

/** Absolute path of every route, for `build.rolldownOptions.input`. */
export function routeEntries(): string[] {
  const entries = readdirSync(routesDirectory, { recursive: true, encoding: "utf8" })
    .filter((entry) => entry.endsWith(".html"))
    .map((entry) => resolve(routesDirectory, entry));

  if (entries.length === 0) {
    throw new Error(`No .html routes found in ${routesDirectory}`);
  }

  return entries;
}

/**
 * The route file a request path asks for, as a root-relative URL, or null
 * when no route matches and the request belongs to someone else.
 */
function routeFor(pathname: string): string | null {
  let candidate: string;
  try {
    candidate = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (candidate.endsWith("/")) {
    candidate += "index.html";
  } else if (!candidate.endsWith(".html")) {
    // GitHub Pages serves /about from about.html; match that in dev.
    candidate += ".html";
  }

  const file = resolve(routesDirectory, `.${candidate}`);
  if (!file.startsWith(routesDirectory) || !existsSync(file)) {
    return null;
  }

  return `/${ROUTES_PREFIX}${candidate.slice(1)}`;
}

export function routes(): Plugin {
  return {
    name: "site-routes",

    // No returned function, so this lands ahead of Vite's html middleware.
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const url = request.url ?? "/";
        const queryIndex = url.search(/[?#]/);
        const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex);
        const query = queryIndex === -1 ? "" : url.slice(queryIndex);

        const route = routeFor(pathname);
        if (route) {
          request.url = `${route}${query}`;
        }

        next();
      });
    },

    generateBundle: {
      // `post`, so Vite's html plugin has emitted the routes by now.
      order: "post",
      handler(_options, bundle) {
        for (const [fileName, output] of Object.entries(bundle)) {
          if (!fileName.startsWith(ROUTES_PREFIX) || !fileName.endsWith(".html") || output.type !== "asset") {
            continue;
          }

          const flattened = fileName.slice(ROUTES_PREFIX.length);
          if (bundle[flattened]) {
            throw new Error(`Route "${fileName}" collides with "${flattened}" in the build output`);
          }

          delete bundle[fileName];
          this.emitFile({ type: "asset", fileName: flattened, source: output.source });
        }
      },
    },
  };
}
