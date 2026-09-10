import styles from "./button.css?inline";
import { createShadowRoot, createStyleSheet } from "../utils";

const BUTTON_VARIANTS = ["solid", "secondary", "outline", "destructive", "ghost"] as const;
type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

const styleSheet = createStyleSheet(styles);

function isButtonVariant(value: string): value is ButtonVariant {
  return BUTTON_VARIANTS.some((variant) => variant === value);
}

/**
 * <ui-button href="/about/" variant="solid">About</ui-button>
 * Renders an anchor when href is set, a native button otherwise.
 * Variants: solid, secondary, outline, destructive, ghost.
 */
export class UIButton extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute("href");
    const requestedVariant = this.getAttribute("variant") ?? "solid";
    const variant = isButtonVariant(requestedVariant) ? requestedVariant : "solid";

    const control = href
      ? `<a part="control" class="${variant}" href="${href}"><slot></slot></a>`
      : `<button part="control" class="${variant}" type="button"><slot></slot></button>`;

    const shadowRoot = createShadowRoot(this);
    shadowRoot.adoptedStyleSheets = [styleSheet];
    shadowRoot.innerHTML = control;
  }
}

if (!customElements.get("ui-button")) {
  customElements.define("ui-button", UIButton);
}
