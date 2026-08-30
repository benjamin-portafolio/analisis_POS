---
tipo: sincronizacion
estado: decidido
actualizado: 2026-07-23
---

# Flujo local de comandos y eventos

## Objetivo

Definir como una accion de pantalla se convierte en evento local y actualiza SQLite sin depender todavia de la sincronizacion remota.

Este flujo es parte del core compartido. Ambos modos declaran el mismo evento y
sus referencias; la persistencia de `event_refs` y el estado de entrega cambian
segun el modo.

## Flujo para evento creado en el dispositivo

```text
UI
  -> CommandService del agregado
  -> construir XPayload tipado
  -> XPayload.toJson
  -> construir SyncEvent
  -> guardar evento en events
  -> guardar event_refs locales solo en server_sync
  -> EventProcessor.apply(event)
  -> handler del agregado
  -> actualizar tabla de lectura
```

## Flujo para evento recibido del servidor

```text
WebSocket o ciclo de sincronizacion
  -> detectar que hay eventos disponibles
  -> SyncService ejecuta /sync/pull
  -> SyncEvent.fromJson(json)
  -> guardar evento en events con sync_status = synced
  -> guardar event_refs server
  -> EventProcessor selecciona handler por event_type
  -> handler ejecuta XPayload.fromJson(event.payload)
  -> handler del agregado
  -> actualizar tabla de lectura
```

`SyncEvent` conserva un payload generico porque el pull puede mezclar tipos de
evento. El contrato tipado se aplica dentro del handler seleccionado y es el
mismo que el command service usa para serializar el evento local.

## Regla principal

La UI no actualiza directamente tablas como `espacios` o `mesas`. La UI solicita una accion de negocio; el evento aplicado por su handler actualiza la proyeccion local.

## Command services

Los command services se agrupan por agregado:

```text
EspacioCommandService
MesaCommandService
VentaCommandService
ProductoCommandService
```

Una misma pantalla puede usar varios command services.

## Estado posterior por modo

En modo `standalone`, el flujo completo termina en la base local, el evento usa
`delivery_status = not_required` y no se persisten `event_refs`. El evento queda
disponible para auditoria, respaldo o una migracion futura que reconstruya sus
referencias explicitamente.

En modo `server_sync`, el evento local queda pendiente de validacion remota hasta completar el ciclo de sincronizacion.

## Sincronizacion remota

La subida y descarga de datos del servidor aplica solo para modo `server_sync`.

WebSocket solo dispara el pull; los eventos completos entran por `SyncService`
y reutilizan `EventProcessor.apply(event)`.

## Decision relacionada

[[02 - Decisiones/ADR-0009 Command services por agregado y aplicacion compartida de eventos|ADR-0009 Command services por agregado y aplicacion compartida de eventos]]

## Patron para desarrollo

[[04 - Sincronizacion/Patron para nuevas funcionalidades offline first|Patron para nuevas funcionalidades offline first]]
