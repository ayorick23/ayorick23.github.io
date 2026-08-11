interface DustParticle {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface NodeState {
  el: HTMLElement;
  hit: HTMLElement;
  basePctX: number;
  basePctY: number;
  baseXpx: number;
  baseYpx: number;
  offsetX: number;
  offsetY: number;
  velX: number;
  velY: number;
  dragging: boolean;
  dragStartMouse: { x: number; y: number };
  dragStartOffset: { x: number; y: number };
}

// Spring constants for the "let go and it settles back" feel (Obsidian graph view style).
const SPRING_STIFFNESS = 0.09;
const SPRING_DAMPING = 0.78;

export function initConstellation() {
  const container = document.querySelector<HTMLElement>("[data-constellation]");
  if (!container) return;

  const canvas = container.querySelector<HTMLCanvasElement>("[data-constellation-canvas]");
  const nodeEls = Array.from(container.querySelectorAll<HTMLElement>("[data-constellation-node]"));
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx || !nodeEls.length) return;

  const edges: [number, number][] = JSON.parse(container.dataset.edges || "[]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const controller = new AbortController();
  const { signal } = controller;

  const states: NodeState[] = nodeEls.map((el) => {
    const hit = el.querySelector<HTMLElement>("[data-constellation-hit]")!;
    return {
      el,
      hit,
      basePctX: parseFloat(el.dataset.x || "0"),
      basePctY: parseFloat(el.dataset.y || "0"),
      baseXpx: 0,
      baseYpx: 0,
      offsetX: 0,
      offsetY: 0,
      velX: 0,
      velY: 0,
      dragging: false,
      dragStartMouse: { x: 0, y: 0 },
      dragStartOffset: { x: 0, y: 0 },
    };
  });

  let width = 0;
  let height = 0;
  let dpr = 1;
  let dust: DustParticle[] = [];
  let hovered = -1;
  let raf = 0;
  const startTime = performance.now();

  function resize() {
    const rect = container!.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas!.width = Math.max(1, width * dpr);
    canvas!.height = Math.max(1, height * dpr);
    states.forEach((s) => {
      s.baseXpx = (s.basePctX / 100) * width;
      s.baseYpx = (s.basePctY / 100) * height;
    });
    if (!dust.length) {
      dust = Array.from({ length: 46 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.1 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.3,
      }));
    }
  }

  function pos(i: number) {
    const s = states[i];
    return { x: s.baseXpx + s.offsetX, y: s.baseYpx + s.offsetY };
  }

  function draw(elapsed: number, progress: number) {
    const styles = getComputedStyle(document.documentElement);
    const star = styles.getPropertyValue("--star").trim() || "#dce6ff";
    const edgeColor = styles.getPropertyValue("--edge").trim() || "rgba(140,175,255,.3)";
    const accent = styles.getPropertyValue("--accent").trim() || "#5b8cff";

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, width, height);

    dust.forEach((d) => {
      const alpha = reduceMotion
        ? 0.32
        : (0.18 + 0.42 * (0.5 + 0.5 * Math.sin(elapsed * d.speed + d.phase))) * progress;
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = star;
      ctx!.beginPath();
      ctx!.arc(d.x * width, d.y * height, d.r, 0, Math.PI * 2);
      ctx!.fill();
    });

    const per = 1 / Math.max(edges.length, 1);
    edges.forEach(([a, b], i) => {
      const seg = reduceMotion
        ? 1
        : Math.max(0, Math.min(1, (progress - i * per * 0.7) / (per * 1.6)));
      if (seg <= 0) return;
      const pa = pos(a);
      const pb = pos(b);
      const lit = hovered === a || hovered === b;
      ctx!.globalAlpha = lit ? 1 : 0.85;
      ctx!.strokeStyle = lit ? accent : edgeColor;
      ctx!.lineWidth = lit ? 1.1 : 0.7;
      ctx!.beginPath();
      ctx!.moveTo(pa.x, pa.y);
      ctx!.lineTo(pa.x + (pb.x - pa.x) * seg, pa.y + (pb.y - pa.y) * seg);
      ctx!.stroke();
    });

    states.forEach((_, i) => {
      const p = pos(i);
      const appear = reduceMotion
        ? 1
        : Math.max(0, Math.min(1, (progress - 0.12 - i * 0.07) / 0.3));
      if (appear <= 0) return;
      const lit = hovered === i || states[i].dragging;
      const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(elapsed * 1.1 + i);
      const radius = (lit ? 26 : 16) + pulse * 3;
      const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      gradient.addColorStop(0, accent);
      gradient.addColorStop(0.28, "rgba(120,160,255,.32)");
      gradient.addColorStop(1, "rgba(120,160,255,0)");
      ctx!.globalAlpha = appear * (lit ? 0.95 : 0.6);
      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalAlpha = appear;
      ctx!.fillStyle = lit ? "#ffffff" : star;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, lit ? 3.2 : 2.2, 0, Math.PI * 2);
      ctx!.fill();
    });

    ctx!.globalAlpha = 1;
  }

  function setHover(i: number) {
    hovered = i;
    states.forEach((s, idx) => s.el.classList.toggle("is-active", idx === i || s.dragging));
  }

  function updateSprings() {
    states.forEach((s) => {
      if (s.dragging) return;
      if (
        Math.abs(s.offsetX) < 0.05 &&
        Math.abs(s.offsetY) < 0.05 &&
        Math.abs(s.velX) < 0.05 &&
        Math.abs(s.velY) < 0.05
      ) {
        s.offsetX = 0;
        s.offsetY = 0;
        s.velX = 0;
        s.velY = 0;
        return;
      }
      if (reduceMotion) {
        s.offsetX = 0;
        s.offsetY = 0;
        s.velX = 0;
        s.velY = 0;
        return;
      }
      const accX = -SPRING_STIFFNESS * s.offsetX;
      const accY = -SPRING_STIFFNESS * s.offsetY;
      s.velX = (s.velX + accX) * SPRING_DAMPING;
      s.velY = (s.velY + accY) * SPRING_DAMPING;
      s.offsetX += s.velX;
      s.offsetY += s.velY;
    });
  }

  function renderNodeTransforms() {
    states.forEach((s) => {
      s.el.style.transform = `translate(${s.offsetX.toFixed(1)}px, ${s.offsetY.toFixed(1)}px)`;
    });
  }

  states.forEach((s, i) => {
    s.hit.addEventListener(
      "pointerdown",
      (e) => {
        s.dragging = true;
        s.dragStartMouse = { x: e.clientX, y: e.clientY };
        s.dragStartOffset = { x: s.offsetX, y: s.offsetY };
        s.velX = 0;
        s.velY = 0;
        s.hit.setPointerCapture(e.pointerId);
        setHover(i);
      },
      { signal },
    );
    s.hit.addEventListener(
      "pointermove",
      (e) => {
        if (!s.dragging) return;
        s.offsetX = s.dragStartOffset.x + (e.clientX - s.dragStartMouse.x);
        s.offsetY = s.dragStartOffset.y + (e.clientY - s.dragStartMouse.y);
      },
      { signal },
    );
    const release = () => {
      if (!s.dragging) return;
      s.dragging = false;
      setHover(-1);
    };
    s.hit.addEventListener("pointerup", release, { signal });
    s.hit.addEventListener("pointercancel", release, { signal });
    s.hit.addEventListener("mouseenter", () => !s.dragging && setHover(i), { signal });
    s.hit.addEventListener("mouseleave", () => !s.dragging && setHover(-1), { signal });
    s.hit.addEventListener("focus", () => setHover(i), { signal });
    s.hit.addEventListener("blur", () => !s.dragging && setHover(-1), { signal });
  });

  const ro = new ResizeObserver(() => {
    resize();
    if (reduceMotion) draw(0, 1);
  });
  ro.observe(container);
  resize();
  renderNodeTransforms();

  const loop = (now: number) => {
    const elapsedSec = (now - startTime) / 1000;
    const progress = Math.min(1, (now - startTime) / 1700);
    updateSprings();
    renderNodeTransforms();
    draw(elapsedSec, progress);
    raf = requestAnimationFrame(loop);
  };

  if (reduceMotion) {
    draw(0, 1);
  } else {
    raf = requestAnimationFrame(loop);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else {
          raf = requestAnimationFrame(loop);
        }
      },
      { signal },
    );
  }

  document.addEventListener(
    "astro:before-swap",
    () => {
      controller.abort();
      ro.disconnect();
      cancelAnimationFrame(raf);
    },
    { once: true },
  );
}
