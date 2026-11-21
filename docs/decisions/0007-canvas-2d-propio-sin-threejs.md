# 0007. Gráficos 3D en canvas 2D con proyección propia, sin Three.js

**Estado:** Aceptada
**Fecha:** 2026-10-13 (registrada retroactivamente el 2026-11-20)

## Contexto

La esfera de constelación del hero necesita 3D (rotación, profundidad, arrastre con inercia)
con ~350 estrellas y 6 nodos interactivos.

## Decisión

Dibujarla en canvas 2D con una proyección 3D escrita a mano (`src/scripts/constellation.ts`).
Los nodos son botones DOM posicionados encima en cada cuadro.

## Alternativas consideradas

- **Three.js / WebGL:** cientos de KB de librería para una escena de puntos y líneas.

## Por qué

Peso: la escena es simple y la proyección son unas pocas líneas de matemática. Además, los
nodos como botones reales son accesibles con teclado, cosa que dentro de un canvas WebGL
habría que reconstruir.

## Consecuencias

- Cualquier efecto 3D nuevo (como el cubo Rubik en evaluación para el hero) sigue este mismo
  enfoque, salvo que una ADR nueva lo cambie.
- La matemática de proyección y el orden de dibujo se mantienen a mano.
