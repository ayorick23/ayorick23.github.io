/**
 * Icons are local SVGs (src/assets/icons/, wired up via astro-icon's iconDir
 * config) — referenced here by filename, no extension, no collection prefix.
 * XGBoost and Pandera only exist as PNG logos, so those entries set
 * `raster: true` and are rendered as a CSS mask (mask-image + currentColor)
 * instead of going through the <Icon> component — see HomeView.astro. Seaborn
 * is also `raster: true`: its devicon SVG is an auto-traced path with
 * thousands of tiny segments that visibly stutters mid-scroll in the tools
 * marquee, so it's rasterized to a flat PNG instead (drawn at 256×256,
 * displayed at 40px, so it stays crisp).
 * `exploring` is intentionally empty for now; fill it in when there's a real
 * next-technology list to show under "Currently exploring".
 */
export interface Tool {
  name: string;
  icon: string;
  raster?: boolean;
}

export const coreTools: Tool[] = [
  { name: "Python", icon: "simple-icons--python" },
  { name: "SQL", icon: "streamline-plump--database-solid" },
  { name: "Power BI", icon: "logos--microsoft-power-bi" },
  { name: "Excel", icon: "selfhst--microsoft-excel-light" },
  { name: "Data Studio", icon: "simple-icons--looker" },
  { name: "Streamlit", icon: "simple-icons--streamlit" },
  { name: "Pandas", icon: "devicon-plain--pandas" },
  { name: "NumPy", icon: "devicon-plain--numpy" },
  { name: "Matplotlib", icon: "devicon-plain--matplotlib" },
  { name: "Seaborn", icon: "seaborn_logo_black.png", raster: true },
  { name: "Scikit-learn", icon: "devicon-plain--scikitlearn" },
  { name: "XGBoost", icon: "XGBoost_logo_white.png", raster: true },
  { name: "MLflow", icon: "simple-icons--mlflow" },
  { name: "DVC", icon: "file-icons--dvc" },
  { name: "Pandera", icon: "pandera_logo_white.png", raster: true },
  { name: "PyTest", icon: "simple-icons--pytest" },
  { name: "FastAPI", icon: "devicon-plain--fastapi" },
  { name: "Docker", icon: "devicon-plain--docker" },
  { name: "Git", icon: "iconoir--git-solid" },
  { name: "GitHub", icon: "akar-icons--github-fill" },
  { name: "GitLab", icon: "selfhst--gitlab-light" },
];

export const exploringTools: Tool[] = [];
