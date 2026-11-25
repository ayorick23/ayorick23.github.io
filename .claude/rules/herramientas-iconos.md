---
paths:
  - "src/assets/icons/**"
  - "src/data/tools.ts"
  - "src/lib/tech-icons.ts"
  - "src/lib/raster-icons.ts"
  - "src/scripts/tools.ts"
  - "src/components/ToolChip.astro"
  - "src/components/views/HomeView.astro"
  - "astro.config.mjs"
---

# Herramientas e íconos

Contexto: [ADR 0005](../../docs/decisions/0005-iconos-propios-monocromos.md).

## Íconos locales (`src/assets/icons/`)

- SVGs propios de Dereck, set local de `astro-icon` (`iconDir: 'src/assets/icons'`). Se usan
  por nombre de archivo sin extensión ni prefijo: `<Icon name="devicon-plain--pandas" />`.
- Todos con `fill="currentColor"`: heredan el color del tema. Íconos de color de marca
  existen vía `logos:*` (`@iconify-json/logos`) pero Dereck rechazó los íconos a color.
- **Gotcha**: `astro-icon` cachea los SVG **al arrancar** el dev server. Si agregas, renombras
  o editas un ícono con el servidor corriendo: `npx astro dev stop` + `npm run dev`. Un
  refresh no alcanza.
- Íconos que vienen a color con degradados (ej. Power BI): aplanar a `currentColor` y variar
  `fill-opacity` por capa (Power BI 1 / .7 / .45, mismo patrón que Excel).
- Raster (`XGBoost`, `Pandera`, `Seaborn`): PNG vía `mask-image` + `background-color:
currentColor` (`raster: true` en `tools.ts`, `rasterSrc()`). El SVG de Seaborn tenía miles
  de segmentos y trababa el marquee; por eso es PNG.
- `simple-icons--n8n.svg` está **sin usar a propósito**: Dereck pidió no agregarlo todavía.

## Datos (`src/data/tools.ts`)

Herramientas por categoría (`toolGroups`) más `projectTechIcons`/`projectTechGroups` para
tecnologías de proyectos que no están en la sección. `techIcon()`/`techGroup()` en
`lib/tech-icons.ts`. `exploringTools` vacío a propósito ("Explorando ahora" no se muestra
hasta que haya algo). El grupo `ai` es solo de herramientas **para desarrollar**: Claude Code,
Antigravity, MCP y Agent Skills. Claude (chat) y NotebookLM se quitaron el 2026-11-20 porque no son de
desarrollo; no agregar otras salvo que Dereck las use para programar.

## Marquee (sección "Herramientas" de `HomeView.astro`)

Cinta infinita en CSS puro (`dm-marquee`, `translateX(-50%)` sobre lista duplicada), sin JS;
se pausa en hover/focus y respeta `prefers-reduced-motion`. El tooltip necesita
`overflow-x-hidden` (no `overflow-hidden`) más padding vertical generoso o queda recortado.
Los chips no animan `blur` en < 1024px.
