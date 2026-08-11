---
title: "Telco Churn MLOps"
category: "MLOps · Classification"
shortDescription: "An end-to-end machine learning project for identifying customers at risk of churn, with a focus on reproducibility, experiment tracking, testing and production-oriented workflows."
description: "An end-to-end machine learning project for identifying customers at risk of churn, with a focus on reproducibility, experiment tracking, testing and production-oriented workflows."
technologies:
  ["Python", "Scikit-learn", "MLflow", "DVC", "Docker", "GitHub Actions"]
githubUrl: "https://github.com/ayorick23/telco-churn-mlops"
featured: true
status: "published"
date: 2026-01-01
order: 1
metrics: []
sections:
  - heading: "Context"
    body: "Customer churn is not only a classification problem; it is a decision problem. The goal of this project is to identify customers with a higher likelihood of leaving while building a workflow that can be reproduced, evaluated and maintained beyond a single notebook."
  - heading: "Approach"
    body: "The project follows a structured machine learning workflow: data validation and exploration, feature engineering, baseline modelling, model comparison and evaluation using metrics that reflect the business objective."
  - heading: "Engineering"
    body: "The modelling workflow is supported by experiment tracking with MLflow, dataset and pipeline versioning with DVC, automated testing, code quality checks and containerisation with Docker. The project is designed around reproducibility rather than one-off experimentation."
  - heading: "MLOps"
    body: "The model lifecycle is treated as a system: experiments are tracked, data and code are versioned, models are evaluated against defined criteria, and retraining can be incorporated into an automated workflow."
  - heading: "Outcome"
    body: "The result is not only a trained classifier, but a complete and reproducible ML project that demonstrates how a model can evolve from experimentation toward a maintainable production workflow."
---
