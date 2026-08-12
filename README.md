# Dereck Mendez — Portfolio

Personal portfolio built with Astro, TypeScript and Tailwind CSS v4, deployed to GitHub Pages via GitHub Actions.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the dev server at `localhost:4321` (runs in background)
- `npx astro dev stop` — stop the background dev server
- `npm run build` — build the static site to `./dist/`
- `npm run preview` — preview the production build locally
- `npx astro check` — type-check the project

> **Note:** `astro-icon` scans and caches `src/assets/icons/` once, when the dev server starts. If you add, rename, or edit a local icon file while the server is already running, restart it (`npx astro dev stop` then `npm run dev`) — a browser refresh alone won't pick up the change.

## Structure

- `src/pages/` — English routes (default locale, unprefixed). `src/pages/es/` mirrors every route in Spanish.
- `src/components/views/` — the actual page content (`HomeView`, `AboutView`, `ExperienceView`, `ProjectsIndexView`); the files under `src/pages` are thin wrappers so English/Spanish never duplicate markup.
- `src/content/projects/{en,es}/*.md` — project case studies (Astro content collection, schema in `src/content.config.ts`).
- `src/content/i18n/{en,es}.ts` — all UI copy. Components never hardcode text.
- `src/data/` — structural, locale-free data (nav items, social links, constellation geometry, the ordered tool list for the marquee).
- `src/scripts/` — plain TypeScript imported from `<script>` tags in `.astro` files (no framework). Includes the shared spring-physics drag interaction used by both the hero constellation (`constellation.ts`) and the professional-timeline nodes (`timeline.ts`).
- `src/styles/global.css` — design tokens (dark by default, `[data-theme="light"]` override) and Tailwind v4 theme mapping.

## Notable interactions

- **Hero constellation**: draggable nodes with spring-back physics, drawn on a canvas with real DOM elements layered on top for accessibility.
- **Professional timeline**: reuses the same spring physics as the constellation. Each row (dot + role/company/description) is one draggable unit, and the connecting line is drawn as SVG segments recalculated every frame — dragging a point bends and lights up its neighboring segments in real time.
- **Tools marquee**: an infinite CSS-only scrolling strip (no JS) with a hover tooltip and pause-on-hover. A few icons that only exist as raster logos, or that would stutter as heavy auto-traced SVGs, are rendered via a CSS `mask-image` trick instead of inline SVG so they still adopt `currentColor` per theme.

## Content still needed

These are intentionally placeholder until provided — search the codebase for them before treating the site as launch-ready:

- **Projects**: `operational-demand-forecasting` (en/es) has no `githubUrl` yet; the other two case studies do. None of the three have a real `coverImage` yet — cards show a placeholder pattern until one is set.
- **Experience timeline**: `experience.timeline` in `src/content/i18n/es.ts` has Dereck's real roles, dates and companies. `en.ts` still has the old placeholder copy ("Current"/"Previous"/etc.) — needs translating to match.
- **CV**: `Dereck-Mendez-CV-ES.pdf` is in `public/cv/`; `Dereck-Mendez-CV-EN.pdf` is missing — the English "Download CV" button stays hidden until it's added (see `src/lib/cv.ts`).

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/` on every push to `main` via GitHub Pages' native Actions deployment. In the repo's **Settings → Pages**, the source must be set to **GitHub Actions**.
