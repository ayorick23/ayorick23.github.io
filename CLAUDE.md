# ayorick23.github.io — Portfolio de Dereck Mendez

Portfolio personal construido con **Astro + TypeScript + Tailwind CSS v4**, desplegado en GitHub Pages vía GitHub Actions. Reemplazó por completo un prototipo estático de un solo `index.html`.

Dereck no es desarrollador frontend — su fondo es negocio/HR → analítica → Data Science/ML/MLOps. Al tomar decisiones de arquitectura o UI, explica el porqué en términos simples; no asumas que conoce jerga frontend.

## Comandos

```bash
npm install          # instalar dependencias
npm run dev           # servidor local en localhost:4321
npm run build          # build de producción a ./dist/
npm run preview        # previsualizar el build
npx astro check         # type-check completo (correr antes de dar algo por terminado)
npx astro dev stop       # detener el dev server (queda corriendo en background aunque el comando "termine")
```

Node no viene preinstalado en esta máquina por defecto — si `node`/`npm` no están en PATH, ya se instaló vía `winget install OpenJS.NodeJS.LTS`; puede que haga falta anteponer `$env:Path += ";C:\Program Files\nodejs"` en PowerShell si la sesión es nueva.

**Gotcha importante**: `astro-icon` (los íconos locales de `src/assets/icons/`) escanea la carpeta y cachea el contenido de cada SVG **una sola vez, al arrancar** el dev server. Si agregas, renombras o editas el contenido de un ícono local mientras el servidor ya está corriendo, no vas a ver el cambio hasta hacer `npx astro dev stop` + `npm run dev` de nuevo — un simple refresh del navegador no alcanza.

## Arquitectura

- `src/pages/` — rutas en inglés (locale por defecto, sin prefijo). `src/pages/es/` refleja cada ruta en español.
- `src/components/views/` — el contenido real de cada página (`HomeView`, `AboutView`, `ExperienceView`, `ProjectsIndexView`). Los archivos en `src/pages/` son wrappers delgados que solo envuelven la View en `BaseLayout`, así EN/ES nunca duplican markup.
- `src/content/projects/{en,es}/*.md` — casos de estudio de proyectos (Astro content collection, schema en `src/content.config.ts`). Cada proyecto necesita un `.md` en ambos idiomas con el mismo slug de archivo.
- `src/content/i18n/{en,es}.ts` — **todo** el copy de la interfaz. Los componentes nunca deben tener texto hardcodeado; si agregas un texto nuevo, añade el campo a `src/content/i18n/types.ts` primero y luego a ambos `en.ts`/`es.ts`.
- `src/data/` — datos estructurales sin idioma: `nav.ts`, `social-links.ts` (links reales de GitHub/LinkedIn/email — los íconos de GitHub/LinkedIn son SVGs locales propios, email usa `lucide:mail`), `constellation.ts` (geometría de los 6 nodos del hero), `tools.ts` (lista ordenada de herramientas del marquee, con sus íconos).
- `src/lib/` — helpers: `i18n.ts` (resolución de locale, rutas alternas), `projects.ts` (fetch de la content collection), `cv.ts` (detecta si existe el PDF del CV para ese idioma).
- `src/scripts/` — TypeScript plano que se importa desde `<script>` en los `.astro` (nada de framework — ni React ni Vue). `theme.ts`, `language.ts`, `nav.ts`, `reveal.ts`, `constellation.ts`, `timeline.ts`.
- `src/styles/global.css` — tokens de diseño (dark por defecto, override en `[data-theme="light"]`) y el mapeo a Tailwind v4 vía `@theme inline`.

## i18n

- Inglés vive en la raíz (`/`, `/about`, `/projects/...`), español bajo `/es/...`. Configurado en `astro.config.mjs` (`i18n.routing.prefixDefaultLocale: false`).
- El selector de idioma (`LanguageSwitcher.astro`) calcula la ruta equivalente en el otro idioma con `getAlternatePath` (`src/lib/i18n.ts`). El texto del botón es solo el código corto del idioma destino (`EN`/`ES`), no el nombre completo.
- **Importante**: al hacer clic en el switcher, `src/scripts/language.ts` guarda el idioma destino en `localStorage` *antes* de navegar — si no fuera así, el script de auto-redirect en `/` (que respeta la preferencia guardada) rebota de vuelta al idioma anterior. No tocar ese orden sin entender por qué existe.

## Content collection de proyectos

Schema en `src/content.config.ts`. Campos relevantes: `title`, `category`, `shortDescription`, `description`, `technologies[]`, `githubUrl?`, `demoUrl?`, `metrics[]`, `sections[]` (bloques tipo Contexto/Enfoque/Resultado), `featured`, `status` (`placeholder | draft | published`), `coverImage?`.

- Si `githubUrl` no está definido, el botón de GitHub de la tarjeta simplemente no se renderiza (no hay estado "roto"). Mismo patrón para `demoUrl`.
- Si `coverImage` no está definido, la tarjeta muestra el placeholder con el patrón diagonal y el texto "portada pendiente" en vez de asumir que hay imagen.
- `status: "placeholder"` solo controla el badge "Ejemplo/Placeholder" en la página del caso de estudio — no lo uses para decidir si mostrar la portada (eso es cosa de `coverImage`).

## Diseño / interacciones no obvias

- **Theming**: dark es el modo primario. Toggle es un switch horizontal (`ThemeToggle.astro`, `role="switch"`), no un botón con ícono. El estado vive en `localStorage("theme")` + atributo `data-theme` en `<html>`. El `color-scheme` de `<html>` se sincroniza con `:root[data-theme="light"]` en `global.css` — si algún día "el modo claro se ve raro en scrollbars/inputs nativos", es lo primero a revisar (ya hubo un bug real acá: un selector `:has()` mal escrito nunca hacía match).
- **View Transitions**: el sitio usa `<ClientRouter />` de Astro (`astro:transitions`) para las transiciones entre páginas. Esto tiene una trampa: el `<html>` que genera el servidor **nunca** incluye `data-theme` (lo agrega solo el script inline del cliente), así que en cada swap de página Astro puede borrar ese atributo. Por eso el script de tema en `BaseLayout.astro` corre tanto al cargar como en el evento `astro:after-swap` — si tocas ese script, no rompas ese doble-enganche o el tema se resetea a oscuro al navegar.
- Componentes con `transition:persist` (Nav, Footer) no se re-montan entre páginas — cualquier script que los inicialice debe ser **idempotente** (usa el patrón `if (el.dataset.initialized) return; el.dataset.initialized = "true";` que ya está en `theme.ts`, `nav.ts`, `language.ts`, `timeline.ts`) o vas a duplicar listeners en cada navegación.
- **Nav**: layout de 3 columnas con flex-basis igual (`flex-1` a ambos lados del bloque de links) para que los links queden centrados de verdad, sin importar que el cluster derecho (idioma + CV + toggle) sea más ancho que el logo. El botón de CV lleva un ícono (`lucide:download`) para ocupar menos espacio en vez de un texto largo.
- **Constelación** (`Constellation.astro` + `scripts/constellation.ts`): canvas 2D + nodos DOM reales encima (accesibles, no hit-testing sobre canvas). Cada nodo se puede arrastrar (Pointer Events) y al soltar vuelve a su posición base con una física de resorte simple (`SPRING_STIFFNESS`/`SPRING_DAMPING` al inicio del archivo, `0.09`/`0.78`). Respeta `prefers-reduced-motion` (congela animación, sin resorte). Los íconos de GitHub/LinkedIn del Hero (junto al botón "About me") usan una animación de brillo pulsante (`dm-star-glow` en `global.css`) inspirada en el mismo lenguaje visual de las estrellas, aunque no comparten código con el canvas.
- **Trayectoria profesional** (`Timeline.astro` + `scripts/timeline.ts`): reutiliza **la misma física de resorte que la constelación** (mismas constantes `SPRING_STIFFNESS`/`SPRING_DAMPING` — si se afinan en un archivo, replicar en el otro). Cada fila (`data-timeline-node`) es un solo elemento arrastrable que incluye el punto Y su texto (periodo/rol/empresa/descripción se mueven juntos). La línea central **no es un div estático**: son segmentos `<line>` de SVG dibujados entre cada par de puntos consecutivos y recalculados en cada frame según la posición real (base + offset) de cada nodo, así que se doblan seguido cuando arrastrás un punto y se iluminan (`.is-lit`) cuando el nodo conectado está en hover o siendo arrastrado — igual que las aristas de la constelación se iluminan con su nodo. La línea se posiciona en `calc(37% + 28px)` (no 50%) a propósito, para dejarle más aire a la columna de descripción.
- **Marquee de herramientas** (sección "Herramientas y tecnologías" en `HomeView.astro`): cinta infinita en CSS puro (keyframe `dm-marquee`, `translateX(-50%)` sobre una lista duplicada), sin JS. Se pausa en hover/focus y respeta `prefers-reduced-motion`. El tooltip con el nombre de la herramienta necesita que el contenedor use `overflow-x-hidden` (no `overflow-hidden` a secas) más padding vertical generoso, o el tooltip queda recortado.
  - **Íconos raster dentro del marquee**: algunos íconos (`XGBoost`, `Pandera`, `Seaborn`) no son SVGs vectoriales limpios — se resuelven como PNG vía `mask-image` + `background-color: currentColor` (mismo mecanismo que un ícono SVG con `fill="currentColor"`, pero para bitmaps). Ver `rasterSrc()` en `HomeView.astro` y el flag `raster: true` en `src/data/tools.ts`. El SVG original de Seaborn (`devicon-plain--seaborn`) era un trazado auto-vectorizado con miles de segmentos que causaba un stutter visible al entrar en pantalla dentro del marquee (el navegador lo re-rasteriza por tile de compositor, `will-change: transform` solo no alcanza) — por eso se convirtió a PNG.
  - **Íconos de color con "degradado" adaptado al tema**: cuando un ícono viene originalmente a color con gradientes fijos (ej. el logo oficial de Power BI), no se puede usar tal cual porque no se adapta a `currentColor`. La técnica usada es aplanar a `currentColor` pero variar `fill-opacity` por capa (ej. Power BI: 1 / .7 / .45 en sus tres barras, mismo patrón que Excel) — así se logra una sensación de profundidad/degradado tonal que sigue siendo monocromo y responde al tema.
- **Íconos de tecnologías**: son SVGs propios de Dereck en `src/assets/icons/`, cargados como set local de `astro-icon` (`iconDir: 'src/assets/icons'` en `astro.config.mjs`). Se usan por nombre de archivo sin extensión y sin prefijo, ej. `<Icon name="devicon-plain--pandas" />`. Todos usan `fill="currentColor"` (o el mecanismo de `mask-image` para los raster), así heredan el color de texto del tema automáticamente — no hace falta invertir ni tocar opacidad manualmente salvo para el efecto de degradado descrito arriba. El paquete `@iconify-json/logos` también está instalado, así que íconos de marca full-color están disponibles vía `logos:nombre-del-icono` si algún día hace falta la versión a color real (sin aplanar).

## Deploy

`.github/workflows/deploy.yml` hace build y publica `dist/` en cada push a `main`. **Ya configurado y funcionando** — en Settings → Pages del repo, el source ya está en "GitHub Actions" (no "Deploy from a branch").

## Pendientes / contenido por completar

- `public/cv/Dereck-Mendez-CV-EN.pdf` no existe todavía — el botón "Download CV" en inglés se oculta automáticamente hasta que se agregue (ver `src/lib/cv.ts`). El de español (`Dereck-Mendez-CV-ES.pdf`) ya está.
- `operational-demand-forecasting` (en/es) es el único de los 3 proyectos sin `githubUrl` todavía. Los otros dos (`telco-churn-mlops`, `operational-analytics-bi`) ya lo tienen.
- Ningún proyecto tiene `coverImage` real todavía — todas las tarjetas muestran el placeholder de portada.
- `exploringTools` en `src/data/tools.ts` está vacío a propósito ("Explorando ahora" no se muestra hasta que haya algo que poner ahí).
- `simple-icons--n8n.svg` está en `src/assets/icons/` pero **intencionalmente sin usar** — Dereck pidió no agregarlo a la lista de herramientas todavía.
- **`experience.timeline` en `src/content/i18n/es.ts` ya tiene datos reales** (fechas, roles y empresas de Dereck). **`en.ts` todavía tiene los placeholders viejos** ("Current"/"Previous"/"Earlier experience"/"Today" con descripciones genéricas) — falta traducir la versión en inglés para que coincida con la española.

## Convenciones

- No inventar contenido: nombres de empresas, métricas, URLs de repos, capturas de pantalla. Si falta un dato real, se deja oculto/placeholder y se avisa — nunca se rellena con algo inventado.
- Nada de comentarios explicando qué hace el código (el código ya lo dice); solo comentarios cuando hay una razón no obvia (como el del `astro:after-swap` arriba).
- Responder a Dereck en español en este proyecto.
- Antes de dar por terminado un cambio visual: `npx astro check` + `npm run build` limpios, y probarlo en el navegador (no basta con que compile).
- Si el cambio toca íconos locales (`src/assets/icons/`), reiniciar el dev server antes de verificar en el navegador (ver gotcha de `astro-icon` arriba).
