import { COVER_KINDS, type CoverColors, type CoverKind } from "../lib/project-cover-kinds";

interface MountedCover {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  kind: CoverKind;
  state: unknown;
  visible: boolean;
  hover: boolean;
  startedAt: number;
  width: number;
  height: number;
  dpr: number;
  staticDrawn: boolean;
}

const covers = new Map<HTMLCanvasElement, MountedCover>();
let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;
let raf = 0;

function sizeCover(c: MountedCover) {
  const rect = c.canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.canvas.width = Math.max(1, Math.round(rect.width * dpr));
  c.canvas.height = Math.max(1, Math.round(rect.height * dpr));
  c.width = rect.width;
  c.height = rect.height;
  c.dpr = dpr;
}

function readColors(): CoverColors {
  const styles = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  const light = document.documentElement.getAttribute("data-theme") === "light";
  return {
    ink: get("--ink", "#eef1f6"),
    ink2: get("--ink-2", "#98a1b2"),
    ink3: get("--ink-3", "#5c6575"),
    line: get("--line", "rgba(255,255,255,.075)"),
    line2: get("--line-2", "rgba(255,255,255,.13)"),
    accent: get("--accent", "#5b8cff"),
    accent2: get("--accent-2", "#9b7cff"),
    star: get("--star", "#dce6ff"),
    edge: get("--edge", "rgba(140,175,255,.3)"),
    risk: light ? "#d93a4d" : "#ff5f6d",
    green: light ? "#1f9d78" : "#34d399",
    amber: light ? "#c58a12" : "#f0b544",
    panel: light ? "rgba(255,255,255,.86)" : "rgba(18,22,32,.72)",
    glow: light ? 0.5 : 1,
  };
}

function loop(reduceMotion: boolean) {
  raf = requestAnimationFrame(() => loop(reduceMotion));
  if (!covers.size) return;
  const colors = readColors();
  const now = performance.now();
  covers.forEach((c) => {
    if (!c.visible || !c.width) return;
    const def = COVER_KINDS[c.kind];
    if (!def) return;
    c.ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
    c.ctx.clearRect(0, 0, c.width, c.height);
    if (reduceMotion) {
      if (c.staticDrawn) return;
      c.staticDrawn = true;
      def.draw(c.ctx, c.state, c.width, c.height, 0, 1, false, colors);
      return;
    }
    const elapsedSec = (now - c.startedAt) / 1000;
    const prog = Math.min(1, elapsedSec / 1.9);
    def.draw(c.ctx, c.state, c.width, c.height, elapsedSec, prog, c.hover, colors);
  });
}

export function initProjectCovers() {
  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>("[data-project-cover]"));
  if (!canvases.length) return;

  cancelAnimationFrame(raf);
  raf = 0;
  io?.disconnect();
  ro?.disconnect();
  covers.clear();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const c = covers.get(entry.target as HTMLCanvasElement);
        if (!c) return;
        c.visible = entry.isIntersecting;
        if (entry.isIntersecting && !c.startedAt) {
          sizeCover(c);
          c.startedAt = performance.now();
        }
      });
    },
    { threshold: 0.12 },
  );

  ro = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const c = covers.get(entry.target as HTMLCanvasElement);
      if (c) sizeCover(c);
    });
  });

  canvases.forEach((canvas) => {
    const kind = canvas.dataset.projectCover as CoverKind;
    const def = COVER_KINDS[kind];
    if (!def) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cover: MountedCover = {
      canvas,
      ctx,
      kind,
      state: def.init(),
      visible: false,
      hover: false,
      startedAt: 0,
      width: 0,
      height: 0,
      dpr: 1,
      staticDrawn: false,
    };
    covers.set(canvas, cover);
    sizeCover(cover);
    requestAnimationFrame(() => sizeCover(cover));

    if ("IntersectionObserver" in window) {
      io!.observe(canvas);
    } else {
      cover.visible = true;
      cover.startedAt = performance.now();
    }
    ro!.observe(canvas);

    const scope = canvas.closest<HTMLElement>("[data-cover-hover-scope]") ?? canvas.parentElement;
    scope?.addEventListener("pointerenter", () => (cover.hover = true));
    scope?.addEventListener("pointerleave", () => (cover.hover = false));
    scope?.addEventListener("focusin", () => (cover.hover = true));
    scope?.addEventListener("focusout", () => (cover.hover = false));
  });

  raf = requestAnimationFrame(() => loop(reduceMotion));

  document.addEventListener(
    "astro:before-swap",
    () => {
      cancelAnimationFrame(raf);
      raf = 0;
      io?.disconnect();
      ro?.disconnect();
      covers.clear();
    },
    { once: true },
  );
}
