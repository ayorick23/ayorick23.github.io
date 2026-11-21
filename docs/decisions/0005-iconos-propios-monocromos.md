# 0005. Íconos propios monocromos que siguen el tema

**Estado:** Aceptada
**Fecha:** 2026-08-11 (registrada retroactivamente el 2026-11-20)

## Contexto

La primera versión de la sección de herramientas usaba logos a color de Iconify. Dereck los
rechazó ("los íconos en colores no me gustan, desentonan") y ya tenía su propio set de SVG
monocromos descargado.

## Decisión

Los íconos de tecnologías son los SVG de Dereck en `src/assets/icons/`, cargados como set local
de `astro-icon`, todos con `fill="currentColor"`. Los que solo existen como bitmap se pintan
con `mask-image` + `background-color: currentColor`.

## Alternativas consideradas

- **Logos de marca a color (`logos:*`):** desentonan con la paleta del sitio.

## Por qué

Un solo color que hereda el del texto hace que la sección se vea uniforme y cambie sola con el
tema claro/oscuro.

## Consecuencias

- Los íconos que vienen con degradados se aplanan y simulan profundidad con `fill-opacity`.
- `astro-icon` cachea los SVG al arrancar el dev server: hay que reiniciarlo al cambiarlos.
- Antes de buscar un ícono genérico, se le pide a Dereck el suyo.
