import { describe, expect, it } from "vitest";
import { en } from "../../src/content/i18n/en";
import { es } from "../../src/content/i18n/es";

/**
 * TypeScript already guarantees both dictionaries have the same *keys*; this catches what
 * the type system can't: arrays of different length, open-ended records (certificate
 * descriptions) and strings translated in only one language.
 */
function compare(a: unknown, b: unknown, path: string, issues: string[]) {
  if (typeof a === "string" || typeof b === "string") {
    if (typeof a !== typeof b) issues.push(`${path}: type differs`);
    // Empty in both languages is a deliberate "hide this" (e.g. experience.note); empty in one is a missed translation.
    else if (!(a as string).trim() !== !(b as string).trim()) issues.push(`${path}: empty in only one language`);
    return;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return void issues.push(`${path}: array vs non-array`);
    if (a.length !== b.length) return void issues.push(`${path}: ${a.length} items in en, ${b.length} in es`);
    a.forEach((item, i) => compare(item, b[i], `${path}[${i}]`, issues));
    return;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    const missingEs = keysA.filter((k) => !keysB.includes(k));
    const missingEn = keysB.filter((k) => !keysA.includes(k));
    if (missingEs.length) issues.push(`${path}: missing in es → ${missingEs.join(", ")}`);
    if (missingEn.length) issues.push(`${path}: missing in en → ${missingEn.join(", ")}`);
    for (const k of keysA.filter((k) => keysB.includes(k))) {
      compare((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`, issues);
    }
    return;
  }
  if (typeof a !== typeof b) issues.push(`${path}: type differs`);
}

describe("i18n dictionaries (en ↔ es)", () => {
  it("have the same structure, array lengths and no half-translated strings", () => {
    const issues: string[] = [];
    compare(en, es, "ui", issues);
    expect(issues).toEqual([]);
  });

  it("list the same jobs in the same order with the same dates", () => {
    const pick = (t: typeof en.experience.timeline) => t.map(({ start, end }) => ({ start, end }));
    expect(pick(es.experience.timeline)).toEqual(pick(en.experience.timeline));
  });

  it("keep capabilities and stats aligned item by item", () => {
    expect(es.capabilities.items.map((i) => i.id)).toEqual(en.capabilities.items.map((i) => i.id));
    expect(es.about.stats.map((s) => s.icon)).toEqual(en.about.stats.map((s) => s.icon));
  });
});
