interface NebulaBody {
  baseXPct: number;
  baseYPct: number;
  r: number;
  driftPhase: number;
  driftSpeed: number;
  driftAmp: number;
  offsetX: number;
  offsetY: number;
  velX: number;
  velY: number;
}

interface NebulaStar extends NebulaBody {
  mix: number;
}

interface NebulaCloud extends NebulaBody {
  colorVar: string;
  breathePhase: number;
}

// Same "let go and it settles back" spring feel as the hero constellation / timeline —
// stars are light dust (snappy), clouds are heavier gas (slow, sluggish response).
const STAR_SPRING_STIFFNESS = 0.09;
const STAR_SPRING_DAMPING = 0.78;
const STAR_REPEL_RADIUS = 130;
const STAR_REPEL_STRENGTH = 2.2;

const CLOUD_SPRING_STIFFNESS = 0.035;
const CLOUD_SPRING_DAMPING = 0.86;
const CLOUD_REPEL_RADIUS = 260;
const CLOUD_REPEL_STRENGTH = 0.9;

const CLOUD_COLOR_VARS = ["--nebula-cloud-1", "--nebula-cloud-2", "--nebula-cloud-3", "--nebula-cloud-4"];

export function initNebula() {
  const container = document.querySelector<HTMLElement>("[data-nebula]");
  const canvas = container?.querySelector<HTMLCanvasElement>("[data-nebula-canvas]");
  const ctx = canvas?.getContext("2d");
  if (!container || !canvas || !ctx) return;
  if (container.dataset.initialized) return;
  container.dataset.initialized = "true";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Fewer bodies on narrow viewports — same reason the repel/glow math stays untouched,
  // this is purely a mobile CPU budget cut, not a visual redesign.
  const isNarrow = window.matchMedia("(max-width: 640px)").matches;
  const controller = new AbortController();
  const { signal } = controller;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let running = false;
  let pointerX = -9999;
  let pointerY = -9999;
  let pointerActive = false;
  const startTime = performance.now();

  // Colors only change on theme toggle, not every frame — reading them via
  // getComputedStyle inside the draw loop forces a style recalc 60x/sec for no reason.
  let accent = "#5b8cff";
  let accent2 = "#9b7cff";
  let star = "#dce6ff";
  let cloudColors: Record<string, string> = {};

  function readThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    accent = styles.getPropertyValue("--accent").trim() || "#5b8cff";
    accent2 = styles.getPropertyValue("--accent-2").trim() || "#9b7cff";
    star = styles.getPropertyValue("--star").trim() || "#dce6ff";
    cloudColors = {};
    CLOUD_COLOR_VARS.forEach((v) => {
      cloudColors[v] = styles.getPropertyValue(v).trim();
    });
  }
  readThemeColors();

  const themeObserver = new MutationObserver(readThemeColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const starCount = isNarrow ? 24 : 46;
  const cloudCount = isNarrow ? 3 : 5;

  const stars: NebulaStar[] = Array.from({ length: starCount }, () => ({
    // Weighted toward the right two-thirds of the card, where the copy leaves empty space.
    baseXPct: 38 + Math.random() * 82,
    baseYPct: Math.random() * 100,
    r: Math.random() * 2.2 + 0.9,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: Math.random() * 0.35 + 0.12,
    driftAmp: Math.random() * 10 + 6,
    mix: Math.random(),
    offsetX: 0,
    offsetY: 0,
    velX: 0,
    velY: 0,
  }));

  const clouds: NebulaCloud[] = Array.from({ length: cloudCount }, (_, i) => ({
    baseXPct: 32 + Math.random() * 88,
    baseYPct: Math.random() * 100,
    r: Math.random() * 90 + 130,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: Math.random() * 0.08 + 0.03,
    driftAmp: Math.random() * 16 + 10,
    colorVar: CLOUD_COLOR_VARS[i % CLOUD_COLOR_VARS.length],
    breathePhase: Math.random() * Math.PI * 2,
    offsetX: 0,
    offsetY: 0,
    velX: 0,
    velY: 0,
  }));

  function resize() {
    const rect = container!.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas!.width = Math.max(1, Math.round(width * dpr));
    canvas!.height = Math.max(1, Math.round(height * dpr));
  }

  function ambient(body: NebulaBody, elapsed: number) {
    const x = (body.baseXPct / 100) * width + Math.cos(elapsed * body.driftSpeed + body.driftPhase) * body.driftAmp;
    const y = (body.baseYPct / 100) * height + Math.sin(elapsed * body.driftSpeed * 0.8 + body.driftPhase) * body.driftAmp;
    return { x, y };
  }

  function mixColor(a: string, b: string, t: number) {
    return t < 0.5 ? a : b;
  }

  function draw(elapsed: number) {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, width, height);

    // Gas layer first — soft, slow-breathing color washes behind the star field.
    clouds.forEach((c) => {
      const base = ambient(c, elapsed);
      const x = base.x + c.offsetX;
      const y = base.y + c.offsetY;
      const color = cloudColors[c.colorVar];
      if (!color) return;
      const breathe = reduceMotion ? 0.85 : 0.78 + 0.22 * Math.sin(elapsed * 0.35 + c.breathePhase);
      const gradient = ctx!.createRadialGradient(x, y, 0, x, y, c.r);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.55, color);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.globalAlpha = breathe;
      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(x, y, c.r, 0, Math.PI * 2);
      ctx!.fill();
    });

    stars.forEach((p) => {
      const base = ambient(p, elapsed);
      const x = base.x + p.offsetX;
      const y = base.y + p.offsetY;
      const glowR = p.r * 9;
      const gradient = ctx!.createRadialGradient(x, y, 0, x, y, glowR);
      const color = mixColor(accent, accent2, p.mix);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.35, color);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.globalAlpha = 0.16;
      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(x, y, glowR, 0, Math.PI * 2);
      ctx!.fill();

      // Soft core: a second, tighter gradient instead of a hard dot + ctx.filter blur.
      // Canvas 2D filter() runs an unaccelerated per-shape blur pass on most browsers —
      // measurably ~2.5x slower per star and a real contributor to the scroll jank this
      // section caused — a feathered gradient reads just as soft for free.
      const coreR = p.r * 2.4;
      const core = ctx!.createRadialGradient(x, y, 0, x, y, coreR);
      core.addColorStop(0, star);
      core.addColorStop(0.45, star);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.globalAlpha = 0.6;
      ctx!.fillStyle = core;
      ctx!.beginPath();
      ctx!.arc(x, y, coreR, 0, Math.PI * 2);
      ctx!.fill();
    });

    ctx!.globalAlpha = 1;
  }

  function applySpring(body: NebulaBody, stiffness: number, damping: number) {
    const accX = -stiffness * body.offsetX;
    const accY = -stiffness * body.offsetY;
    body.velX = (body.velX + accX) * damping;
    body.velY = (body.velY + accY) * damping;
    body.offsetX += body.velX;
    body.offsetY += body.velY;
  }

  function applyRepel(body: NebulaBody, elapsed: number, radius: number, strength: number) {
    if (!pointerActive) return;
    const base = ambient(body, elapsed);
    const dx = base.x + body.offsetX - pointerX;
    const dy = base.y + body.offsetY - pointerY;
    const dist = Math.hypot(dx, dy);
    if (dist < radius && dist > 0.001) {
      const force = (1 - dist / radius) * strength;
      body.velX += (dx / dist) * force;
      body.velY += (dy / dist) * force;
    }
  }

  function updatePhysics() {
    const elapsed = (performance.now() - startTime) / 1000;
    stars.forEach((p) => {
      applyRepel(p, elapsed, STAR_REPEL_RADIUS, STAR_REPEL_STRENGTH);
      applySpring(p, STAR_SPRING_STIFFNESS, STAR_SPRING_DAMPING);
    });
    clouds.forEach((c) => {
      applyRepel(c, elapsed, CLOUD_REPEL_RADIUS, CLOUD_REPEL_STRENGTH);
      applySpring(c, CLOUD_SPRING_STIFFNESS, CLOUD_SPRING_DAMPING);
    });
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(container);
  resize();

  function loop(now: number) {
    updatePhysics();
    draw((now - startTime) / 1000);
    raf = requestAnimationFrame(loop);
  }

  let inView = false;

  function sync() {
    const shouldRun = inView && !document.hidden;
    if (shouldRun && !running) {
      running = true;
      raf = requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  if (reduceMotion) {
    draw(0);
  } else {
    // Only animate while the contact card is actually on screen — it sits at the very
    // bottom of the page, so without this the canvas was redrawing 60x/sec for the
    // entire visit even if the visitor never scrolled anywhere near it.
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "200px" },
    );
    io.observe(container);

    document.addEventListener("visibilitychange", sync, { signal });

    container.addEventListener(
      "pointermove",
      (e) => {
        const rect = container.getBoundingClientRect();
        pointerX = e.clientX - rect.left;
        pointerY = e.clientY - rect.top;
        pointerActive = true;
      },
      { signal },
    );
    container.addEventListener("pointerleave", () => (pointerActive = false), { signal });

    document.addEventListener(
      "astro:before-swap",
      () => {
        controller.abort();
        ro.disconnect();
        io.disconnect();
        themeObserver.disconnect();
        stop();
      },
      { once: true },
    );
    return;
  }

  document.addEventListener(
    "astro:before-swap",
    () => {
      controller.abort();
      ro.disconnect();
      themeObserver.disconnect();
      stop();
    },
    { once: true },
  );
}
