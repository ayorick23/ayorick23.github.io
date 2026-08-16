/**
 * Structural geometry for the hero constellation. Positions are percentages
 * of the constellation viewport; labels/descriptions live in i18n copy
 * under `hero.constellation.nodes[id]` so this file stays locale-free.
 */
export const constellationNodes = [
  { id: "machineLearning", x: 58, y: 8, side: "r" },
  { id: "dataScience", x: 24, y: 16, side: "l" },
  // x nudged in from 80 to keep the two-line "Data / Analytics" title from clipping
  // a few px past the mobile constellation's overflow-hidden edge.
  { id: "dataAnalytics", x: 76, y: 36, side: "r" },
  { id: "mlops", x: 14, y: 52, side: "l" },
  { id: "peopleAnalytics", x: 70, y: 68, side: "r" },
  { id: "python", x: 40, y: 88, side: "r" },
] as const;

export type ConstellationNodeId = (typeof constellationNodes)[number]["id"];

/** Index pairs into constellationNodes, drawn as connecting edges. */
export const constellationEdges: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [0, 3],
  [4, 5],
  [3, 5],
  [1, 4],
  [0, 4],
  [2, 5],
  [1, 2],
  [1, 5],
  [0, 5],
];
