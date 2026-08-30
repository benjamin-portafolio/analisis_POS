---
tipo: sincronizacion
estado: decidido
actualizado: 2026-08-05
---

# Resolucion de conflictos

Esta nota aplica principalmente al modo `server_sync`, donde existe estado oficial compartido por varios dispositivos. En modo `standalone`, los conflictos globales no existen durante la operacion normal; pueden aparecer solo en una migracion/importacion posterior hacia servidor.

## Definicion

Un conflicto ocurre cuando un evento recibido no puede aplicarse limpiamente contra el estado oficial del servidor.

Para actualizaciones concurrentes de entidades mutables, la unidad de conflicto es:

```text
aggregate_type + aggregate_id + columna
```

Esto significa que no basta con que dos dispositivos editen el mismo registro. Solo hay conflicto automatico si ambos modifican la misma columna del mismo registro desde una base anterior.

Si modifican columnas distintas del mismo registro, ambos eventos pueden aceptarse y aplicarse mediante merge por columna.

Las reglas de unicidad, estado bloqueante, permisos o invariantes de negocio siguen siendo conflictos aunque no sean "misma columna del mismo registro". Ejemplos: dos altas con el mismo SKU, movimiento sobre caja cerrada o alta de espacio con identificacion unica ya usada.

## Regla para ediciones concurrentes

Cada evento de actualizacion debe declarar las columnas modificadas. El servidor compara esas columnas contra los eventos aceptados despues de la base conocida por el dispositivo.

```text
base_version o base_server_sequence = base conocida por el dispositivo
changed_fields = columnas que el evento intenta modificar
```

Resultado:

| Situacion | Resultado |
|---|---|
| Mismo registro, columnas distintas | Aceptar ambos eventos y fusionar |
| Mismo registro, misma columna | Marcar conflicto o pedir revision |
| Registro distinto | No hay conflicto por edicion concurrente |
| Misma clave unica en registros distintos | Conflicto de unicidad |
| Estado bloqueante posterior a la base | Conflicto o rechazo segun regla |

## Merge por columna

Si un evento remoto cambio `visibilidad` y un evento local pendiente cambio `nombre`, ambos pueden convivir.

```text
Base:
nombre = Terraza
visibilidad = sin_restriccion

Servidor:
visibilidad = solo_restringido

Pendiente local:
nombre = Terraza VIP

Resultado esperado:
nombre = Terraza VIP
visibilidad = solo_restringido
```

El servidor debe aceptar el evento local si, al validarlo, ninguna columna incluida en `changed_fields` fue modificada por otro evento aceptado desde la base conocida.

## Conflicto por misma columna

Si dos dispositivos cambian la misma columna del mismo registro, no se debe resolver silenciosamente con "ultimo gana".

```text
Base:
nombre = Terraza

Servidor:
nombre = Terraza Norte

Pendiente local:
nombre = Terraza VIP

Resultado esperado:
conflict o needs_user_review
```

La resolucion debe mostrar el valor oficial del servidor y el valor propuesto localmente. El usuario puede conservar servidor, usar el valor local mediante un nuevo evento de resolucion, o capturar un tercer valor.

## Alta con clave unica duplicada

Si un dispositivo crea offline un registro con una clave unica que otro dispositivo ya sincronizo, el registro aceptado por el servidor es el efectivo.

```text
Tablet A offline:
espacio_creado identificacion = terraza

Tablet B online:
espacio_creado identificacion = terraza
accepted

Tablet A al sincronizar:
conflict o needs_user_review
```

El evento local no debe perderse. Debe conservarse como pendiente en conflicto para que el usuario pueda cambiar la clave unica, descartarlo o resolverlo manualmente.

## Registro centralizado del conflicto

El evento que pierde contra el estado oficial del servidor debe conservarse en `events` con `sync_status = conflict`. No debe aplicarse a la tabla de lectura oficial, pero si debe quedar disponible para auditoria y resolucion administrativa.

El conflicto no debe modelarse como una sola columna `conflict_id` dentro de `events`, porque un evento o registro puede participar en mas de un conflicto. La relacion debe ser:

```text
events
sync_conflicts
sync_conflict_participants
event_refs
```

`event_refs` explica por que dos eventos estan relacionados. Por ejemplo, dos altas de espacio con la misma identificacion comparten:

```text
ref_type = espacio_identificacion
ref_id = terraza
relationship = requires_unique
```

`sync_conflicts` agrupa el caso administrativo:

```text
conflict_id
conflict_type = unique_key_conflict
ref_type = espacio_identificacion
ref_id = terraza
status = open
default_winner_event_id = evt_online_001
reason = Identificacion unica ya usada.
```

`sync_conflict_participants` lista todos los involucrados:

```text
conflict_id = conf_001, event_id = evt_online_001, role = winner
conflict_id = conf_001, event_id = evt_offline_999, role = conflicted_candidate
```

Un mismo `event_id` o `aggregate_id` puede estar en varios conflictos. La restriccion unica recomendada es solo:

```text
unique(conflict_id, event_id)
```

No debe existir `unique(event_id)` ni `unique(aggregate_id)` en `sync_conflict_participants`.

## Flujo servidor

Cuando el servidor recibe un evento:

1. Valida idempotencia por `event_id`.
2. Valida reglas de negocio, unicidad, estado bloqueante y permisos.
3. Si el evento es aceptado, lo guarda como `synced`, aplica la proyeccion y genera `event_refs`.
4. Si el evento no puede aplicarse pero debe conservarse, lo guarda como `conflict`, no aplica la proyeccion y genera `event_refs`.
5. Busca o crea un `sync_conflict` abierto usando la causa normalizada del choque.
6. Agrega el ganador por defecto y el candidato conflictivo en `sync_conflict_participants`.
7. Devuelve al dispositivo `status = conflict`, `conflict_id`, `default_winner_event_id` y `reason`.

Para conflictos de clave unica, la causa normalizada es:

```text
conflict_type + ref_type + ref_id
```

Ejemplo:

```text
unique_key_conflict + espacio_identificacion + terraza
```

Si otro dispositivo llega despues con la misma identificacion, el servidor no crea otro caso duplicado. Reutiliza el `sync_conflict` abierto y agrega otro participante con `role = conflicted_candidate`.

## Flujo dispositivo

El dispositivo debe distinguir dos situaciones:

1. El servidor detecta el conflicto durante `/sync/push`.
2. El dispositivo detecta el conflicto localmente despues de `/sync/preflight` o `/sync/pull`.

Si el servidor responde `conflict`, la app debe:

1. Marcar el evento local como `sync_status = conflict`.
2. Guardar `server_sequence`, `created_at_server`, `reason` y, si existe localmente, `conflict_id`.
3. Eliminar u ocultar la proyeccion local que fue creada por ese evento si choca con el registro oficial.
4. Conservar el evento y sus `event_refs` locales hasta que se resuelva o se purge segun politica.

Si el dispositivo detecta el conflicto localmente antes de subirlo, no debe enviarlo como evento normal en `/sync/push`. Debe reportarlo al servidor mediante un flujo dedicado de reporte de conflictos. Mientras no haya sido reportado, puede identificarse localmente porque:

```text
sync_status = conflict
server_sequence = null
```

Despues de reportarlo, el servidor devuelve `server_sequence` y `conflict_id`; el dispositivo mantiene `sync_status = conflict`.

## Escenario online contra offline

Servidor recibe primero el alta online:

```text
events
evt_online_001
  aggregate_type = espacio
  aggregate_id = esp_online_001
  event_type = espacio_creado
  sync_status = synced
  server_sequence = 101
  payload.identificacion = terraza

espacios
esp_online_001
  nombre = Terraza
  identificacion = terraza
  created_event_id = evt_online_001
  last_server_sequence = 101

event_refs
evt_online_001 -> espacio:esp_online_001, affects
evt_online_001 -> espacio_identificacion:terraza, requires_unique
```

Despues llega el evento creado offline en otra tablet:

```text
events
evt_offline_999
  aggregate_type = espacio
  aggregate_id = esp_offline_999
  event_type = espacio_creado
  sync_status = conflict
  server_sequence = 102
  rejection_reason = Ya existe un espacio con identificacion terraza.
  payload.identificacion = terraza

event_refs
evt_offline_999 -> espacio:esp_offline_999, affects
evt_offline_999 -> espacio_identificacion:terraza, requires_unique
```

La tabla oficial no cambia:

```text
espacios
esp_online_001
  nombre = Terraza
  identificacion = terraza
```

Se abre o reutiliza el caso administrativo:

```text
sync_conflicts
conf_001
  conflict_type = unique_key_conflict
  ref_type = espacio_identificacion
  ref_id = terraza
  status = open
  default_winner_event_id = evt_online_001
  reason = Identificacion unica ya usada.

sync_conflict_participants
conf_001, evt_online_001
  aggregate_id = esp_online_001
  role = winner
  payload_snapshot.identificacion = terraza

conf_001, evt_offline_999
  aggregate_id = esp_offline_999
  role = conflicted_candidate
  payload_snapshot.identificacion = terraza
```

Si una tercera tablet tambien sube `identificacion = terraza`, se agrega otro participante al mismo `conf_001`.

## Casos esperados

| Caso | Ejemplo | Manejo propuesto |
|---|---|---|
| Evento duplicado | Mismo `event_id` reenviado | Marcar como `duplicate` |
| Venta cancelada | Llega `producto_agregado` despues de `venta_cancelada` | Rechazar o mandar a conflicto |
| Producto desactivado | Dispositivo offline vende producto ya desactivado | Aceptar con advertencia o rechazar, pendiente |
| Stock insuficiente | Venta offline rebasa stock | Depende de politica de inventario |
| Pago duplicado | Mismo `payment_id` | Rechazar duplicado |
| SKU duplicado | Dos dispositivos crean variantes con el mismo SKU | Conflicto, requiere cambio de SKU o fusion |
| Edicion concurrente relacionada | Un dispositivo cambia el precio de una variante y otro el nombre del producto | Aceptar ambos si sus bases y referencias siguen siendo validas |
| Misma columna editada | Dos dispositivos cambian `nombre` del mismo producto | Conflicto, requiere decision |
| Categoria relacionada modificada | Producto creado offline mientras otro dispositivo cambia la categoria usada | Validar las columnas y reglas efectivamente relacionadas |
| Permiso revocado | Usuario genera evento offline con permiso revocado despues | Rechazar o mandar a revision segun criticidad |
| Rol editado concurrentemente | Dos dispositivos cambian permisos del mismo rol | Conflicto de seguridad |
| Configuracion cambiada | Dispositivo calcula impuestos con regla anterior | Aceptar segun regla vigente al capturar o mandar a revision |
| Caja cerrada | Dispositivo registra movimiento sobre caja ya cerrada | Conflicto de caja |

## Estados de conflicto

- `open`
- `acknowledged`
- `resolved`
- `ignored`

## Preguntas pendientes

- Quien puede resolver conflictos?
- Los conflictos bloquean cierre de caja?
- El usuario ve conflictos tecnicos o mensajes simplificados?
- Se permite corregir mediante eventos compensatorios?
- Que conflictos administrativos puede resolver automaticamente el servidor?
- Que conflictos deben bloquear caja, inventario o catalogo?

## Tabla relacionada

Ver [[05 - Datos/Modelo de tablas|Modelo de tablas]], `sync_conflicts` y `sync_conflict_participants`.

## Implementacion relacionada

Ver [[04 - Sincronizacion/Implementacion de conflictos centralizados|Implementacion de conflictos centralizados]].

- [[03 - Dominio/Modulos/Articulos|Aplicacion en Articulos]]
