---
title: "E-Commerce Medallion Pipeline"
category: "Data Engineering · Orchestration"
shortDescription: "A Medallion-architecture data pipeline (Bronze → Silver → Gold) for e-commerce data, built with Polars and DuckDB and orchestrated with Airflow. A work in progress focused on demonstrating end-to-end data engineering."
description: "A data engineering pipeline for an e-commerce dataset, organized into Bronze, Silver and Gold layers. The project's goal is to demonstrate end-to-end data engineering skills: transformation with Polars, analysis with DuckDB and orchestration with Airflow. Currently in development — orchestration with Airflow and the Gold layer haven't been reached yet, so this page covers only the project's general approach for now."
technologies: ["Polars", "DuckDB", "Airflow"]
githubUrl: "https://github.com/ayorick23/ecommerce-medallion-pipeline"
disciplines: ["data-engineering"]
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
  - heading: "AI-assisted development"
    body: "I'm building this project with **Claude Code** as a development agent. I use it to move faster on implementation and also to learn the stack's tools along the way. No change goes in without my review, and when I don't understand a decision I ask it to explain before accepting it: that constant review is what has been building my technical judgment.\n\nHere I took the work with the agent a step further, with a `.claude` folder versioned in the repository:\n\n- A `CLAUDE.md` with the project's general rules.\n- **Folder-scoped rules** that the agent only loads when it works on that part of the code.\n- Custom **skills** for recurring tasks: resuming a session from the real git state and drafting a new ADR from the project's template.\n- A **hook** that blocks the agent if it tries to break the project's git rules (for example, committing straight to `main`), with its own tests."
---
