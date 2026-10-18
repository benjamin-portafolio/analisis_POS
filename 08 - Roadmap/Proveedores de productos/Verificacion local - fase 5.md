---
tipo: verificacion_implementacion
estado: fase_5_completa_alcance_local_cerrado
revision_plan: 1
actualizado: 2026-10-08
---

# Verificación local y cierre · fase 5

La aceptación local de Proveedores de productos, revisión 1, está satisfecha.
Se completaron persistencia, respaldo/restauración, reinicios y regresiones en
SQLite aislado. Comprobaciones finales: **1567 pruebas aprobadas, 0 fallidas,
1 omitida remota; dart analyze sin problemas; git diff --check sin errores**.
No quedan defectos funcionales conocidos pendientes dentro del alcance local.
Las fases 6–7 permanecen pendientes de una solicitud explícita.

La [matriz de aceptación](Matriz%20de%20aceptacion%20local.md) relaciona los
16 casos esenciales del plan y las comprobaciones complementarias con su
evidencia. Las 32 filas locales están aprobadas; los 3 casos remotos y las
pruebas físicas están no ejecutados. El inventario exacto de las pruebas de
la suite final se conserva en
[casos-ejecutados.json](Evidencia/2026-10-08-fase5/casos-ejecutados.json).

## Defecto encontrado y corrección

La restauración comprobaba SHA256, integridad, claves foráneas y columnas de
proveedores, pero aceptaba respaldos cuyo esquema no podía abrir la aplicación
actual: una variante sin `barcode` o una versión SQLite distinta. Las tres
pruebas nuevas reprodujeron aceptación indebida antes de la corrección
([acceptance-segunda.log](Evidencia/2026-10-08-fase5/acceptance-segunda.log)).

Se extrajo la comprobación de esquema que ya utilizaba el arranque a
`hasCurrentAppDatabaseSchema` y se reutilizó desde restore. No se cambian sus
reglas de detección/reinicio. Restore exige además `PRAGMA user_version = 8`,
el esquema aceptado por el arranque, integridad correcta y ausencia de FK
huérfanas, antes de cerrar o reemplazar la base vigente. El rechazo mantiene
la conexión operativa, sus filas y eventos, no crea marcador de restauración
y conserva los datos al reiniciar.

Se ajustó únicamente la regresión de Cotizaciones que antes esperaba copiar
un respaldo conocido como incompatible. Ahora comprueba el rechazo previo
al reemplazo y, por separado, marca explícitamente un archivo legado temporal
para mantener la prueba de protección durante el arranque. Un rechazo de
restore y un arranque protegido se registran como hechos distintos.

Archivos de aplicación/pruebas cambiados en esta fase:

- Nuevo `lib/data/local/drift/current_database_schema.dart`.
- Ampliado `lib/data/local/backup/database_restore_service.dart`.
- `lib/data/local/drift/app_database.dart`: llama al predicado extraído.
- Nuevo `test/data/local/drift/supplier_local_acceptance_test.dart`: 8 casos.
- Ajustado `test/data/local/drift/quotation_backup_test.dart`: regresión de rechazo.

`schemaVersion = 8`, `onUpgrade`, tablas, DAOs y `app_database.g.dart` se
conservan. No se regeneró Drift porque no cambió ninguna definición ni DAO.
No se refactorizaron los demás módulos ni se añadieron funcionalidades.

## Persistencia, respaldo y restauración comprobados

Las pruebas nuevas crean los datos por los command services, event store y
handlers reales. El caso poblado crea/edita dos proveedores, conserva teléfono
con ceros iniciales y notas, y guarda un artículo con tres variantes: dos
proveedores/precios/fechas en la primera, un proveedor compartido en la segunda
y conjunto explícitamente vacío en la tercera. El caso vacío conserva un
catálogo vacío y las tres variantes con `suppliers: []`.

Se cierra y abre `AppDatabase()` dos veces con path_provider temporal antes
del respaldo. Se comparan todas las tablas Drift, incluidos identidades,
metadatos, relaciones y eventos; se verifica que el marcador de prueba no fue
eliminado. El respaldo usa `DriftDatabaseSnapshotService` y su mecanismo
existente `VACUUM INTO`, con SHA256, versión, número de eventos y secuencia
local comprobados. No se sustituye por una serialización de fixtures.

El origen se modifica después del respaldo y se cierra. El destino es otro
directorio temporal con datos propios de control; `DriftDatabaseRestoreService`
restaura allí el archivo. Se reinicia dos veces, se comprueban todas las filas
originales, y los repositorios confirman precios, fechas con milisegundos,
identidades, proveedor editado y conjuntos vacíos. La interfaz real de Gestión
del inventario abre el artículo, las tres variantes y sus selectores desde
esos repositorios restaurados. Los campos muestran los precios correctos;
consultar y cancelar no escribe. Reabrir el origen confirma que conserva su
cambio posterior, independiente del destino.

En estas comprobaciones: `integrity_check = ok`, `foreign_keys = 1`,
`foreign_key_check` vacío, eventos `applied/not_required`, cero `event_refs`,
cero eventos pendientes y cero `HttpClient`. Resultados de datos:
[restore-populated.json](Evidencia/2026-10-08-fase5/restore-populated.json) y
[restore-empty.json](Evidencia/2026-10-08-fase5/restore-empty.json).

Se rechazan SHA incorrecto, archivo no SQLite, columna requerida renombrada
y versiones 7/9. Se reutilizan los casos de fase 1 para tablas/columnas de
proveedores ausentes y FK huérfanas, además de arranque de esquema anterior
protegido/no protegido. Los cinco resultados negativos nuevos están en los
archivos `rejected-*.json` de la evidencia. No se ejecutó upload/download de
respaldos en una cuenta remota: la comprobación de fase 5 es del respaldo
SQLite y su restauración local real.

## Flujo, regresiones y modos

Se reutilizaron las pruebas de fases 1–4 de catálogo, selección múltiple,
cero/coma/punto, fechas informadas y conservación cuando no cambia el precio,
retirada del último proveedor, cancelación en tres niveles, guardado/reapertura,
rechazo de datos/base incompatibles, rollback/reintento, compatibilidad legada,
idempotencia, importación y restauración de proyecciones.

La nueva regresión comercial crea una variante con existencias directas y otra
con receta, con saldos iniciales. Abre Caja, agrega ambas a una venta, guarda
una cotización y confirma el cobro por los servicios existentes. Después
captura precios de proveedor y compara filas no vacías de ventas, líneas,
pagos, sesiones/movimientos de Caja, cotizaciones, recetas, saldos y movimientos
de inventario. Todas permanecen iguales; venta, costo estándar y configuración
de consumo conservan sus valores. Resultado:
[regression-commercial-prices.json](Evidencia/2026-10-08-fase5/regression-commercial-prices.json).

La suite completa mantiene las regresiones de ARTÍCULOS, CATEGORÍA, RECURSOS
y PROVEEDORES, edición de artículos/variantes, recetas/seguimiento, Caja,
Cotizaciones e importación. No existe una acción de edición masiva implementada
ni se agregó otro formato CSV de proveedores.

Los comandos declaran y validan refs en ambos modos; solo server_sync las
persiste. Los tests de DI/runtime y la red bloqueada comprueban que utilizar
la función standalone no inicia push, pull, preflight, health ni WebSocket.
La nueva UI, comandos y handlers siguen bloqueados en server_sync; se mantienen
los flujos legados de artículos y sus refs. `not_required` no se promueve a
`pending`. Las pruebas de estas defensas con SQLite son locales; no acreditan
sincronización con un servidor.

## Verificación visual y límites reales

Se reutilizan las seis capturas inspeccionadas de fase 4 y su
[registro de render](Evidencia/2026-10-08-fase4/README.md). No cambiaron archivos
de presentación, de modo que no se repitieron renders. La suite final volvió
a probar selector/editor/consulta, scroll y acceso a Guardar: teléfono 320×640
y 740×360 con escala 1.3, tablet 1280×800 con escala 1.5 e insets simulados
260/170/300. Son renders y teclado del motor de pruebas, no un teclado físico.

No se realizaron pruebas físicas Android/iOS/tablet ni se inició la aplicación
contra datos del usuario. Tampoco se ejecutaron NestJS/PostgreSQL, transporte,
dependencias entre terminales, concurrencia remota o protección entre versiones
de clientes. La omisión preexistente requiere `POS_PHASE3_SYNC_URL` y no cuenta
como validación local o remota.

## Comandos, resultados y preservación

Directorio de trabajo: `/Users/benjamin/Projects/POS/pos_flutter`, `main`,
HEAD `56ddbc4`, con todo el trabajo local previo preservado.

| Corrida | Comando / evidencia | Resultado |
|---|---|---|
| Base inicial | `dart analyze` · dart-analyze-inicial.log | Sin problemas |
| Base inicial | `flutter test --reporter expanded` · flutter-test-inicial.log | 1559 aprobadas, 1 omitida |
| Preparación de test | acceptance-primera.log / acceptance-diagnostico.log | Interrumpidas: apertura diferida de SQLite en reloj de widget; no cuentan como aprobación |
| Preparación de fixture | incompatibilidad-reproducida.log | Falló DROP COLUMN por CHECK; cambiado a RENAME COLUMN; no es un defecto de producto |
| Reproducción funcional | `flutter test test/data/local/drift/supplier_local_acceptance_test.dart --plain-name 'F5 respaldo' --reporter expanded` · acceptance-segunda.log | 4 aprobadas, 3 fallidas: incompatibilidad aceptada antes del fix |
| Analyze intermedio | dart-analyze-correccion.log | 6 avisos de trazas temporales; eliminadas antes del cierre |
| Corrección enfocada | `flutter test` con los cuatro archivos de aceptación/proveedores/Cotizaciones/Caja · acceptance-respaldo-correccion.log | 48 aprobadas en 5 s |
| Final | `dart analyze` · dart-analyze-final.log | Sin problemas; exit 0 |
| Final | `flutter test --reporter json` · flutter-test-final.jsonl | 1567 aprobadas, 0 fallidas, 1 omitida; exit 0; 62.733 s de ejecución |
| Final | `git diff --check` · git-diff-check-final.log | Sin errores; exit 0 |

Para exportar los resultados de aceptación (directorio de evidencia propio):

```sh
POS_SUPPLIER_VERIFICATION_DIR='/ruta/temporal/evidencia' \
flutter test \
  test/data/local/drift/supplier_local_acceptance_test.dart \
  test/data/local/drift/supplier_backup_test.dart \
  test/data/local/drift/quotation_backup_test.dart \
  test/data/local/drift/cash_backup_test.dart \
  --reporter expanded
```

El registro [comprobaciones-finales.json](Evidencia/2026-10-08-fase5/comprobaciones-finales.json)
contiene comandos, tiempos y códigos de salida. Se conservan los logs
intermedios; una corrida fallida/interrumpida no se contabiliza como aprobada.
Las 56 advertencias Drift por instancias múltiples coinciden con la base
inicial y no son fallos; no se comparten executors en las pruebas nuevas.

Se tomó una copia temporal y hashes de los 753 archivos previos bajo
`lib/test/docs`. La comparación final está en
[preservacion.json](Evidencia/2026-10-08-fase5/preservacion.json), con los deltas
de esta fase frente a la copia inicial. No se modificó NestJS ni se abrió,
reinició o reemplazó una base del usuario. El plan revisión 1 y la evidencia
de fases anteriores se conservaron. Los tests eliminan sus bases/snapshots
temporales; la evidencia persistida contiene únicamente datos sintéticos.
