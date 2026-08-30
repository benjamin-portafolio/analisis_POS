---
tipo: ADR
id: ADR-0002
estado: decidido
fecha: 2026-06-09
---

# ADR-0002 Sincronizacion por eventos

## Contexto

Comparar estados completos entre dispositivos genera conflictos dificiles, duplicados y perdida de trazabilidad.

## Decision

La sincronizacion se basara en eventos inmutables. Las tablas como `sales`, `sale_items` y `payments` seran proyecciones de lectura.

## Consecuencias

- Cada cambio relevante queda registrado.
- Los dispositivos envian eventos pendientes.
- El servidor valida, persiste y asigna orden oficial.
- Las vistas locales se actualizan aplicando eventos.

## Regla clave

No se editan eventos pasados. Si algo se corrige, se genera un nuevo evento compensatorio.

## Enlaces

- [[04 - Sincronizacion/Protocolo de eventos|Protocolo de eventos]]
- [[05 - Datos/Eventos|Eventos]]
- [[04 - Sincronizacion/Idempotencia y duplicados|Idempotencia y duplicados]]

