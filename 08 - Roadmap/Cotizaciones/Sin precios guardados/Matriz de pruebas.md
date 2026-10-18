---
tipo: matriz_preparacion
estado: verificada_fase_4_con_limites_nativos
revision_plan: 3
actualizado: 2026-10-07
---

# Matriz de pruebas de revisión 3

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`. Se comprobaron los
archivos del árbol de trabajo, no solo HEAD. Los IDs Cxx describen la revisión 2;
conservar las protecciones independientes y reemplazar las expectativas monetarias
anteriores. El inventario siguiente conserva la preparación histórica de fase 1.
Sus tests se adaptaron en fases 2–3 y se reejecutaron en fase 4. La matriz resuelta
P01–P28 al final de Casos de aceptación registra el resultado vigente.

## Archivos y cambios concretos

| Archivo o grupo existente | Actualización necesaria |
|---|---|
| `test/support/quotation_harness.dart` | Quitar total esperado al cotizar; separar selección y snapshots de venta; seed de los catálogos JSON; inyectar fallo en línea k, refs y después del vínculo; conservar contents() de todas las tablas |
| `test/support/quotation_ui_fixtures.dart` | Quotation sin moneda/importes/consumo; fake de estimación actual completa/incompleta; retirar QuotationPriceChange |
| `test/application/sync/payloads/cotizacion_guardada_payload_test.dart` | Formato 2/lista cerrada, selección, nulls/rangos/orden/IDs/refs; roundtrip exacto; rechazar payload viejo y viejo con format_version=2, claves monetarias anidadas y extras; retirar tests de suma cotizada |
| `test/application/sync/payloads/cotizacion_recuperada_payload_test.dart` | Vínculo sin importes, mapa exacto, N/primer/último, IDs estables v4, fechas/revisión; rechazar formato viejo/extras; retirar suma/snapshot/catalog_unit_price_minor |
| `test/application/commands/cotizaciones/cotizacion_command_service_test.dart` | Guardar selección sin importes y mantener integridad de venta; quitar expectedTotalMinor; misma intención/origen vinculados/rollback/propiedad; cambiar C03 de total solicitado obsoleto a corrupción real de importes del borrador |
| `test/application/commands/cotizaciones/recuperar_cotizacion_test.dart` | Cambiar C20/precio conservado por vigente; denominador compatible ya se acepta; N eventos + vínculo/versiones/refs; catálogo actual, retries/ediciones/continuar/limpieza; otro borrador vacío; fallos en línea k y final |
| `test/application/sync/handlers/cotizacion_recuperada_event_handler_test.dart` | Preparar N eventos de venta antes del vínculo; handler verifica y solo vincula; no insertRecoveredDraft; comparar selecciones/eventos; replay histórico no resucita ni regresa vínculo; colisiones comprobadas antes del upsert de venta |
| `test/application/commands/cotizaciones/quotation_verification_test.dart` | Sustituir invariantes de moneda/total de cotización y precio histórico; auditar filas/payloads por agregado; conservar cobros por método, estados y ausencia de efectos; fuentes monetarias de venta actual |
| `test/core/di/quotation_dependencies_test.dart` | Mismos DB/puertos/transacción, handlers de borrador y vínculo; dominio nuevo/estimación; venta versión N; modos y not_required; ya no precio en Quotation |
| `test/data/local/drift/quotation_backup_test.dart` | Selección sin importes tras backup/reinicio; cambiar caso «falta consumption_configuration_key» porque ahora debe faltar; agregar esquema superconjunto antiguo versión 8 y protegido; JSON quotation limpio; mantener segundo arranque/marcador |
| `test/presentation/pages/cotizaciones/caja_quotation_test.dart` | Intención conserva IDs/fecha/revisión sin total; doble toque, error/retry y callbacks tardíos; confirmar venta sigue validando total propio |
| `test/presentation/pages/cotizaciones/quotations_screen_test.dart` | Estimación visible/actual, faltantes y total no disponible; reemplazar test «precio cambiado muestra aviso» por venta actual sin aviso histórico; mantener estados/filtros/carga/error/navegación |
| `test/presentation/pages/cotizaciones/quotation_ticket_test.dart` | Estimación/fecha cálculo/etiquetas, dos generaciones tras cambiar precio; no congelar PNG de siguientes operaciones; misma imagen durante share; conservar cancelación/fallo/retry/dispose/leyenda |
| `test/presentation/pages/cotizaciones/quotation_navigation_test.dart` | Reemplazar «editar catálogo conserva PNG emitido» por refresco de siguiente generación; menú/Caja única, origen limpio, continuar no repricing y Vendida al recibo |
| `test/application/commands/ventas/venta_borrador_command_service_test.dart` y payloads `producto_actualizado_borrador_payload_test.dart`, `producto_eliminado_borrador_payload_test.dart`, `venta_borrador_limpiada_payload_test.dart` | Regresión de cantidades absolutas, precios capturados al editar y wasCleared; no retirar campos de venta |
| `test/application/commands/ventas/venta_command_service_test.dart`, `test/presentation/pages/caja/cash_confirmation_test.dart`, `credit_payment_test.dart`, `transfer_payment_screen_test.dart`, `sale_receipt_test.dart` | Regresión de confirmar venta vigente una vez, inventario/caja/deuda/método y recibos; conservar expectedTotalMinor de confirmación |
| `test/data/local/drift/drift_local_event_store_test.dart`, `test/application/sync/sync_push_service_test.dart`, `sync_orchestrator_test.dart`, `test/application/config/app_config_test.dart` | Regresión de refs por modo, clasificación local de quotation/sale_draft y sync inactivo en standalone; venta confirmada sigue elegible |

Nuevas pruebas enfocadas en fase 2: valor de selección, algoritmos de identidad,
preparación desde catálogo/lectura de estimación y fallos de recuperación
multievento. Usar una clase principal por archivo y las carpetas de cada capa.
No crear un migrador ni tests que conviertan legado a precios cero.

## Asociación completa con aceptación

| Caso | Prueba primaria / evidencia que deberá obtenerse | Fase |
|---|---|---|
| P01 | guardada_payload + cotizacion_command_service; JSON fixture y filas con dos piezas/500 g | 2 |
| P02 | quotation_backup + quotation_verification; PRAGMA/DDL real con 7 columnas/CHECKs ausentes | 2/4 |
| P03 | ambos payload tests; legado real/versión falsa/extras recursivos rechazados; consulta events quotation | 2/4 |
| P04 | cotizacion_command_service; propietario/revisión/estado/vacío, contents antes/después | 2 |
| P05 | cotizacion_command_service; guardar retry/doble intención, selección original y colisión | 2 |
| P06 | recuperar_cotizacion; dos piezas pasan de $100 a $120; sale_draft por $240 | 2 |
| P07 | recuperar_cotizacion + preparador; catálogo inyectado $30/100 g, 500 g = $150 | 2 |
| P08 | recuperar_cotizacion + quotations_screen; modo/dimensión/código/símbolo/factor incompatibles | 2/3 |
| P09 | recuperador/estimación + quotations_screen/ticket; líneas conservadas, total null y error por línea | 2/3 |
| P10 | lector de estimación + quotation_verification + widgets; ningún evento ni selección cambia; nombres/consumo actuales en venta nueva | 2/3 |
| P11 | recuperar_cotizacion; otra captura llena y vacía, contents sin cambios | 2 |
| P12 | recuperar_cotizacion + handler + DI; mapa N=1 y N>1, cantidades absolutas, venta N, 13 refs para fixture N=2 | 2 |
| P13 | harness + recuperar_cotizacion + drift_local_event_store; fallos línea intermedia/refs/vínculo/final, rollback completo | 2 |
| P14 | recuperar_cotizacion + quotations_screen; doble toque/retry tras editar/cambiar catálogo, sin nuevos eventos | 2/3 |
| P15 | recuperador + quotation_navigation; continuar origen o recuperada con revisión actual/anterior acreditada | 2/3 |
| P16 | recuperar_cotizacion; segunda intención del mapa tras limpiar, nuevos IDs/precio vigente | 2 |
| P17 | handlers cotizacion y venta_borrador; replay antiguo tras limpieza/confirmación/vínculo posterior | 2 |
| P18 | quotation_verification + navigation; estado vendido con sync pending/conflict/rejected impide recuperar | 2/4 |
| P19 | quotation_backup + quotation_verification; archivo temporal, tres estados, segundo arranque conserva marcador/selección | 2/4 |
| P20 | quotation_backup; base antigua versión 8 con required+forbidden, reset completo solo copia temporal | 2/4 |
| P21 | quotation_backup; snapshot/restauración estructura nueva, contenido/estados/eventos sin precios quotation y otro reinicio | 2/4 |
| P22 | quotation_backup + backup_service/restore; respaldo antiguo protegido versión 8, rechazo y hashes/marcador intactos | 2/4 |
| P23 | quotation_verification + DI + config/sync_orchestrator; standalone not_required, refs validadas sin filas ni servicios sync | 2/4 |
| P24 | quotation_verification + DI + sync_push; refs locales en server_sync y confirmación elegible sin refs quotation remotas | 2/4 |
| P25 | quotation_verification + venta_command_service + cash/transfer/credit/receipt; cobro/inventario/saldos una vez | 4 |
| P26 | quotations_screen + quotation_ticket + navigation; precios/total actuales y PNG inspeccionado, cálculo/emisión separados | 3/4 |
| P27 | quotation_ticket + navigation; mismo PNG durante share, nueva estimación en próxima operación; cancelación/fallo/dispose | 3/4 |
| P28 | rg por contexto + analyze + suite y revisión DI; borrar modelos/helpers anteriores manteniendo precios de ventas/catálogo | 2/4 |

En todos los comandos comparar pagos, inventario/saldos, deuda y caja antes/después.
Las búsquedas globales de total/precio incluyen usos válidos en venta; limitar
ausencia de moneda/importes al documento y payloads `aggregate_type=quotation`.
P19–P22 requieren archivo y ruta real de detección, no solo NativeDatabase.memory.

## Baseline de fase 1

2026-10-06: **121 pruebas aprobadas**, exit 0, Flutter sin cambios funcionales.
Log: `Evidencia/fase-1-baseline-flutter-test.txt`. Comando reproducible:

```sh
flutter test --no-pub --reporter expanded \
  test/application/sync/payloads/cotizacion_guardada_payload_test.dart \
  test/application/sync/payloads/cotizacion_recuperada_payload_test.dart \
  test/application/sync/handlers/cotizacion_recuperada_event_handler_test.dart \
  test/application/commands/cotizaciones \
  test/core/di/quotation_dependencies_test.dart \
  test/data/local/drift/quotation_backup_test.dart \
  test/presentation/pages/cotizaciones
```

Harness principal usa memoria. DI/backup y casos de reinicio usan path_provider
mock a Directory.systemTemp; navegación usa memoria/archivo temporal. Se revisó
esta separación antes de ejecutar. No se abrió una base de uso. No hubo fallos
previos en esta selección. No se ejecutó la suite completa, analyze ni build_runner;
no se necesitan regeneración ni checks funcionales por edición de documentos.
Las 121 pruebas y sus PNG/expectativas siguen siendo baseline de revisión 2;
ningún Pxx está aprobado por este resultado. No reutilizar las 1254 del cierre viejo.

## Ejecución de fase 2 — 2026-10-06

Se adaptaron los tests afectados y se añadieron quotation_selection_v2_test,
mapas/contratos estrictos y casos de esquema superconjunto protegido/no protegido.
Los 11 JSON de fase 1 se copian intactos a test/fixtures/quotation_v2 para tests
portables. Fixture real verifica recuperación, estimación, ausencia de datos
monetarios quotation y rollback integral de events/refs/secuencias/proyecciones.

Suite completa final: 1292 aprobadas, 1 omitida por servidor aislado no configurado.
Build_runner/analyze/diff check pasan. Evidencia y límites por Pxx en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-2-core-y-esquema|Fase 2]].
P26/P27 y la parte reactiva/visual de P08/P09/P10 continúan en fase 3;
P25/cierre integral y auditoría final permanecen en fase 4.

## Ejecución final de fase 4 — 2026-10-07

Las asignaciones de preparación y registros anteriores son históricos.
Los tests se ejecutaron de nuevo sobre la versión final, con **1306 aprobados
y 1 omitido** (servidor aislado no disponible, ajeno a cotización local).
Resultado por cada P01–P28 en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Casos de aceptacion|Matriz resuelta]].
Comandos/datos y alcance nativo en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-4-verificacion-y-cierre|Cierre de fase 4]].

Ampliaciones concretas:

- quotation_verification_test: precio/costo cambiados antes de recuperación,
  segundo cambio antes de cobro, recibo del repositorio real, total $294.01
  frente a estimación $304.01; pagos/deuda/caja/inventario en ambos modos y
  confirmación elegible sin dependencia quotation.
- quotation_backup_test: exportación de seis archivos/estados + dos pruebas
  de las siete columnas antiguas juntas, incluida restauración real protegida
  y rechazo/hash íntegro. Ruta real AppDatabase(), schemaVersion 8.
- quotation_mode_verification_test nuevo: registra refs declaradas por los
  comandos antes del store, contratos inválidos rechazados sin escrituras,
  exactitud de filas en server_sync y ausencia en standalone.
- quotation_dependencies_test: start/stopConfiguredRuntimeServices con dobles;
  standalone no resuelve/inicia monitor sync y solo inicia respaldo.

No cambió producción/esquema/Drift generado. Se conservaron y reejecutaron
los tests de rollback/retry/replay/continuación y QA de PNG de fases 2–3.
No son nuevos tests ficticios de aceptación: logs finales contienen su ejecución.

P27 conserva pendientes WhatsApp real, QA móvil física e iOS. Build debug/release
arm64 de macOS pasó; universal quedó pendiente por comprobación conjunta de lipo.
