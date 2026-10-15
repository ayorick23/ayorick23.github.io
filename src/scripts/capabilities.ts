export function initCapabilities() {
  const root = document.querySelector<HTMLElement>("[data-caps]");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-cap]"));
  const wide = window.matchMedia("(min-width: 1024px)");
  const canHover = window.matchMedia("(hover: hover)");

  const open = (panel: HTMLElement) => {
    panels.forEach((p) => {
      const isOpen = p === panel;
      p.toggleAttribute("data-open", isOpen);
      p.querySelector("[data-cap-head]")?.setAttribute("aria-expanded", String(isOpen));
    });
  };

  panels.forEach((panel) => {
    const head = panel.querySelector<HTMLButtonElement>("[data-cap-head]");
    // Side-by-side layout opens on hover like the reference; the stacked
    // mobile accordion is tap-only so scrolling past it doesn't flip panels.
    panel.addEventListener("mouseenter", () => {
      if (wide.matches && canHover.matches) open(panel);
    });
    head?.addEventListener("click", () => {
      if (!wide.matches && panel.hasAttribute("data-open")) {
        panel.removeAttribute("data-open");
        head.setAttribute("aria-expanded", "false");
        return;
      }
      open(panel);
    });
    head?.addEventListener("focus", () => {
      if (wide.matches) open(panel);
    });
  });

  if ("IntersectionObserver" in window) {
    root.classList.add("is-offscreen");
    new IntersectionObserver((entries) => {
      entries.forEach((e) => root.classList.toggle("is-offscreen", !e.isIntersecting));
    }).observe(root);
  }
}
