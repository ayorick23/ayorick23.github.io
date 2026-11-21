// Checks every internal link in the built site (dist/): the target page or asset must exist and,
// when the link has a #fragment, the target page must contain an element with that id.
// External links are not checked here (they fail for reasons outside the repo); see links-external.yml.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const ATTR = /\s(?:href|src)=["']([^"']+)["']/g;
const SRCSET = /\ssrcset=["']([^"']+)["']/g;
const ID = /\sid=["']([^"']+)["']/g;

export function listHtml(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listHtml(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

export function extractLinks(html) {
  const links = [...html.matchAll(ATTR)].map((m) => m[1]);
  for (const m of html.matchAll(SRCSET)) {
    links.push(...m[1].split(",").map((part) => part.trim().split(/\s+/)[0]));
  }
  return links.filter(Boolean);
}

export const extractIds = (html) => new Set([...html.matchAll(ID)].map((m) => m[1]));

// Known, accepted cases: "page → link". Each one needs a reason.
const ALLOWED = new Set([
  // The language switcher on the 404 page points to /es/404/, which GitHub Pages answers with the same
  // 404.html; its inline script then shows the Spanish version. Works as intended.
  "/404.html → /es/404/",
]);

const isExternal = (link) => /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(link);

/** Maps a site URL path to the file GitHub Pages would serve from dist/, or null if none exists. */
export function resolveTarget(dist, urlPath) {
  const clean = decodeURIComponent(urlPath);
  const candidates = clean.endsWith("/")
    ? [join(dist, clean, "index.html")]
    : [join(dist, clean), join(dist, clean, "index.html"), join(dist, `${clean}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

export function checkSite(dist) {
  const pages = listHtml(dist);
  const idCache = new Map();
  const idsOf = (file) => {
    if (!idCache.has(file)) idCache.set(file, extractIds(readFileSync(file, "utf8")));
    return idCache.get(file);
  };
  const problems = [];

  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    const pageUrl = "/" + relative(dist, page).split(sep).join("/");
    for (const link of new Set(extractLinks(html))) {
      if (isExternal(link) || ALLOWED.has(`${pageUrl} → ${link}`)) continue;
      const [beforeHash, fragment] = link.split("#");
      const pathPart = beforeHash.split("?")[0];

      let target = page;
      if (pathPart) {
        const urlPath = pathPart.startsWith("/") ? pathPart : posix.join(posix.dirname(pageUrl), pathPart);
        target = resolveTarget(dist, urlPath);
        if (!target) {
          problems.push(`${pageUrl}: link roto → ${link}`);
          continue;
        }
      }
      if (fragment && target.endsWith(".html") && !idsOf(target).has(decodeURIComponent(fragment))) {
        problems.push(`${pageUrl}: el ancla #${fragment} no existe en ${link || "esta página"}`);
      }
    }
  }
  return { pages: pages.length, problems };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const dist = process.argv[2] ?? "dist";
  if (!existsSync(dist)) {
    console.error(`No existe ${dist}/: corre "npm run build" antes.`);
    process.exit(1);
  }
  const { pages, problems } = checkSite(dist);
  if (problems.length) {
    console.error(problems.join("\n"));
    console.error(`\n${problems.length} link(s) interno(s) roto(s) en ${pages} páginas.`);
    process.exit(1);
  }
  console.log(`Links internos OK en ${pages} páginas.`);
}
