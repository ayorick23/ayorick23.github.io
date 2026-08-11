import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "./i18n";

const FILENAMES: Record<Locale, string> = {
  en: "Dereck-Mendez-CV-EN.pdf",
  es: "Dereck-Mendez-CV-ES.pdf",
};

/** Returns the public URL for the locale's CV, or null if the file hasn't been provided yet. */
export function getCvHref(locale: Locale): string | null {
  const filename = FILENAMES[locale];
  const exists = existsSync(join(process.cwd(), "public", "cv", filename));
  return exists ? `/cv/${filename}` : null;
}
