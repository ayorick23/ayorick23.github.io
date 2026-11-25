# Roadmap

Pendientes del portafolio. Es la fuente de verdad del "qué falta" (`/retomar` la lee): al
terminar algo se marca `[x]` en el mismo PR, y lo que ya no aplica se borra. Las decisiones
tomadas van a `docs/decisions/`, no aquí.

## Profesionalización técnica

Plan de 5 fases acordado el 2026-11-17.

### Fase 1: base segura

- [x] Dependencias al día, CI en PRs, Dependabot, página 404 bilingüe (PR #7).

### Fase 2: tests

- [x] Vitest (unitarios + contenido), Playwright e2e, filtro de audit con excepciones (PR #13).
- [x] Protección de `main`: ruleset `main-secure` (exige "Check, audit & build", prohíbe
      push forzado y borrar la rama).
- [ ] Revisar la excepción de picomatch antes del **2027-01-17** (`audit-allowlist.json`).

### Fase 3: calidad automática

- [x] ESLint + Prettier, axe (WCAG 2.1 AA), Lighthouse CI y verificador de links internos +
      externos semanal ([ADR 0015](decisions/0015-calidad-automatica-lint-formato-accesibilidad-links.md)).
- [ ] Rendimiento de la home en celular: Lighthouse ~67–79 (bloqueo del procesador ~1 s al
      arrancar la esfera y las portadas; el resto de páginas da 91–96). Mirarlo junto
      con el rediseño del hero, que reemplaza la esfera.

### Fase 4: observabilidad

- [ ] Analítica de visitas. Opciones evaluadas: Cloudflare Web Analytics (gratis, sin cookies,
      sin eventos propios), Umami/GoatCounter (eventos de secciones y clics), GA4 (excesivo y
      pide banner de cookies). Recomendación previa: Cloudflare.
- [ ] Captura de errores del navegador (`window.onerror` / `unhandledrejection`).

### Fase 5: orden del repo y contexto de Claude

- [x] `CLAUDE.md` corto + `.claude/rules`, skills, hook `guardia-git`, ADRs, este roadmap
      ([ADR 0014](decisions/0014-contexto-de-claude-versionado-en-el-repo.md)).
- [ ] Plantilla de PR.
- [ ] Hooks de pre-commit (lint-staged) cuando exista la fase 3.

## Rediseño

### Hero

- [ ] Reemplazar la esfera de constelación. Estado: Dereck eligió explorar un **cubo Rubik
      "del caos al orden"** (concepto A) combinado con un grafo tipo Obsidian que se
      transforma en el cubo (concepto C). Hubo un prototipo local (canvas 2D, 27 piezas,
      arrastre, mezclar/resolver rebobinando movimientos) que no está en el repo: hay que
      rehacerlo. Frases candidatas: "Todo caos tiene un método." / "Datos desordenados,
      decisiones claras." / "Le encuentro el orden a los datos."
- Reglas de Dereck para el hero (2026-11-15):
  - Layout como `desing_reference/elements/X.jpg`: titular centrado (frase **nueva**;
    "Convierto datos en decisiones de negocio" le parece genérica), descripción, botones
    centrados debajo y el objeto interactivo centrado **arriba** del texto; un solo degradado
    de fondo (sin rayas verticales); nav extendido a todo el ancho.
  - Interactivo y distintivo, no un fondo que "solo se mueve". Cada elemento con intención,
    relacionado con su historia.
- Ya rechazados, no volver a proponer: hero tipo dashboard con KPIs, flujo pregunta →
  decisión, retrato + chips, grilla de 90 países, esfera con nodos de analista (ronda 1);
  "Horizonte de datos", reporte en vidrio, gráfico combinado, reporte sobre rayas (ronda 2).

### Sobre mí

- [ ] Rediseño: quitar el efecto de vinilos de los certificados (ya no le gusta) y sumar
      información más relevante.
- [ ] Usar ahí los elementos de identidad de Dereck que no van en el hero: nodos y conexiones
      (Obsidian), LEGO y rompecabezas, videojuegos de pelea retro en pixel art (idea: una
      pantalla de selección de personaje). Espacio/estrellas le gusta pero lo ve "quemado".
- [ ] Fotos (Dereck aún no las elige).
- [ ] Descripciones finales de "lo que aprendí" (las actuales son borrador basado en el título
      del curso, salvo Cisco, que sale del diploma).
- [ ] Nombre oficial del título técnico (provisional: "Técnico en Desarrollo de Software y
      Ciencia de Datos", en `about.education.milestones.technician`).

### Contacto

- [x] La nebulosa WebGL se reemplazó por un grafo de conexiones estilo Obsidian (opción A).

## Contenido

- [ ] **OdontoTrack:** capturas que quedaron fuera (originales en
      `desing_reference/odontotrack-capturas-originales/`): el directorio de pacientes muestra un DUI y
      un teléfono que no tienen formato de prueba (fila "Henry Méndez") y el registro de cuenta usa
      como ejemplo un correo con formato de carnet real. Usarlas solo si Dereck confirma que son
      ficticios o tras difuminar esos datos. Falta también confirmar si el sistema ya está en uso o en
      piloto (el caso de estudio dice "en desarrollo activo").

- [ ] **Medallion:** el README de ese repo dice que Gold (star schema en dbt, 97 tests) ya
      está construido y que falta Airflow; el caso de estudio todavía dice que Gold no se
      alcanzó y la tarjeta muestra "GOLD pronto". Confirmar con Dereck y actualizar.
- [ ] Portadas reales (`coverImage`) cuando haya capturas: hoy ningún proyecto tiene.
- [ ] "Explorando ahora" (`exploringTools`) queda oculto hasta que haya algo que poner.

## Mantenimiento

- [x] PRs de Dependabot de GitHub Actions (#8–#11, #15) fusionados; los deploys siguen en verde.
- [x] PR #12 (TypeScript 7) cerrado; Dependabot ignora los saltos mayores de TypeScript hasta
      que `@astrojs/check` los soporte.
