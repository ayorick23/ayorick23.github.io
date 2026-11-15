/** Structural nav data — labels are resolved from i18n copy by id at render time. */
export const navItems = [
  { id: "about", href: "#about" },
  { id: "work", href: "#work" },
  { id: "tools", href: "#tools" },
  { id: "experience", href: "#experience" },
  { id: "skills", href: "#skills" },
  { id: "contact", href: "#contact" },
] as const;

export type NavItemId = (typeof navItems)[number]["id"];
