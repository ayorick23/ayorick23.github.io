let initialized = false;

function ensureOverlay(): HTMLDivElement {
  const existing = document.querySelector<HTMLDivElement>("[data-lightbox-overlay]");
  if (existing) return existing;
  const overlay = document.createElement("div");
  overlay.dataset.lightboxOverlay = "true";
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Cerrar">&times;</button>
    <img class="lightbox-img" alt="" />
    <p class="lightbox-caption"></p>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function openLightbox(src: string, alt: string) {
  const overlay = ensureOverlay();
  const img = overlay.querySelector<HTMLImageElement>(".lightbox-img");
  const caption = overlay.querySelector<HTMLParagraphElement>(".lightbox-caption");
  if (!img || !caption) return;
  img.src = src;
  img.alt = alt;
  img.style.width = "";
  img.classList.remove("is-zoomed");
  caption.textContent = alt;
  overlay.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const overlay = document.querySelector<HTMLDivElement>("[data-lightbox-overlay]");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  document.body.style.overflow = "";
}

export function initLightbox() {
  if (initialized) return;
  initialized = true;

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const trigger = target.closest<HTMLElement>("[data-lightbox-trigger]");
    if (trigger) {
      const src = trigger.dataset.lightboxSrc;
      if (src) openLightbox(src, trigger.dataset.lightboxAlt ?? "");
      return;
    }

    if (target.closest(".lightbox-close") || target.matches("[data-lightbox-overlay]")) {
      closeLightbox();
      return;
    }

    if (target.matches(".lightbox-img")) {
      const img = target as HTMLImageElement;
      const zoomed = img.classList.toggle("is-zoomed");
      img.style.width = zoomed ? `${(img.naturalWidth || img.width) * 1.5}px` : "";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}
