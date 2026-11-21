import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** On small screens the switcher lives inside the collapsed menu, so open it first like a visitor would. */
async function clickLanguageSwitch(page: Page, target: "en" | "es", isMobile: boolean) {
  if (isMobile) await page.locator("[data-nav-toggle]").click();
  await page.locator(`[data-lang-switch="${target}"]:visible`).first().click();
}

test.describe("language", () => {
  test("the switcher goes to the same page in the other language and remembers it", async ({
    page,
    isMobile,
    jsErrors,
  }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("lang", "en");
        sessionStorage.setItem("seeded", "1");
      }
    });
    await page.goto("/about/");
    await clickLanguageSwitch(page, "es", isMobile);
    await expect(page).toHaveURL("/es/about/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    expect(await page.evaluate(() => localStorage.getItem("lang"))).toBe("es");
    void jsErrors;
  });

  // Regression guard: the target language must be saved *before* navigating, or the root
  // redirect reads the old preference and bounces the visitor back (see scripts/language.ts).
  test("switching from Spanish to English home does not bounce back to /es/", async ({ page, isMobile, jsErrors }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("lang", "es");
        sessionStorage.setItem("seeded", "1");
      }
    });
    await page.goto("/es/");
    await clickLanguageSwitch(page, "en", isMobile);
    await expect(page).toHaveURL("/");
    await page.reload();
    await expect(page).toHaveURL("/");
    void jsErrors;
  });

  test("a visitor who chose Spanish is sent from / to /es/", async ({ page, jsErrors }) => {
    await page.addInitScript(() => localStorage.setItem("lang", "es"));
    await page.goto("/");
    await expect(page).toHaveURL("/es/");
    void jsErrors;
  });
});

test.describe("theme", () => {
  test("the light theme survives client-side navigation (View Transitions)", async ({ page, jsErrors }) => {
    await page.addInitScript(() => {
      localStorage.setItem("lang", "en");
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("theme", "dark");
        sessionStorage.setItem("seeded", "1");
      }
    });
    await page.goto("/about/");
    const html = page.locator("html");
    await expect(html).not.toHaveAttribute("data-theme", "light");

    await page.locator("[data-theme-toggle]").first().click();
    await expect(html).toHaveAttribute("data-theme", "light");

    await page.locator("main a[href='/']").first().click();
    await expect(page).toHaveURL("/");
    await expect(html).toHaveAttribute("data-theme", "light");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "light");
    void jsErrors;
  });
});

test.describe("mobile menu", () => {
  test("opens and closes from the menu button", async ({ page, isMobile, jsErrors }) => {
    test.skip(!isMobile, "The menu button only exists on small screens");
    await page.addInitScript(() => localStorage.setItem("lang", "en"));
    await page.goto("/");
    const toggle = page.locator("[data-nav-toggle]");
    const panel = page.locator("[data-nav-panel]");
    await expect(panel).toHaveAttribute("data-open", "false");
    await toggle.click();
    await expect(panel).toHaveAttribute("data-open", "true");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    await expect(panel).toHaveAttribute("data-open", "false");
    void jsErrors;
  });
});
