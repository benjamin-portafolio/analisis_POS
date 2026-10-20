# Sesión 2: persistencia local y conservación — 2026-10-19

Completada en su alcance local. No se habilitó captura pública ni se implementó
el receptor remoto. No hubo commit, push, despliegue, migración operativa ni
instalación de dependencias.

## Base y preservación

Se leyeron la solicitud de sesión 2, plan, matriz, continuidad, evidencia de
sesión 1, AGENTS del vault/Flutter/NestJS y las dos guías offline de Flutter.
Git se inspeccionó antes de editar. HEAD sigue en Flutter `3e8e1ed`, NestJS
`dcc2907` y vault `b077dc7`; hashes completos en manifest.json.

Los 15 archivos ajenos de Flutter conservan los SHA256 iniciales, incluidos
editor de variantes, gestión de inventario, informes y sus archivos nuevos aún
sin versionar. Los nueve archivos de NestJS de sesión 1 conservan sus hashes.
No se tocó el backend. Se conservaron tabla, detector, generado Drift, payload
creado y fixtures de sesión 1; el actualizado solo recibió un helper adicional
de lectura de presencia. No se rehízo el contrato. Se preservaron los cambios
previos del vault en mapa, CSV y edición masiva/recepción.

## Implementación y archivos

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`; SHA256 de los veinte
archivos de esta sesión en manifest.json.

| Archivos | Cambio |
|---|---|
| `lib/application/commands/articulos/crear_articulo_variante_command.dart` | `minimumStock` reutiliza `CambioExplicito<String?>`; conservar por defecto, establecer cantidad, establecer(null) para retirar; ambos constructores |
| `lib/application/commands/articulos/producto_command_service.dart` | Codec/unidad/dimensión; promoción explícita de before/after; conservación en copias de barcode, CSV, comercial y edición completa; no-op sin evento/undo |
| `lib/application/sync/handlers/producto_event_handler.dart` | Persistencia de mínimo en alta; rechazo claro Actualiza la app ante before legado sobre base conocida, incluso borrado |
| `lib/application/sync/payloads/producto_actualizado_payload.dart` | Helper `knowsMinimumStock` que consulta after/before mediante el contrato creado; permite leer metadata histórica sin exigir un producto completo |
| `lib/application/sync/projections/producto_projection_store.dart` | Variante de proyección incluye valor y conocimiento |
| `lib/data/local/drift/drift_producto_projection_store.dart` | Insert/update/snapshot conservan mínimo; conocimiento desde last_event_id y defensa de valores físicos no null; sin event_refs ni acumulación de intentos rechazados |
| `lib/data/local/drift/daos/producto_dao.dart` y `daos/producto_listado_row.dart` | Listado une evento base y detecta valor físico por producto; undo escribe null explícito mediante toCompanion(false), conservando guarda frente a sucesores |
| `lib/data/repositories/producto_repository_impl.dart` | Detalle y listado observable exponen valor/conocimiento, con una consulta observable y sin peticiones por fila |
| `lib/domain/articulos/variante_detalle.dart` y `variante_listado.dart` | Campos de mínimo y presencia, sin importar Drift |
| `lib/domain/inventario/minimum_stock_policy.dart` | Regla pura: saldo físico <= mínimo no null, con producto/variante/recurso activos y seguimiento directo |
| `test/application/commands/articulos/minimum_stock_local_test.dart` | 25 pruebas nuevas sobre los arneses ProductSupplierHarness/VariantTrackingHarness existentes, sin duplicar infraestructura |
| `test/application/commands/articulos/actualizar_articulo_csv_test.dart` | Fixture complejo con mínimo 5 piezas/1.5 kg, ampliando las pruebas existentes de conservación, omisiones, lote, rollback y undo |
| `test/application/commands/articulos/editar_articulo_comercial_test.dart` | Fixture complejo con mínimo real en edición de venta/costo/proveedores; conservación de recetas y demás variantes |
| `test/support/recepcion_masiva_fixture.dart` | Mínimo creado por comando; las pruebas existentes de recepción, crash, reapertura y snapshot/restore verifican ahora también ese dato |
| `test/application/commands/articulos/product_supplier_relations_test.dart` | La prueba de dependencia hace un cambio de nombre real; el guardado idéntico dejó de emitir evento por requisito |
| `test/data/local/drift/variant_tracking_phase3_test.dart` | La copia de variante del evento oficial de prueba conserva mínimo/presencia del before, como debe hacer un escritor actual |
| `docs/architecture/minimum_stock_contract.md` y `offline_feature_flow.md` | Contrato de comandos, reconstrucción, undo, evidencia y límites vigentes |

Vault: matriz, continuidad y esta evidencia. El plan y las solicitudes originales
no se modificaron. No cambió ninguna tabla ni schemaVersion=8; no fue necesario
build_runner.

## Comportamiento acreditado

- Conservar por defecto no retira mínimos ni promueve presencia legada. Las
  altas actuales declaran null o valor en todas las variantes. Una intención
  explícita promueve before/after completos; promover a null sin cambiar
  negocio no genera evento ni escritura de conocimiento.
- Cantidades exactas: 1,5 kg son 1500 átomos aunque la venta sea por gramos;
  mínimos cero/positivo/null; negativos, precisión excesiva, fracción de pieza,
  desbordamiento, vacío e incompatibilidad de dimensión fallan sin cambiar tablas.
- Cambiar solo mínimo emite un producto_actualizado; repetirlo o guardar igual
  produce cero eventos. Saldos, movimientos y clave de consumo permanecen iguales.
  Una venta abierta confirma después del cambio y deja saldo 5 con mínimo 5.
- Barcode, CSV y edición comercial/recepción conservan valor y presencia; los
  encabezados CSV no cambiaron. Una entrada de 5 a 6 con mínimo 5 retira la
  condición de dominio y el repositorio observa el saldo nuevo; no hay evento
  de alerta ni tabla adicional.
- Desvincular o pasar a receta conserva mínimo dormido; recuperar el recurso
  compatible reutiliza identidad y saldo. Retirar variantes conserva el umbral
  físico y el undo restaura la lista previa. Borrar producto lo conserva en
  las filas históricas y restaura al rechazar la eliminación optimista.
- Lectura legada conserva omisión; edición legada sobre base legada funciona.
  Base conocida, incluso null conocido, rechaza escritor legado con mensaje
  explícito. Un valor físico con metadata legada tampoco se pierde.
- Fallo inyectado después de proyección revierte todas las tablas. La base de
  producto rechaza edición obsoleta incluso entre variantes diferentes.
  Reproducción ordenada legada→actual y reentregas no cambian el estado final.
- Undo restaura presencia desde el evento base original. Se detectó/corrigió el
  upsert de DataClass que omitía null: toCompanion(false) restaura explícitamente
  ese dato. La guarda existente por last_event_id evita que undo tardío pise
  un sucesor, también tras reapertura y con aceptación simulada en server_sync.
- SQLite en disco se cierra/reabre antes de rechazo/undo y después de la base
  posterior; conserva valor, desconocimiento legado y null conocido. Las
  lecturas repetidas de snapshot/detalle/listado dejan todas las tablas idénticas.
  La suite de recepción verifica backup/restore real con eventos y mínimo.
- Refs declaradas y validadas en ambos modos; persistidas solo en server_sync.
  Standalone conserva not_required, cero event_refs y guardas existentes de
  runtime/transporte. No se convierte historial local a pendiente.

## Comandos y resultados

Desde Flutter, con SQLite en memoria o directorios temporales. Ningún test abre
la instalación operativa. La suite de restore simula path_provider para apuntar
solo al directorio temporal. No se cargó .env ni se inició un servidor.

| Comando | Resultado y log |
|---|---|
| `dart analyze` | Exit 0, No issues found; dart-analyze.log |
| `flutter test --reporter expanded` | Exit 0, 2517 aprobadas, 16 omitidas, cero fallos; flutter-completo.log |
| Focalizadas de abajo | Exit 0, 110 aprobadas; flutter-focalizadas.log |
| `flutter test test/application/commands/ventas/venta_command_service_test.dart test/application/commands/articulos/minimum_stock_local_test.dart --reporter expanded` | Exit 0, 79 aprobadas; flutter-compatibilidad-ventas.log |
| `flutter test test/application/commands/articulos/product_supplier_relations_test.dart test/data/local/drift/variant_tracking_phase3_test.dart --reporter expanded` | Exit 0, 92 aprobadas; flutter-proveedores-seguimiento.log |
| `git diff --check` en Flutter y vault | Exit 0 |
| Comparación SHA256 de cambios ajenos y archivos Nest de sesión 1 | 15/15 Flutter y 9/9 Nest preservados |
| `dart run build_runner build` | No ejecutado: ninguna tabla cambió; generado de sesión 1 intacto |

```sh
flutter test \
  test/application/commands/articulos/minimum_stock_local_test.dart \
  test/application/commands/articulos/actualizar_articulo_csv_test.dart \
  test/application/commands/articulos/editar_articulo_comercial_test.dart \
  test/application/commands/edicion_masiva/recepcion_reapertura_test.dart \
  --reporter expanded
```

La focalizada corresponde a la iteración previa al ajuste de metadata histórica
y a los últimos refuerzos de fixtures; la corrida completa final incluye todas
las correcciones y los 25 casos nuevos definitivos. No se suman conteos de
corridas superpuestas como pruebas distintas.

Las 16 omisiones HTTP son seis de recepción masiva, nueve de proveedores y una
de seguimiento: faltan POS_BULK_SYNC_URL, POS_SUPPLIER_SYNC_URL y
POS_PHASE3_SYNC_URL. No se cuentan aprobadas ni acreditan transporte del mínimo.

## Corridas intermedias corregidas

- Primera focalizada ampliada: 85 aprobadas y un archivo nuevo sin compilar
  por saleConfiguration ausente en dos fixtures. Log conservado.
- Primeras iteraciones del archivo nuevo detectaron fixtures con UUID/referencia
  de precio inválidos y dependencia de inventario omitida. Se corrigieron sus
  datos. La iteración de undo detectó el fallo real del upsert con null descrito
  arriba; no se debilitó la expectativa de restauración.
- Primera corrida completa: 2462 aprobadas, 55 fallidas, 16 omitidas. La lectura
  de presencia estaba validando el payload histórico completo, incompatible con
  metadata mínima usada por ventas. Se reutilizaron los helpers de conocimiento
  del contrato. Además se corrigieron los dos fixtures que asumían evento por
  no-op o copiaban una variante sin presencia. flutter-completo-inicial.log.
- Corrida completa final: 2517 aprobadas, cero fallos, mismas 16 omisiones.
  Los avisos Drift de múltiples instancias pertenecen a arneses aislados y no
  son fallos; la prueba nueva de reapertura usa executors separados y los cierra.

## Pendientes reales

Sesión 3: persistencia/reconstrucción en receptor NestJS, rechazo de clientes
legados, canonicalización y convergencia PostgreSQL/HTTP. La aceptación simulada
en pruebas locales verifica solo la guarda de restauración; no prueba servidor.

Sesión 4: captura explícita, precarga y unidad en el editor compartido, y conexión
de MinimumStockPolicy al informe, filtro, filas y contador existentes. La regla
está implementada y probada, pero no se expone todavía en UI. Sesión 5: cierre,
prueba manual y física en dispositivo. No se acredita hardware con widgets.
