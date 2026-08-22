---
title: "Data & AI Compensation Benchmark"
category: "Data Analytics · Estadística aplicada"
shortDescription: "Benchmark end-to-end de compensación para profesionales de datos e IA a nivel global: ETL con contrato de datos, rigor estadístico (pruebas de hipótesis, intervalos de confianza por bootstrap), ajuste por poder adquisitivo, consultas SQL de negocio y dashboard interactivo en Power BI."
description: "Benchmark de compensación para profesionales de datos e IA construido sobre 85,088 registros reales (2020–2025), con un enfoque de negocio dual: un equipo de RR. HH. evaluando competitividad salarial, y un profesional de datos/IA decidiendo en qué especializarse. No es un EDA descriptivo: cada afirmación de negocio está atada a una prueba de que no es ruido de muestra — pruebas de hipótesis no paramétricas, intervalos de confianza por bootstrap, y un piso de tamaño de muestra explícito antes de comparar países. Pipeline ETL con contrato de datos declarativo (Pandera), ajuste por poder adquisitivo con datos del Banco Mundial, consultas SQL de negocio sobre SQLite, y un dashboard interactivo en Power BI — reproducible con un solo comando (`uv sync`), sin servidores de base de datos externos, con lint/type-checking (Ruff, MyPy), tests automatizados y CI en GitHub Actions."
technologies:
  [
    "Python",
    "Pandas",
    "NumPy",
    "SciPy",
    "Pandera",
    "SQL",
    "SQLite",
    "Power BI",
    "Jupyter",
    "uv",
    "Ruff",
    "MyPy",
    "Pytest",
    "GitHub Actions",
  ]
githubUrl: "https://github.com/ayorick23/data-ai-compensation-benchmark"
featured: true
status: "published"
date: 2026-08-19
order: 1
coverKind: "benchmark"
metrics:
  - label: "Filas analizadas"
    value: "85,088"
  - label: "Familias de rol"
    value: "9"
  - label: "Países con datos"
    value: "90"
  - label: "Brecha Junior → Senior"
    value: "+84%"
  - label: "Tests automatizados"
    value: "31"
sections:
  - heading: "Contexto y problema de negocio"
    body: "Comparar salarios entre roles, experiencia y países es fácil de hacer mal: promedios sobre muestras chicas, comparaciones en USD nominal que ignoran el costo de vida, y conclusiones que confunden una diferencia visual con una diferencia real. El proyecto parte de una encuesta agregada de compensación en datos/IA (85,088 filas, 2020–2025, sin ID de respondiente) con un objetivo doble:\n\n1. Identificar qué factores — rol, experiencia, país, modalidad remota, tamaño de empresa — explican la compensación, cuantificando qué tan defendibles son esas diferencias dado el tamaño real de cada muestra.\n2. Servir a dos audiencias distintas con el mismo dataset: un equipo de RR. HH. evaluando competitividad salarial, y un profesional de datos/IA decidiendo en qué especializarse.\n\nEl proyecto nació en abril de 2026 como un análisis descriptivo de **607 filas** (2020–2022); el refresco de datos y el reencuadre a un benchmark de negocio con rigor estadístico es lo que lo convierte en el proyecto actual."
  - heading: "Enfoque de la solución"
    body: "El pipeline está organizado en capas con dependencia en una sola dirección (Extracción → Transformación → Enriquecimiento PPP → Validación → Carga → SQL/Notebook/Dashboard), cada una desacoplada de la siguiente — el dashboard de Power BI no depende de que el notebook se haya ejecutado, y ambos leen del mismo SQLite generado por el ETL. Cada módulo tiene una responsabilidad única:\n\n- `etl.py` — el pipeline principal.\n- `reference_data.py` — datos de referencia.\n- `schema.py` — el contrato de datos.\n\nCada decisión de tooling o arquitectura no obvia quedó documentada como ADR — **11 decisiones** registradas a la fecha, desde la gestión de dependencias hasta el renombrado del proyecto."
  - heading: "Datos: exploración y calidad"
    body: "El dataset original tiene **151,445 filas** de empleos de tecnología en general; el filtro a roles de datos/IA/ML/BI por palabras clave del título deja **85,088** — casi un **44%** del dataset no correspondía al dominio del proyecto y se excluyó explícitamente en vez de analizarse mezclado. Antes de cargar los datos, cada corrida pasa por un contrato de schema declarativo con Pandera (tipos, rangos, valores categóricos válidos): si una fila no cumple el contrato, el ETL falla con un error explícito en vez de cargar datos sospechosos.\n\n*Una decisión de calidad de datos no trivial*: no se aplica `drop_duplicates()`, porque es una encuesta agregada sin ID de respondiente — filas idénticas representan personas distintas que reportaron el mismo rol/salario/país, no errores de captura."
    images:
      - src: "/projects/data-ai-compensation-benchmark/salary-distribution.png"
        alt: "Histograma de la distribución de salarios anuales en USD, con línea de mediana en $140,000 y de media en $149,403, mostrando un sesgo pronunciado hacia la derecha"
        caption: "Distribución de salarios (85,088 filas): sesgo a la derecha (skew ≈ 1.47), mediana $140,000 vs. media $149,403."
  - heading: "Ingeniería de variables"
    body: "De las columnas crudas se derivan cuatro variables:\n\n- `salary_category` — heurística por rango.\n- `job_category` — 9 familias de rol, por palabras clave del título.\n- `continent` — mapeo de 90 códigos de país.\n- `salary_usd_ppp` — ajuste por poder adquisitivo.\n\nEl ETL registra explícitamente lo que descarta o deja incompleto — por ejemplo, qué códigos de país no tienen índice de precios disponible — en vez de fallar en silencio o forzar un valor por defecto."
  - heading: "Rigor estadístico: ¿señal real o ruido de muestra?"
    body: "La distribución del salario está sesgada a la derecha (skew ≈ 1.47), lo que descarta ANOVA o t-test como prueba válida: se usan sus equivalentes no paramétricos, **Kruskal-Wallis** para comparar los 4 niveles de experiencia a la vez (p ≈ 0) y **Mann-Whitney U** para el contraste puntual Junior vs. Senior (mediana $85,000 → $156,400, p ≈ 0) — la diferencia visible en un boxplot *no es ruido de muestra*.\n\nComparar países es donde el rigor importa más: incluso con un piso de tamaño de muestra (`HAVING COUNT(*) >= 5` en SQL), un bootstrap de 1,000 remuestreos por país muestra que Israel (n=12) o Ucrania (n=13) tienen intervalos de confianza de más de **$60,000** de ancho, mientras que Estados Unidos (n=75,409) tiene uno de menos de **$2,000** — un ranking que solo mira el promedio trataría a ambos como igual de confiables."
    images:
      - src: "/projects/data-ai-compensation-benchmark/salary-by-experience.png"
        alt: "Boxplot del salario anual en USD por nivel de experiencia (Junior, Mid, Senior, Executive) con la mediana de cada grupo"
        caption: "Salario por nivel de experiencia: la mediana pasa de $85,000 (Junior, n=9,103) a $156,400 (Senior, n=49,532)."
      - src: "/projects/data-ai-compensation-benchmark/salary-by-role.png"
        alt: "Gráfico de barras horizontales del salario mediano en USD por familia de rol, de Data Governance/Specialist a ML/AI Engineer"
        caption: "Salario mediano por familia de rol: ML/AI Engineer lidera con $183,450, por delante de Research Scientist y Data Architect."
      - src: "/projects/data-ai-compensation-benchmark/country-confidence-intervals.png"
        alt: "Gráfico de puntos con intervalos de confianza por bootstrap del salario promedio en USD para los países con mayor salario, coloreados según el tamaño de su muestra"
        caption: "Intervalos de confianza por bootstrap (1,000 remuestreos): países con n<30 tienen intervalos de hasta $170,000 de ancho, frente a menos de $2,000 en Estados Unidos (n=75,409)."
  - heading: "Ajuste por poder adquisitivo (PPP)"
    body: "Comparar salarios solo en USD nominal ignora que el costo de vida varía enormemente entre países. Enriquecer el dataset con `salary_usd_ppp` (índice de nivel de precios del PIB del Banco Mundial) cambia el ranking: un salario nominal de $48,553 en India equivale, en poder adquisitivo real, a **$211,065** — por encima del ajustado de Suiza ($112,950 desde $126,453 nominal). Es la razón por la que las conclusiones de negocio del proyecto usan `salary_usd_ppp`, *no el salario nominal*, para comparar países."
    images:
      - src: "/projects/data-ai-compensation-benchmark/ppp-adjustment-comparison.png"
        alt: "Gráfico de barras comparando el salario promedio nominal en USD contra el salario ajustado por poder adquisitivo (PPP) para seis países"
        caption: "Nominal vs. ajustado por PPP: India pasa de $49k nominal a $211k ajustado, superando a Suiza ($126k → $113k)."
  - heading: "SQL y análisis de negocio"
    body: "`sql/queries.sql` traduce los mismos hallazgos a consultas de negocio sobre SQLite, con el mismo piso de tamaño de muestra que el notebook:\n\n- Salario promedio por tamaño de empresa — empresas grandes/medianas pagan $149,000–$157,000, pequeñas $86,000.\n- Salario promedio por modalidad remota — el 100% remoto no paga menos que el presencial: $145,250 vs. $151,010.\n- Ranking de países ajustado por PPP.\n\nLas pruebas de hipótesis y el bootstrap se dejaron deliberadamente fuera de SQL: no tienen una expresión natural ahí, y forzarlas hubiera sido complejidad sin propósito — esas viven en el notebook."
  - heading: "Dashboard (Power BI)"
    body: "El dashboard expone salario promedio global, comparación por rol y experiencia, análisis por país, distribución salarial e impacto del tipo de empleo, con filtros dinámicos, consumiendo directamente el SQLite generado por el ETL. Está pendiente de actualización para reflejar el refresco de datos de agosto de 2026 (85,088 filas 2020–2025, no las 607 filas 2020–2022 originales) — un checklist explícito documenta el trabajo pendiente en vez de dejarlo implícito:\n\n- Filtro de tamaño mínimo de muestra por país.\n- Footnote de outliers.\n- Gráfico de categorías en barras."
  - heading: "Calidad de código, testing y CI/CD"
    body: "**31 tests automatizados** cubren la lógica de negocio hecha a mano, deliberadamente *sin mocks de infraestructura ni metas de cobertura*:\n\n- Categorización de salario.\n- Filtro de roles de datos/IA.\n- Clasificación de rol.\n- Ajuste PPP.\n- Que el contrato de datos de Pandera rechace filas inválidas.\n\nRuff (lint + format), MyPy (type checking estricto sobre `src/`) y pre-commit corren antes de cada commit; un workflow de GitHub Actions repite lint, format check, mypy, pytest y el ETL completo (con su validación Pandera) en cada push/PR a `main`. La gestión de dependencias usa `uv` con lockfile determinista — sin servidores de base de datos externos: SQLite reemplazó a un SQL Server local para que el ETL corriera de punta a punta en CI."
    images:
      - src: "/projects/data-ai-compensation-benchmark/screenshot-github-actions.png"
        alt: "Captura de pantalla de un workflow de GitHub Actions, mostrando cada paso del pipeline (lint, format check, type check, tests, ETL con validación Pandera) en verde"
        caption: "Workflow de CI en GitHub Actions: lint, format check, mypy, pytest y el ETL completo (con validación Pandera) en cada push/PR."
  - heading: "Retos técnicos y cómo se resolvieron"
    body: "El proyecto documentó tres decisiones técnicas no triviales, no solo el resultado final:\n\n1. Un `requirements.txt` corrupto sin lockfile (versión original de abril de 2026) se reemplazó por completo con `uv` + `pyproject.toml`, en vez de intentar reparar el archivo.\n2. La tentación de aplicar `drop_duplicates()` a ciegas — el paso casi automático en cualquier limpieza de datos — se evaluó y se descartó explícitamente, porque hubiera reducido artificialmente el tamaño de muestra que después sostiene las pruebas de hipótesis.\n3. Al renombrar el repositorio y la carpeta del proyecto, `uv` dejó rutas absolutas obsoletas grabadas en el entorno virtual y el lockfile — resuelto recreando el entorno con `uv sync` en vez de editar esos artefactos derivados a mano."
  - heading: "Resultados y aprendizajes"
    body: "El resultado no es solo un ranking de salarios por país o rol — es un análisis donde cada afirmación de negocio está atada a una prueba de que no es ruido de muestra:\n\n- El **nivel de experiencia** es el factor más determinante y estadísticamente significativo.\n- **ML/AI Engineer** es la especialización mejor pagada.\n- La ruta de liderazgo paga *menos* que quedarse como especialista senior.\n- Un salario nominal menor en un país más barato puede superar, ajustado por poder adquisitivo, a uno nominal mayor en un país caro.\n\nEl proyecto demuestra que la parte más difícil de un benchmark de datos no es calcular un promedio — es decidir cuándo ese promedio es confiable, dejarlo documentado, y construir el pipeline para que esas decisiones sigan siendo válidas cuando el dataset se vuelva a refrescar."
---
