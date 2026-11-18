import { test as base, expect } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const slugs = readdirSync(join(process.cwd(), "src", "content", "projects", "en"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""));

export const routes = {
  en: ["/", "/about/", "/experience/", "/projects/", ...slugs.map((s) => `/projects/${s}/`)],
  es: ["/es/", "/es/about/", "/es/experience/", "/es/projects/", ...slugs.map((s) => `/es/projects/${s}/`)],
};

/** Collects uncaught exceptions and console errors so every test fails on a broken script. */
export const test = base.extend<{ jsErrors: string[] }>({
  jsErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      // External resources (e.g. the Fontshare font) may fail offline; that isn't our code breaking.
      if (msg.type() === "error" && !/Failed to load resource/.test(msg.text())) errors.push(`console: ${msg.text()}`);
    });
    await use(errors);
    expect(errors, "JavaScript errors on the page").toEqual([]);
  },
});

export { expect };
