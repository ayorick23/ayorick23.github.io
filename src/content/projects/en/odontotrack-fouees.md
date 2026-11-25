---
title: "OdontoTrack FOUEES"
category: "Software development · Full-stack"
shortDescription: "Digital patient bank for the School of Dentistry at Universidad Evangélica de El Salvador: patient intake, case assignment to students, odontogram, faculty validation and role-based dashboards. Built as my social service project."
description: "A web platform that replaces the manual management (at most, an Excel file) of the patient bank at the School of Dentistry of Universidad Evangélica de El Salvador (FOUEES). Reception registers patients, patients are assigned to students as cases, students treat them with a digital odontogram, faculty validate the diagnoses, and every role has its own dashboard. It is my social service project, built by a 3-person team with a Django REST Framework backend and a React + TypeScript frontend."
technologies: ["Django", "Django REST Framework", "React", "TypeScript", "PostgreSQL", "Docker", "Vite", "Tailwind CSS"]
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
  - heading: "The problem"
    body: "Dentistry students need patients to complete their clinical practice, and the school keeps a **patient bank** to distribute them. Until now that bank was managed by hand: at most, in an Excel file. That made it hard to know which patients were still waiting, which student each one had been assigned to, how each case was progressing and which diagnoses still needed review.\n\nOdontoTrack brings that whole process into a single platform: from the moment a patient arrives at reception until their case is closed with diagnoses validated by a faculty member."
    images:
      - src: "/projects/odontotrack-fouees/login.webp"
        alt: "OdontoTrack sign-in screen with the institutional email field and the tagline 'Your clinical practice, organized in one place'"
        caption: "Every user signs in with an institutional account and only sees what their role allows."
  - heading: "My role"
    body: "It is my *social service* project at the same university where I study. We built it as **three people working at the same level**: all of us work on both backend and frontend. I contributed a bit more on the **backend** and on the **visual design** of the interface.\n\nUnlike the rest of this portfolio, it is not a data project: it is full-stack software development, the other half of my degree in Software Development and Data Science Engineering."
  - heading: "Reception registers the patient"
    body: "Reception creates the record with personal details and ID document, contact information (phone, WhatsApp and email) and an **emergency contact**. The reason for the visit is optional, but when the clinical area and treatment are set, they later help filter the patient in the directory and in assignments.\n\nThe patient stays *pending* in the bank until assigned to a student; the clinical record is filled in after assignment."
    images:
      - src: "/projects/odontotrack-fouees/register-pacient.webp"
        alt: "Patient intake form with personal details, contact information, emergency contact and reason for the visit"
        caption: "Patient intake: personal details, contact and emergency contact on a single screen."
  - heading: "The student treats with the odontogram"
    body: "Once assigned, the student works on an **interactive odontogram** using FDI notation. Each tooth and each surface (buccal, mesial, occlusal, distal and lingual) is marked with its pathology or previous treatment, and the work is split into two stages: the **diagnosis** (what the patient has today) and the **treatment plan**.\n\nEvery mark is kept in a chart log with who made it and when, and the odontogram can be exported to PNG and PDF. Primary and mixed dentition are supported too."
    images:
      - src: "/projects/odontotrack-fouees/odontograma.webp"
        alt: "Patient record with the 32-tooth FDI odontogram, the tooth 25 panel with pathologies, treatments and surfaces, and the chart log"
        caption: "FDI odontogram: every tooth and surface, with diagnosis and treatment plan kept separate."
  - heading: "Faculty validate the diagnoses"
    body: "No case can be closed until a **supervising faculty member** validates its diagnoses. Pending ones appear in a supervision queue with the patient, the responsible student, the date and the proposed diagnosis, and the number of diagnoses awaiting validation shows in the menu and on the dashboard."
    images:
      - src: "/projects/odontotrack-fouees/supervision.webp"
        alt: "Supervision screen listing diagnoses awaiting validation, each with its patient, student, date and a Validate button"
        caption: "Supervision queue: faculty review and validate each diagnosis before the case can be closed."
  - heading: "Appointments and follow-up"
    body: "The **appointment calendar** shows the week by day and by student, with each appointment's status (*scheduled*, *not recorded*, *attended* or *cancelled*), and every student gets daily in-app reminders."
    images:
      - src: "/projects/odontotrack-fouees/calendar.webp"
        alt: "Weekly appointment calendar with each student's appointments and a summary by status"
        caption: "Weekly calendar with a per-student filter and an appointment summary by status."
  - heading: "Role-based indicators"
    body: "Every role has its own dashboard. The administration one summarizes the state of the bank: diagnoses awaiting validation, pending patients, assigned cases, **days waiting until assignment**, registrations and assignments per month, case status, most requested treatments, patients by clinical area and clinic occupancy.\n\n*All data in the screenshots is fictitious test data.*"
    images:
      - src: "/projects/odontotrack-fouees/dashboard-admin.webp"
        alt: "Administration dashboard with patient-bank indicators, a chart of registrations and assignments per month, case status and patients by clinical area"
        caption: "Administration dashboard: the state of the patient bank at a glance (test data)."
  - heading: "Technical decisions"
    body: "- **Decoupled API and frontend.** The backend is a pure REST API in **Django + Django REST Framework** (no templates), authenticated with **JWT** and documented with **OpenAPI/Swagger**, so anyone on the team can try an endpoint without touching the frontend. The frontend is a **React + Vite + TypeScript** SPA styled with Tailwind CSS.\n- **Role-based permissions.** A custom system with **5 roles** (administration, supervising faculty, student, reception and technical support): every screen and every endpoint requires a permission, and each role's matrix can be adjusted from within the app.\n- **The same environment for all three of us.** Database (**PostgreSQL**), backend and frontend run on **Docker Compose**. Migrations and seed data are run by hand and explicitly: the container never changes the database on startup."
    images:
      - src: "/projects/odontotrack-fouees/swagger.webp"
        alt: "Swagger documentation of the OdontoTrack API showing the health, JWT authentication and accounts endpoints"
        caption: "The API documented with OpenAPI 3.0: JWT authentication and endpoints grouped by module."
  - heading: "How we work"
    body: "- Protected `main`: every change goes through a Pull Request with at least one approval from another team member.\n- Tasks managed in **Linear**.\n- Automated tests on both sides: more than 300 on the backend with Django's test runner, and **Vitest + Testing Library** on the frontend."
  - heading: "AI-assisted development"
    body: "I worked with **Claude Code** as a development agent: to move faster on implementation and to learn tools that were new to me along the way. No change goes in without my review, and when I don't understand a decision I ask it to explain before accepting it. On top of that, everything still goes through a Pull Request and another team member's approval: the agent speeds up the work, it doesn't skip the process."
  - heading: "Project status"
    body: "In active development. This case study will be updated as the system evolves."
---
