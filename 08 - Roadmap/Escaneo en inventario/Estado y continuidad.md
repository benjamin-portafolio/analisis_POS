---
tipo: seguimiento_implementacion
estado: cierre_automatizado_completado
revision_plan: 1
actualizado: 2026-10-15
---

# Estado y continuidad: escaneo en inventario

Plan: [[08 - Roadmap/Escaneo en inventario/Plan de implementacion|Plan de implementación, revisión 1]].

## Estado actual

| Etapa | Estado |
|---|---|
| Planificación | Completada; código y guías existentes revisados |
| 1. Guardado acotado | Completado; comando, persistencia y verificaciones aprobados |
| 2. Interfaz e integración | Completada; navegación y guardado local integrados y verificados |
| 3. Verificación y cierre | Completada en automatización; I01–I19 aprobados, I20 físico pendiente |
| Prueba física | Pendiente explícita por decisión del usuario; no bloquea cierre automatizado |

La solicitud vigente autorizó únicamente la fase 3, ya completada en su alcance
automatizado. El lector de Artículos resuelve cero/una/varias coincidencias y
permite asignar o reemplazar un código sobre una variante existente con
confirmación y guardado local real. El cierre agregó solo dos pruebas de CSV
sin barcode, recorrido UI y reapertura de SQLite temporal en ambos modos.
No encontró defectos de producción; conserva íntegros los cambios de fases 1/2.
No se modificaron esquema, dependencias ni servidor.

Resultado final nuevo: `dart analyze` sin incidencias y 33 pruebas de navegación
aprobadas (31 existentes + 2 nuevas). La suite general de fase 2 se reutilizó:
2064 aprobadas, 10 omitidas por servidor aislado ausente, 0 fallos. No se afirma
que esa suite completa se haya vuelto a ejecutar ni un total completo de 2066.
Matriz y evidencia durable:
[Verificación de escaneo en inventario](/Users/benjamin/Projects/POS/pos_flutter/docs/testing/inventory_barcode_verification.md).
Las secciones de fases 1/2 siguientes son registros históricos.

## Antecedente de planificación

La sesión documental inicial solo preparó el plan, sin implementar ni ejecutar
pruebas funcionales. En ese momento todos los casos I01–I20 estaban pendientes.

Se crearon las dos notas de esta carpeta y su enlace en Mapa del vault. El mapa
ya tenía modificaciones; se preservaron. Flutter fue observado en HEAD
`672361f` con cambios ajenos activos en ventas, repositorios, pantallas y pruebas.
La lista exacta puede variar: consultar `git status --short` al retomar, sin
restaurar archivos de otra tarea ni asumir un working tree limpio.

## Hallazgos para retomar

- Ya existe consulta exacta por barcode con cero/una/varias coincidencias.
- Ya existe un lector de una lectura que devuelve `String?` y libera cámara.
- El barcode pertenece a la variante y no tiene unicidad global.
- La pantalla original de búsqueda de Artículos está conectada a ventas.
  El selector de inventario reutiliza solo su búsqueda por variantes.
- El detalle contiene código y evento base; el listado de variantes no incluye
  barcode. No ampliar el listado solo para preparar una confirmación.
- `ProductoCommandService.asignarCodigoBarrasVariante` ya recibe
  `AsignarCodigoBarrasVarianteCommand` con `productId`, `variantId`,
  `baseEventId` confirmado y `codigoBarras`; la fase 2 ya consume esta operación.
  Usa `producto_actualizado`, conserva el snapshot y las referencias vigentes.
  `InventoryBarcodeAssignmentScreen` consume esa operación con la base mostrada.
- El selector reutiliza `ArticleSearchItem.search` desde su ubicación actual,
  sin importar operaciones ni estado de venta. Solo relee el detalle seleccionado.
- `ArticleFormScreen.initialVariantId` ubica y destaca la variante escaneada,
  conservando el flujo habitual de edición.
- No se prevén cambios de esquema, dependencias ni trabajo de servidor.

## Criterio pendiente de ampliación

1. Transferir un código que ya está asociado al artículo equivocado requiere
   análisis adicional. El alcance base solo abre la edición cuando encuentra
   coincidencias y permite asignar/reemplazar cuando el código no aparece.
   No retirar códigos de otros registros ni imponer unicidad implícitamente.

## Continuidad después del cierre

1. I20 físico queda pendiente por decisión expresa del usuario: «Dejar la prueba
   física pendiente». Se detectaron simuladores iOS y macOS con cámara; no hubo
   teléfono/tablet físico conectado. No se ejecutó una lectura nativa ni se
   modificaron permisos. Registrar plataforma/modelo/SO, formato, ceros iniciales,
   permisos, cancelación, segundo plano, cierre y reapertura al retomarlo con
   datos aislados. La cámara falsa no acredita estos resultados.
2. No queda implementación pendiente de las fases 1/2 ni defecto automatizado
   abierto en este alcance. Transferir códigos, imponer unicidad, crear productos
   u otros flujos requieren una solicitud/análisis separados.

## Registro de fase 1 — 2026-10-15

### Estado inicial y alcance realizado

Flutter inició en `d4e66bb` (`Se agrega opcion de cantidad vendida a venta a granel`),
con `git status --short` limpio. La referencia `672361f` anterior es histórica.
El vault conservaba cambios ajenos en múltiples notas, Mapa, workspace de
Obsidian y carpetas de roadmap; solo se editó esta nota y se preservó el resto.
Se leyeron los AGENTS de Flutter y vault, ambas guías offline y las dos notas
de este plan antes de implementar.

La operación ejecuta normalización con `CodigoBarras`, lectura de producto y
variante activos, pertenencia, validación de base y escritura dentro de la
transacción local existente. El mismo código normalizado no produce evento.
Una base vieja se rechaza incluso si el código ya coincide. El contrato y
handler existentes siguen controlando versión, aplicación local e idempotencia.

Se construye `after` desde el snapshot tipado actual, cambiando solo el barcode
seleccionado. Se conservan identidad, nombres, orden, precios, costos,
configuración de venta, categoría, proveedores y fechas, recetas y vínculos.
La ausencia legada de suppliers permanece ausente; no se convierte en `[]`.
Las dependencias causales se refrescan con los helpers existentes. No se
reconstruyen valores de formulario ni se crean recursos, movimientos o descartes.

`_updateEvent` concentra la construcción ya existente del sobre de actualización
y se reutiliza también desde edición y eliminación, sin cambiar su política
de base oficial/pendiente. `_buildArticleRefs` se reutiliza íntegro; no se
agregan referencias ni restricciones de unicidad de barcode.

### Archivos propios

- Nuevo comando: `/Users/benjamin/Projects/POS/pos_flutter/lib/application/commands/articulos/asignar_codigo_barras_variante_command.dart`.
- Procesamiento y helper compartido: `/Users/benjamin/Projects/POS/pos_flutter/lib/application/commands/articulos/producto_command_service.dart`.
- Pruebas nuevas: `/Users/benjamin/Projects/POS/pos_flutter/test/application/commands/articulos/asignar_codigo_barras_variante_test.dart`.
- Adaptación del doble que implementa el servicio: `/Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`. Solo declara la nueva operación y falla si esa UI intenta invocarla; no incorpora interfaz ni navegación.
- Documentación: esta nota, `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Escaneo en inventario/Estado y continuidad.md`.

### Pruebas y resultados

Las 60 pruebas nuevas usan archivos SQLite en directorios temporales con
`NativeDatabase(file)`, comandos, event store, handlers y repositorios reales.
Se cierran y reabren bases de reemplazo y de productos complejos en ambos modos,
comparando datos de todas las tablas, eventos y metadatos persistidos.

| Comando / revisión | Resultado |
|---|---|
| `flutter test test/application/commands/articulos/asignar_codigo_barras_variante_test.dart --reporter expanded` | 60 aprobadas, 0 fallos |
| `dart analyze` | Aprobado: `No issues found!` |
| `flutter test --reporter expanded` | 2033 aprobadas, 10 omitidas, 0 fallos; salida 0, duración 1 min 48 s |
| `dart format` sobre los cuatro archivos Dart propios | Sin cambios pendientes de formato |
| `git diff --check` y búsquedas con `rg` de consumidores/helpers/placeholders | Sin errores de whitespace, imports o helpers muertos introducidos |
| `dart run build_runner build` | No aplica: no se modificó Drift ni esquema |

En las primeras ejecuciones dirigidas se corrigieron únicamente fixtures propios:
factor de kilogramo (1000) y unidad esperada de la venta medida. El análisis
también detectó el doble existente que necesitaba declarar la nueva operación;
se adaptó en el archivo listado. No se ocultaron ni modificaron fallos ajenos.

Las 10 omisiones corresponden a integraciones existentes que requieren
`POS_SUPPLIER_SYNC_URL` o `POS_PHASE3_SYNC_URL` apuntando a NestJS/PostgreSQL
aislados; no estaban configuradas. No se levantó ni desarrolló servidor para
esta fase. Log local de la suite: `/tmp/pos_flutter_barcode_phase1_full_test.log`.

La cobertura incluye asignación desde null, reemplazo en una variante que no es
la primera, NFKC/trim, ceros iniciales y límites 1/32 dígitos; rechazo de vacío,
texto incompatible y longitud 33; producto/variante ausentes o inactivos,
variante ajena y base vacía/obsoleta; no-op sin tocar metadatos; preservación
de producto simple, varias variantes, variante histórica inactiva, receta,
proveedores con fechas y configuración por unidad/medida. Se compara el resto
de las tablas para conservar inventario y un borrador de venta ya existente.

Se fuerza fallo al insertar el evento, después de aplicar producto e hijos y
al cambiar la base antes del handler. Cada fallo revierte todas las tablas,
incluidos evento, refs y undo, y permite reintentar. El replay repetido no altera
el estado. Se permite compartir un código y se comprueba que el anterior sigue
resolviendo las otras variantes que lo conservan.

En ambos modos se inspeccionan refs declaradas y se comprueba el rechazo de
refs vacías en el almacén real. En `server_sync` se persisten con
`source = local_pending`, entrega `pending` y la política actual de undo/base.
En `standalone` no se persisten refs ni undo de sync, la entrega es
`not_required` y no hay pendientes. Una prueba del runtime registra un monitor
remoto que fallaría al resolverse: inicio, asignación y cierre standalone no
lo resuelven, por lo que no inician push, pull, preflight, health o WebSocket.

### Casos de aceptación cubiertos y pendientes

Los casos con interacción visual conservan pendiente esa parte para fase 2;
la evidencia de aplicación no acredita confirmaciones ni cámara reales.

| ID | Evidencia de fase 1 / estado restante |
|---|---|
| I01–I06 | Pendientes: botón, rutas de cámara/coincidencias y selector pertenecen a fase 2 |
| I07 | Guardado desde null aprobado: un `producto_actualizado`; confirmación visual pendiente |
| I08 | Reemplazo acotado aprobado, sin tocar otras variantes; confirmación visual pendiente |
| I09 | Pendiente: cancelar las rutas/diálogos aún no implementados |
| I10 | Aprobado en comando y consulta exacta: NFKC/trim y ceros iniciales |
| I11 | Aprobado en comando: inválidos rechazados sin eventos ni cambios; aviso UI pendiente |
| I12 | Aprobado en comando/handler: destinos no disponibles y base obsoleta; recarga/confirmación UI pendiente |
| I13 | Aprobado en comando: mismo código normalizado no escribe |
| I14 | Pendiente: doble toque y callbacks pertenecen a fase 2 |
| I15 | Aprobado en aplicación/SQLite: snapshots complejos conservados, existencias y venta intactas |
| I16 | Aprobado: rollback en persistencia/aplicación/base y replay idempotente; interacción de reintento UI pendiente |
| I17 | Aprobado: reapertura, persistencia y consultas nuevo/anterior; coincidencias compartidas conservadas |
| I18 | Aprobado: refs, entrega y runtime de ambos modos conforme a las reglas |
| I19 | Conservación del borrador y regresión general aprobadas, incluidas pruebas existentes del editor, búsqueda y Caja. Integración visual pendiente de fase 2 |
| I20 | Pendiente de prueba física al integrar cámara; no ejecutada en fase 1 |

Siguiente tarea exacta: fase 2, **Interfaz e integración**, consumiendo el
comando ya implementado. No se comenzó el botón, selector, diálogos ni rutas
del nuevo flujo; tampoco la fase 3 ni pruebas físicas de ese flujo.


## Registro de fase 2 — 2026-10-15

### Estado inicial y alcance realizado

Flutter inició en HEAD `d4e66bb`, rama `main`, con los cuatro archivos de fase 1
sin confirmar en Git: servicio de producto, comando nuevo, pruebas del comando
y adaptación del doble de `inventory_management_screen_test.dart`. Se
preservaron íntegramente; esta fase no volvió a modificar esos cuatro archivos.
El vault también conservaba modificaciones ajenas en notas, Mapa y workspace;
solo se editó esta nota de continuidad.

Se leyeron los AGENTS aplicables, las dos guías offline y ambas notas del plan.
Se comprobó el contrato real de fase 1: comando con producto, variante, código
y `baseEventId`, validación dentro de la transacción y retorno `Future<void>`
después del guardado. Una base obsoleta falla antes de cambiar el barcode; el
mismo código no genera evento. Las 60 pruebas existentes del contrato se
volvieron a ejecutar y aprobaron.

El botón de lector está sobre `+` únicamente en Artículos. El flujo reutiliza
`BarcodeScannerScreen` sin modificar la cámara del editor ni el lector de Caja.
Normaliza con `CodigoBarras` y consulta `buscarVariantesPorCodigoBarras`: una
coincidencia abre edición y ubica la variante; varias exigen elección explícita
con artículo, variante y precio; cero ofrecen asignar a una variante existente.
Cancelar en cualquiera de esos pasos regresa a inventario sin escribir.

El selector observa el catálogo y reutiliza la búsqueda actual por artículo y
variante. Incluye destinos activos con y sin código, con y sin seguimiento de
existencias y variantes sin nombre. No lee un detalle por fila ni usa servicios,
coordinadores o estado de ventas. La confirmación carga únicamente el detalle
vigente del destino elegido y muestra artículo, variante y código nuevo, además
del código actual cuando se trata de un reemplazo.

Confirmar invoca la operación de fase 1 con la base mostrada. El doble toque se
bloquea y, durante el guardado, se deshabilitan cancelar y volver atrás. El éxito
se devuelve a inventario solo después de completar el guardado local. Los
listados se actualizan por sus repositorios. Si el código ya coincide, se informa
sin invocar el comando. No se agregan líneas a una venta ni movimientos.

Ante fallo de guardado se relee el destino: si cambió la base, se muestran los
datos y códigos nuevos con una solicitud de nueva confirmación; no hay reintento
automático. Un fallo recuperable conserva código y destino. Si no puede releer
el detalle, bloquea confirmar hasta recargarlo. Destinos retirados se rechazan.
Las rutas comprueban su vigencia antes de consumir consultas o navegar; los
callbacks de rutas cerradas se ignoran.

### Archivos propios

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter/`:

- `lib/presentation/pages/gestion_inventario/inventory_management_screen.dart`:
  acceso, bloqueo de reapertura y conexión con edición y operación existente.
- `lib/presentation/pages/gestion_inventario/articulos/inventory_barcode_flow_screen.dart`:
  coordinación de cámara, consulta, coincidencias y rutas de asignación.
- `lib/presentation/pages/gestion_inventario/articulos/inventory_barcode_matches_dialog.dart`:
  selección explícita de una coincidencia compartida.
- `lib/presentation/pages/gestion_inventario/articulos/inventory_barcode_variant_selector.dart`:
  selector por variante con búsqueda, carga, error, reintento y estados vacíos.
- `lib/presentation/pages/gestion_inventario/articulos/inventory_barcode_assignment_screen.dart`:
  detalle del destino, confirmación, guardado, recarga y errores recuperables.
- `lib/presentation/pages/gestion_inventario/articulos/article_form_screen.dart` y
  `widgets/advanced_variants_section.dart` dentro de esa misma carpeta:
  ubicación inicial y destacado de la variante sin cambios de formulario.
- `test/support/inventory_barcode_fixture.dart`: comandos, repositorios y SQLite
  reales, con hooks para detener consultas y comandos; conserva una venta previa.
- `test/presentation/pages/gestion_inventario/articulos/inventory_barcode_flow_test.dart`:
  31 pruebas nuevas de navegación e integración usando la cámara falsa existente.
- Documentación: esta nota. No se editaron otras notas del vault ni las guías
  de cierre reservadas por el plan para fase 3.

### Pruebas y resultados

| Comando / revisión | Resultado |
|---|---|
| `flutter test test/application/commands/articulos/asignar_codigo_barras_variante_test.dart --reporter expanded` | 60 aprobadas, 0 fallos |
| `flutter test test/presentation/pages/gestion_inventario/articulos/inventory_barcode_flow_test.dart --reporter expanded` | 31 aprobadas, 0 fallos |
| `dart analyze` sobre el resultado final | Aprobado: `No issues found!`, salida 0 |
| `flutter test --reporter expanded` sobre el resultado final | 2064 aprobadas, 10 omitidas, 0 fallos; salida 0, duración 1 min 58 s |
| `dart format --output=none --set-exit-if-changed` sobre los nueve archivos Dart propios | 0 cambios pendientes |
| `git diff --check` y revisión con `rg` de consumidores/imports/placeholders | Sin errores ni código muerto introducido; todas las piezas nuevas tienen consumidor |
| `dart run build_runner build` | No aplica: no hubo cambios Drift ni de esquema |

Logs locales: `/tmp/pos_flutter_barcode_phase2_contract.log`,
`/tmp/pos_flutter_barcode_phase2_navigation.log`,
`/tmp/pos_flutter_barcode_phase2_analyze.log` y
`/tmp/pos_flutter_barcode_phase2_full_test.log`. La suite completa final incluye
las 31 pruebas nuevas y las regresiones existentes de editor, buscador y Caja.
Las 10 omisiones siguen siendo integraciones existentes que requieren
`POS_SUPPLIER_SYNC_URL` o `POS_PHASE3_SYNC_URL` con NestJS/PostgreSQL aislados.
No se configuró ni desarrolló servidor para esta fase.

Las pruebas nuevas usan el event store, handlers, comandos y repositorios reales
sobre SQLite aislado. Solo se sustituye la cámara nativa mediante
`FakeMobileScannerPlatform`, y los hooks permiten retener o fallar lecturas y
guardados. Se compara el estado completo al cancelar; asignación y reemplazo
verifican evento adicional, consulta del código nuevo y conservación de venta,
líneas, recursos y movimientos de inventario. El rollback se prueba inyectando
fallo después de aplicar el producto.

### Casos de aceptación cubiertos y continuidad

Esta evidencia completa la integración de fase 2; no representa la ejecución
del cierre ni la prueba física de fase 3.

| ID | Evidencia de fase 2 / límite restante |
|---|---|
| I01 | Botón encima de `+`, ausente en Categoría, Recursos y Proveedores; menú `+` operativo |
| I02 | Una coincidencia abre edición de Café y ubica/destaca su segunda variante; sin escrituras |
| I03 | Código compartido muestra opciones distinguibles; no carga detalle hasta elegir; selección y cancelación probadas |
| I04 | Código desconocido visible, aviso y opción de asignación; sin alta automática |
| I05 | Búsqueda combinada por artículo/variante, filas separadas y detalle solo del destino elegido |
| I06 | Selección y guardado de variante sin nombre, barcode ni existencias; también se incluye destino con seguimiento |
| I07–I08 | Confirmaciones de asignación/reemplazo con códigos correctos y guardado local real; un evento adicional |
| I09 | Cancelación en lector, aviso, selector y confirmación conserva todas las tablas |
| I10 | Escaneo de dígitos NFKC con espacios conserva `00042` como texto en comando y consulta |
| I11 | Lecturas vacías ignoradas sin consulta; incompatible/longitud 33 muestran error y permiten reescanear |
| I12 | Variante retirada rechazada; base obsoleta recarga código actual y exige segundo toque con base nueva |
| I13 | Detalle ya igual informa y finaliza sin invocar comando ni actualización redundante |
| I14 | Doble apertura, doble confirmación y lecturas repetidas protegidas; consulta/detalle/callback tardíos no navegan ni escriben |
| I15 | Venta existente, líneas y tablas de inventario conservadas en integración; snapshots complejos siguen cubiertos por fase 1 |
| I16 | Fallo real tras aplicar revierte guardado; selección/código conservados y reintento aprobado; replay conserva evidencia de fase 1 |
| I17–I18 | Sin cambios de persistencia o modos; las 60 pruebas de fase 1 vuelven a aprobar, incluidas reapertura y refs/entrega |
| I19 | Suite completa aprobada, con regresiones del editor y Caja; la asignación conserva el borrador existente |
| I20 | Permisos, cámara no disponible, cierre, segundo plano, permiso pendiente y reapertura aprobados con cámara falsa; prueba física pendiente |

Siguiente tarea: solicitar **únicamente fase 3, Verificación y cierre**, usando
la solicitud reutilizable anterior. No se avanzó a esa fase ni se ejecutaron
pruebas físicas. La ampliación para transferir códigos entre variantes sigue
fuera de alcance y requiere su propio análisis.


## Registro de fase 3 — 2026-10-15

### Estado inicial, cambios y preservación

Flutter inició en HEAD `d4e66bb`, rama `main`, con 13 archivos de fases 1/2
modificados o sin seguimiento. Se leyeron ambos AGENTS, las dos guías offline,
el plan y esta continuidad. Se revisaron implementación, pruebas y logs reales
de fases 1/2 sin rehacer comandos, handlers, UI ni trabajo de servidor.

La comparación SHA-256 con el baseline al iniciar fase 3 confirma los nueve
archivos previos de producción idénticos y conserva las pruebas del comando
y el doble de inventario. Solo se modificaron dos archivos de pruebas para
cubrir un hueco real: CSV importado sin barcode → interfaz → persistencia en
archivo → cierre/reapertura → consulta → reemplazo conservando coincidencias
compartidas. No se encontraron defectos de producción; no se introdujo ningún
cambio funcional, de esquema, dependencias o negocio. Se corrigió la omisión
documental del nuevo acceso y se cerraron los estados obsoletos del plan.

Todos los datos nuevos usan archivos SQLite temporales con
`AppDatabase.forTesting(NativeDatabase(file))`. No se abrió `AppDatabase()` ni
se alteraron bases, catálogos o preferencias de uso. Se cierran y eliminan los
directorios de prueba. No se ejecutó la aplicación habitual ni servicios remotos.

### Archivos propios de esta fase

Raíz Flutter: `/Users/benjamin/Projects/POS/pos_flutter/`.

- `test/presentation/pages/gestion_inventario/articulos/inventory_barcode_flow_test.dart`:
  dos recorridos nuevos, uno por modo, importando CSV real y reabriendo dos
  veces el mismo archivo; las 31 pruebas existentes se preservan.
- `test/support/inventory_barcode_fixture.dart`: constructor con base/modo
  opcionales para ejecutar esos recorridos; el comportamiento predeterminado
  anterior sigue intacto y no tiene otros consumidores.
- `AGENTS.md`, `README.md`, `docs/architecture/offline_feature_flow.md`:
  acceso funcional, guardado acotado y límites de verificación.
- `docs/testing/inventory_barcode_verification.md`: matriz completa, nombres
  de pruebas, recorrido, comandos, resultados y pendiente físico.
- `docs/testing/evidence/inventory_barcode_phase3/navigation.log`, `analyze.log`
  y `manifest.json`: logs nuevos y hashes de preservación/evidencia reutilizada.
- En el vault, únicamente esta nota y `Plan de implementacion.md` de esta
  carpeta. Se conservaron las demás notas, Mapa y workspace ya modificados.

### Comandos y resultados finales

| Comando / revisión | Resultado |
|---|---|
| `flutter test test/presentation/pages/gestion_inventario/articulos/inventory_barcode_flow_test.dart --reporter expanded` | 33 aprobadas (31 existentes + 2 nuevas), 0 fallos/omisiones, salida 0, 23 s |
| `dart analyze` | `No issues found!`, salida 0 sobre los dos archivos Dart finales y el resto del proyecto |
| `dart format --output=none --set-exit-if-changed test/support/inventory_barcode_fixture.dart test/presentation/pages/gestion_inventario/articulos/inventory_barcode_flow_test.dart` | 0 cambios pendientes |
| `git diff --check`; búsquedas `rg` de consumidores/imports/placeholders/escrituras | Sin errores de whitespace ni imports/helpers/modelos/archivos muertos nuevos; UI de escaneo sin Drift ni operaciones de venta |
| Comparación SHA-256 de los 13 archivos previos | 11 intactos; solo los dos archivos de pruebas listados cambian; producción completa de fases 1/2 preservada |
| `flutter devices --machine` | iPhone 17/iPad Pro 13-inch (M5) simulados, macOS y Chrome; sin teléfono/tablet físico conectado |
| `system_profiler SPCameraDataType` | MacBook Air Camera disponible en host macOS 27.0.1; no se invocó la cámara |
| `dart run build_runner build` | No aplica: sin cambios Drift/esquema |

El primer pase de las 33 pruebas y analyze aprobó sin fallos. Después se
hicieron más explícitos los valores esperados de los dos casos nuevos y se
repitieron navegación/analyze sobre el resultado final, también aprobados.
Los logs finales originales están en `/tmp/pos_flutter_barcode_phase3_navigation.log`
y `/tmp/pos_flutter_barcode_phase3_analyze.log`; copias durables en Flutter.

Se reutilizó `flutter test --reporter expanded` aprobado de fase 2: 2064
aprobadas, 10 omitidas y 0 fallos, salida 0; también las 60 pruebas del comando
sin modificaciones. La producción no cambió en esta fase y el fixture solo lo
consume la prueba dirigida que volvió a ejecutarse; no se justificó repetir
la suite completa. Las 10 omisiones siguen requiriendo `POS_SUPPLIER_SYNC_URL`
o `POS_PHASE3_SYNC_URL` con Nest/PG aislados, fuera de alcance. No se ocultan
fallos ajenos ni se detectaron regresiones. No se declara una suite completa
nueva con 2066 pruebas.

### Recorrido y matriz final por caso

Evidencia detallada y enlaces a fuentes/logs:
[Verificación de inventario](/Users/benjamin/Projects/POS/pos_flutter/docs/testing/inventory_barcode_verification.md).
`UI` significa las 33 pruebas de navegación ejecutadas en esta fase;
`CMD` significa las 60 pruebas del comando aprobadas y reutilizadas de fase 2.

Las dos pruebas nuevas importan Café Chico/Grande y Agua sin ningún barcode.
Grande tiene costo y existencias; se conserva una venta previa. La cámara falsa
entrega ` ０００４２ ` y se recorre aviso → selector → confirmación → guardado.
Un evento guarda `00042`; cerrar/reabrir SQLite conserva todas las filas. La
consulta normalizada encuentra Grande y `42` no coincide; escanear el código
abre su edición, cancelar no escribe. Se prepara Chico con el mismo código,
se comprueban dos coincidencias, se reemplaza solo Grande desde UI por `00043`
y se vuelve a reabrir. `00043` encuentra Grande y `00042` únicamente Chico.
Las tablas ajenas y el snapshot de negocio salvo el barcode quedan intactos.
Entrega y refs son correctos en standalone y server_sync.

| ID | Resultado final | Evidencia |
|---|---|---|
| I01 | Aprobado automatizado | UI lector sobre `+`, solo Artículos, otras tres pestañas y menú `+` |
| I02 | Aprobado automatizado | UI coincidencia única ubica/destaca segunda variante; CSV reabierto abre Grande; sin escritura |
| I03 | Aprobado automatizado | UI varias coincidencias, precio/nombre, selección explícita y cancelación; CMD compartidos |
| I04 | Aprobado automatizado | UI desconocido muestra código/aviso y ofrece asignar; sin alta automática |
| I05 | Aprobado automatizado | UI búsqueda combinada por producto/variante, con/sin barcode/seguimiento, sin detalle por fila |
| I06 | Aprobado automatizado | UI asignación a Agua sin nombre/barcode/seguimiento; selector incluye Light con seguimiento |
| I07 | Aprobado automatizado | UI null → código confirmado; CSV ambos modos, un producto_actualizado aplicado/persistido |
| I08 | Aprobado automatizado | UI códigos actual/nuevo y reemplazo exclusivo; CSV/CMD conservan otras variantes |
| I09 | Aprobado automatizado | UI cancela lector, aviso, selector, confirmación, coincidencias y edición; comparación de todas las tablas |
| I10 | Aprobado automatizado | UI CSV NFKC/trim y ceros tras reapertura; consulta 00042/00043, nunca 42/43; CMD límites 1/32 |
| I11 | Aprobado automatizado | UI inválido/33 dígitos avisa y reescanea; frames vacíos ignorados sin consulta; CMD vacío/incompatible/33 sin escritura |
| I12 | Aprobado automatizado | UI base vieja recarga y exige otro toque; retirada bloqueada; CMD producto/variante ausentes/inactivos, ajena y base inválida |
| I13 | Aprobado automatizado | UI igual no invoca comando; CMD no-op conserva metadatos/eventos |
| I14 | Aprobado automatizado | UI doble apertura/toque, lecturas repetidas, callbacks/consulta/detalle tardíos sin operaciones extra |
| I15 | Aprobado automatizado | CMD snapshots complejos por unidad/medida, receta, proveedores/fechas, precios/costos/identidades/vínculos; UI venta/inventario intactos |
| I16 | Aprobado automatizado | CMD rollback de persistencia/aplicación/base compara todas las tablas, reintento y replay doble; UI reintento preserva destino/código |
| I17 | Aprobado automatizado | UI CSV reabre dos veces en ambos modos, filas idénticas y consultas nuevo/anterior/compartido; CMD historial before/after |
| I18 | Aprobado automatizado local | CMD refs declaradas/validadas en ambos; standalone not_required sin refs/undo/remotos; server_sync pending y refs local_pending; UI CSV revalida entrega/refs y reapertura |
| I19 | Aprobado automatizado | Suite de fase 2: editor, buscador y lectores Caja sin regresiones; UI CSV conserva venta/líneas sin incorporar ninguna |
| I20 | Pendiente físico | UI cámara falsa cubre errores, pausa/cierre/reapertura y permiso pendiente; no acredita hardware nativo |

### Prueba física y cierre

1. La plataforma disponible con cámara fue macOS 27.0.1, MacBook Air Camera;
   los iOS disponibles eran simuladores. El usuario eligió expresamente
   «Dejar la prueba física pendiente». No se ejecutaron permiso/lectura nativos
   ni se declaró aprobado I20; no se cambiaron permisos del sistema.
2. Pendiente concreto: con datos aislados y etiquetas disponibles registrar
   dispositivo/SO, formato/valor textual con ceros, permisos, lectura,
   cancelación, segundo plano, cierre con permiso pendiente y reapertura/liberación
   real de cámara. No bloquea el cierre automatizado.

Implementación y verificación automatizada completas dentro del alcance.
Sin placeholders ni piezas nuevas deliberadamente sin uso. No se implementaron
transferencias, unicidad, escaneo continuo, altas nuevas, cambios de ventas,
esquema, servidor ni transporte remoto. Siguiente acción únicamente si se
solicita: completar I20 físico; no repetir fases 1/2/3 automatizadas del mismo
código.
