interface Slide {
  src: string;
  alt: string;
}

interface Labels {
  close: string;
  previous: string;
  next: string;
}

const SWIPE_THRESHOLD = 50;
const SLIDE_GAP = 32;
const CAPTION_GAP = 20;
const CHEVRON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`;

let initialized = false;
let slides: Slide[] = [];
let active = 0;
let openToken = 0;
let returnFocus: HTMLElement | null = null;

function ensureOverlay(labels: Labels): HTMLDivElement {
  const existing = document.querySelector<HTMLDivElement>("[data-lightbox-overlay]");
  if (existing) return existing;
  const overlay = document.createElement("div");
  overlay.dataset.lightboxOverlay = "true";
  overlay.className = "lightbox-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="lightbox-counter" aria-live="polite"></div>
    <button type="button" class="lightbox-close" aria-label="${labels.close}">&times;</button>
    <div class="lightbox-stage"></div>
    <button type="button" class="lightbox-nav lightbox-nav--prev" data-lightbox-step="-1" aria-label="${labels.previous}">${CHEVRON}</button>
    <button type="button" class="lightbox-nav lightbox-nav--next" data-lightbox-step="1" aria-label="${labels.next}">${CHEVRON}</button>
    <p class="lightbox-caption"></p>
    <div class="lightbox-zoom"><img class="lightbox-zoom__img" alt="" /></div>
  `;
  document.body.appendChild(overlay);
  bindSwipe(overlay);
  return overlay;
}

function getOverlay() {
  return document.querySelector<HTMLDivElement>("[data-lightbox-overlay]");
}

function buildSlides(overlay: HTMLDivElement) {
  const stage = overlay.querySelector<HTMLDivElement>(".lightbox-stage");
  if (!stage) return;
  stage.innerHTML = "";
  slides.forEach((slide, index) => {
    const img = document.createElement("img");
    img.className = "lightbox-slide";
    img.src = slide.src;
    img.alt = slide.alt;
    img.dataset.index = String(index);
    img.draggable = false;
    img.addEventListener("load", () => positionSlides(overlay));
    stage.appendChild(img);
  });
}

/**
 * Neighbours sit right next to the active slide's real edge, not at a fixed
 * distance, so a narrow chart doesn't leave a wide empty gap. Widths come from
 * offsetWidth, which ignores the scale transform, hence the explicit factor.
 */
function positionSlides(overlay: HTMLDivElement) {
  const els = [...overlay.querySelectorAll<HTMLImageElement>(".lightbox-slide")];
  const near = parseFloat(getComputedStyle(overlay).getPropertyValue("--lb-near")) || 0.38;
  const width = (i: number) => (els[i]?.offsetWidth ?? 0) * (i === active ? 1 : near);

  els.forEach((el, i) => {
    let x = 0;
    const dir = Math.sign(i - active);
    const reach = Math.min(Math.abs(i - active), 2);
    for (let step = 1, prev = active; step <= reach; step++) {
      const cur = active + dir * step;
      x += width(prev) / 2 + SLIDE_GAP + width(cur) / 2;
      prev = cur;
    }
    el.style.setProperty("--x", `${dir * x}px`);
  });

  overlay.style.setProperty("--lb-caption-offset", `${(els[active]?.offsetHeight ?? 0) / 2 + CAPTION_GAP}px`);
}

function layout(overlay: HTMLDivElement) {
  overlay.querySelectorAll<HTMLImageElement>(".lightbox-slide").forEach((img) => {
    const offset = Number(img.dataset.index) - active;
    img.dataset.pos = offset === 0 ? "active" : Math.abs(offset) === 1 ? "near" : "far";
    img.dataset.side = offset < 0 ? "before" : offset > 0 ? "after" : "";
  });
  positionSlides(overlay);

  const counter = overlay.querySelector(".lightbox-counter");
  if (counter) counter.textContent = `${String(active + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;

  const caption = overlay.querySelector<HTMLParagraphElement>(".lightbox-caption");
  if (caption) caption.textContent = slides[active]?.alt ?? "";

  overlay.querySelectorAll<HTMLButtonElement>("[data-lightbox-step]").forEach((button) => {
    const step = Number(button.dataset.lightboxStep);
    button.disabled = active + step < 0 || active + step >= slides.length;
  });
  overlay.classList.toggle("is-single", slides.length < 2);
}

function go(step: number) {
  const overlay = getOverlay();
  if (!overlay || overlay.classList.contains("is-zoomed")) return;
  const next = active + step;
  if (next < 0 || next >= slides.length) return;
  active = next;
  layout(overlay);
}

async function openLightbox(trigger: HTMLElement) {
  const triggers = [...document.querySelectorAll<HTMLElement>("[data-lightbox-trigger]")];
  slides = triggers.map((t) => ({ src: t.dataset.lightboxSrc ?? "", alt: t.dataset.lightboxAlt ?? "" }));
  active = Math.max(0, triggers.indexOf(trigger));
  returnFocus = trigger;

  const labels = JSON.parse(trigger.dataset.lightboxLabels ?? "{}") as Labels;
  const overlay = ensureOverlay(labels);
  const token = ++openToken;

  overlay.classList.remove("is-ready", "is-zoomed");
  // Slides are placed without transitions so they don't fly in from wherever
  // the previous gallery left them.
  overlay.classList.add("is-placing");
  buildSlides(overlay);
  layout(overlay);
  // The overlay may have just been created this same click; forcing a layout
  // commits its hidden starting state so the fade-in actually transitions.
  void overlay.offsetWidth;
  overlay.classList.remove("is-placing");
  overlay.classList.add("is-open");
  document.body.style.overflow = "hidden";
  overlay.querySelector<HTMLButtonElement>(".lightbox-close")?.focus({ preventScroll: true });

  // Wait for the bitmap before scaling it in, or the first (uncached) open
  // animates an empty box and the image pops in halfway through.
  const current = overlay.querySelector<HTMLImageElement>(`.lightbox-slide[data-index="${active}"]`);
  await current?.decode().catch(() => {});
  if (token !== openToken || !overlay.classList.contains("is-open")) return;
  overlay.classList.add("is-ready");
}

function closeLightbox() {
  const overlay = getOverlay();
  if (!overlay) return;
  overlay.classList.remove("is-open", "is-ready", "is-zoomed");
  document.body.style.overflow = "";
  returnFocus?.focus({ preventScroll: true });
}

function toggleZoom(overlay: HTMLDivElement, on: boolean) {
  const zoomImg = overlay.querySelector<HTMLImageElement>(".lightbox-zoom__img");
  const slide = overlay.querySelector<HTMLImageElement>(`.lightbox-slide[data-index="${active}"]`);
  if (!zoomImg || !slide) return;
  if (on) {
    zoomImg.src = slide.src;
    zoomImg.alt = slide.alt;
    zoomImg.style.width = `${(slide.naturalWidth || slide.width) * 1.5}px`;
  }
  overlay.classList.toggle("is-zoomed", on);
}

function bindSwipe(overlay: HTMLDivElement) {
  const stage = overlay.querySelector<HTMLDivElement>(".lightbox-stage");
  if (!stage) return;
  let startX: number | null = null;

  stage.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
  });
  stage.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    stage.dataset.swiped = "true";
    go(dx < 0 ? 1 : -1);
  });
  stage.addEventListener("pointercancel", () => {
    startX = null;
  });
}

export function initLightbox() {
  if (initialized) return;
  initialized = true;

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const trigger = target.closest<HTMLElement>("[data-lightbox-trigger]");
    if (trigger) {
      openLightbox(trigger);
      return;
    }

    const overlay = getOverlay();
    if (!overlay || !overlay.contains(target)) return;

    const stage = overlay.querySelector<HTMLDivElement>(".lightbox-stage");
    if (stage?.dataset.swiped) {
      delete stage.dataset.swiped;
      return;
    }

    if (target.closest(".lightbox-close")) {
      closeLightbox();
      return;
    }

    const stepButton = target.closest<HTMLElement>("[data-lightbox-step]");
    if (stepButton) {
      go(Number(stepButton.dataset.lightboxStep));
      return;
    }

    if (target.matches(".lightbox-zoom__img") || target.matches(".lightbox-zoom")) {
      toggleZoom(overlay, false);
      return;
    }

    if (target.matches(".lightbox-slide")) {
      const index = Number(target.dataset.index);
      if (index === active) toggleZoom(overlay, true);
      else go(index - active);
      return;
    }

    closeLightbox();
  });

  window.addEventListener("resize", () => {
    const overlay = getOverlay();
    if (overlay?.classList.contains("is-open")) positionSlides(overlay);
  });

  document.addEventListener("keydown", (e) => {
    const overlay = getOverlay();
    if (!overlay?.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      if (overlay.classList.contains("is-zoomed")) toggleZoom(overlay, false);
      else closeLightbox();
    } else if (e.key === "ArrowRight") {
      go(1);
    } else if (e.key === "ArrowLeft") {
      go(-1);
    }
  });
}
