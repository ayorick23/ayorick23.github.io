# Dereck Mendez — Portfolio

Personal portfolio built with Astro, TypeScript and Tailwind CSS, deployed to GitHub Pages via GitHub Actions.

## Commands

| Command          | Action                                   |
| :--------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Start the dev server at `localhost:4321`  |
| `npm run build`   | Build the static site to `./dist/`        |
| `npm run preview` | Preview the production build locally      |
| `npx astro check` | Type-check the project                    |

## Structure

- `src/pages/` — English routes (default locale, unprefixed). `src/pages/es/` mirrors every route in Spanish.
- `src/components/views/` — the actual page content (`HomeView`, `AboutView`, `ExperienceView`, `ProjectsIndexView`); the files under `src/pages` are thin wrappers so English/Spanish never duplicate markup.
- `src/content/projects/{en,es}/*.md` — project case studies (Astro content collection, schema in `src/content.config.ts`).
- `src/content/i18n/{en,es}.ts` — all UI copy. Components never hardcode text.
- `src/data/` — structural, locale-free data (nav items, social links, constellation geometry, tool lists).
- `src/styles/global.css` — design tokens (dark by default, `[data-theme="light"]` override) and Tailwind v4 theme mapping.

## Content still needed

These are intentionally placeholder until provided — search the codebase for them before treating the site as launch-ready:

- **Projects**: `src/content/projects/en|es/*.md` are illustrative placeholders (`status: placeholder`). Replace with real case studies; add a real `githubUrl`/`demoUrl` per project (the site hides those links until set).
- **Experience timeline**: `experience.timeline` in `src/content/i18n/{en,es}.ts` has placeholder roles/orgs/dates.
- **CV**: drop `Dereck-Mendez-CV-EN.pdf` / `Dereck-Mendez-CV-ES.pdf` into `public/cv/` — the Download CV button is hidden until the matching file exists (see `src/lib/cv.ts`).
- **Project cover images**: none yet; case study pages show a placeholder pattern until real screenshots are added.

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/` on every push to `main` via GitHub Pages' native Actions deployment. In the repo's **Settings → Pages**, the source must be set to **GitHub Actions** (one-time change from the previous "Deploy from a branch" setup).
