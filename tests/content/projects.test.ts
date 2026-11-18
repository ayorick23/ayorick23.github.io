import { describe, expect, it } from "vitest";
import { exists, readProjects, type ProjectFile } from "./helpers";
import { DISCIPLINES } from "../../src/data/disciplines";

const en = readProjects("en");
const es = readProjects("es");

/** Fields that describe the project itself, not its wording, so they must match across languages. */
const SHARED_FIELDS = [
  "technologies",
  "disciplines",
  "track",
  "githubUrl",
  "demoUrl",
  "status",
  "featured",
  "date",
  "order",
  "coverKind",
  "coverImage",
] as const;

const imagesOf = (p: ProjectFile): string[][] =>
  (p.data.sections ?? []).map((s: { images?: { src: string }[] }) => (s.images ?? []).map((img) => img.src));

describe("project case studies", () => {
  it("exist in both languages with the same slugs", () => {
    expect(es.map((p) => p.slug)).toEqual(en.map((p) => p.slug));
  });

  const pairs = en.map((pEn) => [pEn.slug, pEn, es.find((p) => p.slug === pEn.slug)] as const);

  describe.each(pairs)("%s", (slug, pEn, pEs) => {
    if (!pEs) return;

    it.each(SHARED_FIELDS)("has the same %s in en and es", (field) => {
      expect(pEs.data[field]).toEqual(pEn.data[field]);
    });

    it("has the same number of metrics and sections, with the same images", () => {
      expect((pEs.data.metrics ?? []).length).toBe((pEn.data.metrics ?? []).length);
      expect(imagesOf(pEs)).toEqual(imagesOf(pEn));
    });

    it("only uses known disciplines", () => {
      for (const d of pEn.data.disciplines ?? []) expect(DISCIPLINES).toContain(d);
    });

    it("points to files that exist in public/", () => {
      for (const p of [pEn, pEs]) {
        for (const src of [p.data.ogImage, p.data.coverImage, ...imagesOf(p).flat()].filter(Boolean)) {
          expect(exists("public", src), src).toBe(true);
        }
      }
    });

    it("uses the social card of its own language", () => {
      if (pEn.data.ogImage) expect(pEn.data.ogImage).toBe(`/og/${slug}-en.png`);
      if (pEs.data.ogImage) expect(pEs.data.ogImage).toBe(`/og/${slug}-es.png`);
    });
  });
});
