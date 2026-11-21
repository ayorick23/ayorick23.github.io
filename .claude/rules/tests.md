---
paths:
  - "tests/**"
  - "vitest.config.ts"
  - "playwright.config.ts"
---

# Tests

- `tests/unit/`: funciones de `src/lib/` (fechas, rutas i18n, duraciones de experiencia,
  `renderBody`, íconos).
- `tests/content/`: integridad del contenido. Paridad en/es de los diccionarios (estructura,
  largo de arrays, textos traducidos en un solo idioma; vacío en ambos = oculto a propósito),
  proyectos en ambos idiomas con los mismos campos estructurales, archivos referenciados que
  existen en `public/`, certificados con PDF + JPG + descripción en ambos idiomas, timeline
  sin solapes y más reciente primero, nodos de la constelación con herramientas/proyectos
  reales. **Si un test de contenido falla tras un cambio intencional, se arregla el dato, no
  el test**, salvo que la regla haya cambiado (y entonces se le pregunta a Dereck).
- `tests/claude/`: el hook `guardia-git` de `.claude/hooks/`.
- `tests/e2e/` (Playwright, desktop + Pixel 7): todas las rutas EN/ES responden 200 sin
  errores de JS, 404 en ambos idiomas, switcher de idioma (incluye la regresión del rebote a
  `/es/`), tema claro sobreviviendo a las View Transitions y menú móvil. Corre contra
  `astro preview` en el puerto 4329: hay que hacer `npm run build` antes. Si choca con otro
  preview abierto: `npx astro preview stop`.
- Archivos de test nuevos: escribirlos con la herramienta Write, no con heredocs de bash
  (los heredocs con muchas comillas fallaron).
