---
name: retomar
description: Resume en qué quedó el portafolio para retomar una sesión nueva — trabajo sin mergear, PRs abiertos, estado del CI y pendientes del roadmap, con opciones para hoy. Úsala al empezar una sesión o cuando Dereck pregunte en qué nos quedamos, desde dónde seguimos o qué falta.
allowed-tools: Bash(git branch *) Bash(git status *) Bash(git log *) Bash(git fetch *) Bash(gh pr list *) Bash(gh run list *) Bash(grep *)
---

# Retomar el proyecto

El estado se **deriva** de fuentes versionadas (git, GitHub y `docs/roadmap.md`), no de la
memoria ([ADR 0014](../../../docs/decisions/0014-contexto-de-claude-versionado-en-el-repo.md)).
Dereck fusiona los PRs en GitHub entre sesiones: lo local puede estar atrasado.

## Estado de git

Rama actual: !`git branch --show-current`

Cambios sin commitear:

!`git status --short`

Últimos commits de `origin/main` (después de un fetch):

!`git fetch --quiet --prune 2>/dev/null; git log --oneline --decorate -6 origin/main`

Ramas con trabajo que todavía no está en `origin/main`:

!`git branch -a --no-merged origin/main 2>/dev/null || true`

PRs abiertos:

!`gh pr list --state open --json number,title,headRefName,author --jq '.[] | "#\(.number) [\(.author.login)] \(.headRefName): \(.title)"' 2>/dev/null || echo "(gh no disponible)"`

Últimas corridas del CI:

!`gh run list --limit 5 --json name,headBranch,conclusion,status --jq '.[] | "\(.name) · \(.headBranch) · \(.status) \(.conclusion // "")"' 2>/dev/null || echo "(gh no disponible)"`

## Roadmap

Secciones y pendientes marcados en `docs/roadmap.md` (con número de línea):

!`grep -n "^## \|^### \|^- \[ \]" docs/roadmap.md`

## Qué hacer

1. **Lo abierto va primero.** Cambios sin commitear, ramas sin mergear o PRs con CI en rojo:
   Dereck tiene que decidir qué hacer con eso antes de empezar algo nuevo. Los PRs de
   Dependabot se revisan con el CI en verde, de a uno.
2. **Cruza el roadmap con git:** si un pendiente ya tiene commits en `main`, el roadmap está
   desactualizado. Dilo y propón marcarlo.
3. **La memoria automática es una pista, no la fuente.** Verifícala contra lo anterior y, si
   está desactualizada, corrígela.
4. **Responde corto, en español, con este formato:**
   - **Dónde quedamos:** 2–3 líneas con hechos (rama, último trabajo, PRs, CI).
   - **Sin mergear / sin commitear:** qué hay y qué decidir.
   - **Siguiente en el roadmap:** lo próximo pendiente, con contexto mínimo.
   - **Opciones para hoy:** 2–3 caminos con tu recomendación y el porqué.
5. **No empieces a trabajar.** Termina preguntando por dónde seguimos.
