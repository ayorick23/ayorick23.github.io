import { describe, expect, it } from "vitest";
import { techGroup, techIcon } from "../../src/lib/tech-icons";
import { toolGroups } from "../../src/data/tools";

describe("techIcon / techGroup", () => {
  const [group] = toolGroups;
  const [tool] = group.tools;

  it("finds tools from the tools section regardless of casing", () => {
    expect(techIcon(tool.name.toUpperCase())?.icon).toBe(tool.icon);
    expect(techGroup(tool.name.toLowerCase())).toBe(group.key);
  });

  it("returns undefined for unknown technologies instead of throwing", () => {
    expect(techIcon("Definitely Not A Tool")).toBeUndefined();
    expect(techGroup("Definitely Not A Tool")).toBeUndefined();
  });
});
