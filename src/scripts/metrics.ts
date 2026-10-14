const COUNT_MS = 1500;
const STAGGER_MS = 110;
const COUNT_DELAY_MS = 380;

interface ParsedValue {
  prefix: string;
  target: number;
  decimals: number;
  grouped: boolean;
  suffix: string;
}

// Values are free text from the case study ("85,088", "0.99", "+84%"), so only
// the first number is animated and whatever surrounds it is kept as-is.
function parse(text: string): ParsedValue | null {
  const match = text.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, raw, suffix] = match;
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { prefix, target: Number(raw.replace(/,/g, "")), decimals, grouped: raw.includes(","), suffix };
}

function format(v: ParsedValue, n: number) {
  const body = n.toLocaleString("en-US", {
    minimumFractionDigits: v.decimals,
    maximumFractionDigits: v.decimals,
    useGrouping: v.grouped,
  });
  return `${v.prefix}${body}${v.suffix}`;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function countUp(el: HTMLElement, delay: number) {
  const final = el.textContent?.trim() ?? "";
  const parsed = parse(final);
  if (!parsed) return;
  el.textContent = format(parsed, 0);
  el.style.filter = "blur(6px)";

  setTimeout(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = easeOutExpo(t);
      el.textContent = t === 1 ? final : format(parsed, parsed.target * eased);
      el.style.filter = `blur(${(6 * (1 - Math.min(1, t * 1.6))).toFixed(2)}px)`;
      if (t < 1) requestAnimationFrame(tick);
      else el.style.filter = "";
    };
    requestAnimationFrame(tick);
  }, delay);
}

export function initMetricCards() {
  const grids = document.querySelectorAll<HTMLElement>("[data-metrics]");
  if (!grids.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const grid = entry.target as HTMLElement;
        io.unobserve(grid);
        grid.classList.add("is-visible");
        grid.querySelectorAll<HTMLElement>("[data-metric-value]").forEach((el, i) => {
          countUp(el, i * STAGGER_MS + COUNT_DELAY_MS);
        });
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
  );

  grids.forEach((grid) => {
    if (grid.dataset.initialized) return;
    grid.dataset.initialized = "true";
    grid.classList.add("is-armed");
    io.observe(grid);
  });
}
