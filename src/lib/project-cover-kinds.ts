/**
 * Canvas-drawn animated project covers. Each "kind" owns a small init() state
 * and a draw(ctx, state, w, h, t, prog, hover, colors) function. `prog` is the
 * 0→1 entrance animation (runs once per mount/scroll-into-view), `t` is a
 * free-running clock in seconds, `hover` is true while the pointer/focus is
 * over the card. Ported from the Claude-Design prototype in desing_reference/
 * and extended with richer hover motion (flow particles, cluster breathing,
 * comet trails) per Dereck's request for more visible particle travel/grouping.
 */

export type CoverKind = "churn" | "forecast" | "clusters" | "pipeline" | "lifecycle" | "semantic";

export interface CoverColors {
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  line2: string;
  accent: string;
  accent2: string;
  star: string;
  edge: string;
  risk: string;
  green: string;
  amber: string;
  panel: string;
  glow: number;
}

export interface CoverKindDef<S = unknown> {
  init(): S;
  draw(
    ctx: CanvasRenderingContext2D,
    state: S,
    w: number,
    h: number,
    t: number,
    prog: number,
    hover: boolean,
    colors: CoverColors,
  ): void;
}

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const TAU = Math.PI * 2;

function txt(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = "left",
  weight = 500,
) {
  ctx.font = `${weight} ${size}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

/** A dot travelling a→b in a loop, with a short fading tail — the "fluid particle" motion unit reused across kinds. */
function drawFlowParticle(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  u: number,
  color: string,
  size: number,
  alpha: number,
  tailSteps = 5,
) {
  for (let i = 0; i < tailSteps; i++) {
    const uu = ((u - i * 0.035) % 1 + 1) % 1;
    const x = ax + (bx - ax) * uu;
    const y = ay + (by - ay) * uu;
    const a = alpha * (1 - i / tailSteps) * (0.35 + 0.65 * Math.sin(uu * Math.PI));
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * (1 - i / (tailSteps * 1.6)), 0, TAU);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// churn — behavioural network converging on at-risk customers
// ---------------------------------------------------------------------------

interface ChurnNode {
  bx: number;
  by: number;
  ph: number;
  sp: number;
  risk: boolean;
  tx?: number;
  ty?: number;
}
interface ChurnState {
  nodes: ChurnNode[];
  edges: [number, number][];
}

const churnKind: CoverKindDef<ChurnState> = {
  init() {
    const r = seeded(19);
    const nodes: ChurnNode[] = [];
    for (let i = 0; i < 30; i++) {
      const a = r() * TAU;
      const rad = Math.sqrt(r());
      nodes.push({
        bx: 0.34 + Math.cos(a) * rad * 0.215,
        by: 0.5 + Math.sin(a) * rad * 0.33,
        ph: r() * TAU,
        sp: 0.25 + r() * 0.45,
        risk: false,
      });
    }
    nodes
      .slice()
      .sort((a, b) => b.bx - a.bx)
      .slice(0, 6)
      .forEach((n, i) => {
        n.risk = true;
        n.tx = 0.7 + r() * 0.18;
        n.ty = 0.18 + i * 0.13 + r() * 0.04;
      });
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].bx - nodes[j].bx, (nodes[i].by - nodes[j].by) * 0.7);
        if (d < 0.105) edges.push([i, j]);
      }
    }
    return { nodes, edges };
  },
  draw(ctx, st, w, h, t, prog, hov, C) {
    const drift = ease(clamp01((prog - 0.4) / 0.6)) * (hov ? 1 : 0.84);
    const pos = st.nodes.map((n) => {
      const fx = Math.sin(t * n.sp + n.ph) * 0.006;
      const fy = Math.cos(t * n.sp * 0.8 + n.ph) * 0.006;
      const bx = n.bx + fx;
      const by = n.by + fy;
      const x = n.risk ? bx + (n.tx! - n.bx) * drift : bx;
      const y = n.risk ? by + (n.ty! - n.by) * drift : by;
      return { x: x * w, y: y * h, risk: n.risk, ph: n.ph };
    });
    const riskyEdges: [number, number][] = [];
    st.edges.forEach((e, i) => {
      const seg = clamp01((prog - 0.05 - (i / st.edges.length) * 0.5) / 0.3);
      if (seg <= 0) return;
      const a = pos[e[0]];
      const b = pos[e[1]];
      const risky = a.risk || b.risk;
      if (risky) riskyEdges.push(e);
      ctx.globalAlpha = risky ? (1 - drift * 0.85) * 0.8 : 0.7;
      ctx.strokeStyle = risky ? C.risk : C.edge;
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * seg, a.y + (b.y - a.y) * seg);
      ctx.stroke();
    });
    // Hover: signal particles flowing toward the at-risk cluster, fluid + fast.
    if (hov && drift > 0.5) {
      const speed = 0.85;
      riskyEdges.slice(0, 5).forEach(([ai, bi], i) => {
        const a = pos[ai];
        const b = pos[bi];
        const u = (t * speed + i * 0.21) % 1;
        drawFlowParticle(ctx, a.x, a.y, b.x, b.y, u, C.risk, 1.6, 0.85, 4);
      });
    }
    pos.forEach((p, i) => {
      const ap = clamp01((prog - i * 0.02) / 0.25);
      if (ap <= 0) return;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.3 + p.ph);
      const col = p.risk ? C.risk : C.accent;
      const R = (p.risk ? 11 : 7) + pulse * (p.risk ? 4 : 1.5) + (hov ? 2 : 0);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = C.glow * ap * (p.risk ? 0.5 + drift * 0.35 : 0.34);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = ap;
      ctx.fillStyle = p.risk ? C.risk : C.star;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.risk ? 2.4 : 1.7, 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = drift * (hov ? 1 : 0.7);
    const bw = Math.min(146, w * 0.4);
    const bh = 66;
    const bx = Math.min(w * 0.62, w - bw - 10);
    const by = h * 0.09;
    ctx.fillStyle = C.panel;
    roundRect(ctx, bx, by, bw, bh, 9);
    ctx.fill();
    ctx.strokeStyle = C.line2;
    ctx.lineWidth = 1;
    ctx.stroke();
    txt(ctx, "customer #8421", bx + 11, by + 17, 9.5, C.ink2);
    txt(ctx, "risk 78%", bx + 11, by + 36, 11, C.risk, "left", 600);
    txt(ctx, "tenure 8m", bx + 11, by + 53, 9, C.ink3);
    ctx.globalAlpha = 0.85;
    txt(ctx, "AT RISK · 6", w * 0.045, h - 14, 9.5, C.risk, "left", 600);
    txt(ctx, "CUSTOMERS → RISK → CHURN", w * 0.045, 15, 9, C.ink3);
    ctx.globalAlpha = 1;
  },
};

// ---------------------------------------------------------------------------
// forecast — historical vs. forecast time series
// ---------------------------------------------------------------------------

interface ForecastState {
  series: number[][];
}

const forecastKind: CoverKindDef<ForecastState> = {
  init() {
    const r = seeded(53);
    const series: number[][] = [];
    for (let s = 0; s < 3; s++) {
      const pts: number[] = [];
      let v = 0.5 + (s - 1) * 0.12;
      for (let i = 0; i <= 60; i++) {
        v += (r() - 0.5) * 0.085 + 0.0022 * (s === 0 ? 1.4 : s === 1 ? 0.8 : 0.3);
        pts.push(Math.max(0.1, Math.min(0.9, v)));
      }
      series.push(pts);
    }
    return { series };
  },
  draw(ctx, st, w, h, t, prog, hov, C) {
    const nowX = 0.56;
    const top = 26;
    const bot = h - 22;
    const H = bot - top;
    const X = (i: number) => (i / 60) * w * 0.92 + w * 0.04;
    const Y = (v: number) => bot - v * H;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 0.6;
    for (let g = 0; g <= 3; g++) {
      const y = top + (H / 3) * g;
      ctx.beginPath();
      ctx.moveTo(w * 0.04, y);
      ctx.lineTo(w * 0.96, y);
      ctx.stroke();
    }
    const cols = [C.accent, C.accent2, C.green];
    const wobbleAmp = hov ? 0.007 : 0.004;
    const hp = clamp01(prog / 0.55);
    const fp = clamp01((prog - 0.5) / 0.5);
    const nowI = Math.round(60 * nowX);
    st.series.forEach((pts, s) => {
      const wobble = Math.sin(t * (hov ? 0.85 : 0.5) + s) * wobbleAmp;
      ctx.globalAlpha = s === 0 ? 1 : 0.55;
      ctx.strokeStyle = cols[s];
      ctx.lineWidth = s === 0 ? 1.5 : 0.9;
      ctx.setLineDash([]);
      ctx.beginPath();
      const lastH = Math.floor(nowI * hp);
      for (let i = 0; i <= lastH; i++) {
        const y = Y(pts[i] + wobble);
        i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y);
      }
      ctx.stroke();
      if (fp > 0) {
        ctx.globalAlpha = (s === 0 ? 0.85 : 0.4) * fp;
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = s === 0 ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(X(nowI), Y(pts[nowI] + wobble));
        const lastF = nowI + Math.floor((60 - nowI) * ease(fp));
        for (let i = nowI; i <= lastF; i++) ctx.lineTo(X(i), Y(pts[i] + wobble));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    if (fp > 0) {
      ctx.globalAlpha = fp * (hov ? 0.28 : 0.18);
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      const p0 = st.series[0];
      for (let i = nowI; i <= 60; i++) {
        const sp = ((i - nowI) / (60 - nowI)) * 0.13;
        const y = Y(p0[i] + sp);
        i === nowI ? ctx.moveTo(X(i), y) : ctx.lineTo(X(i), y);
      }
      for (let i = 60; i >= nowI; i--) {
        const sp = ((i - nowI) / (60 - nowI)) * 0.13;
        ctx.lineTo(X(i), Y(p0[i] - sp));
      }
      ctx.closePath();
      ctx.fill();
    }
    // Hover: a bright pulse riding the tip of the primary forecast line.
    if (hov && fp > 0.05) {
      const lastF = nowI + Math.floor((60 - nowI) * ease(fp));
      const tipX = X(lastF);
      const tipY = Y(st.series[0][lastF] + Math.sin(t * 0.85) * wobbleAmp);
      const R = 5 + Math.sin(t * 4) * 1.4;
      const g = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, R * 3);
      g.addColorStop(0, C.accent);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(tipX, tipY, R * 3, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = clamp01((prog - 0.45) / 0.3);
    ctx.strokeStyle = C.ink3;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(X(nowI), top - 8);
    ctx.lineTo(X(nowI), bot);
    ctx.stroke();
    ctx.setLineDash([]);
    txt(ctx, "NOW", X(nowI), 14, 9, C.ink2, "center", 600);
    ctx.globalAlpha = 0.8;
    txt(ctx, "HISTORICAL", w * 0.04, h - 11, 9, C.ink3);
    txt(ctx, "FORECAST", w * 0.96, h - 11, 9, C.accent, "right");
    ctx.globalAlpha = 1;
  },
};

// ---------------------------------------------------------------------------
// clusters — unsupervised segmentation, raw points grouping into clusters
// ---------------------------------------------------------------------------

interface ClusterPoint {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  c: number;
  ph: number;
  sp: number;
  d: number;
}
interface ClusterState {
  pts: ClusterPoint[];
  cs: { cx: number; cy: number }[];
}

const clustersKind: CoverKindDef<ClusterState> = {
  init() {
    const r = seeded(101);
    const cs = [
      { cx: 0.28, cy: 0.32 },
      { cx: 0.72, cy: 0.3 },
      { cx: 0.3, cy: 0.72 },
      { cx: 0.72, cy: 0.72 },
    ];
    const pts: ClusterPoint[] = [];
    for (let i = 0; i < 104; i++) {
      const c = i % 4;
      const a = r() * TAU;
      const rad = Math.sqrt(r()) * 0.13;
      pts.push({
        sx: 0.1 + r() * 0.8,
        sy: 0.12 + r() * 0.76,
        tx: cs[c].cx + Math.cos(a) * rad,
        ty: cs[c].cy + Math.sin(a) * rad * 0.9,
        c,
        ph: r() * TAU,
        sp: 0.3 + r() * 0.5,
        d: r(),
      });
    }
    return { pts, cs };
  },
  draw(ctx, st, w, h, t, prog, hov, C) {
    const cols = [C.accent, C.accent2, C.green, C.amber];
    const settled = ease(clamp01((prog - 0.18) / 0.82));
    // Hover: a continuous "breathe" — clusters loosen and re-form, making the
    // grouping/ungrouping behaviour Dereck asked for clearly visible.
    const breathe = hov ? 0.5 + 0.5 * Math.sin(t * 0.9) : 1;
    const k = settled * (hov ? 0.55 + 0.45 * breathe : 0.93);
    st.cs.forEach((c, i) => {
      ctx.globalAlpha = C.glow * k * (hov ? 0.34 : 0.18);
      const R = Math.min(w, h) * 0.17 * (1 + 0.04 * Math.sin(t + i));
      const g = ctx.createRadialGradient(c.cx * w, c.cy * h, 0, c.cx * w, c.cy * h, R);
      g.addColorStop(0, cols[i]);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.cx * w, c.cy * h, R, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = k * 0.35;
      ctx.strokeStyle = cols[i];
      ctx.lineWidth = 0.6;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(c.cx * w, c.cy * h, R * 0.78, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    st.pts.forEach((p) => {
      const kk = ease(clamp01((k - p.d * 0.3) / 0.7));
      const driftAmp = hov ? 0.009 : 0.005;
      const fx = Math.sin(t * p.sp + p.ph) * driftAmp;
      const fy = Math.cos(t * p.sp + p.ph) * driftAmp;
      const x = (p.sx + (p.tx - p.sx) * kk + fx) * w;
      const y = (p.sy + (p.ty - p.sy) * kk + fy) * h;
      ctx.globalAlpha = 0.35 + 0.55 * clamp01(prog * 1.4) * (0.6 + 0.4 * Math.sin(t * 0.9 + p.ph));
      ctx.fillStyle = kk > 0.35 ? cols[p.c] : C.star;
      ctx.beginPath();
      ctx.arc(x, y, hov ? 1.7 : 1.45, 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 0.85;
    txt(ctx, k < 0.6 ? "RAW DATA" : "RAW DATA → CLUSTERS", w * 0.045, 15, 9, C.ink3);
    txt(ctx, "k = 4", w * 0.955, h - 13, 9, C.ink3, "right");
    ctx.globalAlpha = 1;
  },
};

// ---------------------------------------------------------------------------
// pipeline — sources/automation → transform → BI → decision
// ---------------------------------------------------------------------------

interface PipelineModule {
  x: number;
  y: number;
  label: string;
  sub: string;
  col: "accent" | "accent2" | "amber" | "green";
}
interface PipelineState {
  mods: PipelineModule[];
  links: [number, number][];
  parts: { l: number; p: number }[];
}

const pipelineKind: CoverKindDef<PipelineState> = {
  init() {
    const mods: PipelineModule[] = [
      { x: 0.1, y: 0.3, label: "SOURCES", sub: "db · api", col: "accent" },
      { x: 0.1, y: 0.72, label: "AUTOMATION", sub: "n8n", col: "accent" },
      { x: 0.42, y: 0.5, label: "PYTHON", sub: "transform", col: "accent2" },
      { x: 0.72, y: 0.5, label: "POWER BI", sub: "model", col: "amber" },
      { x: 0.93, y: 0.5, label: "INSIGHT", sub: "decision", col: "green" },
    ];
    const links: [number, number][] = [
      [0, 2],
      [1, 2],
      [2, 3],
      [3, 4],
    ];
    const parts = Array.from({ length: 16 }, (_, i) => ({ l: i % 4, p: i / 16 }));
    return { mods, links, parts };
  },
  draw(ctx, st, w, h, t, prog, hov, C) {
    const P = (m: PipelineModule) => ({ x: m.x * w, y: m.y * h });
    st.links.forEach((l, i) => {
      const a = P(st.mods[l[0]]);
      const b = P(st.mods[l[1]]);
      const seg = clamp01((prog - i * 0.13) / 0.3);
      if (seg <= 0) return;
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = C.edge;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      const mx = a.x + (b.x - a.x) * seg;
      const my = a.y + (b.y - a.y) * seg;
      ctx.quadraticCurveTo((a.x + mx) / 2, a.y, mx, my);
      ctx.stroke();
    });
    const speed = hov ? 0.62 : 0.26;
    const activeParts = hov ? st.parts : st.parts.slice(0, 10);
    activeParts.forEach((pt) => {
      const l = st.links[pt.l];
      const a = P(st.mods[l[0]]);
      const b = P(st.mods[l[1]]);
      const u = (pt.p + t * speed) % 1;
      const e = clamp01((prog - 0.3) / 0.4);
      const x = a.x + (b.x - a.x) * u;
      const y = a.y + (b.y - a.y) * u + Math.sin(u * Math.PI) * (a.y - b.y) * 0.12;
      ctx.globalAlpha = e * (0.35 + 0.65 * Math.sin(u * Math.PI)) * (hov ? 1 : 0.85);
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      ctx.arc(x, y, hov ? 1.9 : 1.6, 0, TAU);
      ctx.fill();
    });
    st.mods.forEach((m, i) => {
      const ap = ease(clamp01((prog - i * 0.1) / 0.3));
      if (ap <= 0) return;
      const p = P(m);
      const bw = Math.min(92, w * 0.25);
      const bh = 46;
      const x = p.x - (i === 4 ? bw - 6 : bw / 2);
      const y = p.y - bh / 2;
      ctx.globalAlpha = ap;
      ctx.fillStyle = C.panel;
      roundRect(ctx, x, y, bw, bh, 9);
      ctx.fill();
      ctx.strokeStyle = hov ? C.line2 : C.line;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = ap * 0.9;
      ctx.fillStyle = C[m.col];
      roundRect(ctx, x + 8, y + 9, 4, 4, 1);
      ctx.fill();
      txt(ctx, m.label, x + 9, y + 25, 9.5, C.ink2, "left", 600);
      txt(ctx, m.sub, x + 9, y + 38, 8.5, C.ink3);
    });
    ctx.globalAlpha = 0.8;
    txt(ctx, "DATA → PYTHON → BI → DECISION", w * 0.045, 14, 9, C.ink3);
    ctx.globalAlpha = 1;
  },
};

// ---------------------------------------------------------------------------
// lifecycle — continuous MLOps loop (data → train → … → monitor)
// ---------------------------------------------------------------------------

interface LifecycleState {
  stages: string[];
}

const lifecycleKind: CoverKindDef<LifecycleState> = {
  init() {
    return { stages: ["DATA", "TRAIN", "EVALUATE", "REGISTER", "DEPLOY", "MONITOR"] };
  },
  draw(ctx, st, w, h, t, prog, hov, C) {
    const pad = 30;
    const cx = w / 2;
    const cy = h * 0.5 + 4;
    const R = Math.max(28, Math.min(w * 0.32, (h - pad * 2 - 22) / 2));
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = C.line2;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU * ease(prog));
    ctx.stroke();
    ctx.setLineDash([]);
    const gR = R * (hov ? 0.68 : 0.6) * (1 + 0.03 * Math.sin(t * 1.1));
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
    g.addColorStop(0, C.accent2);
    g.addColorStop(0.4, C.accent);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = C.glow * ease(prog) * (hov ? 0.42 : 0.3);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, gR, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = ease(prog);
    ctx.fillStyle = C.star;
    ctx.beginPath();
    ctx.arc(cx, cy, 2.6, 0, TAU);
    ctx.fill();
    txt(ctx, "MODEL", cx, cy + 18, 9, C.ink3, "center", 600);
    const rot = hov ? 0.62 : 0.3;
    const head = (t * rot) % 1;
    // Hover: a comet trail of fading arcs behind the moving head, instead of one hard segment.
    const trailSteps = hov ? 5 : 1;
    for (let i = 0; i < trailSteps; i++) {
      const hh = ((head - i * 0.028) % 1 + 1) % 1;
      ctx.globalAlpha = ease(prog) * (i === 0 ? 0.95 : 0.95 * (1 - i / trailSteps));
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = i === 0 ? 1.4 : 1.4 * (1 - i / (trailSteps * 1.4));
      ctx.beginPath();
      ctx.arc(cx, cy, R, (hh - 0.12) * TAU - Math.PI / 2, hh * TAU - Math.PI / 2);
      ctx.stroke();
    }
    st.stages.forEach((s, i) => {
      const a = (i / st.stages.length) * TAU - Math.PI / 2;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      const ap = ease(clamp01((prog - i * 0.09) / 0.28));
      if (ap <= 0) return;
      const near = Math.abs((((head - i / st.stages.length) + 1) % 1)) < 0.1;
      ctx.globalAlpha = ap;
      ctx.fillStyle = C.panel;
      roundRect(ctx, x - 11, y - 11, 22, 22, 7);
      ctx.fill();
      ctx.strokeStyle = near ? C.accent : C.line2;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = ap * (near ? 1 : 0.6);
      ctx.fillStyle = near ? C.accent : C.ink3;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, TAU);
      ctx.fill();
      const out = 20;
      const lx = cx + Math.cos(a) * (R + out);
      const ly = Math.max(11, Math.min(h - 11, cy + Math.sin(a) * (R + out)));
      ctx.globalAlpha = ap * (near ? 1 : 0.72);
      txt(ctx, s, lx, ly, 9.5, near ? C.ink : C.ink3, Math.abs(Math.cos(a)) < 0.3 ? "center" : Math.cos(a) > 0 ? "left" : "right", 600);
    });
    ctx.globalAlpha = 0.8;
    txt(ctx, "CONTINUOUS LIFECYCLE", w * 0.045, 14, 9, C.ink3);
    ctx.globalAlpha = 1;
  },
};

// ---------------------------------------------------------------------------
// semantic — NLP/LLM concept graph
// ---------------------------------------------------------------------------

interface SemanticNode {
  x: number;
  y: number;
  l: string;
  w: number;
  hot?: boolean;
}
interface SemanticState {
  nodes: SemanticNode[];
  edges: [number, number, number][];
  sel: number;
}

const semanticKind: CoverKindDef<SemanticState> = {
  init() {
    const nodes: SemanticNode[] = [
      { x: 0.5, y: 0.17, l: "customer", w: 80 },
      { x: 0.2, y: 0.48, l: "retention", w: 80 },
      { x: 0.5, y: 0.55, l: "prediction", w: 84 },
      { x: 0.82, y: 0.44, l: "churn", w: 60, hot: true },
      { x: 0.52, y: 0.87, l: "risk", w: 50 },
    ];
    const edges: [number, number, number][] = [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 0],
      [1, 2, 1],
      [2, 3, 1],
      [2, 4, 1],
      [3, 4, 0],
      [1, 4, 0],
    ];
    return { nodes, edges, sel: 0 };
  },
  draw(ctx, st, w, h, t, prog, hov, C) {
    const cycleSpeed = hov ? 0.7 : 0.5;
    if (hov) st.sel = Math.floor((t * cycleSpeed) % st.nodes.length);
    const P = (n: SemanticNode, i: number) => ({
      x: (n.x + Math.sin(t * 0.3 + i) * 0.006) * w,
      y: (n.y + Math.cos(t * 0.27 + i * 1.3) * 0.008) * h,
    });
    const pos = st.nodes.map(P);
    st.edges.forEach((e, i) => {
      const seg = clamp01((prog - 0.1 - i * 0.07) / 0.3);
      if (seg <= 0) return;
      const a = pos[e[0]];
      const b = pos[e[1]];
      const lit = hov && (st.sel === e[0] || st.sel === e[1]);
      ctx.globalAlpha = lit ? 1 : e[2] ? 0.8 : 0.45;
      ctx.strokeStyle = lit ? C.accent : C.edge;
      ctx.lineWidth = lit ? 1.2 : e[2] ? 0.8 : 0.6;
      if (!e[2]) ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * seg, a.y + (b.y - a.y) * seg);
      ctx.stroke();
      ctx.setLineDash([]);
      if (lit) drawFlowParticle(ctx, a.x, a.y, b.x, b.y, (t * 1.1 + i * 0.3) % 1, C.accent, 1.5, 0.9, 4);
    });
    st.nodes.forEach((n, i) => {
      const p = pos[i];
      const ap = ease(clamp01((prog - i * 0.08) / 0.3));
      if (ap <= 0) return;
      const lit = hov && st.sel === i;
      const bw = n.w;
      const bh = 24;
      ctx.globalAlpha = ap;
      ctx.fillStyle = C.panel;
      roundRect(ctx, p.x - bw / 2, p.y - bh / 2, bw, bh, 6);
      ctx.fill();
      ctx.strokeStyle = lit ? C.accent : n.hot ? C.risk : C.line2;
      ctx.lineWidth = 1;
      ctx.stroke();
      txt(ctx, n.l, p.x, p.y + 0.5, 9.5, lit ? C.ink : n.hot ? C.risk : C.ink2, "center", 600);
      if (lit) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 26);
        g.addColorStop(0, C.accent);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = ap * 0.22;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 26, 0, TAU);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 0.8;
    txt(ctx, "SEMANTIC SPACE", w * 0.045, 14, 9, C.ink3);
    ctx.globalAlpha = 1;
  },
};

export const COVER_KINDS: Record<CoverKind, CoverKindDef<any>> = {
  churn: churnKind,
  forecast: forecastKind,
  clusters: clustersKind,
  pipeline: pipelineKind,
  lifecycle: lifecycleKind,
  semantic: semanticKind,
};
