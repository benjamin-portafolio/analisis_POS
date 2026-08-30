---
tipo: sincronizacion
estado: borrador
actualizado: 2026-07-08
---

# Idempotencia y duplicados

## Problema

Un dispositivo puede enviar el mismo evento varias veces si la conexion falla antes de recibir respuesta.

En `standalone`, el mismo principio evita duplicados locales al restaurar, reintentar comandos o importar datos. En `server_sync`, ademas evita duplicados entre cliente y servidor.

## Decision base

Cada evento tendra `event_id` unico. SQLite local y el servidor deben tener restriccion unica sobre `event_id`.

```sql
unique(event_id)
```

## Regla

Procesar dos veces el mismo evento no debe duplicar venta, item, pago ni movimiento de inventario.

## Ejemplos

### Pago duplicado

Si llega dos veces:

```text
event_id = evt_pago_001
event_type = pago_registrado
payment_id = pay_001
```

En `server_sync`, el servidor debe responder `duplicate` en el segundo intento, no crear otro pago.

En `standalone`, la restauracion/importacion debe ignorar o fusionar por `event_id` sin duplicar efectos.

### Item duplicado

`sale_item_id` tambien debe ser unico. Aunque falle la validacion por `event_id`, no debe duplicarse la linea.

## Protecciones recomendadas

- `events.event_id` unico.
- `payments.payment_id` unico.
- `sale_items.sale_item_id` unico.
- `inventory_movements.movement_id` unico.
- Handlers que revisan existencia antes de insertar.
