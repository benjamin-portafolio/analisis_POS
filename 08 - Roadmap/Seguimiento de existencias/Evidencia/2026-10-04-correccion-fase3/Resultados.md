---
tipo: evidencia_implementacion
fase: 3
estado: core_y_transporte_verificados_ui_pendiente
actualizado: 2026-10-04
---

# Corrección y verificación de fase 3 — 2026-10-04

La petición posterior «corrige los fallos de la fase 3» autorizó implementar el core.
Se corrigieron memoria derivada, recuperación legada, descarte standalone, restauración
exacta, ecos y DI. **Fase 3 verificada en su alcance; fase 4 pendiente y fase 5 no
iniciada. El plan no está completo.** No hubo despliegue, commit ni intervención
sobre datos de uso.

## Cambios efectivos

- `ProductoEventHandler` escribe memoria al crear/vincular, la acredita desde before
  cuando falta y la conserva al desvincular o pasar a receta. El vínculo directo
  verifica coherencia con la procedencia. DI registra el DAO y configura todos los stores.
- `InventoryResourceResolver` valida vínculo actual, memoria y selección; reconstruye
  cadenas causales completas desde el alta. No usa nombre/reloj ni convierte historia
  incompleta en alta nueva. Los candidatos compatibles incluyen nombre, unidad y saldo.
- `ProductoCommandService.actualizarArticulo` mantiene preparación, aplicación del
  producto, comprobación y descarte dentro de una transacción SQLite exterior. Emite
  la edición antes del descarte; los append internos están anidados en esa misma
  transacción. Devuelve IDs descartados y motivos de conservación después del commit.
- `InventoryDiscardPolicy` comprueba procedencia, actividad, vínculos/recetas incluidos
  inactivos, ambos saldos existentes, cualquier movimiento, otras memorias y capturas
  o eventos operativos tipados aplicables. Una captura inconsistente propaga error;
  una condición de conservación guarda solo la edición. No consulta event_refs como
  prueba suficiente. Se reemplazó la búsqueda LIKE del JSON capturado por decodificación
  del formato de consumo existente.
- El handler de descarte verifica modo standalone/not_required, base actual, disparador
  aplicado, transición y elegibilidad. El delete y la prueba persistida son atómicos.
  La prueba se contrasta con el evento de descarte aplicado y el alta histórica;
  repetir otro descarte o reutilizar el UUID en otra alta falla. Reaplicar el alta
  histórica no resucita el recurso. El replay vacío aplica en orden causal, sin precargar
  tombstones futuros. Las cascadas retiran balance/memoria y conservan eventos/variante.
- Todo update optimista pendiente captura undo. Restaurar repone filas exactas de
  memoria o su ausencia; no oculta errores. Push y eco solo avanzan la memoria cuyo
  source_event_id coincide, incluidos snapshots pendientes acreditados por ese evento.
  Se mantienen la limpieza inversa y la conservación de ventas/consumos ya cobrados.
- Server_sync conserva recurso/balance y no emite descarte; RemoteEventApplier rechaza
  descartes externos antes de aplicar un lote, incluso si se hacen pasar por eco.
- Se adaptaron harnesses previos a los puertos reales. La expectativa antigua de crear
  un segundo recurso al reactivar se sustituyó por mismo UUID, un balance y una inicial.
  Se retiró el helper sin consumidores `inventory_resource_memory.dart`.

## Pruebas ejecutadas

| Comprobación | Resultado | Evidencia |
|---|---|---|
| `dart run build_runner build` | exit 0; generado actual, schemaVersion 8 sin cambios | build-runner.log |
| `dart analyze` | exit 0, sin incidencias | dart-analyze.log |
| Core nuevo con SQLite real | 43 aprobadas, 0 fallidas, 0 omitidas | core-43-tests.log; `test/data/local/drift/variant_tracking_phase3_test.dart` |
| HTTP Nest + PG real + tres SQLite | 1 aprobada, 0 fallidas; ejecutada también en suite completa | http-flutter-final.log; `test/integration/variant_tracking_server_test.dart` |
| `flutter test --reporter json` con URL aislada | exit 1: 1061 aprobadas, 1 fallida, 0 omitidas | flutter-test-final.jsonl, test-summary.json |
| `npm run build` | exit 0 | nest-build.log |
| Cinco specs pertinentes con PostgreSQL real | exit 0: 44 aprobadas, 0 fallidas, 0 omitidas | nest-targeted.log/json |

El fallo restante de Flutter es `busca con debounce y conserva búsqueda y filtros al
cambiar de pestaña`, `inventory_management_screen_test.dart`. La auditoría anterior
lo reprodujo mediante `git archive HEAD` (51 aprobadas / la misma búsqueda fallida),
y conserva logs/JSON en `../2026-10-04-prerrequisitos-fase5/`. Los otros 15 fallos
entonces presentes ya no aparecen en la suite completa actual. No se declara verde
la suite completa ni se atribuye la búsqueda a esta funcionalidad.

Las primeras iteraciones de los tests nuevos tuvieron errores de constructor/import,
aserciones del tipo de excepción y factor de la unidad; fueron corregidos sin cambiar
el comportamiento esperado. Una iteración HTTP falló porque buscaba una venta única
entre datos de corridas previas de la misma base aislada; ahora filtra las identidades
del escenario. Los logs de iteración se distinguen de los finales.

## Evidencia esencial

`variant_tracking_phase3_test.dart` usa comandos, handlers, event stores y DAOs reales:
memoria en ambos modos; inicial única; saldo cero con dos movimientos; legado sin origen
por cadena; historia incompleta + selección explícita; recurso faltante sin descarte;
venta medida con escala exacta; exclusiones por receta propia/ajena inactiva, vínculo
inactivo, otra memoria, borrador, evento de movimiento no aplicado, origen desconocido,
actividad, balance faltante y saldos individualmente no cero. Inyecta SQL RAISE(ABORT)
en INSERT de memoria y AFTER DELETE para probar rollback de eventos, edición,
recurso/balance/memoria y tombstone. Prueba descarte idéntico/adulterado/faltante,
alta histórica repetida y reconstrucción desde cero. Prueba ausencia exacta de memoria,
cadenas inversas, confirmación push de fuente/secuencia, preparación de pull oficial,
eco antiguo después de otra fuente y dos altas de origen común con hechos cobrados.
El caso de respaldo utiliza DriftDatabaseSnapshotService/DriftDatabaseRestoreService,
VACUUM INTO, integridad y SHA; path_provider apunta exclusivamente a directorio temporal.

La prueba HTTP crea A/B con identidades distintas y una configuración directa de 10
piezas. B captura y cobra por transferencia en SQLite sin llamadas posteriores de red.
A desvincula y entrega. B entrega la venta y dos ediciones pendientes que entran en
conflicto; la limpieza restaura el estado sin quitar los hechos cobrados. Se reenvía
la misma venta por POST: duplicate. A recupera el mismo UUID sin nuevas iniciales/balances.
Se ejecuta SyncPreflightService real antes del push de recuperación. C reconstruye desde
cero por SyncPullService → GET /sync/pull → applier → handlers; un segundo pull no cambia
nada. Lectura SQL de PG confirma saldos 9/9, dos movimientos (una inicial y un consumo),
una venta, un pago, recurso activo y misma memoria; cero descartes remotos. Consultar
http-client-evidence.json y http-postgres-facts.log/sql para las identidades verificadas.

El servidor de prueba es `pos-nest/test/support/variant-tracking-server.ts`: SyncController,
SyncService y handlers reales, PostgreSQL real, esquema aleatorio; gateway de avisos sin
WebSocket. No es AppModule productivo ni prueba de WebSocket. Los clientes son harnesses
SQLite y servicios reales sin UI. **No hubo tablets, emuladores, interacción táctil ni
pruebas físicas.** La conectividad de B se controla no ejecutando transporte hasta la
entrega; no se simuló una venta con mocks. La prueba HTTP se omite explícitamente si no
hay POS_PHASE3_SYNC_URL; esta ejecución sí tuvo URL y cero omisiones.

## Reproducción y aislamiento

Leer AGENTS.md. Crear un clúster PostgreSQL nuevo con initdb/pg_ctl en directorio temporal,
trust local, listen_addresses 127.0.0.1 y puerto libre; crear pos_nest_test_seg_phase3.
No cargar .env de la app. Con DATABASE_HOST=127.0.0.1, DATABASE_PORT=<puerto aislado>,
DATABASE_USER=seg_phase3, DATABASE_PASSWORD=isolated-trust y ese DATABASE_NAME:

```sh
# En pos-nest
npm run build
RUN_POSTGRES_INTEGRATION=1 npm test -- --runInBand --testPathPatterns='1790774400000-AddInventoryOriginAndVariantMemory.postgres.spec.ts|1790860800000-ReconstructLegacyVariantInventoryMemory.postgres.spec.ts|variant-inventory-memory.postgres.spec.ts|variant-tracking-late-sale.postgres.spec.ts|producto-event.handler.postgres.spec.ts'
POS_PHASE3_URL_FILE=/tmp/seg-http-url.json node_modules/.bin/ts-node test/support/variant-tracking-server.ts
# En pos_flutter, con la URL que escribió el servidor aislado
POS_PHASE3_SYNC_URL=http://127.0.0.1:<puerto-http> flutter test test/integration/variant_tracking_server_test.dart --reporter expanded
flutter test test/data/local/drift/variant_tracking_phase3_test.dart --reporter expanded
dart run build_runner build
dart analyze
POS_PHASE3_SYNC_URL=http://127.0.0.1:<puerto-http> flutter test --reporter json
```

La sesión usó PostgreSQL 18.4 nuevo, puerto 60744, usuario seg_phase3, base
pos_nest_test_seg_phase3. Las 44 pruebas crean/eliminan esquemas aislados; las dos
migraciones solo se prueban allí. El harness HTTP usa synchronize únicamente en su
esquema temporal. Se detuvo el servidor y el clúster al terminar. El clúster se detuvo antes de que
el cleanup HTTP acabara su DROP SCHEMA, causando ECONNREFUSED en el teardown
del harness (http-server.log); después se confirmó el proceso cerrado y se
eliminó el directorio pgdata temporal completo. No es un fallo de las pruebas
de negocio ni se afirma un DROP completado. No se aplicaron
migraciones a dev pos_nest ni se abrió una base SQLite de uso.

Versiones: Flutter 3.41.6/db50e20168, Dart 3.11.4, Node v26.0.0, npm 11.12.1,
PostgreSQL 18.4. Ramas main; HEAD base Flutter 56df46b7c3846a886f039b3e3a7afb8c2bc19974,
NestJS cdd0d690d5338cb3b0331b902275e2ed80c5ee9e, vault 424c8bb7995f49a2255e97c778155efd31b1f648.
No son commits de la entrega: el comportamiento incluye cambios previos y propios
pendientes. `heads.json`, `session-changed-flutter.json` y `source-manifest.json` documentan
la revisión y huellas; los archivos de scanner/plataformas/pubspec ajenos se preservaron.

## Relevo y compatibilidad

Fase 4: consumir resolver/candidatos y ProductoInventoryUpdateResult en el editor;
mostrar saldo vigente, ocultar inicial al recuperar, selección explícita informada,
estados de carga/error, conservación de captura, cancelación y bloqueo de doble toque.
Verificar UI unitario/medido, reapertura y tablet con método documentado. Fase 5 sigue
sin iniciar hasta terminar esos entregables; repetir entonces los escenarios con UI.
No existe bootstrap por snapshots, purga server_sync, fusión ni importación entre modos.
Standalone sigue not_required, sin event_refs; las guardas generales de red pasaron en
la suite completa, sin añadir servicios de red. El transporte de prueba fue server_sync.

Puesta en marcha futura: respaldo compatible probado, revisión de datos/esquemas,
preparación explícita del esquema y receptor PG, clientes coordinados y aceptación de
fase 5. Las migraciones 1790774400000/1790860800000 siguen pendientes en dev pos_nest.
SQLite conserva schemaVersion 8 y detección/reset de desarrollo; una base anterior
puede perder datos al recrearse, un respaldo incompatible protegido falla. No se promete
actualización sin pérdida a instalaciones en uso. No desplegar esta entrega parcial de UI.
