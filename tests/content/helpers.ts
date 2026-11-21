import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

export const fromRoot = (...parts: string[]) => join(process.cwd(), ...parts);
export const exists = (...parts: string[]) => existsSync(fromRoot(...parts));

export interface ProjectFile {
  slug: string;
  // Raw YAML frontmatter: tests assert on its shape, so it stays untyped on purpose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export function readProjects(locale: "en" | "es"): ProjectFile[] {
  const dir = fromRoot("src", "content", "projects", locale);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = readFileSync(join(dir, file), "utf8");
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${locale}/${file} has no frontmatter`);
      return { slug: file.replace(/\.md$/, ""), data: parse(match[1]) };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
