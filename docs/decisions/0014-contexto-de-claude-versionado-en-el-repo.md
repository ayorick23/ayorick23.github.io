# 0014. Contexto de Claude versionado en el repo, con la memoria como caché personal

**Estado:** Aceptada
**Fecha:** 2026-11-20

## Contexto

El `CLAUDE.md` había crecido a ~32 KB y se cargaba completo en cada sesión, aunque solo se
tocara un texto. Las preferencias de colaboración y los pendientes del proyecto vivían en la
memoria automática de Claude (personal, fuera del repo, con snapshots que se pisaban). Dereck
ya usa una estructura más ordenada en `ecommerce-medallion-pipeline` y quería lo mismo aquí,
visible en el repo.

## Decisión

- `CLAUDE.md` corto: proyecto, comandos, reglas globales, forma de colaborar y dónde está el resto.
- `.claude/rules/`: el detalle técnico por área, cargado solo al tocar esos archivos (`paths:`).
- `.claude/skills/`: procedimientos (`/retomar`, `/verificar`, `/nuevo-proyecto`,
  `/nuevo-certificado`, `/nueva-adr`).
- `.claude/settings.json`: permisos compartidos y el hook `guardia-git` (no commit/merge/push
  sobre `main`, no `--no-verify`), con tests en `tests/claude/`. Lo personal va en
  `.claude/settings.local.json` o `CLAUDE.local.md`, fuera de git.
- `docs/roadmap.md`: los pendientes. `docs/decisions/`: las ADRs, incluidas las retroactivas
  0001–0013.
- La memoria automática queda solo para lo personal (perfil y preferencias de Dereck); lo que
  el proyecto necesita saber se escribe en el repo.

## Alternativas consideradas

- **Seguir con un solo `CLAUDE.md`:** cada sesión carga contexto que no usa, y crece sin límite.
- **Pendientes en GitHub Issues:** más formal, pero suma una herramienta más para un proyecto
  personal; un archivo en el repo alcanza y se revisa en los mismos PRs.

## Por qué

El contexto correcto llega en el momento correcto, las decisiones quedan con su porqué y el
estado se deriva de fuentes versionadas en vez de una memoria que se desactualiza.

## Consecuencias

- Al cambiar un área hay que actualizar su regla en el mismo commit.
- El hook solo mira el texto del comando: es una red de seguridad, no una barrera infalible.
- A diferencia de Medallion, aquí los commits sí llevan la línea `Co-Authored-By`.
