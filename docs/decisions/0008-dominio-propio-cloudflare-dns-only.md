# 0008. Dominio propio en Cloudflare (solo DNS) sobre GitHub Pages

**Estado:** Aceptada
**Fecha:** 2026-10-21 (registrada retroactivamente el 2026-11-20)

## Contexto

El sitio vivía en `ayorick23.github.io`. Un dominio con el nombre de Dereck se ve más
profesional en un CV y no depende del usuario de GitHub.

## Decisión

`dereckmendez.com` registrado en Cloudflare Registrar, con DNS en Cloudflare apuntando a
GitHub Pages. Todos los registros con la nube gris ("DNS only"). El sitio sigue alojado y
desplegado igual que antes.

## Alternativas consideradas

- **Proxy de Cloudflare (nube naranja):** GitHub no puede emitir el certificado HTTPS.
- **Mudar el hosting a Cloudflare Pages:** sin necesidad; el deploy actual funciona.

## Por qué

Cambia solo el nombre, sin tocar el hosting ni el pipeline de deploy.

## Consecuencias

- `ayorick23.github.io` redirige solo al dominio nuevo; los links viejos no se rompen.
- El dominio se configura en Settings → Pages; no hace falta `public/CNAME`.
- La URL está escrita en cuatro lugares (regla `ci-deploy`): si cambia, se tocan todos.
- Cabeceras de seguridad propias (CSP) quedan limitadas por GitHub Pages.
