---
tipo: mapeo_implementacion
estado: auditado_cierre_fase_4
revision_plan: 3
actualizado: 2026-10-07
---

# Mapeo y limpieza de cotizaciones

Referencia: [[08 - Roadmap/Cotizaciones/Sin precios guardados/Plan de implementacion|Plan vigente]].
Las rutas de código de esta nota son relativas a
`/Users/benjamin/Projects/POS/pos_flutter`. Inspección inicial del 2026-10-06;
revalidar usos antes de cada eliminación.

## Columnas que se eliminan físicamente

| Tabla | Columna / getter Drift | Motivo |
|---|---|---|
| `quotations` | `currency` / `currency` | La selección no tiene moneda propia; la estimación obtiene MXN del contexto de venta |
| `quotations` | `total_minor` / `totalMinor` | Es un importe del documento anterior |
| `quotation_items` | `unit_price_minor` / `unitPriceMinor` | Precio guardado que se desea eliminar |
| `quotation_items` | `standard_cost_minor_snapshot` / `standardCostMinorSnapshot` | Costo de venta que no forma parte de la selección |
| `quotation_items` | `total_minor` / `totalMinor` | Importe derivado de un precio histórico |
| `quotation_items` | `price_reference_quantity_atomic_snapshot` / `priceReferenceQuantityAtomicSnapshot` | Denominador del precio medido; se toma del catálogo al calcular/recuperar |
| `quotation_items` | `consumption_configuration_key` / `consumptionConfigurationKey` | Configuración operativa que se resuelve al recuperar; guardar no compromete consumo |

Quitar CHECKs de precio/costo/total/moneda y las condiciones de referencia de
precio del CHECK de venta medida. Conservar validación de cantidades positivas,
rangos, modo y unidad. No dejar estos campos nullable, con default o sin uso.

## Datos que se conservan

- `quotations`: CommonFields; `user_id`, `device_id`, `issued_at_local`,
  `source_sale_id`, `source_draft_event_id`, `current_sale_id`.
- `quotation_items`: CommonFields; `quotation_id`, `variant_id`,
  `product_name_snapshot`, `variant_name_snapshot`, `sale_mode_snapshot`,
  `quantity`, `measured_quantity_atomic`, `sale_unit_code_snapshot`,
  `sale_unit_symbol_snapshot`, `sale_unit_atomic_factor_snapshot`, `sort_order`.
- Índices de listado, vínculo único de venta actual y orden único de líneas;
  FK de línea a cotización. Sin FK a un borrador que se elimina al limpiar.

`variant_id` conserva la identidad vendible real, incluyendo productos sencillos.
No crear otra copia de la tabla de productos ni reducir la selección a nombres.
Los metadatos heredados de CommonFields siguen siendo trazabilidad local.

## Contratos y archivos afectados

| Área / archivos | Cambio requerido |
|---|---|
| `domain/cotizaciones/quotation.dart`, `quotation_item.dart` | Retirar propiedades monetarias, costo y configuración operativa; conservar selección y estado |
| `application/sync/payloads/cotizacion_guardada_payload.dart`, `cotizacion_guardada_line.dart` | Formato 2 sin moneda/total; línea con snapshot propio sin precios; serializer/decoder explícitos |
| Nuevo valor tipado de selección en `application/sync/payloads` | Validar identidad, nombres, modo, cantidad y unidad sin depender de `SaleItemSnapshot` |
| `application/sync/projections/quotation_projection.dart`, `quotation_item_projection.dart` | Retirar moneda/total y sustituir el snapshot de venta por el de selección |
| `application/sync/projections/quotation_projection_store.dart` | Retirar `insertRecoveredDraft` cuando la recuperación ya use el puerto/eventos de venta; conservar guardado, consultas y vínculo |
| `application/sync/handlers/cotizacion_guardada_event_handler.dart`, `quotation_draft_validator.dart` | Comparación/idempotencia por selección y revisión; integridad del borrador separada de los datos guardados |
| `application/commands/cotizaciones/guardar_cotizacion_command.dart`, `cotizacion_command_service.dart` | Quitar `expectedTotalMinor`, copia de precios y comparación de total de cotización; seguir releyendo el origen bajo transacción |
| `application/sync/quotation_recovery_validator.dart` | Preparar snapshots de venta con precio/costo/referencia/consumo actuales; validar unidad/cantidad guardada |
| `application/sync/payloads/cotizacion_recuperada_payload.dart` | Formato 2 con identidades y vínculo; sin snapshots, total ni precio de catálogo |
| `application/sync/handlers/cotizacion_recuperada_event_handler.dart` | Verificar el borrador creado por eventos `sale_draft` y avanzar vínculo; eliminar creación monetaria de venta desde este handler |
| `application/commands/cotizaciones/recuperar_cotizacion_command.dart` | Identidades estables de la intención y generación determinista de los eventos/líneas auxiliares |
| `application/commands/cotizaciones/recuperar_cotizacion_result.dart` | Retirar `priceChanges`; conservar IDs, `continued`, `draftAvailable` |
| `data/local/drift/tables/quotations.dart`, `quotation_items.dart` | Eliminar las siete columnas de la tabla de arriba y sus CHECKs |
| `data/local/drift/daos/quotation_dao.dart`, `data/repositories/quotation_repository_impl.dart` | Quitar inserciones/lecturas/mapeos monetarios; observar estado con `sales`; estimación fuera del documento |
| `data/local/drift/app_database.dart`, `app_database.g.dart` | Predicado de esquema nuevo que rechaza columnas retiradas; versión 8; regenerar código, sin editar el generado a mano |
| `data/local/drift/drift_local_event_store.dart` | Mantener clasificación local de quotation y sale_draft; refs por modo y nada pendiente por defecto |
| `core/di/application_dependencies.dart`, `data_dependencies.dart` | Ajustar puertos, handlers y lectura de estimaciones; quitar registrations/imports sin uso |
| `presentation/pages/caja/caja_screen.dart` | No enviar/comparar `expectedTotalMinor` al cotizar; conservar revisión para limpiar el origen |
| `presentation/pages/cotizaciones/models/quotation_display.dart` | No leer importes de Quotation; usar estimación temporal con precios/total vigentes confirmados por el usuario |
| `presentation/pages/cotizaciones/quotations_screen.dart`, `quotation_detail_screen.dart` | Total actual estimado/disponibilidad; quitar aviso de precio cotizado; conservar filtros y navegación |
| `presentation/pages/cotizaciones/quotation_ticket_screen.dart` | Generación basada en estimación actual; invalidación de caché; bytes coherentes al compartir |
| `presentation/tickets/ticket_document.dart`, `ticket_image_generator.dart` | Mantener recibos/columnas monetarias; adaptar etiquetas de estimación y momento de cálculo de cotización |
| `test/support/quotation_harness.dart`, `quotation_ui_fixtures.dart` y tests de cotizaciones/DI/respaldo/navegación | Cambiar fixtures/expectativas de precio congelado por selección sin precio y venta con precio actual |

## Eliminación de código muerto

Eliminar tras redirigir sus consumidores:

1. `application/commands/cotizaciones/quotation_price_change.dart` y todo
   `QuotationPriceChange`, `quotedUnitPriceMinor`, `priceChanges`.
2. `application/sync/payloads/cotizacion_recuperada_line.dart` **si** su
   responsabilidad desaparece al usar eventos de borrador. El nuevo mapa de
   identidades puede tener un valor tipado propio, sin duplicar snapshots.
   Mover la generación estable de IDs a la responsabilidad que realmente la use.
3. `QuotationProjectionStore.insertRecoveredDraft`, el adaptador en
   `QuotationDao` y `SaleDao.insertRecoveredDraft` si la búsqueda confirma que
   no queda otro consumidor. No eliminar operaciones compartidas de venta.
4. Comparación cotizado/catálogo, avisos y helpers de sumas de cotización
   persistida, constructors/imports/constantes exclusivos de esos datos.
5. Pruebas que exigen precio histórico o rechazo por cambio de denominador:
   reemplazar sus expectativas por los casos nuevos, conservando las pruebas
   independientes de idempotencia, modos, unidad y venta.

No retirar `SaleItemSnapshot`, `SaleItemProjection.persistedTotalMinor`, precios
de variantes, costo estándar, importes de `sales/sale_items`, recibos de venta ni
los contratos NestJS de venta/pago. El validador del borrador puede seguir usando
sus importes reales. Las mismas palabras en el modelo de estimación o en la venta
son válidas; la auditoría de ausencia de precios debe limitarse a persistencia y
payloads de `quotation`.

## Detección de esquema y datos legados

Registrar dos listas explícitas: columnas conservadas requeridas y columnas
retiradas prohibidas. Una base antigua que sea superconjunto del esquema nuevo
no es compatible. Comprobar tablas, índices, rangos/cantidades y conservación
tras segundo arranque. No agregar una rutina que quite columnas pero deje
`events.payload` antiguos con precios.

En la política de reset actual, los eventos viejos se eliminan junto con toda
la base local antigua. Un respaldo protegido incompatible se rechaza y conserva.
No se introduce un decoder monetario de compatibilidad ni un convertidor de
historial sin un alcance posterior de preservación de datos.

## Búsquedas de cierre

En el repositorio Flutter, usar `rg` para localizar refs residuales de
`QuotationPriceChange`, `priceChanges`, `expectedTotalMinor`,
`catalog_unit_price_minor`, `quotedUnitPriceMinor`, `insertRecoveredDraft` y
`Se conserva el precio cotizado`. Revisar resultados por contexto: algunos
campos pueden tener usos válidos ajenos a la cotización.

Sobre una SQLite temporal del esquema nuevo:

```sql
PRAGMA table_info(quotations);
PRAGMA table_info(quotation_items);
SELECT event_type, payload
FROM events
WHERE aggregate_type = 'quotation';
```

Inspeccionar claves de payloads también dentro de listas/objetos: ausencia de
columnas no acredita ausencia de copias JSON. Verificar los eventos `sale_draft`
por separado para acreditar que el precio actual de la venta sí se capturó.

## Revalidación de fase 1 — 2026-10-06

HEAD Flutter `56ddbc49f7369b2598aabe3c67b03135b7c89b46`, rama main, coincide
con la planificación; se inspeccionó el árbol con cambios previos completos.
Las siete columnas/getters, contratos, proyecciones, mapeos y consumidores
anteriores siguen presentes. No se modificó ni eliminó código en esta fase.
El inventario anterior queda confirmado, con estas precisiones ejecutables:

| Hallazgo en el código real | Acción fijada para fase 2 |
|---|---|
| Guardar/retry y QuotationDraftValidator comparan expectedTotalMinor; Caja reconstruye intención también por total | Retirar parámetro de cotización en todos estos sitios; validar corrupción de importes leyendo sale.totalMinor. ConfirmarVentaCommand mantiene su total esperado |
| SaleItemSnapshot aparece en línea guardada/proyección; handlers comparan JSON monetario | Sustituir por QuotationSelectionSnapshot con clave selection y comparación de selección. Formato 2 estricto, sin copiar JSON de venta |
| Recuperación y Continuar prueban linked.createdEventId == quotation.lastEventId y leen vínculo desde createdEventId de venta | Leer vínculo en quotation.lastEventId y verificar el mapa de eventos/venta; ahora createdEventId es el primer sale_draft. Retry no impone N ni cantidades originales sobre una venta ya editada |
| Handler recuperado rechaza cualquier borrador y después insertRecoveredDraft crea sales/sale_items versión 1 | Verificar el propio borrador recién creado por N eventos (único permitido); versión N; solo actualizar vínculo, sin insertar venta ni releer precios |
| rg de insertRecoveredDraft encuentra solo puerto, handler y adaptadores QuotationDao/SaleDao, sin otros consumidores ni tests que lo llamen | Retirar los tres métodos y el uso del handler al completar la redirección; conservar saveSale/saveItem/atomic y demás operaciones compartidas |
| CotizacionRecuperadaLine combina IDs deterministas, precio de catálogo y snapshot | Reemplazar por CotizacionRecoveryLineIdentity sin importes; mover el algoritmo de IDs de venta a QuotationRecoveryIdentity y agregar derivación de eventos |
| DriftLocalEventStore implementa lote y transacción; QuotationDao/SaleDao.atomic usan la AppDatabase común en DI | Mantener transacción externa desde lectura/preparación hasta vínculo. No confiar en fallback secuencial con dobles como prueba de rollback |
| LocalEventRef y EventRefs admiten tipos de referencia de texto; store exige refs no vacías, sin validar por sí solo cada campo | Construir/validar refs tipadas en ambos modos; vínculo affects quotation y uses sale/event; no nuevo affects sale_item en vínculo |
| QuotationRecoveryValidator exige referencia antigua igual a catálogo y recompone JSON desde snapshot anterior | Construir SaleItemSnapshot desde campos explícitos del catálogo actual más cantidad/unidad guardadas; permitir denominador actual compatible |
| ProductoCommandService._validateSaleConfiguration exige referencia=factor, aunque dominio/cálculo/tabla admiten otra referencia positiva | P07 utiliza catálogo preparado directamente en test; no ampliar editor/contratos de artículos como parte de este corte |
| AppDatabase usa containsAll con columnas antiguas y conserva schemaVersion=8; backup falla antes del reset con marcador .pos_db_restored | Required conservadas + forbidden retiradas; probar superconjunto antiguo y protegido en archivos temporales. No convertir eventos viejos |
| QuotationDisplay usa moneda/total/precio persistidos; TicketScreen mantiene _display/_image con ??= | Conectar estimación en memoria en fase 2; fase 3 completa observación de catálogo, fechas/textos y siguiente generación PNG |

Las rutas/test fixtures que cambian y la asociación P01–P28 se detallan en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Matriz de pruebas|Matriz de pruebas]].
Contrato final, refs, reintentos, rollback y política estructural en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Contrato y fixtures|Contrato y fixtures]].
Evidencia de búsquedas: `Evidencia/fase-1-consumidores.txt`; los usos globales
incluyen totales válidos de confirmación/venta y no deben eliminarse por nombre.

## Resultado de fase 2 — 2026-10-06

Inventario anterior ejecutado: siete columnas/CHECKs retirados físicamente;
QuotationSelectionSnapshot y contratos formato 2 sin importes; recuperación por
N eventos de borrador + vínculo; dominio/DAO/repositorio/DI/UI adaptados y limpieza
de los dos archivos monetarios y tres métodos insertRecoveredDraft.
expectedTotalMinor se conserva únicamente donde corresponde a ventas/confirmación.

Lectura de estimación en memoria conectada. Las tareas de reactividad, textos y
caché indicadas para fase 3 permanecen pendientes y no se dieron por completas.
Archivos exactos respecto al árbol inicial en `Evidencia/fase-2-archivos.md`;
criterios, búsquedas y SQLite real en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-2-core-y-esquema|Evidencia fase 2]].

## Auditoría final de fase 4 — 2026-10-07

El inventario de eliminación está satisfecho. Esquema real de 11 copias actuales:
12/17 columnas exactas, siete columnas/CHECKs retirados sin campos equivalentes,
índices/FK conservados. Payloads quotation formato 2 y cada objeto anidado
tienen claves cerradas; no hay snapshots monetarios ni caché de estimación persistida.

rg sin QuotationPriceChange, priceChanges, quotedUnitPriceMinor,
insertRecoveredDraft ni aviso anterior. catalog_unit_price_minor solo aparece
en tests de rechazo/auditoría. expectedTotalMinor permanece en venta/confirmación;
ningún uso en comandos/presentación de cotización. Helpers actuales tienen
consumidores y registros DI se usan por comandos/handlers/lectura/UI.
Analyze sin incidencias; no se encontró otra eliminación necesaria.
Los precios/costos/total/referencia/consumo de venta y catálogo siguen presentes.

Producción y Drift generado mantienen los hashes iniciales; no hubo cambio
de esquema ni regeneración. Auditoría/exportaciones/comandos en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-4-verificacion-y-cierre|Evidencia de cierre]].
Las bases legadas protegidas conservan sus columnas/precios externos como
evidencia de rechazo; no se reescribieron ni limpiaron.
