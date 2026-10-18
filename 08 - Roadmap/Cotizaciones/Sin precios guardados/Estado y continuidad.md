---
tipo: seguimiento_implementacion
estado: fase_4_completada_alcance_local
revision_plan: 3
actualizado: 2026-10-07
---

# Estado y continuidad: cotizaciones sin precios guardados

## Solicitud vigente

El 2026-10-06 el usuario pidió un plan para guardar solamente los productos de
las cotizaciones, eliminar datos/código innecesarios, incluidos campos de base
de datos, y poder ejecutar la modificación en varias sesiones.

Se preparó la revisión 3 a partir del código local real. **Fases 1–4 completadas en
el alcance local, con cierre el 2026-10-07**, con límites nativos registrados en el cierre: Flutter guarda selección sin importes y recupera con condiciones
vigentes mediante eventos de venta y vínculo atómicos. El usuario
confirmó en esta misma sesión mostrar precios y total vigentes, calculados al
consultar o compartir. Esta lectura se prepara en memoria y no se guarda en la
cotización. La recuperación usa precios vigentes del catálogo local.

El 2026-10-06 se ejecutó **únicamente fase 1: Contrato y preparación**. Contrato,
fixtures e inventario revalidado fueron preparados entonces. En una sesión
posterior se completó únicamente fase 2 y después fase 3. La sesión vigente
ejecutó únicamente fase 4: verificación y cierre del producto resultante.

## Documentación vigente

- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Plan de implementacion|Plan, revisión 3]].
- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Mapeo y limpieza|Campos y código a retirar]].
- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Casos de aceptacion|Casos P01–P28]].
- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Contrato y fixtures|Contrato final y fixtures]].
- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Matriz de pruebas|Pruebas existentes a adaptar]].
- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/01 - Contrato y preparacion|Sesión 1]].
- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/02 - Core y esquema|Sesión 2]].
- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/03 - Consulta y ticket|Sesión 3]].
- [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/04 - Verificacion y cierre|Sesión 4]].

## Estado por sesión

| Sesión | Estado | Dependencia / salida |
|---|---|---|
| Planificación de revisión 3 | Completada | Código inspeccionado; plan/mapeo/matriz/sesiones e índices documentados |
| 1. Contrato y preparación | Completada, 2026-10-06 | Formato 2/11 fixtures/IDs/transacción/política y matriz P01–P28 verificados; baseline 121 anteriores |
| 2. Core y esquema | Completada, 2026-10-06 | Selección/formato 2 sin importes, eventos separados atómicos, esquema 8 y UI funcional con estimación en memoria; 1292 tests pasan |
| 3. Consulta y ticket | Completada, 2026-10-06 | Catálogo reactivo, PNG coherentes/inspeccionados, share estable y selector Android cancelado; 1300 tests pasan |
| 4. Verificación y cierre | Completada en alcance local, 2026-10-07 | P01–P28 resueltos, 1306 tests + 1 omitido; auditoría/backup/cobro/PNG/native macOS; límites físicos/WhatsApp/universal abiertos |

No queda otra fase funcional pendiente de revisión 3. Las siguientes pruebas
concretas son envío/recepción WhatsApp, dispositivo físico Android/iOS y selector
iOS, además del build universal macOS; debug/release arm64 sí están verificados.
No volver a ejecutar prompts de revisión 2; su evidencia se conserva como historial.

## Datos de relevo

- Flutter: `/Users/benjamin/Projects/POS/pos_flutter`, HEAD inicial observado
  `56ddbc49f7369b2598aabe3c67b03135b7c89b46`, con implementación previa sin commit.
- NestJS: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`,
  HEAD `e451d1b4d9b9a4182aa41d3e8a525bf60c465c3e`, limpio al inspeccionar.
- Esquema Flutter vigente: versión 8; reset de desarrollo y protección de
  respaldos restaurados. El cambio puede reiniciar toda la base antigua.
- Cotizaciones locales en ambos modos. Los refs se declaran/validan siempre y
  solo se persisten en `server_sync`. Standalone no inicia servicios de sync.
- El precio y costo deben conservarse en la venta recuperada; retirarlos solo
  de cotización, sus tablas y payloads. No alterar contratos remotos de venta.
- Evidencia nueva: `08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/`.
  No reutilizar el resultado «1254 pruebas aprobadas» del cierre anterior como
  resultado de esta modificación; ejecutar y registrar los checks nuevos.

## Registro obligatorio al cerrar cada sesión

1. Fecha, sesión/revisión ejecutada, HEAD y estado inicial/final.
2. Archivos propios y cambios previos preservados; decisiones nuevas del usuario.
3. Contrato final, columnas retiradas y tratamiento real de datos anteriores.
4. Comandos/resultados y casos Pxx probados, con enlaces a evidencia nueva.
5. Fallos previos frente a regresiones propias, límites y siguiente sesión.

Marcar completada solo una sesión que cumpla sus salidas. Si se divide la sesión
2 por tamaño, registrar el punto exacto y continuar en el mismo conjunto de
cambios hasta que todos los consumidores estén adaptados; no presentar como
terminado un esquema que todavía dependa de campos eliminados.

## Cierre de planificación — 2026-10-06

Se crearon ocho notas: plan, mapeo, continuidad, casos y cuatro sesiones con
prompts. Se confirmó la presentación de precios/total vigentes con el usuario,
se actualizaron índice y avisos de vigencia en las notas anteriores y se
conservaron sus evidencias.

Verificación documental: ocho notas nuevas, cuatro sesiones, secuencia P01–P28,
117 enlaces internos de las notas nuevas/actualizadas, frontmatter y ausencia
de espacios finales correctos. `git diff --check` sin incidencias. Los estados
de los repositorios Flutter/NestJS coinciden con los observados al comenzar;
no se modificó código ni se ejecutaron pruebas de aplicación o resets.

## Cierre de fase 1 — 2026-10-06, revisión 3

La preferencia de presentación permanece confirmada: precios/total vigentes
al consultar/compartir, cálculo temporal sin escritura; recuperación con precios
vigentes y continuación con el snapshot de la venta existente. No hubo una
nueva decisión solicitada al usuario ni cambio de alcance.

### Repositorios y preservación

- Flutter: rama main, HEAD inicial/final
  `56ddbc49f7369b2598aabe3c67b03135b7c89b46`. Se registraron los 806 archivos
  versionados/no ignorados del árbol y su SHA-256; status y contenido final
  idénticos a la base, incluidos todos los cambios previos y cotizaciones sin commit.
- Análisis: HEAD inicial/final `424c8bb7995f49a2255e97c778155efd31b1f648`;
  cambios de esta sesión limitados a `08 - Roadmap/Cotizaciones/Sin precios guardados/`.
  Las demás notas/evidencias se conservan. El hash de `.obsidian/workspace.json`,
  que ya estaba modificado inicialmente, varió durante la sesión fuera de las
  ediciones de este trabajo; se dejó su contenido actual sin restaurarlo.
  Esa variación queda registrada aparte en preservación. Los estados Git
  agrupan esta carpeta como sin seguimiento; el registro por hashes permite
  distinguir las notas modificadas dentro de ella.
- NestJS no se modificó ni se abrió en esta fase. El HEAD de planificación
  listado arriba es histórico, no una nueva verificación del backend. El corte
  acordado es local Flutter; no requiere implementación de servidor.

Registros: `Evidencia/fase-1-arboles-iniciales.json`,
`fase-1-analisis-status-inicial.txt`, `fase-1-flutter-status-inicial.txt`,
`fase-1-analisis-status-final.txt`, `fase-1-flutter-status-final.txt` y
`fase-1-preservacion.json`. No se restauró el árbol ni se hizo checkout/stash/commit;
no hubo regeneración Drift ni apertura/reset de bases de uso. Las pruebas de
baseline sí ejercitan reset/restore de sus archivos temporales controlados.

### Entregas y decisiones técnicas cerradas

- Nuevos `Contrato y fixtures.md`, `Matriz de pruebas.md`, `Fixtures/README.md`,
  `Fixtures/validar_fixtures.py` y 11 JSON de selección/catálogos/guardado/
  recuperación/identidades/formatos antiguos/política estructural.
- Actualizados `Mapeo y limpieza.md`, `Casos de aceptacion.md`, esta continuidad
  y `Sesiones/01 - Contrato y preparacion.md`. Plan y sesiones 2–4 conservados.
- Las siete columnas/CHECKs a retirar y todos los consumidores siguen vigentes;
  eliminar en fase 2, con snapshot de selección independiente y formato 2 cerrado.
  No se admiten formatos anteriores ni copias monetarias anidadas de quotation.
- Recuperación = N eventos sale_draft existentes con precio/costo/referencia/
  consumo actuales + un vínculo quotation sin importes, bajo la misma transacción
  SQLite desde lectura hasta vínculo. Venta versión N y metadatos primer/último;
  para fixture N=2, total $390 y 13 refs de recuperación en server_sync (0 standalone).
- IDs de líneas quotation v5 existentes; líneas sale v4 deterministas con semilla
  actual; eventos sale_draft v4 deterministas con semilla de vínculo/venta/línea.
  Mapas de dos intenciones preparados. Retry aplicado/Continuar no recalcula ni
  vuelve a imponer cantidades originales; replay no resucita ni regresa vínculos.
- Otro borrador, incluso vacío, bloquea nueva creación. El handler final acepta
  el propio borrador preparado y solo verifica/vincula. Fallo de línea/refs/
  vínculo revierte todos los eventos/proyecciones/refs; navegar después del commit.
- Refs declaradas/validadas en ambos modos; solo server_sync persiste. Store
  admite refType textual `event` para usos del vínculo; validación individual
  corresponde al contrato/comando, además de su check de lista no vacía.
- P07 usa catálogo preparado: $30/100 g con unidad g compatible. El editor de
  artículos exige actualmente referencia=factor; no se amplía ese editor ni
  el contrato remoto. Esta precisión está documentada y no bloquea el corte local.
- Política fija: schemaVersion 8, required conservadas + forbidden retiradas;
  reset completo solo de copia antigua no protegida. Respaldo protegido incompatible
  se rechaza/conserva; formato 8 del manifiesto no basta. No migrador/conversión.

### Comandos y resultados

| Comprobación | Resultado / evidencia |
|---|---|
| Lectura AGENTS, guías offline y cinco notas de entrada; git HEAD/status y rg de código/consumidores | Revalidación completada; `Evidencia/fase-1-consumidores.txt` y estados iniciales |
| flutter test --no-pub --reporter expanded, selección exacta de Matriz de pruebas | Exit 0, **121 aprobadas**, ningún fallo previo observado; `Evidencia/fase-1-baseline-flutter-test.txt` |
| python3 Fixtures/validar_fixtures.py | Exit 0; 11 JSON, contrato sin importes quotation, dos intenciones/IDs, venta total 39000 y refs coherentes |
| Dart temporal con package_config de Flutter e idFor reales | Exit 0; UUIDs v5/v4 y nueva semilla de eventos coinciden en ambas intenciones; `Evidencia/fase-1-identidades-dart.txt`; sin inicializar app/SQLite |
| Auditoría documental de enlaces/rutas/JSON/claves/IDs/fechas y cobertura P01–P28 | Paquete preparado, evidencia `Evidencia/fase-1-validacion.txt` |
| git diff --check y whitespace de archivos nuevos | Sin incidencias; incluye nuevos archivos no cubiertos por diff de seguimiento |
| Comparación de hashes/status al cierre | Flutter intacto; cuatro notas de análisis editadas en esta fase, archivos nuevos y variación ajena de workspace Obsidian registrada, `Evidencia/fase-1-preservacion.json` |

La prueba de baseline usa harness en memoria y path_provider mock/directorios
temporales para DI, backup y reinicio. No demuestra la nueva funcionalidad;
**P01–P28 siguen pendientes de ejecución** en fases 2–4. No se ejecutaron analyze,
build_runner ni suite completa en esta fase documental. No se reutilizó evidencia
de 1254 pruebas del cierre anterior.

### Relevo concreto a fase 2

1. Releer AGENTS/guías/plan, este contrato/fixtures/matriz y revalidar HEAD/status.
   Conservar los cambios previos que contiene el árbol real.
2. Implementar QuotationSelectionSnapshot y formato 2 de guardado/vínculo;
   retirar expectedTotalMinor de cotización, conservar integridad interna de
   venta y comparación de selección para idempotencia.
3. Preparar snapshots actuales, IDs y N eventos de borrador + vínculo atómicos.
   Cambiar las detecciones que igualan createdEventId de venta con lastEventId
   quotation y el rechazo de cualquier borrador en handler final. Probar rollback
   de todos los pasos, continuación con edición y retry histórico limpio.
4. Retirar siete columnas/CHECKs, adapters insertRecoveredDraft, modelo/aviso
   QuotationPriceChange y CotizacionRecuperadaLine monetario. Reemplazar por mapa
   tipado y generador de identidad. Conservar precios/costos en venta/catalogo.
5. Cambiar predicado de esquema y pruebas de respaldo usando solo bases temporales;
   versión 8, sin onUpgrade; proteger restaurados y verificar segundo arranque.
6. Adaptar DAOs/repositories/DI/Caja/listado/detalle/ticket para compilar con dominio
   nuevo; conectar estimación actual coherente en memoria, sin placeholders
   monetarios. Fase 3 completa reactividad, textos/caché y QA de PNG.
7. Actualizar pruebas de la matriz y consumir fixtures. Regenerar Drift, ejecutar
   dart analyze/flutter test/git diff --check y registrar Pxx/evidencia nueva.
   La fase 2 no está empezada ni debe considerarse terminada por este contrato.

Criterios de salida de fase 1 **cumplidos**: contrato/fixtures consumibles,
inventario revalidado, transacción/retries/rollback y esquema/backups fijados,
P01–P28 asociados y relevo concreto. No quedan decisiones de producto pendientes
para comenzar fase 2; la aceptación funcional permanece pendiente.

## Cierre de fase 2 — 2026-10-06, revisión 3

El corte completo de core/esquema terminó en el mismo árbol de Flutter, HEAD
`56ddbc49f7369b2598aabe3c67b03135b7c89b46`, preservando cambios previos.
43 archivos modificados respecto al inicio, 21 nuevos y 2 eliminados.
Inventario exacto: `Evidencia/fase-2-archivos.md` / JSON; hashes/estado en
`fase-2-preservacion.json` y estados inicial/final. NestJS limpio e intacto.
En análisis, `.obsidian/workspace.json` varió fuera de las ediciones del trabajo;
se conservó sin restaurarlo y consta en fase-2-analisis-preservacion.json.

Implementados snapshot propio, guardado/vínculo formato 2 estricto sin importes,
recuperación actual por N eventos sale_draft, refs por modo y rollback de todos
los pasos. Retry/Continuar conservan capturas editadas; replay no resucita ni
retrocede vínculos. Retirados total esperado de cotización, siete columnas/CHECKs,
QuotationPriceChange/aviso y métodos de inserción de recuperación sin consumidores.
Dominio/repositorio/DAO/DI/UI adaptados; estimación SQLite coherente en memoria,
no disponible si falta una línea, sin sustituciones monetarias.

SchemaVersion 8; ninguna migración añadida al onUpgrade histórico que ya existía.
Detección required+forbidden y protección restaurada verificadas para cada una
de las siete columnas mediante archivos temporales. Primer arranque de esquema
antiguo no protegido borra **toda la base** según política de desarrollo; segundo
arranque conserva la nueva. Base restaurada incompatible se rechaza con hash y
marcador intactos. No se abrió/reinició una base de uso ni se alteraron respaldos
históricos.

Verificaciones finales: build_runner exit 0; analyze sin incidencias; flutter test
**1292 aprobadas y 1 omitida** (integración que exige servidor aislado ajeno al
alcance); git diff --check exit 0. Primera suite con 10 regresiones propias de
fecha/expectativa de widget fue corregida y se conserva su log; la suite final
es posterior y pasa. Fixture real: $240 + $150 = $390; N=2, 3 eventos, 0/13 refs.
Ambas intenciones deterministas verificadas con el código Dart real.

Evidencia y casos:
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-2-core-y-esquema|Cierre/evidencia fase 2]].
P01–P24 tienen cobertura local/temporal según esa nota; P28 core auditado.
No declarar completos P26/P27 ni el cierre integral de P25/P28.

Relevo a fase 3: `QuotationRepository.estimate` y `QuotationEstimate` ya están
conectados a listado/detalle/ticket. Actualmente watchDocuments observa quotation,
quotation_items y sales; falta observar catálogo. `_display`/`_image` aún conservan
la generación abierta; reabrir relee catálogo vigente, pero cambio en pantalla
abierta requiere invalidación. Completar fecha/textos de vigencia, dos generaciones,
share coherente y QA visual de PNG. Fases 3 y 4 no se ejecutaron. La fase 2 no deja
pendientes de core/esquema ni consumidores con campos monetarios ficticios.


## Cierre de fase 3 — 2026-10-06, revisión 3

Se ejecutó únicamente Consulta y ticket. Flutter conserva rama main y HEAD
`56ddbc49f7369b2598aabe3c67b03135b7c89b46`. Sobre el árbol inicial de 825 archivos:
14 modificados, 1 nuevo, 811 intactos y ninguno eliminado. Los cambios anteriores
se mantienen, incluidos comandos, esquema/archivo generado, DI, Caja, recibos,
menú y sincronización. El único cambio de `caja_quotation_test.dart` es formato.
No checkout/restore/stash/commit, regeneración Drift, cambio de esquema o NestJS.
No se abrió una base de uso. La consulta se prueba con SQLite en memoria y el
reinicio ya existente de la suite usa únicamente su archivo temporal.

- DAO observa quotations, quotation_items, sales, products, product_variants,
  units y recipe_components. Cada notificación relee el documento y dispara una
  estimación en la transacción de lectura existente. Consulta no persiste importes.
- Listado/detalle/ticket muestran estimación vigente; selección/nombres guardados
  permanecen visibles al retirar producto/variante/unidad. Incidencias conservan
  cantidad/unidad y muestran Total no disponible sin ceros ni suma parcial.
- Fecha de creación y momento de cálculo separados. Ticket: Precios vigentes al
  generar, Total estimado actual y El precio se recalcula al recuperar en Caja;
  leyenda de ausencia de pago/reserva y columnas monetarias conservadas.
- `_display`/`_image` se invalidan por documento/estimación. No se presenta el
  resultado anterior mientras carga el nuevo. Cada share copia sus bytes y puede
  coexistir con la siguiente generación; doble pulsación, error/retry y callbacks
  obsoletos o tras dispose están cubiertos. Corregido retry que devolvía Future
  dentro de setState.
- P15 navega al mismo Home/Caja, conserva identidad, cantidad editada, revisión y
  precio del borrador tras cambiar catálogo; comparación de todas las tablas sin
  nuevas escrituras. Nueva captura conserva expectedDraftEventId del origen.

Validaciones: dart analyze sin incidencias; flutter test **1300 aprobadas y 1
omitida** (integración de servidor aislado); git diff --check sin incidencias.
43 pruebas dirigidas pasan; 19 de exportación/PNG pasan. Ocho PNG nuevos
inspeccionados: piezas, kg/L, nombres largos, 18 líneas, indisponibilidad, dos
generaciones en pantalla abierta ($145.01 a $315.01) y recibos cash/transfer/credit.

QA nativa Android: emulador MotoG arrancado en read-only sin guardar snapshots;
entrada temporal con fixture en memoria, sin inicializar SQLite/DI/sync/comandos.
Compartir y WhatsApp abrieron com.android.intentresolver; se cancelaron y ambos
botones volvieron a habilitarse. PNG real del plugin y capturas/XML guardados.
Entrada retirada y emulador detenido. **WhatsApp no está instalado**; no se probó
un envío/recepción real, selector iOS ni dispositivo físico Android/iOS. Los
ShareResult de widgets son simulados; el selector Android sí fue nativo.

P09/P10/P15/P26/P27 cumplidos en el alcance automatizable y QA Android descrito;
P27 conserva ese límite real. P25 conserva recibos/regresiones; no es cierre
integral de cobro. P28 se revisó para los archivos de esta fase; auditoría final,
matriz integral y QA física/WhatsApp/iOS pendientes de fase 4, no ejecutada.

Evidencia y registro exacto de archivos:
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-consulta-y-ticket|Fase 3]],
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-archivos|Archivos fase 3]].
Preservación y hashes en fase-3-preservacion.json. `.obsidian/workspace.json`
varió fuera de las ediciones de este trabajo, se conserva sin restaurarlo.
No quedan decisiones de producto ni pendientes de implementación de fase 3.

## Cierre de fase 4 — 2026-10-07, revisión 3

Se ejecutó únicamente Verificación y cierre. HEAD Flutter inicial/final
56ddbc49f7369b2598aabe3c67b03135b7c89b46, rama main. Los 826 archivos iniciales
coincidían exactamente con el cierre de fase 3. Tres tests modificados, uno
nuevo, 823 intactos y ninguno eliminado; todos los cambios previos conservados.
Producción, esquema y generado Drift intactos; no regeneración necesaria.
NestJS limpio/intacto, HEAD e451d1b4d9b9a4182aa41d3e8a525bf60c465c3e.
No se abrió/resetó una base de uso ni se cambió la sincronización de cotizaciones.

P01–P28 tienen resultado y evidencia nueva en Casos de aceptación. Auditor
sobre 11 copias SQLite actuales, seis cobros y dos fixtures: esquema exacto
12/17 columnas, siete retiradas/CHECKs ausentes, JSON quotation cerrado
incluyendo anidados, sin copias monetarias equivalentes. Catálogo/ventas y
eventos sale_draft/venta_confirmada conservan sus precios/costos/importes.
El estado inicial reconstruido de fase 3 y las evidencias históricas se conservan.

Se ampliaron pruebas de captura vigente y recibo real, refs observadas antes
de persistencia en ambos modos, gate de runtime standalone y restauración
real de base antigua con siete columnas. N líneas, fallos intermedios/refs/vínculo,
respuesta descartada tras commit, doble toque, edición/continuación/limpieza/replay
y Vendida con incidencias de sync pasan. No se encontraron regresiones funcionales
ni otros helpers/imports/registros muertos que requirieran editar producción.
Se corrigió una expectativa del auditor nuevo: sales no tiene currency física;
la moneda sí permanece en evento/recibo. Log del intento inicial preservado.

En ambos modos se declaran/validan refs; standalone cero filas y sin inicio
del monitor que coordina health/preflight/push/pull/WebSocket; server_sync
persiste refs. Quotation y sale_draft not_required. Confirmación elegible
habitual sin refs/dependencia remota quotation. No se usó servidor para cotizar.

Seis escenarios cash/transfer/credit conservan todos los saldos/tablas de negocio
antes de confirmar. Recuperación captura $294.01; cambio posterior lleva
estimación a $304.01 y el recibo sigue $294.01. Caja/deuda/pagos/consumo correctos
una vez, incluidos reintento rechazado y replay idempotente.

Disponible/En venta/Vendida en ambos modos: archivo temporal, ruta real de
detección, reinicio normal, restore y segundo arranque conservan selección/estado/
vínculo/eventos/refs. Historias recuperadas/editadas también preservadas.
Base vieja versión 8 no protegida: reset completo solo de copia temporal.
Restaurada antigua versión 8 por servicio real: rechazo, hash/marcador/evento
legado intactos. El reset elimina toda la base antigua, no solo precios.
No migración ni conversión de historial pendiente silenciosa.

Checks finales: dart analyze sin incidencias; flutter test **1306 aprobadas
y 1 omitida** (integración que exige servidor aislado); git diff --check pasa.
Build macOS debug y release arm64 pasan. Release universal falla en lipo al
verificar conjuntamente arm64/x86_64; cada verificación individual pasa.
Se obtuvo release con FLUTTER_XCODE_ARCHS=arm64, sin editar proyecto/SDK.

Ocho PNG nuevos inspeccionados, incluidas generaciones $145.01/$315.01 en
misma pantalla y recibos/indisponibilidad/18 líneas. Selector macOS real de
Compartir y WhatsApp abierto/cancelado/reabierto; PNG nativo completo inspeccionado,
tres archivos de share con hash idéntico. Entrada temporal retirada y app detenida.
WhatsApp instalado en el host, pero no ofrecido por ese selector; no hubo envío.

**Criterios de salida local de fase 4 satisfechos. Pendientes que no se marcan completos:**

1. Envío/recepción real de PNG en WhatsApp con destinatario autorizado.
2. QA física Android/iOS y selector iOS cuando haya dispositivo disponible.
3. Build release universal macOS: resolver el fallo de verificación conjunta
   de lipo y revalidarlo; build debug/release arm64 ya aprobados.

Evidencia nueva, comandos, saldos y límites:
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-4-verificacion-y-cierre|Cierre/evidencia fase 4]].
Inventario/hash y preservación en fase-4-archivos.md y fase-4-preservacion.json.
Análisis actualizado en plan/matriz/casos/mapeo/continuidad/sesión/contrato/fixtures
e índice. .obsidian/workspace.json cambió fuera de las ediciones de este trabajo;
se conservó sin restaurarlo y su diferencia figura en fase-4-preservacion.json.
No quedan tareas funcionales ni decisiones de producto pendientes.
