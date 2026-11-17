---
title: "E-Commerce Medallion Pipeline"
category: "Ingeniería de datos · Orquestación"
shortDescription: "Pipeline de datos con arquitectura Medallion (Bronze → Silver → Gold) para datos de e-commerce, construido con Polars y DuckDB y orquestado con Airflow. Proyecto en desarrollo, enfocado en demostrar ingeniería de datos end-to-end."
description: "Pipeline de ingeniería de datos para un dataset de e-commerce, organizado en capas Bronze, Silver y Gold. El objetivo del proyecto es demostrar habilidades de ingeniería de datos end-to-end: transformación con Polars, análisis con DuckDB y orquestación con Airflow. Actualmente en desarrollo — todavía no se ha llegado a la orquestación con Airflow ni a la capa Gold, así que por ahora esta página cubre solo el planteamiento general del proyecto."
technologies: ["Polars", "DuckDB", "Airflow"]
githubUrl: "https://github.com/ayorick23/ecommerce-medallion-pipeline"
disciplines: ["data-engineering"]
featured: true
status: "draft"
date: 2026-09-16
order: 3
coverKind: "medallion"
ogImage: "/og/ecommerce-medallion-pipeline-es.png"
metrics: []
sections:
  - heading: "Estado del proyecto"
    body: "Este caso de estudio está en construcción. La idea del proyecto es tomar datos de e-commerce y procesarlos en capas siguiendo la arquitectura Medallion: **Bronze** (datos crudos tal como llegan), **Silver** (datos limpios y validados) y **Gold** (datos curados y listos para análisis). La transformación se hace con **Polars**, el análisis con **DuckDB**, y la orquestación de todo el flujo con **Apache Airflow**.\n\nAl momento de escribir esto, el desarrollo todavía no llega a la orquestación con Airflow ni a la capa Gold — el contenido detallado (contexto de negocio, decisiones técnicas, resultados) se irá agregando a medida que el proyecto avance."
  - heading: "Desarrollo asistido con IA"
    body: "Desarrollo este proyecto con **Claude Code** como agente de desarrollo. Lo uso para avanzar más rápido en la implementación y también para aprender las herramientas del stack sobre la marcha. Ningún cambio entra sin que yo lo revise, y cuando no entiendo una decisión le pido que me la explique antes de aceptarla: esa revisión constante es la que me ha ido formando criterio técnico.\n\nAquí llevé el trabajo con el agente un paso más allá, con una carpeta `.claude` versionada en el repositorio:\n\n- Un `CLAUDE.md` con las reglas generales del proyecto.\n- **Reglas por carpeta**, que el agente solo carga cuando trabaja en esa parte del código.\n- **Skills** propias para tareas repetidas: retomar una sesión a partir del estado real de git y redactar una nueva ADR con la plantilla del proyecto.\n- Un **hook** que bloquea al agente si intenta romper las reglas de git del proyecto (por ejemplo, commitear directo en `main`), con sus propios tests."
---
