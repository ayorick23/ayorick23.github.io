# 0001. Astro + TypeScript + Tailwind v4, sin framework de UI

**Estado:** Aceptada
**Fecha:** 2026-08-10 (registrada retroactivamente el 2026-11-20)

## Contexto

El portafolio empezó como un prototipo estático de un solo `index.html`, con contenido de
ejemplo y sin sistema para escribir casos de estudio. Hacía falta un sitio real, bilingüe,
rápido y alojado gratis en GitHub Pages.

## Decisión

Reconstruirlo con **Astro + TypeScript + Tailwind CSS v4**, generado de forma estática. La
interactividad va en TypeScript plano dentro de `src/scripts/`, importado desde `<script>` en
los `.astro`. Sin React, Vue ni otro framework de componentes en el navegador.

## Alternativas consideradas

- **Seguir con el HTML único:** no escala a varias páginas, dos idiomas y casos de estudio.
- **Astro con islas de React/Vue:** suma el peso de un framework en cada página para
  interacciones que se resuelven con un script chico.

## Por qué

Es un sitio de contenido: casi todo se puede generar en el build y enviarse como HTML. Astro
hace eso por defecto, y lo poco interactivo (esfera, Gantt, filtros) no necesita un framework.

## Consecuencias

- Páginas livianas y sin dependencias de UI que mantener.
- Cada script interactivo se escribe a mano y debe ser idempotente por las View Transitions
  (regla `estilos-y-transiciones`).
- Los cambios de dependencias pasan por Dependabot y el CI.
