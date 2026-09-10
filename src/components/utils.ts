/** Create a stylesheet that can be shared by multiple shadow roots. */
export function createStyleSheet(cssText: string): CSSStyleSheet {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssText);
  return styleSheet;
}

/** Return the host's existing shadow root or create one. */
export function createShadowRoot(shadowHost: HTMLElement): ShadowRoot {
  const shadowRoot = shadowHost.shadowRoot ?? shadowHost.attachShadow({ mode: "open" });
  return shadowRoot;
}
