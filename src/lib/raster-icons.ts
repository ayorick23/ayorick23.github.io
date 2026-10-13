const rasterIcons = import.meta.glob<{ default: { src: string } }>("../assets/icons/*.{png,webp}", {
  eager: true,
});

export function rasterSrc(filename: string) {
  const entry = Object.entries(rasterIcons).find(([path]) => path.endsWith(`/${filename}`));
  return entry?.[1].default.src ?? "";
}

/** Draws a bitmap as a CSS mask filled with currentColor, so it follows the theme like a currentColor SVG. */
export function maskStyle(filename: string) {
  const url = rasterSrc(filename);
  return `mask-image:url(${url});mask-size:contain;mask-repeat:no-repeat;mask-position:center;-webkit-mask-image:url(${url});-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center`;
}

export const isBitmap = (filename: string) => /\.(png|webp)$/.test(filename);
