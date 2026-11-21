# 0006. Portadas de proyecto dibujadas por código, también para redes sociales

**Estado:** Aceptada
**Fecha:** 2026-08-13; og:image desde 2026-09-16 (registrada retroactivamente el 2026-11-20)

## Contexto

Los proyectos no tienen capturas reales que sirvan de portada, y una captura inventada
rompería la [ADR 0004](0004-contenido-real-o-nada.md). Al compartir un link en LinkedIn también
hace falta una imagen (og:image).

## Decisión

- Cada proyecto tiene un `coverKind`: una función `draw()` en `src/lib/project-cover-kinds.ts`
  que dibuja en canvas una escena abstracta de su dominio, animada en la web.
- `scripts/generate-og-images.mjs` (manual, `npm run generate:og`) reutiliza esa misma función
  congelada en un cuadro para la portada social, junto al título, la tagline real y las
  métricas reales. Los PNG se commitean en `public/og/`.

## Alternativas consideradas

- **Capturas de pantalla:** no existen para todos los proyectos y envejecen con cada cambio.
- **og:image dibujada aparte:** duplicaría la lógica y la portada social se desfasaría de la web.

## Por qué

Una sola fuente de verdad para el dibujo, coherente con la marca, sin depender de material que
no existe.

## Consecuencias

- `project-cover-kinds.ts` no puede tener imports externos ni sintaxis TS no borrable: Node lo
  importa directo.
- Hay que acordarse de regenerar las og:image cuando cambia el texto o las métricas.
- Cuando haya capturas reales, `coverImage` las mostrará en la tarjeta sin tocar esto.
