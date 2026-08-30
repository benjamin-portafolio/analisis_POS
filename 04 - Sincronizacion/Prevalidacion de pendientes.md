---
tipo: sincronizacion
estado: decidido
actualizado: 2026-08-19
---

# Prevalidacion de pendientes

Esta nota aplica al modo `server_sync`. En modo `standalone` no hay preflight remoto; solo validaciones locales y respaldo/restauracion.

## Objetivo

Antes de subir eventos pendientes, el dispositivo pide al servidor eventos recientes que puedan impactar esos pendientes. Esto reduce rechazos obvios y permite reclasificar cambios locales antes del push.

Flujo recomendado:

```text
preflight -> revalidar pendientes -> push -> pull completo final
```

## Por que no hacer pull completo primero

El pull completo antes del push es valido, pero no debe ser el flujo normal.

Problemas:

- Puede descargar eventos que no tienen relacion con los pendientes locales.
- Puede tardar demasiado despues de una desconexion larga.
- Puede cambiar muchas pantallas antes de intentar preservar el trabajo offline.
- Puede obligar a resolver conflictos ajenos antes de subir cambios que no chocan.
- No elimina la validacion oficial del servidor en `/sync/push`.

El pull completo se mantiene al final para sincronizar todo y avanzar `last_full_pull_server_sequence`.

## Como decide que pedir

El dispositivo envia referencias derivadas de sus eventos pendientes:

- Venta afectada.
- Producto afectado.
- Categoria afectada.
- Usuario o rol afectado.
- Caja afectada.
- Configuracion afectada.
- SKU, codigo de barras, folio u otra clave unica.
- Columnas modificadas en eventos de actualizacion.

El servidor devuelve eventos posteriores al cursor completo local que puedan impactar esas referencias.

Para Articulos, SKU y codigo de barras se comparan contra el catalogo actual.

## Parametros del request

El `preflight` no recibe los mismos parametros que `/sync/pull`. El `pull` pide todos los eventos posteriores a un cursor. El `preflight` pide solo eventos posteriores al cursor que puedan afectar los pendientes locales.

| Campo | Significado |
|---|---|
| `device_id` | Dispositivo que solicita la prevalidacion |
| `last_full_pull_server_sequence` | Ultima secuencia de servidor aplicada por un pull completo |
| `max_events` | Maximo de eventos impactantes que el cliente acepta recibir en esta respuesta |
| `pending_refs` | Lista de eventos pendientes y referencias que pueden chocar o cambiar su validez |

Cada elemento de `pending_refs` debe incluir:

| Campo | Significado |
|---|---|
| `event_id` | Evento local pendiente |
| `event_type` | Tipo de evento pendiente |
| `aggregate_type` | Tipo de registro afectado |
| `aggregate_id` | Registro afectado |
| `base_server_sequence` | Secuencia conocida al capturar el evento, si aplica |
| `base_version` | Version conocida del registro, si aplica |
| `changed_fields` | Columnas que el evento intenta modificar, solo para actualizaciones |
| `refs` | Referencias de negocio: registro, clave unica, padre, caja, usuario, configuracion, etc. |

Las actualizaciones deben declarar `changed_fields` para que el servidor pueda diferenciar entre:

```text
mismo registro + misma columna = conflicto
mismo registro + columnas distintas = merge automatico
```

## Criterio general del pull ligero

Un evento del servidor debe incluirse en el preflight si cumple:

```text
server_sequence > last_full_pull_server_sequence
AND
puede cambiar la validez, interpretacion o prioridad de algun evento pendiente
```

El preflight no busca "todo lo nuevo". Busca "lo nuevo que puede afectar mis pendientes".

## Condiciones de inclusion

Un evento entra al pull ligero si cumple al menos una condicion:

| Condicion | Ejemplo |
|---|---|
| Mismo agregado | Pendiente `producto_actualizado prod_123`; servidor tiene `producto_desactivado prod_123` |
| Misma referencia de negocio | Pendiente usa `sku ABC-001`; servidor creo otra variante con `sku ABC-001` |
| Entidad padre relacionada | Pendiente crea producto en `categoria cat_01`; servidor modifico `cat_01` despues de la base conocida |
| Entidad hija relevante | Pendiente cierra venta; servidor recibio nuevo pago o item de esa venta |
| Estado bloqueante | Pendiente agrega item; servidor cancelo o cerro la venta |
| Permiso o rol relacionado | Pendiente fue creado por usuario cuyo rol cambio o permiso fue revocado |
| Configuracion usada por el pendiente | Pendiente calcula impuesto; servidor cambio regla de impuesto |
| Caja relacionada | Pendiente registra movimiento; servidor cerro la caja |
| Inventario relacionado | Pendiente vende o ajusta un recurso; servidor tiene movimientos posteriores del `inventory_item` |
| Clave unica relacionada | Pendiente crea usuario, SKU, codigo de barras o folio; servidor ya uso esa clave |
| Evento global critico | Cambio de moneda, impuestos, permisos globales, folios o modo de operacion |

## Condiciones por tipo de pendiente

| Evento pendiente | Eventos que debe traer el preflight |
|---|---|
| `espacio_creado` | Eventos con la misma `espacio_identificacion` si esa clave debe ser unica |
| `espacio_actualizado` | Cambios posteriores del mismo espacio y, si aplica, de las mismas columnas modificadas |
| `producto_agregado` | Cambios de venta, variante, precio y producto |
| `pago_registrado` | Pagos, cancelaciones, cierre de venta, cambios de caja y metodos de pago |
| `venta_cerrada` | Nuevos items, pagos, cancelaciones o cambios de estado de la venta |
| `producto_creado` | Eventos con SKU/codigo de barras, categoria y unidad de venta usada |
| `producto_actualizado` | Cambios posteriores del mismo producto o categoria |
| `producto_desactivado` | Ventas abiertas con el producto, cambios del producto y conflictos de catalogo |
| `ajuste_manual` | Movimientos posteriores del producto, cambios de inventario o cierre de periodo |
| `movimiento_caja_registrado` | Estado de caja, cierre de caja, corte preliminar, permisos de caja |
| `corte_caja_preliminar_generado` | Ventas/pagos pendientes de la caja y movimientos posteriores |
| `usuario_actualizado` | Cambios del usuario, rol, permisos y claves unicas |
| `rol_actualizado` | Cambios concurrentes del rol y permisos globales |
| `configuracion_actualizada` | Cambios de configuracion de la misma instalacion y eventos globales criticos |

## Condiciones de exclusion

Un evento no debe incluirse en preflight si:

- `server_sequence <= last_full_pull_server_sequence`.
- No comparte agregado, referencia ni regla global con ningun pendiente.
- Solo afecta ventas, productos, usuarios o cajas no referenciadas por pendientes.
- Es informativo y no cambia reglas, permisos, estados ni unicidad.

Estos eventos llegaran en el pull completo final.

## Eventos globales criticos

Algunos eventos pueden impactar muchos pendientes aunque no compartan `aggregate_id`.

Ejemplos:

- `impuesto_actualizado`
- `metodo_pago_desactivado`
- `permiso_revocado`
- `rol_actualizado`
- `configuracion_actualizada`
- `folio_configurado`
- `caja_cerrada` si afecta el punto operativo del dispositivo
- `periodo_inventario_cerrado`

Estos eventos deben indexarse en `event_refs` con un scope claro, por ejemplo:

```text
ref_type = settings_scope
ref_id = store_01
relationship = affects_rules
```

## Cuando escalar a pull completo antes del push

El servidor o el cliente deben escalar a pull completo antes del push si:

- El numero de eventos impactantes supera el limite del preflight.
- El dispositivo tiene un atraso mayor al umbral permitido.
- El cursor esta fuera de la ventana retenida para preflight.
- Hay cambios globales de alto riesgo: impuestos, permisos, moneda, folios o cierre de caja.
- No se pueden calcular referencias confiables para los pendientes.

## Ejemplo de request

```json
{
  "device_id": "tablet_01",
  "last_full_pull_server_sequence": 9180,
  "max_events": 500,
  "pending_refs": [
    {
      "event_id": "evt_local_1",
      "event_type": "espacio_actualizado",
      "aggregate_type": "espacio",
      "aggregate_id": "esp_123",
      "base_server_sequence": 9180,
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

## Ejemplo de respuesta

```json
{
  "events": [
    {
      "event_id": "evt_remote_9",
      "event_type": "espacio_actualizado",
      "aggregate_type": "espacio",
      "aggregate_id": "esp_123",
      "server_sequence": 9185,
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
  "preflight_sequence": 9185,
  "has_more": false,
  "requires_full_pull_before_push": false,
  "reason": null
}
```

## Campos de respuesta

| Campo | Significado |
|---|---|
| `events` | Eventos remotos aceptados que pueden afectar los pendientes locales |
| `preflight_sequence` | Secuencia maxima considerada por el servidor al calcular la respuesta |
| `has_more` | Indica que habia mas eventos impactantes que el limite solicitado |
| `requires_full_pull_before_push` | Indica que el cliente no debe hacer push todavia y debe ejecutar pull completo primero |
| `reason` | Motivo operativo cuando el servidor exige pull completo o no puede prevalidar |

`events` no es equivalente al resultado de `/sync/pull`. Puede haber muchos eventos nuevos que no aparezcan aqui porque no impactan ningun pendiente. Esos eventos llegaran despues en el pull completo final.

## Aplicacion local y revalidacion

Despues de recibir el preflight, el dispositivo debe:

1. Guardar los eventos remotos recibidos como `synced`, conservando `event_id` y `server_sequence`.
2. Aplicarlos al estado local usando el mismo camino que usa `/sync/pull`.
3. Revalidar los eventos locales `pending` contra el estado local actualizado.
4. Reclasificar cada pendiente antes del push.

Estados recomendados para la reclasificacion:

| Estado | Significado |
|---|---|
| `ready_to_push` | El evento sigue siendo valido y puede subirse |
| `needs_user_review` | Requiere decision del usuario antes de subir |
| `conflict` | Choca con un evento remoto o regla oficial |
| `pending_external_confirmation` | Depende de una confirmacion externa |
| `rejected_locally` | Ya se sabe localmente que no debe subirse |

Solo los eventos `ready_to_push` deben enviarse automaticamente en `/sync/push`.

Los eventos reclasificados como `conflict` no deben perderse. Si el conflicto fue detectado localmente y el evento aun no tiene `server_sequence`, el dispositivo debe conservar el evento y reportarlo al servidor mediante `/sync/conflicts/report`.

```text
sync_status = conflict
server_sequence = null
```

significa conflicto local pendiente de reporte al servidor.

Despues de reportarlo:

```text
sync_status = conflict
server_sequence = valor_asignado_por_servidor
```

El servidor debe crear o reutilizar un `sync_conflict` y agregar el evento como participante, sin aplicar la proyeccion del candidato conflictivo.

## Ejemplos de revalidacion

### Alta con clave unica duplicada

Si el pendiente local es:

```text
espacio_creado identificacion = terraza
```

Y el preflight trae un evento remoto aceptado con la misma `espacio_identificacion`, el registro remoto del servidor es el efectivo. El pendiente local debe quedar como `conflict` o `needs_user_review`; no debe subirse automaticamente.

Si queda como `conflict`, la app debe eliminar u ocultar la proyeccion local creada por ese evento y reportar el conflicto al servidor para que un administrador vea ambos candidatos.

### Actualizaciones de columnas distintas

Si el servidor ya acepto:

```text
espacio_actualizado esp_123 changed_fields = [visibilidad]
```

Y el pendiente local es:

```text
espacio_actualizado esp_123 changed_fields = [nombre]
```

La app aplica la visibilidad remota, revalida el pendiente local y lo mantiene como `ready_to_push`, porque modifica otra columna.

### Actualizaciones de la misma columna

Si el servidor ya acepto:

```text
espacio_actualizado esp_123 changed_fields = [nombre]
```

Y el pendiente local tambien modifica `nombre`, la app debe reclasificarlo como `conflict` o `needs_user_review`.

## Regla

El preflight no avanza `last_full_pull_server_sequence`. Solo permite revalidar pendientes antes del push.

El servidor debe volver a validar en `/sync/push`.

Como el preflight no avanza el cursor global, esos eventos remotos pueden volver a llegar en el pull completo final. Los handlers deben ser idempotentes por `event_id` y no aplicar dos veces el mismo evento.

## Relacion con event refs

Para que sea eficiente, el servidor puede mantener una tabla `event_refs` que indexe las entidades afectadas por cada evento.

```text
event_id
ref_type
ref_id
relationship
server_sequence
```

Las referencias deben generarse tanto para eventos aceptados en servidor como para eventos pendientes locales. En el dispositivo, los `event_refs` locales pueden tener `server_sequence = null`.

## Decision relacionada

[[02 - Decisiones/ADR-0008 Flujo de sincronizacion con preflight antes de push|ADR-0008 Flujo de sincronizacion con preflight antes de push]]

- [[03 - Dominio/Modulos/Articulos|Aplicacion en Articulos]]
