---
title: "Telco Churn MLOps"
category: "MLOps · Clasificación"
shortDescription: "Plataforma end-to-end de Machine Learning para identificar clientes con riesgo de abandono y convertir predicciones en información accionable para estrategias de retención."
description: "Proyecto end-to-end de Machine Learning enfocado en predecir el abandono de clientes de telecomunicaciones, combinando análisis de datos, ingeniería de variables, validación de calidad, experimentación reproducible y prácticas de MLOps orientadas a producción."
technologies:
  ["Python", "Pandas", "Scikit-learn", "MLflow", "DVC", "Pandera", "Pytest", "Docker", "GitHub Actions"]
githubUrl: "https://github.com/ayorick23/telco-churn-mlops"
featured: true
status: "draft"
date: 2026-08-12
order: 1
coverKind: "churn"
metrics:
  - label: "ROC-AUC"
    value: "0.XX"
  - label: "F1-Score"
    value: "0.XX"
  - label: "Churn Recall"
    value: "XX%"
  - label: "Clientes"
    value: "7,043"
sections:
  - heading: "Contexto"
    body: "El abandono de clientes representa un problema de negocio que va más allá de predecir una variable binaria. Identificar qué clientes presentan mayor riesgo permite priorizar esfuerzos de retención y comprender qué factores están asociados con la pérdida de clientes. Este proyecto utiliza un dataset de telecomunicaciones basado en el conjunto ficticio de IBM, con información demográfica, contractual, de servicios, facturación y comportamiento de aproximadamente 7,043 clientes."
  - heading: "Problema de negocio"
    body: "El objetivo es desarrollar un sistema capaz de estimar la probabilidad de churn de cada cliente y generar una base objetiva para priorizar acciones de retención. La evaluación no se centra únicamente en accuracy: se consideran métricas como ROC-AUC, precision, recall y F1-score para entender el comportamiento del modelo frente a la clase minoritaria y el costo de no identificar correctamente a un cliente en riesgo."
  - heading: "Exploracion y entendimiento de los datos"
    body: "El análisis comienza con una exploración estructurada del dataset para comprender su estructura, calidad, distribución de variables, comportamiento del target, cardinalidad, valores faltantes, outliers y posibles relaciones entre las características y el churn. El EDA se utiliza como una etapa de toma de decisiones para identificar hipótesis de negocio y determinar qué variables pueden aportar valor al proceso de modelado."
  - heading: "Calidad y validación de datos"
    body: "Antes de llegar al modelo, los datos pasan por controles de calidad definidos mediante contratos y pruebas automatizadas. Pandera se utiliza para validar el esquema y las reglas esperadas del dataset, mientras que Pytest verifica escenarios como filas válidas y valores categóricos fuera de contrato. Este enfoque busca detectar problemas de calidad lo más temprano posible y evitar que datos inconsistentes lleguen silenciosamente al pipeline de Machine Learning."
  - heading: "Preprocesamiento e ingeniería de variables"
    body: "El pipeline de preprocesamiento transforma las variables de acuerdo con su naturaleza, separando características numéricas y categóricas y aplicando las transformaciones correspondientes dentro de un flujo reproducible. La ingeniería de variables se guía por los hallazgos del EDA y por el significado de cada atributo dentro del negocio, evitando transformaciones arbitrarias y reduciendo el riesgo de data leakage."
  - heading: "Modelado y experimentación"
    body: "El proceso de modelado parte de un baseline para establecer una referencia objetiva antes de introducir modelos más complejos. A partir de esta línea base se comparan diferentes alternativas de clasificación y se realizan experimentos controlados para identificar configuraciones con mejor desempeño. Cada experimento busca responder una pregunta concreta y se evalúa utilizando métricas alineadas con el problema de churn."
  - heading: "Experiment Tracking"
    body: "MLflow se utiliza para registrar experimentos, parámetros, métricas y artefactos, permitiendo comparar diferentes ejecuciones y mantener trazabilidad sobre cómo se obtuvo cada resultado. Esto transforma la experimentación de un proceso manual y difícil de reproducir en un flujo estructurado donde las decisiones del modelo pueden ser auditadas y comparadas."
  - heading: "Reproducibilidad y versionado"
    body: "El proyecto utiliza Git para versionar el código y DVC para gestionar el versionado de los datos y artefactos asociados al pipeline. La combinación permite mantener una relación trazable entre código, datos, experimentos y modelos, facilitando la reproducción de resultados y reduciendo la dependencia de configuraciones locales."
  - heading: "Testing y calidad del código"
    body: "Las pruebas automatizadas forman parte del flujo de desarrollo para validar componentes críticos del proyecto y detectar regresiones antes de integrar nuevos cambios. Pytest se utiliza junto con controles de calidad y validación de datos para acercar el proyecto a prácticas de ingeniería de software aplicadas al desarrollo de Machine Learning."
  - heading: "MLOps y automatización"
    body: "El proyecto integra prácticas de MLOps para tratar el modelo como parte de un sistema y no como un artefacto aislado. El flujo contempla validación de datos, procesamiento reproducible, entrenamiento, evaluación, tracking de experimentos y versionado, con GitHub Actions y Docker como componentes de automatización y ejecución consistente."
  - heading: "Resultado"
    body: "El resultado es una solución de Machine Learning reproducible y estructurada alrededor del ciclo de vida completo del modelo. Más allá del desempeño de un clasificador, el proyecto demuestra cómo transformar un problema de negocio en un flujo de datos y ML mantenible, con controles de calidad, trazabilidad, experimentación reproducible y fundamentos para evolucionar hacia un sistema de predicción orientado a producción."
---
