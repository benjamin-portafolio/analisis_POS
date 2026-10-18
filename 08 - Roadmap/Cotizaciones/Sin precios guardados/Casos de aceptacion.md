---
tipo: casos_aceptacion
estado: verificados_fase_4_con_limites_nativos
revision_plan: 3
actualizado: 2026-10-07
---

# Casos de aceptación: selección sin precios guardados

Contrato: [[08 - Roadmap/Cotizaciones/Sin precios guardados/Plan de implementacion|Revisión 3]].
Usar IDs Pxx para distinguir esta verificación de C01–C36 del comportamiento
anterior. Cada caso debe registrar resultado y evidencia nueva.

Preparación completada en fase 1: contratos/fixtures disponibles en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Contrato y fixtures|Contrato y fixtures]];
todos los casos están asociados a pruebas reales en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Matriz de pruebas|Matriz de pruebas]].
La tabla inicial define el contrato; la matriz resuelta de fase 4 al final de
esta nota registra el resultado vigente de cada Pxx.

| ID | Caso | Resultado esperado | Evidencia |
|---|---|---|---|
| P01 | Guardar piezas y producto medido | IDs propios, orden, cantidades/unidades/nombres conservados; sin precio, costo, total ni referencia de precio | Contratos + filas SQLite |
| P02 | Inspeccionar el esquema creado | Ausencia física de las siete columnas retiradas, CHECKs correspondientes y campos equivalentes | PRAGMA + DDL |
| P03 | Inspeccionar todos los payloads del agregado quotation | Guardado y recuperación formato 2 sin datos monetarios, incluso anidados; payload viejo rechazado explícitamente | JSON + contratos |
| P04 | Guardar con origen/revisión inválida, ajeno, vacío o confirmado | Rechazo sin evento, cotización ni refs parciales | SQLite |
| P05 | Reintentar guardar y doble intención sobre origen vinculado | Una cotización; identidad/fecha/selección originales; colisión de contenido rechazada | Comando + handler |
| P06 | Guardar a $100, cambiar a $120 y recuperar dos piezas | Borrador por $240 con precio y costo actuales; cotización permanece sin importes | SQLite + evento sale_draft |
| P07 | 500 g; catálogo pasa a $30/100 g con unidad compatible | Recuperación por $150; usa referencia actual, sin depender del denominador eliminado | Cálculo + SQLite |
| P08 | Cambio incompatible de modo, unidad o dimensión | No reinterpreta la cantidad; rechazo explicado, sin recuperación parcial | Comando + widget |
| P09 | Artículo/variante/unidad faltante o inactiva | Selección visible; recuperación rechazada; estimación incompleta sin total falso/cero | Lectura + widget  + [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-consulta-y-ticket|Fase 3]]: producto/variante/unidad reactivos, selección visible y total no disponible |
| P10 | Consultar/reabrir tras cambiar solo precio/costo/nombre/consumo | No escribe eventos ni modifica selección; estimación actualiza precio, venta nueva toma condiciones operativas actuales | Filas antes/después  + [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-consulta-y-ticket|Fase 3]]: igualdad de todas las tablas al consultar/generar/compartir; catálogo reactivo |
| P11 | Otro borrador, incluido vacío | No mezcla, reemplaza ni elimina; cotización conservada | SQLite |
| P12 | Recuperación con N líneas | N eventos sale_draft más un vínculo quotation en una transacción; cantidades absolutas, IDs estables, venta versión N | Eventos + metadatos |
| P13 | Fallo en línea intermedia, refs o vínculo final | Rollback de todos los eventos/refs/ventas/líneas/vínculos | Fallos inyectados |
| P14 | Reintento/doble toque de recuperación aplicada | Una venta y un vínculo; conserva cantidades editadas y precio ya capturado, aunque cambie catálogo | SQLite + widget |
| P15 | Continuar origen o borrador recuperado activo | Abre la Caja existente; no recalcula precios, no copia líneas ni crea eventos nuevos | Navegación + filas  + [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-consulta-y-ticket|Fase 3]]: Home/Caja existentes, precio y edición conservados, sin eventos |
| P16 | Limpiar y recuperar nuevamente | Cotización Disponible; nuevos IDs y precio actual de la nueva recuperación | SQLite |
| P17 | Reaplicar guardado, eventos sale_draft o vínculo antiguos | No duplica, resucita venta limpiada, sobrescribe confirmada ni regresa vínculo posterior | Handlers + SQLite |
| P18 | Cobrar origen o recuperación; venta con sync pendiente/conflicto/rechazo | Estado Vendida; imposible una segunda recuperación | SQLite + listado |
| P19 | Reinicio de base nueva con Disponible/En venta/Vendida | Selección/vínculos/estados intactos; no reset recurrente; continuación conserva venta | SQLite en archivo |
| P20 | Base antigua con todas las columnas nuevas y también las retiradas | Se identifica como incompatible; reset de desarrollo solo en copia temporal no protegida | Detección + archivo temporal |
| P21 | Respaldo/restauración del esquema nuevo | Selección, estados/eventos intactos, sin precios de quotation; reinicio posterior conserva base | Respaldo temporal |
| P22 | Respaldo antiguo restaurado y protegido, con schemaVersion 8 | Rechazo explícito por estructura; sin borrar base protegida ni conversión silenciosa | Archivo temporal + marcadores |
| P23 | Flujo completo standalone | Eventos locales not_required; refs validadas sin filas event_refs; servicios de sync no se ejecutan | Modo + SQLite |
| P24 | Flujo server_sync y después confirmar venta | Cotización/borrador not_required y refs persistidas; confirmación habitual elegible, sin dependencia remota de quotation | Eventos + selección de pendientes |
| P25 | Efectivo, transferencia y crédito sobre recuperación | Cobro normal, saldos/deuda/inventario/caja correctos una vez; recibos con importes de venta capturados | Regresión de ventas + SQLite |
| P26 | Listado/detalle/PNG con precios y total vigentes confirmados | Estimación coherente y etiquetada; fecha original separada del cálculo; cambio de catálogo invalida caché; no guarda importes | Widgets + PNG inspeccionado  + [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-consulta-y-ticket|Fase 3]]: dos PNG $145.01/$315.01, 18 líneas, fechas y recibos inspeccionados |
| P27 | Compartir, cancelar, fallo/reintento y callbacks tardíos | PNG consistente con una estimación; documento conservado; sin dobles envíos ni setState tras dispose | Widgets + selector nativo disponible  + [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-consulta-y-ticket|Fase 3]]: bytes estables, error/retry/dispose, selector Android cancelado; sin WhatsApp real |
| P28 | Auditoría final de eliminación | Sin modelo/avisos de precio cotizado, campos muertos, imports/registros sin uso ni copias persistidas; ventas/catalogo intactos | rg + analyze + revisión |

## Invariantes que acompañan los casos

- Guardar, consultar, compartir y recuperar no crean pagos, deuda, movimientos
  de inventario, reservas ni movimientos de caja. Comparar tablas y saldos antes
  y después; contar eventos no acredita por sí solo esta ausencia.
- P13 compara la totalidad de filas nuevas y estado anterior, no solo el vínculo.
- P03 audita el agregado `quotation`; precios en eventos `sale_draft` y
  `venta_confirmada` son necesarios y válidos. Evitar una búsqueda global que
  confunda esos contratos con precios de cotización.
- P19–P22 requieren bases en archivo y ruta real de detección/restauración, además
  de unit tests; una SQLite en memoria no prueba el reset ni el reinicio.
- P26/P27 verifican dos generaciones con un cambio de precio entre ambas.
  Mantener bytes fijos durante una operación de compartir no debe congelar todas
  las siguientes generaciones de la pantalla.

## Registro

| Fecha / sesión | Casos ejecutados | Resultado | Evidencia / límite |
|---|---|---|---|
| 2026-10-06 / planificación | Ninguno de implementación | Pendientes | Código revisado; plan creado; sin pruebas de app en esta sesión |
| 2026-10-06 / fase 1, revisión 3 | Ningún Pxx ejecutado sobre la implementación nueva | Preparación completa; aceptación pendiente | 11 JSON verificados y P01–P28 asignados; baseline anterior de 121 pruebas, sin código/esquema nuevo |

## Evidencia de fase 2 — 2026-10-06

El estado pendiente de la matriz inicial es histórico. Se implementó el corte
core/esquema y se ejecutó suite completa: 1292 aprobadas, 1 integración de servidor
omitida. Evidencia nueva:
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-2-core-y-esquema|Fase 2]].

| Casos | Resultado local de fase 2 | Pendiente posterior |
|---|---|---|
| P01–P07 | Verificados con contratos, fixture fase 1 y SQLite; $240 + $150, esquema/JSON sin importes, guardado inválido/retry | Auditoría integral de fase 4 |
| P08/P09 | Rechazo core por modo/unidad/disponibilidad, selección conservada y estimación incompleta; widget sin total falso | Reactividad y PNG de fase 3 |
| P10–P18 | Lectura sin escrituras, condiciones vigentes, borrador ajeno, N eventos/versiones/IDs, rollback/ref/retry/continuar/limpiar/replay/Vendida | QA posterior de navegación disponible |
| P19–P22 | Archivo temporal, segundo arranque, backup/restore tres estados; superconjunto antiguo y protección/hash probados | Cierre de matriz sobre producto final |
| P23/P24 | Ambos modos: not_required, refs 0/13 en fixture; confirmación normal sin dependencia quotation | Integración habitual de servidor queda fuera de esta fase |
| P25 | Regresiones existentes de cash/transfer/credit/consumo/recibos pasan | Cierre integral de fase 4 |
| P26/P27 | Adaptación funcional con estimación al abrir/reabrir, cancelación/fallo/dispose existentes pasan | **Pendientes fase 3:** observar catálogo, invalidar caché y QA de dos generaciones/compartir |
| P28 | Campos/modelos/avisos/métodos anteriores eliminados; rg/analyze/suite pasan | Auditoría final después de fase 3 |

Los respaldos y resets se ejecutaron únicamente sobre bases temporales. No hubo
prueba física del selector ni inspección visual nueva de PNG; no atribuirles esta
suite ni reutilizar las imágenes de revisión 2 como aceptación de revisión 3.


## Evidencia de fase 3 — 2026-10-06

Registro vigente: [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-consulta-y-ticket|Fase 3]]. Suite final 1300 aprobadas y 1 integración
omitida; 43 dirigidas y 19 de exportación aprobadas. Las pendientes de fase 3
indicadas en el registro histórico de fase 2 están resueltas.

| Caso | Resultado nuevo | Evidencia / límite concreto |
|---|---|---|
| P09 | Cumplido en lectura/widgets/PNG | Producto, variante y unidad inactivos actualizan pantalla abierta; todas las líneas/nombres/cantidades visibles, incidencia y Total no disponible. Rechazo core anterior sigue pasando |
| P10 | Cumplido | Cambios precio/costo/nombre/receta/unidad disparan lectura; comparación de contenido de todas las tablas antes/después de consulta/generación/share; solo cambia catálogo por el cambio de prueba explícito |
| P15 | Cumplido | Continúa el Home/Caja existente tras editar cantidad y cambiar precio del catálogo; saleId/lastEventId/quantity/unitPriceMinor y todas las tablas permanecen iguales |
| P26 | Cumplido | Transacción bloquea actualización intermedia; no mezcla revisiones. Dos PNG en la misma pantalla con cambio $35 a $120/pieza, total $145.01 a $315.01; etiquetas/fechas, nombres largos y 18 líneas inspeccionados |
| P27 | Cumplido en automatización y selector Android; entrega real pendiente | Un share mantiene el primer PNG mientras se genera el segundo; siguiente share usa el segundo. Cancelación, fallo/retry, doble pulsación y respuestas tardías/dispose pasan. Ambos botones abren selector nativo Android y cancelan; WhatsApp ausente, sin dispositivo físico ni selector iOS/envío real |
| P25 | Regresión preservada, sin cierre de fase 4 | PNG cash/transfer/credit inspeccionados; importes de venta, efectivo/cambio, referencia SPEI y cargo a cuenta conservados |
| P28 | Limpieza local de fase 3 cumplida | Analyze sin incidencias, rg sin helpers/avisos retirados, esquema/DI/core intactos; auditoría integral pendiente de fase 4 |

No se ejecutó fase 4 ni se usaron bases de producción. El selector Android fue
nativo con fixture en memoria; los resultados ShareResult de widgets son mocks
y no demuestran envío a WhatsApp. Evidencia nativa: fase-3-native-resultados.json,
capturas/XML y PNG tomado del cache del plugin.

## Matriz resuelta de fase 4 — 2026-10-07

Este es el resultado vigente sobre el producto final. Se revalidó evidencia
previa con cero diferencias de código al comenzar; la suite final vuelve a
ejecutar los casos afectados. **1306 aprobadas, 1 integración de servidor omitida**.
Las referencias siguientes son relativas a Evidencia/. Los globs agrupan
archivos concretos existentes, no pruebas pendientes. Rutas de tests relativas
a Flutter; nombres abreviados conservan la asociación completa de Matriz de pruebas.

| ID | Resultado vigente | Resultado observado | Verificación ejecutada | Evidencia nueva |
|---|---|---|---|---|
| P01 | Verificado | Dos piezas/500 g, identidades/orden/nombres/unidades; selección sin importes. | quotation_selection_v2_test + payload_guardada | fase-4-core/*.json; fase-4-flutter-test.txt |
| P02 | Verificado | 12/17 columnas exactas; siete columnas/CHECKs retirados; índices/FK conservados. | PRAGMA/DDL de 11 copias actuales | fase-4-auditoria-sqlite.json |
| P03 | Verificado | Guardado/vínculo formato 2; objetos/listas de claves cerradas; legado y extras rechazados. | Ambos payload tests + auditor recursivo | fase-4-auditoria-sqlite.json; fase-4-flutter-test.txt |
| P04 | Verificado | Propietario/origen/revisión/vacío/confirmado/integridad inválidos no dejan escrituras. | cotizacion_command_service_test | fase-4-core-inicial.txt; fase-4-flutter-test.txt |
| P05 | Verificado | Retry/doble intención: un documento, fecha/selección originales; colisión rechazada. | cotizacion_command_service_test + handler | fase-4-core-inicial.txt; fase-4-flutter-test.txt |
| P06 | Verificado | Dos piezas pasan de $100 a $120; captura nueva $240 con costo actual. | quotation_selection_v2_test | fase-4-core/*.json |
| P07 | Verificado | 500 g × $30/100 g = $150; referencia actual compatible. | Fixture de catálogo local; no ampliación de editor | fase-4-core/*.json |
| P08 | Verificado | Modo/dimensión/código/símbolo/factor incompatibles rechazan todo; UI explica. | recuperar_cotizacion_test + widgets | fase-4-flutter-test.txt |
| P09 | Verificado | Ausente/inactivo conserva líneas; estimación total null; no suma parcial/cero. | Core/estimación/widgets + PNG | fase-4-flutter-test.txt; fase-4-png/cotizacion-no-disponible.png |
| P10 | Verificado | Lectura coherente/reactiva sin cambios en todas las tablas; venta usa catálogo actual. | quotation_estimation/navigation/verification | fase-4-sqlite/saldos-*.json; fase-4-core/*.json; fase-4-flutter-test.txt |
| P11 | Verificado | Otro borrador lleno o vacío bloquea sin pisar/mezclar. | recuperar_cotizacion_test | fase-4-core-inicial.txt; fase-4-flutter-test.txt |
| P12 | Verificado | N=1/2/3; N eventos + vínculo, cantidades absolutas y versión N; primer/último correctos. | Core/DI/recuperación/refs | fase-4-core/*.json; fase-4-sqlite/refs-*.json |
| P13 | Verificado | Rollback total en evento/línea intermedia, refs, vínculo y después del handler final. | Triggers SQLite + fallo del harness | fase-4-core-inicial.txt; fase-4-flutter-test.txt |
| P14 | Verificado | Reintento tras commit con respuesta descartada y doble toque: una venta, captura editada intacta. | recuperar_cotizacion + widgets | fase-4-flutter-test.txt |
| P15 | Verificado | Continuar origen/recuperada usa Home/Caja existentes; edición/revisión/precio conservados. | quotation_navigation + core | fase-4-flutter-test.txt; fase-4-sqlite/restore-*.json |
| P16 | Verificado | Limpiar → Disponible; siguiente intención usa nuevos IDs y nuevo precio. | quotation_selection_v2 + recuperar | fase-4-core-inicial.txt; fase-4-flutter-test.txt |
| P17 | Verificado | Replay no duplica/resucita/retrocede vínculo ni pisa confirmada; persiste después de restore. | Handlers/recuperación/restore con historia | fase-4-flutter-test.txt; fase-4-sqlite/restore-*.json |
| P18 | Verificado | Origen/recuperación cobrados quedan Vendida incluso pending/conflict/rejected; recuperación rechazada. | guardar/recuperar/verification + navigation | fase-4-flutter-test.txt; fase-4-sqlite/saldos-*.json |
| P19 | Verificado | Tres estados × dos modos; reinicio real sin reset recurrente; venta editada conservada. | AppDatabase() en archivo temporal | fase-4-sqlite/backup-*.json/sqlite; restore-*.json/sqlite |
| P20 | Verificado | Schema 8 con cada columna y siete juntas: incompatible; reset total solo en copia no protegida. | Ruta real _resetDatabaseOnStartup | fase-4-sqlite/legacy-all-columns-protected-false.json/sqlite; fase-4-flutter-test.txt |
| P21 | Verificado | Restore real/segundo arranque: selección/estados/vínculos/eventos/refs idénticos; integridad/FK pasan. | Seis estados/origen + cuatro historias recuperadas | fase-4-sqlite/backup-* y restore-*; fase-4-auditoria-sqlite.json |
| P22 | Verificado | Respaldo antiguo versión 8 restaurado por servicio real: rechazo, hash/evento/marcador intactos. | Todas las columnas juntas + casos individuales | fase-4-sqlite/legacy-all-columns-protected-true.json/sqlite; fase-4-flutter-test.txt |
| P23 | Verificado | Standalone declara/valida refs sin filas; quotation/draft not_required; runtime no inicia monitor sync. | Recorder de comandos + gate runtime/DI/config | fase-4-sqlite/refs-standalone.json; fase-4-flutter-test.txt |
| P24 | Verificado | Server_sync persiste refs; quotation/draft no pendientes; confirmación elegible sin dependencia quotation. | Recorder + cobros + regresión store/push | fase-4-sqlite/refs-serverSync.json; saldos-serverSync-*.json; fase-4-flutter-test.txt |
| P25 | Verificado | Seis cobros; captura/recibo $294.01 frente a estimación $304.01; saldos/consumo correctos una vez. | Venta/recibo reales, replay, cuentas/inventario/caja | fase-4-sqlite/saldos-*.json; fase-4-auditoria-sqlite.json |
| P26 | Verificado | Dos generaciones $145.01/$315.01 en misma pantalla; fechas/leyendas/18 líneas inspeccionadas. | Rasterizador real + SQLite/widgets + QA visual | fase-4-png/; fase-4-png-manifiesto.json; fase-4-flutter-test.txt |
| P27 | Verificado con límites | Bytes por operación, cancelación/fallo/retry/dispose/doble toque; selector macOS abierto/cancelado/reabierto. Envío WhatsApp, móvil físico e iOS no ejecutados. | Widgets finales + selector/PNG nativo macOS; Android fase 3 vigente | fase-4-native-resultados.json; fase-4-native-*; fase-4-flutter-test.txt |
| P28 | Verificado | Sin modelo/aviso/helper/import/registro retirado; catálogo/venta/payload/recibo monetarios conservados. | rg, revisión de consumidores/DI y analyze; no limpieza adicional necesaria | fase-4-limpieza.txt; fase-4-campos-validos.txt; fase-4-dart-analyze.txt; fase-4-auditoria-sqlite.json |

P01–P26/P28 cumplen sus criterios locales. P27 cumple el alcance automatizable
y el selector nativo disponible; quedan sin ejecutar envío/recepción WhatsApp,
móvil físico Android/iOS y selector iOS. El build debug/release arm64 macOS pasó;
universal quedó pendiente por fallo de lipo del toolchain. Estas limitaciones
no se presentan como aprobadas ni borran las evidencias anteriores.

Detalle, comandos exactos, auditoría, saldos y límites:
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-4-verificacion-y-cierre|Evidencia de cierre fase 4]].
