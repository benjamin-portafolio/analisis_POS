# Auditoría de prerrequisitos de fase 4 — 2026-10-04

Flutter `main @ 56df46b7c3846a886f039b3e3a7afb8c2bc19974`, con cambios pendientes anteriores. No se modificó código del proyecto.

`dart analyze`: exit 0, No issues found.
`flutter test --reporter json`: exit 1, 1002 aprobadas, 16 fallidas, 0 omitidas (se excluyen las cargas ocultas del reporter).

## Pruebas fallidas de la suite completa

- `test/application/commands/articulos/producto_command_service_test.dart` — crea recurso, movimiento inicial y artículo enlazado en orden causal (error).
- `test/application/import/articulo_import_batch_service_test.dart` — 500 filas generan 1000 eventos en orden, con 10 transacciones: AppMode.standalone (failure).
- `test/application/import/articulo_import_batch_service_test.dart` — 500 filas generan 1000 eventos en orden, con 10 transacciones: AppMode.serverSync (failure).
- `test/application/import/articulo_import_batch_service_test.dart` — un lote fallido revierte todo y conserva los anteriores y posteriores (failure).
- `test/application/import/articulo_import_batch_service_test.dart` — las variantes de un producto no se parten entre lotes (failure).
- `test/application/import/articulo_import_batch_service_test.dart` — exportar y reimportar sin cambios no altera catálogo, saldos ni eventos (failure).
- `test/application/import/articulo_import_batch_service_test.dart` — push entrega los 1000 eventos en POST de hasta 150 y respeta dependencias (failure).
- `test/data/local/drift/product_inventory_tracking_local_event_store_test.dart` — edita seguimiento y receta sin reescribir existencias (error).
- `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart` — busca con debounce y conserva búsqueda y filtros al cambiar de pestaña (error).
- `test/presentation/pages/gestion_inventario/articulos/variant_inventory_movement_test.dart` — captura inicial en alta se guarda con el producto (error).
- `test/presentation/pages/gestion_inventario/articulos/variant_inventory_movement_test.dart` — captura inicial al activar por primera vez se guarda con el producto (error).
- `test/presentation/pages/gestion_inventario/articulos/variant_inventory_movement_test.dart` — vínculo con saldo cero: cancelar movimiento no registra eventos (error).
- `test/presentation/pages/gestion_inventario/articulos/variant_inventory_movement_test.dart` — registro permanece al cancelar variante y producto; no renombra un recurso actualizado (error).
- `test/presentation/pages/gestion_inventario/articulos/variant_inventory_movement_test.dart` — saldo vigente, corrección con motivo, delta negativo y seguimiento desactivado (error).
- `test/presentation/pages/gestion_inventario/articulos/variant_inventory_movement_test.dart` — consulta conserva saldo y no permite registrar movimientos (error).
- `test/presentation/pages/gestion_inventario/articulos/variant_inventory_movement_test.dart` — bloquea doble registro y cierre mientras guarda; permite reintentar errores (error).

## Sonda aislada

La fuente `core_prerequisites_test.dart.txt` es una sonda de diagnóstico, no una entrega de tests de aceptación de fase 4. Usa el código real de commands, event store, handlers, adaptadores y SQLite en memoria, con los tres puertos de recuperación conectados explícitamente. Los fixtures de eventos se toman del test existente `product_inventory_tracking_local_event_store_test.dart`; no modifica el proyecto.

Comando ejecutado desde `/Users/benjamin/Projects/POS/pos_flutter`:

```sh
flutter test /tmp/pos-seguimiento-fase4-20261004-audit/core_prerequisites_test.dart --reporter expanded
```

Resultado: exit 1, 0 aprobadas / 8 fallidas por aserciones de negocio. No son errores de compilación. Para repetir, copiar la fuente archivada a un archivo temporal con sufijo `_test.dart` y ejecutar el mismo comando con esa ruta.

- Alta de producto no escribe memoria: falla en standalone y server_sync.
- Legado directo → ninguno → directo genera otro UUID: falla en ambos modos (SEG-05).
- Autogenerado sin movimientos y saldo cero no se descarta: falla en standalone (SEG-06; bloquea SEG-07).
- Catálogo legado sin historia acreditable devuelve recurso nuevo: falla en ambos modos (SEG-22).
- Restauración de backup con ausencia previa de memoria conserva la fila agregada: falla en server_sync (SEG-15).

Las sondas no recorren UI ni reapertura de archivo, pull real o hardware; el criterio esencial del core ya falla antes de esos pasos. No se hizo revisión visual en tablet.

## Fixtures compartidos

33 JSON leídos y parseados sin cambios. Contrato revisión 1; no se regeneraron fixtures.
