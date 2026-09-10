import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { parse } from "yaml";
import type { Plugin } from "vite";

/* ------------------------------------------------------------------
  Route copy, injected at build time.

  A route places a block with `<!-- content:lede -->`; the block is read
  from src/content/<route>.yaml and rendered as the `data-lang` markup
  that styles/base.css selects on. Keeping this at build time is what
  lets the right language paint immediately, with or without scripting.
   ------------------------------------------------------------------ */

const contentDirectory = fileURLToPath(new URL("../src/content/", import.meta.url));
const PLACEHOLDER = /<!--\s*content:([\w-]+)\s*-->/g;
const LINK_PLACEHOLDER = /\{([\w-]+)\}/g;

type LocalizedLink = {
  label: string;
  href: string;
};

/** Links available to `{name}` placeholders, by name and then language. */
type LinkTable = Record<string, Record<string, LocalizedLink>>;

/** The paragraphs of one block, by language. */
type Prose = Record<string, string[]>;

type RouteContent = {
  blocks: Record<string, Prose>;
  links: LinkTable;
};

const toPosix = (path: string) => path.replaceAll("\\", "/");

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

function readRouteContent(route: string): RouteContent | null {
  const file = resolve(contentDirectory, `${route}.yaml`);
  if (!existsSync(file)) {
    return null;
  }

  // Every top-level key is a block, except the reserved `links` table.
  const { links = {}, ...blocks } = parse(readFileSync(file, "utf8")) as { links?: LinkTable } & Record<string, Prose>;
  return { blocks, links };
}

/** Escape the prose, then swap `{name}` for that link in the current language. */
function renderParagraph(text: string, language: string, links: LinkTable): string {
  return escapeHtml(text).replace(LINK_PLACEHOLDER, (_placeholder, name: string) => {
    const link = links[name]?.[language];
    if (!link) {
      throw new Error(`No "${name}" link for language "${language}"`);
    }
    return `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`;
  });
}

function renderBlock(prose: Prose, links: LinkTable): string {
  return Object.entries(prose)
    .map(([language, paragraphs]) => {
      const body = paragraphs
        .map((text) => `<p>${renderParagraph(text, language, links)}</p>`)
        .join("\n        ");
      return `<div data-lang="${language}" lang="${language}">\n        ${body}\n      </div>`;
    })
    .join("\n      ");
}

export function content(): Plugin {
  return {
    name: "site-content",

    transformIndexHtml: {
      // `pre` so anything the content references still goes through Vite.
      order: "pre",
      handler(html, context) {
        const route = basename(context.filename, ".html");

        // Read per transform, so editing the YAML is picked up in dev.
        const routeContent = readRouteContent(route);

        return html.replace(PLACEHOLDER, (_placeholder, key: string) => {
          const block = routeContent?.blocks[key];
          if (!block) {
            throw new Error(`Missing content block "${key}" for route "${route}" (src/content/${route}.yaml)`);
          }
          return renderBlock(block, routeContent.links);
        });
      },
    },

    configureServer(server) {
      server.watcher.add(contentDirectory);
      server.watcher.on("change", (file) => {
        if (toPosix(file).startsWith(toPosix(contentDirectory))) {
          server.hot.send({ type: "full-reload" });
        }
      });
    },
  };
}
