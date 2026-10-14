interface NodeState {
  el: HTMLElement;
  hit: HTMLElement;
  baseX: number;
  baseY: number;
  offsetX: number;
  offsetY: number;
  velX: number;
  velY: number;
  dragging: boolean;
  hovering: boolean;
  dragStartMouse: { x: number; y: number };
  dragStartOffset: { x: number; y: number };
}

// Same spring feel as the hero constellation nodes (see scripts/constellation.ts).
const SPRING_STIFFNESS = 0.09;
const SPRING_DAMPING = 0.78;
const SVG_NS = "http://www.w3.org/2000/svg";
// Fraction of the viewport height where the scroll-driven fill "arrives".
const FILL_ANCHOR = 0.62;
// A row's year and dates start dropping once its top reaches RISE_START of
// the viewport height and are fully in place by RISE_END — late enough that
// the motion happens where the reader is actually looking.
const RISE_START = 0.88;
const RISE_END = 0.58;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function initTimelineDots() {
  const roots = Array.from(document.querySelectorAll<HTMLElement>("[data-timeline-root]"));

  roots.forEach((root) => {
    if (root.dataset.initialized) return;
    root.dataset.initialized = "true";

    const nodeEls = Array.from(root.querySelectorAll<HTMLElement>("[data-timeline-node]"));
    const svg = root.querySelector<SVGSVGElement>("[data-timeline-svg]");
    if (!nodeEls.length || !svg) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Measured with each node's transform reset, so a mid-drag/settle offset
    // never leaks into the resting position.
    function measureBases() {
      const rootRect = root.getBoundingClientRect();
      return nodeEls.map((el) => {
        const prevTransform = el.style.transform;
        el.style.transform = "none";
        const dot = el.querySelector<HTMLElement>("[data-timeline-dot]")!;
        const r = dot.getBoundingClientRect();
        el.style.transform = prevTransform;
        return { x: r.left + r.width / 2 - rootRect.left, y: r.top + r.height / 2 - rootRect.top };
      });
    }

    const bases = measureBases();
    const states: NodeState[] = nodeEls.map((el, i) => ({
      el,
      hit: el.querySelector<HTMLElement>("[data-timeline-hit]")!,
      baseX: bases[i].x,
      baseY: bases[i].y,
      offsetX: 0,
      offsetY: 0,
      velX: 0,
      velY: 0,
      dragging: false,
      hovering: false,
      dragStartMouse: { x: 0, y: 0 },
      dragStartOffset: { x: 0, y: 0 },
    }));

    const edges = states.slice(0, -1).map(() => {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("class", "dm-timeline-edge");
      svg.appendChild(line);
      return line;
    });

    const fills = edges.map(() => {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("class", "dm-timeline-fill");
      svg.appendChild(line);
      return line;
    });
    const risers = nodeEls.map((el) => Array.from(el.querySelectorAll<HTMLElement>("[data-rise]")));

    const pos = (i: number) => ({ x: states[i].baseX + states[i].offsetX, y: states[i].baseY + states[i].offsetY });

    const renderNodes = () => {
      states.forEach((s) => {
        s.el.style.transform = `translate(${s.offsetX.toFixed(1)}px, ${s.offsetY.toFixed(1)}px)`;
      });
    };

    const renderEdges = () => {
      edges.forEach((line, i) => {
        const a = pos(i);
        const b = pos(i + 1);
        const lit = states[i].dragging || states[i].hovering || states[i + 1].dragging || states[i + 1].hovering;
        line.setAttribute("x1", a.x.toFixed(1));
        line.setAttribute("y1", a.y.toFixed(1));
        line.setAttribute("x2", b.x.toFixed(1));
        line.setAttribute("y2", b.y.toFixed(1));
        line.classList.toggle("is-lit", lit);
      });
      renderScroll();
    };

    function renderScroll() {
      const viewH = window.innerHeight;
      // Near the bottom of the page the anchor slides down to the viewport
      // edge, otherwise the last rows could never be reached on short pages.
      const remaining = document.documentElement.scrollHeight - (window.scrollY + viewH);
      const endBoost = 1 - clamp01(remaining / (viewH * (1 - FILL_ANCHOR)));
      const anchor = FILL_ANCHOR + (1 - FILL_ANCHOR) * endBoost;
      const anchorY = viewH * anchor - root.getBoundingClientRect().top;

      fills.forEach((line, i) => {
        const a = pos(i);
        const b = pos(i + 1);
        const span = states[i + 1].baseY - states[i].baseY;
        const p = span > 0 ? clamp01((anchorY - states[i].baseY) / span) : 0;
        line.setAttribute("x1", a.x.toFixed(1));
        line.setAttribute("y1", a.y.toFixed(1));
        line.setAttribute("x2", (a.x + (b.x - a.x) * p).toFixed(1));
        line.setAttribute("y2", (a.y + (b.y - a.y) * p).toFixed(1));
        line.style.opacity = p > 0 ? "1" : "0";
      });

      states.forEach((s, i) => {
        s.el.classList.toggle("is-reached", anchorY >= s.baseY - 2);
        if (reduceMotion) return;
        const top = s.el.getBoundingClientRect().top - s.offsetY;
        const progress = clamp01((viewH * RISE_START - top) / (viewH * (RISE_START - RISE_END)));
        risers[i].forEach((span, j) => {
          const t = easeOutCubic(clamp01(progress * 1.2 - j * 0.2));
          span.style.transform = t >= 1 ? "" : `translateY(-${((1 - t) * 110).toFixed(1)}%)`;
        });
      });
    }

    let raf = 0;
    const settled = (s: NodeState) =>
      Math.abs(s.offsetX) < 0.05 && Math.abs(s.offsetY) < 0.05 && Math.abs(s.velX) < 0.05 && Math.abs(s.velY) < 0.05;

    const loop = () => {
      let moving = false;
      states.forEach((s) => {
        if (s.dragging) {
          moving = true;
          return;
        }
        if (reduceMotion || settled(s)) {
          s.offsetX = 0;
          s.offsetY = 0;
          s.velX = 0;
          s.velY = 0;
          return;
        }
        moving = true;
        const accX = -SPRING_STIFFNESS * s.offsetX;
        const accY = -SPRING_STIFFNESS * s.offsetY;
        s.velX = (s.velX + accX) * SPRING_DAMPING;
        s.velY = (s.velY + accY) * SPRING_DAMPING;
        s.offsetX += s.velX;
        s.offsetY += s.velY;
      });
      renderNodes();
      renderEdges();
      raf = moving ? requestAnimationFrame(loop) : 0;
    };
    const ensureLoop = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    states.forEach((s) => {
      s.hit.addEventListener("pointerdown", (e) => {
        if (reduceMotion) return;
        s.dragging = true;
        s.dragStartMouse = { x: e.clientX, y: e.clientY };
        s.dragStartOffset = { x: s.offsetX, y: s.offsetY };
        s.velX = 0;
        s.velY = 0;
        s.hit.setPointerCapture(e.pointerId);
        s.el.classList.add("is-active");
        renderEdges();
        ensureLoop();
      });
      s.hit.addEventListener("pointermove", (e) => {
        if (!s.dragging) return;
        s.offsetX = s.dragStartOffset.x + (e.clientX - s.dragStartMouse.x);
        s.offsetY = s.dragStartOffset.y + (e.clientY - s.dragStartMouse.y);
        renderNodes();
        renderEdges();
      });
      const release = () => {
        if (!s.dragging) return;
        s.dragging = false;
        if (!s.hovering) s.el.classList.remove("is-active");
        renderEdges();
        ensureLoop();
      };
      s.hit.addEventListener("pointerup", release);
      s.hit.addEventListener("pointercancel", release);
      s.hit.addEventListener("mouseenter", () => {
        s.hovering = true;
        s.el.classList.add("is-active");
        renderEdges();
      });
      s.hit.addEventListener("mouseleave", () => {
        s.hovering = false;
        if (!s.dragging) s.el.classList.remove("is-active");
        renderEdges();
      });
    });

    renderEdges();

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        renderScroll();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Home's timeline is re-rendered on every visit, so drop the listener when
    // the page is swapped out instead of piling one up per navigation.
    document.addEventListener("astro:before-swap", () => window.removeEventListener("scroll", onScroll), { once: true });

    const ro = new ResizeObserver(() => {
      const fresh = measureBases();
      states.forEach((s, i) => {
        s.baseX = fresh[i].x;
        s.baseY = fresh[i].y;
      });
      renderEdges();
    });
    ro.observe(root);
  });
}
