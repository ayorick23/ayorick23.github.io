/**
 * The six capabilities on the home page double as the "discipline" taxonomy
 * for projects, so the projects filter and the capabilities section always
 * speak the same language. Labels live in i18n (`capabilities.items[].id`).
 */
export const DISCIPLINES = [
  "data-analysis",
  "data-visualization",
  "machine-learning",
  "forecasting",
  "mlops",
  "data-engineering",
] as const;

export type Discipline = (typeof DISCIPLINES)[number];
