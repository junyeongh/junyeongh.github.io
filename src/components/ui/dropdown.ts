import styles from "./dropdown.css?inline";
import { createShadowRoot, createStyleSheet } from "../../lib/components";

const styleSheet = createStyleSheet(styles);

export type DropdownChangeEvent = CustomEvent<{ value: string }>;

type DropdownOption = {
  value: string;
  label: string;
};

const CHEVRON = `<svg part="chevron" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3 4.75 6 7.75l3-3" fill="none" stroke="currentColor" stroke-width="1.25"
      stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;

function readOptions(host: HTMLElement): DropdownOption[] {
  return [...host.querySelectorAll("option")].map((option) => ({
    value: option.value,
    label: (option.textContent ?? "").trim() || option.value,
  }));
}

/**
 * <ui-dropdown label="Display language" value="en" align="end">
 *   <option value="en">English</option>
 *   <option value="ko">한국어</option>
 * </ui-dropdown>
 *
 * Choices are declared as light-DOM <option> children and rendered into the
 * shadow root as a menu button. Picking one reflects `value` on the host and
 * emits a bubbling `change` event carrying `detail.value`.
 * `label` names the control for assistive technology; `align="end"` anchors the
 * menu to the trailing edge.
 */
export class UIDropdown extends HTMLElement {
  static observedAttributes = ["value"];

  #trigger: HTMLButtonElement | null = null;
  #label: HTMLElement | null = null;
  #menu: HTMLElement | null = null;
  #items: HTMLButtonElement[] = [];

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    this.setAttribute("value", next);
  }

  get open(): boolean {
    return this.#menu !== null && !this.#menu.hidden;
  }

  connectedCallback() {
    if (!this.#trigger) {
      this.#render();
    }
    document.addEventListener("pointerdown", this.#onDocumentPointerDown);
  }

  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.#onDocumentPointerDown);
  }

  attributeChangedCallback(name: string) {
    if (name === "value") {
      this.#syncSelection();
    }
  }

  #render() {
    const shadowRoot = createShadowRoot(this);
    shadowRoot.adoptedStyleSheets = [styleSheet];
    shadowRoot.innerHTML = `<button part="trigger" type="button" aria-haspopup="menu" aria-expanded="false">
        <span part="label"></span>${CHEVRON}
      </button>
      <div part="menu" role="menu" hidden></div>`;

    const trigger = shadowRoot.querySelector("button");
    const label = shadowRoot.querySelector<HTMLElement>('[part="label"]');
    const menu = shadowRoot.querySelector<HTMLElement>('[part="menu"]');
    if (!trigger || !label || !menu) {
      return;
    }

    const accessibleName = this.getAttribute("label");
    if (accessibleName) {
      trigger.setAttribute("aria-label", accessibleName);
      menu.setAttribute("aria-label", accessibleName);
    }

    this.#items = readOptions(this).map((option) => {
      const item = document.createElement("button");
      item.setAttribute("part", "item");
      item.setAttribute("role", "menuitemradio");
      item.setAttribute("aria-checked", "false");
      item.type = "button";
      item.tabIndex = -1;
      item.dataset.value = option.value;
      item.textContent = option.label;
      item.addEventListener("click", () => this.#select(option.value));
      menu.append(item);
      return item;
    });

    trigger.addEventListener("click", () => this.#setOpen(!this.open));
    trigger.addEventListener("keydown", this.#onTriggerKeyDown);
    menu.addEventListener("keydown", this.#onMenuKeyDown);

    this.#trigger = trigger;
    this.#label = label;
    this.#menu = menu;
    this.#syncSelection();
  }

  /** Mirror the current `value` onto the trigger label and the checked item. */
  #syncSelection() {
    if (!this.#label) {
      return;
    }
    const selected = this.#items.find((item) => item.dataset.value === this.value) ?? this.#items[0];
    for (const item of this.#items) {
      item.setAttribute("aria-checked", String(item === selected));
    }
    this.#label.textContent = selected?.textContent ?? this.getAttribute("label") ?? "";
  }

  #select(value: string) {
    this.value = value;
    this.#setOpen(false);
    this.#trigger?.focus();

    const event: DropdownChangeEvent = new CustomEvent("change", {
      detail: { value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  #setOpen(open: boolean) {
    if (!this.#menu || !this.#trigger) {
      return;
    }
    this.#menu.hidden = !open;
    this.#trigger.setAttribute("aria-expanded", String(open));

    if (open) {
      const checked = this.#items.find((item) => item.getAttribute("aria-checked") === "true");
      (checked ?? this.#items[0])?.focus();
    }
  }

  #focusItem(index: number) {
    const { length } = this.#items;
    if (length === 0) {
      return;
    }
    this.#items[(index + length) % length]?.focus();
  }

  #onTriggerKeyDown = (event: KeyboardEvent) => {
    // Enter and Space already reach the click handler.
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.#setOpen(true);
    }
  };

  #onMenuKeyDown = (event: KeyboardEvent) => {
    const current = this.#items.findIndex((item) => item === event.target);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.#focusItem(current + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.#focusItem(current - 1);
        break;
      case "Home":
        event.preventDefault();
        this.#focusItem(0);
        break;
      case "End":
        event.preventDefault();
        this.#focusItem(this.#items.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        this.#setOpen(false);
        this.#trigger?.focus();
        break;
      case "Tab":
        this.#setOpen(false);
        break;
      default:
        break;
    }
  };

  #onDocumentPointerDown = (event: Event) => {
    if (this.open && !event.composedPath().includes(this)) {
      this.#setOpen(false);
    }
  };
}

if (!customElements.get("ui-dropdown")) {
  customElements.define("ui-dropdown", UIDropdown);
}
