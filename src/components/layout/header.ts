import styles from "./header.css?inline";
import { createShadowRoot, createStyleSheet } from "../../lib/components";
import { UIDropdown, type DropdownChangeEvent } from "../ui/dropdown";
import {
  LANGUAGES,
  LANGUAGE_LABELS,
  getLanguage,
  isLanguage,
  localizeLinks,
  onLanguageChange,
  setLanguage,
  type Language,
} from "../../lib/i18n";

type NavItem = {
  href: string;
  label: string;
};

const NAV: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "https://junyeongh.github.io/blog", label: "Blog" },
];

const LANGUAGE_CONTROL_LABEL = "Display language";

const styleSheet = createStyleSheet(styles);

export class LayoutHeader extends HTMLElement {
  #unsubscribe: (() => void) | null = null;

  connectedCallback() {
    const current = this.getAttribute("current") ?? "";

    const links = NAV.map(({ href, label }) => {
      const isCurrent = label.toLowerCase() === current.toLowerCase();
      return `<a href="${href}"${isCurrent ? ' aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    const shadowRoot = createShadowRoot(this);
    shadowRoot.adoptedStyleSheets = [styleSheet];
    shadowRoot.innerHTML = `<div class="brand">
        <p class="name"><a href="/">Junyeong Heo</a></p>
        <nav aria-label="Primary">${links}</nav>
      </div>`;

    const dropdown = this.#createLanguageDropdown();
    shadowRoot.append(dropdown);

    // The nav lives in this shadow root, so it needs localizing on its own.
    const localize = (language: Language) => {
      dropdown.value = language;
      localizeLinks(shadowRoot, language);
    };

    localize(getLanguage());
    this.#unsubscribe = onLanguageChange(localize);
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
  }

  /** The language switcher. Selecting a language rewrites `?lang` in the URL. */
  #createLanguageDropdown(): UIDropdown {
    const dropdown = new UIDropdown();

    // Choices are read from the light DOM on connect, so fill them in first.
    for (const language of LANGUAGES) {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = LANGUAGE_LABELS[language];
      dropdown.append(option);
    }

    dropdown.setAttribute("label", LANGUAGE_CONTROL_LABEL);
    dropdown.setAttribute("align", "end");

    dropdown.addEventListener("change", (event) => {
      const { value } = (event as DropdownChangeEvent).detail;
      if (isLanguage(value)) {
        setLanguage(value);
      }
    });

    return dropdown;
  }
}

if (!customElements.get("layout-header")) {
  customElements.define("layout-header", LayoutHeader);
}
