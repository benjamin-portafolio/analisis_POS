---
tipo: api
estado: borrador
actualizado: 2026-08-19
---

# Endpoints sync

Estos endpoints aplican solo al modo `server_sync`. En modo `standalone`, la
app no debe requerirlos para operar: usa el core local y el mecanismo
obligatorio de respaldo/restauracion mediante Google Drive. Drive no consume
estos endpoints ni actua como servidor de sincronizacion.

## GET /sync/health

Comprueba que el servidor de sincronizacion esta disponible y que habla una
version compatible del protocolo.

### Response

```json
{
  "status": "ok",
  "api_version": 1,
  "latest_server_sequence": 9300,
  "server_time": "2026-06-09T20:31:05Z"
}
```

### Regla

El cliente usa este endpoint para detectar disponibilidad del servidor. Si la
respuesta es correcta, cancela el backoff, resetea los reintentos y puede
iniciar pull/push segun corresponda.

## POST /sync/bootstrap

Inicializa un dispositivo sin registros locales. Devuelve un snapshot del estado actual y el cursor inicial desde donde el dispositivo continuara con `pull`.

### Request

```json
{
  "device_id": "device_tablet_03",
  "bootstrap_token": "one_time_token"
}
```

### Response

```json
{
  "snapshot_sequence": 150000,
  "server_time": "2026-06-09T20:31:05Z",
  "catalog": [],
  "categories": [],
  "units": [],
  "users": [],
  "roles": [],
  "devices": [],
  "open_sales": [],
  "open_orders": [],
  "open_cash_sessions": [],
  "inventory_balances": [],
  "settings": {}
}
```

### Regla

El snapshot de `units` debe contener IDs/codigos estables, dimension,
`atomic_factor`, `max_fraction_digits` y estado. El cliente valida que coincide
con las unidades de referencia soportadas antes de habilitar ventas medidas o
capturas de inventario; nunca reconstruye factores desde nombres o simbolos.

El dispositivo debe guardar:

```text
last_full_pull_server_sequence = snapshot_sequence
```

Despues debe continuar con:

```http
GET /sync/pull?device_id=device_tablet_03&since=150000&limit=500
```

## POST /sync/preflight

Endpoint estandar antes del push. Devuelve eventos recientes que pueden impactar los eventos pendientes del dispositivo.

### Request

```json
{
  "device_id": "device_tablet_01",
  "last_full_pull_server_sequence": 9184,
  "max_events": 500,
  "pending_refs": [
    {
      "event_id": "evt_local_1",
      "event_type": "espacio_actualizado",
      "aggregate_type": "espacio",
      "aggregate_id": "esp_123",
      "base_server_sequence": 9184,
      "base_version": 4,
      "changed_fields": ["nombre"],
      "refs": [
        {
          "type": "espacio",
          "id": "esp_123",
          "relationship": "affects"
        },
        {
          "type": "field",
          "id": "espacio:esp_123:nombre",
          "relationship": "changes"
        }
      ]
    }
  ]
}
```

### Campos request

| Campo | Significado |
|---|---|
| `device_id` | Dispositivo que solicita la prevalidacion |
| `last_full_pull_server_sequence` | Ultima secuencia aplicada por `/sync/pull`; el preflight busca eventos posteriores |
| `max_events` | Limite de eventos impactantes que el servidor puede devolver |
| `pending_refs` | Eventos pendientes y referencias necesarias para detectar choques |
| `pending_refs[].changed_fields` | Columnas que modifica el evento pendiente, obligatorio para eventos de actualizacion |
| `pending_refs[].refs` | Referencias de agregado, claves unicas, campos, padres o reglas globales usadas por el pendiente |

### Response

```json
{
  "events": [
    {
      "event_id": "evt_remote_9",
      "event_type": "espacio_actualizado",
      "aggregate_type": "espacio",
      "aggregate_id": "esp_123",
      "server_sequence": 9299,
      "payload": {
        "changed_fields": ["visibilidad"],
        "changes": {
          "visibilidad": {
            "from": "sin_restriccion",
            "to": "solo_restringido"
          }
        }
      }
    }
  ],
  "preflight_sequence": 9300,
  "has_more": false,
  "requires_full_pull_before_push": false,
  "reason": null
}
```

### Campos response

| Campo | Significado |
|---|---|
| `events` | Eventos aceptados por servidor que pueden afectar pendientes locales |
| `preflight_sequence` | Secuencia maxima considerada por el servidor en esta prevalidacion |
| `has_more` | Hay mas eventos impactantes que `max_events` |
| `requires_full_pull_before_push` | El cliente debe hacer pull completo antes de push |
| `reason` | Motivo cuando la prevalidacion no basta, por ejemplo `too_many_impacting_events`, `cursor_too_old` o `global_rules_changed` |

### Regla

`preflight_sequence` no reemplaza `last_full_pull_server_sequence`. El cursor completo solo avanza con `GET /sync/pull`.

Si `requires_full_pull_before_push = true`, el cliente no debe enviar pendientes automaticamente. Primero debe ejecutar `/sync/pull`, aplicar eventos, revalidar pendientes y despues decidir que eventos siguen listos para push.

## POST /sync/push

Recibe eventos pendientes de un dispositivo.

El cliente debe enviar solo eventos reclasificados como `ready_to_push`. Eventos en `conflict`, `needs_user_review`, `pending_external_confirmation` o `rejected_locally` no deben subirse automaticamente.

### Request

```json
{
  "device_id": "device_tablet_01",
  "last_full_pull_server_sequence": 9184,
  "last_preflight_server_sequence": 9300,
  "events": []
}
```

`last_preflight_server_sequence` es informativo y permite auditar contra que revision ligera se revalidaron los pendientes. No sustituye la validacion oficial del servidor ni el cursor de pull completo.

### Response

```json
{
  "results": [
    {
      "event_id": "evt_01J...",
      "status": "accepted",
      "server_sequence": 9185,
      "created_at_server": "2026-06-09T20:31:05Z"
    },
    {
      "event_id": "evt_01K...",
      "status": "conflict",
      "server_sequence": 9186,
      "created_at_server": "2026-06-09T20:31:06Z",
      "conflict_id": "conf_001",
      "default_winner_event_id": "evt_01J...",
      "reason": "Ya existe un espacio con identificacion terraza."
    }
  ],
  "server_time": "2026-06-09T20:31:05Z"
}
```

### Campos result

| Campo | Significado |
|---|---|
| `event_id` | Evento enviado por el dispositivo |
| `status` | `accepted`, `duplicate`, `rejected` o `conflict` |
| `server_sequence` | Secuencia asignada al evento persistido; puede ser `null` si el evento fue rechazado antes de guardarse |
| `created_at_server` | Fecha de recepcion del evento persistido |
| `conflict_id` | Caso administrativo de conflicto, solo cuando `status = conflict` |
| `default_winner_event_id` | Evento que permanece como version oficial por defecto |
| `reason` | Motivo legible del rechazo o conflicto |

### Regla de duplicados

Si llega de nuevo un `event_id` ya persistido, el servidor no debe responder `duplicate` como sinonimo de aceptado sin revisar el estado original. Debe devolver informacion suficiente para que el cliente conserve el estado correcto.

```text
Evento original synced   -> duplicate con estado efectivo synced
Evento original conflict -> conflict o duplicate con original_sync_status = conflict
Evento original rejected -> rejected o duplicate con original_sync_status = rejected
```

El cliente no debe convertir automaticamente cualquier `duplicate` en `synced` si el servidor informa que el evento original estaba `conflict` o `rejected`.

## POST /sync/conflicts/report

Reporta al servidor un evento que el dispositivo marco localmente como conflicto despues de `/sync/preflight` o `/sync/pull`. Este endpoint no aplica el evento a las tablas oficiales; solo lo conserva en `events`, crea o reutiliza `sync_conflicts` y agrega participantes.

### Request

```json
{
  "device_id": "device_tablet_01",
  "detected_after_server_sequence": 9300,
  "conflict_reason": "Identificacion unica ya usada.",
  "related_refs": [
    {
      "type": "espacio_identificacion",
      "id": "terraza",
      "relationship": "requires_unique"
    }
  ],
  "related_event_ids": ["evt_online_001"],
  "event": {
    "event_id": "evt_offline_999",
    "aggregate_type": "espacio",
    "aggregate_id": "esp_offline_999",
    "event_type": "espacio_creado",
    "device_id": "device_tablet_01",
    "user_id": "user_01",
    "local_sequence": 15,
    "base_server_sequence": 9184,
    "base_version": null,
    "created_at_local": "2026-06-09T19:50:00Z",
    "payload": {
      "nombre": "Terraza VIP",
      "identificacion": "terraza",
      "visibilidad": "sin_restriccion"
    }
  }
}
```

### Response

```json
{
  "event_id": "evt_offline_999",
  "status": "conflict",
  "server_sequence": 9301,
  "created_at_server": "2026-06-09T20:31:05Z",
  "conflict_id": "conf_001",
  "default_winner_event_id": "evt_online_001",
  "server_time": "2026-06-09T20:31:05Z"
}
```

### Regla

El dispositivo debe usar este endpoint para conflictos locales con:

```text
sync_status = conflict
server_sequence = null
```

Al recibir respuesta exitosa, conserva `sync_status = conflict` y guarda `server_sequence`, `created_at_server` y `conflict_id` si tiene almacenamiento local para ese dato.

## GET /sync/pull

Descarga eventos aceptados por el servidor.

```http
GET /sync/pull?device_id=device_tablet_01&since=9184&limit=500
```

### Response

```json
{
  "events": [],
  "next_cursor": 9300,
  "has_more": false
}
```

### Regla

Este endpoint es el unico que actualiza `last_full_pull_server_sequence`.

`/sync/pull` solo descarga eventos `synced`, porque son los unicos que deben aplicarse automaticamente a las proyecciones locales. Los eventos `conflict` se consultan mediante endpoints administrativos o se conocen por la respuesta de `/sync/push` y `/sync/conflicts/report`.

## GET /sync/conflicts

Endpoint administrativo para listar casos de conflicto abiertos o historicos.

```http
GET /sync/conflicts?status=open&limit=100
```

### Response

```json
{
  "conflicts": [
    {
      "conflict_id": "conf_001",
      "conflict_type": "unique_key_conflict",
      "ref_type": "espacio_identificacion",
      "ref_id": "terraza",
      "status": "open",
      "default_winner_event_id": "evt_online_001",
      "participants": [
        {
          "event_id": "evt_online_001",
          "aggregate_id": "esp_online_001",
          "role": "winner"
        },
        {
          "event_id": "evt_offline_999",
          "aggregate_id": "esp_offline_999",
          "role": "conflicted_candidate"
        }
      ]
    }
  ],
  "has_more": false
}
```

La resolucion administrativa debe generar un evento nuevo de resolucion o compensacion; no debe editar silenciosamente eventos historicos.

## WebSocket sync

El canal WebSocket sirve para avisar que hay eventos aceptados disponibles. No reemplaza `/sync/pull`.

### Cliente -> servidor

```text
sync:join
```

```json
{
  "device_id": "device_tablet_01",
  "store_id": "store_01",
  "last_full_pull_server_sequence": 9184
}
```

### Servidor -> cliente

```text
sync:events_available
```

```json
{
  "latest_server_sequence": 9301,
  "event_types": ["espacio_creado"],
  "source_device_id": "device_tablet_02"
}
```

### Regla

- El servidor emite `sync:events_available` despues de aceptar y persistir eventos.
- El cliente que recibe el aviso debe llamar `/sync/pull?since=last_full_pull_server_sequence`.
- El aviso WebSocket no avanza cursores.
- Si el aviso se pierde, el siguiente pull o reconexion recupera los eventos por `server_sequence`.

## POST /sync/ack

Opcional. Confirma que el dispositivo aplico eventos recibidos.

```json
{
  "device_id": "device_tablet_01",
  "last_applied_server_sequence": 9300,
  "checkpoint_type": "full_pull"
}
```

## Pendiente

- Definir si `ack` es necesario para MVP o si basta con checkpoint local.
- Definir si `/sync/bootstrap` devuelve todo el snapshot en una respuesta o por lotes.
- Definir umbrales para que `/sync/preflight` solicite pull completo antes del push.

## Especificaciones modulares relacionadas

- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[03 - Dominio/Modulos/Categorias|Modulo Categorias]]
