---
paths:
  - "src/content/i18n/**"
  - "src/lib/i18n.ts"
  - "src/pages/**"
  - "src/components/views/**"
  - "src/components/LanguageSwitcher.astro"
  - "src/scripts/language.ts"
---

# Idiomas, copy y páginas

Contexto: [ADR 0002](../../docs/decisions/0002-ingles-en-la-raiz-espanol-en-es.md) y
[ADR 0003](../../docs/decisions/0003-copy-en-diccionarios-y-vistas-compartidas.md).

## Rutas

- Inglés en la raíz (`/`, `/about`, `/projects/...`), español bajo `/es/...`
  (`i18n.routing.prefixDefaultLocale: false` en `astro.config.mjs`).
- `src/pages/` son wrappers delgados: solo envuelven la View de `src/components/views/` en
  `BaseLayout`. EN y ES nunca duplican markup; si agregas una página, crea la View y los dos
  wrappers. Si es una ruta principal, súmala a la lista de páginas del CI (`ci.yml`) y a los
  e2e (`tests/e2e/smoke.spec.ts`).

## Copy

- **Todo** el texto de la interfaz vive en `src/content/i18n/{en,es}.ts`. Nada hardcodeado
  en componentes. Texto nuevo: primero el campo en `src/content/i18n/types.ts`, después en
  ambos diccionarios.
- Vacío en ambos idiomas = oculto a propósito. Lleno en uno solo = error (lo atrapa
  `tests/content/i18n-parity.test.ts`).
- Tono de textos nuevos: Dereck se presenta como **analista de datos** (Data Analytics · BI ·
  Machine Learning); ML, MLOps e ingeniería de datos son diferenciales, no el titular
  ([ADR 0009](../../docs/decisions/0009-posicionamiento-analista-de-datos.md)).

## Selector de idioma

- `LanguageSwitcher.astro` calcula la ruta equivalente con `getAlternatePath`
  (`src/lib/i18n.ts`). El botón muestra solo el código del idioma destino (`EN`/`ES`).
- **No tocar este orden**: al hacer clic, `src/scripts/language.ts` guarda el idioma destino
  en `localStorage` _antes_ de navegar. Si no, el auto-redirect de `/` (que respeta la
  preferencia guardada) rebota al idioma anterior. Hay un e2e para esta regresión.

## Página 404

GitHub Pages sirve un único `404.html` para toda URL inexistente (también `/es/...`), así que
`src/pages/404.astro` renderiza ambos idiomas y un script inline elige por la ruta (`/es/`) o
la preferencia guardada. El nav queda en inglés (limitación aceptada). Usa `noindex` de
`BaseLayout`, que además omite canonical/hreflang.
