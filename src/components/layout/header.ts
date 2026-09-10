import styles from "./header.css?inline";
import { createShadowRoot, createStyleSheet } from "../utils";

type NavItem = {
  href: string;
  label: string;
};

const NAV: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "https://junyeongh.github.io/blog", label: "Blog" },
];

const styleSheet = createStyleSheet(styles);

export class LayoutHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") ?? "";

    const links = NAV.map(({ href, label }) => {
      const isCurrent = label.toLowerCase() === current.toLowerCase();
      return `<a href="${href}"${isCurrent ? ' aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    const shadowRoot = createShadowRoot(this);
    shadowRoot.adoptedStyleSheets = [styleSheet];
    shadowRoot.innerHTML = `<p class="name"><a href="/">Junyeong Heo</a></p>
      <nav aria-label="Primary">${links}</nav>`;
  }
}

if (!customElements.get("layout-header")) {
  customElements.define("layout-header", LayoutHeader);
}
