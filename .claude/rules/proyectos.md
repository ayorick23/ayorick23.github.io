---
paths:
  - "src/content/projects/**"
  - "src/content.config.ts"
  - "src/lib/projects.ts"
  - "src/lib/format-text.ts"
  - "src/data/disciplines.ts"
  - "src/layouts/ProjectLayout.astro"
  - "src/components/views/ProjectsIndexView.astro"
  - "src/components/Project*.astro"
  - "src/components/StatusBadge.astro"
  - "src/components/SectionImage.astro"
  - "src/scripts/projects-filter.ts"
  - "src/scripts/metrics.ts"
  - "src/scripts/lightbox.ts"
---

# Proyectos (content collection)

Para agregar un proyecto completo usa `/nuevo-proyecto`.

## Schema (`src/content.config.ts`)

Campos: `title`, `category`, `shortDescription`, `description`, `technologies[]`,
`disciplines[]`, `githubUrl?`, `demoUrl?`, `metrics[]`, `sections[]`, `featured`, `status`
(`placeholder | draft | published`), `track` (`data | software`), `coverKind?`, `coverImage?`,
`ogImage?`.

- Cada proyecto es un `.md` en `src/content/projects/en/` **y** `es/` con el mismo slug y los
  mismos campos estructurales (lo verifica `tests/content/projects.test.ts`).
- `disciplines[]` es lo que filtra `/projects`. `category` es texto libre solo para mostrar:
  no filtrar por él.
- Sin `githubUrl`/`demoUrl` el botón simplemente no se renderiza (no hay estado "roto").
- Sin `coverImage` la tarjeta usa la portada dibujada por código (`coverKind`) o el
  placeholder "portada pendiente". Hoy ningún proyecto tiene `coverImage` real.
- `status: "placeholder"` solo controla el badge del caso de estudio; no decide la portada.
- `track: "software"` (OdontoTrack) va al final de `/projects` bajo "Desarrollo de software"
  y nunca en la home.
- `ogImage?` es la portada social, independiente de `coverImage` (ver regla `portadas`).

## Disciplinas

`src/data/disciplines.ts` define 6 ids (`data-analysis`, `data-visualization`,
`machine-learning`, `forecasting`, `mlops`, `data-engineering`). Son a la vez las 6
Capacidades de la landing y la taxonomía `disciplines[]`. Renombrar o agregar una toca tres
cosas juntas: `disciplines.ts`, `capabilities.items` en `en.ts`/`es.ts` y su ilustración en
`CapabilityIllustration.astro`.

## Filtro de `/projects` (`projects-filter.ts`)

Disciplina y estado como pestañas con píldora deslizante (reusa las clases `dm-tools-*`);
tecnologías como menú desplegable agrupado con las categorías de `toolGroups` (las que no
están ahí se asignan en `projectTechGroups`). Varias tecnologías combinan con OR.

## Caso de estudio (`ProjectLayout.astro`)

- Métricas (`metrics.ts`): cards con resplandor, conteo y blur-in al entrar en pantalla. El
  conteo anima solo el primer número y conserva prefijos/sufijos (`+84%`, `85,088`, `0.99`).
- `sections[].body` admite `code`, **negrita**, *cursiva* y listas (`renderBody` en
  `format-text.ts`). Se inyecta con `set:html`, así que sus estilos van en `global.css` bajo
  `.section-body` (los `<style>` con scope no alcanzan HTML inyectado).
- Cada imagen de sección necesita su propio `alt`/`caption`: ya pasó que se copiaron iguales
  en todas.
- Lightbox (`lightbox.ts`): el zoom cambia el `width` real de la imagen, no `transform:
  scale` (con scale el contenedor no ganaba área de scroll).

## Estado del contenido

`data-ai-compensation-benchmark` y `telco-churn-mlops` publicados; `ecommerce-medallion-pipeline`
en `draft`; OdontoTrack (`track: software`). Los proyectos plantilla y los duplicados viejos
se eliminaron y no deben reaparecer. Pendientes en `docs/roadmap.md`.
