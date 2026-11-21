---
paths:
  - "src/components/Constellation.astro"
  - "src/scripts/constellation.ts"
  - "src/data/constellation.ts"
  - "src/components/SocialLinks.astro"
---

# Hero: esfera de constelación

Contexto: [ADR 0007](../../docs/decisions/0007-canvas-2d-propio-sin-threejs.md).

- Esfera 3D de ~350 estrellas conectadas (estilo del póster TEDx Tokyo en
  `desing_reference/isometrics/descarga (4).jpg`), dibujada en canvas 2D con proyección 3D
  propia. Sin Three.js, a propósito, por peso.
- Los 6 nodos son botones DOM reales posicionados encima en cada frame (accesibles con
  teclado). Datos por nodo (latitud/longitud, herramientas, proyectos) en
  `src/data/constellation.ts`; textos del panel en `hero.constellationPanel`. Los tests de
  contenido verifican que herramientas y proyectos de cada nodo existan.
- Gira sola (`AUTO_SPIN`), se arrastra con inercia (en touch solo horizontal porque el
  vertical hace scroll: `touch-pan-y`). Clic en un nodo: lo rota al frente, atenúa el resto y
  abre el panel. Ya no hay física de resorte por nodo. Sin giro automático con
  `prefers-reduced-motion`.
- Íconos de GitHub/LinkedIn del hero: brillo pulsante `dm-star-glow` en `global.css`.

**Rediseño pendiente** (ver `docs/roadmap.md`): Dereck eligió explorar un cubo Rubik
"del caos al orden". Antes de proponer un hero nuevo, lee esa sección del roadmap: ahí están
sus reglas de identidad visual y las rondas ya rechazadas.
