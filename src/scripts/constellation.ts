/*
  Hero sphere — a rotating 3D "network globe" (style reference: the TEDx Tokyo
  poster) drawn on a 2D canvas with a hand-rolled projection, so no 3D library
  is shipped. The six focus-area nodes are real DOM buttons positioned on top
  of the canvas every frame, which keeps them focusable and screen-reader
  friendly instead of hit-testing canvas pixels.

  Interaction: dragging anywhere spins the sphere (with inertia), clicking a
  node rotates it to the front, lights its connections, dims the rest and
  opens its detail panel; Escape, the close button or clicking empty space
  closes it and the slow auto-spin resumes.
*/

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface SurfacePoint extends Vec3 {
  size: number;
  phase: number;
}

interface Projected {
  sx: number;
  sy: number;
  z: number;
  scale: number;
}

interface DustParticle {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

const POINT_COUNT = 350;
const NEAREST = 4;
const HUBS = 24;
const RAYS = 18;
const AUTO_SPIN = 0.13; // rad/s
const BASE_TILT = 0.32; // rad — seen slightly from above
const DRAG_SENSITIVITY = 0.0065; // rad per px
const DRAG_THRESHOLD = 5; // px before a press becomes a drag instead of a click
const PERSPECTIVE = 6;
const LABEL_ROOM = 150; // px a node label needs beside its dot
// Direction (view space: x right, y up, z toward the viewer) that tints the
// lower-right of the sphere with the accent color, like the poster's red side.
const TINT_DIR = normalize({ x: 0.62, y: -0.55, z: 0.55 });

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const shortestAngle = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

function buildSurface() {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points: SurfacePoint[] = Array.from({ length: POINT_COUNT }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / POINT_COUNT;
    const r = Math.sqrt(1 - y * y);
    const th = i * golden;
    const p = normalize({
      x: Math.cos(th) * r + (Math.random() - 0.5) * 0.06,
      y: y + (Math.random() - 0.5) * 0.06,
      z: Math.sin(th) * r + (Math.random() - 0.5) * 0.06,
    });
    return { ...p, size: Math.random() * 0.9 + 0.6, phase: Math.random() * Math.PI * 2 };
  });

  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  const add = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push([a, b]);
  };
  const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

  points.forEach((p, i) => {
    const nearest = points
      .map((q, j) => ({ j, d: dot(p, q) }))
      .filter((n) => n.j !== i)
      .sort((a, b) => b.d - a.d)
      .slice(0, NEAREST);
    nearest.forEach((n) => add(i, n.j));
  });

  // A few "hub" points fan out to many neighbors — the dense triangular
  // webs that give the poster its texture.
  for (let h = 0; h < HUBS; h++) {
    const hub = Math.floor(Math.random() * POINT_COUNT);
    points
      .map((q, j) => ({ j, d: dot(points[hub], q) }))
      .filter((n) => n.d > 0.82)
      .sort(() => Math.random() - 0.5)
      .slice(0, 9)
      .forEach((n) => add(hub, n.j));
  }

  const rays = Array.from({ length: RAYS }, () => {
    const from = points[Math.floor(Math.random() * POINT_COUNT)];
    const reach = 1.45 + Math.random() * 0.9;
    const to = normalize({
      x: from.x + (Math.random() - 0.5) * 0.5,
      y: from.y + (Math.random() - 0.5) * 0.5,
      z: from.z + (Math.random() - 0.5) * 0.5,
    });
    return { from, to: { x: to.x * reach, y: to.y * reach, z: to.z * reach } };
  });

  return { points, edges, rays };
}

export function initConstellation() {
  const container = document.querySelector<HTMLElement>("[data-constellation]");
  if (!container || container.dataset.initialized) return;
  const canvas = container.querySelector<HTMLCanvasElement>("[data-constellation-canvas]");
  const ctx = canvas?.getContext("2d");
  const nodeEls = Array.from(container.querySelectorAll<HTMLElement>("[data-constellation-node]"));
  const panels = Array.from(container.querySelectorAll<HTMLElement>("[data-sphere-panel]"));
  if (!canvas || !ctx || !nodeEls.length) return;
  container.dataset.initialized = "true";

  const nodeEdges: [number, number][] = JSON.parse(container.dataset.edges || "[]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const controller = new AbortController();
  const { signal } = controller;

  const nodes = nodeEls.map((el) => {
    const lat = (parseFloat(el.dataset.lat || "0") * Math.PI) / 180;
    const lon = (parseFloat(el.dataset.lon || "0") * Math.PI) / 180;
    return {
      el,
      hit: el.querySelector<HTMLButtonElement>("[data-constellation-hit]")!,
      v: { x: Math.cos(lat) * Math.sin(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) },
      p: { sx: 0, sy: 0, z: 0, scale: 1 } as Projected,
    };
  });
  const neighbors = nodes.map((_, i) =>
    nodeEdges.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a)),
  );

  const { points, edges, rays } = buildSurface();
  const projected: Projected[] = points.map(() => ({ sx: 0, sy: 0, z: 0, scale: 1 }));
  const tint: number[] = points.map(() => 0);

  let width = 0;
  let height = 0;
  let dpr = 1;
  let dust: DustParticle[] = [];

  let yaw = 0.6;
  let pitch = BASE_TILT;
  let yawVel = 0;
  let pitchVel = 0;
  let hovered = -1;
  let focused = -1;
  let locked = false;
  let targetYaw = 0;
  let targetPitch = 0;
  let focusAmt = 0;

  let raf = 0;
  let running = false;
  let inView = false;
  let lastFrame = performance.now();
  const startTime = performance.now();

  // Theme colors are read once per toggle, not per frame (getComputedStyle in
  // the draw loop forces a style recalc 60x/sec).
  let starRGB: [number, number, number] = [220, 230, 255];
  let accentRGB: [number, number, number] = [91, 140, 255];
  let star = "#dce6ff";
  let accent = "#5b8cff";

  function toRGB(color: string): [number, number, number] {
    ctx!.fillStyle = "#000";
    ctx!.fillStyle = color;
    const v = ctx!.fillStyle;
    if (v.startsWith("#")) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)) as [number, number, number];
    const m = v.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"];
    return [Number(m[0]), Number(m[1]), Number(m[2])];
  }

  function readThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    star = styles.getPropertyValue("--star").trim() || "#dce6ff";
    accent = styles.getPropertyValue("--accent").trim() || "#5b8cff";
    starRGB = toRGB(star);
    accentRGB = toRGB(accent);
    if (!running) frame(performance.now());
  }

  const mixRGB = (t: number, alpha: number) => {
    const r = Math.round(starRGB[0] + (accentRGB[0] - starRGB[0]) * t);
    const g = Math.round(starRGB[1] + (accentRGB[1] - starRGB[1]) * t);
    const b = Math.round(starRGB[2] + (accentRGB[2] - starRGB[2]) * t);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  };

  function resize() {
    const rect = container!.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas!.width = Math.max(1, Math.round(width * dpr));
    canvas!.height = Math.max(1, Math.round(height * dpr));
    if (!dust.length) {
      dust = Array.from({ length: 46 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.1 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.3,
      }));
    }
    if (!running) frame(performance.now());
  }

  const isCompact = () => width < 520;

  function layout(entrance: number) {
    const compact = isCompact();
    const panelShift = compact ? 0 : Math.min(width * 0.2, 150);
    const cx = width / 2 - focusAmt * panelShift;
    const cy = height / 2 - (compact ? focusAmt * height * 0.2 : 0);
    const base = Math.min(width, height) * 0.36;
    const R = base * (0.72 + 0.28 * entrance) * (1 + (compact ? -0.22 : 0.06) * focusAmt);
    return { cx, cy, R };
  }

  function project(v: Vec3, cy0: number, sy0: number, cp: number, sp: number, L: { cx: number; cy: number; R: number }, out: Projected) {
    const x1 = v.x * cy0 + v.z * sy0;
    const z1 = -v.x * sy0 + v.z * cy0;
    const y2 = v.y * cp - z1 * sp;
    const z2 = v.y * sp + z1 * cp;
    const s = PERSPECTIVE / (PERSPECTIVE - z2);
    out.sx = L.cx + x1 * L.R * s;
    out.sy = L.cy - y2 * L.R * s;
    out.z = z2;
    out.scale = s;
    return { x: x1, y: y2, z: z2 };
  }

  function draw(elapsed: number, entrance: number) {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, width, height);

    dust.forEach((d) => {
      ctx!.globalAlpha = reduceMotion ? 0.32 : (0.18 + 0.42 * (0.5 + 0.5 * Math.sin(elapsed * d.speed + d.phase))) * entrance;
      ctx!.fillStyle = star;
      ctx!.beginPath();
      ctx!.arc(d.x * width, d.y * height, d.r, 0, Math.PI * 2);
      ctx!.fill();
    });
    ctx!.globalAlpha = 1;

    const L = layout(entrance);
    const cY = Math.cos(yaw);
    const sY = Math.sin(yaw);
    const cP = Math.cos(pitch);
    const sP = Math.sin(pitch);

    points.forEach((pt, i) => {
      const v = project(pt, cY, sY, cP, sP, L, projected[i]);
      tint[i] = smoothstep(-0.05, 0.75, v.x * TINT_DIR.x + v.y * TINT_DIR.y + v.z * TINT_DIR.z);
    });

    const dimmed = 1 - focusAmt * 0.45;
    const depthAlpha = (z: number) => 0.12 + 0.88 * smoothstep(-1, 0.9, z);

    // Surface web, bucketed into a handful of paths by tint and depth so the
    // ~1k lines cost a few dozen stroke() calls instead of one each.
    const buckets = new Map<string, Path2D>();
    edges.forEach(([a, b]) => {
      const pa = projected[a];
      const pb = projected[b];
      const t = Math.round(((tint[a] + tint[b]) / 2) * 3) / 3;
      const al = Math.round(depthAlpha((pa.z + pb.z) / 2) * 5) / 5;
      const key = `${t}|${al}`;
      let path = buckets.get(key);
      if (!path) buckets.set(key, (path = new Path2D()));
      path.moveTo(pa.sx, pa.sy);
      path.lineTo(pb.sx, pb.sy);
    });
    ctx!.lineWidth = 0.6;
    buckets.forEach((path, key) => {
      const [t, al] = key.split("|").map(Number);
      ctx!.strokeStyle = mixRGB(t, al * 0.5 * dimmed * entrance);
      ctx!.stroke(path);
    });

    const rayTmp: Projected = { sx: 0, sy: 0, z: 0, scale: 1 };
    ctx!.lineWidth = 0.5;
    rays.forEach((ray) => {
      const a = { ...rayTmp };
      project(ray.from, cY, sY, cP, sP, L, a);
      project(ray.to, cY, sY, cP, sP, L, rayTmp);
      const grad = ctx!.createLinearGradient(a.sx, a.sy, rayTmp.sx, rayTmp.sy);
      const al = depthAlpha(a.z) * 0.45 * dimmed * entrance;
      grad.addColorStop(0, mixRGB(0, al));
      grad.addColorStop(1, mixRGB(0, 0));
      ctx!.strokeStyle = grad;
      ctx!.beginPath();
      ctx!.moveTo(a.sx, a.sy);
      ctx!.lineTo(rayTmp.sx, rayTmp.sy);
      ctx!.stroke();
    });

    points.forEach((pt, i) => {
      const p = projected[i];
      const twinkle = reduceMotion ? 0.8 : 0.65 + 0.35 * Math.sin(elapsed * 1.6 + pt.phase);
      ctx!.fillStyle = mixRGB(tint[i], depthAlpha(p.z) * twinkle * dimmed * entrance);
      ctx!.beginPath();
      ctx!.arc(p.sx, p.sy, pt.size * p.scale * (0.6 + 0.4 * smoothstep(-1, 1, p.z)), 0, Math.PI * 2);
      ctx!.fill();
    });

    // Focus-area nodes and their connections, on top of the surface web.
    nodes.forEach((n) => project(n.v, cY, sY, cP, sP, L, n.p));
    const related = (i: number) => focused === -1 || i === focused || neighbors[focused].includes(i);

    nodeEdges.forEach(([a, b], k) => {
      const pa = nodes[a].p;
      const pb = nodes[b].p;
      const seg = reduceMotion ? 1 : smoothstep(0, 1, (entrance - k * 0.035) / 0.5);
      if (seg <= 0) return;
      const lit = hovered === a || hovered === b || (focused !== -1 && (a === focused || b === focused));
      const faded = focused !== -1 && !lit;
      ctx!.globalAlpha = depthAlpha((pa.z + pb.z) / 2) * (faded ? 0.2 : lit ? 1 : 0.7);
      ctx!.strokeStyle = lit ? accent : mixRGB(0.5, 0.75);
      ctx!.lineWidth = lit ? 1.4 : 1;
      ctx!.beginPath();
      ctx!.moveTo(pa.sx, pa.sy);
      ctx!.lineTo(pa.sx + (pb.sx - pa.sx) * seg, pa.sy + (pb.sy - pa.sy) * seg);
      ctx!.stroke();
    });

    nodes.forEach((n, i) => {
      const p = n.p;
      const lit = hovered === i || focused === i;
      const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(elapsed * 1.1 + i);
      const front = smoothstep(-0.6, 0.4, p.z);
      const radius = ((lit ? 28 : 17) + pulse * 3) * p.scale;
      const gradient = ctx!.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, radius);
      gradient.addColorStop(0, accent);
      gradient.addColorStop(0.28, mixRGB(1, 0.32));
      gradient.addColorStop(1, mixRGB(1, 0));
      const strength = (related(i) ? 1 : 0.3) * (0.35 + 0.65 * front) * entrance;
      ctx!.globalAlpha = strength * (lit ? 0.95 : 0.65);
      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalAlpha = strength;
      ctx!.fillStyle = lit ? "#ffffff" : star;
      ctx!.beginPath();
      ctx!.arc(p.sx, p.sy, (lit ? 3.4 : 2.4) * p.scale, 0, Math.PI * 2);
      ctx!.fill();

      n.el.style.transform = `translate(${p.sx.toFixed(1)}px, ${p.sy.toFixed(1)}px)`;
      n.el.style.zIndex = String(Math.round((p.z + 1) * 10) + 1);
      n.el.style.opacity = String(((0.32 + 0.68 * front) * entrance).toFixed(3));
      // Labels go on the outer side of the sphere, unless that would push
      // them past the canvas edge (the container clips overflow).
      const outerLeft = p.sx < L.cx;
      n.el.classList.toggle("is-left", outerLeft ? p.sx > LABEL_ROOM : p.sx > width - LABEL_ROOM);
      n.el.classList.toggle("is-dimmed", !related(i));
      n.el.classList.toggle("is-active", lit);
    });
    ctx!.globalAlpha = 1;
  }

  function step(dt: number) {
    const ease = (rate: number) => (reduceMotion ? 1 : 1 - Math.exp(-dt * rate));
    if (locked) {
      yaw += shortestAngle(yaw, targetYaw) * ease(4.5);
      pitch += (targetPitch - pitch) * ease(4.5);
    } else if (!dragging) {
      const spin = focused === -1 && !reduceMotion ? AUTO_SPIN : 0;
      yaw += (spin + yawVel) * dt;
      pitch += pitchVel * dt;
      yawVel *= Math.exp(-dt * 2.6);
      pitchVel *= Math.exp(-dt * 2.6);
      if (focused === -1) pitch += (BASE_TILT - pitch) * ease(1.2);
    }
    focusAmt += ((focused === -1 ? 0 : 1) - focusAmt) * ease(5);
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    step(dt);
    const entrance = reduceMotion ? 1 : smoothstep(0, 1, (now - startTime) / 1600);
    draw((now - startTime) / 1000, entrance);
  }

  const loop = (now: number) => {
    frame(now);
    raf = requestAnimationFrame(loop);
  };

  function sync() {
    const shouldRun = inView && !document.hidden;
    if (shouldRun && !running) {
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  function openFocus(i: number) {
    focused = i;
    locked = true;
    yawVel = 0;
    pitchVel = 0;
    const v = nodes[i].v;
    targetYaw = Math.atan2(-v.x, v.z);
    targetPitch = Math.atan2(v.y, Math.hypot(v.x, v.z));
    panels.forEach((p, idx) => {
      const show = idx === i;
      if (show && p.hidden && !reduceMotion) {
        p.animate(
          [
            { opacity: 0, filter: "blur(8px)", translate: "16px 0" },
            { opacity: 1, filter: "blur(0)", translate: "0 0" },
          ],
          { duration: 480, delay: 120, easing: "cubic-bezier(.2,.7,.3,1)", fill: "backwards" },
        );
      }
      p.hidden = !show;
    });
    nodes.forEach((n, idx) => n.hit.setAttribute("aria-expanded", String(idx === i)));
  }

  function closeFocus(restoreFocus = false) {
    if (focused === -1) return;
    const last = focused;
    focused = -1;
    locked = false;
    panels.forEach((p) => (p.hidden = true));
    nodes.forEach((n) => n.hit.setAttribute("aria-expanded", "false"));
    if (restoreFocus) nodes[last].hit.focus();
  }

  // --- Pointer: press + move spins the sphere; press + release on a node is a click.
  let pressing = false;
  let dragging = false;
  let suppressClick = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let pointerType = "mouse";

  container.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest("[data-sphere-panel]")) return;
      pressing = true;
      dragging = false;
      suppressClick = false;
      pointerType = e.pointerType;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      lastT = performance.now();
    },
    { signal },
  );

  container.addEventListener(
    "pointermove",
    (e) => {
      if (!pressing) return;
      if (!dragging) {
        if (Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) return;
        dragging = true;
        suppressClick = true;
        locked = false;
        container.setPointerCapture(e.pointerId);
        container.classList.add("is-dragging");
      }
      const now = performance.now();
      const dt = Math.max(8, now - lastT) / 1000;
      const dx = e.clientX - lastX;
      // Vertical touch drags scroll the page (touch-action: pan-y), so only
      // mouse/pen tilt the sphere up and down.
      const dy = pointerType === "touch" ? 0 : e.clientY - lastY;
      yaw += dx * DRAG_SENSITIVITY;
      pitch = Math.max(-1.1, Math.min(1.1, pitch + dy * DRAG_SENSITIVITY));
      yawVel = (dx * DRAG_SENSITIVITY) / dt;
      pitchVel = (dy * DRAG_SENSITIVITY) / dt;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      if (!running) frame(now);
    },
    { signal },
  );

  const endPress = (e: PointerEvent) => {
    if (!pressing) return;
    pressing = false;
    if (dragging) {
      dragging = false;
      container.classList.remove("is-dragging");
      if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
      // A flick that ended with the pointer resting shouldn't keep spinning.
      if (performance.now() - lastT > 80) {
        yawVel = 0;
        pitchVel = 0;
      }
    }
  };
  container.addEventListener("pointerup", endPress, { signal });
  container.addEventListener("pointercancel", endPress, { signal });

  container.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-sphere-panel]")) return;
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      const hit = target.closest<HTMLButtonElement>("[data-constellation-hit]");
      if (hit) {
        const i = Number(hit.dataset.index);
        if (focused === i) closeFocus();
        else openFocus(i);
      } else {
        closeFocus();
      }
    },
    { signal },
  );

  nodes.forEach((n, i) => {
    n.hit.addEventListener("mouseenter", () => (hovered = i), { signal });
    n.hit.addEventListener("mouseleave", () => hovered === i && (hovered = -1), { signal });
    n.hit.addEventListener("focus", () => (hovered = i), { signal });
    n.hit.addEventListener("blur", () => hovered === i && (hovered = -1), { signal });
  });

  container.querySelectorAll<HTMLButtonElement>("[data-sphere-close]").forEach((btn) =>
    btn.addEventListener("click", () => closeFocus(true), { signal }),
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && focused !== -1) closeFocus(true);
    },
    { signal },
  );

  readThemeColors();
  const themeObserver = new MutationObserver(readThemeColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Past the hero there's nothing left to show; without this the canvas would
  // keep redrawing for the rest of the visit.
  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      sync();
    },
    { rootMargin: "200px" },
  );
  io.observe(container);
  document.addEventListener("visibilitychange", sync, { signal });

  document.addEventListener(
    "astro:before-swap",
    () => {
      controller.abort();
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      running = false;
      cancelAnimationFrame(raf);
    },
    { once: true },
  );
}
