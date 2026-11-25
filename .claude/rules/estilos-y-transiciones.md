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
  - "src/scripts/contact-graph.ts"
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
- Contraste: todo texto debe cumplir WCAG AA (4,5:1; lo verifica axe en los e2e). `--ink-3` se
  aclaró por eso el 2026-11-20 (`#7e8592` oscuro / `#686e77` claro). Única excepción aceptada: la
  píldora "Hoy" del Gantt.
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

## Grafo de contacto (`contact-graph.ts`)

Reemplazó a la nebulosa WebGL el 2026-11-20 (opción elegida por Dereck: se veía distinta en cada
máquina). Grafo de nodos estilo Obsidian en canvas 2D: los nodos derivan y se enlazan con sus
vecinos; el cursor es un nodo más (con una atracción suave); 5 nodos "hub" llevan herramientas
reales del stack (SQL, Python, Power BI, Analytics, Machine Learning). Al pasar o enfocar un botón
(Hablemos, GitHub, LinkedIn), los nodos más cercanos del lado del grafo mandan líneas **rectas** y
tenues (20 %) al botón, con pulsos que viajan, en el color del botón: carmesí, color del texto para GitHub (negro en claro, blanco en oscuro: el negro no se veía en oscuro) y azul
LinkedIn (#0a66c2). Dereck prefiere rectas tenues a las curvas que esquivaban el texto. Dentro de
la tarjeta el cursor del sistema se oculta y lo reemplaza un punto carmesí de 12px
(`[data-contact-cursor]`, movido en el mismo `pointermove`), solo con puntero fino. Los nodos se concentran donde no hay texto (derecha en escritorio, abajo en celular);
en celular el canvas va al 60 % de opacidad y sin etiquetas. Lee los colores del tema una vez
(refresca al cambiar `data-theme`), solo anima en pantalla, 30 fps y dpr 1 en < 1024px, y sin
movimiento con `prefers-reduced-motion`. Los tokens `--nebula-cloud-*` siguen en `global.css`
porque los usan las tarjetas de métricas.

## Rendimiento en móvil (no reintroducir)

- `backdrop-blur` de tarjetas grandes solo con prefijo `lg:`: detrás está `.ambient-wash`
  fijo y el celular re-desenfocaba cada tarjeta en cada cuadro de scroll.
- El grafo de contacto en < 1024px se dibuja a dpr 1 y a 30 fps (la nebulosa anterior, sin ese
  límite, era el tirón real al final de Capacidades).
- Si el sitio se siente lento solo en la máquina de Dereck, revisar primero que Chrome no haya
  caído a "Microsoft Basic Render Driver" (GPU apagada) antes de culpar al código.
