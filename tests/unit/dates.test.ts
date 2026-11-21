import { describe, expect, it } from "vitest";
import { formatYearMonth, monthIndex } from "../../src/lib/dates";

describe("monthIndex", () => {
  it("counts months since year 0 so ranges can be subtracted", () => {
    expect(monthIndex("2026-01") - monthIndex("2025-01")).toBe(12);
    expect(monthIndex("2026-10") - monthIndex("2026-09")).toBe(1);
  });
});

describe("formatYearMonth", () => {
  it("formats per locale without the trailing period of Spanish abbreviations", () => {
    expect(formatYearMonth("2026-10", "en")).toBe("Oct 2026");
    expect(formatYearMonth("2026-10", "es")).toBe("oct 2026");
    expect(formatYearMonth("2025-09", "es")).not.toContain(".");
  });

  it("is not shifted by the local time zone (January stays January)", () => {
    expect(formatYearMonth("2025-01", "en")).toBe("Jan 2025");
  });

  it("can show only the year", () => {
    expect(formatYearMonth("2028-12", "es", true)).toBe("2028");
  });
});
