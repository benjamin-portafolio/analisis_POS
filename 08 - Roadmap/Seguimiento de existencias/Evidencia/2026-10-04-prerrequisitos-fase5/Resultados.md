# Auditoría de entrada a fase 5 — 2026-10-04

**Fase 5 no iniciada; cierre bloqueado.** Se verificó su puerta de entrada. El
registro de fase 3 del mismo día sigue vigente: memoria no derivada por eventos,
descarte sin ejecución, legado incompleto tratado como alta nueva y undo inexacto.
La interfaz de fase 4 sigue sin implementar. No se corrigió código de fases
anteriores bajo esta solicitud: su condición explícita ordena documentar el trabajo
restante cuando los prerrequisitos continúen pendientes.

## Revisiones y conservación

| Proyecto | Rama | HEAD auditado |
|---|---|---|
| Vault | main | 424c8bb7995f49a2255e97c778155efd31b1f648 |
| Flutter | main | 56df46b7c3846a886f039b3e3a7afb8c2bc19974 |
| NestJS | main | cdd0d690d5338cb3b0331b902275e2ed80c5ee9e |

Los tres árboles tenían modificaciones previas. `estado-inicial.json` conserva
estado Git y SHA-256 de archivos versionados y no ignorados. Antes de editar el
vault, `conservacion-codigo.json` confirmó **cero archivos cambiados** en Flutter y
NestJS, con los mismos HEAD. No hubo commit, reset, stash ni despliegue. La comprobación final detectó además
un cambio concurrente en `.obsidian/workspace.json` respecto del inicio: no se
editó ni se revirtió. `validacion-documental.json` distingue ese cambio de las
13 notas existentes editadas por esta auditoría y acredita 117 enlaces resueltos,
30 resultados SEG y la sonda idéntica a la anterior.
Las versiones completas están en `versiones.log`: Flutter 3.41.6 / Dart 3.11.4,
Node 26.0.0 / npm 11.12.1 / PostgreSQL 18.4 de Postgres.app.
Contrato rev. 1; 33 fixtures leídos sin regeneración, huellas en `fixtures.json`.

Se leyeron los AGENTS raíz de vault/Flutter/NestJS y las dos guías offline de
Flutter. La búsqueda de AGENTS anidados no encontró otros archivos aplicables.

## Ejecuciones reales

| Comando / árbol | Resultado | Evidencia |
|---|---|---|
| `dart analyze`, Flutter actual | exit 0, sin incidencias | dart-analyze.log |
| `flutter test --reporter json`, Flutter actual | exit 1; 1002 aprobadas, 16 fallidas, 0 omitidas | flutter-test.jsonl |
| `flutter test <temporal>/core_prerequisites_test.dart --reporter expanded` | exit 1; 0 aprobadas, 8 fallidas por aserciones | core-prerequisites.log; fuente .dart.txt |
| `npm run build`, NestJS actual | exit 0 | npm-build.log |
| `RUN_POSTGRES_INTEGRATION=1 … npm test -- --runInBand --json --outputFile=…`, primera base aislada | exit 1; 368 aprobadas, 18 fallidas, 0 omitidas | nest-test.log/json |
| Mismo comando, base aislada con prefijo exigido `pos_cash_test_` | exit 1; 381 aprobadas, 5 fallidas, 0 omitidas; 44 suites aprobadas / 1 fallida | nest-test-cash-name.log/json |
| Flutter HEAD limpio, cinco archivos donde falló el árbol actual | exit 1; 51 aprobadas, 1 fallida, 0 omitidas | flutter-head-test.jsonl |
| NestJS HEAD limpio, suite financiera | exit 0; 14 aprobadas | nest-head-financial.log/json |
| NestJS HEAD limpio, suite completa sobre otra base aislada `pos_cash_test_` | exit 1; 320 aprobadas, 5 fallidas, 0 omitidas | nest-head-test.log/json |

Los recuentos Flutter excluyen cargas ocultas del reporter, no pruebas de negocio.
`resumen-pruebas.json` guarda nombres, archivos, estados y errores por prueba.
No se ejecutó build_runner: esta sesión no cambió tablas/DAOs ni el esquema
regenerado; no se cuenta como una comprobación nueva aprobada.

PostgreSQL real: clúster creado con `initdb -U seg_audit -A trust --no-locale`,
puerto **55839**, usuario `seg_audit`, bases nuevas `seg_fase5_audit`,
`pos_cash_test_seg_fase5` y `pos_cash_test_seg_head`. Las variables DATABASE_HOST,
DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD y DATABASE_NAME apuntaron
explícitamente a ese clúster (password de prueba `isolated`). Nunca se leyó `.env`
para elegir conexión ni se abrió AppModule/servidor contra datos de uso.
`pg-identidad.log` y `pg-bases-aisladas.log` acreditan conexión/bases.
El primer arranque falló por longitud del socket Unix; se corrigió usando un
socket temporal corto en `/tmp`. Las pruebas se ejecutaron después del arranque
correcto. `pg-stop.log` acredita la detención posterior; después se retiraron el clúster
y las copias temporales de los proyectos, conservando evidencia y logs. No se tocó `pos_nest` ni
se aplicaron allí las migraciones pendientes.

Las suites PostgreSQL de esta funcionalidad pasan en ambas corridas actuales:

| Archivo NestJS bajo src/ | Pruebas aprobadas |
|---|---:|
| migrations/1790774400000-AddInventoryOriginAndVariantMemory.postgres.spec.ts | 6 |
| migrations/1790860800000-ReconstructLegacyVariantInventoryMemory.postgres.spec.ts | 8 |
| sync/variant-inventory-memory.postgres.spec.ts | 19 |
| sync/variant-tracking-late-sale.postgres.spec.ts | 3 |
| sync/producto-event.handler.postgres.spec.ts | 8 |
| **Total de estos cinco archivos** | **44** |

Además, los contratos TS de alta/descarte pasan 17/15 pruebas; los Dart pasan
14/17. SQLite: `variant_inventory_memory_schema_test.dart` pasa 5 y
`variant_memory_schema_reset_test.dart` pasa 3. Estas pruebas acreditan forma,
restricciones, procedencia, memoria sembrada manualmente y detección/reapertura
de archivos temporales; no acreditan el descarte ejecutado ni el E2E de tablet.

## Fallos y atribución

1. **Core de seguimiento incompleto, anterior a esta sesión:** la sonda archivada
   usa commands, event store, handlers y adaptadores reales con SQLite en memoria,
   y conecta explícitamente los puertos de inventario/memoria/tracking. Falla el
   alta que debe escribir memoria (dos modos), la recuperación legada del mismo
   recurso con historial (dos modos), el descarte vacío standalone, la selección
   requerida con historia incompleta (dos modos) y la restauración de ausencia
   de memoria (server_sync). Es la misma fuente de la auditoría de fase 4.
2. **Regresiones del árbol pendiente Flutter respecto de HEAD:** 15 de las 16
   fallas de la suite actual no aparecen al ejecutar sus cinco archivos en la
   copia limpia de HEAD. La conexión parcial del command deja harnesses sin los
   nuevos puertos («No se configuró la resolución…»); fallan alta, importación,
   seguimiento/receta y widgets de movimientos. La sonda con puertos completos
   demuestra fallos de negocio adicionales: adaptar harnesses no completa el core.
3. **Preexistente Flutter:** «busca con debounce…» falla también en HEAD limpio.
   No se atribuye a seguimiento ni a esta auditoría.
4. **Preexistentes NestJS:** cinco casos de account-balance-baselines fallan con
   `You must provide selection conditions in order to find a single row.` en
   `AccountBalanceBaselineEventHandler.apply:84`, tanto en el árbol actual como
   en HEAD limpio, con las mismas dependencias instaladas. Quedan fuera del alcance.
5. **Preparación corregida:** 17 fallas de la primera corrida NestJS son la guarda
   de nombres temporales `pos_cash_test_*`, antes de abrir esas suites. Se creó
   otra base con ese prefijo en el mismo clúster aislado y se repitió toda la suite.
   Las primeras 17 no se reinterpretan como pruebas aprobadas de aquella corrida.
6. **Incidencia financiera intermitente, atribución inconclusa:** la primera
   corrida además falló en «push concurrente del mismo event_id produce accepted
   + duplicate», con `toISOString` sobre undefined en
   `FinancialEntryEventHandler.result:240`. Pasó en la segunda corrida actual y
   en las dos ejecuciones de HEAD. Se conserva el fallo y su stack; no se declara
   arreglado ni preexistente demostrado, y no valida la carrera de seguimiento.

### Fallas de la suite Flutter actual

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

## Inspección de código y relevo exacto

Las rutas siguientes son relativas al proyecto Flutter auditado; sus huellas
están en los manifiestos. Son hallazgos de inspección, no pruebas físicas:

1. `application/sync/handlers/producto_event_handler.dart` no consume un store de
   memoria; `data/local/drift/drift_producto_projection_store.dart` tampoco deriva
   filas al crear/desvincular/recuperar. Implementar memoria en aplicación local,
   remota y ecos, con fuente/secuencia y conservación al pasar a receta/ninguno.
2. `application/commands/articulos/inventory_resource_resolver.dart:132` devuelve
   nuevo al no encontrar memoria/procedencia, sin acreditar la cadena legada.
   Consultar historia tipada disponible, distinguir ausencia demostrada de cadena
   incompleta, resolver evidencia única y pedir selección en ambigüedad. Validar
   origen/ocupación/actividad/unidad también para selección y vínculo actual;
   completar candidatos con nombre de unidad y saldo. La selección hoy precede
   a memoria, discrepancia respecto del orden del contrato.
3. `application/sync/handlers/inventory_event_registry.dart` no registra descarte.
   La tabla `inventory_item_discards` y métodos DAO existen, pero no hay command
   emisor, handler ejecutable ni protección de la antigua alta con tombstone.
   Implementar evaluación completa tras el estado previsto, refs tipadas en ambos
   modos, lote edición/descarte atómico, revalidación del disparador/base, borrado
   con cascadas autorizadas y tombstone del evento efectivamente aplicado. Cubrir
   recetas/referencias inactivas/borradores/memoria ajena/saldos/movimientos/origen
   desconocido y balance faltante. Inyectar fallos, repetir y reconstruir desde cero.
4. `drift_producto_projection_store.dart:107` solo captura backup al eliminar
   producto/variantes. Ampliarlo a todo cambio/siembra de memoria.
   `data/local/drift/daos/producto_dao.dart:468` reinserta filas pero no retira las
   que antes faltaban, y oculta errores con catch. Restaurar estado exacto o ausencia
   dentro de la transacción y propagar errores; comprobar cadenas inversas/eco viejo.
5. `core/di/data_dependencies.dart:202` solicita `VariantInventoryMemoryDao` sin
   registrarlo. Completar DI y adaptar consumidores/harnesses existentes. Revisar
   piezas sin consumidor (p. ej. InventoryResourceMemory y helpers de descarte)
   al terminar fase 3; no eliminarlas durante esta auditoría del trabajo previo.
6. Verificar transporte de recuperación/dependencias/origen, conflicto y venta
   tardía con SQLite cliente y PG aislados; rechazar recepción remota de descartes.
   Mantener standalone not_required/sin refs/sin llamadas de red.
7. Cuando fase 3 pase sus criterios, implementar los nueve entregables de fase 4:
   memoria al abrir/reabrir, saldo vigente sin inicial para recuperación, selección
   legada informada, carga/error, revalidación al guardar, cancelación/doble toque,
   resultado posterior al commit y recursos conservados accesibles. Probar unitario,
   medido, receta y UI → command → eventos → tablas → reapertura, y revisión tablet.
8. Solo después ejecutar fase 5 completa: dos clientes aislados A/B y venta offline
   tardía; conflictos y cadenas; replay; respaldo/restauración con descarte; pull
   real a cliente vacío y las 30 aceptaciones. No usar el bootstrap inexistente.

No se lanzaron apps, tablet, emulador ni renderer. No hubo prueba táctil/física,
E2E de dos clientes, HTTP de una instancia Nest ni hidratación por pull hasta
SQLite. Las pruebas de venta tardía atraviesan SyncService y PG real, con gateway
simulado; acreditan el receptor, no dos dispositivos. La guarda general standalone
se ejercita en los tests existentes del event store/configuración/finanzas; la
aceptación integrada de seguimiento sigue pendiente.

Las invocaciones y el procedimiento reproducible están en `Comandos.md`.
La matriz completa de resultados y pendientes está en `Casos de aceptacion.md`.
Puesta en marcha y compatibilidad quedan documentadas allí en continuidad/plan,
como pasos futuros condicionados, sin habilitación ni despliegue.
