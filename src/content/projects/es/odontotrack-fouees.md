---
title: "OdontoTrack FOUEES"
category: "Desarrollo de software · Full-stack"
shortDescription: "Banco digital de pacientes para la Facultad de Odontología de la Universidad Evangélica de El Salvador: registro de pacientes, asignación de casos a estudiantes, expediente clínico con odontograma y dashboards por rol. Proyecto de servicio social."
description: "Plataforma web que digitaliza el banco de pacientes de la Facultad de Odontología de la Universidad Evangélica de El Salvador (FOUEES), para facilitar las prácticas clínicas de los estudiantes. Recepción registra a los pacientes, se asignan como casos a estudiantes, los docentes supervisan y validan diagnósticos, y cada rol tiene su propio dashboard. Es parte de mi servicio social en la universidad donde estudio. En un equipo de 3 personas, soy el desarrollador principal y líder técnico del proyecto, con un backend en Django REST Framework y un frontend en React con TypeScript."
technologies: ["Django", "Django REST Framework", "React", "TypeScript", "PostgreSQL", "Docker", "Vite", "Tailwind CSS"]
githubUrl: "https://github.com/ayorick23/odontotrack-fouees"
disciplines: []
track: "software"
featured: false
status: "draft"
date: 2026-09-16
coverKind: "odontogram"
ogImage: "/og/odontotrack-fouees-es.png"
order: 10
metrics:
  - value: "5"
    label: "Roles con permisos propios"
  - value: "300+"
    label: "Pruebas automatizadas en el backend"
  - value: "3"
    label: "Integrantes en el equipo"
sections:
  - heading: "Contexto"
    body: "Los estudiantes de la Facultad de Odontología necesitan pacientes para completar sus prácticas clínicas. OdontoTrack funciona como un **banco digital de pacientes**: recepción registra a cada paciente, se le asigna como caso a un estudiante, un docente supervisor da seguimiento y valida los diagnósticos, y todo queda en un expediente clínico digital.\n\nEs mi proyecto de *servicio social* en la misma universidad donde estudio, y en él soy el **desarrollador principal y líder técnico** de un equipo de 3 personas. A diferencia del resto de mi portafolio, no es un proyecto de datos: es desarrollo de software full-stack, el otro lado de mi carrera en Ingeniería de Software y Ciencia de Datos."
  - heading: "Qué hace el sistema"
    body: "- **Pacientes:** registro con ficha completa, directorio con búsqueda y exportación a CSV.\n- **Asignación de casos:** los pacientes disponibles en el banco se asignan a estudiantes, y cada caso avanza entre *pendiente*, *en proceso* y *finalizado*.\n- **Expediente clínico:** diagnósticos, tratamientos y evoluciones, con diagnósticos que un docente debe validar antes de poder finalizar el caso.\n- **Odontograma interactivo** con notación FDI, exportable a PNG y PDF.\n- **Calendario de citas** con recordatorios diarios dentro de la aplicación para cada estudiante.\n- **Dashboards por rol** con indicadores del banco de pacientes, como el porcentaje de pacientes con expediente digital o de diagnósticos validados."
  - heading: "Arquitectura"
    body: "Backend y frontend están desacoplados. El backend es una **API REST pura en Django + Django REST Framework** (sin templates), autenticada con **JWT** y documentada con OpenAPI/Swagger. El frontend es una SPA en **React + Vite + TypeScript**, con Tailwind CSS. La base de datos es **PostgreSQL**, y todo el entorno local se levanta con **Docker Compose** (base de datos, backend y frontend), para que los 3 desarrolladores trabajen con exactamente el mismo entorno.\n\nEl control de acceso es un sistema de permisos propio con **5 roles** (administrador, docente supervisor, estudiante, recepción y soporte técnico): cada pantalla y cada endpoint de la API exige un permiso, y la matriz de cada rol se puede ajustar desde la propia aplicación."
  - heading: "Forma de trabajo"
    body: "- `main` protegida: todo cambio entra por Pull Request con al menos una aprobación de otro integrante.\n- Tareas gestionadas en **Linear**.\n- Pruebas automatizadas en ambos lados: el test runner de Django en el backend y **Vitest + Testing Library** en el frontend.\n- Migraciones y datos semilla se corren a mano y de forma explícita: el contenedor nunca modifica la base de datos al arrancar."
  - heading: "Desarrollo asistido con IA"
    body: "Como desarrollador principal, trabajé con **Claude Code** como agente de desarrollo: para avanzar más rápido en la implementación y para aprender sobre la marcha herramientas que eran nuevas para mí. Ningún cambio entra sin que yo lo revise, y cuando no entiendo una decisión le pido que me la explique antes de aceptarla. Además, todo pasa igual por Pull Request y la aprobación de otro integrante del equipo: el agente acelera el trabajo, no se salta el proceso."
  - heading: "Estado del proyecto"
    body: "En desarrollo activo. Este caso de estudio se irá actualizando a medida que el sistema avance."
---
