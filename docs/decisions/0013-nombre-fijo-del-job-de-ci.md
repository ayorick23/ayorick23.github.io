# 0013. Nombre fijo del job de CI: "Check, audit & build"

**Estado:** Aceptada
**Fecha:** 2026-11-17 (registrada retroactivamente el 2026-11-20)

## Contexto

El job de `ci.yml` nació como "Check, audit & build" (fase 1). En la fase 2 pasó a correr
también Vitest y Playwright, así que el nombre quedó corto.

## Decisión

Conservar el nombre "Check, audit & build" aunque corra más cosas.

## Alternativas consideradas

- **Renombrarlo (p. ej. "Verify"):** la protección de `main` exige el check por su nombre. Un
  nombre nuevo deja la regla esperando un check que ya no existe y bloquea todos los merges
  hasta reconfigurarla en GitHub.

## Por qué

El nombre es un identificador para GitHub, no una descripción. Cambiarlo cuesta más de lo
que aporta.

## Consecuencias

- La protección de `main` se configura (o reconfigura) exigiendo "Check, audit & build".
- Si algún día se renombra, hay que actualizar la regla de protección en el mismo momento.
