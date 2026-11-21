---
name: nuevo-certificado
description: Agrega un certificado a "Sobre mí" — PDF, imagen para la pila, título bilingüe, descripción "lo que aprendí" y enlace de verificación. Úsala cuando Dereck traiga un certificado nuevo.
argument-hint: "[ruta al PDF]"
disable-model-invocation: true
allowed-tools: Bash(ls public/certificates*) Bash(ls src/assets/certificates*) Bash(git branch --show-current)
---

# Nuevo certificado: $ARGUMENTS

Rama: !`git branch --show-current` (si es `main`, crea una rama antes).

Certificados existentes:

!`ls public/certificates`

## Pasos

1. Lee el PDF: título exacto, emisor, fecha y, si lo tiene, link de verificación.
2. Elige el `id`: minúsculas, sin espacios ni tildes, con guiones. Copia el PDF a
   `public/certificates/{id}.pdf`.
3. `python scripts/render-certificates.py` genera `src/assets/certificates/{id}.jpg`
   (requiere `pip install pymupdf`).
4. Entrada en `src/data/certificates.ts`, respetando el orden (más reciente arriba):
   - `title.es` tal cual el diploma; `title.en` traducción.
   - `verifyUrl` **solo** si hay un link real en el diploma o la plataforma (Platzi, Udemy,
     Credly). Nunca uno construido a mano.
   - `related` si es preparación de otra certificación (o al revés).
5. Descripción "lo que aprendí" en `about.certificates.descriptions` de `es.ts` y `en.ts`.
   Debe salir del temario o del diploma, o pídesela a Dereck. Si no hay fuente, márcala como
   borrador al reportar.
6. Si cae dentro de un puesto, aparece sola en el Gantt y en `/experience` (lo calcula
   `lib/experience.ts`): revisa que se vea bien.
7. `/verificar`. Muestra el resultado y espera la revisión antes de commitear.
