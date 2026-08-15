# Dereck Mendez — Portfolio

_Data Science · Machine Learning · MLOps_

[![Live Site](https://img.shields.io/badge/live_site-ayorick23.github.io-5b8cff?style=flat-square)](https://ayorick23.github.io)
![Deploy](https://img.shields.io/github/actions/workflow/status/ayorick23/ayorick23.github.io/deploy.yml?branch=main&style=flat-square&label=deploy)
![Astro](https://img.shields.io/badge/Astro-7-BC52EE?style=flat-square&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

**[→ ayorick23.github.io](https://ayorick23.github.io)**

---

## Why a portfolio site

My path into data didn't start in a data role. I moved from business operations and people/HR analytics into Data Science, Machine Learning and — increasingly — the engineering side of ML (MLOps): experiment tracking, data versioning, testing, containers, deployment.

A generic template or a PDF résumé couldn't really show that path or the way I work. What I wanted instead was a place that:

- Presents real, end-to-end case studies — not just a list of tools — so the reasoning behind a project (the business question, the approach, the trade-offs) is visible, not just the result.
- Reflects the way I actually build things: reproducible, tested, versioned — the same standards I apply to a notebook or a pipeline, applied here to a codebase.
- Speaks both English and Spanish natively, since my work happens in both.
- Is something I fully own — the code, the content and the deploy pipeline — rather than a hosted builder.

This repository is that site: an Astro + TypeScript + Tailwind CSS codebase, hand-built and self-deployed to GitHub Pages.

## Screenshots

<!--
  TODO(Dereck): drop PNGs/WebPs into a `docs/screenshots/` folder and update the
  paths below. Suggested shots: hero (dark), hero (light), projects index,
  a project case study, and the contact section. Keep dark as the primary
  shot since it's the default theme.
-->

![hero-dark](docs\screenshots\hero-dark-en.png)

_Hero Dark Mode_

![hero-dark](docs\screenshots\hero-light-en.png)

_Hero Light Mode_

![projects-index](docs\screenshots\projects-index-dark-en.png)

_Projects index_

|     Hero (dark)      |    Projects index    |
| :------------------: | :------------------: |
| _screenshot pending_ | _screenshot pending_ |

|      Light mode      |      Case study      |
| :------------------: | :------------------: |
| _screenshot pending_ | _screenshot pending_ |

## Tech stack

|                  |                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**    | [Astro](https://astro.build) 7 — islands architecture, zero client JS by default, `<ClientRouter />` for view transitions                                                 |
| **Language**     | TypeScript, strict content-collection schemas via [Zod](https://zod.dev)                                                                                                  |
| **Styling**      | [Tailwind CSS v4](https://tailwindcss.com) (`@theme inline`, no config file — tokens live in `src/styles/global.css`)                                                     |
| **Content**      | Astro content collections (`src/content/projects/{en,es}`) — project case studies as typed Markdown                                                                       |
| **Icons**        | [astro-icon](https://github.com/natemoo-re/astro-icon) with a local SVG set (`src/assets/icons/`) + [Iconify](https://iconify.design) (`lucide`, `simple-icons`, `logos`) |
| **Fonts**        | [Fontsource](https://fontsource.org) — Manrope Variable (display/body) + JetBrains Mono (labels/code)                                                                     |
| **SEO**          | `@astrojs/sitemap`                                                                                                                                                        |
| **Hosting / CI** | GitHub Pages, built and deployed by GitHub Actions on every push to `main`                                                                                                |

No UI framework (React/Vue/Svelte) is used — interactive pieces (theme, language, hero constellation, timeline, project covers) are plain TypeScript modules loaded from `<script>` tags in the `.astro` files that need them.

## Project structure

```plaintext
ayorick23.github.io/
├── public/
│   └── cv/                      # Downloadable CV PDFs (per language)
├── src/
│   ├── assets/
│   │   ├── icons/                # Local SVG icon set (astro-icon)
│   │   └── images/                # Portrait / raster assets
│   ├── components/
│   │   ├── views/                 # Actual page content per route
│   │   │   ├── HomeView.astro
│   │   │   ├── AboutView.astro
│   │   │   ├── ExperienceView.astro
│   │   │   └── ProjectsIndexView.astro
│   │   ├── Nav.astro, Footer.astro, ThemeToggle.astro, LanguageSwitcher.astro
│   │   ├── Constellation.astro, Timeline.astro
│   │   ├── ProjectCard.astro, ProjectCover.astro
│   │   └── ...
│   ├── content/
│   │   ├── projects/
│   │   │   ├── en/*.md            # Project case studies, English
│   │   │   └── es/*.md            # Project case studies, Spanish (same slugs)
│   │   └── i18n/
│   │       ├── en.ts, es.ts        # All UI copy — components never hardcode text
│   │       └── types.ts            # Shared shape both locales must satisfy
│   ├── content.config.ts          # Zod schema for the projects collection
│   ├── data/                      # Locale-free structural data
│   │   ├── nav.ts, social-links.ts, tools.ts, constellation.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro        # <html>, theme bootstrap, ClientRouter
│   │   └── ProjectLayout.astro     # Case-study page shell
│   ├── lib/
│   │   ├── i18n.ts                 # Locale resolution, alternate-path helper
│   │   ├── projects.ts             # Content collection fetch/query helpers
│   │   └── cv.ts                   # Detects whether a CV PDF exists per locale
│   ├── pages/
│   │   ├── index.astro, about.astro, experience.astro, projects/...
│   │   └── es/                     # Same routes, mirrored under /es
│   ├── scripts/                    # Plain TS, imported from <script> tags
│   │   ├── theme.ts, language.ts, nav.ts, reveal.ts
│   │   ├── constellation.ts, timeline.ts    # Shared spring-physics drag
│   │   ├── project-covers.ts               # Canvas project cover animations
│   │   └── nebula.ts                       # Contact section particle field
│   └── styles/
│       └── global.css              # Design tokens (dark default) + Tailwind v4 mapping
├── astro.config.mjs                 # i18n routing, sitemap, icon dir
├── .github/workflows/deploy.yml     # Build + deploy to GitHub Pages
├── LICENSE
└── README.md
```

## Landing page design

The design brief I gave myself: **look like a data/ML engineering tool, not a template.** Dark-first, monospace accents for labels and metadata (the way logs, dashboards and code editors read), a restrained accent-blue/violet pair, and generous whitespace instead of decoration for its own sake.

<!-- TODO(Dereck): screenshot of the full hero section here -->

A few choices worth calling out:

- **Dark by default, light as the deliberate alternative.** Most of the audience for a DS/ML portfolio — engineers, recruiters skimming at night, anyone pulling up a repo — defaults to dark tooling. Light mode exists and is fully themed (it's not an afterthought), but dark is the first impression.
- **The hero constellation** (six draggable nodes — ML, Data Science, Analytics, MLOps, People Analytics, Python) is a literal visualization of the idea that these disciplines are connected, not separate boxes on a résumé. Dragging a node and watching it spring back is a small, low-stakes way to signal "this site was built, not templated" in the first five seconds.
- **The professional timeline** reuses that same spring-physics interaction (rather than inventing a second one) so the site feels internally consistent instead of like a grab-bag of effects. The connecting line is drawn live between each node's actual position, so it bends and lights up as you interact — it's not a static image.
- **Animated project covers** (canvas, one per case study) replace generic stock imagery with small abstract visualizations related to each project's domain (churn, forecasting, clustering, pipelines) — consistent with "show the work," not "decorate the page."
- **The tools marquee** is a plain CSS scrolling strip, deliberately not JS-animated — it's decorative, so it shouldn't cost anything at runtime.

## Sections

| Section                  | What it's for                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hero**                 | Headline, one-line pitch, primary CTAs and the interactive constellation.                                                                         |
| **Featured work**        | The 2–3 strongest case studies, as cards linking to full project pages.                                                                           |
| **Tools & technologies** | The stack I actually use day to day, as a scrolling icon strip.                                                                                   |
| **About (preview)**      | A short "who I am" teaser with a link to the full `/about` page.                                                                                  |
| **Experience**           | The last two roles from my professional timeline, with a link to the full history.                                                                |
| **Capabilities**         | What I can be hired to do, grouped into six concrete capability areas (analysis, ML, forecasting, MLOps, visualization, ML software engineering). |
| **Contact**              | A direct call to action with email and social links — no contact form, just a mailto and real profiles.                                           |

Every section above exists in English at `/` and in Spanish at `/es` — same components, same layout, only the copy source (`src/content/i18n/{en,es}.ts`) changes.

## Notable features

**Language switcher (EN ⇄ ES).** The button in the nav always shows the _destination_ language's short code (`EN` or `ES`), and jumps to the equivalent page in that language rather than back to the homepage — `/es/projects/telco-churn-mlops` switches to `/projects/telco-churn-mlops`, not `/`. The choice is also remembered: it's written to `localStorage` before the page navigates, so a later visit to `/` auto-redirects to whichever language you picked last, instead of defaulting back to English every time.

**Theme toggle (dark ⇄ light).** A switch in the nav flips a `data-theme` attribute on `<html>`, which every color in the site is defined against — so there's exactly one source of truth for "what does accent-blue look like right now," not a parallel light stylesheet to keep in sync. The preference is also saved to `localStorage`, and because the site uses Astro's view transitions (page navigation without a full reload), the theme script re-applies itself after every page swap so the site never flashes back to dark mid-navigation.

**Content collections, not a CMS.** Each project case study is a typed Markdown file (title, technologies, metrics, GitHub/demo links, narrative sections) validated against a shared schema, in both languages, so a broken or missing field fails the build instead of shipping a blank page.

## Getting started

```bash
npm install          # install dependencies
npm run dev           # dev server at localhost:4321
npm run build          # production build to ./dist/
npm run preview        # preview the production build
npx astro check         # full type-check
```

> **Note:** `astro-icon` scans and caches `src/assets/icons/` once, when the dev server starts. If you add, rename, or edit a local icon file while the server is already running, restart it (`npx astro dev stop` then `npm run dev`) — a browser refresh alone won't pick it up.

## Content still needed

These are intentionally placeholder until provided — not bugs, just gaps to track:

- **Projects**: `operational-demand-forecasting` (en/es) has no `githubUrl` yet; the other two case studies do. None of the three have a real `coverImage` yet — cards show an animated placeholder cover until one is set.
- **Experience timeline**: `experience.timeline` in `src/content/i18n/es.ts` has my real roles, dates and companies. `en.ts` still has older placeholder copy — needs translating to match.
- **CV**: `Dereck-Mendez-CV-ES.pdf` is in `public/cv/`; `Dereck-Mendez-CV-EN.pdf` is missing — the English "Download CV" button stays hidden until it's added (see `src/lib/cv.ts`).

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/` on every push to `main` via GitHub Pages' native Actions deployment. In the repo's **Settings → Pages**, the source is set to **GitHub Actions**.

## License

[MIT](./LICENSE) — the code and site structure in this repository are free to reuse, with attribution. This does **not** extend to my personal content (CV, case-study text, photos, project descriptions), which remains mine.
