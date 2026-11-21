const EDGE_GAP = 24;

// offsetTop ignores transforms, so a section still waiting for its reveal
// (translateY) is measured where it will actually end up.
function docTop(el: HTMLElement) {
  let y = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    y += node.offsetTop;
  }
  return y;
}

function navBottom() {
  // The bar itself, not <header>: the mobile menu panel hangs below it.
  const header = document.querySelector<HTMLElement>("header > nav") ?? document.querySelector<HTMLElement>("header");
  return header ? header.getBoundingClientRect().bottom : 0;
}

/** Scroll position that centers the section's content below the fixed nav, or pins its top under the nav when it doesn't fit. */
export function framedScrollY(target: HTMLElement) {
  const style = getComputedStyle(target);
  const padTop = parseFloat(style.paddingTop) || 0;
  const padBottom = parseFloat(style.paddingBottom) || 0;
  const contentTop = docTop(target) + padTop;
  const contentHeight = target.offsetHeight - padTop - padBottom;

  const areaTop = navBottom() + EDGE_GAP;
  const areaHeight = window.innerHeight - areaTop - EDGE_GAP;

  const y =
    contentHeight <= areaHeight ? contentTop - areaTop - (areaHeight - contentHeight) / 2 : contentTop - areaTop;

  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(0, Math.min(max, Math.round(y)));
}

function behavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function onClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!link || link.target || link.hasAttribute("download")) return;

  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !link.getAttribute("href")?.includes("#"))
    return;

  const id = decodeURIComponent(url.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (id && !target) return;

  // Runs in the capture phase so it gets here before Astro's router, which
  // would otherwise jump to the anchor itself and ignore our framing.
  e.preventDefault();
  window.scrollTo({ top: target ? framedScrollY(target) : 0, behavior: behavior() });
  // replaceState keeps Astro's own history entry (index + saved scroll) intact.
  history.replaceState(history.state, "", target ? url.hash : location.pathname + location.search);
}

let lastNavigation: string | null = null;
let listening = false;

function frameHashOnArrival() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  // Back/forward and reloads restore the saved scroll position; only fresh visits get framed.
  const initialType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
  const navType = lastNavigation ?? (initialType === "navigate" ? "push" : "traverse");
  if (navType === "traverse") return;
  window.scrollTo({ top: framedScrollY(target), behavior: "instant" });
}

export function initAnchorScroll() {
  // A module-level flag, not a data attribute: Astro resets <html>'s attributes on every swap.
  if (!listening) {
    listening = true;
    document.addEventListener("click", onClick, true);
    document.addEventListener("astro:before-preparation", (e) => {
      lastNavigation = (e as Event & { navigationType?: string }).navigationType ?? null;
    });
  }
  frameHashOnArrival();
}
