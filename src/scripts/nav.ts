export function initMobileNav() {
  const toggle = document.querySelector<HTMLElement>("[data-nav-toggle]");
  const panel = document.querySelector<HTMLElement>("[data-nav-panel]");
  if (!toggle || !panel || toggle.dataset.initialized) return;
  toggle.dataset.initialized = "true";

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("data-open", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    panel.setAttribute("data-open", String(!isOpen));
  });

  panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
