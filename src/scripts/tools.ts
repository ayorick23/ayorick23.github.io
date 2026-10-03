const EASE_OUT = "cubic-bezier(.2,.7,.3,1)";
const STAGGER_MS = 32;

export function initToolsFilter() {
  const root = document.querySelector<HTMLElement>("[data-tools-root]");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  const filter = root.querySelector<HTMLElement>("[data-tools-filter]");
  const indicator = root.querySelector<HTMLElement>("[data-tools-indicator]");
  const panel = root.querySelector<HTMLElement>("[data-tools-panel]");
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-tools-filter-btn]"));
  const groups = Array.from(root.querySelectorAll<HTMLElement>("[data-tool-group]"));
  if (!filter || !indicator || !panel || !buttons.length || !groups.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = "all";

  const moveIndicator = (btn: HTMLButtonElement, animate: boolean) => {
    if (!animate) indicator.style.transition = "none";
    indicator.style.width = `${btn.offsetWidth}px`;
    indicator.style.height = `${btn.offsetHeight}px`;
    indicator.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
    if (!animate) {
      void indicator.offsetWidth;
      indicator.style.transition = "";
    }
  };

  const staggerIn = (chips: HTMLElement[], baseDelay = 0) => {
    if (reduceMotion) return;
    chips.forEach((chip, i) => {
      chip.animate(
        [
          { opacity: 0, transform: "translateY(10px) scale(.96)", filter: "blur(4px)" },
          { opacity: 1, transform: "none", filter: "blur(0)" },
        ],
        { duration: 480, delay: baseDelay + i * STAGGER_MS, easing: EASE_OUT, fill: "backwards" },
      );
    });
  };

  // The border between rows lives on each row's top edge, so whichever group
  // ends up first after filtering must drop it or it doubles the panel border.
  const markLeadGroup = () => {
    const lead = groups.find((g) => !g.hasAttribute("data-hidden"));
    groups.forEach((g) => g.toggleAttribute("data-lead", g === lead));
  };

  const applyFilter = (key: string) => {
    if (key === current) return;
    current = key;

    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.toolsFilterBtn === key)));
    const active = buttons.find((b) => b.dataset.toolsFilterBtn === key);
    if (active) {
      moveIndicator(active, true);
      active.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    }

    const shown: HTMLElement[] = [];
    groups.forEach((g) => {
      const visible = key === "all" || g.dataset.toolGroup === key;
      g.toggleAttribute("data-hidden", !visible);
      if (visible) shown.push(g);
    });
    markLeadGroup();

    staggerIn(
      shown.flatMap((g) => Array.from(g.querySelectorAll<HTMLElement>("[data-tool-chip]"))),
      120,
    );
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.toolsFilterBtn ?? "all"));
  });

  const syncIndicator = () => {
    const active = buttons.find((b) => b.getAttribute("aria-pressed") === "true");
    if (active) moveIndicator(active, false);
  };
  syncIndicator();
  markLeadGroup();
  // Manrope loads after first paint and changes the tab widths.
  document.fonts?.ready.then(syncIndicator);
  new ResizeObserver(syncIndicator).observe(filter);

  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      staggerIn(Array.from(panel.querySelectorAll<HTMLElement>("[data-tool-chip]")), 150);
    },
    { threshold: 0.12 },
  );
  io.observe(panel);
}
