---
tipo: datos
estado: borrador
actualizado: 2026-07-08
---

# Trazabilidad entre proyecciones y eventos

## Objetivo

Conectar las tablas de estado actual con los eventos que originaron o modificaron ese estado.

La trazabilidad aplica a `standalone` y `server_sync`. La diferencia es que `last_server_sequence` puede quedar nulo en `standalone`.

La tabla `events` responde:

```text
Que ocurrio?
```

Las tablas de lectura responden:

```text
Como quedo actualmente?
```

Los campos de trazabilidad conectan ambas respuestas.

## Campos recomendados

### Tablas mutables

Ejemplos: `sales`, `products`, `kitchen_tickets`.

```text
created_event_id
last_event_id
last_server_sequence
version
```

En modo `standalone`, `last_event_id` y `version` son suficientes para trazabilidad local. En modo `server_sync`, `last_server_sequence` permite saber hasta que orden oficial fue proyectado.

### Tablas cancelables

Ejemplos: `sale_items`, `payments`.

```text
created_event_id
canceled_event_id
last_event_id
last_server_sequence
```

### Tablas append-only

Ejemplos: `inventory_movements`.

```text
event_id
server_sequence
```

## Ejemplo

```text
sales.sale_id = sale_123
sales.status = cerrada
sales.created_event_id = evt_001
sales.last_event_id = evt_006
sales.last_server_sequence = 9188
```

Lectura:

```text
La venta fue creada por evt_001.
Su estado actual quedo definido por evt_006.
La proyeccion esta aplicada hasta server_sequence 9188.
```

## Regla para servidor y dispositivos

### Servidor

El servidor debe conservar integridad fuerte. Puede usar llaves foraneas hacia `events` o validaciones equivalentes en la capa de aplicacion.

### Dispositivos moviles

El dispositivo guardara los IDs de eventos relacionados, pero la FK hacia `events` no sera estrictamente necesaria.

Motivo:

- El dispositivo puede purgar eventos sincronizados antiguos.
- Las tablas de lectura deben seguir funcionando aunque el evento historico ya no este localmente.
- El servidor conserva el historial completo o archivado.

## Uso en handlers

Cada handler debe actualizar los campos de trazabilidad.

Ejemplo:

```text
producto_agregado
  -> sale_items.created_event_id = event.event_id
  -> sale_items.last_event_id = event.event_id
  -> sale_items.last_server_sequence = event.server_sequence
  -> sales.last_event_id = event.event_id
  -> sales.last_server_sequence = event.server_sequence
```

## Beneficios

- Auditoria rapida.
- Depuracion de diferencias entre dispositivos.
- Validacion de idempotencia.
- Reconstruccion parcial.
- Identificacion del ultimo evento aplicado por registro.
- Deteccion de cambios concurrentes mediante version.

## Decision relacionada

[[02 - Decisiones/ADR-0006 Referenciar eventos desde tablas de lectura|ADR-0006 Referenciar eventos desde tablas de lectura]]
