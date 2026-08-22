---
title: "Telco Churn MLOps"
category: "MLOps · Clasificación"
shortDescription: "Sistema end-to-end de predicción de churn que va del EDA a producción: selección de modelo, tracking de experimentos, monitoreo de drift, reentrenamiento con promoción champion/challenger, serving con explicabilidad, y un cálculo de valor de negocio para priorizar retención."
description: "Plataforma MLOps completa para predecir el abandono de clientes de telecomunicaciones (7,043 clientes, dataset Telco Customer Churn). No es un notebook de clasificación: es el ciclo de vida completo de un modelo en producción — comparación de 4 familias de modelos, tuning bayesiano con Optuna, tracking en MLflow, versionado de datos con DVC, detección de drift con Evidently AI, promoción champion/challenger con criterio de negocio explícito, serving vía FastAPI con explicabilidad SHAP, dashboard interactivo en Streamlit, y una capa de valor de negocio que traduce cada predicción en un número accionable: cuánto se pierde si ese cliente se va, y si conviene una campaña de retención."
technologies:
  [
    "Python",
    "LightGBM",
    "Optuna",
    "MLflow",
    "DVC",
    "Evidently AI",
    "FastAPI",
    "Pydantic",
    "SHAP",
    "Streamlit",
    "Docker",
    "GitHub Actions",
    "Pytest",
    "Pandera",
  ]
githubUrl: "https://github.com/ayorick23/telco-churn-mlops"
featured: true
status: "published"
date: 2026-08-18
order: 2
coverKind: "churn"
metrics:
  - label: "ROC-AUC"
    value: "0.99"
  - label: "F1-Score"
    value: "0.93"
  - label: "Recall (churn)"
    value: "91%"
  - label: "Clientes analizados"
    value: "7,043"
  - label: "Tests automatizados"
    value: "149"
sections:
  - heading: "Contexto y problema de negocio"
    body: "Retener un cliente existente cuesta significativamente menos que adquirir uno nuevo, pero solo si la retención se dirige a los clientes correctos y con margen suficiente para justificar el costo de la campaña. El proyecto parte de un dataset real de telecomunicaciones (Telco Customer Churn, 7,043 clientes, 50 columnas: datos demográficos, contractuales, de servicios contratados y facturación) con un objetivo doble:\n\n1. Estimar la probabilidad de churn de cada cliente con suficiente confianza para priorizar intervención.\n2. Sostener esa confianza en el tiempo, detectando cuándo el modelo se degrada frente a datos nuevos y decidiendo de forma objetiva cuándo reemplazarlo — *no un modelo que se entrena una vez y se abandona*."
  - heading: "Enfoque de la solución"
    body: "El sistema se diseñó como capas con dependencia en una sola dirección (Datos → Features → Training → Registry/Serving → Monitoreo → Presentación), cada una desacoplada de la siguiente para que, por ejemplo, servir predicciones nunca dependa de que el monitoreo esté arriba. Cada decisión de arquitectura o tooling no obvia quedó documentada como ADR antes de implementarse (**14 ADRs** a lo largo de 8 fases) — el objetivo explícito del proyecto es demostrar el ciclo de vida completo de MLOps con las mismas prácticas de un equipo real, *no solo entregar un clasificador con buena métrica*."
    images:
      - src: "/projects/telco-churn-mlops/architecture.png"
        alt: "Diagrama de arquitectura del sistema por capas: Datos, Features, Training, Registry/Serving, Monitoreo y Presentación"
        caption: "Cada capa solo conoce a la anterior — servir predicciones nunca depende de que el monitoreo esté arriba."
  - heading: "Datos: exploración y calidad"
    body: "El EDA identificó, entre otros hallazgos, cuatro columnas con **data leakage** y columnas de bajo valor de señal, documentadas y excluidas explícitamente en ADR 0006:\n\n- Leakage: `Churn Score`, `Customer Status`, `Churn Category`, `Churn Reason` — todas calculadas a partir del churn o solo disponibles después de que ya ocurrió.\n- Bajo valor de señal: `Latitude`, `Longitude`, `Zip Code`, `CLTV`.\n\nAntes de llegar al modelo, cada batch de datos pasa por un contrato de schema con Pandera (tipos, nulabilidad, valores categóricos válidos) verificado con tests automatizados — el objetivo es que un problema de calidad de datos falle *ruidoso* en el pipeline, no silenciosamente en una predicción de producción."
    images:
      - src: "/projects/telco-churn-mlops/churn-by-contract.png"
        alt: "Gráfico de barras horizontales del porcentaje de churn por tipo de compromiso contractual (Month-to-Month, One Year, Two Year)"
        caption: "A menor compromiso contractual, más churn: 45.8% en Month-to-Month frente a 2.5% en Two Year (18× más)."
  - heading: "Ingeniería de variables"
    body: "De las 50 columnas originales quedan **37 features** crudas después de excluir leakage, IDs y columnas de bajo valor, más 2 variables derivadas (`is_new_customer`, `num_extra_services`) diseñadas a partir de los hallazgos del EDA, no de forma arbitraria. El encoding y el escalado viven deliberadamente en la capa de entrenamiento, no en features — *features produce datos limpios y comprensibles para un humano*; el training decide cómo codificarlos según lo que cada familia de modelo necesita, una separación de responsabilidades documentada en ADR 0007."
  - heading: "Modelado y experimentación"
    body: "Se compararon 4 familias de modelos bajo el mismo protocolo de evaluación — Regresión Logística (baseline), XGBoost, LightGBM y CatBoost — con foco explícito en cómo cada una maneja las categóricas de alta cardinalidad del dataset (ADR 0009). **LightGBM** ganó con F1=0.929 en la comparación inicial; ese resultado se llevó a un pipeline definitivo con tuning bayesiano de hiperparámetros vía Optuna (50 trials, Stratified K-Fold para no sobreajustar la selección al split), que subió el F1 del champion final a **0.931** con ROC-AUC de **0.992**."
    images:
      - src: "/projects/telco-churn-mlops/model-comparison.png"
        alt: "Gráfico de barras del F1-Score en el set de prueba para las 4 familias de modelos comparadas: LightGBM, XGBoost, CatBoost y Regresión Logística"
        caption: "LightGBM gana la comparación inicial con F1=0.929, por delante de XGBoost (0.923), CatBoost (0.919) y Regresión Logística (0.906)."
  - heading: "MLOps: tracking, versionado y registry"
    body: "Cada experimento (parámetros, métricas, artefactos) queda registrado en MLflow, con el Model Registry gestionando qué versión sirve en producción vía aliases (`champion`), no el sistema de stages ya deprecado. El código se versiona con Git y los datos/modelos con DVC contra un remoto en DagsHub — la combinación permite reproducir *cualquier* resultado pasado sabiendo exactamente qué código, qué datos y qué configuración lo generaron, sin depender de que un notebook local siga intacto."
    images:
      - src: "/projects/telco-churn-mlops/screenshot-registry-mlflow.png"
        alt: "Captura de pantalla del listado de experimentos en la interfaz de MLflow, con las fases del proyecto (model-selection, training, monitoring, promotion) y su fecha de última modificación"
        caption: "Experimentos versionados en MLflow, uno por fase del proyecto (selección de modelo, training, monitoreo, promoción)."
      - src: "/projects/telco-churn-mlops/screenshot-registry-dagshub.png"
        alt: "Captura de pantalla de la tabla de experimentos en DagsHub, comparando accuracy, F1 y PR-AUC entre corridas de CatBoost, LightGBM, XGBoost y Regresión Logística"
        caption: "Mismos experimentos versionados en DagsHub junto con el código y los datos vía DVC, comparando métricas entre corridas."
  - heading: "Monitoreo, drift y reentrenamiento"
    body: "El sistema simula la llegada de datos nuevos con perturbaciones de intensidad creciente y los evalúa con Evidently AI para detectar drift de forma cuantitativa (`dataset_drift_share`). Un umbral de reentrenamiento (**10%**, calibrado contra los propios resultados del proyecto, no un número arbitrario) decide si amerita reentrenar; el challenger resultante se compara contra el champion actual con un criterio de negocio explícito — no solo F1 agregado. Para ser promovido, el challenger debe:\n\n- Ganar por un margen mínimo de 1 punto.\n- No retroceder más de una tolerancia definida en ningún segmento de negocio relevante: tipo de contrato, método de pago, tipo de internet.\n\nReentrenar y promover son pasos deliberadamente manuales, con un humano en el loop, *no un cron job automático*."
    images:
      - src: "/projects/telco-churn-mlops/screenshot-drift-monitoring.png"
        alt: "Captura de pantalla de un reporte de Evidently AI mostrando que no se detectó drift del dataset (12.8% de columnas con drift, por debajo del umbral)"
        caption: "Reporte de Evidently AI: drift detectado en 5 de 39 columnas (12.8%), por debajo del umbral de dataset drift de Evidently (50%)."
  - heading: "Serving, explicabilidad e impacto de negocio"
    body: "El modelo se sirve vía una API REST (FastAPI, validación de requests con Pydantic) con dos endpoints de negocio: predicción y explicación por SHAP (`TreeExplainer`, valores exactos para modelos de árboles, sin necesitar un dataset de background). Un dashboard interactivo en Streamlit consume esa API y agrega una capa de valor de negocio: para cada predicción, estima cuánto ingreso queda en riesgo si ese cliente específico hace churn (valor restante de su contrato actual) y compara ese número contra el costo de una campaña de retención para decidir, con un criterio explícito, si vale la pena intervenir — *la parte del proyecto que conecta la predicción técnica con la decisión de negocio real*."
  - heading: "Testing y CI/CD"
    body: "**149 tests automatizados** (unitarios, de validación de datos, y de integración) corren en cada push y pull request contra `main` vía GitHub Actions, junto con lint (Ruff), formato y type-checking (MyPy) como gate obligatorio antes de mergear. Los tests de integración van más allá de mockear dependencias externas: ejercitan el pipeline de producción real (*sin mocks*) y levantan el stack completo con Docker Compose para detectar en CI la clase de bug que un test unitario, por diseño, no puede ver — un contenedor que construye pero no arranca, o un artefacto que nunca llega a la imagen final."
  - heading: "Despliegue e infraestructura"
    body: "La API y el dashboard están empaquetados como imágenes Docker independientes (multi-stage builds, con `uv` para instalar dependencias exactas vía lockfile) y orquestables localmente con Docker Compose. El destino final de hosting quedó deliberadamente abierto durante el desarrollo: dos plataformas de free-tier (Render, luego Hugging Face Spaces) cambiaron de política de precios entre que se diseñó el despliegue y que se intentó ejecutar — *una decisión de infraestructura real y su trade-off, no una limitación técnica del proyecto*."
  - heading: "Retos técnicos y cómo se resolvieron"
    body: "El proyecto documentó y resolvió tres clases de problema real, no hipotético:\n\n1. Un bug del artifact storage de MLflow en DagsHub que bloqueaba descargar el pipeline desde el Registry — diagnosticado con evidencia (reproducido, aislado de causas como cuota o credenciales) y resuelto rediseñando para depender menos de esa descarga, versionando el champion con DVC en vez de MLflow.\n2. Una imagen Docker que construía sin error pero entraba en crash loop en producción por una librería del sistema operativo (`libgomp1`) perdida entre etapas de un multi-stage build.\n3. Dos plataformas de hosting gratuito que cambiaron su política de precios a mitad de la implementación.\n\nCada episodio quedó documentado con el diagnóstico completo, no solo el fix, como parte del criterio de ingeniería del proyecto."
  - heading: "Resultados y aprendizajes"
    body: "El resultado no es solo un clasificador con **ROC-AUC de 0.99** y **F1 de 0.93** sobre el champion en producción — es un sistema donde cada componente (qué datos entraron, qué modelo se entrenó con qué hiperparámetros, por qué se promovió o no una versión nueva, qué tan confiable sigue siendo frente a datos que cambian) es trazable y auditable. El proyecto demuestra que la parte más difícil de un sistema de ML en producción rara vez es el modelo: es todo lo que lo rodea — validación, reproducibilidad, gobierno de versiones, monitoreo continuo y la traducción final de una probabilidad a una decisión de negocio con un costo real."
---
