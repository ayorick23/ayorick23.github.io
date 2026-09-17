---
title: "Telco Churn MLOps"
category: "MLOps · Classification"
shortDescription: "An end-to-end churn prediction system spanning EDA to production: model selection, experiment tracking, drift monitoring, champion/challenger retraining, explainable serving, and a business-value calculation to prioritize retention."
description: "A complete MLOps platform for predicting customer churn at a telecom operator (7,043 customers, the Telco Customer Churn dataset). This isn't a classification notebook — it's the full lifecycle of a model in production: comparing 4 model families, Bayesian tuning with Optuna, MLflow experiment tracking, DVC data versioning, drift detection with Evidently AI, champion/challenger promotion under an explicit business criterion, FastAPI serving with SHAP explainability, an interactive Streamlit dashboard, and a business-value layer that turns every prediction into an actionable number: how much is lost if that customer leaves, and whether a retention campaign is worth it."
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
ogImage: "/og/telco-churn-mlops-en.png"
metrics:
  - label: "ROC-AUC"
    value: "0.99"
  - label: "F1-Score"
    value: "0.93"
  - label: "Recall (churn)"
    value: "91%"
  - label: "Customers analyzed"
    value: "7,043"
  - label: "Automated tests"
    value: "149"
sections:
  - heading: "Context and business problem"
    body: "Retaining an existing customer costs significantly less than acquiring a new one — but only if retention efforts target the right customers, with enough margin to justify the campaign's cost. The project starts from a real telecom dataset (Telco Customer Churn, 7,043 customers, 50 columns: demographics, contract details, subscribed services and billing) with a dual objective:\n\n1. Estimate each customer's churn probability with enough confidence to prioritize intervention.\n2. Sustain that confidence over time, detecting when the model degrades against new data and deciding objectively when to replace it — *not a model trained once and abandoned*."
  - heading: "Solution approach"
    body: "The system was designed as layers with a single-direction dependency (Data → Features → Training → Registry/Serving → Monitoring → Presentation), each decoupled from the next so that, for example, serving predictions never depends on monitoring being up. Every non-obvious architecture or tooling decision was documented as an ADR before implementation (**14 ADRs** across 8 phases) — the project's explicit goal is to demonstrate the full MLOps lifecycle with the same practices a real team would use, *not just ship a classifier with a good metric*."
    images:
      - src: "/projects/telco-churn-mlops/architecture.png"
        alt: "System architecture diagram showing the layers: Data, Features, Training, Registry/Serving, Monitoring and Presentation"
        caption: "Each layer only knows about the one before it — serving predictions never depends on monitoring being up."
  - heading: "Data: exploration and quality"
    body: "The EDA identified, among other findings, four columns with **data leakage** and low signal-value columns, explicitly documented and excluded in ADR 0006:\n\n- Leakage: `Churn Score`, `Customer Status`, `Churn Category`, `Churn Reason` — all derived from churn or only available after it already happened.\n- Low signal value: `Latitude`, `Longitude`, `Zip Code`, `CLTV`.\n\nBefore reaching the model, every data batch passes through a Pandera schema contract (types, nullability, valid categorical values) verified with automated tests — the goal is for a data-quality issue to fail *loudly* in the pipeline, not silently in a production prediction."
    images:
      - src: "/projects/telco-churn-mlops/churn-by-contract.png"
        alt: "Horizontal bar chart of churn percentage by contract commitment type (Month-to-Month, One Year, Two Year)"
        caption: "The shorter the contract commitment, the higher the churn: 45.8% for Month-to-Month vs. 2.5% for Two Year (18x more)."
  - heading: "Feature engineering"
    body: "Of the original 50 columns, **37 raw features** remain after excluding leakage, IDs and low-value columns, plus 2 derived variables (`is_new_customer`, `num_extra_services`) designed from EDA findings rather than arbitrarily. Encoding and scaling deliberately live in the training layer, not in features — *features produces clean, human-readable data*; training decides how to encode it based on what each model family needs, a separation of concerns documented in ADR 0007."
  - heading: "Modeling and experimentation"
    body: "4 model families were compared under the same evaluation protocol — Logistic Regression (baseline), XGBoost, LightGBM and CatBoost — with explicit focus on how each handles the dataset's high-cardinality categoricals (ADR 0009). **LightGBM** won with F1=0.929 in the initial comparison; that result carried into a final pipeline with Bayesian hyperparameter tuning via Optuna (50 trials, Stratified K-Fold to avoid overfitting the split selection), which raised the final champion's F1 to **0.931** with a ROC-AUC of **0.992**."
    images:
      - src: "/projects/telco-churn-mlops/model-comparison.png"
        alt: "Bar chart of test-set F1-Score for the 4 model families compared: LightGBM, XGBoost, CatBoost and Logistic Regression"
        caption: "LightGBM wins the initial comparison with F1=0.929, ahead of XGBoost (0.923), CatBoost (0.919) and Logistic Regression (0.906)."
  - heading: "MLOps: tracking, versioning and registry"
    body: "Every experiment (parameters, metrics, artifacts) is logged to MLflow, with the Model Registry managing which version serves in production via aliases (`champion`), not the now-deprecated stages system. Code is versioned with Git and data/models with DVC against a DagsHub remote — the combination makes it possible to reproduce *any* past result knowing exactly which code, data and configuration produced it, without relying on a local notebook staying intact."
    images:
      - src: "/projects/telco-churn-mlops/screenshot-registry-mlflow.png"
        alt: "Screenshot of the experiment list in the MLflow UI, with the project's phases (model-selection, training, monitoring, promotion) and their last-modified date"
        caption: "Experiments versioned in MLflow, one per project phase (model selection, training, monitoring, promotion)."
      - src: "/projects/telco-churn-mlops/screenshot-registry-dagshub.png"
        alt: "Screenshot of the experiment table in DagsHub, comparing accuracy, F1 and PR-AUC across CatBoost, LightGBM, XGBoost and Logistic Regression runs"
        caption: "The same experiments versioned in DagsHub alongside code and data via DVC, comparing metrics across runs."
  - heading: "Monitoring, drift and retraining"
    body: "The system simulates incoming data with perturbations of increasing intensity and evaluates them with Evidently AI to quantitatively detect drift (`dataset_drift_share`). A retraining threshold (**10%**, calibrated against the project's own results, not an arbitrary number) decides whether retraining is warranted; the resulting challenger is compared against the current champion under an explicit business criterion — not just aggregate F1. To be promoted, the challenger must:\n\n- Win by a minimum margin of 1 point.\n- Not regress by more than a defined tolerance in any relevant business segment: contract type, payment method, internet type.\n\nRetraining and promotion are deliberately manual steps, with a human in the loop, *not an automatic cron job*."
    images:
      - src: "/projects/telco-churn-mlops/screenshot-drift-monitoring.png"
        alt: "Screenshot of an Evidently AI report showing no dataset drift detected (12.8% of columns with drift, below the threshold)"
        caption: "Evidently AI report: drift detected in 5 of 39 columns (12.8%), below Evidently's dataset-drift threshold (50%)."
  - heading: "Serving, explainability and business impact"
    body: "The model is served via a REST API (FastAPI, request validation with Pydantic) with two business endpoints: prediction and SHAP explanation (`TreeExplainer`, exact values for tree-based models, no background dataset required). An interactive Streamlit dashboard consumes that API and adds a business-value layer: for each prediction, it estimates how much revenue is at risk if that specific customer churns (the remaining value of their current contract) and compares that number against the cost of a retention campaign to decide, with an explicit criterion, whether intervening is worth it — *the part of the project that connects the technical prediction to the real business decision*."
    images:
      - src: "/projects/telco-churn-mlops/screenshot-streamlit-app.png"
        alt: "Screenshot of the Streamlit dashboard showing a 99.9% churn prediction, the value at risk ($553.44), expected loss ($553.07) against the campaign cost ($50.00), and the SHAP chart of the 15 highest-impact features"
        caption: "Streamlit dashboard: every prediction is translated into a business decision — retention is worth it when the expected net benefit is positive."
  - heading: "Testing and CI/CD"
    body: "**149 automated tests** (unit, data-validation and integration) run on every push and pull request against `main` via GitHub Actions, alongside lint (Ruff), formatting and type-checking (MyPy) as a mandatory gate before merging. The integration tests go beyond mocking external dependencies: they exercise the real production pipeline (*no mocks*) and spin up the full stack with Docker Compose to catch, in CI, the class of bug a unit test can't see by design — a container that builds but doesn't start, or an artifact that never makes it into the final image."
    images:
      - src: "/projects/telco-churn-mlops/screenshot-github-actions-ci.png"
        alt: "Screenshot of a GitHub Actions workflow showing every CI pipeline step (ruff check, ruff format, mypy, DVC credentials, docker buildx, pytest) completed in green"
        caption: "CI workflow in GitHub Actions: lint, format, mypy and the full integration test suite with Docker on every push/PR."
  - heading: "Deployment and infrastructure"
    body: "The API and dashboard are packaged as independent Docker images (multi-stage builds, using `uv` to install exact dependencies via lockfile) and can be orchestrated locally with Docker Compose. The final hosting destination was deliberately left open during development: two free-tier platforms (Render, then Hugging Face Spaces) changed their pricing policy between when the deployment was designed and when it was attempted — *a real infrastructure decision and its trade-off, not a technical limitation of the project*."
    images:
      - src: "/projects/telco-churn-mlops/screenshot-docker-containers.png"
        alt: "Screenshot of Docker Desktop showing the project's containers running: telco-churn-mlops-api on port 8000 and telco-churn-mlops-dashboard on port 8501"
        caption: "API and dashboard orchestrated with Docker Compose, each in its own container and port."
  - heading: "Technical challenges and how they were solved"
    body: "The project documented and solved three classes of real, not hypothetical, problems:\n\n1. An MLflow artifact-storage bug on DagsHub that blocked downloading the pipeline from the Registry — diagnosed with evidence (reproduced, isolated from causes like quota or credentials) and resolved by redesigning to rely less on that download, versioning the champion with DVC instead of MLflow.\n2. A Docker image that built without error but crash-looped in production due to a missing OS-level library (`libgomp1`) lost between stages of a multi-stage build.\n3. Two free hosting platforms that changed their pricing policy midway through implementation.\n\nEach episode was documented with the full diagnosis, not just the fix, as part of the project's engineering standard."
  - heading: "Results and learnings"
    body: "The result isn't just a classifier with **0.99 ROC-AUC** and **0.93 F1** on the production champion — it's a system where every component (what data went in, which model was trained with which hyperparameters, why a new version was or wasn't promoted, how reliable it remains against changing data) is traceable and auditable. The project shows that the hardest part of a production ML system is rarely the model — it's everything around it: validation, reproducibility, version governance, continuous monitoring, and the final translation of a probability into a business decision with a real cost."
---
