/**
 * Icons are local files (src/assets/icons/, wired up via astro-icon's iconDir
 * config) — SVGs are referenced by filename with no extension and no
 * collection prefix.
 *
 * `icon` is the monochrome version shown at rest; it must use currentColor so
 * it follows the theme. When only a bitmap exists, set `raster: true` and pass
 * the PNG filename — it's drawn as a CSS mask (mask-image + currentColor), so
 * any PNG with a real alpha channel works, even a full-color one.
 *
 * On hover the chip crossfades to `colorIcon` (the real full-color logo; a
 * filename ending in .png/.webp is rendered as a plain <img>). Tools without a
 * `colorIcon` tint the mono icon with `brand` instead. `brand` also tints the
 * chip border on hover; `brandOnDark` replaces it in dark mode for brands
 * whose real color is too dark to read on a dark background.
 *
 * `exploringTools` is intentionally empty for now; fill it in when there's a
 * real next-technology list to show under "Currently exploring".
 */
export interface Tool {
  name: string;
  icon: string;
  raster?: boolean;
  colorIcon?: string;
  brand: string;
  brandOnDark?: string;
}

export type ToolGroupKey = "data" | "bi" | "de" | "ml" | "eng";

export interface ToolGroup {
  key: ToolGroupKey;
  tools: Tool[];
}

export const toolGroups: ToolGroup[] = [
  {
    key: "data",
    tools: [
      { name: "Python", icon: "simple-icons--python", colorIcon: "logos--python-color", brand: "#3776ab" },
      { name: "SQL", icon: "streamline-plump--database-solid", brand: "var(--accent)" },
      { name: "pandas", icon: "devicon-plain--pandas", colorIcon: "devicon--pandas", brand: "#130754", brandOnDark: "#e70488" },
      { name: "Polars", icon: "simple-icons--polars", colorIcon: "thesvg-color--polars", brand: "#0075ff" },
      { name: "NumPy", icon: "devicon-plain--numpy", colorIcon: "devicon--numpy", brand: "#4dabcf" },
      { name: "SciPy", icon: "thesvg--scipy", colorIcon: "thesvg-color--scipy", brand: "#8caae6" },
    ],
  },
  {
    key: "bi",
    tools: [
      { name: "Power BI", icon: "logos--microsoft-power-bi", colorIcon: "logos--microsoft-power-bi-color", brand: "#d9a400", brandOnDark: "#f2c811" },
      { name: "Data Studio", icon: "simple-icons--looker", colorIcon: "logos--looker-icon", brand: "#4285f4" },
      { name: "Streamlit", icon: "simple-icons--streamlit", colorIcon: "devicon--streamlit-color", brand: "#ff4b4b" },
      { name: "Matplotlib", icon: "devicon-plain--matplotlib", colorIcon: "devicon--matplotlib", brand: "#11557c", brandOnDark: "#4a9fd8" },
      { name: "Seaborn", icon: "seaborn_logo_black.png", raster: true, colorIcon: "devicon--seaborn", brand: "#444876", brandOnDark: "#7db0bc" },
    ],
  },
  {
    key: "de",
    tools: [
      { name: "SQL Server", icon: "selfhst--microsoft-sql-server-light", colorIcon: "selfhst--microsoft-sql-server", brand: "#cc2927" },
      { name: "PostgreSQL", icon: "devicon-plain--postgresql", colorIcon: "selfhst--postgresql", brand: "#336791", brandOnDark: "#4f8fd6" },
      { name: "DuckDB", icon: "devicon-plain--duckdb", colorIcon: "devicon--duckdb", brand: "#b8a400", brandOnDark: "#fff100" },
      { name: "dbt", icon: "logos--dbt-icon-white", colorIcon: "logos--dbt-icon", brand: "#ff694a" },
      { name: "Airflow", icon: "cib--apache-airflow", colorIcon: "logos--airflow-icon", brand: "#017cee" },
    ],
  },
  {
    key: "ml",
    tools: [
      { name: "scikit-learn", icon: "devicon-plain--scikitlearn", colorIcon: "scikit-learn-color.png", brand: "#f7931e" },
      { name: "LightGBM", icon: "lightgbm-logo-color.png", raster: true, colorIcon: "lightgbm-logo-color.png", brand: "#ef4927" },
      { name: "MLflow", icon: "simple-icons--mlflow", brand: "#0194e2" },
      { name: "DVC", icon: "file-icons--dvc", colorIcon: "thesvg-color--dvc", brand: "#13adc7" },
      { name: "FastAPI", icon: "devicon-plain--fastapi", colorIcon: "thesvg-color--fastapi", brand: "#009688" },
    ],
  },
  {
    key: "eng",
    tools: [
      { name: "Git", icon: "iconoir--git-solid", colorIcon: "devicon--git", brand: "#f34f29" },
      { name: "GitHub Actions", icon: "thesvg--github-actions", colorIcon: "thesvg-color--github-actions", brand: "#2088ff" },
      { name: "Docker", icon: "devicon-plain--docker", colorIcon: "selfhst--docker", brand: "#2396ed" },
      { name: "pytest", icon: "simple-icons--pytest", colorIcon: "vscode-icons--file-type-pytest", brand: "#009fe3" },
      { name: "Kubernetes", icon: "devicon-plain--kubernetes", colorIcon: "devicon--kubernetes", brand: "#326ce5" },
    ],
  },
];

export const exploringTools: Tool[] = [];
