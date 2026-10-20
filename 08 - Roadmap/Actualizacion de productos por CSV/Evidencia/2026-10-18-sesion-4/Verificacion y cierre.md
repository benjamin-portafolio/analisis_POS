# Sesión 4 — Verificación local y pendientes reales

Fecha: 2026-10-18. Flutter HEAD `e5d9c7bbc581380d01ffe12088c317891573384f`,
vault HEAD `b077dc72cc81ddd991ed7cb36daecd6283368ab2`. Las sesiones 1–4 siguen
sin commit. Se revisaron AGENTS del vault, Flutter y NestJS, las dos guías
offline-first, plan, continuidad, matriz, sesión 4 y evidencia de sesiones 1–3.

**Resultado:** C01–C43 aprobados en su alcance local de escritorio. C44 parcial;
selector nativo macOS fallido y tablet no ejecutada. La sincronización HTTP
no fue ejecutada. No se declara cierre completo ni rendimiento físico.

## Cambios de esta sesión

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`:

| Archivo | Cambio atribuible a sesión 4 |
|---|---|
| `test/application/commands/articulos/actualizar_articulo_csv_test.dart` | Dos tests C43 nuevos, uno por modo, con SQLite nativo **en disco**. Exportar/editar/aplicar, igualdad de todas las tablas al reabrir, repetición sin escrituras/historial y rollback después de proyectar conservado al reabrir |
| Mismo archivo | Fixture medido de conservación reforzado: referencia histórica de precio de 250 átomos en kg. El alta actual exige factor 1000, por lo que se siembran de forma coherente proyección y payload original históricos antes de probar el CSV. No se cambian reglas de alta |
| `lib/data/local/import/articulo_import_csv.dart` | Retirada bandera temporal `permitirIdentidad`, su rama y mensaje «todavía no está habilitado». El contrato público de doce columnas ya se activó en sesión 3; diez columnas conservan altas exclusivamente |
| `test/data/local/import/articulo_import_identity_test.dart` | Sustituida prueba de bloqueo temporal por comprobación del contrato público sin bandera, para alta y existente |
| `lib/application/export/articulo_catalog_export_service.dart` | Corregida documentación obsoleta: el CSV sí incluye product_id/variant_id, sin exportar bases/versiones internas |
| `tool/benchmarks/articulo_import_verification.dart` | Harness manual reproducible con siete escenarios × dos modos × cinco muestras, calentamiento descartado, bases nuevas y auditoría SQL/transacciones/eventos/refs/undo/historial/RSS |
| `tool/benchmarks/articulo_import_manual.dart` | Entry point manual aislado usando UI y servicios reales. Callback de archivo fijo **explícito** solo al activar `CSV_MANUAL_DIRECT_FILE`; no resuelve la base ni configuración instalada |

No se modificó lógica de comandos/productores/event store/handlers para optimizar,
ni esquema, tablas, DAOs, migraciones, dependencias, infraestructura o servidor.
No se necesitó corregir un defecto de negocio de CSV. La limpieza elimina
estructura temporal y textos obsoletos. La opción de exportar sin IDs se conserva
para las regresiones explícitas del CSV anterior; `watchArticulos().first` solo
queda en el harness histórico de baseline, preservado para reproducir la
referencia. No quedaron flags temporales de habilitación del importador.
`build_runner` no aplica.

## Pruebas finales ejecutadas

```sh
dart analyze
flutter test test/application/commands/articulos/actualizar_articulo_csv_test.dart --reporter expanded
flutter test --concurrency=2 --reporter expanded
git diff --check
```

- **dart analyze:** No issues found. `dart-analyze-final.log`.
- **Comandos CSV:** 44 aprobadas, cero fallos. `csv-command-final.log`.
- **Suite global definitiva:** **2191 aprobadas, cero fallos, 10 omitidas**.
  `flutter-test-final.log`. Incluye pruebas previas de importación/exportación,
  PDF, comandos, referencias, lotes, interfaz, concurrencia, rollback y los
  nuevos casos de reapertura. Se usa concurrencia 2 como en la repetición final
  de sesión 3; no es un benchmark.
- **Rendimiento:** dos pruebas manuales aprobadas, una por modo; 70 muestras
  finales más 14 calentamientos descartados. Contadores y aserciones reales en
  JSON/logs. No se establecen umbrales temporales frágiles en la suite normal.
- **Omitidas:** nueve de `test/integration/product_suppliers_server_test.dart`
  (`POS_SUPPLIER_SYNC_URL`) y una de
  `test/integration/variant_tracking_server_test.dart` (`POS_PHASE3_SYNC_URL`).
  Requieren NestJS/PostgreSQL aislados. No se levantó infraestructura ni se
  contactó producción; **no se cuentan como aprobadas**.
- **No ejecutadas:** tablet, selector/compartir móvil, medición física y
  memoria por fase/importador. Falta baseline comparable de tablet/server_sync.
- **Manual:** compartir local/edición/revisión/cancelación/guardado/repetición/
  reapertura reales de escritorio aprobados con el límite del callback fijo.
  **Selector nativo macOS fallido**, pendiente explícito. Ver
  [[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Recorrido manual|Recorrido manual]].

## Trazabilidad C01–C44

La matriz conserva el resultado esperado de cada caso y añade estado/evidencia.
Claves de sus archivos de prueba, todos incluidos en la suite final:

| Clave | Archivo(s) y evidencia |
|---|---|
| P | `test/data/local/import/articulo_import_identity_test.dart`, `articulo_import_csv_test.dart`: C01–C22, C25–C28, formatos, normalización, identidad opaca, errores de grupo y no fusión por nombre/barcode |
| L | `test/data/local/import/drift_articulo_import_preparation_test.dart`: seis lecturas por conjuntos, cero escrituras, actividad/pertenencia reales y snapshots de todas las tablas al preparar; catálogo mayor |
| C | `test/application/commands/articulos/actualizar_articulo_csv_test.dart`: identidad/creación/orden, variantes omitidas e inactivas, receta/recurso/memoria/saldos/borrador, proveedores con precios/fechas/null/[], referencia atómica exacta, retiro de opcionales, barcode compartido, no-op, bases obsoletas, refs declaradas/validadas y estado por modo |
| B | `test/application/import/articulo_import_batch_service_test.dart`, `articulo_import_mixed_batch_service_test.dart`: altas 500/1000 eventos y diez lotes; 20 cambios/480 omitidos; lotes de 50, mezcla real, rechazo de base; rollback completo con error después de proyectar y continuación del lote siguiente |
| W | `test/presentation/pages/gestion_inventario/carga_masiva/bulk_import_persistence_test.dart` y `bulk_import_screen_test.dart`: recorrido público, confirmación fresca, cancelación, concurrencia posterior, doble toque, no-op, errores por producto y rollback con SQLite real |
| E | `test/data/local/export/drift_articulo_catalog_export_service_test.dart`, `test/data/local/import/articulo_import_csv_vuelta_test.dart`, `articulo_import_csv_test.dart`: catálogo/plantilla/notas doce columnas, IDs reales/vacíos, BOM/ceros, CSV anterior, PDF comercial sin IDs; vuelta pública en W |
| R | Los dos tests `C43 exportar, editar, reabrir, repetir y revertir en disco` dentro de C: todo el estado SQLite idéntico tras reapertura, incluidas refs/undo/inventario y entrega; repetición sin INSERT/UPDATE/DELETE/custom/batch ni SELECT de historial; rollback durable |
| M | `tool/benchmarks/articulo_import_verification.dart`, JSON finales y [[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Rendimiento|Rendimiento]]: C39–C42, 500 filas/catalogo 10000, cinco corridas por escenario y modo, 20/500 cambios, mixtos intercalados y omitidos sin SQL de escritura/historial |

Referencias: en ambos modos los stores observados reciben refs del producto,
variantes, categorías, unidades, recursos, recetas y proveedores según el
agregado real. Se comprueba rechazo de lista vacía incluso en standalone;
SQLite confirma cero event_refs en standalone y refs exactas en server_sync.
Standalone conserva not_required y el test de runtime/lote mixto impide resolver
el monitor remoto: no inicia push/pull/preflight/health/WebSocket. El historial
standalone sigue rechazándose desde server_sync, sin promover eventos ni refs.
Las bases pendientes/oficiales y recuperación local de conflictos se verifican
con los tests existentes; esto no acredita transporte HTTP nuevo.

Los escenarios omitidos tienen seis SELECT ligeros en revisión y cero SQL en
ejecución, también con catálogo de 10000 productos/variantes. Los snapshots
completos y lecturas históricas se reservan para productos cambiados. Los
snapshots completos usados por **las aserciones** están fuera del cronómetro.

## Intentos fallidos y correcciones, sin ocultarlos

- `reapertura-primer-intento.log`: la primera versión del test importaba un
  paquete CSV que no existe en el proyecto. Fallo de compilación del test;
  se retiró el import sin instalar dependencias. El fixture controlado no tiene
  campos escapados; las regresiones existentes prueban el CSV general.
- `reapertura-segundo-intento.log` y `reapertura-tercer-intento.log`: una
  aserción del test exigía pending a todos los eventos server_sync, incluyendo
  el borrador de venta que correctamente es not_required. Se acotó a eventos
  de producto, conservando comparación completa de SQLite para todo el resto.
  El tercer intento todavía contenía esa aserción por una edición que no coincidió.
  `reapertura-final.log`: dos aprobadas antes de reforzar el fixture histórico.
- `flutter-test-antes-limpieza.log`: primera global, 2191 aprobadas, cero
  fallos, 10 omitidas; anterior a retirar la bandera temporal.
- `flutter-test-fixture-invalido.log`: segunda global, 2187 aprobadas,
  **cuatro fallidas**, 10 omitidas. El fixture intentaba crear referencia 250
  por el comando que exige factor 1000. Se corrigió el setup histórico sin
  cambiar el producto. `csv-command-final.log` y la global final pasan con el
  fixture reforzado. No se atribuye este fallo a código ajeno/preexistente.
- `dart-analyze-primer-intento.log` / `dart-analyze-segundo-intento.log`:
  import sin uso y llave faltante en el harness, corregidos. Análisis final limpio.
- Build profile universal fallida en `manual-app.log`; build arm64 aprobada.
  Selector macOS fallido: permanece pendiente, no se declara corregido.
  `manual-entitlements.log` captura la firma de la app sin permisos user-selected;
  el código instalado de file_picker los comprueba antes de crear NSOpenPanel.
  Es el diagnóstico sustentado por código/firma; la UI solo mostró el error
  genérico de lectura y no expuso el código PlatformException.
- JSON/logs `rendimiento-*-preliminar.*` conservan la primera captura. Los
  definitivos se repitieron sobre la limpieza final, con mezclas intercaladas
  dentro de los seis lotes. Las tablas finales usan solo JSON sin ese sufijo.

## Preservación y reproducción

`estado-inicial.json` registra Git y SHA-256 de todos los archivos modificados
al iniciar (41 de Flutter y 31 del vault), excluyendo esta evidencia nueva.
`estado-final.json` y `preservacion.json` comparan los mismos archivos. Solo se
continuaron tres archivos previos de Flutter (parser, identidad y comandos CSV)
y Estado y continuidad del vault. Matriz/documentación de exportación y dos
harness reciben los cambios descritos arriba. El resto conserva sus hashes (38 archivos previos Flutter y 30 del vault),
incluidos escaneo de Caja, escaneo de Inventario, mapa ajeno del vault, plan de
edición/recepción y evidencias históricas/baseline de sesiones 1–3.

Se adjuntan ambos harness finales, script de resumen `resumir_rendimiento.py`,
script read-only `auditar_manual.py`, fixtures manuales y snapshots JSON.
Los scripts usan solo Python estándar y las dependencias Flutter ya existentes.
Comandos y condiciones de benchmark/reproducción están en Rendimiento y
Recorrido manual. No hay cambios de servidor, instalaciones ni commits.
