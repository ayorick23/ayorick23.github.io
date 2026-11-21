---
paths:
  - ".github/**"
  - "astro.config.mjs"
  - "package.json"
  - "package-lock.json"
  - "scripts/audit.mjs"
  - "audit-allowlist.json"
  - "public/robots.txt"
---

# CI, deploy y dominio

## Workflows

- `deploy.yml`: en cada push a `main` corre `astro check`, tests y build, y publica `dist/` en
  GitHub Pages (Settings → Pages = "GitHub Actions", ya configurado).
- `ci.yml`: en cada PR hacia `main`. Check, audit, Vitest, build, verificación de páginas clave
  en `dist/` y Playwright. Si se agrega o renombra una ruta principal, actualizar esa lista.
- `main` está protegida por el ruleset **`main-secure`** (Settings → Rules → Rulesets, no la
  protección clásica: `gh api .../branches/main/protection` responde 404 aunque esté activa;
  consultar `gh api repos/ayorick23/ayorick23.github.io/rulesets`). Exige el check, prohíbe
  push forzado y borrar la rama; sin excepciones.
- El job se llama **"Check, audit & build"** aunque corre más cosas: es el nombre que exige el
  ruleset. No renombrarlo
  ([ADR 0013](../../docs/decisions/0013-nombre-fijo-del-job-de-ci.md)).
- `dependabot.yml`: npm semanal (menores/parches agrupados) y Actions mensual. Ignora los
  saltos mayores de TypeScript hasta que `@astrojs/check` los soporte.

## Audit

`npm run audit:ci` (`scripts/audit.mjs`) bloquea alertas altas/críticas de dependencias de
producción salvo las listadas en `audit-allowlist.json` con motivo y `reviewBy`. Una excepción
vencida también falla ([ADR 0012](../../docs/decisions/0012-excepciones-de-audit-con-fecha-de-revision.md)).
Agregar una excepción es decisión de Dereck: explícale el riesgo y pregunta.

## Dominio `dereckmendez.com`

Ver [ADR 0008](../../docs/decisions/0008-dominio-propio-cloudflare-dns-only.md).

- Registrado en Cloudflare Registrar, DNS en Cloudflare; el sitio sigue en GitHub Pages.
- 4 `A` en `@` (`185.199.108–111.153`), 4 `AAAA` en `@` (`2606:50c0:8000–8003::153`),
  `CNAME www → ayorick23.github.io` y `TXT _github-pages-challenge-ayorick23`. **Todos con nube
  gris (DNS only)**: con proxy GitHub no puede emitir el certificado HTTPS.
- Dominio configurado en Settings → Pages → Custom domain. Con deploy por Actions **no** hace
  falta (ni sirve) `public/CNAME`. "Enforce HTTPS" activado.
- La URL está escrita en: `site` de `astro.config.mjs` (sitemap, canonical, og:image
  absolutas), `public/robots.txt`, el pie de las portadas en `scripts/generate-og-images.mjs` y
  `README.md`. Si cambia el dominio, tocar los cuatro.

## Node en esta máquina

Si `node`/`npm` no están en PATH (sesión nueva de PowerShell):
`$env:Path += ";C:\Program Files\nodejs"` (instalado con `winget install OpenJS.NodeJS.LTS`).
