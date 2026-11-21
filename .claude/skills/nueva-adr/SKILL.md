---
name: nueva-adr
description: Registra una decisión de arquitectura o de diseño ya tomada con Dereck como ADR en docs/decisions/, con numeración, plantilla, índice y, si corresponde, la marca de "superada" en la ADR anterior.
argument-hint: "[título de la decisión]"
disable-model-invocation: true
allowed-tools: Bash(ls docs/decisions*) Bash(git branch --show-current)
---

# Nueva ADR: $ARGUMENTS

Rama: !`git branch --show-current`

ADRs existentes (la nueva lleva el número siguiente al último):

!`ls docs/decisions`

## Antes de escribir

1. **La decisión tiene que estar tomada con Dereck.** Si de la conversación no queda clara la
   opción elegida, las alternativas y el porqué, pregunta antes de escribir. No inventes
   alternativas que no se discutieron.
2. **Nunca en `main`.** Si la rama es `main`, crea una `docs/...` (o usa la del trabajo en curso).
3. **¿Cambia una decisión aceptada?** Es una ADR nueva que la supera; la anterior **no** se
   edita salvo su línea de estado.

## Pasos

1. Crea `docs/decisions/NNNN-slug.md`: siguiente número de 4 dígitos; slug en minúsculas, sin
   tildes, con guiones.
2. Escríbela con la estructura de [plantilla.md](plantilla.md). Fecha de hoy, estado `Aceptada`.
3. Si supera a otra, total o parcialmente:
   - En la nueva: `**Estado:** Aceptada — supera a la [NNNN](...) (qué parte)`.
   - En la anterior, solo la línea de estado: `**Estado:** Superada por [NNNN](...) (qué parte)`.
4. Agrega la fila al índice de `docs/decisions/README.md`.
5. Si la decisión cambia algo que describen el `CLAUDE.md`, una regla de `.claude/rules/` o
   `docs/roadmap.md`, actualízalos en el mismo commit.
6. Muestra la ADR y los archivos tocados. No hagas commit hasta que Dereck la revise.

## Estilo

Español, tuteo, frases cortas, sin jerga innecesaria (Dereck no es desarrollador frontend:
explica el porqué en términos de efecto visible). Cada alternativa con su desventaja concreta.
"Por qué" explica el criterio, no repite la decisión. Las consecuencias incluyen los costos.
