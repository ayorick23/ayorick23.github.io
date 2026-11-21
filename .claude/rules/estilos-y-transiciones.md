---
paths:
  - "src/styles/**"
  - "src/layouts/BaseLayout.astro"
  - "src/components/Nav.astro"
  - "src/components/Footer.astro"
  - "src/components/ThemeToggle.astro"
  - "src/components/Arrow.astro"
  - "src/components/Button.astro"
  - "src/components/SectionHeader.astro"
  - "src/scripts/theme.ts"
  - "src/scripts/nav.ts"
  - "src/scripts/anchor-scroll.ts"
  - "src/scripts/reveal.ts"
  - "src/scripts/nebula.ts"
---

# Estilos, tema, navegación y transiciones

## Tokens y tipografía

- `src/styles/global.css`: tokens (dark por defecto, override en `[data-theme="light"]`) y
  mapeo a Tailwind v4 vía `@theme inline`.
- Títulos y cuerpo en Manrope, con la fórmula fina + **negrita** + color en los títulos
  (Dereck la quiere conservar). Etiquetas, fechas y números en **Satoshi** vía la clase
  `font-mono` (el nombre se conservó por ~80 usos; ya no es monoespaciada), peso regular, punto
  de color, tracking reducido. Satoshi se carga desde Fontshare
  ([ADR 0010](../../docs/decisions/0010-satoshi-desde-fontshare.md)).
- Acento Carmesí (`#ef4d56` oscuro / `#d42a35` claro), `--accent-2` coral. `BaseLayout` lleva
  `<meta name="darkreader-lock">`: Dereck usa Dark Reader y repintaba los colores.
- **Nunca escribir `**` ni nada que forme `*/` dentro de un comentario CSS** `/* */`: cierra
  el comentario antes de tiempo y rompe el build (ya pasó con `/* **bold** */`).

## Tema

Dark es el modo primario. `ThemeToggle.astro` es un switch horizontal (`role="switch"`).
Estado en `localStorage("theme")` + `data-theme` en `<html>`. `color-scheme` se sincroniza con
`:root[data-theme="light"]`: si scrollbars/inputs nativos se ven raros en claro, revisar eso
primero (hubo un bug real con un `:has()` mal escrito).

## View Transitions (`<ClientRouter />`)

- El `<html>` del servidor **nunca** trae `data-theme`; en cada swap Astro puede borrarlo. Por
  eso el script de tema de `BaseLayout` corre al cargar **y** en `astro:after-swap`. No romper
  ese doble enganche o el tema vuelve a oscuro al navegar (hay un e2e).
- Nav y Footer usan `transition:persist`: sus scripts deben ser **idempotentes**
  (`if (el.dataset.initialized) return; el.dataset.initialized = "true";`, como en `theme.ts`,
  `nav.ts`, `language.ts`) o se duplican listeners en cada navegación.
- No reintroducir ([ADR 0011](../../docs/decisions/0011-sin-scroll-suave-global-ni-transicion-en-main.md)):
  `scroll-behavior: smooth` global en `html`, ni `transition:animate` en `<main>`.
- Scroll de anclas en `anchor-scroll.ts`: centra el contenido de la sección bajo el nav, o pega
  su inicio bajo el nav si no cabe; escucha en fase de captura para adelantarse al router.

## Nav y flechas

- Nav de 3 columnas con `flex-1` a ambos lados de los links, para que queden centrados de
  verdad aunque el cluster derecho (idioma + CV + toggle) sea más ancho que el logo. El CV es
  un ícono (`lucide:download`).
- Todas las flechas usan `Arrow.astro` (Lucide, `dir` right/left/up-right). En hover salen en
  su dirección y vuelven desde el lado contrario (`.dm-arrow`). En tarjetas-enlace (`.group`)
  usar `<Arrow group />`. Esos botones no llevan el efecto de levantarse.

## Nebulosa de contacto (`nebula.ts`)

Shader WebGL (fbm con domain warping) con aspecto de humo que sube; el cursor deja una estela
que arremolina el gas. Resolución reducida (`RENDER_SCALE`), solo mientras la tarjeta está en
pantalla. Oscuro = gas emisivo (`uOpacity` bajo); claro = paleta de aurora. En móvil baja a la
parte inferior de la tarjeta. Si se ve "como agua": crestas duras o warping fuerte (ver
comentarios del shader). Arranca en `requestIdleCallback` con compilación de shader en
paralelo (crear el contexto dentro de la transición congelaba ~1 s). Dereck quiere
reemplazarla (`docs/roadmap.md`).

## Rendimiento en móvil (no reintroducir)

- `backdrop-blur` de tarjetas grandes solo con prefijo `lg:`: detrás está `.ambient-wash`
  fijo y el celular re-desenfocaba cada tarjeta en cada cuadro de scroll.
- La nebulosa en < 1024px se dibuja a 0.55 de la resolución CSS (no según
  `devicePixelRatio`) y a 30 fps: era el tirón real al final de Capacidades.
- Si el sitio se siente lento solo en la máquina de Dereck, revisar primero que Chrome no haya
  caído a "Microsoft Basic Render Driver" (GPU apagada) antes de culpar al código.
