const EASE_OUT = "cubic-bezier(.2,.7,.3,1)";
const LEAVE_MS = 220;
const MOVE_MS = 520;
const STAGGER_MS = 60;

type Row = HTMLElement & { _techs?: string[] };

export function initProjectsFilter() {
  const root = document.querySelector<HTMLElement>("[data-projects-root]");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  const rows = Array.from(root.querySelectorAll<Row>("[data-project-row]"));
  const segments = Array.from(root.querySelectorAll<HTMLElement>("[data-pf-segment]"));
  const options = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-pf-tech]"));
  const selectedChips = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-pf-selected]"));
  const dropdown = root.querySelector<HTMLElement>("[data-pf-dropdown]");
  const trigger = root.querySelector<HTMLButtonElement>("[data-pf-trigger]");
  const triggerLabel = root.querySelector<HTMLElement>("[data-pf-trigger-label]");
  const menu = root.querySelector<HTMLElement>("[data-pf-menu]");
  const techClearBtn = root.querySelector<HTMLButtonElement>("[data-pf-tech-clear]");
  const clearBtn = root.querySelector<HTMLButtonElement>("[data-pf-clear]");
  const result = root.querySelector<HTMLElement>("[data-pf-result]");
  const empty = root.querySelector<HTMLElement>("[data-pf-empty]");
  if (!rows.length) return;

  rows.forEach((row) => (row._techs = JSON.parse(row.dataset.techs ?? "[]")));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { discipline: "all", status: "all", techs: new Set<string>() };
  let run = 0;

  const matches = (row: Row) =>
    (state.discipline === "all" || (row.dataset.disciplines ?? "").split(" ").includes(state.discipline)) &&
    (state.status === "all" || row.dataset.status === state.status) &&
    (state.techs.size === 0 || (row._techs ?? []).some((t) => state.techs.has(t)));

  const moveIndicator = (segment: HTMLElement, animate: boolean) => {
    const indicator = segment.querySelector<HTMLElement>("[data-pf-indicator]");
    const active = segment.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!indicator || !active) return;
    if (!animate) indicator.style.transition = "none";
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    if (!animate) {
      void indicator.offsetWidth;
      indicator.style.transition = "";
    }
  };

  const syncChrome = (visibleCount: number) => {
    const isFiltered = state.discipline !== "all" || state.status !== "all" || state.techs.size > 0;
    if (clearBtn) clearBtn.hidden = !isFiltered;
    if (empty) empty.hidden = visibleCount > 0;
    if (result) {
      const label = visibleCount === 1 ? root.dataset.labelOne : root.dataset.labelMany;
      result.textContent = (label ?? "{n}").replace("{n}", String(visibleCount));
    }
  };

  const apply = async () => {
    const token = ++run;
    const next = rows.filter(matches);
    const leaving = rows.filter((r) => !r.hidden && !next.includes(r));
    const entering = next.filter((r) => r.hidden);
    const staying = next.filter((r) => !r.hidden);
    syncChrome(next.length);

    if (reduceMotion) {
      rows.forEach((r) => (r.hidden = !next.includes(r)));
      return;
    }

    rows.forEach((r) => r.getAnimations().forEach((a) => a.cancel()));

    if (leaving.length) {
      await Promise.all(
        leaving.map(
          (r) =>
            r.animate(
              [
                { opacity: 1, transform: "none", filter: "blur(0)" },
                { opacity: 0, transform: "scale(.97)", filter: "blur(6px)" },
              ],
              { duration: LEAVE_MS, easing: "ease-in", fill: "forwards" },
            ).finished,
        ),
      ).catch(() => {});
      if (token !== run) return;
    }

    // FLIP: rows that stay slide from where they were into their new slot
    // instead of jumping when the rows above them disappear.
    const before = new Map(staying.map((r) => [r, r.getBoundingClientRect().top]));
    leaving.forEach((r) => {
      r.getAnimations().forEach((a) => a.cancel());
      r.hidden = true;
    });
    entering.forEach((r) => (r.hidden = false));

    staying.forEach((r) => {
      const dy = (before.get(r) ?? 0) - r.getBoundingClientRect().top;
      if (Math.abs(dy) < 1) return;
      r.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: MOVE_MS, easing: EASE_OUT });
    });
    entering.forEach((r, i) => {
      r.animate(
        [
          { opacity: 0, transform: "translateY(14px) scale(.98)", filter: "blur(8px)" },
          { opacity: 1, transform: "none", filter: "blur(0)" },
        ],
        { duration: 560, delay: 80 + i * STAGGER_MS, easing: EASE_OUT, fill: "backwards" },
      );
    });
  };

  segments.forEach((segment) => {
    const key = segment.dataset.pfSegment as "discipline" | "status";
    const buttons = Array.from(segment.querySelectorAll<HTMLButtonElement>("[data-pf-value]"));
    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        const value = btn.dataset.pfValue ?? "all";
        if (state[key] === value) return;
        state[key] = value;
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        moveIndicator(segment, true);
        btn.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
        apply();
      }),
    );
  });

  const syncTechs = () => {
    options.forEach((o) => o.setAttribute("aria-pressed", String(state.techs.has(o.dataset.pfTech ?? ""))));
    selectedChips.forEach((c) => {
      const on = state.techs.has(c.dataset.pfSelected ?? "");
      if (on && c.hidden && !reduceMotion) {
        c.animate(
          [
            { opacity: 0, transform: "scale(.9)", filter: "blur(4px)" },
            { opacity: 1, transform: "none", filter: "blur(0)" },
          ],
          { duration: 320, easing: EASE_OUT },
        );
      }
      c.hidden = !on;
    });
    if (trigger && triggerLabel) {
      const n = state.techs.size;
      trigger.toggleAttribute("data-active", n > 0);
      triggerLabel.textContent =
        n > 0 ? (triggerLabel.dataset.some ?? "").replace("{n}", String(n)) : (triggerLabel.dataset.empty ?? "");
    }
  };

  const toggleTech = (name: string, on: boolean) => {
    if (on) state.techs.add(name);
    else state.techs.delete(name);
    syncTechs();
    apply();
  };

  const setMenu = (open: boolean) => {
    if (!menu || !trigger || menu.hidden === !open) return;
    menu.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open && !reduceMotion) {
      menu.animate(
        [
          { opacity: 0, transform: "translateY(-6px) scale(.98)", filter: "blur(6px)" },
          { opacity: 1, transform: "none", filter: "blur(0)" },
        ],
        { duration: 300, easing: EASE_OUT },
      );
    }
  };

  trigger?.addEventListener("click", () => setMenu(Boolean(menu?.hidden)));
  options.forEach((o) =>
    o.addEventListener("click", () => {
      const name = o.dataset.pfTech ?? "";
      toggleTech(name, !state.techs.has(name));
    }),
  );
  selectedChips.forEach((c) => c.addEventListener("click", () => toggleTech(c.dataset.pfSelected ?? "", false)));
  techClearBtn?.addEventListener("click", () => {
    state.techs.clear();
    syncTechs();
    apply();
  });
  // Document listeners outlive this page under view transitions, so they're
  // dropped on the next swap instead of piling up on every visit.
  const onDocClick = (e: MouseEvent) => {
    if (dropdown && !dropdown.contains(e.target as Node)) setMenu(false);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && menu && !menu.hidden) {
      setMenu(false);
      trigger?.focus();
    }
  };
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKey);
  document.addEventListener(
    "astro:before-swap",
    () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    },
    { once: true },
  );

  clearBtn?.addEventListener("click", () => {
    state.discipline = "all";
    state.status = "all";
    state.techs.clear();
    segments.forEach((segment) => {
      segment
        .querySelectorAll<HTMLButtonElement>("[data-pf-value]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pfValue === "all")));
      moveIndicator(segment, true);
    });
    syncTechs();
    apply();
  });

  const syncIndicators = () => segments.forEach((s) => moveIndicator(s, false));
  syncIndicators();
  // Manrope loads after first paint and changes the tab widths.
  document.fonts?.ready.then(syncIndicators);
  const ro = new ResizeObserver(syncIndicators);
  segments.forEach((s) => ro.observe(s));
}
