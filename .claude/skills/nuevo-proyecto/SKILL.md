---
name: nuevo-proyecto
description: Agrega un proyecto nuevo al portafolio — caso de estudio en inglés y español, disciplinas, tecnologías con ícono, portada dibujada por código y og:image. Úsala cuando Dereck quiera sumar un proyecto o pasar uno de draft a publicado.
argument-hint: "[slug-del-proyecto]"
disable-model-invocation: true
allowed-tools: Bash(ls src/content/projects*) Bash(git branch --show-current)
---

# Nuevo proyecto: $ARGUMENTS

Rama: !`git branch --show-current` (si es `main`, crea `feat/proyecto-...` antes de tocar nada).

Proyectos existentes:

!`ls src/content/projects/es`

## Antes de escribir

1. **Fuente real.** El contenido sale del repo del proyecto (README, código, notebooks) o de
   lo que diga Dereck. **Nunca** inventar métricas, URLs, empresas ni capturas
   ([ADR 0004](../../../docs/decisions/0004-contenido-real-o-nada.md)). Si falta un dato, se
   omite el campo (el botón o la métrica no se renderiza) y se avisa qué falta y dónde va.
2. Pregunta lo que no esté claro: `status` (`draft`/`published`), `track` (`data`/`software`),
   `featured`, y el orden respecto de los demás.

## Pasos

1. `src/content/projects/es/$ARGUMENTS.md` y `en/$ARGUMENTS.md` con los mismos campos
   estructurales (schema en `src/content.config.ts`; usa un proyecto publicado como modelo).
   El texto en inglés es traducción del español, no otro contenido.
2. `disciplines[]` con ids de `src/data/disciplines.ts`. Tono de analista de datos.
3. Cada tecnología debe tener ícono: si no está en `toolGroups`, agrégala en
   `projectTechIcons` y `projectTechGroups` (`src/data/tools.ts`). Íconos nuevos son SVG
   monocromos en `src/assets/icons/` (pide a Dereck el suyo antes de buscar uno genérico).
4. Portada: nuevo `coverKind` siguiendo la regla `portadas` (union + `COVER_KINDS` +
   `COVER_TINTS`, enum de `content.config.ts`, `renderProjectCard()` en el generador). Propón
   2–3 conceptos con una recomendación antes de dibujar.
5. `npm run generate:og` y setear `ogImage` en ambos idiomas.
6. Si el proyecto aparece en la esfera del hero, súmalo al nodo en `src/data/constellation.ts`.
7. `/verificar`. Muestra el resultado y espera la revisión antes de commitear.
