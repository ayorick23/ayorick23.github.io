---
title: "OdontoTrack FOUEES"
category: "Desarrollo de software · Full-stack"
shortDescription: "Banco digital de pacientes para la Facultad de Odontología de la Universidad Evangélica de El Salvador: registro de pacientes, asignación de casos a estudiantes, odontograma, validación docente y dashboards por rol. Proyecto de servicio social."
description: "Plataforma web que reemplaza la gestión manual (a lo mucho, un archivo de Excel) del banco de pacientes de la Facultad de Odontología de la Universidad Evangélica de El Salvador (FOUEES). Recepción registra a los pacientes, se asignan como casos a estudiantes, los estudiantes los atienden con un odontograma digital, los docentes validan los diagnósticos y cada rol tiene su propio dashboard. Es mi proyecto de servicio social, desarrollado por un equipo de 3 personas con un backend en Django REST Framework y un frontend en React con TypeScript."
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
  - heading: "El problema"
    body: "Los estudiantes de la Facultad de Odontología necesitan pacientes para completar sus prácticas clínicas, y la facultad mantiene un **banco de pacientes** para repartirlos. Hasta ahora ese banco se llevaba de forma manual: a lo mucho, en un archivo de Excel. Eso hacía difícil saber qué pacientes seguían esperando, a qué estudiante se le había asignado cada uno, en qué estado iba cada caso y qué diagnósticos faltaba revisar.\n\nOdontoTrack lleva todo ese proceso a una sola plataforma: desde que el paciente llega a recepción hasta que su caso se cierra con los diagnósticos validados por un docente."
    images:
      - src: "/projects/odontotrack-fouees/login.webp"
        alt: "Pantalla de inicio de sesión de OdontoTrack con el correo institucional y el lema 'Tu práctica clínica, organizada en un solo lugar'"
        caption: "Cada usuario entra con su cuenta institucional y ve solo lo que su rol permite."
  - heading: "Mi rol"
    body: "Es mi proyecto de *servicio social* en la misma universidad donde estudio. Lo desarrollamos **tres personas trabajando al mismo nivel**: todos tocamos backend y frontend. Yo aporté un poco más en el **backend** y en el **diseño visual** de la interfaz.\n\nA diferencia del resto de mi portafolio, no es un proyecto de datos: es desarrollo de software full-stack, el otro lado de mi carrera en Ingeniería en Desarrollo de Software y Ciencia de Datos."
  - heading: "Recepción registra al paciente"
    body: "Recepción crea la ficha con los datos personales y el documento de identidad, el contacto (teléfono, WhatsApp y correo) y un **contacto de emergencia**. El motivo de consulta es opcional, pero si se indica el área clínica y el tratamiento, después sirve para filtrar al paciente en el directorio y en las asignaciones.\n\nEl paciente queda *pendiente* en el banco hasta que se le asigna a un estudiante; el expediente clínico se carga después de la asignación."
    images:
      - src: "/projects/odontotrack-fouees/register-pacient.webp"
        alt: "Formulario de registro de paciente con datos personales, contacto, contacto de emergencia y motivo de consulta"
        caption: "Registro de paciente: datos personales, contacto y contacto de emergencia en una sola pantalla."
  - heading: "El estudiante atiende con el odontograma"
    body: "Una vez asignado, el estudiante trabaja sobre un **odontograma interactivo** con notación FDI. Se marca cada pieza y cada superficie (vestibular, mesial, oclusal, distal y lingual) con su patología o tratamiento previo, y el trabajo se separa en dos etapas: el **diagnóstico** (lo que el paciente trae hoy) y el **plan de tratamiento**.\n\nCada marca queda en un registro de la carta, con quién la hizo y cuándo, y el odontograma se puede exportar a PNG y PDF. También admite dentición temporal o mixta."
    images:
      - src: "/projects/odontotrack-fouees/odontograma.webp"
        alt: "Ficha de paciente con el odontograma FDI de 32 piezas, el panel de la pieza 25 con patologías, tratamientos y superficies, y el registro de la carta"
        caption: "Odontograma con notación FDI: cada pieza y cada superficie, con diagnóstico y plan de tratamiento separados."
  - heading: "El docente valida los diagnósticos"
    body: "Ningún caso se puede cerrar sin que un **docente supervisor** valide sus diagnósticos. Los pendientes aparecen en una cola de supervisión con el paciente, el estudiante responsable, la fecha y el diagnóstico propuesto, y el número de diagnósticos por validar se ve en el menú y en el dashboard."
    images:
      - src: "/projects/odontotrack-fouees/supervision.webp"
        alt: "Pantalla de supervisión con la lista de diagnósticos por validar, cada uno con su paciente, estudiante, fecha y botón Validar"
        caption: "Cola de supervisión: el docente revisa y valida cada diagnóstico antes de que el caso pueda cerrarse."
  - heading: "Citas y seguimiento"
    body: "El **calendario de citas** muestra la semana por día y por estudiante, con el estado de cada cita (*programada*, *sin registrar*, *atendida* o *cancelada*), y cada estudiante recibe recordatorios diarios dentro de la aplicación."
    images:
      - src: "/projects/odontotrack-fouees/calendar.webp"
        alt: "Calendario semanal de citas con las citas de cada estudiante y un resumen por estado"
        caption: "Calendario semanal con filtro por estudiante y resumen de citas por estado."
  - heading: "Indicadores por rol"
    body: "Cada rol tiene su propio dashboard. El de administración resume el estado del banco: diagnósticos por validar, pacientes pendientes, casos asignados, **días de espera hasta la asignación**, registros y asignaciones por mes, estado de los casos, tratamientos más demandados, pacientes por área clínica y ocupación de la clínica.\n\n*Los datos de todas las capturas son ficticios, de prueba.*"
    images:
      - src: "/projects/odontotrack-fouees/dashboard-admin.webp"
        alt: "Panel administrativo con indicadores del banco de pacientes, gráfico de registros y asignaciones por mes, estado de los casos y pacientes por área clínica"
        caption: "Panel administrativo: el estado del banco de pacientes de un vistazo (datos de prueba)."
  - heading: "Decisiones técnicas"
    body: "- **API y frontend desacoplados.** El backend es una API REST pura en **Django + Django REST Framework** (sin templates), autenticada con **JWT** y documentada con **OpenAPI/Swagger**, así cualquiera del equipo puede probar un endpoint sin tocar el frontend. El frontend es una SPA en **React + Vite + TypeScript** con Tailwind CSS.\n- **Permisos por rol.** Un sistema propio con **5 roles** (administración, docente supervisor, estudiante, recepción y soporte técnico): cada pantalla y cada endpoint exige un permiso, y la matriz de cada rol se ajusta desde la propia aplicación.\n- **El mismo entorno para los tres.** Base de datos (**PostgreSQL**), backend y frontend se levantan con **Docker Compose**. Las migraciones y los datos semilla se corren a mano y de forma explícita: el contenedor nunca modifica la base de datos al arrancar."
    images:
      - src: "/projects/odontotrack-fouees/swagger.webp"
        alt: "Documentación Swagger de la API de OdontoTrack con los endpoints de salud, autenticación JWT y cuentas"
        caption: "La API documentada con OpenAPI 3.0: autenticación JWT y endpoints agrupados por módulo."
  - heading: "Forma de trabajo"
    body: "- `main` protegida: todo cambio entra por Pull Request con al menos una aprobación de otro integrante.\n- Tareas gestionadas en **Linear**.\n- Pruebas automatizadas en ambos lados: más de 300 en el backend con el test runner de Django, y **Vitest + Testing Library** en el frontend."
  - heading: "Desarrollo asistido con IA"
    body: "Trabajé con **Claude Code** como agente de desarrollo: para avanzar más rápido en la implementación y para aprender sobre la marcha herramientas que eran nuevas para mí. Ningún cambio entra sin que yo lo revise, y cuando no entiendo una decisión le pido que me la explique antes de aceptarla. Además, todo pasa igual por Pull Request y la aprobación de otro integrante del equipo: el agente acelera el trabajo, no se salta el proceso."
  - heading: "Estado del proyecto"
    body: "En desarrollo activo. Este caso de estudio se irá actualizando a medida que el sistema avance."
---
