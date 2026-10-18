---
tipo: plan_implementacion
estado: completado_alcance_local_con_limites_nativos
revision: 3
actualizado: 2026-10-07
---

# Cotizaciones que guardan productos sin guardar precios

## Resultado solicitado

Guardar en cada cotización los productos y variantes seleccionados, sus cantidades
y los datos necesarios para interpretar esas cantidades. Eliminar los precios,
costos e importes del documento persistido, incluidos los que actualmente se
duplican dentro de eventos locales. Recuperar una cotización disponible crea una
venta con los precios vigentes del catálogo local en ese momento.

Esta revisión reemplaza las reglas de precios de la revisión 2. Conserva el
historial, el vínculo a Caja, los estados Disponible/En venta/Vendida y las
protecciones de recuperación ya implementadas. Las evidencias del 2026-10-05
describen el comportamiento anterior; no acreditan esta modificación.

**Presentación confirmada por el usuario el 2026-10-06:** mostrar precios y total
vigentes, calculados al consultar o compartir. La estimación no se guarda en la
cotización y no garantiza el precio de una venta futura. Mantener el documento
de selección separado de esta lectura monetaria temporal.

Ejemplo: se guardan dos piezas cuando el catálogo indica $100 por pieza. Después
el precio cambia a $120. La cotización contiene dos piezas y ningún precio. Su
estimación actual y una nueva recuperación suman $240. Si ese borrador ya fue
recuperado y luego cambia el catálogo, «Continuar venta» conserva el borrador
existente; no lo recalcula ni sobrescribe ediciones. Limpiarlo y recuperar de nuevo
crea otra captura con los precios vigentes de ese nuevo momento.

## Base histórica de planificación

Los hallazgos monetarios de este apartado corresponden a la inspección anterior
al corte. Las siete columnas/modelos/payloads ya se retiraron en fase 2; fase 3
completó consulta/ticket y fase 4 verificó el producto final. El estado vigente
y sus límites están en el cierre añadido al final de este plan.

### Base real revisada

Inspección de lectura realizada el 2026-10-06:

| Proyecto | Estado observado | Alcance |
|---|---|---|
| Flutter: `/Users/benjamin/Projects/POS/pos_flutter` | HEAD `56ddbc49f7369b2598aabe3c67b03135b7c89b46`; implementación de cotizaciones y otros cambios presentes en archivos modificados/sin seguimiento | Aquí está toda la persistencia y la recuperación de cotizaciones |
| NestJS: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest` | HEAD `e451d1b4d9b9a4182aa41d3e8a525bf60c465c3e`; árbol limpio al inspeccionar | No se encontraron contratos, entidades ni migraciones de cotizaciones en `src`/`test` |
| Análisis: carpeta actual `analisis `, con espacio final | Documentos y evidencias de revisión 2 existentes; otros cambios previos | Plan nuevo y enlaces de vigencia |

Revalidar HEAD, estado y código al iniciar cada sesión. La implementación previa
no está íntegramente en HEAD: leer el árbol de trabajo y conservarlo. No restaurar
archivos ni borrar pruebas/evidencias anteriores para preparar la modificación.

Hallazgos relevantes:

- `quotations` guarda `currency` y `total_minor`.
- `quotation_items` guarda precio, costo, referencia de precio, total y
  `consumption_configuration_key`, además de datos de producto/cantidad/unidad.
- `CotizacionGuardadaLine` y `QuotationItemProjection` reutilizan
  `SaleItemSnapshot`, que exige precio y contiene costo y referencia monetaria.
- `cotizacion_guardada` duplica esos datos en `events.payload`.
- `cotizacion_recuperada`, también del agregado `quotation`, guarda otro snapshot
  monetario completo, total y `catalog_unit_price_minor`.
- La recuperación actual conserva el precio guardado; el aviso «Se conserva el
  precio cotizado» depende de `QuotationPriceChange`.
- La creación normal del borrador ya tiene `ProductoAgregadoBorradorPayload`
  (`aggregate_type = sale_draft`) y `VentaBorradorEventHandler`. Estos contratos
  conservan los importes de venta y pueden reutilizarse para la recuperación.
- `AppDatabase.schemaVersion` es **8**. `_resetDatabaseOnStartup` comprueba columnas
  mediante `containsAll`; cambiar solo la lista de columnas requeridas permitiría
  aceptar una base antigua que todavía conserve las columnas eliminadas.
- `QuotationTicketScreen` cachea `_display` y `_image` una vez. Ese comportamiento
  no sirve para un ticket cuyos importes dependen del catálogo vigente.

El inventario de archivos y eliminaciones se encuentra en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Mapeo y limpieza|Mapeo y limpieza]].

## Contrato funcional

1. Se conservan identidad/fecha de la cotización, propietario, trazabilidad,
   vínculo a venta, orden de líneas, variante, nombres descriptivos, modo,
   cantidad y unidades. «Solo productos» incluye cantidades y unidades: guardar
   únicamente IDs perdería información necesaria para recuperar la selección.
2. No se conservan precio, costo, total ni denominador del precio medido en las
   tablas o eventos del agregado `quotation`. Tampoco una copia del snapshot de
   venta dentro de un JSON genérico, caché persistente o nuevo campo equivalente.
3. Los nombres y cantidades guardados permiten consultar el documento aunque un
   artículo se retire. Cambiar su precio no escribe ni versiona la cotización.
4. Guardar sigue validando origen, propietario, revisión y líneas en una
   transacción. La integridad de importes del borrador puede comprobarse con sus
   propios datos; no forma parte del nuevo documento ni de su intención guardada.
   Retirar `expectedTotalMinor` de `GuardarCotizacionCommand` y sus consumidores;
   conservar `expectedDraftEventId` como control de concurrencia.
5. Recuperar una cotización Disponible obtiene precio y costo actuales de la
   variante, configuración de consumo vigente y referencia de precio vigente.
   Construye `SaleItemSnapshot` nuevos para la venta, calcula importes con el
   redondeo half-up y los límites enteros existentes, y no consume existencias.
6. Para venta medida, conservar cantidad atómica y código/símbolo/factor de unidad.
   Revalidar modo, dimensión e interpretación de unidad. Un cambio de referencia
   de precio, con la misma unidad compatible, ya no bloquea recuperar: se usa la
   referencia **actual**. Ejemplo: 500 g con precio actual de $30 por 100 g da $150.
   Un cambio incompatible de unidad o de modo sigue rechazándose sin escrituras.
7. Artículo/variante/unidad ausentes o inactivos impiden recuperar el conjunto
   completo. La consulta conserva todas las líneas y explica la incidencia.
   En la estimación, no sustituir precios faltantes por cero ni presentar
   la suma parcial como total completo: mostrar «Total no disponible».
8. «Continuar venta» y reintentar una recuperación aplicada conservan identidad,
   precios y ediciones de la captura existente. Una cotización Vendida continúa
   cerrada para recuperación aunque su venta tenga incidencias de sincronización.
9. Un borrador ajeno, incluso vacío, no se reemplaza ni se mezcla. Doble toque,
   fallo de cualquier escritura y reintento no dejan datos parciales ni dos ventas.
10. La estimación lee el catálogo SQLite disponible, también
    offline. En `server_sync`, «vigente» significa el catálogo conocido por esa
    instalación; no exige una consulta de red ni verifica precios en el servidor.

## Separación de cotización y venta en los eventos

Cambiar únicamente las tablas dejaría precios guardados en `events.payload`.
Por ello la recuperación debe separar el evento de vinculación y los eventos
que capturan las condiciones de venta.

### Guardado

`cotizacion_guardada`, agregado `quotation`, mantiene IDs/origen/revisión/fecha y
líneas con un contrato propio sin importes. Introducir un snapshot tipado de
producto/cantidad/unidad, independiente de `SaleItemSnapshot`. Usarlo en
`CotizacionGuardadaLine` y `QuotationItemProjection`.

El formato nuevo incluye `format_version = 2`, distinto de la versión del
agregado. Su serializer usa campos explícitos y su decoder valida el formato y
rechaza claves monetarias/snapshots de venta del contrato anterior. No admitir
el formato antiguo mediante precios cero, nulls obligatorios o fallbacks ocultos.
La compatibilidad de bases antiguas se resuelve con la política de esquema de
desarrollo indicada abajo.

### Recuperación

En **una transacción externa sobre la misma SQLite**, el command service:

1. Resuelve reintentos/Continuar venta y valida estado, revisión, identidades,
   propietario y ausencia de otro borrador antes de cualquier creación.
2. Relee todas las líneas y el catálogo dentro del mismo límite transaccional;
   prepara todos los snapshots de venta con condiciones vigentes y valida el
   total completo antes de guardar eventos.
3. Genera un evento `producto_agregado_borrador` por línea, del agregado
   `sale_draft`, con `saleId` nuevo, IDs propios estables por intención, orden y
   cantidades absolutas. Usa el payload y el handler existentes, sin llamar al
   método público `agregar` en un bucle: este genera identidades nuevas y suma
   una pieza, por lo que no conserva por sí solo las cantidades/intención.
4. Aplica esos eventos en orden, con `base_version` 0, 1, …, N−1. La venta termina
   en versión N; `createdEventId` corresponde al primer evento de borrador y
   `lastEventId` al último. Deja de asumir versión inicial 1 o identidad compartida
   entre el evento de cotización y los metadatos del borrador.
5. Guarda/aplica `cotizacion_recuperada` de formato 2, del agregado `quotation`,
   con base de cotización, vínculo anterior/nuevo, fecha e identificadores de
   eventos/líneas del borrador. No contiene snapshots, precios ni totales.
   El handler valida el borrador creado y sus identidades/cantidades antes de
   avanzar el vínculo. Ya no inserta `sales`/`sale_items` desde este handler.
6. Devuelve el resultado y navega a Caja después del commit. Cualquier fallo,
   incluido el vínculo final, revierte **todos** los eventos, refs y proyecciones.

Fijar los IDs de evento y línea a la intención de recuperación, con el formato
UUID compatible con la confirmación existente. Conservar el mapa de IDs en el
evento de vinculación para reconocer reintentos y comprobar su contenido.
No usar `createdEventId == quotation.lastEventId` como prueba de recuperación:
ahora son eventos distintos. No recalcular snapshots al reaplicar eventos de
venta; sus precios ya son condiciones capturadas de esa venta. Reaplicar el
evento de vínculo tampoco reconstruye una captura limpiada ni devuelve un
vínculo posterior a uno antiguo. Respetar revisión y `wasCleared(saleId)`.

Los refs del guardado afectan documento/líneas y usan el origen. Los eventos de
borrador afectan venta/línea y usan producto/variante/unidad realmente usados.
El evento de vínculo afecta la cotización y usa la venta/eventos que verifica;
no declara como escritura una línea que ya no modifica. Declarar y validar refs
en ambos modos y deduplicarlas donde corresponda.

## Consulta, listado y ticket

Con la presentación confirmada de precios visibles, separar:

- `Quotation`/`QuotationItem`: documento persistido sin datos monetarios.
- Modelo de estimación de lectura: precios actuales, referencia actual, importes,
  moneda MXN, disponibilidad y momento del cálculo. Vive en memoria y se obtiene
  mediante un servicio/repositorio de lectura; no tiene tabla propia.

El listado y detalle conservan identidad, fecha de creación, productos y estado.
Si muestran total, etiquetarlo «Total estimado actual». El ticket usa «Precios
vigentes al generar», momento del cálculo y «El precio se recalcula al recuperar
en Caja», además de la leyenda de ausencia de pago/reserva. No decir que una
reimpresión reproduce los importes originales: ya no se conservan.

Observar cambios relevantes de productos, variantes y unidades además de
cotizaciones/ventas. Leer cada estimación de forma coherente, sin mezclar dos
revisiones de catálogo entre líneas. Invalidar `_display`/`_image` con los datos
efectivos del cálculo. Compartir usa una imagen completa de una estimación;
mantener esos bytes estables mientras se comparte y refrescar la siguiente
generación cuando cambie el catálogo. Reabrir después de un cambio actualiza
los importes sin guardar otro evento. Los recibos de venta siguen mostrando los
importes capturados de sus ventas.

Conservar las columnas de precios/importes del ticket y los recibos. Cambiar su
origen de datos y las etiquetas de cotización, sin introducir una segunda
presentación que oculte los precios confirmados por el usuario.

## Esquema, datos anteriores y respaldo

Aplicar los AGENTS vigentes de Flutter: **schemaVersion fijo en 8**, sin
`onUpgrade`, cambio de esquema mediante `_resetDatabaseOnStartup` y regeneración
con `dart run build_runner build`. Esta entrega no incluye una migración de
conservación de instalaciones antiguas.

Eliminar físicamente las columnas indicadas en Mapeo y sus constraints. Actualizar
la detección de esquema para exigir los campos conservados **y la ausencia de los
retirados**. Una base que aún guarda precio/costo/importes de cotización es antigua,
aunque tenga las tablas y los índices correctos. No basta retirar nombres de
`containsAll` ni dejar columnas sin lectura. Las bases nuevas deben persistir en
los siguientes arranques, sin un reset recurrente.

Consecuencia concreta de la política vigente: el primer arranque con una base
local antigua no protegida recrea **toda la base**, incluidos catálogo, ventas,
cotizaciones, eventos pendientes y otros datos locales. No describirlo como
borrado de solo precios. Preparar/verificar todo esto en bases temporales; no
arrancar contra una base de uso para probar la modificación. Si posteriormente
se requiere preservar datos, cambiar explícitamente el alcance antes de ejecutar
ese arranque y diseñar una migración de tablas, payloads y vínculos.

Los respaldos con el esquema nuevo deben conservar selección, estados, vínculos
y eventos; los eventos de cotización no deben contener importes. Un respaldo
antiguo marcado como restaurado sigue rechazándose explícitamente y no se borra
por reset. Como ambos esquemas tienen versión 8, la versión del manifiesto por
sí sola no acredita compatibilidad: comprobar la estructura efectiva. Los
respaldos, PNG y evidencias históricos externos conservan sus datos originales;
no se reescriben ni eliminan como parte de limpiar el esquema de la app.

## Modos y alcance del servidor

| Modo | Resultado requerido |
|---|---|
| `standalone` | Cotizaciones y eventos de borrador `not_required`; refs declaradas/validadas sin filas `event_refs`; push/pull/preflight/health/WebSocket deshabilitados |
| `server_sync` | Cotizaciones y borradores siguen locales `not_required`; refs persistidas; solo la confirmación usa la sincronización habitual de venta |

No hay columnas de cotización que eliminar en PostgreSQL en el código observado.
Los precios del catálogo y de `sales`/`sale_items`, sus costos y el payload de
`venta_confirmada` son necesarios para ventas, pagos y reportes: conservarlos.
La confirmación no añade una dependencia remota a `quotation` ni a sus eventos.
El servidor recibe el snapshot normal de la venta con el precio tomado al
recuperar. Revalidar que el código posterior no haya añadido cotizaciones remotas
antes de ejecutar; si aparece ese cambio, documentar la diferencia de alcance.

## Sesiones de ejecución

Cuatro sesiones secuenciales. Se pueden combinar manteniendo las salidas y el
registro de continuidad. La sesión 1 prepara contratos y fixtures; la sesión 2
concentra el cambio de esquema y sus consumidores para cerrar con una aplicación
compilable, sin campos ficticios o temporalmente obligatorios con valor cero.

| Sesión | Entrega | Criterio de salida |
|---|---|---|
| [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/01 - Contrato y preparacion\|1. Contrato y preparación]] | Revalidación, contratos JSON finales, fixtures y matriz de regresión | Mapeo exhaustivo y estrategia de recuperación/compatibilidad ejecutable |
| [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/02 - Core y esquema\|2. Core y esquema]] | Snapshot propio, eventos separados, recuperación vigente, borrado físico de columnas y adaptación de consumidores | No hay importes en persistencia de cotización; aplicación y pruebas actualizadas pasan |
| [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/03 - Consulta y ticket\|3. Consulta y ticket]] | Lectura reactiva, disponibilidad, caché de imagen, textos y compartir | Precio visible coherente con el cálculo actual; selección persistida intacta |
| [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/04 - Verificacion y cierre\|4. Verificación y cierre]] | Reinicio, respaldo, modos, cobro, limpieza final y evidencia | Matriz nueva resuelta y límites reales registrados |

La matriz nueva está en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Casos de aceptacion|Casos de aceptación P01–P28]].
Registrar avance en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Estado y continuidad|Estado y continuidad]].

## Instrucción histórica para comenzar fase 1, ya ejecutada

```text
Ejecuta únicamente la sesión 1 del plan de cotizaciones sin precios guardados,
revisión 3, en el vault de análisis. Lee AGENTS de análisis y Flutter, el plan,
Mapeo y limpieza, Casos de aceptación y Estado y continuidad de
08 - Roadmap/Cotizaciones/Sin precios guardados, además de Sesiones/01.
Usa /Users/benjamin/Projects/POS/pos_flutter como código real y NestJS solo
como referencia de ventas. Conserva los cambios previos del árbol de trabajo.
Actualiza contratos, fixtures y continuidad para que la sesión 2 pueda ejecutar
el corte de esquema y eventos sin decisiones implícitas. Esta primera sesión
no cambia el esquema ni arranca contra una base de uso.
```

## Verificación de esta planificación

Se revisó código Flutter/NestJS y documentación existente; se creó este plan.
No se modificaron los proyectos de código, bases de datos o respaldos. No se
ejecutaron pruebas de aplicación en esta planificación: los resultados de
implementación deben obtenerse y registrarse durante las sesiones indicadas.

## Estado final de ejecución — 2026-10-07

| Fase | Estado real |
|---|---|
| 1. Contrato y preparación | Completada |
| 2. Core y esquema | Completada |
| 3. Consulta y ticket | Completada |
| 4. Verificación y cierre | Completada en el alcance local y selector disponible; límites concretos abiertos |

Cotizaciones persisten selección/cantidad/unidad sin precios. Consulta/compartir
estiman con catálogo local; recuperación captura condiciones actuales de venta.
P01–P28 resueltos con evidencia nueva; P27 registra alcance nativo parcial.
Reinicio/backup/legado versión 8/modos/cobro/JSON/código muerto auditados.
1306 tests aprobados, una integración de servidor omitida; analyze/diff check pasan.
Build macOS debug y release arm64 aprobados; universal pendiente por lipo.

La política de esquema queda igual: versión 8, reset completo de base antigua
no protegida; restaurada incompatible rechazada y conservada. Toda verificación
usó archivos temporales o memoria; no se reinició una base de uso.
NestJS intacto y cotizaciones sin sync remota.

Pendientes reales: envío/recepción WhatsApp, móvil físico Android/iOS y selector
iOS; build universal macOS. No están aprobados ni bloquean la implementación
local ya verificada. La fase 4 cumple su criterio de registrar pruebas o límite
concreto para cada caso. Ver
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Casos de aceptacion|Matriz P01–P28]]
y [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-4-verificacion-y-cierre|Evidencia final]].
