import styles from "./footer.css?inline";
import { createShadowRoot, createStyleSheet } from "../utils";

const styleSheet = createStyleSheet(styles);

export class LayoutFooter extends HTMLElement {
  connectedCallback() {
    const shadowRoot = createShadowRoot(this);
    shadowRoot.adoptedStyleSheets = [styleSheet];
    shadowRoot.innerHTML = `<p>&copy; ${new Date().getFullYear()} Junyeong Heo &middot;
      <a href="https://github.com/junyeongh">GitHub</a></p>`;
  }
}

if (!customElements.get("layout-footer")) {
  customElements.define("layout-footer", LayoutFooter);
}
