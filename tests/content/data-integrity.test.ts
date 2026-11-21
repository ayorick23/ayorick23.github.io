import { describe, expect, it } from "vitest";
import { exists, readProjects } from "./helpers";
import { certificates } from "../../src/data/certificates";
import { constellationEdges, constellationNodes } from "../../src/data/constellation";
import { educationMilestones } from "../../src/data/education";
import { toolGroups } from "../../src/data/tools";
import { en } from "../../src/content/i18n/en";
import { es } from "../../src/content/i18n/es";
import { monthIndex } from "../../src/lib/dates";

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

describe("certificates", () => {
  const ids = certificates.map((c) => c.id);

  it("have unique ids and valid issue dates, newest first", () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of certificates) expect(c.issued, c.id).toMatch(YEAR_MONTH);
    const months = certificates.map((c) => monthIndex(c.issued));
    expect(months).toEqual([...months].sort((a, b) => b - a));
  });

  it.each(ids)("%s has its PDF and its stack preview", (id) => {
    expect(exists("public", "certificates", `${id}.pdf`)).toBe(true);
    expect(exists("src", "assets", "certificates", `${id}.jpg`)).toBe(true);
  });

  it("each have a description in both languages, with no orphan descriptions", () => {
    expect(Object.keys(en.about.certificates.descriptions).sort()).toEqual([...ids].sort());
    expect(Object.keys(es.about.certificates.descriptions).sort()).toEqual([...ids].sort());
  });

  it("link related certificates both ways", () => {
    for (const c of certificates) {
      if (!c.related) continue;
      const other = certificates.find((o) => o.id === c.related?.id);
      expect(other, `${c.id} → ${c.related.id}`).toBeDefined();
      expect(other?.related?.id).toBe(c.id);
      expect(other?.related?.kind).not.toBe(c.related.kind);
    }
  });
});

describe("work timeline", () => {
  const timeline = en.experience.timeline;

  it("uses YYYY-MM dates and only the newest role is open-ended", () => {
    timeline.forEach((role, i) => {
      expect(role.start, role.role).toMatch(YEAR_MONTH);
      if (!role.end) {
        expect(i, `${role.role} has no end but is not the newest`).toBe(0);
        return;
      }
      expect(role.end, role.role).toMatch(YEAR_MONTH);
      expect(monthIndex(role.end)).toBeGreaterThanOrEqual(monthIndex(role.start));
    });
  });

  it("is newest first and never has two jobs at the same time", () => {
    for (let i = 0; i < timeline.length - 1; i++) {
      const newer = timeline[i];
      const older = timeline[i + 1];
      expect(older.end, older.role).toBeDefined();
      expect(monthIndex(newer.start), `${older.role} overlaps ${newer.role}`).toBeGreaterThanOrEqual(
        monthIndex(older.end ?? older.start),
      );
    }
  });
});

describe("education milestones", () => {
  it("are in chronological order with valid dates", () => {
    for (const m of educationMilestones) expect(m.date, m.id).toMatch(YEAR_MONTH);
    const months = educationMilestones.map((m) => monthIndex(m.date));
    expect(months).toEqual([...months].sort((a, b) => a - b));
  });
});

describe("hero constellation", () => {
  const toolNames = toolGroups.flatMap((g) => g.tools.map((t) => t.name));
  const slugs = readProjects("en").map((p) => p.slug);

  it.each(constellationNodes.map((n) => [n.id, n] as const))("%s references real tools and projects", (id, node) => {
    for (const tool of node.tools) expect(toolNames, `${id} → ${tool}`).toContain(tool);
    for (const project of node.projects) expect(slugs, `${id} → ${project}`).toContain(project);
    expect(en.hero.constellation[id].label).toBeTruthy();
    expect(es.hero.constellation[id].label).toBeTruthy();
  });

  it("only connects existing nodes", () => {
    for (const [a, b] of constellationEdges) {
      expect(constellationNodes[a]).toBeDefined();
      expect(constellationNodes[b]).toBeDefined();
    }
  });
});
