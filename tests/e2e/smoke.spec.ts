import { expect, routes, test } from "./fixtures";

test.describe("every page loads", () => {
  for (const [locale, paths] of Object.entries(routes)) {
    for (const path of paths) {
      test(`${path}`, async ({ page, jsErrors }) => {
        // Pin the language so the root auto-redirect doesn't move "/" to "/es/".
        await page.addInitScript((lang) => localStorage.setItem("lang", lang), locale);
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page).toHaveURL(path);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page).toHaveTitle(/Dereck Mendez/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
        void jsErrors;
      });
    }
  }
});

test.describe("404 page", () => {
  test("answers 404 in English for a missing English URL", async ({ page, jsErrors }) => {
    await page.addInitScript(() => localStorage.setItem("lang", "en"));
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.locator('[data-404-lang="en"] h1')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    void jsErrors;
  });

  test("switches to Spanish for a missing /es/ URL", async ({ page, jsErrors }) => {
    await page.addInitScript(() => localStorage.setItem("lang", "en"));
    await page.goto("/es/esta-pagina-no-existe");
    await expect(page.locator('[data-404-lang="es"] h1')).toBeVisible();
    await expect(page.locator('[data-404-lang="en"]')).toBeHidden();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    void jsErrors;
  });
});
