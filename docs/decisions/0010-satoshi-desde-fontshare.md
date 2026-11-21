# 0010. Etiquetas en Satoshi, cargada desde Fontshare

**Estado:** Aceptada
**Fecha:** 2026-11-14 (registrada retroactivamente el 2026-11-20)

## Contexto

Las etiquetas, fechas y números usaban JetBrains Mono. Dereck la sentía "de plantilla IA". En
la revisión de estilo se compararon Satoshi, solo Manrope y la actual.

## Decisión

Etiquetas, fechas, años y números en **Satoshi**, peso regular, a través de la clase existente
`font-mono` (se conservó el nombre para no tocar ~80 usos). Se carga desde la API de Fontshare
en `BaseLayout.astro`, no desde archivos en el repo. Títulos y cuerpo siguen en Manrope.

## Alternativas consideradas

- **Commitear los archivos de Satoshi:** su licencia no permite redistribuirlos en un repo
  público.
- **Solo Manrope:** se pierde el contraste entre etiquetas y texto.

## Por qué

Satoshi da el contraste de una fuente de etiquetas sin la estética de terminal, y Fontshare es
la forma permitida de usarla (igual que en OdontoTrack).

## Consecuencias

- Depende de un servicio externo: si Fontshare falla, las etiquetas caen a la fuente de respaldo.
- `font-mono` ya no es monoespaciada; el nombre engaña, pero está documentado.
- `@fontsource/jetbrains-mono` sigue instalado solo para el generador de og:image.
