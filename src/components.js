/* ------------------------------------------------------------------
   Custom elements for the site chrome and small UI bits.
   No build step, no dependencies. Each component owns its styles in a
   shadow root and reads design tokens from :root in /style.css.
   ------------------------------------------------------------------ */

/** Attach a shadow root and fill it in one go. */
function shadow(host, html) {
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = html;
  return root;
}

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: 'https://junyeongh.github.io/blog', label: 'Blog' },
];

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute('current') ?? '';

    const links = NAV.map(({ href, label }) => {
      const isCurrent = label.toLowerCase() === current.toLowerCase();
      return `<a href="${href}"${isCurrent ? ' aria-current="page"' : ''}>${label}</a>`;
    }).join('');

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
      <nav aria-label="Primary">${links}</nav>`
    );
  }
}

class SiteFooter extends HTMLElement {
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
        <a href="https://github.com/junyeongh">GitHub</a></p>`
    );
  }
}

/**
 * <x-avatar src="/assets/me.jpg" alt="Junyeong Heo" size="64">
 * Falls back to initials when no src is given.
 */
class XAvatar extends HTMLElement {
  static observedAttributes = ['src', 'alt', 'size', 'initials'];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    const src = this.getAttribute('src');
    const alt = this.getAttribute('alt') ?? '';
    const size = this.getAttribute('size') ?? '64';
    const initials = this.getAttribute('initials') ?? 'JH';

    const inner = src
      ? `<img src="${src}" alt="${alt}">`
      : `<span class="initials" role="img" aria-label="${alt || initials}">${initials}</span>`;

    const html = `<style>
        :host {
          display: inline-block;
          width: var(--size);
          height: var(--size);
          vertical-align: middle;
        }
        .frame {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-border-subtle);
          display: grid;
          place-items: center;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .initials {
          font-family: var(--font-family-body);
          font-size: calc(var(--size) * 0.36);
          font-weight: 600;
          color: var(--color-text-secondary);
          letter-spacing: 0.02em;
          user-select: none;
        }
      </style>
      <div class="frame">${inner}</div>`;

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = html;
    } else {
      shadow(this, html);
    }
    this.style.setProperty('--size', `${size}px`);
  }
}

/**
 * <x-button href="/about/">About</x-button>
 * Renders an anchor when href is set, a real <button> otherwise.
 */
class XButton extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute('href');
    const variant = this.getAttribute('variant') ?? 'solid';

    const tag = href
      ? `<a part="control" class="${variant}" href="${href}"><slot></slot></a>`
      : `<button part="control" class="${variant}" type="button"><slot></slot></button>`;

    shadow(
      this,
      `<style>
        :host { display: inline-block; }
        a, button {
          display: inline-block;
          font: inherit;
          font-family: var(--font-family-body);
          font-size: var(--font-size-control);
          line-height: 1.2;
          padding: 0.55rem 1rem;
          border-radius: var(--radius-control);
          border: 1px solid var(--color-action-primary-background);
          cursor: pointer;
          text-decoration: none;
        }
        .solid {
          background: var(--color-action-primary-background);
          color: var(--color-action-primary-foreground);
        }
        .ghost {
          background: transparent;
          color: var(--color-text-primary);
          border-color: var(--color-border-subtle);
        }
        a:hover, button:hover { opacity: 0.85; }
        a:focus-visible, button:focus-visible {
          outline: 2px solid var(--color-focus-outline);
          outline-offset: 2px;
        }
      </style>
      ${tag}`
    );
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
customElements.define('x-avatar', XAvatar);
customElements.define('x-button', XButton);
