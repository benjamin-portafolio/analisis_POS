# Sesión 2 — Evidencia del core CSV

Fecha: 2026-10-18. Flutter HEAD: `e5d9c7bbc581380d01ffe12088c317891573384f`.
Vault HEAD: `b077dc72cc81ddd991ed7cb36daecd6283368ab2`.
Cambios sin commit, sobre la sesión 1 ya presente en el árbol de trabajo.

Entorno: Flutter test de escritorio, SQLite nativo real y bases aisladas en
memoria. Las comparaciones cubren todas las tablas de AppDatabase, además del
payload tipado y las referencias capturadas antes de persistir. No se usó
servidor ni tablet. Estas pruebas no acreditan el recorrido público de sesión 3,
reapertura final ni presupuesto de rendimiento de sesión 4.

## Casos nuevos

Archivos relativos a `/Users/benjamin/Projects/POS/pos_flutter`:

| Pruebas | Evidencia |
|---|---|
| `test/application/commands/articulos/actualizar_articulo_csv_test.dart` | Actualización acotada real en ambos modos: dos variantes en un evento, filas invertidas sin reordenar, nombres/precios/costos/barcodes/categoría, referencia atómica medida exacta, proveedores con precios/fechas, recetas, inventario, memoria y borrador de venta conservados |
| Mismo archivo | IDs/eventos de creación/orden conservados, variantes activas omitidas con mismo estado comercial e inactivas con fila exacta; solo metadatos normales del agregado avanzan al editar |
| Mismo archivo | Proveedores legados ausentes conservan null; conjuntos conocidos vacíos conservan []; ambos permiten no-op sin efectos |
| Mismo archivo | No-op normalizado, desconocidos/inactivos/ajenos, base vacía/obsoleta, repetición de confirmación vieja, nombres en colisión con omitida, variantes duplicadas/lista vacía/importes/barcode inválidos |
| Mismo archivo | Barcode compartido permitido sin transferirlo, categoría oficial referenciada, bases oficiales/pendientes conservadas y rechazo de historial standalone desde server_sync sin promoverlo |
| `test/application/import/articulo_import_mixed_batch_service_test.dart` | 500 existentes: 20 cambios + 480 omitidos, un lote de 20 y exactamente 20 eventos; omitidos conservan filas/metadatos; reimportar con revisión fresca da 500 omitidos y cero lotes/lecturas/escrituras en ejecución |
| Mismo archivo | 27 altas + 27 actualizaciones + 1 omitido: lotes de 50 y 4 productos; recursos antes de productos; refs declaradas y, en server_sync, persistidas exactamente |
| Mismo archivo | Primer lote de 25 altas con seguimiento + 25 actualizaciones falla después de aplicar una actualización; hay recursos, productos y undo (solo server_sync) dentro de la transacción al fallar; todas las tablas vuelven exactamente al estado anterior; el segundo lote aplica una actualización sin reintentar el primero |
| Mismo archivo | Base obsoleta de un plan mixto falla en preparación y no alcanza append; no-op final da cero SQL de escritura; un store con batch atómico pero sin transacción exterior se rechaza |
| Mismo archivo | El progreso se observa fuera de la transacción; lecturas de preparación se observan dentro; runtime standalone y lote mixto no resuelven el monitor de servicios remotos |

Cobertura de core correspondiente a C03–C06, C08–C09, C13–C15, C17–C25,
C32–C37 y C40. No se marca completa la matriz: los recorridos de UI y la
verificación final de sesión 4 permanecen pendientes. C19 no expone campos de
venta/seguimiento en el comando y conserva la validación de sesión 1.

## Comandos

Desde Flutter:

```sh
dart analyze
flutter test test/application/commands/articulos test/application/import test/data/local/import test/data/local/export test/presentation/pages/gestion_inventario/carga_masiva --reporter expanded
flutter test --reporter expanded
git diff --check
```

Resultados definitivos en los logs y en Estado y continuidad. El log enfocado
incluye las 55 pruebas nuevas del core y las regresiones previas. Los dos ficheros
ajenos de escaneo de Caja conservaron sus hashes iniciales.

El helper del benchmark de sesión 1 ahora delega también la capacidad
transaccional real que exige el ejecutor. No se han sustituido resultados de la
referencia histórica ni ejecutado comparativas nuevas de rendimiento; las
mediciones comparables, 1.20×, reapertura y tablet siguen siendo sesión 4.
