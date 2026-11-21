---
paths:
  - "src/components/CapabilityIllustration.astro"
  - "src/lib/iso.ts"
  - "src/scripts/capabilities.ts"
---

# Capacidades

- Acordeón horizontal estilo "Selected work" de dataconale.com: el panel en hover crece
  (`flex-grow`), los demás quedan como título vertical; en móvil, acordeón vertical por toque.
- Cada panel lleva una ilustración isométrica en SVG generada por código
  (`CapabilityIllustration.astro` + `src/lib/iso.ts`): caras con `color-mix` de
  `currentColor` (siguen el tema), íconos de Lucide proyectados con `onPlane()`, racks, nubes
  extruidas, tuberías punteadas animadas. Referencias en `desing_reference/isometrics/`.
- Cada escena tiene un `viewBox` recortado a sus límites medidos (mapa `bounds`). Si mueves
  algo en una escena, vuelve a medir o se corta.
- Rendimiento: las animaciones se pausan (`animation-play-state`) si el panel está cerrado o
  la sección fuera de pantalla (`.is-offscreen`).
- Las 6 capacidades son las disciplinas de `src/data/disciplines.ts` (ver regla `proyectos`):
  renombrar una toca también su ilustración aquí.
