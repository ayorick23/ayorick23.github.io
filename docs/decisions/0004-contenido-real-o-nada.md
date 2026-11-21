# 0004. Contenido real o nada

**Estado:** Aceptada
**Fecha:** 2026-08-10 (registrada retroactivamente el 2026-11-20)

## Contexto

El prototipo original tenía contenido de relleno. Un portafolio que se usa para buscar trabajo
no puede mostrar métricas, empresas o links que no existen: un reclutador que lo note descarta
todo lo demás.

## Decisión

No se inventa contenido: nombres de empresas, métricas, URLs de repos, capturas de pantalla,
descripciones. Si falta un dato real, el elemento no se renderiza (o queda un placeholder
visible) y se le avisa a Dereck qué falta y dónde va.

## Alternativas consideradas

- **Rellenar con datos de ejemplo hasta tener los reales:** se olvidan y llegan a producción.

## Por qué

La credibilidad del portafolio es su valor principal.

## Consecuencias

- Los componentes manejan la ausencia: sin `githubUrl` no hay botón de GitHub, sin CV en un
  idioma no hay botón de descarga, sin `coverImage` hay portada dibujada o placeholder.
- Los tests de contenido verifican que lo referenciado exista (archivos en `public/`,
  herramientas y proyectos de la esfera).
- Textos derivados (taglines de og:image) se recortan del texto real, nunca se reescriben.
