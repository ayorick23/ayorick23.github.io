# 0003. Todo el copy en diccionarios tipados y vistas compartidas entre idiomas

**Estado:** Aceptada
**Fecha:** 2026-08-10 (registrada retroactivamente el 2026-11-20)

## Contexto

Con dos idiomas, el riesgo es que una página se actualice en uno y no en el otro, o que el
markup se duplique y se desfase.

## Decisión

- Todo el texto de la interfaz vive en `src/content/i18n/{en,es}.ts`, con la forma definida en
  `types.ts`. Los componentes no tienen texto hardcodeado.
- El contenido de cada página vive en una View (`src/components/views/`); los archivos de
  `src/pages/` y `src/pages/es/` solo la envuelven en `BaseLayout`.

## Alternativas consideradas

- **Páginas duplicadas por idioma:** cada cambio de diseño se hace dos veces y tarde o
  temprano se desfasan.
- **Archivos JSON sin tipos:** un campo faltante solo se nota al ver la página rota.

## Por qué

TypeScript avisa en el build si falta un texto en un idioma, y una sola View garantiza que
ambos idiomas tengan el mismo diseño.

## Consecuencias

- Agregar un texto pide tocar tres archivos (`types.ts`, `en.ts`, `es.ts`).
- `tests/content/i18n-parity.test.ts` exige paridad de estructura y que ningún texto esté
  traducido en un solo idioma (vacío en ambos = oculto a propósito).
