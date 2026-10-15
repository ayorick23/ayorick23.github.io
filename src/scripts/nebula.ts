/*
  Contact card nebula — a WebGL fragment shader instead of 2D canvas blobs,
  because the reference look (wispy, twisting smoke filaments) comes from
  domain-warped noise: fbm sampled at coordinates that are themselves offset
  by fbm, animated over time so the gas keeps flowing.

  The cursor leaves a short trail; each trail point drags the smoke along its
  velocity and swirls it around, fading out over ~2s, so the gas looks pushed
  around rather than repelled by a fixed force field.
*/

const TRAIL = 16;
// Rendered below CSS resolution and upscaled by the browser — smoke is soft by
// nature, and this keeps the per-pixel noise cost reasonable on big cards.
const RENDER_SCALE = 0.55;
// Phones: their dpr pushed the canvas above CSS resolution (2 × 0.55) and the
// shader ran 60 times a second right as the card scrolled in, stalling scroll.
// There it renders at a fixed fraction of CSS pixels and at 30fps instead.
const MOBILE_SCALE = 0.55;
const MOBILE_FRAME_MS = 1000 / 30;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uTrail[${TRAIL}];
uniform float uTrailAge[${TRAIL}];
uniform vec3 uCore;
uniform vec3 uMid;
uniform vec3 uEdge;
uniform vec3 uSpark;
uniform float uIntensity;
uniform float uOpacity;
uniform float uCompact;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

float stars(vec2 p, float density, float size, float t) {
  vec2 cell = floor(p * density);
  vec2 local = fract(p * density) - 0.5;
  float h = hash(cell);
  if (h < 0.93) return 0.0;
  vec2 jitter = vec2(hash(cell + 7.1), hash(cell + 3.7)) - 0.5;
  float d = length(local - jitter * 0.7);
  float twinkle = 0.55 + 0.45 * sin(t * (1.5 + h * 3.0) + h * 40.0);
  return smoothstep(size, 0.0, d) * twinkle * (h - 0.93) * 14.0;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = frag / uRes.y;

  vec2 disp = vec2(0.0);
  for (int i = 0; i < ${TRAIL}; i++) {
    float age = uTrailAge[i];
    if (age > 2.5) continue;
    vec2 d = p - uTrail[i].xy;
    vec2 vel = uTrail[i].zw;
    float g = exp(-dot(d, d) / 0.018) * exp(-age * 1.4);
    disp += vel * g * 0.55;
    disp += vec2(-d.y, d.x) * g * length(vel) * 2.2;
  }

  // On narrow cards the copy fills the width, so the nebula moves to the
  // bottom (behind the buttons) and fades out upward instead of leftward.
  vec2 center = mix(vec2(aspect * 0.74, 0.52), vec2(aspect * 0.62, 0.16), uCompact);
  vec2 q0 = p - center - disp;
  float t = uTime * 0.06;
  // Smoke rises: the sample space scrolls down over time so features drift
  // up, and it's stretched vertically so wisps elongate into plumes.
  vec2 s = q0 * vec2(2.6, 1.7) - vec2(0.0, uTime * 0.09);

  vec2 q = vec2(fbm(s + vec2(0.0, t)), fbm(s + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(s + 1.8 * q + vec2(1.7, 9.2) + t), fbm(s + 1.8 * q + vec2(8.3, 2.8) - t * 0.8));
  float f = fbm(s + 2.0 * r);

  // Soft density ramps rather than sharp bright ridges — hard-edged ridges
  // and strong warping are what made the gas read as water caustics.
  float smoke = smoothstep(0.3, 0.8, f);
  float wisp = pow(1.0 - abs(f * 2.0 - 1.0), 2.0);
  // Finer turbulence that breaks the gas into curling tufts.
  float detail = fbm(s * 2.3 + 2.4 * r - vec2(0.0, t));

  // A tall column of gas, like the reference, with a noisy silhouette.
  vec2 sh = q0 * vec2(1.55, 1.2);
  float shape = smoothstep(0.66, 0.04, length(sh) + (r.x - 0.5) * 0.6 + (q.y - 0.5) * 0.3);
  float density = (smoke * 0.95 + wisp * 0.35) * (0.45 + detail * 1.1) * shape;

  float core = smoothstep(0.4, 0.75, f) * smoothstep(0.45, 0.0, length(q0 * vec2(1.5, 1.3) - vec2(0.0, 0.08)));
  vec3 col = mix(uEdge, uMid, smoothstep(0.2, 0.7, q.y + detail * 0.3));
  col = mix(col, uCore, clamp(core * 2.2, 0.0, 1.0));
  // Densest tufts glow toward white, like the lit edges of the reference.
  col = mix(col, mix(uSpark, vec3(1.0), 0.4), smoothstep(0.55, 0.95, smoke * detail * 1.4) * 0.45);
  col += mix(uMid, uSpark, 0.5) * pow(wisp * detail, 2.0) * 0.45;

  // Keep the left side (where the copy sits) calm.
  float fade = mix(smoothstep(aspect * 0.3, aspect * 0.62, p.x), smoothstep(0.62, 0.12, p.y) * 0.75, uCompact);
  float alpha = clamp(density * uIntensity, 0.0, 1.0) * fade;

  // Static star field + gold dust rising out of the top of the column.
  float field = stars(p, 70.0, 0.09, uTime) * 0.6 * fade;
  vec2 dustP = p + vec2(0.0, -uTime * 0.025);
  float column = smoothstep(0.3, 0.0, abs(q0.x * 1.6)) * smoothstep(-0.2, 0.45, q0.y);
  float dust = (stars(dustP + disp, 140.0, 0.12, uTime) + stars(dustP * 1.7 + disp, 200.0, 0.14, uTime * 1.2)) * column * fade * 1.6;
  float sparkle = clamp(field + dust + stars(p - disp, 110.0, 0.08, uTime * 1.3) * shape * 1.2, 0.0, 1.0);

  // uOpacity < 1 lets premultiplied color exceed alpha, so in dark mode the gas
  // adds light like an emissive glow instead of painting a dark veil over the
  // card; light mode needs full coverage to tint the white background.
  vec3 premul = col * alpha + uSpark * sparkle;
  gl_FragColor = vec4(premul, clamp((alpha + sparkle) * uOpacity, 0.0, 1.0));
}
`;

type RGB = [number, number, number];

// Dark: the reference palette (golden core, blue-white wisps, violet edges).
// Light: same structure in the site's light-mode aurora colors, deeper so it
// still reads over a white card.
const PALETTES: Record<"dark" | "light", { core: RGB; mid: RGB; edge: RGB; spark: RGB; intensity: number; opacity: number }> = {
  dark: { core: [1.0, 0.62, 0.28], mid: [0.66, 0.78, 1.0], edge: [0.4, 0.32, 0.86], spark: [1.0, 0.9, 0.72], intensity: 1.55, opacity: 0.2 },
  light: { core: [1.0, 0.52, 0.28], mid: [0.95, 0.42, 0.62], edge: [0.42, 0.3, 0.9], spark: [0.3, 0.38, 0.9], intensity: 1.05, opacity: 1 },
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initNebula() {
  const container = document.querySelector<HTMLElement>("[data-nebula]");
  const canvas = container?.querySelector<HTMLCanvasElement>("[data-nebula-canvas]");
  if (!container || !canvas || container.dataset.initialized) return;
  container.dataset.initialized = "true";

  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uRes = u("uRes");
  const uTime = u("uTime");
  const uTrail = u("uTrail");
  const uTrailAge = u("uTrailAge");
  const uCore = u("uCore");
  const uMid = u("uMid");
  const uEdge = u("uEdge");
  const uSpark = u("uSpark");
  const uIntensity = u("uIntensity");
  const uOpacity = u("uOpacity");
  const uCompact = u("uCompact");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 1023px)");
  const controller = new AbortController();
  const { signal } = controller;
  // The copy sits on top of this layer, so pointer events are read from the
  // whole card rather than the canvas container.
  const card = container.parentElement ?? container;

  let width = 1;
  let height = 1;
  let raf = 0;
  let running = false;
  let inView = false;
  const startTime = performance.now();

  const trail = new Float32Array(TRAIL * 4);
  const trailAge = new Float32Array(TRAIL).fill(99);
  const trailBorn = new Float64Array(TRAIL).fill(-1e9);
  let head = 0;
  let last: { x: number; y: number; t: number } | null = null;

  function applyPalette() {
    const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const pal = PALETTES[theme];
    gl!.uniform3fv(uCore, pal.core);
    gl!.uniform3fv(uMid, pal.mid);
    gl!.uniform3fv(uEdge, pal.edge);
    gl!.uniform3fv(uSpark, pal.spark);
    gl!.uniform1f(uIntensity, pal.intensity);
    gl!.uniform1f(uOpacity, pal.opacity);
    if (!running) render(performance.now());
  }

  function resize() {
    const rect = container!.getBoundingClientRect();
    const scale = small.matches ? MOBILE_SCALE : Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
    width = Math.max(1, Math.round(rect.width * scale));
    height = Math.max(1, Math.round(rect.height * scale));
    canvas!.width = width;
    canvas!.height = height;
    gl!.viewport(0, 0, width, height);
    gl!.uniform2f(uRes, width, height);
    gl!.uniform1f(uCompact, rect.width < 640 ? 1 : 0);
    if (!running) render(performance.now());
  }

  function render(now: number) {
    for (let i = 0; i < TRAIL; i++) trailAge[i] = (now - trailBorn[i]) / 1000;
    gl!.uniform1f(uTime, reduceMotion ? 12 : (now - startTime) / 1000);
    gl!.uniform4fv(uTrail, trail);
    gl!.uniform1fv(uTrailAge, trailAge);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  let lastFrame = 0;
  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (small.matches && now - lastFrame < MOBILE_FRAME_MS - 2) return;
    lastFrame = now;
    render(now);
  }

  function sync() {
    const shouldRun = !reduceMotion && inView && !document.hidden;
    if (shouldRun && !running) {
      running = true;
      raf = requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  applyPalette();
  const themeObserver = new MutationObserver(applyPalette);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  small.addEventListener("change", resize, { signal });
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Only animate while the card is on screen — it sits at the very bottom of
  // the page, so otherwise the shader would run for the whole visit.
  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      sync();
    },
    { rootMargin: "200px" },
  );
  io.observe(container);
  document.addEventListener("visibilitychange", sync, { signal });

  if (!reduceMotion) {
    card.addEventListener(
      "pointermove",
      (e) => {
        const rect = container.getBoundingClientRect();
        // Shader space: y up, normalized by the card height.
        const x = (e.clientX - rect.left) / rect.height;
        const y = 1 - (e.clientY - rect.top) / rect.height;
        const now = performance.now();
        // Sampled every ~35ms so the 16 trail points span a visible stroke
        // instead of the last few frames of a fast mouse.
        if (last && now - last.t < 35) return;
        if (last) {
          const dt = (now - last.t) / 1000;
          const vx = Math.max(-1.5, Math.min(1.5, (x - last.x) / dt)) * 0.12;
          const vy = Math.max(-1.5, Math.min(1.5, (y - last.y) / dt)) * 0.12;
          trail.set([x, y, vx, vy], head * 4);
          trailBorn[head] = now;
          head = (head + 1) % TRAIL;
        }
        last = { x, y, t: now };
      },
      { signal },
    );
    card.addEventListener("pointerleave", () => (last = null), { signal });
  }

  document.addEventListener(
    "astro:before-swap",
    () => {
      controller.abort();
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      running = false;
      cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
    { once: true },
  );
}
