---
tipo: sincronizacion
estado: decidido
actualizado: 2026-07-08
---

# Implementacion de conflictos centralizados

Esta nota aplica al modo `server_sync` y al backend NestJS. En modo `standalone`, los eventos conflictivos centralizados no existen salvo durante una migracion/importacion hacia servidor.

## Objetivo

Conservar en servidor los eventos que no ganan la validacion oficial, agruparlos con el evento o registro ganador y permitir resolucion administrativa posterior.

El ganador por defecto sigue siendo el primer evento aceptado por el servidor. Los demas eventos se guardan como `conflict` y no se aplican a las tablas oficiales de lectura.

## Backend NestJS

Referencia de codigo:

```text
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest
```

Cambios recomendados:

1. Crear entidades `SyncConflictEntity` y `SyncConflictParticipantEntity`.
2. Agregar migracion para `sync_conflicts` y `sync_conflict_participants`.
3. Agregar indices:

```sql
create index ix_sync_conflicts_status on sync_conflicts(status);
create index ix_sync_conflicts_ref on sync_conflicts(conflict_type, ref_type, ref_id);
create unique index ux_sync_conflict_participants_conflict_event
  on sync_conflict_participants(conflict_id, event_id);
create index ix_sync_conflict_participants_event
  on sync_conflict_participants(event_id);
create index ix_sync_conflict_participants_aggregate
  on sync_conflict_participants(aggregate_type, aggregate_id);
```

4. No crear indices unicos por `event_id` o `aggregate_id` en `sync_conflict_participants`.
5. Extraer la logica de conflictos a un servicio, por ejemplo `SyncConflictService`.
6. Cuando un evento se acepte:

```text
events.sync_status = synced
aplicar proyeccion oficial
crear event_refs
```

7. Cuando un evento choque contra unicidad, columna, estado bloqueante o permisos:

```text
events.sync_status = conflict
events.rejection_reason = motivo
no aplicar proyeccion oficial
crear event_refs
crear o reutilizar sync_conflicts
agregar participantes
```

8. Para clave unica, buscar el conflicto abierto por:

```text
conflict_type = unique_key_conflict
ref_type = espacio_identificacion
ref_id = terraza
status in open, acknowledged
```

9. Si el conflicto ya existe, agregar solo el nuevo participante.
10. Si no existe, crearlo con `default_winner_event_id` apuntando al evento `synced` que ya ocupa la clave.
11. Capturar violaciones de indice unico de PostgreSQL y convertirlas en `conflict`, no en error 500.
12. Cambiar la respuesta de duplicados: si un `event_id` ya existe, responder con el estado efectivo original para no convertir conflictos en `synced`.
13. Agregar `POST /sync/conflicts/report` para conflictos detectados localmente por el dispositivo.
14. Agregar `GET /sync/conflicts` para bandeja administrativa.
15. Mantener `/sync/pull` filtrando solo eventos `synced`.

Pruebas minimas:

- Dos dispositivos suben `espacio_creado` con la misma `identificacion`; uno queda `synced` y otro `conflict`.
- Tres dispositivos suben la misma `identificacion`; hay un solo `sync_conflict` abierto con tres participantes.
- Un evento conflictivo reenviado no queda marcado como `synced`.
- Dos pushes concurrentes que chocan por indice unico devuelven una aceptacion y un conflicto controlado.
- `/sync/pull` no descarga eventos `conflict`.
- `/sync/conflicts/report` no aplica proyeccion oficial.

## Dispositivos Flutter

Referencia de codigo:

```text
/Users/benjamin/Projects/POS/pos_flutter
```

Cambios recomendados:

1. Mantener el flujo:

```text
preflight -> revalidar pendientes -> reportar conflictos locales -> push validos -> pull final
```

2. Cuando la revalidacion local detecte conflicto:

```text
events.sync_status = conflict
events.server_sequence = null
eliminar u ocultar proyeccion local conflictiva
conservar event_refs locales
```

3. Agregar un servicio de reporte, por ejemplo `SyncConflictReportService`, que busque eventos:

```text
sync_status = conflict
server_sequence is null
```

4. Enviar esos eventos a `/sync/conflicts/report` junto con sus `event_refs` y la razon local.
5. Al recibir respuesta exitosa:

```text
events.sync_status = conflict
events.server_sequence = respuesta.server_sequence
events.created_at_server = respuesta.created_at_server
```

6. Si se agrega almacenamiento local para `conflict_id`, guardarlo. No es obligatorio para la operacion offline; el administrador puede consultar el caso por servidor.
7. En `/sync/push`, seguir enviando solo eventos pendientes que sigan siendo validos.
8. Si `/sync/push` responde `conflict`, marcar el evento local como `conflict`, guardar metadata de servidor y ocultar la proyeccion conflictiva.
9. Si `/sync/push` responde `duplicate`, revisar si el servidor informa `original_sync_status`. No marcar como `synced` si el original era `conflict` o `rejected`.
10. La UI operativa debe mostrar solo el registro oficial; la UI administrativa puede consultar conflictos al servidor.

Pruebas minimas:

- Preflight trae un espacio remoto con la misma identificacion que un pendiente local; el pendiente queda `conflict`, se oculta la proyeccion local y se reporta al servidor.
- Push recibe `status = conflict`; el evento local queda `conflict` y no aparece como espacio activo.
- Un conflicto local con `server_sequence = null` se reintenta hasta reportarse.
- Un conflicto reportado conserva `sync_status = conflict` despues de recibir `server_sequence`.
- Un duplicate con `original_sync_status = conflict` no se marca como `synced`.

## Resolucion administrativa

La resolucion no debe editar eventos historicos. Debe crear un evento nuevo, por ejemplo:

```text
conflicto_resuelto
espacio_identificacion_cambiada
espacio_fusionado
espacio_descartado
```

El evento de resolucion debe quedar en `sync_conflicts.resolution_event_id` y cambiar el estado del conflicto a `resolved` o `ignored`.
