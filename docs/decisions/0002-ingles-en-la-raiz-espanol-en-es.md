# 0002. Inglés en la raíz, español bajo `/es/`

**Estado:** Aceptada
**Fecha:** 2026-08-10, reconfirmada el 2026-10-21 (registrada retroactivamente el 2026-11-20)

## Contexto

El sitio es bilingüe desde la reconstrucción. Al mudarlo a `dereckmendez.com`, Dereck preguntó
si convenía poner el español en la raíz y el inglés bajo `/en/`.

## Decisión

El inglés queda en la raíz (`/`, `/about`, …) y el español bajo `/es/…`
(`prefixDefaultLocale: false` en `astro.config.mjs`).

## Alternativas consideradas

- **Español en la raíz, inglés en `/en/`:** rompía todos los links ya compartidos y no
  mejoraba nada para los visitantes hispanohablantes, que ya llegan a `/es/` solos.

## Por qué

- El auto-redirect por idioma del navegador ya manda a los visitantes en español a `/es/`.
- Las etiquetas `hreflang` hacen que el SEO sea neutral entre ambas opciones.
- Cambiarlo rompía links existentes.

## Consecuencias

- Toda página existe en dos rutas; `getAlternatePath` calcula la equivalente.
- El selector de idioma guarda la preferencia antes de navegar para que el auto-redirect no
  rebote (regla `i18n-contenido`, cubierto por un e2e).
- No volver a proponer el cambio salvo que cambie el público objetivo.
