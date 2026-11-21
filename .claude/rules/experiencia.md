---
paths:
  - "src/components/ExperienceGantt.astro"
  - "src/components/ExperienceBranches.astro"
  - "src/components/views/ExperienceView.astro"
  - "src/scripts/gantt.ts"
  - "src/scripts/experience-branches.ts"
  - "src/lib/experience.ts"
  - "src/lib/dates.ts"
---

# Trayectoria profesional

Landing y `/experience` muestran cosas distintas a propósito. Cada `TimelineEntry` (en
`experience.timeline` de los diccionarios) necesita `start`/`end` (`YYYY-MM`; sin `end` =
puesto actual), `period` (solo texto), `summary` (~3 líneas, para el tooltip) y `description`.
Dereck nunca tuvo dos trabajos a la vez: `tests/content/data-integrity.test.ts` exige timeline
sin solapes y más reciente primero.

## Landing: Gantt (`ExperienceGantt.astro` + `gantt.ts`)

Referencia: `desing_reference/elements/descarga (7).jpg`.

- Una barra por puesto (más antiguo arriba); carril de Formación con dos barras (Técnico e
  Ingeniería, desde ene 2025, de `studyPrograms` en `lib/experience.ts`; hecho sólido,
  planificado rayado, rayas desplazándose de izquierda a derecha); carril de Certificaciones
  con puntos agrupados por trimestre (un mes son ~8px). Cada carril lleva título con una línea
  horizontal completa debajo. Línea "Hoy" recalculada en el cliente.
- Cada puesto se dibuja hasta el inicio del siguiente (`drawTo`): sin huecos ni solapes.
- Nombre dentro de la barra si cabe; puestos de menos de 18 meses (`SHORT_ROLE_MONTHS`)
  siempre afuera (pedido de Dereck por "Vendedor de Pinturas").
- Tooltip estilo Power BI: con mouse sigue al cursor (se voltea cerca de los bordes); clic
  deja la barra seleccionada y las demás atenuadas hasta clic fuera u otra barra; con
  teclado/toque aparece anclada a la barra.
- En < 640px no hay scroll horizontal: barras delgadas con el nombre encima, posicionado por JS.

## `/experience`: ramas + contenedores (`ExperienceBranches.astro` + `experience-branches.ts`)

**La referencia que manda es el borrador de Dereck:
`desing_reference/elements/Captura de pantalla 2026-11-14 175625.png`. No reinterpretarlo**:
ya hubo rondas rechazadas (ramas en cascada y en escuadra/escalera).

- La línea principal azul pasa _por dentro_ de los paneles de trabajo (`--main` desde su borde
  izquierdo), con el nodo a la izquierda del título.
- Encima de cada puesto: Certificaciones arriba (`--indent-certs`) y Educación justo encima
  (`--indent-study`). Todos los contenedores con el nodo a `--dot` del borde y el texto a
  `--text`. Educación empieza a la derecha de la línea principal (`--indent-study > --dot`) y
  los títulos de trabajo después del carril más externo (`--text-work > --indent-certs + --dot`):
  ninguna línea toca texto. Valores más chicos en móvil.
- Sin títulos tipo "CERTIFICACIONES"/"EDUCACIÓN" en los contenedores (lo dice la leyenda).
- Cada nodo se centra en título + subtítulo medido con `offsetTop`, **no**
  `getBoundingClientRect` (incluía el `translateY` de la animación y bajaba los puntos ~10px).
- Ramas: la curva de la primera versión reflejada a la derecha; salen del nodo del puesto con
  una curva suave (`BRANCH_RISE`) y suben rectas hasta el contenedor, atravesando lo que haya.
  Sin escuadras.
- Estilos: Educación = línea sólida clara + nodo relleno + borde sólido; Certificaciones =
  línea a trazos + nodo hueco + borde a trazos; paneles de trabajo con borde neutro.
- Fechas a la izquierda solo en puestos ("HOY"/"INICIO" en los extremos). Certificaciones
  muestra máximo 5 + "Ver los N restantes en Sobre mí". Descripción a la izquierda;
  Periodo/Empresa/Duración en columna angosta a la derecha. Etiquetas = rango de años
  ("2026 – Actualidad").
- Animación de una sola vez (~1,5 s, `RISE_DURATION`): la línea sube de "Inicio" a "Hoy",
  rellena cada nodo y revela su panel; las ramas crecen vía `<mask>` (para que la de trazos
  también anime) cuando su nodo de origen se rellena.
