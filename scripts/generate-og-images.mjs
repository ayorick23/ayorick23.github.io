// One-off asset generator: renders the default social-preview (og:image) card
// and the per-project preview cards into public/og/. Re-run manually with
// `npm run generate:og` whenever the bio copy, photo, project metrics or the
// chosen cover kind change — these are committed static assets, not part of
// the Astro build pipeline.
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { COVER_KINDS } from "../src/lib/project-cover-kinds.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(root, "public", "og");
mkdirSync(OUT_DIR, { recursive: true });

const registerManrope = (file) =>
  GlobalFonts.registerFromPath(join(root, "node_modules/@fontsource/manrope/files", file), "Manrope");
registerManrope("manrope-latin-400-normal.woff2");
registerManrope("manrope-latin-700-normal.woff2");
registerManrope("manrope-latin-800-normal.woff2");
GlobalFonts.registerFromPath(
  join(root, "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2"),
  "JetBrains Mono",
);
GlobalFonts.registerFromPath(
  join(root, "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2"),
  "JetBrains Mono",
);

// Same tokens as src/styles/global.css (dark mode) / the fallbacks in
// src/scripts/project-covers.ts readColors() — kept in sync by hand since
// this script runs outside the browser/CSS pipeline.
const COLORS = {
  bg: "#050609",
  surface: "#0a0c12",
  ink: "#eef1f6",
  ink2: "#98a1b2",
  ink3: "#5c6575",
  line: "rgba(255,255,255,0.075)",
  line2: "rgba(255,255,255,0.13)",
  accent: "#5b8cff",
  accent2: "#9b7cff",
  accentSoft: "rgba(91,140,255,0.16)",
  star: "#dce6ff",
  edge: "rgba(140,175,255,0.3)",
  risk: "#ff5f6d",
  green: "#34d399",
  amber: "#f0b544",
  panel: "rgba(18,22,32,0.72)",
  glow: 1,
};

const W = 1200;
const H = 630;

// A small cluster loosely inspired by src/data/constellation.ts (same idea —
// dots + connecting edges in the accent color), hand-placed in the top-right
// corner so it reads as sky above the photo instead of crossing the face.
const NODES = [
  { x: 18, y: 78 },
  { x: 55, y: 20 },
  { x: 88, y: 55 },
  { x: 60, y: 92 },
  { x: 100, y: 10 },
];
const EDGES = [
  [0, 1], [1, 2], [1, 3], [2, 4],
];

function drawConstellation(ctx, originX, originY, w, h, alpha) {
  const pts = NODES.map((n) => [originX + (n.x / 100) * w, originY + (n.y / 100) * h]);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 1;
  for (const [a, b] of EDGES) {
    ctx.beginPath();
    ctx.moveTo(pts[a][0], pts[a][1]);
    ctx.lineTo(pts[b][0], pts[b][1]);
    ctx.stroke();
  }
  for (const [x, y] of pts) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 10);
    grad.addColorStop(0, COLORS.accent2);
    grad.addColorStop(1, "rgba(155,124,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Wraps at word boundaries with no line-count limit. */
function wrapAll(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** wrapAll, then truncates to maxLines with an ellipsis on the last line if needed. */
function wrapText(ctx, text, maxWidth, maxLines) {
  const lines = wrapAll(ctx, text, maxWidth);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (ctx.measureText(last + "…").width > maxWidth && last.length > 1) {
    last = last.slice(0, -1).trimEnd();
  }
  kept[maxLines - 1] = last + "…";
  return kept;
}

/** Shrinks the font size step by step until the title fits within maxLines. */
function fitTitleLines(ctx, text, maxWidth, maxLines, sizes) {
  for (const size of sizes) {
    ctx.font = `800 ${size}px Manrope`;
    const lines = wrapAll(ctx, text, maxWidth);
    if (lines.length <= maxLines) return { lines, size };
  }
  const size = sizes[sizes.length - 1];
  ctx.font = `800 ${size}px Manrope`;
  return { lines: wrapText(ctx, text, maxWidth, maxLines), size };
}

function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function backdrop(ctx, glowX, glowY, radius = 420) {
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, COLORS.surface);
  bgGrad.addColorStop(1, COLORS.bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  if (glowX === null) return;
  // A soft multi-stop falloff — a hard 2-stop radial gradient shows a
  // visible ring where it meets fully-transparent, especially against flat
  // dark backgrounds; the extra mid-stops smooth that edge away.
  const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, radius);
  glow.addColorStop(0, COLORS.accentSoft);
  glow.addColorStop(0.5, "rgba(91,140,255,0.05)");
  glow.addColorStop(0.8, "rgba(91,140,255,0.015)");
  glow.addColorStop(1, "rgba(91,140,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function statusPill(ctx, x, y, label, variant) {
  ctx.font = "600 15px JetBrains Mono";
  const textW = ctx.measureText(label).width;
  const padX = 14;
  const w = textW + padX * 2 + 14;
  const h = 30;
  const left = x - w;
  ctx.fillStyle = variant === "published" ? COLORS.accentSoft : "rgba(255,255,255,0.02)";
  roundRectPath(ctx, left, y, w, h, 999);
  ctx.fill();
  ctx.strokeStyle = COLORS.line2;
  ctx.lineWidth = 1;
  roundRectPath(ctx, left, y, w, h, 999);
  ctx.stroke();
  ctx.fillStyle = variant === "published" ? COLORS.accent : COLORS.ink2;
  ctx.beginPath();
  ctx.arc(left + padX + 3, y + h / 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.ink2;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, left + padX + 12, y + h / 2 + 1);
  return w;
}

async function renderSiteCard({ locale, kicker, tagline }) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  backdrop(ctx, 860, 300);
  drawConstellation(ctx, 700, 20, 430, 125, 0.55);

  const photo = await loadImage(join(root, "src/assets/images/dereck-mendez-cutout.png"));
  const cx = 900;
  const cy = 340;
  const r = 195;

  const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ringGrad.addColorStop(0, COLORS.accent);
  ringGrad.addColorStop(1, COLORS.accent2);
  ctx.save();
  ctx.shadowColor = "rgba(91,140,255,0.45)";
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const scale = (r * 2) / photo.width;
  const drawW = photo.width * scale;
  const drawH = photo.height * scale;
  ctx.drawImage(photo, cx - drawW / 2, cy - r, drawW, drawH);
  ctx.restore();

  const left = 76;
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = COLORS.accent;
  ctx.font = "600 21px JetBrains Mono";
  ctx.fillText(kicker, left, 175);

  ctx.fillStyle = COLORS.ink;
  ctx.font = "800 74px Manrope";
  ctx.fillText("Dereck Mendez", left, 265);

  ctx.fillStyle = COLORS.ink2;
  ctx.font = "400 27px Manrope";
  wrapText(ctx, tagline, 620, 3).forEach((line, i) => ctx.fillText(line, left, 320 + i * 40));

  ctx.fillStyle = COLORS.ink3;
  ctx.font = "500 20px JetBrains Mono";
  ctx.fillText("ayorick23.github.io", left, H - 56);

  const outPath = join(OUT_DIR, `site-${locale}.png`);
  writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("wrote", outPath);
}

async function renderProjectCard({
  slug,
  locale,
  kind,
  category,
  title,
  tagline,
  statusLabel,
  statusVariant,
  metrics,
  techs,
}) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  backdrop(ctx, 220, 260, 360);

  const panelX = 636;
  const panelY = 118;
  const panelW = 488;
  const panelH = 420;

  ctx.save();
  roundRectPath(ctx, panelX, panelY, panelW, panelH, 20);
  ctx.clip();
  const panelGrad = ctx.createLinearGradient(0, panelY, 0, panelY + panelH);
  panelGrad.addColorStop(0, COLORS.surface);
  panelGrad.addColorStop(1, COLORS.bg);
  ctx.fillStyle = panelGrad;
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.translate(panelX, panelY);
  const state = COVER_KINDS[kind].init();
  COVER_KINDS[kind].draw(ctx, state, panelW, panelH, 0, 1, false, COLORS);
  ctx.restore();

  ctx.strokeStyle = COLORS.line2;
  ctx.lineWidth = 1;
  roundRectPath(ctx, panelX, panelY, panelW, panelH, 20);
  ctx.stroke();

  const left = 76;
  const maxTextWidth = panelX - left - 40;
  ctx.textBaseline = "alphabetic";

  statusPill(ctx, W - 76, 60, statusLabel, statusVariant);

  ctx.fillStyle = COLORS.accent;
  ctx.font = "600 17px JetBrains Mono";
  ctx.textAlign = "left";
  ctx.fillText(category.toUpperCase(), left, 168);

  ctx.fillStyle = COLORS.ink;
  const titleTop = 190;
  const { lines: titleLines, size: titleSize } = fitTitleLines(ctx, title, maxTextWidth, 2, [52, 44, 38]);
  const titleLH = Math.round(titleSize * 1.12);
  const titleBaseline = titleTop + titleSize * 0.78;
  titleLines.forEach((line, i) => ctx.fillText(line, left, titleBaseline + i * titleLH));
  const afterTitleY = titleBaseline + (titleLines.length - 1) * titleLH;

  ctx.fillStyle = COLORS.ink2;
  ctx.font = "400 22px Manrope";
  const tagY = afterTitleY + 46;
  const tagLines = wrapText(ctx, tagline, maxTextWidth, 3);
  tagLines.forEach((line, i) => ctx.fillText(line, left, tagY + i * 32));
  const afterTagY = tagY + (tagLines.length - 1) * 32;

  if (metrics?.length) {
    const statsY = Math.min(afterTagY + 70, 494);
    let x = left;
    metrics.slice(0, 3).forEach((m) => {
      ctx.fillStyle = COLORS.ink;
      ctx.font = "700 30px Manrope";
      ctx.fillText(m.value, x, statsY);
      ctx.fillStyle = COLORS.ink3;
      ctx.font = "500 13px JetBrains Mono";
      ctx.fillText(m.label.toUpperCase(), x, statsY + 24);
      x += Math.max(ctx.measureText(m.value).width, 130) + 34;
    });
  } else if (techs?.length) {
    let x = left;
    const y = Math.min(afterTagY + 60, 484);
    techs.forEach((tech) => {
      ctx.font = "500 15px JetBrains Mono";
      const w = ctx.measureText(tech).width + 28;
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      roundRectPath(ctx, x, y, w, 36, 8);
      ctx.fill();
      ctx.strokeStyle = COLORS.line2;
      ctx.lineWidth = 1;
      roundRectPath(ctx, x, y, w, 36, 8);
      ctx.stroke();
      ctx.fillStyle = COLORS.ink2;
      ctx.textBaseline = "middle";
      ctx.fillText(tech, x + 14, y + 19);
      ctx.textBaseline = "alphabetic";
      x += w + 10;
    });
  }

  ctx.fillStyle = COLORS.ink3;
  ctx.font = "500 18px JetBrains Mono";
  ctx.fillText("ayorick23.github.io", left, H - 56);

  const outPath = join(OUT_DIR, `${slug}-${locale}.png`);
  writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("wrote", outPath);
}

await renderSiteCard({
  locale: "es",
  kicker: "DATOS · MACHINE LEARNING · MLOPS",
  tagline:
    "Portafolio de Dereck Mendez — proyectos, casos de estudio y experiencia en Data Science, Machine Learning y MLOps.",
});

await renderSiteCard({
  locale: "en",
  kicker: "DATA · MACHINE LEARNING · MLOPS",
  tagline:
    "Portfolio of Dereck Mendez — Data Science, Machine Learning and MLOps projects, case studies and experience.",
});

await renderProjectCard({
  slug: "data-ai-compensation-benchmark",
  locale: "es",
  kind: "benchmark",
  category: "Data Analytics · Estadística aplicada",
  title: "Data & AI Compensation Benchmark",
  tagline:
    "Benchmark end-to-end de compensación para profesionales de datos e IA: rigor estadístico, ajuste por poder adquisitivo y dashboard en Power BI.",
  statusLabel: "FINALIZADO",
  statusVariant: "published",
  metrics: [
    { value: "85,088", label: "Filas analizadas" },
    { value: "9", label: "Familias de rol" },
    { value: "90", label: "Países con datos" },
  ],
});

await renderProjectCard({
  slug: "data-ai-compensation-benchmark",
  locale: "en",
  kind: "benchmark",
  category: "Data Analytics · Applied Statistics",
  title: "Data & AI Compensation Benchmark",
  tagline:
    "An end-to-end compensation benchmark for data and AI professionals: statistical rigor, purchasing-power adjustment and a Power BI dashboard.",
  statusLabel: "COMPLETED",
  statusVariant: "published",
  metrics: [
    { value: "85,088", label: "Rows analyzed" },
    { value: "9", label: "Role families" },
    { value: "90", label: "Countries with data" },
  ],
});

await renderProjectCard({
  slug: "telco-churn-mlops",
  locale: "es",
  kind: "churn",
  category: "MLOps · Clasificación",
  title: "Telco Churn MLOps",
  tagline:
    "Sistema end-to-end de predicción de churn: tracking de experimentos, monitoreo de drift, serving con explicabilidad y valor de negocio.",
  statusLabel: "FINALIZADO",
  statusVariant: "published",
  metrics: [
    { value: "0.99", label: "ROC-AUC" },
    { value: "0.93", label: "F1-Score" },
    { value: "91%", label: "Recall (churn)" },
  ],
});

await renderProjectCard({
  slug: "telco-churn-mlops",
  locale: "en",
  kind: "churn",
  category: "MLOps · Classification",
  title: "Telco Churn MLOps",
  tagline:
    "An end-to-end churn prediction system: experiment tracking, drift monitoring, explainable serving and a business-value layer.",
  statusLabel: "COMPLETED",
  statusVariant: "published",
  metrics: [
    { value: "0.99", label: "ROC-AUC" },
    { value: "0.93", label: "F1-Score" },
    { value: "91%", label: "Recall (churn)" },
  ],
});

await renderProjectCard({
  slug: "ecommerce-medallion-pipeline",
  locale: "es",
  kind: "medallion",
  category: "Ingeniería de datos · Orquestación",
  title: "E-Commerce Medallion Pipeline",
  tagline:
    "Pipeline de datos con arquitectura Medallion (Bronze -> Silver -> Gold) para datos de e-commerce, orquestado con Airflow.",
  statusLabel: "EN DESARROLLO",
  statusVariant: "draft",
  techs: ["Polars", "DuckDB", "Airflow"],
});

await renderProjectCard({
  slug: "ecommerce-medallion-pipeline",
  locale: "en",
  kind: "medallion",
  category: "Data Engineering · Orchestration",
  title: "E-Commerce Medallion Pipeline",
  tagline:
    "A Medallion-architecture data pipeline (Bronze -> Silver -> Gold) for e-commerce data, orchestrated with Airflow.",
  statusLabel: "IN PROGRESS",
  statusVariant: "draft",
  techs: ["Polars", "DuckDB", "Airflow"],
});
