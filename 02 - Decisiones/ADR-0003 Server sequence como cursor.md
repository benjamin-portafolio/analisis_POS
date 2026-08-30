---
tipo: ADR
id: ADR-0003
estado: decidido
fecha: 2026-06-09
---

# ADR-0003 Server sequence como cursor

## Contexto

Los relojes de los dispositivos pueden estar mal configurados. `updated_at` no es suficiente para ordenar cambios offline.

## Decision

El servidor asignara un `server_sequence` incremental a cada evento aceptado. Los dispositivos usaran ese valor como cursor de sincronizacion.

## Consecuencias

- La sincronizacion incremental se vuelve sencilla.
- Cada dispositivo puede pedir eventos despues de su ultimo `server_sequence`.
- El orden oficial queda centralizado en el servidor.
- Los eventos locales aun pueden tener `local_sequence` para preservar el orden dentro de cada dispositivo.

## Enlaces

- [[04 - Sincronizacion/Flujo push pull|Flujo push pull]]
- [[05 - Datos/Eventos|Eventos]]

