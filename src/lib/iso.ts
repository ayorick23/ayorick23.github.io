import lucide from "@iconify-json/lucide/icons.json";

/**
 * Tiny isometric drawing kit for the capability illustrations. World units are
 * roughly pixels: x runs toward the bottom-right of the screen, y toward the
 * bottom-left and z straight up. Everything returns SVG markup strings, and
 * the caller paints back-to-front (smaller x + y first).
 *
 * The visible faces of a solid are its top, its +y face ("left", lower-left on
 * screen) and its +x face ("right", lower-right). `onPlane` maps plain 2D SVG
 * onto any of them, which is how screens, icons and labels get "printed" on a
 * surface.
 */
const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

export type P = [number, number, number];
export type Plane = "left" | "right" | "top";

const f = (n: number) => n.toFixed(1);

const PLANE_AXES: Record<Plane, [number, number, number, number]> = {
  // u → +x, v → down (−z)
  left: [COS, SIN, 0, 1],
  // u → −y, v → down (−z)
  right: [COS, -SIN, 0, 1],
  // u → +x, v → +y
  top: [COS, SIN, -COS, SIN],
};

const icons = (lucide as { icons: Record<string, { body: string }> }).icons;

export function createIso(ox: number, oy: number) {
  const pt = (x: number, y: number, z: number): [number, number] => [ox + (x - y) * COS, oy + (x + y) * SIN - z];
  const pts = (list: P[]) => list.map((p) => pt(...p).map(f).join(",")).join(" ");

  const poly = (list: P[], cls: string) => `<polygon class="${cls}" points="${pts(list)}"/>`;
  const path = (list: P[], cls: string) => `<polyline class="${cls}" points="${pts(list)}"/>`;
  const line = (a: P, b: P, cls: string) => {
    const [x1, y1] = pt(...a);
    const [x2, y2] = pt(...b);
    return `<line class="${cls}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  };
  const node = (x: number, y: number, z: number, r: number, cls: string) => {
    const [px, py] = pt(x, y, z);
    return `<circle class="${cls}" cx="${f(px)}" cy="${f(py)}" r="${r}"/>`;
  };

  /** Draws plain 2D SVG `content` onto a face; (0,0) of the content sits at `origin`. */
  const onPlane = (plane: Plane, origin: P, content: string, scale = 1, cls = "") => {
    const [a, b, c, d] = PLANE_AXES[plane].map((n) => n * scale);
    const [ex, ey] = pt(...origin);
    return `<g class="ci-plane ${cls}" transform="matrix(${[a, b, c, d, ex, ey].map((n) => n.toFixed(4)).join(" ")})">${content}</g>`;
  };

  /** A Lucide icon `size` world units wide, top-left corner at `origin`. */
  const icon = (name: string, plane: Plane, origin: P, size: number, cls = "") =>
    onPlane(plane, origin, icons[name]?.body ?? "", size / 24, `ci-icon ${cls}`);

  const box = (x: number, y: number, z: number, w: number, d: number, h: number, cls = "") => {
    const t = z + h;
    return [
      `<g class="ci-box ${cls}">`,
      poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, t], [x + w, y, t]], "ci-r"),
      poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, t], [x, y + d, t]], "ci-l"),
      poly([[x, y, t], [x + w, y, t], [x + w, y + d, t], [x, y + d, t]], "ci-t"),
      `</g>`,
    ].join("");
  };

  const ellipse = (cx: number, cy: number, z: number, r: number) => {
    const [x, y] = pt(cx, cy, z);
    return { x, y, rx: r * COS * Math.SQRT2, ry: r * SIN * Math.SQRT2 };
  };

  /** Circle lying flat at height z, projected to an axis-aligned ellipse. */
  const disc = (cx: number, cy: number, z: number, r: number, cls: string) => {
    const e = ellipse(cx, cy, z, r);
    return `<ellipse class="${cls}" cx="${f(e.x)}" cy="${f(e.y)}" rx="${f(e.rx)}" ry="${f(e.ry)}"/>`;
  };

  /** Arc of a flat circle, angles in degrees measured on the projected ellipse. */
  const arc = (cx: number, cy: number, z: number, r: number, from: number, to: number, cls: string) => {
    const e = ellipse(cx, cy, z, r);
    const at = (deg: number) => {
      const a = (deg * Math.PI) / 180;
      return `${f(e.x + e.rx * Math.cos(a))} ${f(e.y + e.ry * Math.sin(a))}`;
    };
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `<path class="${cls}" d="M ${at(from)} A ${f(e.rx)} ${f(e.ry)} 0 ${large} 1 ${at(to)}"/>`;
  };

  const cylinder = (cx: number, cy: number, z: number, r: number, h: number, cls = "") => {
    const b = ellipse(cx, cy, z, r);
    const t = ellipse(cx, cy, z + h, r);
    const side = `M ${f(b.x - b.rx)} ${f(t.y)} L ${f(b.x - b.rx)} ${f(b.y)} A ${f(b.rx)} ${f(b.ry)} 0 0 0 ${f(b.x + b.rx)} ${f(b.y)} L ${f(b.x + b.rx)} ${f(t.y)} Z`;
    return [
      `<g class="ci-box ${cls}">`,
      `<path class="ci-r" d="${side}"/>`,
      `<ellipse class="ci-t" cx="${f(t.x)}" cy="${f(t.y)}" rx="${f(t.rx)}" ry="${f(t.ry)}"/>`,
      `</g>`,
    ].join("");
  };

  /** Database: stacked cylinder segments with a small gap, like the classic DB glyph. */
  const database = (cx: number, cy: number, r: number, segments: number, segH: number, gap: number, cls = "") =>
    Array.from({ length: segments }, (_, i) => cylinder(cx, cy, i * (segH + gap), r, segH, i === segments - 1 ? cls : "")).join("");

  /** Server rack: stacked units with status LEDs and vents on the +x face. */
  const rack = (x: number, y: number, w: number, d: number, units: number, unitH: number, cls = "", litUnit = -1) =>
    Array.from({ length: units }, (_, i) => {
      const z = i * unitH;
      const leds = [0, 1, 2]
        .map((k) => `<circle class="${i === litUnit && k === 0 ? "ci-led ci-led--on" : "ci-led"}" cx="${5 + k * 5}" cy="${unitH / 2}" r="1.4"/>`)
        .join("");
      const vents = [0, 1, 2].map((k) => `<line class="ci-vent" x1="${d - 16 + k * 4}" y1="${unitH * 0.3}" x2="${d - 16 + k * 4}" y2="${unitH * 0.7}"/>`).join("");
      return box(x, y, z, w, d, unitH, cls) + onPlane("right", [x + w, y + d, z + unitH], leds + vents);
    }).join("");

  /**
   * Extruded cloud standing upright and facing the viewer's lower-left (+y),
   * built by stacking copies of Lucide's cloud outline from back to front.
   */
  const cloud = (center: P, size: number, depth: number, cls = "") => {
    const k = size / 24;
    const body = icons.cloud.body.replace(/stroke="[^"]*"|fill="[^"]*"/g, "");
    const at = (dy: number): P => [center[0] - size / 2, center[1] + dy, center[2] + size * 0.55];
    const steps = 8;
    const layers: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const dy = -depth + (depth * i) / steps;
      const layerCls = i === 0 ? "ci-cloud-back" : i === steps ? "ci-cloud-front" : "ci-cloud-mid";
      layers.push(onPlane("left", at(dy), body, k, layerCls));
    }
    return `<g class="ci-cloud ${cls}">${layers.join("")}</g>`;
  };

  /** Pipeline along the given corners, with small ring joints where it turns. */
  const pipe = (list: P[], cls = "", joints = true) =>
    path(list, `ci-pipe ${cls}`) +
    (joints ? list.slice(1, -1).map((p) => node(...p, 2.6, "ci-joint")).join("") : "") +
    node(...list[list.length - 1], 2.2, "ci-joint ci-joint--end");

  /** Dashed floor grid, faded out toward the edges with `maskId`. */
  const grid = (extent: number, step: number, maskId: string) => {
    const lines: string[] = [];
    for (let i = -extent; i <= extent; i += step) {
      lines.push(line([i, -extent, 0], [i, extent, 0], "ci-floor"), line([-extent, i, 0], [extent, i, 0], "ci-floor"));
    }
    const [cx, cy] = pt(0, 0, 0);
    return [
      `<defs><radialGradient id="${maskId}-g" cx="${f(cx)}" cy="${f(cy)}" r="${f(extent * 1.25)}" gradientUnits="userSpaceOnUse">`,
      `<stop offset="0.35" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>`,
      `<mask id="${maskId}"><rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#${maskId}-g)"/></mask></defs>`,
      `<g mask="url(#${maskId})">${lines.join("")}</g>`,
    ].join("");
  };

  return { pt, poly, line, path, node, onPlane, icon, box, disc, arc, cylinder, database, rack, cloud, pipe, grid };
}

export type Iso = ReturnType<typeof createIso>;
