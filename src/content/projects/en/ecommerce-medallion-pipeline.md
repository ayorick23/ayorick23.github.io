---
title: "E-Commerce Medallion Pipeline"
category: "Data Engineering · Orchestration"
shortDescription: "A Medallion-architecture data pipeline (Bronze → Silver → Gold) for e-commerce data, built with Polars and DuckDB and orchestrated with Airflow. A work in progress focused on demonstrating end-to-end data engineering."
description: "A data engineering pipeline for an e-commerce dataset, organized into Bronze, Silver and Gold layers. The project's goal is to demonstrate end-to-end data engineering skills: transformation with Polars, analysis with DuckDB and orchestration with Airflow. Currently in development — orchestration with Airflow and the Gold layer haven't been reached yet, so this page covers only the project's general approach for now."
technologies: ["Polars", "DuckDB", "Airflow"]
githubUrl: "https://github.com/ayorick23/ecommerce-medallion-pipeline"
featured: true
status: "draft"
date: 2026-09-16
order: 3
coverKind: "medallion"
ogImage: "/og/ecommerce-medallion-pipeline-en.png"
metrics: []
sections:
  - heading: "Project status"
    body: "This case study is under construction. The idea is to take e-commerce data and process it in layers following the Medallion architecture: **Bronze** (raw data as it arrives), **Silver** (cleaned and validated data) and **Gold** (curated, analysis-ready data). Transformation is done with **Polars**, analysis with **DuckDB**, and the whole flow is orchestrated with **Apache Airflow**.\n\nAs of this writing, development hasn't reached Airflow orchestration or the Gold layer yet — detailed content (business context, technical decisions, results) will be added as the project progresses."
---
