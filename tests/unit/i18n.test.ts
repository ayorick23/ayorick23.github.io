import { describe, expect, it } from "vitest";
import { getAlternatePath, getUI, localizePath, resolveLocale } from "../../src/lib/i18n";

describe("resolveLocale", () => {
  it("treats the unprefixed routes (undefined locale) as English", () => {
    expect(resolveLocale(undefined)).toBe("en");
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("es")).toBe("es");
  });
});

describe("localizePath", () => {
  it("leaves English at the root and prefixes Spanish with /es", () => {
    expect(localizePath("/", "en")).toBe("/");
    expect(localizePath("/projects", "en")).toBe("/projects");
    expect(localizePath("/projects", "es")).toBe("/es/projects");
    expect(localizePath("about", "es")).toBe("/es/about");
  });
});

describe("getAlternatePath (language switcher)", () => {
  it.each([
    ["/", "en", "/es/"],
    ["/about/", "en", "/es/about/"],
    ["/about", "en", "/es/about/"],
    ["/projects/telco-churn-mlops/", "en", "/es/projects/telco-churn-mlops/"],
    ["/es/", "es", "/"],
    ["/es", "es", "/"],
    ["/es/about/", "es", "/about/"],
    ["/es/projects/telco-churn-mlops/", "es", "/projects/telco-churn-mlops/"],
  ] as const)("%s (%s) → %s", (path, locale, expected) => {
    expect(getAlternatePath(path, locale)).toBe(expected);
  });
});

describe("getUI", () => {
  it("returns a different dictionary per locale", () => {
    expect(getUI("en").nav.about).not.toBe(getUI("es").nav.about);
  });
});
