---
title: "OdontoTrack FOUEES"
category: "Software development · Full-stack"
shortDescription: "Digital patient bank for the School of Dentistry at Universidad Evangélica de El Salvador: patient intake, case assignment to students, clinical records with an odontogram, and role-based dashboards. Built as my social service project."
description: "A web platform that digitises the patient bank of the School of Dentistry at Universidad Evangélica de El Salvador (FOUEES) to make students' clinical practice easier. Reception registers patients, patients are assigned to students as cases, supervising faculty review and validate diagnoses, and every role has its own dashboard. It is part of my social service at the university where I study. In a 3-person team, I am the project's lead developer and technical lead, with a Django REST Framework backend and a React + TypeScript frontend."
technologies:
  [
    "Django",
    "Django REST Framework",
    "React",
    "TypeScript",
    "PostgreSQL",
    "Docker",
    "Vite",
    "Tailwind CSS",
  ]
githubUrl: "https://github.com/ayorick23/odontotrack-fouees"
disciplines: []
track: "software"
featured: false
status: "draft"
date: 2026-09-16
coverKind: "odontogram"
ogImage: "/og/odontotrack-fouees-en.png"
order: 10
metrics:
  - value: "5"
    label: "Roles with their own permissions"
  - value: "300+"
    label: "Automated backend tests"
  - value: "3"
    label: "Team members"
sections:
  - heading: "Context"
    body: "Dentistry students need patients to complete their clinical practice. OdontoTrack works as a **digital patient bank**: reception registers each patient, the patient is assigned to a student as a case, a supervising faculty member follows up and validates diagnoses, and everything lives in a digital clinical record.\n\nIt is my *social service* project at the same university where I study, where I am the **lead developer and technical lead** of a 3-person team. Unlike the rest of this portfolio, it is not a data project: it is full-stack software development, the other half of my degree in Software Engineering and Data Science."
  - heading: "What the system does"
    body: "- **Patients:** full intake form, searchable directory and CSV export.\n- **Case assignment:** patients available in the bank are assigned to students, and each case moves through *pending*, *in progress* and *closed*.\n- **Clinical records:** diagnoses, treatments and progress notes, with diagnoses that faculty must validate before a case can be closed.\n- **Interactive odontogram** using FDI notation, exportable to PNG and PDF.\n- **Appointment calendar** with daily in-app reminders for each student.\n- **Role-based dashboards** with patient-bank indicators, such as the share of patients with a digital record or of validated diagnoses."
  - heading: "Architecture"
    body: "Backend and frontend are fully decoupled. The backend is a **pure REST API in Django + Django REST Framework** (no templates), authenticated with **JWT** and documented with OpenAPI/Swagger. The frontend is a **React + Vite + TypeScript** SPA styled with Tailwind CSS. The database is **PostgreSQL**, and the whole local environment runs on **Docker Compose** (database, backend and frontend), so all 3 developers work on exactly the same setup.\n\nAccess control is a custom permission system with **5 roles** (administrator, supervising faculty, student, reception and technical support): every screen and every API endpoint requires a permission, and each role's permission matrix can be adjusted from within the app."
  - heading: "How we work"
    body: "- Protected `main`: every change goes through a Pull Request with at least one approval from another team member.\n- Tasks tracked in **Linear**.\n- Automated tests on both sides: Django's test runner on the backend and **Vitest + Testing Library** on the frontend.\n- Migrations and seed data are run manually and explicitly: the container never changes the database on startup."
  - heading: "AI-assisted development"
    body: "As lead developer, I worked with **Claude Code** as a development agent: to move faster on implementation and to learn tools that were new to me along the way. No change goes in without my review, and when I don't understand a decision I ask it to explain before accepting it. On top of that, everything still goes through a Pull Request and another team member's approval: the agent speeds up the work, it doesn't skip the process."
  - heading: "Project status"
    body: "In active development. This case study will be updated as the system progresses."
---
