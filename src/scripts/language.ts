import type { Locale } from "../lib/i18n";

/** Remember the visitor's language choice so the root redirect (see BaseLayout) can use it next visit. */
export function rememberLanguage(locale: Locale) {
  try {
    localStorage.setItem("lang", locale);
  } catch {
    // storage unavailable — no persistence, no crash
  }
}

/**
 * Persist the *target* language the instant the switcher is clicked — before navigation.
 * Without this, clicking "English" from /es/ would still have "es" in storage when the
 * root redirect script runs on the next page load, sending the visitor right back.
 */
export function initLanguageSwitchLinks() {
  document.querySelectorAll<HTMLAnchorElement>("[data-lang-switch]").forEach((link) => {
    if (link.dataset.initialized) return;
    link.dataset.initialized = "true";
    link.addEventListener("click", () => {
      const target = link.dataset.langSwitch;
      if (target === "en" || target === "es") {
        rememberLanguage(target);
      }
    });
  });
}
