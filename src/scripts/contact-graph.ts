/*
  Contact card graph — an Obsidian-style node graph that replaces the WebGL nebula (which looked
  different on every GPU). Nodes drift slowly and link to their neighbours; the cursor joins the
  graph as one more node (drawn as a large accent dot that replaces the system cursor inside the card);
  hovering or focusing a contact button pulls the nearest nodes' links into it, in that button's color.
  Plain 2D canvas: the same on every machine and far lighter than a shader.
*/

interface GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  label?: string;
}

interface LinkTarget {
  el: HTMLElement;
  color: () => string;
  goal: number;
  mix: number;
}

interface Palette {
  ink: string;
  node: string;
  hub: string;
  accent: string;
  label: string;
}

// Tools from the site's own stack; labels stay in English in both languages, like the tool names.
const HUBS = ["SQL", "Python", "Power BI", "Analytics", "Machine Learning"];
const LINK_DIST = 118;
const CURSOR_DIST = 170;
const CTA_LINKS = 14;
const MOBILE_FRAME_MS = 1000 / 30;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  return {
    ink: get("--ink", "#eef1f6"),
    node: get("--ink-3", "#7e8592"),
    hub: get("--ink-2", "#98a1b2"),
    accent: get("--accent", "#ef4d56"),
    label: get("--ink-2", "#98a1b2"),
  };
}

/** Nodes in normalized [0,1] coordinates, denser where the copy isn't (right on desktop, bottom on phones). */
function makeNodes(count: number, compact: boolean): GraphNode[] {
  const r = seeded(29);
  const place = () =>
    compact
      ? { x: 0.04 + r() * 0.92, y: r() < 0.92 ? 0.58 + r() * 0.39 : 0.05 + r() * 0.5 }
      : { x: r() < 0.92 ? 0.52 + r() * 0.45 : 0.03 + r() * 0.47, y: 0.06 + r() * 0.88 };
  const nodes: GraphNode[] = Array.from({ length: count }, () => ({
    ...place(),
    vx: (r() - 0.5) * 0.012,
    vy: (r() - 0.5) * 0.012,
    r: 1.1 + r() * 1.5,
    phase: r() * Math.PI * 2,
  }));
  HUBS.forEach((label, i) => {
    const n = nodes[i];
    n.label = label;
    n.r = 3.2;
    if (compact) {
      n.x = 0.12 + (i / (HUBS.length - 1)) * 0.76;
      n.y = 0.66 + (i % 2) * 0.16;
    } else {
      n.x = 0.6 + (i % 2) * 0.2 + (i === 4 ? 0.06 : 0);
      n.y = 0.16 + i * 0.17;
    }
  });
  return nodes;
}

export function initContactGraph() {
  const container = document.querySelector<HTMLElement>("[data-contact-graph]");
  const canvas = container?.querySelector<HTMLCanvasElement>("canvas");
  const ctx = canvas?.getContext("2d");
  if (!container || !canvas || !ctx || container.dataset.initialized) return;
  container.dataset.initialized = "true";

  const card = container.parentElement ?? container;
  // GitHub follows the text color (black in light, white in dark) so its links show on both themes.
  const linkColor = (href: string) =>
    href.includes("github.com")
      ? () => palette.ink
      : href.includes("linkedin.com")
        ? () => "#0a66c2"
        : () => palette.accent;
  const targets: LinkTarget[] = Array.from(card.querySelectorAll<HTMLAnchorElement>("a[href]")).map((el) => ({
    el,
    color: linkColor(el.href),
    goal: 0,
    mix: 0,
  }));
  const dot = card.querySelector<HTMLElement>("[data-contact-cursor]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 1023px)");
  const controller = new AbortController();
  const { signal } = controller;

  let palette = readPalette();
  let width = 1;
  let height = 1;
  let nodes: GraphNode[] = [];
  let compact = false;
  let cursor: { x: number; y: number } | null = null;
  let raf = 0;
  let inView = false;
  let lastFrame = 0;
  let lastTime = performance.now();

  function resize() {
    const rect = container!.getBoundingClientRect();
    const dpr = small.matches ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas!.width = Math.round(width * dpr);
    canvas!.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const nextCompact = width < 640;
    if (!nodes.length || nextCompact !== compact) {
      compact = nextCompact;
      nodes = makeNodes(Math.round(Math.min(90, Math.max(38, (width * height) / 9500))), compact);
    }
    draw(0);
  }

  function centerOf(el: HTMLElement) {
    const c = el.getBoundingClientRect();
    const box = container!.getBoundingClientRect();
    return { x: c.left + c.width / 2 - box.left, y: c.top + c.height / 2 - box.top };
  }

  function step(dt: number, t: number) {
    for (const n of nodes) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      if (n.x < 0.02 || n.x > 0.98) n.vx *= -1;
      if (n.y < 0.03 || n.y > 0.97) n.vy *= -1;
      n.x = Math.min(0.98, Math.max(0.02, n.x));
      n.y = Math.min(0.97, Math.max(0.03, n.y));
      if (cursor) {
        // A gentle pull toward the cursor, like dragging a node in Obsidian's graph view.
        const dx = cursor.x / width - n.x;
        const dy = cursor.y / height - n.y;
        const d = Math.hypot(dx * width, dy * height);
        if (d < CURSOR_DIST && d > 1) {
          const f = (1 - d / CURSOR_DIST) * 0.05 * dt;
          n.x += dx * f;
          n.y += dy * f;
        }
      }
    }
    for (const tg of targets) tg.mix += (tg.goal - tg.mix) * Math.min(1, dt * 5);
    void t;
  }

  function draw(t: number) {
    ctx!.clearRect(0, 0, width, height);
    // On phones the copy covers most of the card, so the graph stays a quieter background.
    canvas!.style.opacity = compact ? "0.6" : "1";
    const pts = nodes.map((n) => ({ x: n.x * width, y: n.y * height, n }));

    ctx!.lineWidth = 1;
    ctx!.strokeStyle = palette.node;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d > LINK_DIST) continue;
        ctx!.globalAlpha = (1 - d / LINK_DIST) * 0.42;
        ctx!.beginPath();
        ctx!.moveTo(pts[i].x, pts[i].y);
        ctx!.lineTo(pts[j].x, pts[j].y);
        ctx!.stroke();
      }
    }

    if (cursor) {
      ctx!.strokeStyle = palette.accent;
      for (const p of pts) {
        const d = Math.hypot(p.x - cursor.x, p.y - cursor.y);
        if (d > CURSOR_DIST) continue;
        ctx!.globalAlpha = (1 - d / CURSOR_DIST) * 0.55;
        ctx!.beginPath();
        ctx!.moveTo(cursor.x, cursor.y);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();
      }
    }

    for (const tg of targets) {
      if (tg.mix <= 0.01) continue;
      const target = centerOf(tg.el);
      // Only nodes from the graph side feed the button. Straight links stay faint so they read as
      // background behind the copy they cross.
      const nearest = pts
        .filter((p) => (compact ? p.y > height * 0.55 : p.x > width * 0.5))
        .sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y))
        .slice(0, CTA_LINKS);
      const color = tg.color();
      ctx!.strokeStyle = color;
      ctx!.fillStyle = color;
      nearest.forEach((p, i) => {
        const reach = Math.min(1, Math.max(0, tg.mix * 1.4 - i * 0.03));
        if (reach <= 0) return;
        const ex = p.x + (target.x - p.x) * reach;
        const ey = p.y + (target.y - p.y) * reach;
        ctx!.globalAlpha = 0.2 * reach;
        ctx!.beginPath();
        ctx!.moveTo(p.x, p.y);
        ctx!.lineTo(ex, ey);
        ctx!.stroke();
        if (reach >= 1 && !reduceMotion) {
          // A pulse travels along each link into the button.
          const u = (t * 0.7 + i * 0.13) % 1;
          ctx!.globalAlpha = 0.45;
          ctx!.beginPath();
          ctx!.arc(p.x + (target.x - p.x) * u, p.y + (target.y - p.y) * u, 1.8, 0, Math.PI * 2);
          ctx!.fill();
        }
      });
    }

    ctx!.font = `500 10.5px "Satoshi", ui-sans-serif, system-ui, sans-serif`;
    ctx!.textBaseline = "middle";
    for (const p of pts) {
      const hub = !!p.n.label;
      const near = cursor ? Math.hypot(p.x - cursor.x, p.y - cursor.y) < CURSOR_DIST : false;
      const breathe = reduceMotion ? 1 : 0.85 + 0.15 * Math.sin(t * 1.4 + p.n.phase);
      ctx!.globalAlpha = (hub ? 0.95 : 0.7) * breathe;
      ctx!.fillStyle = near ? palette.accent : hub ? palette.hub : palette.node;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.n.r, 0, Math.PI * 2);
      ctx!.fill();
      if (hub && !compact) {
        ctx!.globalAlpha = 0.8;
        ctx!.fillStyle = palette.label;
        // Labels that would run past the card edge are drawn on the node's left instead.
        const lw = ctx!.measureText(p.n.label!).width;
        const right = p.x + p.n.r + 6 + lw < width - 8;
        ctx!.textAlign = right ? "left" : "right";
        ctx!.fillText(p.n.label!, right ? p.x + p.n.r + 6 : p.x - p.n.r - 6, p.y);
      }
    }
    ctx!.globalAlpha = 1;
  }

  function frame(now: number) {
    raf = 0;
    if (!inView) return;
    if (small.matches && now - lastFrame < MOBILE_FRAME_MS) {
      raf = requestAnimationFrame(frame);
      return;
    }
    lastFrame = now;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    step(dt, now / 1000);
    draw(now / 1000);
    raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (reduceMotion) {
      for (const tg of targets) tg.mix = tg.goal;
      draw(0);
      return;
    }
    if (!raf && inView) {
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  card.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      const box = container.getBoundingClientRect();
      cursor = { x: e.clientX - box.left, y: e.clientY - box.top };
      if (dot) {
        // Moved on the event itself, not in the animation frame, so the dot never lags the pointer.
        dot.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
        dot.dataset.visible = "true";
      }
      wake();
    },
    { signal },
  );
  card.addEventListener(
    "pointerleave",
    () => {
      cursor = null;
      if (dot) dot.dataset.visible = "false";
      wake();
    },
    { signal },
  );
  for (const tg of targets) {
    const on = () => {
      tg.goal = 1;
      wake();
    };
    const off = () => {
      tg.goal = 0;
      wake();
    };
    tg.el.addEventListener("pointerenter", on, { signal });
    tg.el.addEventListener("pointerleave", off, { signal });
    tg.el.addEventListener("focus", on, { signal });
    tg.el.addEventListener("blur", off, { signal });
  }

  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) wake();
  });
  io.observe(container);
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const themeObserver = new MutationObserver(() => {
    palette = readPalette();
    draw(performance.now() / 1000);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  document.addEventListener(
    "astro:before-swap",
    () => {
      controller.abort();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
    },
    { once: true },
  );

  resize();
}
