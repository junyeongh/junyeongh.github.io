/* ------------------------------------------------------------------
   Custom elements for the site chrome and reusable interactive UI.
   No build step, no dependencies. Each component owns its styles in a
   shadow root and reads design tokens from :root in /style.css.
   ------------------------------------------------------------------ */

/** Attach a shadow root and fill it in one go. */
function shadow(host, html) {
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = html;
  return root;
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "https://junyeongh.github.io/blog", label: "Blog" },
];

class LayoutHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") ?? "";

    const links = NAV.map(({ href, label }) => {
      const isCurrent = label.toLowerCase() === current.toLowerCase();
      return `<a href="${href}"${isCurrent ? ' aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    shadow(
      this,
      `<style>
        :host {
          display: block;
          max-width: var(--layout-content-measure);
          margin: 0 auto 3.5rem;
          font-family: var(--font-family-body);
        }
        .name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .name a {
          color: var(--color-text-primary);
          text-decoration: none;
        }
        nav {
          margin-top: 0.35rem;
          font-size: 0.9375rem;
        }
        a {
          color: var(--color-text-secondary);
          text-underline-offset: 0.2em;
          text-decoration-thickness: 0.5px;
        }
        nav a { margin-right: 1rem; }
        nav a:last-child { margin-right: 0; }
        a:hover { text-decoration-thickness: 1.5px; }
        [aria-current="page"] {
          color: var(--color-text-primary);
          text-decoration-thickness: 1px;
        }
      </style>
      <p class="name"><a href="/">Junyeong Heo</a></p>
      <nav aria-label="Primary">${links}</nav>`,
    );
  }
}

class LayoutFooter extends HTMLElement {
  connectedCallback() {
    shadow(
      this,
      `<style>
        :host {
          display: block;
          max-width: var(--layout-content-measure);
          margin: 4rem auto 0;
          padding-top: 1.25rem;
          border-top: 1px solid var(--color-border-subtle);
          color: var(--color-text-secondary);
          font-family: var(--font-family-body);
          font-size: var(--font-size-caption);
        }
        a { color: inherit; text-underline-offset: 0.2em; }
      </style>
      <p>&copy; ${new Date().getFullYear()} Junyeong Heo &middot;
        <a href="https://github.com/junyeongh">GitHub</a></p>`,
    );
  }
}

/**
 * <ui-button href="/about/" variant="solid">About</ui-button>
 * Renders an anchor when href is set, a native button otherwise.
 * Variants: solid, secondary, outline, destructive, ghost.
 */
class UIButton extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute("href");
    const requestedVariant = this.getAttribute("variant") ?? "solid";
    const variants = new Set(["solid", "secondary", "outline", "destructive", "ghost"]);
    const variant = variants.has(requestedVariant) ? requestedVariant : "solid";

    const control = href
      ? `<a part="control" class="${variant}" href="${href}"><slot></slot></a>`
      : `<button part="control" class="${variant}" type="button"><slot></slot></button>`;

    shadow(
      this,
      `<style>
        :host { display: inline-block; }
        a, button {
          box-sizing: border-box;
          display: inline-block;
          padding: 0.55rem 1rem;
          border: 1px solid transparent;
          border-radius: var(--radius-control);
          font: inherit;
          font-family: var(--font-family-body);
          font-size: var(--font-size-control);
          line-height: 1.2;
          text-decoration: none;
          cursor: pointer;
        }
        .solid {
          border-color: var(--color-action-primary-background);
          background: var(--color-action-primary-background);
          color: var(--color-action-primary-foreground);
        }
        .secondary {
          border-color: var(--color-action-secondary-border);
          background: var(--color-action-secondary-background);
          color: var(--color-action-secondary-foreground);
        }
        .outline {
          border-color: var(--color-action-outline-border);
          background: transparent;
          color: var(--color-action-outline-foreground);
        }
        .destructive {
          border-color: var(--color-action-destructive-background);
          background: var(--color-action-destructive-background);
          color: var(--color-action-destructive-foreground);
        }
        .ghost {
          background: transparent;
          color: var(--color-action-ghost-foreground);
        }
        a:hover, button:hover { opacity: 0.85; }
        a:focus-visible, button:focus-visible {
          outline: 2px solid var(--color-focus-outline);
          outline-offset: 2px;
        }
      </style>
      ${control}`,
    );
  }
}

customElements.define("layout-header", LayoutHeader);
customElements.define("layout-footer", LayoutFooter);
customElements.define("ui-button", UIButton);
