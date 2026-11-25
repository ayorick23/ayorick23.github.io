const NS = "http://www.w3.org/2000/svg";
/* How long the main line takes to rise from the first job to "today". */
const RISE_DURATION = 1500;
/* Must match the .dm-br__grow stroke-dashoffset transition. */
const BRANCH_DRAW = 400;
const BRANCH_DELAY = 80;
/* Must match the .dm-br__row.is-folding height transition. */
const FOLD_DURATION = 450;
/* How far above its role's dot a branch finishes curving into its own lane. */
const BRANCH_RISE = 34;

export function initBranches() {
  document.querySelectorAll<HTMLElement>("[data-branches]").forEach((root) => {
    if (root.dataset.initialized) return;
    root.dataset.initialized = "true";
    setupBranches(root);
  });
}

function setupBranches(root: HTMLElement) {
  const svg = root.querySelector<SVGSVGElement>("[data-br-svg]")!;
  const rows = [...root.querySelectorAll<HTMLElement>("[data-br-row]")];
  const top = root.querySelector<HTMLElement>('[data-br-terminal="top"]')!;
  const bottom = root.querySelector<HTMLElement>('[data-br-terminal="bottom"]')!;
  const level = (i: number) => Number(rows[i].dataset.level ?? 0);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The role a branch grows out of: the first work row below it.
  const originOf = (i: number) => {
    let j = i + 1;
    while (j < rows.length && level(j)) j++;
    return j;
  };

  rows.forEach((row) => {
    const toggle = row.querySelector<HTMLButtonElement>("[data-br-toggle]")!;
    const panel = row.querySelector<HTMLElement>("[data-br-panel]")!;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
    });
  });

  const make = (tag: string, cls: string, parent: Element = svg) => {
    const node = document.createElementNS(NS, tag);
    if (cls) node.setAttribute("class", cls);
    parent.appendChild(node);
    return node;
  };

  // Paint order: track, rising fill, branches, then dots on top of everything.
  const defs = make("defs", "");
  const track = make("path", "dm-br__track");
  const fill = make("path", "dm-br__fill");
  const branches = rows.map((row, i) => {
    if (!level(i)) return null;
    const mask = make("mask", "", defs);
    mask.id = `dm-br-mask-${i}`;
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    for (const [k, v] of Object.entries({ x: -5000, y: -5000, width: 20000, height: 20000 })) {
      mask.setAttribute(k, String(v));
    }
    const grow = make("path", "dm-br__grow", mask);
    grow.setAttribute("pathLength", "1");
    const line = make("path", `dm-br__branch is-${row.dataset.kind}`);
    line.setAttribute("mask", `url(#${mask.id})`);
    return { line, grow };
  });
  const nodes = rows.map((row) => {
    const kind = row.dataset.kind;
    const cls = kind === "work" ? (row.dataset.current !== undefined ? "is-ring" : "") : `is-${kind}`;
    return make("circle", `dm-br__node ${cls}`);
  });
  const topNode = make("circle", "dm-br__node");
  const bottomNode = make("circle", "dm-br__node is-end");

  let main = 0;
  let topY = 0;
  let bottomY = 0;
  let ys: number[] = [];
  let progress = 0;

  const fillTo = () => {
    const y = bottomY - progress * (bottomY - topY);
    fill.setAttribute("d", `M${main} ${bottomY} L${main} ${y}`);
    return y;
  };

  // Offsets, not getBoundingClientRect: rows are still shifted by their reveal transform
  // while the line rises, and a measured transform left the dots ~10px low.
  const offsetIn = (el: HTMLElement) => {
    let x = 0;
    let y = 0;
    for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { x, y };
  };
  // A dot sits on the middle of its title + subtitle (role and company), not the whole header.
  const dotY = (row: HTMLElement) => {
    const title = row.querySelector<HTMLElement>(".dm-br__title")!;
    const sub = row.querySelector<HTMLElement>(".dm-br__sub")!;
    return (offsetIn(title).y + offsetIn(sub).y + sub.offsetHeight) / 2;
  };

  const layout = () => {
    const css = (name: string) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
    const panelLeft = (i: number) => offsetIn(rows[i].querySelector<HTMLElement>("[data-br-panel]")!).x;
    const workRow = rows.findIndex((_, i) => !level(i));
    const dot = css("--dot");
    const middle = (el: HTMLElement) => offsetIn(el).y + el.offsetHeight / 2;

    main = panelLeft(workRow) + dot;
    topY = middle(top);
    bottomY = middle(bottom);
    ys = rows.map(dotY);
    const xs = rows.map((_, i) => (level(i) ? panelLeft(i) + dot : main));

    track.setAttribute("d", `M${main} ${topY} L${main} ${bottomY}`);
    fillTo();

    const place = (c: Element, x: number, y: number, r: number) => {
      c.setAttribute("cx", String(x));
      c.setAttribute("cy", String(y));
      c.setAttribute("r", String(r));
    };
    nodes.forEach((c, i) => {
      const r = level(i) ? 4.5 : rows[i].dataset.current !== undefined ? 6 : 5;
      place(c, xs[i], ys[i], r);
    });
    place(topNode, main, topY, 4);
    place(bottomNode, main, bottomY, 4);

    rows.forEach((row, i) => {
      const fold = row.querySelector<HTMLElement>(":scope > [data-br-fold]");
      if (!fold) return;
      const at = offsetIn(row);
      fold.style.left = `${main - at.x}px`;
      fold.style.top = `${ys[i] - at.y}px`;
    });

    // Same curve as the very first version, mirrored to the right: out of the role's
    // dot, a smooth bend into the branch's lane, then straight up into its dot.
    branches.forEach((branch, i) => {
      if (!branch) return;
      const py = ys[originOf(i)];
      const x = xs[i];
      const d =
        `M${main} ${py} C${main} ${py - BRANCH_RISE * 0.6} ${x} ${py - BRANCH_RISE * 0.4} ${x} ${py - BRANCH_RISE} ` +
        `L${x} ${ys[i]}`;
      branch.line.setAttribute("d", d);
      branch.grow.setAttribute("d", d);
    });
  };

  // A role's dot folds its branch rows (education, certificates) back into itself, or grows them
  // out of it again with the same sequence as the opening animation: room opens, the branch
  // grows from the role's dot, then its dot fills and its panel rises in. Folding plays it backwards.
  const heightDone = new Map<number, (e: TransitionEvent) => void>();
  const animateHeight = (j: number, folded: boolean) => {
    const row = rows[j];
    const natural = folded ? row.offsetHeight : Number(row.dataset.naturalHeight) || row.scrollHeight;
    if (folded) row.dataset.naturalHeight = String(natural);
    const previous = heightDone.get(j);
    if (previous) row.removeEventListener("transitionend", previous);
    row.style.height = `${folded ? natural : 0}px`;
    row.classList.add("is-folding");
    void row.offsetHeight;
    row.classList.toggle("is-folded", folded);
    row.style.height = `${folded ? 0 : natural}px`;
    const done = (e: TransitionEvent) => {
      if (e.target !== row || e.propertyName !== "height") return;
      row.removeEventListener("transitionend", done);
      heightDone.delete(j);
      row.classList.remove("is-folding");
      row.style.height = "";
    };
    heightDone.set(j, done);
    row.addEventListener("transitionend", done);
  };

  const foldTimers = new Map<number, number[]>();
  const setFolded = (j: number, folded: boolean) => {
    const row = rows[j];
    const branch = branches[j]!;
    foldTimers.get(j)?.forEach(clearTimeout);
    const pending: number[] = [];
    foldTimers.set(j, pending);
    const after = (fn: () => void, ms: number) => pending.push(window.setTimeout(fn, ms));
    row.inert = folded;

    if (reducedMotion) {
      row.classList.toggle("is-folded", folded);
      nodes[j].classList.toggle("is-folded", folded);
      return;
    }
    if (folded) {
      row.classList.remove("is-reached");
      nodes[j].classList.remove("is-on");
      branch.grow.classList.remove("is-drawn");
      after(() => {
        nodes[j].classList.add("is-folded");
        animateHeight(j, true);
      }, BRANCH_DRAW);
    } else {
      nodes[j].classList.remove("is-folded");
      animateHeight(j, false);
      after(() => branch.grow.classList.add("is-drawn"), FOLD_DURATION);
      after(() => {
        row.classList.add("is-reached");
        nodes[j].classList.add("is-on");
      }, FOLD_DURATION + BRANCH_DRAW);
    }
  };

  rows.forEach((row, i) => {
    const fold = row.querySelector<HTMLButtonElement>(":scope > [data-br-fold]");
    if (!fold) return;
    fold.addEventListener("click", () => {
      const folded = fold.getAttribute("aria-expanded") === "true";
      fold.setAttribute("aria-expanded", String(!folded));
      for (let j = i - 1; j >= 0 && level(j); j--) setFolded(j, folded);
    });
  });

  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const reached = new Set<number>();

  const reveal = (i: number) => {
    if (reached.has(i)) return;
    reached.add(i);
    rows[i].classList.add("is-reached");
    nodes[i].classList.add("is-on");
  };

  // Reaching a role's dot reveals it, then grows every branch that comes out of it.
  const reachRole = (i: number, instant: boolean) => {
    if (reached.has(i)) return;
    reveal(i);
    for (let j = i - 1; j >= 0 && level(j); j--) {
      const branch = branches[j]!;
      const grow = () => {
        branch.grow.classList.add("is-drawn");
        if (instant) reveal(j);
        else later(() => reveal(j), BRANCH_DRAW);
      };
      if (instant) grow();
      else later(grow, BRANCH_DELAY);
    }
  };

  const finish = () => {
    top.classList.add("is-reached");
    topNode.classList.add("is-on");
  };

  let frame = 0;
  const play = () => {
    bottom.classList.add("is-reached");
    bottomNode.classList.add("is-on");
    if (reducedMotion) {
      progress = 1;
      fillTo();
      rows.forEach((_, i) => !level(i) && reachRole(i, true));
      finish();
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / RISE_DURATION);
      progress = 0.5 - Math.cos(Math.PI * t) / 2;
      const y = fillTo();
      ys.forEach((rowY, i) => {
        if (!level(i) && y <= rowY + 0.5) reachRole(i, false);
      });
      if (t < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    frame = requestAnimationFrame(tick);
  };

  let resizeFrame = 0;
  const resize = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(layout);
  });
  resize.observe(root);
  layout();
  document.fonts?.ready.then(layout);

  const visible = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      visible.disconnect();
      play();
    },
    { threshold: 0.15 },
  );
  visible.observe(root);

  document.addEventListener(
    "astro:before-swap",
    () => {
      resize.disconnect();
      visible.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      timers.forEach(clearTimeout);
    },
    { once: true },
  );
}
