import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "./i18n";

export type ProjectEntry = CollectionEntry<"projectsEn"> | CollectionEntry<"projectsEs">;

export async function getProjects(locale: Locale) {
  const entries = await getCollection(locale === "es" ? "projectsEs" : "projectsEn");
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedProjects(locale: Locale, limit = 3) {
  const projects = await getProjects(locale);
  return projects.filter((p) => p.data.featured).slice(0, limit);
}

export async function getProject(locale: Locale, slug: string) {
  const projects = await getProjects(locale);
  return projects.find((p) => p.id === slug);
}
