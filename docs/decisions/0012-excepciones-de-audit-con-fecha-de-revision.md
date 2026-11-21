# 0012. Excepciones de audit documentadas y con fecha de revisión

**Estado:** Aceptada
**Fecha:** 2026-11-17 (registrada retroactivamente el 2026-11-20)

## Contexto

El CI corría `npm audit --audit-level=high` sobre las dependencias de producción. Apareció
una alerta alta de `picomatch` (GHSA-fc5q-39xc-vjpf) sin parche disponible: el CI quedaba en
rojo sin nada que se pudiera arreglar.

## Decisión

`scripts/audit.mjs` (`npm run audit:ci`) bloquea las alertas altas/críticas de producción
salvo las listadas en `audit-allowlist.json`, cada una con su motivo y una fecha `reviewBy`.
Una excepción vencida también hace fallar el CI. Primera excepción: picomatch, revisar antes
del 2027-01-17.

## Alternativas consideradas

- **Bajar el umbral o quitar el audit:** dejaría pasar alertas nuevas sin que nadie las vea.
- **Ignorar el CI en rojo:** el rojo permanente deja de significar algo.

## Por qué

El CI sigue atrapando cualquier alerta nueva, y la excepción no puede quedar olvidada porque
vence.

## Consecuencias

- Agregar una excepción es una decisión de Dereck, con el riesgo explicado.
- Cerca del `reviewBy` hay que revisar si ya hay parche (o renovar la excepción con motivo).
