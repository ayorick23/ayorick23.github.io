/**
 * Structural data for the hero sphere. Each node sits on the sphere surface at
 * a latitude/longitude (degrees; latitude +90 is the top pole); labels and
 * descriptions live in i18n copy under `hero.constellation[id]` so this file
 * stays locale-free.
 *
 * `tools` are names from `toolGroups` in tools.ts (icons resolve from there)
 * and `projects` are content-collection slugs — both shown in the panel that
 * opens when a node is clicked.
 */
export const constellationNodes = [
  {
    id: "machineLearning",
    lat: 38,
    lon: 10,
    tools: ["scikit-learn", "LightGBM", "MLflow"],
    projects: ["telco-churn-mlops"],
  },
  {
    id: "dataScience",
    lat: -24,
    lon: 70,
    tools: ["Python", "pandas", "NumPy", "SciPy", "scikit-learn"],
    projects: ["data-ai-compensation-benchmark", "telco-churn-mlops"],
  },
  {
    id: "dataAnalytics",
    lat: 30,
    lon: 130,
    tools: ["SQL", "pandas", "Power BI", "Matplotlib", "Seaborn"],
    projects: ["data-ai-compensation-benchmark"],
  },
  {
    id: "mlops",
    lat: -34,
    lon: 190,
    tools: ["MLflow", "DVC", "FastAPI", "Docker", "GitHub Actions"],
    projects: ["telco-churn-mlops"],
  },
  {
    id: "peopleAnalytics",
    lat: 20,
    lon: 250,
    tools: ["Power BI", "Data Studio", "Python", "SQL"],
    projects: ["data-ai-compensation-benchmark"],
  },
  {
    id: "python",
    lat: -16,
    lon: 310,
    tools: ["Python", "pandas", "Polars", "NumPy", "FastAPI", "pytest"],
    projects: ["data-ai-compensation-benchmark", "telco-churn-mlops", "ecommerce-medallion-pipeline"],
  },
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
