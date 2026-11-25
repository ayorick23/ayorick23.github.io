---
paths:
  - "src/lib/project-cover-kinds.ts"
  - "src/scripts/project-covers.ts"
  - "src/components/ProjectCover.astro"
  - "scripts/generate-og-images.mjs"
  - "public/og/**"
---

# Portadas de proyectos y og:image

Contexto: [ADR 0006](../../docs/decisions/0006-portadas-dibujadas-por-codigo.md).

## Portadas en la web

- Cada `coverKind` es una función `draw()` en `src/lib/project-cover-kinds.ts`, animada en
  canvas por `project-covers.ts`. Estilo actual ("A reforzada", 2026-11-16): helper `stage()`
  (escenario centrado con proporción tope) y tinte por proyecto en `COVER_TINTS`
  (churn teal, benchmark violeta, medallion bronce, odontogram celeste).
- `benchmark` = barras con el salario nominal y línea con el ajustado por PPP de 6 países
  reales del proyecto (ordenados por nominal, así la línea que se dispara en India cuenta que el
  ranking cambia). Códigos de país (US, CH…) para que sirva en ambos idiomas.
- `odontogram`: el barrido de escaneo se desvanece arriba y abajo (degradado del mismo color con
  alfa, no hacia negro transparente) y su brillo es un óvalo radial: Dereck no quiere ver un corte.
- `medallion` = registros crudos (Bronze) → tabla tipada (Silver) → star schema con las
  tablas reales de Gold (`fct_pedidos` + `dim_*`). `odontogram` = odontograma FDI con un
  barrido que corre siempre (más rápido en hover).
- Los colores bronce/plata/oro y el modo claro se deducen de `C.glow`, no del DOM: el
  generador de og:image corre en Node.
- El color de "riesgo" de la portada de churn es ámbar, no rojo, para no chocar con el
  acento Carmesí.
- Rendimiento: lee los colores del tema una vez (se refrescan al cambiar `data-theme`) y el
  ciclo duerme si ninguna portada está en pantalla.

## og:image (`npm run generate:og`)

- Generador **manual**, no parte del build: correrlo cuando cambie la bio, la foto, el texto
  de un proyecto o sus métricas, y commitear `public/og/*.png`.
- Tarjeta de marca (`site-{locale}.png`) con `@napi-rs/canvas`: Manrope real vía
  `@fontsource/manrope` (no la variable: sus pesos no se aplican vía `ctx.font`), el recorte
  circular de `src/assets/images/dereck-mendez-cutout.png` (alfa real) y una mini-constelación.
- Portadas por proyecto (`{slug}-{locale}.png`): la derecha es la misma `draw()` congelada
  (`prog=1`); la izquierda, categoría + título + tagline recortada del `shortDescription`
  real (nunca reescrita) + las 3 primeras métricas reales (o chips de tecnologías + badge
  "en desarrollo" si no hay métricas). Nada de screenshots.
- Node 24 importa `project-cover-kinds.ts` directo (type stripping nativo): el archivo no
  debe tener imports externos ni sintaxis TS no borrable. No dupliques la lógica de dibujo.
- `roundRectPath()` clampea `r = Math.min(r, w/2, h/2)`: no lo quites (con `r: 999` la curva
  cruzaba todo el canvas).
- La URL del pie de las portadas es la del dominio; si cambia, regenerar.

## Portada nueva

Agregar la entrada al union `CoverKind` + `COVER_KINDS` en `project-cover-kinds.ts`, al enum
`coverKind` de `content.config.ts`, una llamada a `renderProjectCard()` en el script, y
regenerar.
