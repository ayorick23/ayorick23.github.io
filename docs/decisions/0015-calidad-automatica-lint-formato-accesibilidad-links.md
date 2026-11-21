# 0015. Calidad automática: formato, lint, accesibilidad, Lighthouse y links

**Estado:** Aceptada
**Fecha:** 2026-11-20

## Contexto

Fase 3 del plan de profesionalización. El sitio ya tenía tests, pero nada revisaba el estilo del
código, la accesibilidad, el rendimiento ni los links.

## Decisión

- **Prettier** (con los plugins de Astro y de Tailwind, que ordena las clases) a 120 caracteres,
  el ancho con el que ya estaba escrita la mayor parte del código (el que menos cambios
  generaba). `endOfLine: auto` porque Git convierte los finales de línea en Windows.
- **ESLint** con las reglas recomendadas de JavaScript, TypeScript y Astro, más
  `eslint-config-prettier` para que no choque con Prettier.
- **axe** (`tests/e2e/a11y.spec.ts`): cada página, en ambos idiomas, ambos temas, escritorio y
  móvil, contra WCAG 2.1 AA. Bloquea el CI.
- **Lighthouse CI** (`lighthouserc.json`, 6 páginas, mediana de 3 corridas): accesibilidad,
  buenas prácticas y SEO bloquean bajo 0,9; rendimiento solo avisa.
- **Links internos** (`scripts/check-links.mjs`): páginas, archivos y anclas `#` del sitio
  generado. Bloquea el CI. **Links externos** (`links-external.yml`, lychee): semanal, no bloquea.
- Contraste: `--ink-3` pasa de `#5c6575` a `#7e8592` (oscuro) y de `#8d94a1` a `#686e77` (claro)
  para cumplir 4,5:1. Decidido con Dereck.

## Alternativas consideradas

- **`eslint-plugin-jsx-a11y`:** todavía no es compatible con ESLint 10, y axe revisa la
  accesibilidad sobre el HTML final, que es más completo que revisar el código fuente.
- **Rendimiento de Lighthouse como bloqueante:** las máquinas compartidas del CI dan puntajes
  que varían de una corrida a otra; un umbral duro fallaría sin que el código cambie.
- **Links externos en cada PR:** LinkedIn y otros sitios bloquean robots o fallan por su cuenta,
  y frenarían PRs que no tocan nada.
- **Dejar el gris como estaba:** se descartó; el cambio es sutil y mejora la lectura de todas las
  etiquetas pequeñas.

## Por qué

Cada herramienta atrapa una clase de error distinta antes de que llegue a producción, y solo
bloquea lo que es determinista; lo ruidoso (rendimiento en CI, sitios externos) avisa.

## Consecuencias

- `npm run verify` suma lint, formato y links; el CI tarda un poco más (Lighthouse).
- Excepciones aceptadas, cada una con su motivo en el código: la píldora "Hoy" del Gantt (blanco
  sobre carmesí, 3,6:1) en `a11y.spec.ts`, y el link de idioma de la 404 en `check-links.mjs`.
- La home da ~67–79 de rendimiento en celular simulado (bloqueo del procesador ~1 s por los
  scripts de la esfera, portadas y nebulosa). Queda en el roadmap.
