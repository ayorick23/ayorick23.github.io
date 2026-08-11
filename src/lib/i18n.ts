import { en } from "../content/i18n/en";
import { es } from "../content/i18n/es";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries = { en, es };

export function getUI(locale: Locale) {
  return dictionaries[locale];
}

/** Astro.currentLocale is undefined on the default-locale (unprefixed) routes. */
export function resolveLocale(currentLocale: string | undefined): Locale {
  return currentLocale === "es" ? "es" : "en";
}

/** Prefix a root-relative path with the locale, respecting the unprefixed default locale. */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}

/** Given the current pathname + locale, return the equivalent path in the other locale. */
export function getAlternatePath(pathname: string, currentLocale: Locale): string {
  if (currentLocale === "es") {
    const withoutPrefix = pathname.replace(/^\/es/, "") || "/";
    return withoutPrefix;
  }
  return `/es${pathname === "/" ? "" : pathname}/`.replace(/\/+$/, "/");
}
