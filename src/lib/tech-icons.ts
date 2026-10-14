import { projectTechGroups, projectTechIcons, toolGroups, type ToolGroupKey } from "../data/tools";

export function techIcon(name: string): { icon: string; raster?: boolean } | undefined {
  const key = name.toLowerCase();
  const tool = toolGroups.flatMap((group) => group.tools).find((t) => t.name.toLowerCase() === key);
  if (tool) return { icon: tool.icon, raster: tool.raster };
  return projectTechIcons[key];
}

export function techGroup(name: string): ToolGroupKey | undefined {
  const key = name.toLowerCase();
  const group = toolGroups.find((g) => g.tools.some((t) => t.name.toLowerCase() === key));
  return group?.key ?? projectTechGroups[key];
}
