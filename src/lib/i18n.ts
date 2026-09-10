/* ------------------------------------------------------------------
  Display language.

  The language lives in the URL (`?lang=ko`); English is the default and
  is left implicit. Translated markup stays in the HTML, tagged with
  `data-lang`, and is shown or hidden by the `[data-lang]` rules in
  styles/base.css keyed off `<html lang>` — so the right language renders
  on the first paint, with or without scripting.
   ------------------------------------------------------------------ */

export const LANGUAGES = ["en", "ko"] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  ko: "한국어",
};

export const LANGUAGE_CHANGE_EVENT = "ui:languagechange";
export type LanguageChangeEvent = CustomEvent<{ language: Language }>;

const QUERY_KEY = "lang";

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGES.some((language) => language === value);
}

/** The language asked for by `?lang=`, or the default when it is missing or unknown. */
export function getLanguage(search: string = window.location.search): Language {
  const requested = new URLSearchParams(search).get(QUERY_KEY);
  return isLanguage(requested) ? requested : DEFAULT_LANGUAGE;
}

/** Reflect a language on `<html lang>`, which is what the CSS selects on. */
export function applyLanguage(language: Language): void {
  document.documentElement.lang = language;
}

/** Switch language: update `<html lang>`, rewrite the URL, notify listeners. */
export function setLanguage(language: Language): void {
  applyLanguage(language);

  const url = new URL(window.location.href);
  if (language === DEFAULT_LANGUAGE) {
    url.searchParams.delete(QUERY_KEY);
  } else {
    url.searchParams.set(QUERY_KEY, language);
  }
  window.history.replaceState(null, "", url);

  const event: LanguageChangeEvent = new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language } });
  document.dispatchEvent(event);
}

/** Subscribe to language changes. Returns an unsubscribe function. */
export function onLanguageChange(listener: (language: Language) => void): () => void {
  const handler = (event: Event) => {
    listener((event as LanguageChangeEvent).detail.language);
  };
  document.addEventListener(LANGUAGE_CHANGE_EVENT, handler);
  return () => document.removeEventListener(LANGUAGE_CHANGE_EVENT, handler);
}

/**
 * Carry the language across a site-internal navigation. Site-relative hrefs get
 * the `?lang=` they need; absolute and external URLs are returned untouched.
 */
export function withLanguage(href: string, language: Language): string {
  if (!href.startsWith("/") || language === DEFAULT_LANGUAGE) {
    return href;
  }
  const url = new URL(href, window.location.origin);
  url.searchParams.set(QUERY_KEY, language);
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Point every site-internal link under `root` at the current language. The href
 * as authored is kept in `data-href`, so switching back and forth stays lossless.
 */
export function localizeLinks(root: ParentNode, language: Language): void {
  for (const link of root.querySelectorAll<HTMLElement>("a[href], ui-button[href]")) {
    const href = link.dataset.href ?? link.getAttribute("href") ?? "";
    link.dataset.href = href;
    link.setAttribute("href", withLanguage(href, language));
  }
}
