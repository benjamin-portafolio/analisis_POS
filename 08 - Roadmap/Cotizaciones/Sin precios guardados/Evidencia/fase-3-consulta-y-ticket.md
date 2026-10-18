---
tipo: evidencia_implementacion
estado: fase_3_completada
revision_plan: 3
fecha: 2026-10-06
---

# Fase 3: consulta y ticket, revisión 3

Entrega completada en `/Users/benjamin/Projects/POS/pos_flutter`. Se ejecutó
únicamente Consulta y ticket, consumiendo el core, fixtures y evidencia de fase 2.
Fase 4 permanece pendiente. No se cambió esquema, comandos, contratos, DI,
NestJS ni configuración de sincronización; no se abrió una base de uso.

## Implementación

QuotationDao usa una señal de lectura Drift dependiente de quotations,
quotation_items, sales, products, product_variants, units y recipe_components.
Cada actualización vuelve a leer el documento y recalcula su estimación en
memoria, mediante la transacción de lectura de fase 2. No agrega joins de recetas
que dupliquen líneas, columnas, tablas, campos monetarios ni eventos.

Listado, detalle y ticket conservan selección/nombres guardados, estados,
filtros, menú y navegación. Precio y total proceden del catálogo SQLite local;
los artículos retirados o incompatibles conservan su línea y explican la
incidencia. Con una línea no calculable aparece **Total no disponible**; nunca
se sustituye el precio faltante por cero ni se usa la suma parcial como total.
Los límites y redondeo de ventas del core permanecen vigentes.

QuotationDisplay distingue Fecha de creación y Cálculo (hora con segundos).
Ticket incluye Total estimado actual, Precios vigentes al generar y El precio
se recalcula al recuperar en Caja. Conserva No representa un pago ni reserva
existencias, columnas monetarias y cantidades separadas por unidad. El dibujo
común recibe dateLabel con default Fecha, manteniendo recibos existentes.

La pantalla invalida `_display` y `_image` por la identidad efectiva del documento
/estimación. FutureBuilder no muestra datos o errores anteriores mientras carga
la nueva lectura/imagen. Cada operación de compartir copia los bytes de su PNG
completo, de manera que el catálogo puede refrescar el preview mientras el
selector está abierto sin alterar el archivo de esa operación. La siguiente
operación usa la generación nueva. El cierre/error del selector no elimina ni
confirma una cotización; callbacks tardíos no actualizan una pantalla disposed
ni presentan SnackBar sobre otra ruta.

Reintentar estimación ahora usa un callback síncrono de setState: la asignación
anterior devolvía Future y fallaba al pulsar. Se cubren también error/retry de
imagen/selector, doble pulsación y rasterizados/estimaciones obsoletos. Nueva
captura sigue usando expectedDraftEventId del origen y la limpieza existente.

P15 conserva el único Home y Caja. Después de editar la cantidad y cambiar el
catálogo, Continuar venta mantiene saleId, lastEventId, cantidad y precio del
borrador, sin copiar líneas ni crear eventos. Se compara el contenido de todas
las tablas, no solamente el conteo de events.

## Pruebas y comandos

| Comprobación | Resultado nuevo | Evidencia |
|---|---|---|
| dart analyze | Exit 0, No issues found | fase-3-dart-analyze.txt |
| flutter test --reporter expanded | Exit 0, **1300 aprobadas, 1 omitida** | fase-3-flutter-test.txt |
| flutter test test/presentation/pages/cotizaciones test/data/repositories/quotation_estimation_test.dart --reporter expanded | Exit 0, **43 aprobadas** | fase-3-dirigidas.txt |
| POS_QUOTATION_PNG_DIR=… flutter test quotation_ticket_test.dart quotation_navigation_test.dart --reporter expanded | Exit 0, **19 aprobadas** y 8 PNG exportados | fase-3-png-test.txt |
| git diff --check, Flutter y análisis | Exit 0, sin incidencias | fase-3-git-diff-check.txt / fase-3-analisis-diff-check.txt |
| rg de QuotationPriceChange/quotedUnitPriceMinor/priceChanges/insertRecoveredDraft/aviso de precio cotizado en lib/test Dart | Sin coincidencias (exit 1 esperado de rg); imports/helpers actuales validados por analyze | fase-3-limpieza.txt |

La única prueba omitida es variant_tracking_server_test.dart, que requiere
POS_PHASE3_SYNC_URL y Nest/PostgreSQL aislados. No se usó un servidor. Los tests
usan SQLite en memoria y los archivos temporales controlados de pruebas ya
existentes; ejecutar la suite de regresión no implica ejecutar el cierre de fase 4.

Pruebas nuevas/revisadas:

- [quotation_estimation_test.dart](/Users/benjamin/Projects/POS/pos_flutter/test/data/repositories/quotation_estimation_test.dart): cambios de precio/costo, nombre, receta y unidad notifican en ambos modos. Cada estimate conserva el contenido completo de todas las tablas. Un writer solicitado entre las dos líneas espera al término de la transacción; ambas líneas usan el catálogo anterior y el siguiente cálculo usa el nuevo.
- [quotation_navigation_test.dart](/Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/cotizaciones/quotation_navigation_test.dart): listado/detalle abiertos reactivos, productos/variantes/unidad inactivos con selección visible; mismo Home/Caja al continuar con edición/precio capturado; dos PNG en una misma pantalla con share en curso y comparación de todas las tablas antes/después.
- [quotation_ticket_test.dart](/Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/cotizaciones/quotation_ticket_test.dart): fechas/textos/columnas, PNG completo con 18 IDs distintos, indisponibilidad, error/retry de estimación, estimación/rasterizado anterior tardío, fallo tras dispose, cancelación/fallo/doble pulsación de share y limpieza protegida.
- [quotations_screen_test.dart](/Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/cotizaciones/quotations_screen_test.dart): regresiones de filtros, estados, errores, reintentos y navegación; desplazamiento actualizado para botones después de los nuevos textos.

Primeras ejecuciones dirigidas se conservaron. Se corrigieron la clave de finder
ambigua introducida para el builder, expectativas de botones fuera de la caché
del viewport después de añadir los textos, y errores de instrumentación nueva
(import de isNull, cascadas de closures y finder de Tooltip). Dos intentos se
interrumpieron porque cambios de catálogo sucesivos del harness en runAsync se
cruzaban con la transacción iniciada en el reloj simulado de widgets; agrupar los
cambios de prueba en una transacción resolvió el bloqueo. El fallo del callback
de reintento sí estaba en el código de fase 2 y ahora tiene cobertura. Estos
resultados intermedios no se presentan como aceptación: logs finales posteriores
pasan. No se observaron fallos restantes en la suite final.

## Evidencia visual inspeccionada

PNGs generados por el rasterizador real de Flutter, ancho 880 px. En los tests de
exportación se carga Arial del sistema como familia Roboto para evitar la fuente
Ahem de flutter_test; el PNG nativo Android adicional usa la fuente del runtime.
Se inspeccionaron los documentos cortos completos y las secciones inicial,
intermedia y final de los largos: sin truncar nombres, cantidades, última fila,
totales o leyendas. El manifiesto guarda tamaño y SHA-256 de cada PNG.

| PNG en fase-3-png/ | Tamaño | Inspección |
|---|---|---|
| cotizacion-quotation-1.png | 880 × 1352 | Piezas, kg/L, nombre/variante largos, precios/referencia y total $245.00 |
| cotizacion-muchas-lineas.png | 880 × 4152 | 18 líneas con IDs distintos y numeración; fila 18 completa, total $1470.00 y leyenda visibles |
| cotizacion-no-disponible.png | 880 × 1432 | Café y cantidad visibles, incidencia y columnas no disponibles; total general no disponible aunque las otras líneas tengan importes |
| cotizacion-precio-antes.png | 880 × 1032 | Dos piezas a $35 = $70; medido $75.01; total $145.01 |
| cotizacion-precio-despues.png | 880 × 1032 | Misma pantalla/selección, dos piezas a $120 = $240; medido $75.01; total $315.01 |
| recibo-cash.png | 880 × 4466 | 18 líneas, subtotal/total $1470, recibido $1570 y cambio $100 |
| recibo-transfer.png | 880 × 4436 | SPEI-2026, cantidades por unidad, total y transferencia recibida $1470 |
| recibo-credit.png | 880 × 4436 | Cliente largo, cantidades por unidad, total y cargo a la cuenta $1470 |

Las dos generaciones exportadas corresponden al test con repositorio/SQLite real:
la primera solicitud de share sigue conteniendo exactamente los bytes del primer
PNG mientras aparece el segundo; una nueva solicitud usa exactamente el segundo.
Ninguna consulta/generación/share alteró cotización, venta, eventos, refs, caja,
inventario, pagos, saldos o deudas. La única mutación entre generaciones fue el
cambio de catálogo explícito del fixture.

[Antes](<fase-3-png/cotizacion-precio-antes.png>) ·
[Después](<fase-3-png/cotizacion-precio-despues.png>) ·
[Indisponible](<fase-3-png/cotizacion-no-disponible.png>) ·
[18 líneas](<fase-3-png/cotizacion-muchas-lineas.png>)

## Selector nativo Android y límite de WhatsApp

flutter devices inicialmente encontró solo macOS y Chrome. flutter emulators
mostró MotoG; se arrancó ese AVD arm64 con -read-only -no-window -no-audio
-no-snapshot-load -no-snapshot-save. Se compiló/ejecutó la entrada temporal
`tool/quotation_ticket_native_probe.dart` con la pantalla real y un repositorio
fixture en memoria. Esta entrada no inicializa DI, SQLite, sync o comandos y
no abre la base de la app. Su copia está en fase-3-native-probe.dart.txt; fue
eliminada del repositorio al terminar. flutter run terminó y el emulador se cerró.

Desde Compartir y desde WhatsApp abrió el selector **com.android.intentresolver**
con una vista previa de la imagen. Se pulsó Atrás para cancelar sin elegir ningún
destino. Ambos botones quedaron habilitados y el ticket permaneció visible; se
comprobó con los XML de UI, además de capturas. El archivo real servido por
share_plus se extrajo de cache/share_plus/cotizacion-quotation-1.png: PNG completo
inspeccionado en fase-3-native-shared.png.

**Límite exacto:** com.whatsapp no está instalado en MotoG (pm list packages
com.whatsapp devuelve vacío). No hay dispositivo físico Android/iOS conectado.
No se probó envío/recepción real a WhatsApp, selección de un destinatario, ni
selector iOS. Los ShareResult de widgets son simulados y solo acreditan
serialización/concurrencia/callbacks; la apertura y cancelación descritas en
Android sí fueron nativas. No se enviaron mensajes a terceros.

Evidencia: fase-3-native-resultados.json; fase-3-native-selector.png/XML,
fase-3-native-whatsapp.png/XML, fase-3-native-cancel.png/XML,
fase-3-native-whatsapp-cancel.xml, fase-3-native-ticket.png y PNG compartido.

## Preservación y continuidad

Flutter: HEAD inicial/final 56ddbc49f7369b2598aabe3c67b03135b7c89b46, rama main;
825 archivos iniciales, 14 modificados, 811 intactos, 1 nuevo y ninguno eliminado.
Inventario en [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-archivos|Archivos fase 3]].
Los cambios previos se conservaron; esquema/archivo generado, core/contratos,
commands, DI, Caja, recibos, menú y sync mantienen sus hashes iniciales. La
actualización del dibujo común solo incorpora dateLabel con default anterior.
No se modificó NestJS ni se abrió/actualizó una base de uso.

Análisis: se actualizaron Estado y continuidad, Casos de aceptación y Sesiones/03;
se añadieron esta evidencia, inventario, logs, capturas/XML/PNG y registros de
preservación. Otras notas/evidencias previas intactas. `.obsidian/workspace.json`
cambió fuera de estas ediciones y se conserva sin restaurarlo, con su diferencia
registrada en fase-3-preservacion.json. No se hizo checkout/restore/stash/commit.

P09/P10/P15/P26 y P27 en el alcance automatizable/nativo Android descrito cumplen
la salida de fase 3. P27 mantiene la entrega real/QA física/iOS pendiente. P25
conserva recibos y regresiones; P28 limpieza de esta fase pasa. Auditoría/matriz
integral y verificación de cobro/modos/reinicio/respaldo sobre el producto final
pertenecen a fase 4, que no se ejecutó. No quedan tareas de implementación de
Consulta y ticket ni decisiones pendientes de producto.
