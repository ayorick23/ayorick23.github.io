import { afterEach, describe, expect, it, vi } from "vitest";
import { certificatesDuring, formatDuration, toRoles } from "../../src/lib/experience";
import { certificates } from "../../src/data/certificates";
import type { TimelineEntry } from "../../src/content/i18n/types";
import { monthIndex } from "../../src/lib/dates";

const units = { year: "year", years: "years", month: "month", months: "months" };

const entry = (start: string, end?: string): TimelineEntry => ({
  period: "",
  start,
  end,
  role: "Role",
  org: "Org",
  summary: "",
  description: "",
  tags: [],
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatDuration", () => {
  it.each([
    [1, "1 month"],
    [5, "5 months"],
    [12, "1 year"],
    [13, "1 year 1 month"],
    [26, "2 years 2 months"],
  ])("%i months → %s", (months, expected) => {
    expect(formatDuration(months, units)).toBe(expected);
  });

  it("never shows a zero-length role", () => {
    expect(formatDuration(0, units)).toBe("1 month");
    expect(formatDuration(-3, units)).toBe("1 month");
  });
});

describe("toRoles", () => {
  it("runs the current role (no end) up to today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 10, 17)));
    const [current, past] = toRoles([entry("2026-06"), entry("2023-07", "2026-06")]);
    expect(current.isCurrent).toBe(true);
    expect(current.to).toBe(monthIndex("2026-11"));
    expect(past.isCurrent).toBe(false);
    expect(past.to).toBe(monthIndex("2026-06"));
  });
});

describe("certificatesDuring", () => {
  it("gives a certificate issued in a hand-over month to the role that starts then, not both", () => {
    const issued = certificates[0].issued;
    const [later, earlier] = toRoles([entry(issued), entry("2000-01", issued)]);
    expect(certificatesDuring(later).map((c) => c.id)).toContain(certificates[0].id);
    expect(certificatesDuring(earlier).map((c) => c.id)).not.toContain(certificates[0].id);
  });
});
