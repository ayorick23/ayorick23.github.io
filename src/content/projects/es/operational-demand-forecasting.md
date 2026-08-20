---
title: "Pronóstico de demanda operativa"
category: "Forecasting · Machine Learning"
shortDescription: "Sistema de pronóstico orientado a predecir demanda y métricas relacionadas con la atención y el servicio, combinando patrones históricos, efectos de calendario y Machine Learning para apoyar la planificación y asignación de recursos."
description: "Sistema de pronóstico orientado a predecir demanda y métricas relacionadas con la atención y el servicio, combinando patrones históricos, efectos de calendario y Machine Learning para apoyar la planificación y asignación de recursos."
technologies: ["Python", "Pandas", "XGBoost", "MLflow", "SQL"]
featured: true
status: "published"
date: 2026-01-01
order: 3
coverKind: "forecast"
metrics: []
sections:
  - heading: "Contexto"
    body: "Los equipos operativos necesitan anticipar la demanda para planificar capacidad y asignar recursos de manera eficiente. El reto consistió en construir pronósticos capaces de capturar patrones recurrentes y, al mismo tiempo, ser útiles para distintas unidades operativas y tipos de servicio."
  - heading: "Datos"
    body: "La tabla de modelado se construyó a partir de registros históricos operativos y se agregó alrededor de unidad, tipo de servicio, fecha e intervalo de tiempo. Se incorporó información de calendario y fechas críticas junto con patrones históricos de demanda."
  - heading: "Ingeniería de variables"
    body: "El conjunto de variables combina información de calendario, variables relacionadas con días festivos y lags históricos explícitos. En lugar de depender de desplazamientos posicionales, las observaciones históricas se alinean por fecha, intervalo y día de la semana para conservar la estructura temporal real del problema."
  - heading: "Modelado"
    body: "Primero se estableció un baseline histórico y posteriormente se comparó con un modelo basado en XGBoost. La evaluación utiliza una división temporal, reservando el período más reciente para validación con el objetivo de representar mejor el comportamiento sobre observaciones futuras."
  - heading: "Evaluación"
    body: "El objetivo no fue simplemente obtener un error menor, sino determinar si la complejidad adicional de Machine Learning proporcionaba una mejora significativa frente a un baseline histórico sólido."
  - heading: "Resultado"
    body: "El proyecto evolucionó desde un prototipo de forecasting hacia un flujo de ML más completo que incorpora ingeniería de variables, validación temporal, seguimiento de experimentos y evaluación de modelos. Los resultados también dejaron una lección importante: un modelo no debería llegar a producción únicamente porque sea más complejo que su baseline."
---
