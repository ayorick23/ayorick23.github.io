// Vertical "record crate" carousel. Every card's position is a function of its distance `d`
// to the (continuous) focus index: cards above recede and shrink, cards below come closer,
// all leaning forward. Opening flattens the focused card and pushes its neighbours apart.

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initCertificates() {
  const root = document.querySelector<HTMLElement>("[data-certs]");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  const stage = root.querySelector<HTMLElement>("[data-certs-stage]")!;
  const aside = root.querySelector<HTMLElement>("[data-certs-aside]")!;
  const idle = root.querySelector<HTMLElement>("[data-certs-idle]")!;
  const mobileHost = root.querySelector<HTMLElement>("[data-certs-mobile-host]")!;
  const metaEl = root.querySelector<HTMLElement>(".dm-stage__bar [data-peek-meta]")!;
  const titleEl = root.querySelector<HTMLElement>(".dm-stage__bar [data-peek-title]")!;
  const indexEl = root.querySelector<HTMLElement>("[data-certs-index]")!;
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-certs-step="-1"]')!;
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-certs-step="1"]')!;
  const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-cert]"));
  const faces = cards.map((c) => c.querySelector<HTMLButtonElement>("button")!);
  const panels = new Map(
    Array.from(root.querySelectorAll<HTMLElement>("[data-cert-panel]")).map((p) => [p.dataset.certPanel!, p]),
  );
  const n = cards.length;
  const wide = window.matchMedia("(min-width: 1024px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ac = new AbortController();
  document.addEventListener("astro:before-swap", () => ac.abort(), { once: true });

  // Layout, in px, derived from the stage width (see layout()).
  let W = 560;
  let H0 = 420;
  let stageH = 640;

  // f: index of the card in the "middle" slot (animated), ft: its target. o / ot: open amount 0..1.
  // The middle slot is the same place in both modes, so opening and closing never moves the card.
  const ABOVE = 2;
  let ft = Math.min(ABOVE, n - 1);
  let f = reduceMotion ? ft : ft - 8;
  let o = 0;
  let ot = 0;
  const lift = new Array(n).fill(0);
  let hovered = -1;
  let current = -1;
  let raf = 0;
  let last = 0;
  let started = false;
  let entering = !reduceMotion;

  const layout = () => {
    const sw = stage.clientWidth;
    W = Math.min(sw * (wide.matches ? 0.76 : 0.84), 560);
    H0 = W / 1.33;
    stageH = Math.round(H0 * (wide.matches ? 1.72 : 1.85));
    stage.style.setProperty("--card-w", `${W}px`);
    stage.style.setProperty("--stage-h", `${stageH}px`);
  };

  const render = () => {
    // Browsing: a crate of cards leaning forward, two above the middle slot and the rest below,
    // closer to the camera. Open: the middle card stands up, grows and its lower neighbours
    // make room. y values are card centers relative to the stage center.
    const step = H0 * 0.14;
    const zStep = H0 * 0.075;
    const openScale = 1.15;
    const openTop = -stageH / 2 + H0 * 0.27;
    const base = openTop + H0 / 2;
    const openY = openTop + (H0 * openScale) / 2;
    const shiftAbove = openTop - H0 * 0.13 + H0 / 2 - (base - step);
    const shiftBelow = openTop + H0 * openScale - H0 * 0.12 + H0 / 2 - (base + step);
    const tilt = reduceMotion ? 0 : 16;
    const visAbove = ABOVE + 0.4;

    for (let i = 0; i < n; i++) {
      const d = i - f;
      const a = Math.abs(d);
      const near = Math.min(1, a);
      const w = o * Math.max(0, 1 - a);

      let y = base + d * step - lift[i];
      let z = d * zStep;
      let rx = -(tilt + clamp(d, -3, 6) * 1.5);
      y += o * near * (d < 0 ? shiftAbove : shiftBelow);
      y = lerp(y, openY, w);
      z = lerp(z, 0, w);
      rx = lerp(rx, 0, w);
      const scale = lerp(1, openScale, w);

      const visible = d < 0 ? clamp(1 - (a - visAbove) / 0.6, 0, 1) : clamp(1 - (d - 7.5) / 1, 0, 1);
      const dim = 1 - Math.min(a, 5) * 0.07;
      const b = lerp(dim, 0.55, o * (1 - w));

      const el = cards[i];
      el.style.transform = `translate(-50%, -50%) translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = visible.toFixed(3);
      el.style.visibility = visible < 0.01 ? "hidden" : "visible";
      el.style.zIndex = String(i + (w > 0.5 ? 100 : 0));
      el.style.setProperty("--b", b.toFixed(3));
      el.style.setProperty("--s", lerp(1, 0.55, o * (1 - w)).toFixed(3));
    }
  };

  // Easing factors are per 60fps frame and corrected by the real frame time, so the motion
  // keeps the same pace on 120Hz screens or when the browser drops frames.
  const ease = (k: number, frames: number) => (reduceMotion ? 1 : 1 - Math.pow(1 - k, frames));
  const tick = (now: number) => {
    const frames = last ? Math.min(4, (now - last) / 16.67) : 1;
    last = now;
    // Pure exponential easing crawls through its last card on long jumps; a minimum speed
    // ends the move cleanly instead of making it feel one card short.
    const gap = ft - f;
    const eased = gap * ease(entering ? 0.035 : 0.07, frames);
    const minStep = entering || reduceMotion ? 0 : 0.018 * frames;
    f += Math.abs(eased) >= minStep ? eased : Math.sign(gap) * Math.min(Math.abs(gap), minStep);
    o += (ot - o) * ease(0.06, frames);
    let moving = Math.abs(ft - f) > 0.0005 || Math.abs(ot - o) > 0.001;
    for (let i = 0; i < n; i++) {
      const target = i === hovered && ot === 0 ? 12 : 0;
      lift[i] += (target - lift[i]) * ease(0.18, frames);
      if (Math.abs(target - lift[i]) > 0.05) moving = true;
    }
    if (!moving) {
      f = ft;
      o = ot;
      entering = false;
    }
    render();
    raf = moving ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  };
  const kick = () => {
    if (!raf && started) raf = requestAnimationFrame(tick);
  };

  // Re-inserting a node restarts its entrance animation, so only move it when its host changes.
  const placePanel = (panel: HTMLElement) => {
    const host = wide.matches ? aside : mobileHost;
    if (panel.parentElement !== host) host.appendChild(panel);
  };

  // Keeps the bar, the buttons and (when open) the detail panel in sync with the target card.
  const sync = () => {
    const idx = clamp(Math.round(ft), 0, n - 1);
    const isOpen = ot === 1;
    if (idx !== current) {
      current = idx;
      const card = cards[idx];
      metaEl.textContent = card.dataset.peekMeta!;
      titleEl.textContent = card.dataset.peekTitle!;
      indexEl.textContent = String(idx + 1).padStart(2, "0");
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === n - 1;
    }
    cards.forEach((card, i) => {
      const open = isOpen && i === idx;
      card.classList.toggle("is-open", open);
      faces[i].setAttribute("aria-expanded", String(open));
      const panel = panels.get(card.dataset.cert!)!;
      if (open) {
        placePanel(panel);
        panel.hidden = false;
      } else if (!panel.hidden) {
        panel.hidden = true;
      }
    });
    idle.hidden = isOpen && wide.matches;
  };

  const goTo = (target: number) => {
    ft = clamp(target, 0, n - 1);
    sync();
    kick();
  };
  const setOpen = (open: boolean) => {
    ot = open ? 1 : 0;
    sync();
    kick();
  };

  let snapTimer = 0;
  const snapSoon = () => {
    window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(() => goTo(Math.round(ft)), 140);
  };

  stage.addEventListener(
    "wheel",
    (e) => {
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      // At either end of the stack the wheel goes back to scrolling the page.
      if ((dy < 0 && ft <= 0) || (dy > 0 && ft >= n - 1)) return;
      e.preventDefault();
      goTo(ft + dy / (wide.matches ? 110 : 90));
      snapSoon();
    },
    { passive: false },
  );

  let dragStart: { y: number; ft: number } | null = null;
  let dragged = false;
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragStart = { y: e.clientY, ft };
    dragged = false;
  });
  window.addEventListener(
    "pointermove",
    (e) => {
      if (!dragStart) return;
      const dy = e.clientY - dragStart.y;
      if (!dragged && Math.abs(dy) < 6) return;
      dragged = true;
      goTo(dragStart.ft - dy / (H0 * 0.22));
    },
    { signal: ac.signal },
  );
  window.addEventListener(
    "pointerup",
    () => {
      if (!dragStart) return;
      dragStart = null;
      if (dragged) goTo(Math.round(ft));
    },
    { signal: ac.signal },
  );

  cards.forEach((card, i) => {
    faces[i].addEventListener("click", () => {
      if (dragged) return;
      if (ot === 1 && Math.round(ft) === i) {
        setOpen(false);
        return;
      }
      goTo(i);
      setOpen(true);
    });
    card.addEventListener("mouseenter", () => {
      hovered = i;
      kick();
    });
    card.addEventListener("mouseleave", () => {
      if (hovered === i) hovered = -1;
      kick();
    });
  });

  prevBtn.addEventListener("click", () => goTo(Math.round(ft) - 1));
  nextBtn.addEventListener("click", () => goTo(Math.round(ft) + 1));

  stage.addEventListener("keydown", (e) => {
    const moves: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -3, PageDown: 3 };
    if (e.key in moves) {
      e.preventDefault();
      goTo(Math.round(ft) + moves[e.key]);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      goTo(e.key === "Home" ? 0 : n - 1);
    }
  });

  root.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-cert-close]")) setOpen(false);
    const related = target.closest<HTMLElement>("[data-cert-open]");
    if (related) {
      goTo(cards.findIndex((c) => c.dataset.cert === related.dataset.certOpen));
      setOpen(true);
    }
  });

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && ot === 1) setOpen(false);
    },
    { signal: ac.signal },
  );

  wide.addEventListener(
    "change",
    () => {
      layout();
      sync();
      render();
    },
    { signal: ac.signal },
  );
  new ResizeObserver(() => {
    layout();
    render();
  }).observe(stage);

  layout();
  sync();
  render();

  // The crate rises into place the first time it scrolls into view.
  const start = () => {
    started = true;
    goTo(ft);
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    start();
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(stage);
  }
}
