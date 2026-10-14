import type { Locale } from "./i18n";

/** "2026-10" → month index, so ranges can be measured in months. */
export function monthIndex(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number);
  return y * 12 + (m - 1);
}

/** "2026-10" → "oct 2026" / "Oct 2026" (casing is left to CSS). */
export function formatYearMonth(yearMonth: string, locale: Locale, yearOnly = false): string {
  const [y, m] = yearMonth.split("-").map(Number);
  if (yearOnly) return String(y);
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(y, m - 1, 1)))
    .replace(".", "");
}
