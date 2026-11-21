import AxeBuilder from "@axe-core/playwright";
import { expect, routes, test } from "./fixtures";

const THEMES = ["dark", "light"] as const;

// Accepted exceptions, each decided with Dereck. The rest of every page is still fully checked.
// - The Gantt "Today" pill keeps white on the brand crimson (3.6:1) on purpose (2026-11-20).
const EXCLUDED = [".dm-gantt__today"];

test.describe("accessibility (axe, WCAG 2.1 AA)", () => {
  // Reduced motion shows every reveal-on-scroll element at full opacity, so contrast is measured on
  // the final colours instead of mid-animation.
  test.use({ reducedMotion: "reduce" });

  for (const [locale, paths] of Object.entries(routes)) {
    for (const path of paths) {
      for (const theme of THEMES) {
        test(`${path} (${theme})`, async ({ page }) => {
          await page.addInitScript(
            ([lang, t]) => {
              localStorage.setItem("lang", lang);
              localStorage.setItem("theme", t);
            },
            [locale, theme],
          );
          await page.goto(path);
          await page.waitForLoadState("load");

          const axe = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
          for (const selector of EXCLUDED) axe.exclude(selector);
          const { violations } = await axe.analyze();

          const summary = violations.map(
            (v) =>
              `${v.id} (${v.impact}): ${v.help}\n` +
              v.nodes
                .slice(0, 5)
                .map(
                  (n) =>
                    `    ${n.target.join(" ")}${n.failureSummary ? ` — ${n.failureSummary.split("\n")[1]?.trim()}` : ""}`,
                )
                .join("\n"),
          );
          expect(summary, "axe violations").toEqual([]);
        });
      }
    }
  }
});
