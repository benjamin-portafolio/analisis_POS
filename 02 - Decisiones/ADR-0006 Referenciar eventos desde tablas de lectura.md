---
tipo: ADR
id: ADR-0006
estado: decidido
fecha: 2026-06-09
---

# ADR-0006 Referenciar eventos desde tablas de lectura

## Contexto

Las tablas de lectura como `sales`, `sale_items` y `payments` representan el estado actual calculado desde eventos. Para auditoria, depuracion e idempotencia conviene saber que evento creo o modifico por ultima vez cada registro.

## Decision

Las tablas principales de lectura guardaran referencias al evento que las creo y al ultimo evento que modifico su estado.

Campos base:

```text
created_event_id
last_event_id
last_server_sequence
```

En tablas cancelables o anulables se podran agregar campos especificos:

```text
canceled_event_id
deleted_event_id
```

En tablas append-only, como movimientos de inventario, normalmente bastara con:

```text
event_id
server_sequence
```

## Decision para dispositivos moviles

En los dispositivos se guardara el ID del evento relacionado, pero la llave foranea hacia `events` no sera estrictamente necesaria. Esto permite purgar eventos sincronizados antiguos sin romper las tablas locales de lectura.

En el servidor, la integridad debe ser mas fuerte y puede usarse llave foranea o validacion equivalente.

## Consecuencias

- Es mas facil auditar por que un registro quedo en cierto estado.
- Es mas facil depurar diferencias de sincronizacion.
- Se puede saber hasta que evento esta aplicada una proyeccion.
- Las tablas locales pueden conservar trazabilidad aunque el evento ya no exista localmente.
- Se requiere mantener estos campos correctamente dentro de cada handler.

## Regla practica

```text
Tablas mutables:
  created_event_id
  last_event_id
  last_server_sequence

Tablas cancelables:
  created_event_id
  canceled_event_id
  last_event_id
  last_server_sequence

Tablas append-only:
  event_id
  server_sequence
```

## Enlaces

- [[05 - Datos/Trazabilidad entre proyecciones y eventos|Trazabilidad entre proyecciones y eventos]]
- [[05 - Datos/Tablas de lectura|Tablas de lectura]]
- [[05 - Datos/Eventos|Eventos]]

