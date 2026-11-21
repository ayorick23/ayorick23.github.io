# CLAUDE.md

## Proyecto

Portafolio personal de Dereck Mendez en `dereckmendez.com`: **Astro + TypeScript + Tailwind
CSS v4**, estático, bilingüe (inglés en la raíz, español en `/es/`), desplegado en GitHub
Pages con GitHub Actions.

El sitio presenta a Dereck como **analista de datos** (Data Analytics · BI · Machine
Learning), el rol al que aplica. ML, MLOps e ingeniería de datos son diferenciales, no el
titular ([ADR 0009](docs/decisions/0009-posicionamiento-analista-de-datos.md)).

**Fuente de verdad** (léela antes de retomar trabajo, o usa `/retomar`):

- `docs/roadmap.md`: qué falta.
- `docs/decisions/`: las decisiones de arquitectura y diseño (ADRs) con su porqué.

## Comandos

```bash
npm install            # dependencias
npm run dev            # localhost:4321 (queda en background: `npx astro dev stop`)
npm run build          # build de producción a ./dist/
npm test               # Vitest: unitarios, contenido y hook de git (< 1 s)
npm run test:e2e       # Playwright contra el build (correr `npm run build` antes)
npm run verify         # todo: astro check + Vitest + build + Playwright
npm run audit:ci       # filtro de seguridad del CI (audit-allowlist.json)
npm run generate:og    # regenerar las og:image (manual, se commitean)
```

## Mapa del código

- `src/pages/` (y `src/pages/es/`): wrappers delgados que envuelven una View en `BaseLayout`.
- `src/components/views/`: el contenido real de cada página (`HomeView`, `AboutView`,
  `ExperienceView`, `ProjectsIndexView`).
- `src/content/i18n/{en,es}.ts`: **todo** el copy. `src/content/projects/{en,es}/*.md`: casos
  de estudio.
- `src/data/`: datos sin idioma (nav, redes, herramientas, disciplinas, constelación,
  certificados, educación).
- `src/lib/`: helpers puros (con tests en `tests/unit/`). `src/scripts/`: TypeScript plano de
  la interactividad, sin framework ([ADR 0001](docs/decisions/0001-astro-typescript-tailwind-sin-framework-ui.md)).
- `src/styles/global.css`: tokens de diseño y tema.

## Reglas

- **Contenido real o nada**: nunca inventar empresas, métricas, URLs, capturas ni
  descripciones. Si falta un dato, el elemento no se renderiza y se avisa qué falta y dónde va
  ([ADR 0004](docs/decisions/0004-contenido-real-o-nada.md)).
- **Nada de texto hardcodeado** en componentes: campo en `src/content/i18n/types.ts`, después en
  `en.ts` y `es.ts`.
- **Comentarios** solo cuando hay una razón no obvia; el código ya dice qué hace.
- **Verificar antes de dar algo por terminado**: `npm run verify` limpio y, si es visual,
  probado en el navegador (`/verificar`).
- **Git**: cada trabajo en una rama `feat/`, `fix/`, `chore/`, `test/` o `docs/`; nunca commit,
  merge ni push sobre `main`. **Commit y push solo cuando Dereck lo pide explícitamente.** El
  merge lo hace él en GitHub, así que antes de empezar hay que hacer fetch y mirar
  `origin/main`. Los commits llevan la línea `Co-Authored-By`. El hook
  `.claude/hooks/guardia-git.mjs` lo hace cumplir: si te bloquea, corrige el comando, no lo
  esquives.
- **Tests de contenido**: si fallan tras un cambio intencional, se arregla el dato, no el test.

## Cómo colaborar con Dereck

- Responder **en español**. El código y sus comentarios, en inglés.
- Su fondo es negocio/HR → analítica → Data Science/ML/MLOps; **no es desarrollador frontend**.
  Explica las decisiones técnicas en términos simples y por su efecto visible.
- **Recomienda**: una opción justificada, no un menú neutro. Él corrige si no está de acuerdo.
  Las preguntas de opción múltiple quedan solo para lo que es decisión exclusivamente suya.
- Si ves un camino técnico claramente mejor que lo que pidió, dilo con el porqué antes de
  ejecutar; no lo sigas ni lo cambies en silencio.
- **No sumes cambios que no pidió**, aunque sean técnicamente necesarios: plantéalos como
  pregunta *antes* de escribir el código.
- **Bocetos y "tal cual" se siguen al pie de la letra.** Si lo literal choca con algo técnico,
  nombra el conflicto y pregunta ofreciendo primero la versión literal. Antes de un cambio de
  diseño, resume lo que entendiste.
- Usa sus propios assets (íconos, fotos, CV) antes que genéricos: pregunta dónde están.
- Ritmo: itera sin pedir permiso a mitad de tarea, verifica en el navegador, muestra el
  resultado y espera su revisión.

## Dónde vive el resto del contexto ([ADR 0014](docs/decisions/0014-contexto-de-claude-versionado-en-el-repo.md))

- `.claude/rules/`: el detalle de cada área, que se carga solo al tocar sus archivos
  (`i18n-contenido`, `proyectos`, `portadas`, `experiencia`, `hero`, `about`,
  `herramientas-iconos`, `capacidades`, `estilos-y-transiciones`, `ci-deploy`, `tests`).
- `.claude/skills/`: procedimientos (`/retomar`, `/verificar`, `/nuevo-proyecto`,
  `/nuevo-certificado`, `/nueva-adr`).
- `.claude/settings.json`: permisos compartidos y hooks. Lo personal va en
  `.claude/settings.local.json` o `CLAUDE.local.md` (fuera de git).
- La memoria automática de Claude es una caché personal: lo que el proyecto necesita saber se
  escribe aquí, en una regla, en el roadmap o en una ADR.
