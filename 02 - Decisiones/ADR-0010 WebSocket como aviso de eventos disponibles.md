---
tipo: ADR
id: ADR-0010
estado: decidido
fecha: 2026-06-23
---

# ADR-0010 WebSocket como aviso de eventos disponibles

## Contexto

El sistema necesita reflejar cambios entre dispositivos con baja latencia, pero la sincronizacion debe seguir siendo confiable aunque un dispositivo pierda conexion, se cierre la app o no reciba un mensaje en tiempo real.

Enviar eventos completos por WebSocket como mecanismo principal duplicaria responsabilidades con `/sync/pull` y podria crear diferencias si un aviso se pierde.

## Decision

El WebSocket se usara solo como aviso de eventos disponibles.

El servidor emitira un aviso despues de aceptar y persistir eventos, indicando el ultimo `server_sequence` disponible. Los dispositivos que reciban el aviso ejecutaran `/sync/pull` desde su `last_full_pull_server_sequence`.

## Consecuencias

- La fuente de verdad sigue siendo `events` en el servidor.
- Los eventos completos viajan por `/sync/pull`.
- Perder un mensaje WebSocket no implica perdida de datos.
- El cliente puede compactar varios avisos en un solo pull.
- La UI sigue observando SQLite local; no escucha eventos de socket directamente.

## Enlaces

- [[04 - Sincronizacion/Tiempo real con WebSocket|Tiempo real con WebSocket]]
- [[04 - Sincronizacion/Flujo push pull|Flujo push pull]]
- [[06 - API/Endpoints sync|Endpoints sync]]
