---
tipo: pendientes
estado: activo
actualizado: 2026-08-24
---

# Pendientes

## Arquitectura

- [x] Decidir si la app soportara modo standalone y modo con servidor.
- [x] Persistir y seleccionar el modo instalado (`standalone` o `server_sync`)
      durante el onboarding.
- [ ] Decidir servidor local, VPS o mixto para modo `server_sync`.
- [x] Definir NestJS/PostgreSQL como tecnologia del backend.
- [x] Definir Flutter/SQLite Drift como tecnologia movil y persistencia local.
- [x] Definir Google Drive como respaldo obligatorio para `standalone`.
- [x] Implementar busqueda/restauracion del respaldo durante la configuracion
      inicial y restauracion manual con confirmacion.
- [ ] Definir retencion, compatibilidad entre versiones y recuperacion ante
      respaldos corruptos.
- [ ] Definir flujo de migracion/importacion de `standalone` a `server_sync`.

## Sincronizacion

- [x] Evitar que `standalone` inicie health, preflight, push, pull o WebSocket.
- [ ] Evaluar si conviene formalizar ese comportamiento con un `NoSyncProvider`
      en lugar del control de servicios por modo vigente.
- [ ] Definir reglas exactas para eventos rechazados.
- [ ] Definir si existira endpoint `/sync/ack`.
- [ ] Definir si `/sync/bootstrap` devuelve snapshot completo o por lotes.
- [ ] Definir umbrales para escalar de preflight a pull completo antes del push.
- [ ] Definir limites de eventos y tiempo maximo para `/sync/preflight`.
- [ ] Definir tamano de lote para pull.
- [ ] Definir retencion de eventos antiguos.
- [ ] Definir politica local de purga de eventos sincronizados.
- [x] Implementar reporte de conflictos locales con `/sync/conflicts/report`.
- [ ] Definir lista final de operaciones imposibles offline.

## Negocio

- [ ] Definir identidad local minima para instalacion `standalone`.
- [ ] Definir politica de venta offline sin stock confirmado.
- [ ] Definir si una comanda enviada puede modificarse.
- [ ] Definir flujo de cancelacion con pagos.
- [ ] Definir permisos por rol y reglas de validacion offline.
- [ ] Definir resolucion de conflictos para catalogo.
- [ ] Definir resolucion de conflictos para caja.
- [ ] Definir resolucion de conflictos para usuarios, roles y permisos.
- [ ] Definir pantalla administrativa para revisar `sync_conflicts` y participantes.

## Datos

- [ ] Cerrar esquema final de `events`.
- [x] Cerrar el esquema de `categories` para el alcance actual, incluyendo
      `color_key`, `sort_order` consecutivo y `active` heredado sin uso
      funcional.
- [x] Cerrar escala por dimension, catalogo metrico inicial, conversion exacta
      y persistencia atomica de unidades segun ADR-0012.
- [x] Definir `standard_cost_minor` opcional por variante, su snapshot de venta
      y su separacion de `inventory_movements.total_cost_minor` segun ADR-0013.
- [ ] Implementar `standard_cost_minor` y `standard_cost_minor_snapshot` en
      Drift, PostgreSQL, comandos, payloads, handlers, migraciones y pruebas.
- [ ] Implementar `units` en Drift/PostgreSQL, sus proyecciones locales y los
      selectores/conversores compartidos.
- [ ] Cerrar el resto del esquema fisico de inventario y balances como agregado
      independiente del catalogo de productos y variantes.
- [x] Retirar alertas, reposicion y politicas configurables por recurso del
      esquema actual; cualquier incorporacion futura requerira una decision,
      modelo y migracion propios.
- [x] Retirar lotes y vencimiento del esquema actual; cualquier incorporacion
      futura requerira una decision, modelo y migracion propios.
- [ ] Definir particionado de `events` en servidor.
- [ ] Definir tablas resumen para historicos si el volumen crece.
- [x] Definir esquema base de `sync_conflicts` y `sync_conflict_participants`.
- [x] Crear indices y migracion fisica inicial de `sync_conflicts` y
      `sync_conflict_participants`.
- [ ] Definir columnas de auditoria por tabla.
- [ ] Definir en que tablas locales las referencias `*_event_id` seran FK estricta y en cuales solo texto referencial.
- [ ] Definir el ciclo futuro de desactivacion, eliminacion o reactivacion para
      categorias, productos y variantes. `categories` hereda `active` pero no
      lo usa funcionalmente en el alcance actual.
- [ ] Definir `version` en todas las entidades mutables.
- [x] Definir e implementar la tabla `event_refs` para el agregado `espacio`.
- [ ] Definir referencias de `event_refs` al analizar cada agregado futuro.
- [x] Definir `event_refs.source` con los valores actuales `server` y
      `local_pending`.
