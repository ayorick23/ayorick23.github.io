---
paths:
  - "src/components/views/AboutView.astro"
  - "src/components/Certificates.astro"
  - "src/components/Education.astro"
  - "src/scripts/certificates.ts"
  - "src/scripts/education.ts"
  - "src/data/certificates.ts"
  - "src/data/education.ts"
  - "scripts/render-certificates.py"
  - "public/certificates/**"
  - "src/assets/certificates/**"
---

# Sobre mí: educación y certificados

Para agregar un certificado usa `/nuevo-certificado`.

## Certificados (`Certificates.astro` + `certificates.ts`)

Carrusel vertical tipo "caja de vinilos" (referencia: pin de Pinterest LE:MA, solo los
primeros 5 s). Dereck ya dijo que quiere reemplazarlo en el rediseño de "Sobre mí"
(`docs/roadmap.md`); mientras exista:

- Las tarjetas se inclinan **hacia adelante** (`rotateX` negativo, borde superior hacia el
  espectador), no hacia atrás: ya se corrigió una vez. Al copiar una referencia 3D, revisar
  cuadro a cuadro el sentido del trapecio.
- Escenario de altura fija con ~7 tarjetas; posición por cuadro en JS según la distancia `d`
  al índice enfocado (continuo, con resorte). "Lugar del medio" fijo (2 arriba, el resto
  abajo acercándose): al abrir, la tarjeta pasa al medio y se endereza/crece; al cerrar se
  queda en el medio (pedido de Dereck, no devolverla arriba).
- Animaciones deliberadamente lentas (easing corregido por tiempo real, `ease()`).
- El panel solo cambia de contenedor si cambia de host: reinsertarlo reinicia su animación y
  parpadeaba. Vive en la columna izquierda (escritorio) o bajo el escenario (móvil).
- Rueda (solo dentro del escenario; en los extremos vuelve a desplazar la página), arrastre,
  flechas o botones ↑↓; estando abierto, recorrer cambia el certificado abierto.
- `perspective` debe ir en `.dm-stage__list` (padre directo de las tarjetas) o no hay 3D.
- Orden: más reciente arriba.

## Datos y archivos

- PDF en `public/certificates/{id}.pdf` (sin espacios ni tildes); imagen de la pila en
  `src/assets/certificates/{id}.jpg` generada con `python scripts/render-certificates.py`
  (requiere `pip install pymupdf`). `id` = nombre del archivo.
- `title` es `{ es, en }`: `es` tal cual el diploma, `en` traducción. Descripciones "lo que
  aprendí" en `about.certificates.descriptions` de cada diccionario. `verifyUrl` solo con link
  real (Platzi, Udemy, Credly); `related` enlaza preparación ↔ certificación.
- Los tests de contenido exigen PDF + JPG + descripción en ambos idiomas.

## Educación (`Education.astro`)

Barra de progreso de la carrera; el punto "Hoy" se recalcula en el cliente para no quedar
congelado entre deploys. Nombre del título técnico provisional (ver roadmap).
