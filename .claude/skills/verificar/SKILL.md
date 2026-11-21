---
name: verificar
description: Verifica un cambio antes de darlo por terminado — npm run verify (check + Vitest + build + Playwright) y, si el cambio es visual, la prueba en el navegador real en escritorio, móvil, ambos temas y ambos idiomas. Úsala antes de decir que algo está listo o antes de proponer un commit.
allowed-tools: Bash(git status *) Bash(git diff *) Bash(npm run *) Bash(npx astro *)
---

# Verificar un cambio

Archivos tocados:

!`git status --short`

## 1. Suite completa

Corre `npm run verify` (astro check + Vitest + build + Playwright). Si Playwright no arranca
por el puerto 4329, hay un preview huérfano: `npx astro preview stop` y repetir.

- Un test de contenido que falla tras un cambio intencional: se arregla el dato, no el test.
- Reporta los fallos con su salida. Nunca digas "listo" con la suite en rojo.

## 2. Si el cambio es visual

Compilar no alcanza. Prueba en el navegador (`npm run dev`, `localhost:4321`):

- [ ] Si tocaste `src/assets/icons/`: `npx astro dev stop` + `npm run dev` antes de mirar.
- [ ] Escritorio y móvil (< 640px). `resize_window` de la extensión de Chrome no cambia el
      viewport real en esta máquina: usa un `<iframe>` del mismo origen al ancho deseado, o
      mide con `getBoundingClientRect()` vía `javascript_tool`.
- [ ] Tema oscuro y claro. Dereck usa Dark Reader: si una captura se ve oscura en modo
      claro, verifica `getComputedStyle(document.documentElement).getPropertyValue('--bg')`.
- [ ] EN y ES (rutas `/` y `/es/`), y navegar entre páginas (View Transitions): el tema se
      mantiene, las animaciones de la home se repiten y no hay barridos de scroll.
- [ ] Consola sin errores.
- [ ] Las capturas sueltas (`screenshot`) a veces salen negras: prefiere la imagen que
      devuelve una acción (`scroll`, `hover`). Si ninguna sirve, dilo explícitamente en vez
      de afirmar una verificación visual que no ocurrió.

No dejes abiertas en el Chrome de Dereck páginas de laboratorio con muchos canvas.

## 3. Reporte

Qué se verificó, cómo y qué quedó sin verificar. Después **espera**: Dereck revisa y dice
explícitamente cuándo hacer commit y push.
