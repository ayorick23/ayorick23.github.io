const GAP = 10;
const NAV_CLEARANCE = 84;

function currentMonth(): number {
  const now = new Date();
  return now.getUTCFullYear() * 12 + now.getUTCMonth();
}

export function initGantt() {
  document.querySelectorAll<HTMLElement>("[data-gantt]").forEach((root) => {
    if (root.dataset.initialized) return;
    root.dataset.initialized = "true";
    setupGantt(root);
  });
}

function setupGantt(root: HTMLElement) {
  const scroller = root.querySelector<HTMLElement>("[data-gantt-scroll]")!;
  const tip = root.querySelector<HTMLElement>("[data-gantt-tip]")!;
  const today = root.querySelector<HTMLElement>("[data-gantt-today]");
  const bars = [...root.querySelectorAll<HTMLElement>("[data-gantt-bar]")];
  const min = Number(root.dataset.min);
  const max = Number(root.dataset.max);
  const pct = (m: number) => ((m - min) / (max - min)) * 100;

  // The server-rendered "today" is frozen at build time; move it to the real month.
  const now = currentMonth();
  if (today) today.style.left = `${pct(now)}%`;
  bars.forEach((bar) => {
    if (bar.dataset.current !== undefined) {
      bar.style.width = `${pct(now) - pct(Number(bar.dataset.from))}%`;
    }
  });

  const phone = window.matchMedia("(max-width: 639px)");
  // On phones the name sits above its bar: start-aligned if it fits, else end-aligned,
  // else pinned to the chart's left edge so it never causes sideways scrolling.
  const placeAbove = (bar: HTMLElement, label: HTMLElement) => {
    const chartWidth = bar.parentElement?.clientWidth ?? 0;
    const start = bar.offsetLeft;
    const end = start + bar.offsetWidth;
    const width = label.offsetWidth;
    if (start + width <= chartWidth) {
      label.style.left = "0";
      label.style.right = "auto";
      label.style.textAlign = "left";
    } else if (end - width >= 0) {
      label.style.left = "auto";
      label.style.right = "0";
      label.style.textAlign = "right";
    } else {
      label.style.left = `${-start}px`;
      label.style.right = "auto";
      label.style.textAlign = "left";
    }
  };
  const fitLabels = () => {
    bars.forEach((bar) => {
      const label = bar.querySelector<HTMLElement>("[data-gantt-label]");
      if (!label) return;
      label.style.left = "";
      label.style.right = "";
      label.style.textAlign = "";
      bar.classList.remove("is-outside", "is-left");
      if (phone.matches) {
        placeAbove(bar, label);
        return;
      }
      if (bar.dataset.outside === undefined && label.scrollWidth <= bar.clientWidth + 1) return;
      bar.classList.add("is-outside");
      const chartWidth = bar.parentElement?.clientWidth ?? Infinity;
      if (bar.offsetLeft + bar.offsetWidth + label.offsetWidth > chartWidth) bar.classList.add("is-left");
    });
  };

  const revealToday = () => {
    if (!today || scroller.scrollWidth <= scroller.clientWidth) return;
    scroller.scrollLeft = today.offsetLeft - scroller.clientWidth * 0.8;
  };

  let active: HTMLElement | null = null;
  let lastPointer = "mouse";
  // A tap focuses the button before its click fires; only keyboard focus should open the tip.
  let pressing = false;

  const hide = () => {
    if (!active) return;
    active.classList.remove("is-active");
    active = null;
    root.classList.remove("is-hovering");
    tip.hidden = true;
  };

  const show = (bar: HTMLElement) => {
    const detail = bar.querySelector<HTMLElement>("[data-gantt-detail]");
    if (!detail) return;
    active?.classList.remove("is-active");
    active = bar;
    bar.classList.add("is-active");
    root.classList.add("is-hovering");
    tip.innerHTML = detail.innerHTML;
    tip.hidden = false;

    const rootBox = root.getBoundingClientRect();
    const barBox = bar.getBoundingClientRect();
    const view = scroller.getBoundingClientRect();
    const left = Math.max(barBox.left, view.left);
    const right = Math.min(barBox.right, view.right);
    const center = (left + right) / 2 - rootBox.left;
    const tipW = tip.offsetWidth;
    const tipH = tip.offsetHeight;
    const x = Math.min(Math.max(center - tipW / 2, 8), rootBox.width - tipW - 8);
    const above = barBox.top - tipH - GAP > NAV_CLEARANCE;
    const y = above ? barBox.top - rootBox.top - tipH - GAP : barBox.bottom - rootBox.top + GAP;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  };

  const controller = new AbortController();
  const { signal } = controller;

  bars.forEach((bar) => {
    bar.addEventListener(
      "pointerdown",
      (e) => {
        lastPointer = e.pointerType;
        pressing = true;
      },
      { signal },
    );
    bar.addEventListener(
      "pointerenter",
      (e) => {
        if (e.pointerType === "mouse") show(bar);
      },
      { signal },
    );
    bar.addEventListener(
      "pointerleave",
      (e) => {
        if (e.pointerType === "mouse") hide();
      },
      { signal },
    );
    bar.addEventListener(
      "focus",
      () => {
        if (!pressing) show(bar);
      },
      { signal },
    );
    bar.addEventListener("blur", hide, { signal });
    bar.addEventListener(
      "click",
      (e) => {
        pressing = false;
        if (lastPointer === "mouse") return;
        e.stopPropagation();
        if (active === bar) hide();
        else show(bar);
      },
      { signal },
    );
  });

  document.addEventListener(
    "click",
    (e) => {
      if (active && !root.contains(e.target as Node)) hide();
    },
    { signal },
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") hide();
    },
    { signal },
  );
  scroller.addEventListener("scroll", hide, { signal, passive: true });

  const resize = new ResizeObserver(() => {
    fitLabels();
    hide();
  });
  resize.observe(scroller);

  fitLabels();
  revealToday();
  // Label widths change once Manrope finishes loading.
  document.fonts?.ready.then(fitLabels);

  document.addEventListener(
    "astro:before-swap",
    () => {
      controller.abort();
      resize.disconnect();
    },
    { once: true },
  );
}
