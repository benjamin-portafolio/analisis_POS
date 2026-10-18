---
tipo: datos
estado: borrador
actualizado: 2026-10-04
---

# Eventos

La tabla `events` existe en ambos modos de operacion:

- En `standalone`, registra trazabilidad local, auditoria, respaldo/restauracion y posible migracion futura.
- En `server_sync`, ademas alimenta push/pull, idempotencia, conflictos y orden global.

## Tabla `events`

| Campo                  | Tipo     | Obligatorio | Comentario                              |
| ---------------------- | -------- | ----------: | --------------------------------------- |
| `event_id`             | text     |          si | ID unico global                         |
| `aggregate_type`       | text     |          si | `sale`, `inventory`, `product`, etc.    |
| `aggregate_id`         | text     |          si | ID del agregado afectado                |
| `event_type`           | text     |          si | Tipo de evento                          |
| `device_id`            | text     |          si | Dispositivo origen                      |
| `user_id`              | text     |          si | Usuario origen                          |
| `local_sequence`       | integer  |          si | Orden local por dispositivo             |
| `server_sequence`      | integer  |          no | Asignado por servidor                   |
| `base_server_sequence` | integer  |          no | Cursor conocido al generar evento       |
| `base_version`         | integer  |          no | Version conocida de entidad mutable     |
| `created_at_local`     | datetime |          si | Fecha del dispositivo                   |
| `created_at_server`    | datetime |          no | Fecha de aceptacion                     |
| `payload`              | json     |          si | Datos del evento                        |
| `sync_status`          | text     |          si | Estado de entrega/validacion segun modo |
| `rejection_reason`     | text     |          no | Motivo de rechazo o conflicto           |

## Indices sugeridos

```sql
create unique index ux_events_event_id on events(event_id);
create index ix_events_server_sequence on events(server_sequence);
create index ix_events_aggregate on events(aggregate_type, aggregate_id);
create index ix_events_sync_status on events(sync_status);
```

## Estados de sincronizacion por modo

En modo `server_sync`, los valores esperados son:

```text
pending
synced
rejected
conflict
```

En modo `standalone`, el evento no necesita validacion de servidor. La implementacion separa el estado de aplicacion local y el estado de entrega remota:

```text
application_status = applied | failed
delivery_status = not_required | pending | delivered | rejected | conflict
```

Los eventos standalone se guardan con `application_status = applied` y `delivery_status = not_required`. La UI no debe interpretarlos como pendientes ni convertirlos automaticamente en eventos sincronizables.

## Tabla auxiliar `event_refs`

Para prevalidacion y busquedas eficientes, cada evento puede generar referencias indexadas:

| Campo | Tipo | Comentario |
|---|---|---|
| `event_ref_id` | text | ID unico |
| `event_id` | text | Evento relacionado |
| `ref_type` | text | `sale`, `product`, `sku`, `user`, `role`, `cash_session`, etc. |
| `ref_id` | text | Identificador de referencia |
| `relationship` | text | `affects`, `uses`, `requires_unique`, etc. |
| `server_sequence` | integer | Secuencia del evento |
| `source` | text | `server` o `local_pending` |

Ejemplo:

```text
producto_creado
  ref product prod_123 affects
  ref sku ABC-001 requires_unique
  ref category cat_001 uses
  ref inventory_item inv_001 uses
```

Referencias de inventario implementadas:

```text
recurso_inventario_creado
  ref inventory_item <inventory_item_id> affects
  ref unit <default_unit_id> uses
  ref inventory_movement <movement_id> affects   # solo si hay saldo inicial

recurso_inventario_actualizado
  ref inventory_item <inventory_item_id> affects

movimiento_inventario_registrado
  ref inventory_item <inventory_item_id> affects
  ref inventory_movement <movement_id> affects
```

El cambio de nombre y el movimiento son eventos separados. Cuando nacen de un
mismo guardado, el segundo declara en `payload.base_event_id` al primero y usa
la versión resultante. `created_at_local` no determina el orden oficial: el
servidor los acepta en orden causal y asigna `server_sequence`.

Cuando el artículo crea el recurso en el mismo comando, el payload declara
además `depends_on_event_id` hacia `recurso_inventario_creado`. En
`server_sync`, push entrega primero el recurso; en `standalone` se aplican ambos
eventos localmente sin persistir estas referencias.

En dispositivos `server_sync`, las referencias de eventos pendientes pueden existir con `server_sequence = null` y `source = local_pending`.

En modo `standalone`, los command services declaran y validan `LocalEventRef`, pero `DriftLocalEventStore` no las persiste en `event_refs`. La tabla es metadato de preflight y conflictos; el agregado principal ya queda identificado en `events.aggregate_type` y `events.aggregate_id`.

Si se diseña una importacion futura de historial standalone a servidor, ese flujo debe reconstruir las referencias a partir del tipo de evento y su payload antes de cualquier preflight o validacion. La operacion normal no debe conservar referencias sin consumidor solo para anticipar esa posibilidad.

En servidor, los eventos `conflict` tambien deben generar `event_refs`. Esas referencias permiten agruparlos con el evento ganador y con otros candidatos dentro de `sync_conflicts`, aunque el evento conflictivo no se aplique a las tablas oficiales de lectura.

## Reglas

### Registro histórico previo: contrato y estado parcial — 2026-10-04

Alta/descarte tipados y fixtures están implementados en Dart/TS. El servidor
conserva procedencia, deriva memoria y rechaza el descarte por push (PG real).
Flutter no tiene todavía emisor/handler de descarte ni memoria derivada/undo
exacto comprobados: las reglas siguientes son el resultado requerido. Ver [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-prerrequisitos-fase5/Resultados|Auditoría de entrada a fase 5, 2026-10-04]].

ADR-0017 extiende `recurso_inventario_creado` con procedencia opcional y define
`recurso_inventario_descartado`, exclusivamente standalone, después de la edición
que desvincula, en un lote atómico. El descarte conserva eventos y nunca elimina
movimientos; su evidencia impide resucitar el recurso con una alta antigua.
Se declaran referencias de recurso/producto/variante y no se persisten en local.

Server_sync no emite ni aplica descartes; mantiene recurso/balance para ventas
tardías. La memoria se deriva de eventos de producto y se restaura con sus
conflictos. Contratos y referencias exactas:
[[08 - Roadmap/Seguimiento de existencias/Contrato funcional y de eventos|Contrato de seguimiento, revisión 1]].

### Reglas generales

- No editar eventos aceptados.
- No borrar eventos necesarios para sincronizacion, auditoria, respaldo o migracion.
- Los handlers deben ser idempotentes.
- Un dispositivo nuevo no debe descargar todo el historial; debe iniciar desde un snapshot. Ver [[04 - Sincronizacion/Inicializacion de nuevos dispositivos|Inicializacion de nuevos dispositivos]].
- La estrategia de retencion se documenta en [[05 - Datos/Crecimiento y retencion de eventos|Crecimiento y retencion de eventos]].
- Los eventos mutables deben incluir base conocida para detectar conflictos.
- En modo `server_sync`, el preflight usa `event_refs` para decidir que eventos remotos pueden impactar eventos pendientes.
- En modo `standalone`, no persistir `event_refs`; conservar unicamente su declaracion y validacion en los comandos.
- En modo `server_sync`, los eventos `conflict` no se descargan por `/sync/pull` como eventos aplicables; se consultan o reportan por el flujo de conflictos.

## Enlaces

- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[01 - Contexto/Modos de operacion|Modos de operacion]]
- [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011 Dos modos de app sobre el mismo core offline first]]

## Estado actualizado del seguimiento — corrección de fase 3, 2026-10-04

La auditoría inicial fallida se conserva como historial. El core Flutter ahora
mantiene memoria por eventos, recupera el mismo recurso con historial, descarta
solo standalone elegible con rollback/replay comprobados y restaura memoria exacta.
Server_sync conserva recurso/balance; transporte HTTP/PG/SQLite y pull a cliente
vacío están verificados en su alcance. UI de fase 4 y cierre de fase 5 pendientes;
no se acredita uso físico ni despliegue. Evidencia y comandos: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].
