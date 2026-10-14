// The build bakes in "today" at deploy time; recompute it from the visitor's clock
// so the progress bar doesn't freeze between deploys.
export function initEducation() {
  const root = document.querySelector<HTMLElement>("[data-edu]");
  if (!root) return;

  const start = Number(root.dataset.start);
  const end = Number(root.dataset.end);
  const now = new Date();
  const today = Math.min(1, Math.max(0, (now.getFullYear() * 12 + now.getMonth() - start) / (end - start)));

  root.style.setProperty("--progress", String(today));
  root.querySelector<HTMLElement>("[data-edu-today]")?.style.setProperty("--at", String(today));
  root.querySelectorAll<HTMLElement>("[data-edu-milestone]").forEach((el) => {
    el.toggleAttribute("data-reached", Number(el.dataset.at) <= today);
  });
}
