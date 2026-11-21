# 0011. Sin scroll suave global ni transición animada en `<main>`

**Estado:** Aceptada
**Fecha:** 2026-11-15 (registrada retroactivamente el 2026-11-20)

## Contexto

Dereck reportó que al cambiar de página algunas se "barrían" de abajo hacia arriba a toda
velocidad, que volver a la home se trababa y que los links del menú dejaban secciones mal
encuadradas.

## Decisión

- No usar `scroll-behavior: smooth` global en `html`. El scroll suave de los links de ancla
  vive en `src/scripts/anchor-scroll.ts`.
- No poner `transition:animate` en `<main>`: alcanza con el fundido por defecto de la raíz.
- La nebulosa de contacto arranca en `requestIdleCallback` con compilación de shader en paralelo.

## Alternativas consideradas

- **Mantener el CSS y compensar en JS:** Astro restaura el scroll con `scrollTo()` al navegar,
  y el CSS lo convertía en un barrido visible de toda la página. No hay forma limpia de
  distinguir ambos casos solo con CSS.

## Por qué

Medido en el navegador: la View Transition fotografiaba el `<main>` completo (~5.400 px en la
home) y congelaba ~650 ms; crear el contexto WebGL durante la transición congelaba ~1 s. El
peor cuadro de `/experience` → home pasó de 1.777 ms a ~85 ms.

## Consecuencias

- Los links de ancla centran el contenido de la sección bajo el nav (o pegan su inicio si no
  cabe), escuchando en fase de captura para adelantarse al router.
- No reintroducir ninguna de las dos cosas (regla `estilos-y-transiciones`).
