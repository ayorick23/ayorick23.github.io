import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkSite, extractLinks } from "../../scripts/check-links.mjs";

let dist: string;
const write = (path: string, html: string) => {
  mkdirSync(dirname(join(dist, path)), { recursive: true });
  writeFileSync(join(dist, path), html);
};

beforeEach(() => {
  dist = mkdtempSync(join(tmpdir(), "links-"));
  write("index.html", '<section id="work"></section><a href="/about/">About</a>');
  write(
    "about/index.html",
    '<h1 id="top">About</h1><img src="/img/me.webp" srcset="/img/me.webp 1x, /img/me@2x.webp 2x">',
  );
  write("img/me.webp", "");
  write("img/me@2x.webp", "");
});
afterEach(() => rmSync(dist, { recursive: true, force: true }));

describe("check-links", () => {
  it("accepts existing pages, folders without trailing slash, assets, srcset and anchors", () => {
    write(
      "projects/index.html",
      '<a href="/#work">Work</a><a href="/about">About</a><a href="#local">x</a><p id="local">',
    );
    expect(checkSite(dist).problems).toEqual([]);
  });

  it("ignores external links, mailto and tel", () => {
    write(
      "contact/index.html",
      '<a href="https://github.com/x">x</a><a href="mailto:a@b.c">m</a><a href="tel:1">t</a>',
    );
    expect(checkSite(dist).problems).toEqual([]);
  });

  it("reports missing pages, missing assets and missing anchors", () => {
    write("broken/index.html", '<a href="/abuot/">x</a><img src="/img/nope.png"><a href="/#wrok">w</a>');
    const { problems } = checkSite(dist);
    expect(problems).toHaveLength(3);
    expect(problems.join("\n")).toMatch(/abuot[\s\S]*nope\.png[\s\S]*#wrok/);
  });

  it("resolves relative links from the page's folder", () => {
    write("projects/a/index.html", '<a href="../b/">b</a>');
    expect(checkSite(dist).problems).toEqual([expect.stringContaining("../b/")]);
    write("projects/b/index.html", "<p>b</p>");
    expect(checkSite(dist).problems).toEqual([]);
  });

  it("reads every URL of a srcset", () => {
    expect(extractLinks('<img srcset="/a.webp 1x, /b.webp 2x">')).toEqual(["/a.webp", "/b.webp"]);
  });
});
