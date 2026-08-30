---
tipo: datos
estado: borrador
actualizado: 2026-07-08
---

# Auditoria

## Fuente principal

La auditoria principal vive en `events`.

Cada evento debe responder:

- Quien hizo la accion?
- Desde que dispositivo?
- Que accion hizo?
- Sobre que entidad?
- Cuando ocurrio localmente?
- Cuando la acepto el servidor?
- Que datos llevaba?

En modo `standalone`, no existira fecha de aceptacion del servidor. La auditoria debe responder con fecha local, dispositivo, usuario local y metadatos de respaldo cuando aplique.

En modo `server_sync`, la auditoria debe incluir tambien `server_sequence` y `created_at_server`.

## Auditoria resumida

Las tablas de lectura pueden guardar campos resumidos:

```text
created_by_user_id
created_by_device_id
created_at_local
created_at_server
updated_by_user_id
updated_by_device_id
updated_at_server
created_event_id
last_event_id
last_server_sequence
version
```

En `standalone`, los campos de servidor pueden permanecer nulos. No deben interpretarse como falta de auditoria.

Para registros cancelables o anulables:

```text
canceled_event_id
deleted_event_id
```

En dispositivos moviles, estos IDs se guardan como referencia aunque la FK hacia `events` no sea estrictamente obligatoria.

## No usar como cursor

`updated_at_server` es util para reportes y pantallas en `server_sync`, pero el cursor de sincronizacion debe ser `server_sequence`.

En `standalone`, los reportes pueden usar fecha local, recordando que no representa orden global entre dispositivos.

## Enlaces

- [[05 - Datos/Trazabilidad entre proyecciones y eventos|Trazabilidad entre proyecciones y eventos]]
- [[01 - Contexto/Modos de operacion|Modos de operacion]]
