---
tipo: seguimiento_implementacion
estado: sesion_4_verificada_local_con_pendientes
revision_plan: 1
actualizado: 2026-10-19
---

# Estado y continuidad: actualización por CSV

Plan: [[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|Revisión 1]].
Aceptación: [[08 - Roadmap/Actualizacion de productos por CSV/Matriz de aceptacion|C01–C44]].

## Estado actual

| Etapa | Estado |
|---|---|
| Planificación y lectura del código | Completadas |
| 1. Contrato y detección | Implementada; evidencia de revisión local al final |
| 2. Comandos y lotes | Implementada; core verificado con SQLite real |
| 3. Interfaz y recorrido completo | Implementada; recorrido público y pruebas de interfaz con SQLite real |
| 4. Verificación y rendimiento | Ejecutada localmente; C01–C43 aprobados, C44 parcial y HTTP omitido |
| Medición en tablet | Pendiente; no hay tablet conectada |
| Selector nativo macOS | Falló por entitlement previo ausente; pendiente de resolver/verificar aparte |

Las sesiones 1–3 implementan contrato, revisión local, comando CSV acotado,
lotes mixtos atómicos y el recorrido público completo. La pantalla prepara
mediante la lectura específica, presenta diferencias, vuelve a preparar antes
del diálogo final y guarda exactamente las bases confirmadas. Catálogo,
plantilla y notas públicas usan doce columnas; diez columnas siguen siendo
exclusivamente altas. El PDF conserva su compositor comercial sin IDs.
No se modificaron esquema, dependencias ni servidor. La sesión 4 verifica
reapertura en disco y el conjunto local, elimina una bandera temporal y añade
mediciones reproducibles: 70 muestras finales, separadas por modo y escenario.
Las altas standalone cumplen 1.20× del baseline equivalente (1.1069× sin
seguimiento, 1.1574× con seguimiento). La referencia histórica permanece intacta.

La suite final tiene **2191 aprobadas, cero fallos y 10 omitidas** de HTTP.
`dart analyze` no presenta problemas. El recorrido manual de escritorio profile
verificó compartir local, edición, revisión/cancelación, un update, repetición
sin escrituras y reapertura. El selector nativo macOS falló antes de abrirse;
se completó el negocio con callback explícito al archivo aislado, sin considerar
aprobado el selector. **No hay cierre completo de C44 ni validación física.**

Detalle: [[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Verificacion y cierre|Verificación de sesión 4]],
[[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Rendimiento|Rendimiento]] y
[[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Recorrido manual|Recorrido manual]].

El usuario aceptó usar IDs. El alcance de primera entrega contempla altas y
ediciones de datos comerciales sobre productos/variantes existentes, no
cambios de estructura ni de existencias. Los CSV anteriores siguen siendo de
alta; nunca se actualiza por coincidencia de nombre o barcode.

## Estado observado de los repositorios

- Flutter en `/Users/benjamin/Projects/POS/pos_flutter`, HEAD `e5d9c7b`.
  Cambio ajeno observado en
  `lib/presentation/pages/caja/sale_barcode_scanner_screen.dart`.
- El vault de análisis estaba en HEAD `424c8bb` con múltiples cambios ajenos,
  incluidos `00 - Inicio/Mapa del vault.md`, documentación, `.obsidian` y
  archivos sin seguimiento. Se preservaron; el mapa recibe solo un enlace más
  y la fecha de actualización de esta sesión.
- Estos datos son históricos. Releer `git status --short` en ambos al retomar;
  no restaurar archivos de otro trabajo ni asumir árbol limpio.

## Próximo paso

**Nueva planificación, sin implementación (2026-10-19):**
[[08 - Roadmap/Carga masiva y sincronizacion/Plan de implementacion|Carga masiva de hasta 200 filas y seguimiento de sincronización]].
El usuario pidió documentar el máximo de 200 filas, impedir otra carga CSV
mientras la anterior necesite entrega/revisión en `server_sync`, permitir las
demás operaciones y recomendar conexión al servidor. El plan conserva eventos
individuales y propone paquetes acotados por cantidad/bytes, seguimiento
persistente, reanudación y excepción standalone. El código aún conserva el
límite de 500; no confundir este plan con un cambio ya aplicado. Sus casos M01–M18
están pendientes y no reemplazan la evidencia histórica C01–C44.

Continuar solo las verificaciones pendientes con condiciones disponibles:

1. **C44, tablet:** compartir/exportar, editar, selector real, revisión, guardado
   y repetición con datos aislados en profile/release, registrando modelo/SO/build.
   Medir rendimiento físico separado del JIT de escritorio. No existe baseline
   histórico de tablet; no inventar comparación.
2. **Selector nativo macOS:** el intento real falló; `file_picker` exige un
   entitlement de archivos que ya falta en HEAD. No se cambiaron permisos en
   esta funcionalidad. Resolver y verificar ese soporte de plataforma en alcance
   explícito; el callback del harness no sustituye la selección nativa.
3. **HTTP:** ejecutar las nueve integraciones de proveedores y una de seguimiento
   cuando haya NestJS/PostgreSQL aislados disponibles. Se omitieron, no aprobaron;
   no se instaló infraestructura ni se contactó producción.

Las mediciones C39–C42 y reapertura C43 ya están ejecutadas. No reiniciar las
sesiones anteriores ni repetir toda la regresión sin cambios/fallos que lo
justifiquen. Releer Git y preservar el árbol sin commit y el trabajo ajeno.

La ejecución usa la API de sesión 2:

```dart
await batch.importar(
  reporte.productos,
  actualizaciones: reporte.productosConCambios,
  omitidos: reporte.productosSinCambios,
  onProgress: publicar,
);
```

No sustituir `baseEventId` después de confirmar ni reintentar automáticamente.
`productosTotales` cuenta ejecutables; omisiones no consumen lote. El progreso
se publica tras commit/rollback y distingue creados/actualizados/omitidos/fallidos.
Con todo sin cambios, la pantalla informa el resultado sin ejecutar lotes.

## Riesgos que debe recordar la siguiente sesión

1. `actualizarArticulo` recibe el agregado completo; no pasarle directamente
   las filas parciales del CSV ni comandos de alta con defaults de inventario.
2. Las existencias de un export antiguo no deben generar ajustes ni errores
   por diferir del saldo vivo. El seguimiento debe conservarse.
3. Los IDs no incluyen revisión de exportación. La protección contra
   concurrencia comienza al preparar/confirmar y usa la base observada.
4. `sameState` requiere estados completos, con semántica legada de proveedores.
   Comparar solo los campos editables para detectar; preservar lo demás al guardar.
5. No perder el camino rápido de altas ni generar escrituras para omitidos.

## Registro por sesión

Al cerrar cada implementación, añadir fecha, revisión, archivos cambiados,
casos resueltos, comandos/resultados, mediciones o pendientes y próximo paso.
No marcar como aprobada una prueba de tablet a partir de resultados de escritorio.


### 2026-10-18 — Sesión 1: contrato y detección

**Revisión:** Flutter HEAD `e5d9c7bbc581380d01ffe12088c317891573384f`;
implementación en el árbol de trabajo, sin commit. Vault HEAD `b077dc7`
observado al cierre (la revisión `424c8bb` de arriba es histórica).
Se leyeron AGENTS del vault, Flutter y NestJS, las dos guías offline-first y
los cuatro documentos indicados. No hubo cambios en NestJS.

**Cambios ajenos preservados:**

- Flutter: `lib/presentation/pages/caja/sale_barcode_scanner_screen.dart` y
  `test/presentation/pages/caja/sale_barcode_scanner_screen_test.dart`, ya
  modificados al iniciar. No fueron editados por esta sesión.
- Vault: múltiples archivos modificados/sin seguimiento (incluida esta carpeta
  del plan y `.obsidian/workspace.json`). Solo se editó este estado y se añadió
  `Evidencia/2026-10-18-sesion-1/`; no se restauró ni limpió trabajo ajeno.

**Implementado:**

- Contratos explícitos de diez columnas anteriores (solo altas) y doce columnas
  (`product_id`, `variant_id` al principio). BOM, coma, importes half-up,
  encabezado estricto y máximo de 500 filas conservados. El parser no importa
  Drift ni el compositor de exportación; comparte constantes puras de contrato.
- Identidad opaca por ambos IDs recortados, sin NFKC ni conversión de mayúsculas
  en los IDs. Ambos vacíos crean una propuesta de alta sin generar identidad.
  IDs incompletos/desconocidos/inactivos/ajenos y variant_id repetido son errores.
- Grupos de actualización por product_id, altas por la regla anterior de nombre,
  sin inferir identidad por nombre/barcode. Altas del mismo nombre de un producto
  existente o propuesto para actualización se rechazan.
- Reporte con `productos` **exclusivamente para altas**,
  `productosConCambios`, `productosSinCambios` y `errores`, con conteos separados
  de filas por conjunto. Un error de actualización excluye el agregado entero.
- Comparación normalizada de datos editables (centavos/texto visible/categoría
  resuelta por ID), vacíos de categoría/costo/barcode como retiro/desconocido,
  cambios visibles de mayúsculas detectados. Tipo/unidad/seguimiento protegidos.
- Existencias informativas en existentes: vacío admitido, cantidad inválida
  rechazada, saldo no comparado ni incluido en la propuesta editable.
- Validación contra todas las variantes activas, incluidas las omitidas,
  conservando identidades, orden local y referencia atómica exacta de venta en
  la foto observada. No se reconstruyen recetas ni proveedores en revisión.
- Puerto de lectura y adaptador Drift con foto consistente en transacción de
  lectura: nombres ligeros, categorías y unidades una vez, productos por IDs y
  variantes por dos conjuntos de hasta 500 IDs. Incluye estado inactivo y
  pertenencia; no consulta saldos, eventos, undo ni detalles ajenos al archivo.
- Catálogo/plantilla/notas de doce columnas preparados y probados (IDs reales
  solo en catálogo, vacíos en plantilla, cuatro productos/cinco filas, doce
  notas). PDF conserva su compositor comercial.
- DI prepara `ArticuloImportPreparationService` para la integración futura.
  El servicio público anterior **rechaza el formato con IDs** y exporta diez
  columnas. La UI nueva se activa junto con su guardado en sesión 3. Las
  propuestas de edición tienen un tipo distinto de las altas y no pueden
  entrar accidentalmente en la lista de `ArticuloImportBatchService`.

**Archivos Flutter modificados/añadidos por esta sesión** (relativos a
`/Users/benjamin/Projects/POS/pos_flutter`):

| Responsabilidad | Archivos |
|---|---|
| Contrato y reporte | `lib/application/import/articulo_csv_contract.dart`, `articulo_catalog_import_service.dart` |
| Lectura y preparación | `lib/application/import/articulo_import_catalog_reader.dart`, `articulo_import_solicitud.dart`, `articulo_import_preparation_service.dart`, `lib/data/local/import/drift_articulo_import_catalog_reader.dart` |
| DTOs de comparación | `lib/application/import/articulo_import_producto_local.dart`, `articulo_import_variante_local.dart`, `articulo_import_actualizacion.dart`, `articulo_import_variante_cambio.dart` |
| Parser/clasificación | `lib/data/local/import/articulo_import_csv.dart` |
| Exportación preparada | `lib/data/local/export/articulo_catalog_csv.dart`, `drift_articulo_catalog_export_service.dart` |
| Composición | `lib/core/di/data_dependencies.dart` |
| Pruebas nuevas | `test/data/local/import/articulo_import_identity_test.dart`, `drift_articulo_import_preparation_test.dart` |
| Pruebas ampliadas/fixtures explícitamente legados | `test/data/local/import/articulo_import_csv_test.dart`, `test/data/local/export/drift_articulo_catalog_export_service_test.dart`, `test/application/import/articulo_import_batch_service_test.dart`, `test/presentation/pages/gestion_inventario/articulos/inventory_barcode_flow_test.dart` |
| Medición reproducible manual | `tool/benchmarks/articulo_import_baseline.dart` (fuera de la suite automática normal) |

**Pruebas y resultados:**

- 25 pruebas nuevas: 18 de contrato/identidad/comparación, 5 de preparación con
  SQLite real y 2 de exportación preparada. Se conservan las pruebas anteriores
  de altas, lotes, modos, exportación/PDF y UI.
- Cubierta la parte de **lectura y clasificación** de C01–C22 y C25–C29. Las
  afirmaciones de eventos/guardado incluidas en esos casos siguen pendientes
  de sesión 2; los recorridos de UI, sesión 3. No se marca completa la matriz.
- SQLite real: snapshots de todas las tablas idénticos antes/después de preparar
  cambios, iguales y errores; interceptor confirma cero INSERT/UPDATE/DELETE/
  custom/batch en la revisión. Se conservan base, variantes omitidas e inactivas.
- Prueba de 500 omitidos con catálogo de 10000 productos: seis SELECT, cero
  escrituras, detalle limitado a los productos involucrados. Es evidencia
  estructural de C41, no medición final de rendimiento ni prueba en tablet.
- `dart analyze`: sin problemas.
- Suite enfocada de importación/exportación/lotes/carga masiva: 145 aprobadas.
- Después de limpiar la dependencia del parser al exportador y ajustar el fixture
  legado de escaneo: suite enfocada con escaneo de inventario, 162 aprobadas.
- Primera suite global: 2112 aprobadas, 10 omitidas, 2 fallidas. Ambos fallos
  fueron introducidos por el cambio de encabezado compartido en un fixture de
  escaneo que seguía teniendo diez campos; se corrigió usando
  `columnasAnteriores`. No se atribuyen a fallos preexistentes.
- **Verificación final sobre el código definitivo:** `dart analyze` sin
  problemas; `flutter test --reporter expanded`: **2114 aprobadas, cero fallos,
  10 omitidas**, duración aproximada 1 min 51 s. Las omitidas son las nueve
  pruebas de `test/integration/product_suppliers_server_test.dart` (requieren
  `POS_SUPPLIER_SYNC_URL`) y la de
  `test/integration/variant_tracking_server_test.dart` (requiere
  `POS_PHASE3_SYNC_URL`); todas dependen de NestJS/PostgreSQL aislados.
  No hubo fallos preexistentes observados en las pruebas ejecutadas.
- Logs finales en `Evidencia/2026-10-18-sesion-1/dart-analyze-final.log`,
  `flutter-test-final.log`, `pruebas-importacion-exportacion.log` y
  `pruebas-importacion-escaneo.log`.
- `git diff --check`: correcto. No hubo cambios de tablas/DAOs; no aplica
  `build_runner`.

**Referencia de rendimiento previa:**
[[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-1/Referencia de rendimiento|Detalle, fixtures, entorno, comando y límites]].
Cinco muestras por escenario con calentamiento descartado y bases aisladas
nuevas en MacBook Air M5/macOS, Flutter test JIT/standalone:

| 500 altas | Mediana lectura/validación | Mediana guardado | Mediana total |
|---|---:|---:|---:|
| Sin seguimiento | 5.261 ms | 123.414 ms | 128.675 ms |
| Con seguimiento | 5.623 ms | 372.337 ms | 377.960 ms |

Diez lotes exteriores; 500/1000 eventos; cero event_refs. Los rangos, SQL,
transacciones anidadas y límite del máximo RSS acumulado están en la evidencia.
No usar estos números como velocidad de tablet ni garantía de CI.

**Pendientes explícitos:**

1. Sesión 2: comando CSV acotado, guardado con base confirmada, no-op final,
   lotes mixtos atómicos y progreso diferenciado; SQLite real para preservación
   de recetas/proveedores/memoria/identidades y rollback, ambos modos.
2. Sesión 3: integrar preparación en pantalla, resumen/diferencias, confirmación
   y revalidación, activar CSV de doce columnas de entrada/salida simultáneamente.
3. Sesión 4: comparativas finales de escenarios y objetivo 1.20×, reapertura y
   regresión de persistencia de actualizaciones; prueba manual y mediciones en
   tablet profile/release con modelo. No hay tablet disponible en esta sesión.
4. Integraciones HTTP existentes que requieren NestJS/PostgreSQL aislados: no
   se levantó servidor; no se equipara su omisión con aprobación.


### 2026-10-18 — Sesión 2: comandos y lotes atómicos

**Revisión:** Flutter HEAD `e5d9c7bbc581380d01ffe12088c317891573384f`;
Vault HEAD `b077dc72cc81ddd991ed7cb36daecd6283368ab2`.
Implementación sobre el árbol de sesión 1, sin commit. Se leyeron AGENTS
aplicables del vault y Flutter, AGENTS de NestJS como pide el plan, las dos
guías offline-first, el plan, continuidad, matriz y sesión 2. No se modificó
NestJS ni se conectó un servidor.

**Trabajo previo y ajeno preservado:**

- Se reutilizaron parser, propuestas, lector y preparación de sesión 1. Sus
  cambios sin commit se conservaron; no se restauró ningún archivo.
- Los dos archivos ajenos de escaneo de Caja conservaron exactamente sus
  hashes iniciales (`sale_barcode_scanner_screen.dart` y su prueba).
- Durante esta sesión aparecieron cambios ajenos adicionales en el vault:
  `00 - Inicio/Mapa del vault.md` y la carpeta sin seguimiento
  `08 - Roadmap/Edicion masiva y recepcion de mercancia/`. No se tocaron.
  Se conservaron también la evidencia y el registro completos de sesión 1.

**Implementado:**

- `ActualizarArticuloCsvCommand` recibe productId, base confirmada, nombre,
  categoría y valores editables de variantes identificadas. No admite venta,
  inventario, orden, recetas ni proveedores como entradas de edición.
- `ProductoCommandService.actualizarArticuloDesdeCsv` exige transacción real,
  relee producto/variante activos, pertenencia y base dentro de ella. No rebasa
  la base confirmada y conserva el rechazo de historial `not_required` desde
  `server_sync`. Un comando vacío o con variantes repetidas se rechaza.
- Snapshot completo leído directamente del puerto, sin `withKnownSuppliers`.
  Solo se superponen nombre/categoría y nombre/precio/costo/barcode de variantes
  incluidas. Se conservan variantes omitidas, IDs/eventos de creación/orden,
  configuración de venta exacta, recetas, proveedores con precios/fechas y
  desconocimiento legado, recursos, balances, movimientos, memoria y ventas.
- Reutilización de `ProductoCreadoPayload` para validaciones completas y de
  `ProductoActualizadoPayload`, `sameState`, `_updateEvent`, dependencias y
  `_buildArticleRefs`. Varias variantes cambiadas emiten un solo evento;
  estado final igual no crea evento, refs, undo ni SQL de escritura.
- `importarArticulosLote` admite hasta 50 productos, rechaza productos de
  actualización duplicados y exige capacidades batch atómica y transaccional
  exterior. La preparación de altas/actualizaciones y su aplicación comparten
  esa transacción. Altas puras reutilizan `_crearArticulosLote`; todos los
  recursos nuevos preceden a productos.
- `ArticuloImportBatchService.importar` acepta listas separadas de altas,
  actualizaciones y omitidos. Ordena ejecutables por primera línea del archivo,
  excluye omitidos del tamaño de lote y continúa después de rollback sin
  reintentos automáticos ni commits individuales. Los errores identifican
  lote, nombres, líneas, IDs existentes y motivo.
- Progreso separado de creados/actualizados/omitidos/fallidos. Publica foto
  inicial y luego una por lote tras completar commit/rollback; jamás informa
  productos provisionalmente proyectados como importados.
- Refs declaradas y validadas en ambos modos; solo `server_sync` las persiste
  junto con eventos pendientes/undo/dependencias existentes. Standalone usa
  `not_required`, cero refs persistidas y no inicia actividad remota ni promueve
  historial. No hubo cambios de tablas, esquema, dependencias ni contratos de
  evento; no aplica `build_runner`.
- No hay interfaz nueva ni activación pública. DI conserva
  `ArticuloImportCsv(permitirIdentidad: false)` y el exportador conserva
  `contratoConIds = false`; solo se ajustaron firmas de dos dobles de UI.

**Archivos Flutter de esta sesión** (relativos a
`/Users/benjamin/Projects/POS/pos_flutter`; los demás cambios de Git son previos):

| Responsabilidad | Archivos |
|---|---|
| Comandos nuevos | `lib/application/commands/articulos/actualizar_articulo_csv_command.dart`, `actualizar_articulo_variante_csv_command.dart` |
| Comando/lote y resultado | `lib/application/commands/articulos/producto_command_service.dart`, `producto_import_lote_result.dart` |
| Ejecución, progreso y error | `lib/application/import/articulo_import_batch_service.dart`, `articulo_import_progreso.dart`, `articulo_import_lote_fallido.dart` |
| Pruebas nuevas | `test/application/commands/articulos/actualizar_articulo_csv_test.dart`, `test/application/import/articulo_import_mixed_batch_service_test.dart` |
| Dobles adaptados | `test/application/import/articulo_import_batch_service_test.dart`, `test/presentation/pages/gestion_inventario/carga_masiva/bulk_import_screen_test.dart`, `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart` |
| Helper de medición existente | `tool/benchmarks/articulo_import_baseline.dart`: su store delega ahora la transacción exterior real; no se reescribió evidencia histórica ni se midió rendimiento nuevo |

**Verificación definitiva sobre el código final:**

- **55 pruebas nuevas**, SQLite nativo real, ambos modos. Cubren el core que
  corresponde a C03–C06, C08–C09, C13–C15, C17–C25, C32–C37 y C40.
  La matriz no se marca completa; los componentes de UI y sesión 4 siguen
  pendientes. La validación de no cambiar tipo/unidad/seguimiento continúa
  en sesión 1 y esos campos no existen en el comando acotado.
- Conservación por comparación de snapshots tipados y tablas reales. Las
  tablas ajenas al agregado conservan todos sus valores; proveedores/recetas,
  recursos/saldos/movimientos/memoria y borrador son exactos. Dentro del producto
  avanzan los metadatos normales de actualización del agregado; variantes
  omitidas conservan su estado comercial, IDs, creación y orden, e inactivas
  conservan su fila completa.
- Omisiones: 500 existentes, solo 20 cambiados → 20 eventos, 480 omitidos,
  un lote; productos omitidos conservan metadatos. Revisión fresca del mismo
  CSV → 500 omitidos, cero lotes, cero lecturas y cero escrituras al ejecutar.
  Auditoría SQL también acredita cero escrituras en el no-op final.
- Lote mixto exitoso: 27 altas + 27 actualizaciones + 1 omitido → lotes de
  50 y 4 ejecutables; recursos antes de productos, refs correctas.
- Rollback real: 25 altas con inventario + 25 actualizaciones en primer lote;
  fallo inyectado después de proyectar una actualización, cuando ya existen
  recursos/productos y undo en server_sync. Comparación de **todas** las tablas
  tras rollback idéntica al estado inicial. Segundo lote aplica 1 actualización;
  nada del lote fallido queda persistido ni se reintenta.
- Base obsoleta en plan mixto: falla en preparación sin append ni efectos.
  Confirmación vieja repetida: se rechaza, sin otro evento. Reimportación con
  preparación fresca: todos sin cambios. Lecturas de preparación bajo la
  transacción y callbacks de progreso fuera de ella observados en pruebas.
- Refs se observan antes de persistir y se comparan con SQLite en `server_sync`;
  se prueba rechazo de refs vacías también en standalone. Cambiar a server_sync
  conserva `not_required` y ausencia de refs, y exige importación explícita.
  Runtime y lote mixto standalone acreditan cero resolución del monitor remoto.
- `dart analyze`: **No issues found**.
- `flutter test test/application/commands/articulos test/application/import test/data/local/import test/data/local/export test/presentation/pages/gestion_inventario/carga_masiva --reporter expanded`:
  **322 aprobadas, cero fallos**, aproximadamente 5 s.
- `flutter test --reporter expanded`: **2169 aprobadas, cero fallos y 10 omitidas**,
  aproximadamente 1 min 46 s. Las omitidas son las nueve de
  `test/integration/product_suppliers_server_test.dart` (requieren
  `POS_SUPPLIER_SYNC_URL`) y la de
  `test/integration/variant_tracking_server_test.dart` (requiere
  `POS_PHASE3_SYNC_URL`), todas contra NestJS/PostgreSQL aislados. No se levantó
  servidor y no se consideran aprobadas. No hubo fallos preexistentes observados
  en las verificaciones definitivas.
- `git diff --check`: correcto. Se revisaron imports, usos y ausencia de
  placeholders o dependencias de Drift en los comandos nuevos; sin código
  futuro sin uso. Análisis y suite global incluyen los cambios previos ajenos.
- Evidencia y comandos completos:
  [[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-2/Verificacion del core|Verificación del core]],
  `Evidencia/2026-10-18-sesion-2/dart-analyze-final.log`,
  `pruebas-enfocadas.log` y `flutter-test-final.log`.

**Pendientes y siguiente paso:**

1. Sesión 3: integrar preparación/revisión antes de confirmar, diferencias,
   resumen sin cambios, exclusión de agregados inválidos, doble confirmación,
   cancelación y guardado mediante la API indicada en «Próximo paso». Activar
   entrada/salida con IDs juntas; no sustituir bases después de confirmar.
2. Sesión 4: mediciones comparables de altas/actualizaciones/omisiones/mezclas,
   objetivo 1.20× sobre referencia, reapertura persistente después de actualizar,
   pruebas manuales y tablet profile/release con modelo documentado. No se midió
   velocidad de tablet ni se declara cumplido el presupuesto de rendimiento.
3. Integraciones HTTP omitidas: ejecutar solo con NestJS/PostgreSQL aislados
   disponibles. Mantener límites de alcance y no cambiar servidor para esta sesión.


### 2026-10-18 — Sesión 3: interfaz y recorrido completo

**Revisión:** Flutter HEAD `e5d9c7bbc581380d01ffe12088c317891573384f`;
vault HEAD `b077dc72cc81ddd991ed7cb36daecd6283368ab2`. Implementación sobre
sesiones 1/2 sin commit. Se leyeron AGENTS aplicables de Flutter y vault,
AGENTS de NestJS como pide el plan, ambas guías offline-first, plan, continuidad,
matriz y alcance de sesión 3. No se modificó ni conectó servidor.

**Trabajo previo preservado:**

- Los contratos, lector, preparación, comandos y lotes de sesiones 1/2 se
  reutilizan. No se modificaron los comandos ni el ejecutor de lotes de sesión 2.
- Los 26 archivos previos sin modificaciones de esta sesión conservaron sus
  hashes iniciales, incluidos ambos archivos ajenos de escaneo de Caja,
  pruebas ajenas de escaneo de Inventario y helper de benchmark. Se modificaron
  ocho archivos que ya tenían cambios previos, continuando su contenido.
- Se conservaron el mapa y la carpeta ajena de edición/recepción de mercancía
  del vault, así como toda la evidencia y registros anteriores.

**Implementado:**

- `BulkImportScreen` usa la preparación específica en lugar de cargar todo el
  listado de UI. DI comparte el parser habilitado con el servicio de preparación.
- Reporte de productos nuevos/con cambios/sin cambios/con errores, con filas
  separadas. El reporte lleva grupos y líneas excluidas, no confunde cantidad
  de mensajes con cantidad de productos. Explica el caso de altas parcialmente
  válidas y excluye el agregado completo ante una fila inválida de actualización.
- Diferencias desplegables por producto, variante y campo, con actual/propuesta,
  nombres de categorías, importes y opcionales vacíos. Solo se ofrecen para
  productos cambiados. Pantalla y diálogo reutilizan el mismo componente.
- Preparación fresca antes del diálogo; el diálogo muestra el reporte actualizado
  y sus diferencias. El lote recibe la propuesta confirmada y sus bases exactas;
  no se sustituye una base al guardar ni se reintenta automáticamente.
- Con todo sin cambios se informa el resultado, sin botón de escritura habilitado
  ni ejecución del lote. Se protege doble confirmación/cierre y una ejecución
  iniciada bloquea repetir con la misma revisión, incluso ante error general.
- Instrucciones de conservar ambos IDs para editar, alta con ambos vacíos,
  compatibilidad exclusiva de altas de diez columnas, retiro de categoría/barcode,
  costo desconocido y obligatoriedad de nombre/precio. Existencias de existentes
  informativas y conservación de variantes omitidas/recetas/proveedores explícitas.
- Exportación, plantilla y notas públicas de doce columnas activadas juntas;
  IDs reales en catálogo y vacíos en plantilla. PDF sin cambios de compositor.
- Progreso muestra creados, actualizados, omitidos y fallidos; reutiliza fotos del
  core publicadas tras commit/rollback. Fallos con lote, productos, líneas, IDs
  existentes y causa; explica reversión completa del lote.
- Sin tablas/DAOs/esquema/dependencias/eventos nuevos ni nuevos flujos de negocio.
  No aplica build_runner. Standalone conserva not_required y cero event_refs;
  server_sync conserva pending, refs y undo existentes.

**Archivos Flutter de esta sesión** (relativos a
`/Users/benjamin/Projects/POS/pos_flutter`; el resto de Git es previo):

| Responsabilidad | Archivos |
|---|---|
| Reporte/grupos de errores | `lib/application/import/articulo_catalog_import_service.dart`, `articulo_import_producto_error.dart` (nuevo) |
| Identificación de filas excluidas | `lib/data/local/import/articulo_import_csv.dart` |
| DI | `lib/core/di/data_dependencies.dart` |
| Activación y notas CSV | `lib/data/local/export/drift_articulo_catalog_export_service.dart`, `articulo_catalog_csv.dart` |
| Pantalla y navegación | `lib/presentation/pages/gestion_inventario/carga_masiva/bulk_import_screen.dart`, `lib/presentation/pages/gestion_inventario/inventory_management_screen.dart` |
| Revisión compartida/progreso | `lib/presentation/pages/gestion_inventario/carga_masiva/bulk_import_review.dart` (nuevo), `bulk_import_progress.dart` |
| Nueva prueba real de interfaz | `test/presentation/pages/gestion_inventario/carga_masiva/bulk_import_persistence_test.dart` |
| Regresión de pantalla | `test/presentation/pages/gestion_inventario/carga_masiva/bulk_import_screen_test.dart` |
| Regresión de exportación/compatibilidad/lotes | `test/data/local/export/drift_articulo_catalog_export_service_test.dart`, `test/data/local/import/articulo_import_csv_vuelta_test.dart`, `test/application/import/articulo_import_batch_service_test.dart` |

**Verificación:**

- **20 pruebas nuevas de widgets con SQLite nativo real**, diez por modo.
  C01, C26, C28–C32, C37–C38 y recorrido C29→C05→C37. Comparaciones de todas
  las tablas al revisar, cancelar, reimportar y revertir lote; comparación de
  snapshots para variantes omitidas, recetas y proveedores. Existencias
  exportadas modificadas no generan ajustes. Detalle en la evidencia enlazada.
- CSV exportado con dos variantes modificadas y otra omitida: un evento de
  actualización del producto. Mismo CSV aplicado: todo sin cambios y estado
  completo de SQLite idéntico, sin segunda escritura.
- Base cambiada antes del diálogo: valores actuales/propuestos y base confirmada
  actualizados. Cambio después del diálogo: lote mixto rechazado sin rebasar base
  y todas las tablas iguales al estado de la edición concurrente.
- Fallo después de proyectar producto/hijos: rollback íntegro y reporte visible
  de lote, productos, líneas y causa. Doble callback antes del siguiente frame:
  una sola ejecución. CSV anterior rechaza nombre existente y permite alta nueva.
- `dart analyze`: **No issues found**.
- Pruebas enfocadas: **342 aprobadas, cero fallos** con el comando documentado
  en `Evidencia/2026-10-18-sesion-3/Verificacion de interfaz.md`.
- Primer `flutter test --reporter expanded`: **2188 aprobadas, un fallo y 10
  omitidas**. El fallo fue `pumpAndSettle timed out` en
  `product_supplier_ui_flow_test.dart`, caso «fallo atómico al guardar conserva
  borrador y reintento persiste una vez», al guardar el reintento. Ese archivo y
  el editor de proveedores no se modificaron en esta sesión. La ejecución
  aislada posterior del archivo pasó: **7 aprobadas, cero fallos**, sin cambios.
  Se conserva `flutter-test-primer-intento.log` y
  `proveedores-reverificacion.log`; no se oculta el primer resultado ni se
  atribuye concluyentemente su causa a código preexistente.
- Repetición global sin cambiar código:
  `flutter test --concurrency=2 --reporter expanded`: **2189 aprobadas, cero
  fallos y 10 omitidas**. Incluye la prueba de proveedores del primer timeout.
  Las omitidas son las nueve de `product_suppliers_server_test.dart`
  (`POS_SUPPLIER_SYNC_URL`) y una de `variant_tracking_server_test.dart`
  (`POS_PHASE3_SYNC_URL`), que requieren NestJS/PostgreSQL aislados. No se
  levantó servidor y no se consideran aprobadas. El timeout inicial se registra
  como incidencia temporal observada, sin modificar esa prueba ajena.
- `git diff --check`: correcto en Flutter y vault. Se revisaron imports,
  dependencias eliminadas de la pantalla, textos legados y hashes del trabajo
  previo; no quedaron instrucciones de activación pendientes para sesión 3.
- Evidencia y logs:
  [[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-3/Verificacion de interfaz|Verificación de interfaz]],
  `dart-analyze-final.log`, `pruebas-enfocadas.log`, `flutter-test-final.log`,
  `flutter-test-primer-intento.log` y `proveedores-reverificacion.log`.

**Pendientes para sesión 4 y límites:**

1. Medir escenarios comparables de altas, actualizaciones, omisiones y mezclas,
   y catálogo mayor. Comparar altas contra la referencia y presupuesto 1.20×.
   No se hicieron mediciones nuevas ni se declara cumplido ese objetivo.
2. Reapertura específica de SQLite tras actualizar y regresión final; cerrar
   C39–C43 y los componentes restantes de la matriz con evidencia. La matriz
   no se marca completa por aprobar las pruebas locales de sesión 3.
3. C44: recorrido manual de compartir/editar/reimportar y medición física en
   tablet profile/release con modelo/build. Pendiente: widgets y SQLite de
   escritorio no acreditan validación física ni velocidad de tablet.
4. Ejecutar las diez integraciones HTTP omitidas cuando exista un servidor
   aislado disponible. No ampliar alcance ni modificar servidor para hacerlo.


### 2026-10-18 — Sesión 4: verificación local, rendimiento y pendientes

**Revisiones y preservación:** Flutter HEAD `e5d9c7bbc581380d01ffe12088c317891573384f`,
vault HEAD `b077dc72cc81ddd991ed7cb36daecd6283368ab2`; sin commits. Se leyeron
AGENTS y guías offline-first, los cuatro documentos del plan y evidencias/baseline
previos. Inventarios inicial/final y hashes en la carpeta de evidencia. Se
continuaron solo tres archivos ya modificados de Flutter (parser, identidad y
comandos CSV) y este Estado; los demás cambios previos conservaron sus hashes,
incluidos escaneo de Caja/Inventario, helper baseline, mapa del vault y plan
ajeno de edición/recepción. No se editó NestJS.

**Cambios:**

- Dos pruebas C43, una por modo: SQLite nativo en disco, exportar/editar/aplicar,
  reapertura exacta de todas las tablas, repetición sin escrituras/historial y
  rollback posterior a proyección persistiendo correctamente tras reabrir.
- Conservación de referencia histórica medida de 250 átomos comprobada sobre
  un setup SQLite/payload coherente; recetas, proveedores/precios/fechas, recursos,
  memoria, saldos, borrador, IDs/eventos de creación/orden y variantes omitidas
  e inactivas cubiertos por regresión real. No se cambian reglas de alta.
- Retirada bandera temporal `permitirIdentidad` y prueba/mensaje de «todavía no
  habilitado»; se verifica el contrato público ya activo. Corregida nota de la
  interfaz de exportación que decía que no exponía IDs.
- Dos harness manuales reproducibles en `tool/benchmarks`: mediciones y app
  aislada usando UI/servicios reales. Sin infraestructura/dependencias nuevas.
- Matriz C01–C44 actualizada con resultado y trazabilidad; se conserva C44
  parcial. Evidencias históricas y baseline sin modificar.

**Verificación definitiva:**

- `dart analyze`: **No issues found** (`dart-analyze-final.log`).
- Comandos CSV: **44 aprobadas**, cero fallos (`csv-command-final.log`).
- `flutter test --concurrency=2 --reporter expanded`: **2191 aprobadas, cero
  fallos, 10 omitidas** (`flutter-test-final.log`). Las diez son integraciones
  HTTP condicionadas a `POS_SUPPLIER_SYNC_URL` y `POS_PHASE3_SYNC_URL`.
- Se preservan los intentos fallidos: compilación inicial de un test con import
  inexistente, aserción incorrecta de entrega del borrador y fixture que intentó
  alta con referencia 250. La global intermedia de ese fixture tuvo 2187
  aprobadas/cuatro fallidas/10 omitidas. Se corrigieron **los tests/setup**, sin
  cambiar reglas ni atribuirlo al código ajeno. Detalle y logs en Verificación.
- Refs observadas declaradas/validadas en ambos modos; standalone cero refs,
  not_required y monitor remoto nunca resuelto; server_sync pending y refs/undo
  correctos. No se promovió historial standalone. Transporte HTTP no ejecutado.
- `git diff --check` correcto; revisión de imports/helpers/firmas/textos. Sin
  esquema/DAOs/dependencias modificados, no aplica build_runner.

**Rendimiento final:** MacBook Air M5 Mac17,3, macOS 27.0.1 26A434, Flutter
3.41.6/Dart 3.11.4, VM/JIT de tests, SQLite memory. Un calentamiento descartado
más cinco bases nuevas por escenario/modo; procesos separados por modo, sin
builds/tests simultáneos. 70 muestras finales. Milisegundos de mediana total:

| 500 filas | standalone | server_sync |
|---|---:|---:|
| Altas sin seguimiento | 142.427 | 159.331 |
| Altas con seguimiento | 437.438 | 483.467 |
| Todos iguales | 13.079 | 13.434 |
| Solo 20 modificados | 40.211 | 50.649 |
| Todos modificados | 677.586 | 811.988 |
| 100 altas + 200 cambios + 200 omitidos, intercalados | 350.070 | 409.694 |
| 500 iguales en catálogo de 10000 productos/variantes | 37.770 | 38.879 |

- Altas standalone: **1.1069× / 1.1574×** frente a 128.675 / 377.960 ms del
  baseline equivalente; ambas medianas dentro de 1.20×. Diez lotes exteriores,
  mismas consultas/escrituras de negocio y 500/1000 eventos. No se requirió
  optimización. No hay baseline histórico equivalente de server_sync/tablet.
- Omitidos: seis SELECT en preparación, cero historial y cero SQL de guardado,
  eventos, refs, undo o lotes; incluye catálogo de 10000 con variantes reales.
- 20 cambios: exactamente 20 eventos y un lote; 500 cambios: 500 eventos y
  diez lotes. La mezcla produce 400 eventos (100 recursos + 100 altas + 200
  actualizaciones), seis lotes **realmente mixtos** y 200 omitidos.
- Validación/guardado separados, medianas/rangos, consultas/batches, transacciones
  exteriores/anidadas, eventos, refs, undo e historial en `Rendimiento.md` y JSON.
- Memoria registrada: pico RSS acumulado del proceso VM 367099904 bytes
  standalone y 367280128 bytes server_sync; incluye semillas/calentamientos y
  escenarios, no es pico atribuible al importador/fase ni tablet.

**Recorrido manual y límites:**

- App nativa macOS profile, base aislada de dos productos/tres variantes. CSV
  público compartido localmente por Copy, editado en VS Code; una variante
  omitida, cambio de nombre/precio/barcode y saldo informativo 999.
- Cancelar conserva todas las tablas. Guardar: un actualizado/un omitido,
  un evento nuevo, cero refs/undo, not_required y stock sigue en 12. Repetir y
  reabrir conservan todas las tablas exactamente; Grande sigue a 35.00.
- El selector nativo macOS falló antes del diálogo por requisito de entitlement
  ausente ya en HEAD; queda pendiente. Para continuar se usó el callback de
  archivo fijo del harness, expresamente documentado. No se tocaron permisos.
- La build profile universal falló al empaquetar; profile arm64 compiló con
  opciones locales de xcodebuild, sin cambios del proyecto. No hay tablet;
  prueba/medición física profile/release y baseline comparable siguen pendientes.

**Evidencia reproducible:**
[[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Verificacion y cierre|Verificación]],
[[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Rendimiento|Mediciones, condiciones y comandos]],
[[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Recorrido manual|Recorrido manual y limitaciones]].
Scripts/harness adjuntos, JSON por corrida, snapshots SQLite, inventarios/hashes
Git y logs finales/intermedios en esa carpeta. No se declara cierre de C44 ni
aprobación de integraciones omitidas.
