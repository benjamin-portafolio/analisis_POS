---
tipo: contrato_implementacion
estado: implementado_y_verificado_fase_4
revision_plan: 3
actualizado: 2026-10-07
---

# Contrato y fixtures: selección sin precios

Contrato preparado en fase 1, implementado en fase 2 y revalidado en fase 4.
El árbol Flutter usa selección y vínculo formato 2 sin importes; se conserva
la especificación de preparación siguiente como referencia del contrato. Referencias:
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Plan de implementacion|Plan revisión 3]],
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Mapeo y limpieza|Inventario revalidado]],
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Matriz de pruebas|Pruebas P01–P28]].

## Base y decisión vigente

Revalidación del árbol real `/Users/benjamin/Projects/POS/pos_flutter`, rama
`main`, HEAD `56ddbc49f7369b2598aabe3c67b03135b7c89b46`. Cotizaciones existe en
archivos modificados y sin seguimiento; HEAD aislado no representa esta base.
Se leyeron ambos AGENTS, `docs/architecture/offline_feature_flow.md`,
`docs/templates/new_offline_feature_checklist.md` y el patrón offline del análisis.

Se guardan productos, cantidades y unidades, sin precios, costos, importes,
moneda ni configuración de consumo de la cotización. Se muestran precios y
total vigentes al consultar/compartir, calculados en memoria con el catálogo
local. Recuperar captura condiciones vigentes de **venta**. Continuar una
venta existente conserva sus precios y ediciones. No requiere red en ningún modo.

## Documento y tablas finales

`Quotation` conserva identidad, propietario, fecha de emisión, origen, revisión
origen, vínculo actual, estado derivado de `sales` y líneas. `QuotationItem`
conserva identidad, orden, variante, nombres descriptivos, modo y cantidad/unidad.
El estado Disponible/En venta/Vendida sigue derivándose de la venta vinculada;
limpiar elimina la venta, no la selección ni el vínculo histórico.

| Tabla | Columnas requeridas finales |
|---|---|
| Ambas | `id`, `active`, `version`, `created_event_id`, `last_event_id`, `last_server_sequence` de CommonFields |
| `quotations` | `user_id`, `device_id`, `issued_at_local`, `source_sale_id`, `source_draft_event_id`, `current_sale_id` |
| `quotation_items` | `quotation_id`, `variant_id`, `product_name_snapshot`, `variant_name_snapshot`, `sale_mode_snapshot`, `quantity`, `measured_quantity_atomic`, `sale_unit_code_snapshot`, `sale_unit_symbol_snapshot`, `sale_unit_atomic_factor_snapshot`, `sort_order` |

Se eliminan físicamente `quotations.currency/total_minor` y
`quotation_items.unit_price_minor/standard_cost_minor_snapshot/total_minor/price_reference_quantity_atomic_snapshot/consumption_configuration_key`.
Retirar sus CHECKs y las condiciones del denominador en el CHECK medido.
Conservar cantidades/rangos/modo/unidad, FK de línea a cotización, índices
`ix_quotations_listing`, `ux_quotations_current_sale`, `ux_quotation_items_order`.
No agregar FK a catálogo ni venta borrable. `source_sale_item_id` es trazabilidad
del evento de guardado; no introduce otra columna en `quotation_items`.

## Valor tipado de selección

Crear `QuotationSelectionSnapshot` en
`application/sync/payloads/quotation_selection_snapshot.dart`, independiente
de `SaleItemSnapshot`. `CotizacionGuardadaLine.selection` y
`QuotationItemProjection.selection` lo utilizan; dominio conserva datos propios
sin importar application/data. Conversión explícita desde la línea del borrador,
copiando exclusivamente los campos de esta lista, sin spread de su JSON de venta.

| Clave JSON de `selection` | Regla |
|---|---|
| `variant_id` | Identidad vendible requerida; texto no vacío |
| `product_name_snapshot` | Nombre al guardar, trim, requerido |
| `variant_name_snapshot` | Texto opcional; vacío normalizado a null |
| `sale_mode_snapshot` | Exactamente `unit` o `measured` |
| `quantity` | Entero positivo en unit; null en measured |
| `measured_quantity_atomic` | Entero positivo en measured; null en unit |
| `sale_unit_code_snapshot` | Código estable requerido en measured; null en unit |
| `sale_unit_symbol_snapshot` | Símbolo requerido en measured; null en unit |
| `sale_unit_atomic_factor_snapshot` | Entero positivo en measured; null en unit |

Todos los campos aparecen en el JSON canónico, incluidos los nulls. No usar
strings numéricos, doubles ni booleans como enteros. Rango entero seguro
`1..9007199254740991`; orden admite cero. Fechas positivas, dentro del mismo
límite, milisegundos múltiplos de 1000, iguales a `created_at_local` del sobre.
Recortar IDs/textos como los comandos actuales; no regenerar un ID recibido.

La dimensión se interpreta por el catálogo estable existente: g/kg = mass,
ml/l = volume. No se guarda denominador de precio para inferir dimensión.
Al recuperar se comprueba modo, unidad activa, código, símbolo, dimensión y
factor; no convertir silenciosamente kg a g ni reinterpretar masa como volumen.
Cambiar precio, costo, nombre o consumo no altera la selección. La venta nueva
usa nombres y condiciones actuales del catálogo, además de las cantidades
guardadas; el documento mantiene sus nombres originales.

## Comandos y sobre de eventos

`GuardarCotizacionCommand`: `saleId`, `expectedDraftEventId`, `quotationId`,
`eventId`, `issuedAtLocal`. Se retira `expectedTotalMinor` de comando, servicio,
Caja y pruebas de cotización. `QuotationDraftValidator` relee bajo transacción
la venta y compara suma de sus líneas/persistedTotalMinor con **sale.totalMinor**,
sin transportar ese importe al evento/documento. Se conserva
`ConfirmarVentaCommand.expectedTotalMinor` y su validación de venta.

`RecuperarCotizacionCommand` mantiene `quotationId`, `expectedQuotationEventId`,
`saleId`, `eventId`, `recoveredAtLocal`. `eventId` identifica el vínculo final.
Se crea una intención una sola vez y se conserva completa al reintentar,
incluido tras reinicio. `saleId` y `eventId` nuevos son UUID v4; las líneas de
venta derivadas también v4 para compatibilidad con la confirmación existente.
No necesita precio ni copia de selección en el comando.

El sobre común sigue siendo `SyncEvent` con payload mapa, identidad, propietario,
`base_version`, fecha, `application_status = applied` y
`delivery_status = not_required`. `server_sequence`, `base_server_sequence` y
`created_at_server` son null. `local_sequence` lo asigna la persistencia;
no deriva de la posición de línea. `format_version = 2` pertenece al payload
quotation y no sustituye las versiones de agregado. El contrato sale_draft
existente conserva su formato, sin agregarle `format_version`.

## Guardado formato 2

`aggregate_type = quotation`, `event_type = cotizacion_guardada`,
`aggregate_id = quotationId`, `base_version = 0`.

Claves exactas: `format_version`, `source_sale_id`, `source_draft_event_id`,
`issued_at_ms`, `lines`. Cada línea contiene solamente `id`,
`source_sale_item_id`, `sort_order`, `selection`. La lista es no vacía, ordenada
por sort_order; IDs de origen, IDs propios y órdenes son únicos. Conservar
órdenes originales aunque tengan huecos. IDs propios separados de cotización,
venta y líneas origen. Verificar `CotizacionGuardadaLine.idFor` para cada línea.

JSON canónico completo de guardado:

```json
{
  "format_version": 2,
  "source_sale_id": "20000000-0000-4000-8000-000000000003",
  "source_draft_event_id": "20000000-0000-4000-8000-000000000004",
  "issued_at_ms": 1791309600000,
  "lines": [
    {
      "id": "c847d35e-1c6e-5a7f-9ceb-30bf1959157f",
      "source_sale_item_id": "20000000-0000-4000-8000-000000000005",
      "sort_order": 0,
      "selection": {
        "variant_id": "20000000-0000-4000-8000-000000000009",
        "product_name_snapshot": "Pan",
        "variant_name_snapshot": "Original",
        "sale_mode_snapshot": "unit",
        "quantity": 2,
        "measured_quantity_atomic": null,
        "sale_unit_code_snapshot": null,
        "sale_unit_symbol_snapshot": null,
        "sale_unit_atomic_factor_snapshot": null
      }
    },
    {
      "id": "572a2152-8675-5107-a812-ee5d562701b7",
      "source_sale_item_id": "20000000-0000-4000-8000-000000000006",
      "sort_order": 1,
      "selection": {
        "variant_id": "20000000-0000-4000-8000-000000000010",
        "product_name_snapshot": "Café medido",
        "variant_name_snapshot": "Original",
        "sale_mode_snapshot": "measured",
        "quantity": null,
        "measured_quantity_atomic": 500,
        "sale_unit_code_snapshot": "g",
        "sale_unit_symbol_snapshot": "g",
        "sale_unit_atomic_factor_snapshot": 1
      }
    }
  ]
}
```

Este mismo JSON está en `Fixtures/seleccion-sin-precios.json`;
`guardado-evento-v2.json` añade el sobre y las refs.

En la primera aplicación se relee origen/propietario/revisión/estado activo,
se valida integridad interna de la venta y se compara selección/orden/cantidades.
Se rechaza origen ajeno, vacío, confirmado o ya vinculado. Se insertan documento
y líneas en una sola transacción; versión inicial 1, created/last = evento de
guardado, currentSaleId = sourceSaleId. Guardar no limpia automáticamente Caja.
El reintento con el mismo evento compara intención original y devuelve el
documento sin consultar un origen que pudo limpiarse/cobrarse, ni cambiar vínculo.
Una segunda intención sobre origen ya vinculado no crea otro documento.

## Recuperación formato 2

`aggregate_type = quotation`, `event_type = cotizacion_recuperada`,
`aggregate_id = quotationId`, `base_version = versión quotation leída`.

Claves exactas:

```json
{
  "format_version": 2,
  "base_quotation_event_id": "20000000-0000-4000-8000-000000000002",
  "previous_sale_id": "20000000-0000-4000-8000-000000000003",
  "sale_id": "20000000-0000-4000-8000-000000000020",
  "recovered_at_ms": 1791310200000,
  "draft_version": 2,
  "draft_created_event_id": "27adc5bb-a739-4c78-8926-87a10424d0ef",
  "draft_last_event_id": "c30da768-78b9-4b21-9dfc-9268e40b5b2d",
  "lines": [
    {
      "quotation_item_id": "c847d35e-1c6e-5a7f-9ceb-30bf1959157f",
      "sale_item_id": "58f0d3d0-c022-4dec-94b4-0dea0191cbd3",
      "draft_event_id": "27adc5bb-a739-4c78-8926-87a10424d0ef",
      "sort_order": 0
    },
    {
      "quotation_item_id": "572a2152-8675-5107-a812-ee5d562701b7",
      "sale_item_id": "13ed4410-5343-4160-acf7-899bdab08031",
      "draft_event_id": "c30da768-78b9-4b21-9dfc-9268e40b5b2d",
      "sort_order": 1
    }
  ]
}
```

`Fixtures/recuperacion-vinculo-v2.json` contiene el JSON canónico con UUIDs reales.
`previous_sale_id` es nullable y debe aparecer: corresponde al vínculo anterior,
incluido el origen limpio cuyo ID permanece en quotation. No convertirlo a null
porque `sales` ya no contiene esa fila. El mapa de línea será
`CotizacionRecoveryLineIdentity` en archivo propio y reemplazará el antiguo
`CotizacionRecuperadaLine` monetario.

`lines.length = N = draft_version > 0`; IDs/órdenes son únicos, lista ordenada y
con cobertura exacta de las líneas de selección. Primer y último IDs coinciden
con los extremos de la lista; para N=1 coinciden entre sí, nunca con el vínculo.
No hay snapshot, precio, costo, referencia monetaria, consumo ni total en este
evento. Los metadatos redundantes se verifican, no se aceptan por confianza.

Por cada línea se prepara `ProductoAgregadoBorradorPayload` existente:
`sale_item_id`, `sort_order` y los campos **planos** de `SaleItemSnapshot.toJson()`.
Este sí contiene precio/costo/referencia/consumo actuales, porque pertenece a
`sale_draft`. Cantidades absolutas; no `agregar()` en bucle, que genera nuevos
IDs y suma una pieza. Los eventos usan base 0..N−1, en el orden de selección,
con la misma fecha/propietario/saleId. Se validan sumas con BigInt antes de escribir.

La venta termina en versión N, createdEventId = primer evento de borrador,
lastEventId = último; cada línea nueva versión 1 y created/last = su evento.
Quotation avanza una versión y lastEventId = vínculo, sin cambiar selección,
createdEventId, fecha ni origen. El resultado conserva `saleId`, `eventId`,
`continued`, `draftAvailable`; se elimina `priceChanges`.

## Identidades estables

Algoritmos fijados; no dependen de precio, orden, nombre ni fecha del catálogo:

1. Línea quotation: UUID v5 con namespace URL
   `6ba7b811-9dad-11d1-80b4-00c04fd430c8` y texto UTF-8
   `quotation:<quotationId>:item:<sourceSaleItemId>` (algoritmo ya existente).
2. Línea sale: SHA-256 de JSON compacto UTF-8
   `["quotation-recovery",saleId,quotationItemId]`; primeros 16 bytes, nibble de
   versión 4 en byte 6, variante RFC en byte 8; UUID con guiones/minúsculas.
   Conserva el algoritmo actual de `CotizacionRecuperadaLine.idFor`.
3. Evento sale_draft: mismo SHA-256/16 bytes/parches UUID v4, con semilla
   `["quotation-recovery-event",linkEventId,saleId,quotationItemId]`.

Mover 2/3 a `QuotationRecoveryIdentity` en application/commands/cotizaciones,
con una clase principal y pruebas de reconstrucción. UUID v4 aquí expresa
formato compatible; los derivados son deterministas a partir de una intención
aleatoria, no llamadas a un generador aleatorio en cada línea.

`Fixtures/identidades-estables.json` contiene dos intenciones completas. Un
reintento de la primera repite exactamente los N IDs y su vínculo; limpiar y
crear la segunda usa nuevos saleId/linkEventId/eventos/líneas, conservando los IDs
quotation. El vínculo se almacena en `events`, no en un caché monetario adicional.

## Referencias y modos

| Evento | `affects` | `uses` |
|---|---|---|
| Guardado | `quotation/<id>` y cada `quotation_item/<id>` | `sale/<sourceSaleId>` |
| Cada sale_draft | `sale/<saleId>`, `sale_item/<saleItemId>` | `product/<productId>`, `product_variant/<variantId>`, `unit/<unitId>` solo medido |
| Vínculo | `quotation/<id>` | `sale/<saleId>` y `event/<draftEventId>` de cada línea |

`event` identifica el registro local del borrador que el vínculo verifica.
El store/tablas existentes admiten refType/refId como textos, sin enum ni
restricción de tipos; soportan `affects`, `uses`, `requires_unique`. No es un
contrato remoto nuevo. No declarar sale/sale_item como affects en el vínculo,
pues ya no escribe esas proyecciones. Deduplicar por tipo/ID/relación.

Los comandos construyen y validan refs en ambos modos, incluidas identidades,
contenido del mapa y obligatoriedad del agregado principal. El store actual
comprueba una lista no vacía; **no** sustituye la validación individual del
contrato/command service. `standalone`: cero filas event_refs y not_required.
`server_sync`: persistir refs con source local_pending, eventos también
not_required. Con N=2 se crean 3 eventos y 13 refs de recuperación en server_sync
(4 + 5 de líneas, 4 de vínculo); guardar había creado otras 4.
No iniciar push/pull/preflight/health/WebSocket en standalone. Confirmación
continúa sincronizando la venta habitual sin dependencia remota de quotation.

## Transacción, reintentos y rollback

Límite externo elegido: `QuotationProjectionStore.atomic` del command service,
implementado por `QuotationDao.transaction`. En DI, QuotationDao, SaleDao,
ProductoDao, UnitDao y DriftLocalEventStore usan **la misma AppDatabase**.
`appendAndApply` delega a `appendAndApplyBatchAtomically`, que usa transaction;
las transacciones de handlers/DAOs se anidan en la externa. No introducir una
segunda conexión, un commit por línea ni escrituras directas Drift desde application.
Se puede aplicar el lote con `LocalAtomicEventBatchStore` dentro del límite
externo; no confiar en el fallback secuencial `appendAndApplyAll` para acreditar
atomicidad con dobles. La prueba de rollback usa el adaptador SQLite real.

Secuencia obligatoria:

1. Validar intención/contexto y leer quotation y venta vinculada. Si Vendida,
   rechazar aunque confirmación tenga delivery pendiente/conflict/rejected.
2. Resolver evento aplicado de **esta intención** antes de preparar catálogo.
   Comparar tipo/agregado/owner/base/fecha/saleId/mapa determinista, evento aplicado
   not_required y contenido canónico. ID ocupado con contenido distinto: error.
3. Resolver Continuar/doble intención antes de validar catálogo. El origen
   todavía activo se continúa por vínculo; la recuperación activa se identifica
   por `quotation.lastEventId -> CotizacionRecuperadaPayload` y sus referencias
   al primer/último evento, no por igualdad con sale.createdEventId. Para otra
   intención sobre la misma revisión anterior, el vínculo actual debe acreditar
   exactamente esa base, venta y propietario. Si no corresponde, revisión obsoleta.
4. Para crear: verificar revisión quotation, ausencia de otro borrador **incluso
   vacío**, saleId nunca usado/limpiado, sin líneas ocupadas y todos los IDs
   derivados/vínculo libres. Rechazar colisiones antes de aplicar el handler
   de borrador, cuyo saveSale/saveItem utiliza upsert para edición normal.
5. Leer selección completa y catálogo dentro de esta misma transacción, validar
   disponibilidad/compatibilidad y preparar **todas** las líneas actuales. Nada
   escrito si falla una línea. Precio >0, costo null o >=0, referencia medida
   >0, cantidades/rangos y total completo <=9007199254740991.
6. Construir/aplicar N eventos sale_draft en orden. Su cantidad es absoluta;
   el total half-up es `(2 * precio * cantidad + denominador) ~/ (2 * denominador)`.
   Unit usa denominador 1; measured usa referencia **actual**. Guardar precio y
   costo desconocido como null solo en venta; no sustituir ausencia de precio por 0.
7. Aplicar vínculo final. En primera aplicación verificar quotation base/vínculo
   anterior, saleId no limpiado, owner, borrador activo, versión N, metadatos
   primer/último, N líneas nuevas, IDs/orden/variantes/cantidades/unidad de selección.
   Verificar cada evento por el payload tipado existente y comparar su snapshot
   capturado con su proyección; validar suma real de venta. No releer catálogo
   para recalcular precios ni exigir que estos existan dentro del vínculo.
   El único borrador permitido en este punto es **el saleId recién preparado**;
   retirar el rechazo actual a cualquier borrador, que ahora rechazaría el propio.
8. `linkRecoveredSale` mantiene el update condicionado a versión/evento/vínculo
   previo y debe afectar exactamente una fila. Cualquier excepción se propaga.
   Resultado/navegación a Caja solo después del commit.

| Situación | Resultado obligatorio |
|---|---|
| Mismo comando tras commit | Devuelve identidad original, continued=true; no append, cálculo ni edición. draftAvailable solo si esa venta sigue siendo el vínculo activo borrador |
| Venta recuperada editada o catálogo cambiado | Continuar conserva versión actual, cantidades y precios de venta; no exige otra vez N/las cantidades originales |
| Recuperación histórica ya limpia o con vínculo posterior | Reintento devuelve referencia histórica sin navegación (draftAvailable=false); no resucita ni vuelve a vincular |
| Dos intenciones sobre la misma base | La primera transacción gana; la segunda reconoce el vínculo aplicado y continúa esa venta, sin crear la suya |
| Primer intento falla/rollback | No queda evento aplicado. Reusar IDs/fecha; se relee catálogo vigente del nuevo intento. Precio puede cambiar al no haberse capturado ninguna venta |
| Limpiar y recuperar nuevamente | Nueva intención, venta y eventos; referencia base quotation actual, precio vigente nuevo |
| Reaplicar sale_draft | Handler existente conserva cantidades absolutas, versión y wasCleared; no sobrescribe una versión posterior/confirmada ni recrea una limpia |
| Reaplicar vínculo/guardado | Comparar identidad/contenido; aplicación ya acreditada no toca selección/venta/vínculo posterior. Respetar wasCleared y revisión; no reconstruir borrador |

En pruebas inyectar fallo al insertar/aplicar línea intermedia, insertar refs,
insertar/aplicar vínculo y después de su update pero antes de retornar. Comparar
todas las tablas antes/después, también events/event_refs/local_sequence y
sales/sale_items/quotation: cero nuevas filas y vínculo/metadatos originales.
Un callback de UI fallido después del commit solo reintenta/continúa lo aplicado;
no deshace la venta. No hay pagos, deuda, consumo/reserva ni movimiento de caja.

## Consulta y estimación temporal

La fase 2 conecta una lectura coherente en memoria (`QuotationEstimate`, sin
tabla ni evento); la fase 3 completa reactividad/PNG/compartir. Precio, referencia,
importe, moneda MXN, disponibilidad por línea y `calculatedAt` pertenecen a esa
lectura. Nombres/cantidades del documento permanecen disponibles si falta catálogo.
Una línea ausente/inactiva/incompatible deja importe no disponible; total=null
y texto «Total no disponible», sin suma parcial presentada como total completo.

Listado/detalle usan «Total estimado actual». Ticket usa «Precios vigentes al
generar», fecha de cálculo separada de emisión y «El precio se recalcula al
recuperar en Caja», más la leyenda sin pago/reserva. Observar products,
product_variants, units, quotation y sales; una estimación lee una sola revisión
coherente de SQLite. Invalidar display/imagen cuando cambian condiciones efectivas;
conservar bytes de una operación de compartir y regenerar para la siguiente.
Recibos de venta siguen usando su snapshot capturado y sus importes persistidos.

## Compatibilidad y respaldos

`fromJson` de quotation exige format_version entero 2 y las claves exactas
descritas, con nulls explícitos. Se rechaza ausencia/otra versión, formato antiguo,
`snapshot` de venta, claves monetarias/consumo y claves desconocidas, en todos los
niveles. El serializer emite solo la lista permitida; no JSON passthrough/cache.
La lista cerrada es específica de este corte local, a diferencia de la tolerancia
general de las guías para otros eventos: evita esconder precios en otro objeto.
No agregar fallback con precio cero ni decoder monetario de compatibilidad.

`schemaVersion` permanece **8**, sin onUpgrade. El predicado exige columnas
conservadas **y ningún campo retirado**, además de los requisitos actuales de
las otras tablas/índices. Listas consumibles en `Fixtures/esquema-compatibilidad.json`.
Un superconjunto con columnas antiguas no es compatible. La ausencia de columnas
no acredita el JSON: verificar todos los payloads quotation recursivamente.

Base antigua no protegida: reset de **toda** la base mediante
`_resetDatabaseOnStartup` (también WAL/SHM); pierde catálogo, ventas, pendientes,
cotizaciones y eventos monetarios antiguos. Verificar únicamente copias temporales.
Base restaurada protegida con `.pos_db_restored`: rechazar explícitamente y
conservar archivos/marcador; no borrar ni convertir. Manifiesto/user_version 8
no distingue estos esquemas: revisar estructura real. Base nueva/restaurada
compatible: se conserva tras segundo arranque, incluidos estados y vínculos.
Mantener respaldos/PNG/evidencia históricos externos sin reescribirlos.

No se cambia el esquema de la app ni se ejecuta reset de una base de uso en
fase 1. El baseline usa bases temporales del esquema anterior. La fase 2 regenera Drift
con build_runner; no editar app_database.g.dart a mano. Probar detección real con
path_provider temporal, nunca una ruta de uso. Si se pide conservación de datos,
requiere otro alcance explícito para tablas, payloads y vínculos.

## Paquete de fixtures y relevo

Leer `Fixtures/README.md` y ejecutar `python3 Fixtures/validar_fixtures.py` desde
esta carpeta (también funciona con ruta absoluta). Son datos para futuros tests,
no resultados de aceptación ni código implementado. Incluyen selección de dos
piezas/500 g, dos catálogos, snapshots de venta vigentes, sobre/refs de guardado,
N eventos de borrador, vínculo separado, expectativas, dos intenciones estables,
dos formatos antiguos incompatibles y política estructural de esquema.

P07 prepara directamente el catálogo con precio $30 por 100 g; `SaleItemSnapshot`,
`MeasuredSaleConfiguration` y la lectura SQLite admiten esa referencia positiva.
`ProductoCommandService._validateSaleConfiguration` exige hoy referencia=factor
de unidad, así que ese cambio **no** se produce con el editor actual. Este fixture
verifica la recuperación frente a catálogo preparado; no autoriza ampliar el
editor/contrato remoto de artículos. Dos piezas actuales $240 + 500 g $150 = $390.

La fase 2 debe ejecutar el corte completo de tablas/eventos/consumidores del
Mapeo, consumir estos datos, actualizar las pruebas de la matriz y cerrar
compilable con estimación de lectura conectada. No asumir versión de venta 1
para N líneas ni createdEventId compartido con quotation.lastEventId. Evidencias
de aceptación nuevas en Evidencia; fase 3 completa ticket y fase 4 resuelve P01–P28.
