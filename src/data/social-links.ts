/**
 * Real identity links carried over from the previous site. Update here only —
 * never hardcode a profile URL inside a component.
 */
export const socialLinks = [
  { id: "github", href: "https://github.com/ayorick23", icon: "iconoir--github-social" },
  { id: "linkedin", href: "https://linkedin.com/in/dereckmendez", icon: "simple-line-icons--linkedin-social" },
  { id: "email", href: "mailto:mayorickhenry@gmail.com", icon: "lucide:mail" },
] as const;

export type SocialLinkId = (typeof socialLinks)[number]["id"];
