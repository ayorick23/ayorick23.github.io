/**
 * Icons are local SVGs (src/assets/icons/, wired up via astro-icon's iconDir
 * config) — referenced here by filename, no extension, no collection prefix.
 * `exploring` is intentionally empty for now; fill it in when there's a real
 * next-technology list to show under "Currently exploring".
 */
export const coreTools = [
  { name: "Python", icon: "simple-icons--python" },
  { name: "Pandas", icon: "devicon-plain--pandas" },
  { name: "NumPy", icon: "devicon-plain--numpy" },
  { name: "Scikit-learn", icon: "devicon-plain--scikitlearn" },
  { name: "Matplotlib", icon: "devicon-plain--matplotlib" },
  { name: "Seaborn", icon: "devicon-plain--seaborn" },
  { name: "Power BI", icon: "arcticons--microsoft-power-bi" },
  { name: "Streamlit", icon: "simple-icons--streamlit" },
  { name: "Looker", icon: "simple-icons--looker" },
  { name: "MLflow", icon: "simple-icons--mlflow" },
  { name: "DVC", icon: "file-icons--dvc" },
  { name: "Docker", icon: "devicon-plain--docker" },
  { name: "FastAPI", icon: "devicon-plain--fastapi" },
  { name: "Git", icon: "iconoir--git-solid" },
  { name: "GitHub", icon: "akar-icons--github-fill" },
];

export const exploringTools: { name: string; icon: string }[] = [];
