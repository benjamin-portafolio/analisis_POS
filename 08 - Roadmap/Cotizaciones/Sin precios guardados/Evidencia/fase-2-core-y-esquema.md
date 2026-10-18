---
tipo: evidencia_implementacion
estado: fase_2_completada
revision_plan: 3
fecha: 2026-10-06
---

# Fase 2: core y esquema, revisión 3

Entrega local completada en `/Users/benjamin/Projects/POS/pos_flutter`.
Se ejecutó únicamente fase 2. La fase 3 y el cierre integral de fase 4 continúan
pendientes. No se abrió ni reinició una base de uso.

## Revalidación y preservación

Flutter mantiene rama main y HEAD `56ddbc49f7369b2598aabe3c67b03135b7c89b46`.
El árbol inicial tenía cotizaciones sin commit y otros cambios anteriores;
se trabajó sobre ese contenido. Comparación SHA-256 de 806 archivos iniciales:
761 intactos, 43 modificados, 2 eliminados y 21 nuevos (incluidos 11 JSON copiados
sin alteración de la fase 1). No checkout, restore, stash ni commit.
Los cambios anteriores en recibos, menú, inicio, inventario y sync se conservaron.
Los archivos compartidos de esquema, DI y Caja conservan el trabajo previo y
reciben las adaptaciones de este corte.

NestJS fue revalidado de lectura: HEAD
`e451d1b4d9b9a4182aa41d3e8a525bf60c465c3e`, limpio; búsqueda quotation/cotizacion
sin resultados en src/test. No se modificó backend ni se añadió sincronización.
Análisis: cambios de esta sesión limitados a la carpeta Sin precios guardados;
se registran por hash para distinguirlos de los cambios anteriores del vault.
`.obsidian/workspace.json` cambió de hash fuera de las ediciones de este trabajo,
como en fase 1; se conserva su contenido actual sin restaurarlo. La variación
queda registrada en `fase-2-analisis-preservacion.json`.

Registros: `fase-2-arboles-iniciales.json`, estados inicial/final, inventario
`fase-2-archivos.md` / `fase-2-archivos.json` y `fase-2-preservacion.json`.

## Implementación y contrato efectivo

- `QuotationSelectionSnapshot` copia campos explícitos de producto/cantidad/unidad.
  Dominio, DTOs, DAO y repositorio no tienen moneda, precio, costo, total,
  denominador de precio ni consumo persistidos de quotation.
- Guardado/vínculo usan format_version entero 2, claves cerradas y nulls explícitos.
  Se rechaza formato anterior, anterior etiquetado 2, campos desconocidos y copias
  monetarias anidadas. Los serializers no propagan JSON de venta.
- `GuardarCotizacionCommand.expectedTotalMinor` eliminado de command, servicio,
  Caja y tests. Se conserva expectedDraftEventId. La validación interna sigue
  cotejando líneas/importe persistido del borrador con sale.totalMinor.
  `ConfirmarVentaCommand.expectedTotalMinor` se conserva.
- Recuperación resuelve variante/producto/unidad activos, modo y dimensión,
  código/símbolo/factor de unidad compatibles. Copia cantidades guardadas y captura
  nombres, precio, costo nullable, denominador y consumo actuales del catálogo.
  Acepta denominador compatible cambiado y usa redondeo half-up y BigInt de ventas.
- Transacción exterior QuotationDao.atomic sobre la misma AppDatabase de DAOs/store:
  lectura/revalidación/preparación completa, N eventos producto_agregado_borrador
  y vínculo cotizacion_recuperada. Los eventos de línea tienen bases 0..N-1;
  venta versión N, created = primer evento, last = último; líneas versión 1.
  El vínculo sólo valida los eventos/proyecciones ya creados y avanza quotation.
- IDs v5 de selección y v4 deterministas de líneas/eventos coinciden con ambas
  intenciones de fase 1. Se comprueban colisiones globales de línea y evento antes
  de upsert del handler normal. Navegación ocurre después del commit.
- Retry/Continuar resuelven vínculo desde quotation.lastEventId. Conservan
  captura/editados/precios incluso con catálogo retirado. Retry histórico limpio
  o sustituido devuelve draftAvailable=false. Replay no resucita ni retrocede
  vínculos; confirmado permanece Vendida con sync pending/conflict/rejected.
- Fallos inyectados en evento intermedio, línea intermedia, refs de línea, evento
  de vínculo, refs de vínculo, update del vínculo y después del handler final
  revierten contenido de todas las tablas, eventos/refs/secuencias y metadatos.
  Otro borrador, incluido vacío, sigue bloqueando la creación.
- Refs declaradas y validadas en ambos modos. Sale_draft afecta sale/sale_item y
  usa product/variant/unit; vínculo afecta quotation y usa sale/event. Standalone
  no persiste refs. Server_sync las persiste; quotation y borrador not_required.
- Estimación en memoria desde una transacción de lectura del catálogo SQLite;
  `QuotationEstimate`/`QuotationLineEstimate` separados del documento. Listado,
  detalle y ticket la consumen. Línea no disponible conserva selección/incidencia;
  importe/precio y total completo no disponibles, sin ceros ni suma parcial.
  Reabrir consulta/ticket relee precio vigente sin eventos ni cambios de selección.

Eliminados `quotation_price_change.dart` y `cotizacion_recuperada_line.dart`;
retirados modelos/avisos/métodos insertRecoveredDraft y sus imports/consumidores.
Los precios/costos/importes de catálogo, sales/sale_items, venta_confirmada y
recibos de ventas siguen presentes y pasan sus regresiones.

## Esquema y respaldos

SchemaVersion **8**, sin migración nueva ni cambio de onUpgrade. El bloque
histórico de migraciones de otros módulos preexistente en HEAD se conserva;
este corte utiliza exclusivamente `_resetDatabaseOnStartup` y onCreate.
No se editó a mano app_database.g.dart; se regeneró con build_runner.

Retiradas físicamente siete columnas y sus CHECKs:
quotations.currency/total_minor;
quotation_items.unit_price_minor/standard_cost_minor_snapshot/total_minor/
price_reference_quantity_atomic_snapshot/consumption_configuration_key.
Required conservadas + forbidden retiradas; 12 columnas finales de quotation
y 17 de quotation_items, incluidos CommonFields. Índices/FK/constraints de
cantidades y unidades se conservan. No hay una copia monetaria nueva equivalente.

Cada columna prohibida se probó agregada a un esquema nuevo en archivos temporales,
con schema 8 y marcador/evento legado: copia no protegida reinicia toda la base,
elimina el evento antiguo y conserva un marcador nuevo en segundo arranque.
Con .pos_db_restored se rechaza explícitamente y el hash/marcador se mantienen.
Backup/restauración/reinicio de selección y los tres estados pasan en ambos modos.
No se modificaron respaldos/PNG ni evidencias históricas externos.

## Comandos y evidencia

| Comando | Resultado |
|---|---|
| dart run build_runner build | Exit 0, esquema regenerado; fase-2-build-runner.txt |
| dart analyze | Exit 0, No issues found; fase-2-dart-analyze.txt |
| flutter test --reporter expanded | Exit 0, **1292 aprobadas, 1 omitida**; fase-2-flutter-test.txt |
| git diff --check (Flutter) | Exit 0, salida vacía; fase-2-git-diff-check.txt |
| Python Fixtures/validar_fixtures.py | Exit 0, 11 JSON intactos/verificados; texto histórico de fase 1 no acredita ni invalida este corte |
| Dart temporal con QuotationRecoveryIdentity real | Exit 0, ambas intenciones/4 líneas/4 eventos coinciden; fase-2-identidades-dart.txt |
| Auditoría rg en lib/test Dart | Sin QuotationPriceChange, priceChanges, quotedUnitPriceMinor, insertRecoveredDraft ni aviso anterior. expectedTotalMinor permanece sólo en confirmación/ventas |

La única prueba omitida es test/integration/variant_tracking_server_test.dart:
requiere POS_PHASE3_SYNC_URL y un Nest/PostgreSQL aislado. Es ajena a esta fase
local; no se levantó ni utilizó servidor.

Primera suite completa: 10 fallos propios durante ajustes, conservados en
fase-2-flutter-test-primera-ejecucion.txt. Nueve se debían a comparar DateTime UTC
con el mismo instante local leído por Drift en retry de guardado. Se corrigió a
milisegundos; 41 pruebas guardado/backup pasaron en fase-2-correccion-reintento.txt.
El restante era una expectativa de botón aún fuera del viewport en el widget de
estimación incompleta; se desplazó el test y pasaron 14 en
fase-2-correccion-widget.txt. La suite final posterior pasó completa; no se
atribuyeron estas regresiones a fallos previos.

Evidencia real de SQLite exportada por las pruebas:
`fase-2-sqlite-standalone.json` y `fase-2-sqlite-serverSync.json` contienen PRAGMA,
DDL, todos los payloads quotation del fixture y snapshots de venta efectivos.
Dos piezas a $120 = $240; 500 g a $30/100 g = $150; total venta **$390**.
N=2, created/last correctos, 3 eventos nuevos, **0 / 13 refs** según modo.
La estimación lee ese total sin escribir; quotation conserva Pan/Café medido y
la venta captura nombres/costos/referencia/consumo actuales.

## Criterios y continuidad

Evidencia de fase 2 para P01–P07, P10–P18, P20/P22–P24 y auditoría core P28.
P08/P09 cubiertos en core y widget de disponibilidad; P19/P21 en archivos y
respaldos temporales. Cobro cash/transfer/credit y recibos continúan pasando como
regresión; P25 y cierre integral mantienen QA de fase 4.

Pendientes concretos de fase 3 (no ejecutada): observar catálogo/productos,
variantes y unidades para recalcular en pantalla abierta; completar textos
Precios vigentes al generar, fecha de cálculo y aviso de recálculo en Caja;
invalidación de _display/_image cuando cambian condiciones; bytes estables durante
cada share y nueva generación posterior; P26/P27 con dos generaciones e inspección
visual de PNG/selector disponible. Ticket conserva el caché de la generación
abierta; reabrir ya calcula actual. No usar esta evidencia para declarar reactividad
completa o equivalencia visual nueva.

Pendientes de fase 4: auditoría y ejecución final P01–P28 después de fase 3,
QA física/native disponible y sus límites. No queda tarea core/esquema de fase 2
pendiente; no se arrancó la app contra una base de uso.
