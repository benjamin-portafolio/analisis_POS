---
tipo: seguimiento_implementacion
estado: historial_revision_2_cambio_revision_3_planificado
revision_plan: 2
actualizado: 2026-10-06
---

# Estado y continuidad: cotizaciones

## Solicitud vigente del 2026-10-06

El usuario solicita dejar de guardar los precios en cotizaciones y preparar
un plan que retire campos de base de datos, payloads y código innecesarios,
ejecutable en varias sesiones. Se documentó
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Plan de implementacion|la revisión 3 en cuatro sesiones]]
y su [[08 - Roadmap/Cotizaciones/Sin precios guardados/Estado y continuidad|continuidad vigente]].
Esta modificación está **planificada, sin implementar**. El código actual
todavía conserva los precios. Las secciones siguientes registran la revisión
2 implementada y su evidencia; no describen el contrato objetivo nuevo.

## Solicitud anterior del 2026-10-05

El usuario amplía el plan para guardar las cotizaciones, listarlas desde una
opción del menú lateral y convertirlas posteriormente en ventas. La última
precisión define la nueva pantalla como consulta de cotizaciones recuperables,
reemplazando la formulación intermedia de crear cotizaciones en esa pantalla.

Revisión 2 concreta: la creación continúa en Caja; el menú «Cotizaciones» abre
historial/detalle con Recuperar en Caja o Continuar venta. Solo el cobro confirma
y produce movimientos. Las cotizaciones quedan guardadas y reimprimibles después
de limpiar o vender, con snapshots inmutables y vínculo a la captura/venta.

La revisión 1 proponía documentos temporales y tres sesiones. Queda reemplazada
por esta revisión persistente con cuatro sesiones, esquema local y eventos.
Al cerrar esa planificación no se había implementado ninguna revisión. Las
implementaciones de las fases 1, 2 y 3 solicitadas después se registran al final de esta nota.

## Documentación vigente

- [[08 - Roadmap/Cotizaciones/Plan de implementacion|Plan, revisión 2]].
- [[08 - Roadmap/Cotizaciones/Casos de aceptacion|Matriz C01–C36, revisión 2]].
- [[08 - Roadmap/Cotizaciones/Sesiones/01 - Persistencia y guardado|Sesión 1]].
- [[08 - Roadmap/Cotizaciones/Sesiones/02 - Recuperacion a venta|Sesión 2]].
- [[08 - Roadmap/Cotizaciones/Sesiones/03 - Historial y ticket|Sesión 3]].
- [[08 - Roadmap/Cotizaciones/Sesiones/04 - Verificacion y cierre|Sesión 4]].

Se reemplazaron las tres instrucciones de ejecución anteriores, que prohibían
persistencia y recuperación. No utilizar los prompts de revisión 1.

## Decisiones que concretan el alcance

1. Persistencia local para usuario/dispositivo actuales en ambos modos. No se
   solicitó sincronizar cotizaciones entre tablets; no hay cambios de NestJS.
2. Guardar vincula el origen mientras sigue abierto; limpiar lo vuelve disponible.
   Cobrar directamente ese origen también debe marcar la cotización Vendida.
3. Recuperar preserva precios y cantidades cotizados, revalida disponibilidad
   y unidades, y prepara consumo vigente sin ejecutarlo.
4. Un borrador ajeno no se sobrescribe/mezcla. El borrador ya vinculado se continúa.
   Una venta confirmada, aun con incidencia de sync, no se recupera otra vez.
5. Limpiar la recuperación permite volver a recuperar con nuevas identidades.
   El documento emitido nunca se reescribe con las ediciones de la futura venta.
6. Impresión física, edición/anulación de cotizaciones y sync remota siguen
   siendo extensiones, separadas de guardar/listar/recuperar ya incluidos.

## Estado por sesión

| Sesión | Estado | Evidencia |
|---|---|---|
| Planificación inicial | Completada, alcance reemplazado | Revisión 1 de ticket temporal |
| Modificación del plan | Completada | Revisión 2, menú/listado y contratos locales documentados |
| 1. Persistencia y guardado | Completada | Implementación 2026-10-05; SQLite, contratos, DI, respaldo y regresiones descritos abajo |
| 2. Recuperación a venta | Completada | Implementación 2026-10-05; recuperación, revalidación, SQLite, reinicio y cobro descritos abajo |
| 3. Historial y ticket | Completada | Implementación 2026-10-05; 34 pruebas nuevas, navegación/SQLite, PNG e inspección visual descritos abajo |
| 4. Verificación y cierre | Cierre funcional completado; tramo móvil de C35 pendiente | 10 pruebas nuevas, 1254 aprobadas, respaldo/historia, saldos, PNG y selector macOS; evidencia abajo |

## Código revalidado al planificar

Flutter HEAD 65c07bc, con cambios previos de escaneo en menú/pruebas/Caja/DAO.
Se inspeccionaron MenuLateral, HomeScreen, borrador único, comandos de captura,
snapshots, store de eventos y confirmación. NestJS se consultó para verificar
que admite precio capturado y valida consumo/unidad histórica al confirmar.

Hallazgos que el implementador debe respetar:

- AgregarProductoBorradorCommand usa precio actual: no sirve como bucle de recuperación.
- SaleDraftProjectionStore permite la lectura/escritura transaccional necesaria.
- Limpieza elimina físicamente el borrador; referencias de cotización al origen
  no pueden usar una FK que impida esa limpieza.
- Store convierte tipos nuevos not_required a pending en server_sync: declarar
  explícitamente cotizacion_guardada/cotizacion_recuperada como familia local.
- HomeScreen tiene una Caja observando repositorio: recuperar selecciona esa
  pantalla, no crea otro Home ni un carrito distinto.

Solo se cambió documentación del vault: carpeta Cotizaciones e índice. No se
modificaron Flutter/NestJS, bases de uso, esquemas ni se ejecutaron tests de app.
Verificación de esta sesión: coherencia de revisión, enlaces y formato documental.
Se comprobaron siete notas de revisión 2, cuatro sesiones, catorce enlaces
internos y la secuencia C01–C36 sin incidencias. `git diff --check` correcto;
sin referencias activas a los nombres de sesiones reemplazados.

## Continuación y relevo

Las sesiones 1–4 están implementadas y el cierre funcional se registra al final.
Queda únicamente el tramo nativo móvil/WhatsApp de C35. Los bloques de fases
anteriores conservan su alcance y sus pendientes tal como se registraron entonces;
la matriz final de sesión 4 los sustituye para el estado vigente.

Al terminar cada sesión añadir bloque fechado y actualizar estado con:

1. Revisión consumida y criterios de salida satisfechos.
2. HEAD/estado inicial y final; archivos propios y cambios previos conservados.
3. Contratos/esquema implementados, política de reset y compatibilidad real.
4. Comandos/resultados, casos C01–C36 y evidencias SQLite/PNG/respaldo/nativas.
5. Límites, incidencias, cambios del plan y siguiente sesión.

No declarar persistencia probada solo por renderizar un PNG ni recuperación
completa solo por navegar. Respaldo/reinicio y transacciones requieren evidencia.


## Implementación de fase 1 — 2026-10-05

Se consumió revisión 2 de Plan, Casos de aceptación, esta continuidad y
Sesiones/01. Se leyeron AGENTS del análisis y Flutter y ambas guías offline de
Flutter. Se completó exclusivamente persistencia/guardado y limpieza segura.
No se agregaron recuperación, pantallas, tickets nuevos, impresión física,
contratos remotos ni cambios de NestJS.

### Estado y preservación del repositorio

Flutter comenzó limpio en HEAD `56ddbc4` (posterior al `65c07bc` documentado en
la planificación). Escaneo, Caja y sus cambios previos ya estaban confirmados
en ese HEAD. No se crearon commits; HEAD queda en `56ddbc4`, con los cambios de
esta fase en el árbol de trabajo. No se modificaron pantallas ni escáneres.
El vault tenía modificaciones y carpetas sin seguimiento previas, incluida
Cotizaciones; se conservan y sólo se edita esta nota dentro del análisis.

La primera suite completa detectó una prueba previa de Inventario que aún
buscaba `clear_article_search_button`, ya ausente en HEAD. Se reprodujo de forma
individual y se adaptó únicamente esa prueba para vaciar el TextField y esperar
los 200 ms de debounce. Se conserva la pantalla con su única X de cerrar.

### Contratos y comportamiento entregados

- `Quotation`, `QuotationItem` y `QuotationStatus` son dominio independiente
  de Drift/application. Todas las propiedades del snapshot son finales y la
  colección de líneas es inmodificable.
- `quotations` y `quotation_items` heredan CommonFields. Se documentan todos
  los campos. Se conservan propietario/dispositivo, emisión, MXN, total,
  sourceSaleId, sourceDraftEventId, currentSaleId, orden y snapshots completos
  de las líneas, incluidos costo conocido/desconocido y configuración capturada
  de consumo. Esa configuración es trazabilidad; guardar no la ejecuta.
- Sólo quotation_items→quotations tiene FK. Variante, venta origen, revisión y
  vínculo actual son identidades históricas sin FK que impida borrar captura
  o catálogo. Índices: `ix_quotations_listing` por usuario/dispositivo/emisión
  descendente/ID descendente; `ux_quotations_current_sale` único cuando active=1
  y vínculo no nulo; `ux_quotation_items_order` por documento/orden.
- `QuotationRepository` observa documento, líneas y venta vinculada en una
  consulta consistente. Filtra usuario/dispositivo; ordena por emisión e ID.
  Recuperables incluye Disponible/En venta; Todas incluye Vendida. Confirmada
  prevalece aunque su entrega sea pending/conflict/rejected. No existe columna
  persistida de estado visible ni dependencia de JOIN al catálogo.
- `GuardarCotizacionCommand` genera una vez quotationId/eventId/fecha, admite
  reconstruirlos explícitamente al reintentar y normaliza la fecha a segundos
  UTC, precisión de los DateTime de Drift. La intención debe conservarse en el
  futuro flujo de Caja; no crear otro comando sin esos datos al reintentar.
  Las líneas usan UUID v5 derivado de quotationId y línea origen; nunca copian
  las identidades de sale_items. El resultado devuelve ID/evento/fecha originales.
- `CotizacionCommandService.guardar` usa la unidad SQLite común con eventos y
  borradores. Valida propietario, actividad, estado, revisión, total, líneas
  activas, orden, importes persistidos y rangos. Sumas/cálculos usan BigInt y
  el límite de entero seguro 9007199254740991. No lee precios vigentes del
  catálogo. Guarda evento, refs, documento y líneas atómicamente.
- Otra intención sobre la misma captura produce
  `QuotationAlreadyLinkedException(quotationId)` para permitir consultar el
  documento existente. Colisiones de evento/documento/contenido se rechazan.
  Reintentar una intención aplicada funciona incluso si su origen fue editado,
  limpiado o cobrado; devuelve lo emitido y no lo reescribe.
- `CotizacionGuardadaPayload` y `CotizacionGuardadaLine` son contratos tipados
  nuevos, sin formatos legados. Validan campos conocidos e ignoran extras
  desconocidos. Handler registrado en EventProcessor/DI, con comprobación de
  contenido e identidad, revalidación transaccional del origen e inserciones
  estrictas. Reaplicar un guardado no recrea ventas ni cambia vínculos históricos.
- `cotizacion_guardada`, aggregate_type `quotation`, base_version 0, queda
  clasificado explícitamente por DriftLocalEventStore como local `not_required`
  en ambos modos, incluso si recibe delivery_status pending. Refs affects de
  documento/líneas y uses del origen se declaran/validan en ambos; sólo
  server_sync persiste filas event_refs. No se modifican los arranques de sync.
- `LimpiarVentaBorradorCommand.expectedDraftEventId` es opcional. Cuando el
  origen existe se valida dentro de la transacción antes de evento/escrituras.
  Origen ausente sigue siendo no-op; una captura posterior no se toca. La
  limpieza no elimina cotización ni líneas y su estado se actualiza por stream.
  La fase 3 deberá enviar siempre esa revisión desde el ticket inicial.
- Cobrar directamente el origen sigue el comando de venta existente y deja
  la cotización Vendida por el vínculo. Su payload y referencias no añaden una
  dependencia remota de quotation ni de cotizacion_guardada.

### Archivos propios de Flutter

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`.

| Área | Archivos nuevos |
|---|---|
| Dominio | `lib/domain/cotizaciones/quotation.dart`, `quotation_item.dart`, `quotation_status.dart`; `lib/domain/repositories/quotation_repository.dart` |
| Comandos | `lib/application/commands/cotizaciones/cotizacion_command_service.dart`, `guardar_cotizacion_command.dart`, `guardar_cotizacion_result.dart`, `quotation_already_linked_exception.dart` |
| Contratos/handler | `lib/application/sync/payloads/cotizacion_guardada_payload.dart`, `cotizacion_guardada_line.dart`; `lib/application/sync/handlers/cotizacion_guardada_event_handler.dart`; `lib/application/sync/quotation_draft_validator.dart` |
| Puertos/DTO | `lib/application/sync/projections/quotation_projection_store.dart`, `quotation_projection.dart`, `quotation_item_projection.dart` |
| Datos | `lib/data/local/drift/tables/quotations.dart`, `quotation_items.dart`; `lib/data/local/drift/daos/quotation_dao.dart`; `lib/data/repositories/quotation_repository_impl.dart` |
| Pruebas | `test/application/commands/cotizaciones/cotizacion_command_service_test.dart`; `test/application/sync/payloads/cotizacion_guardada_payload_test.dart`; `test/core/di/quotation_dependencies_test.dart`; `test/data/local/drift/quotation_backup_test.dart`; `test/support/quotation_harness.dart` |

Archivos existentes modificados:

- `lib/application/commands/ventas/limpiar_venta_borrador_command.dart`
- `lib/application/commands/ventas/venta_borrador_command_service.dart`
- `lib/application/sync/projections/sale_item_projection.dart`
- `lib/data/local/drift/daos/sale_dao.dart` (expone importe persistido para validación)
- `lib/core/di/application_dependencies.dart`
- `lib/core/di/data_dependencies.dart`
- `lib/data/local/drift/app_database.dart`
- `lib/data/local/drift/app_database.g.dart` (regenerado)
- `lib/data/local/drift/drift_local_event_store.dart`
- `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`

### Esquema, compatibilidad y respaldo

`schemaVersion` permanece en **8**. No se añadió ni modificó `onUpgrade`.
`_resetDatabaseOnStartup` exige las tablas nuevas, todas sus columnas y los
índices definidos. Según AGENTS, una base de desarrollo anterior sin estos
componentes se recreará completa al próximo arranque: se perderán sus datos
locales, incluido catálogo, eventos, ventas y saldos. No hay migración de datos
anteriores ni se garantiza compatibilidad de producción con ellos.

No se abrió ni reinició la base real del usuario. Las pruebas usan SQLite en
memoria o directorios temporales con path_provider simulado. Bases completas
del esquema actual se conservan al cerrar/reabrir; no se promueven eventos
locales a pending. Una base antigua marcada como restaurada se rechaza con
StateError y se conserva físicamente, conforme al mecanismo de protección
existente. Se prueban ausencia de tablas, índice y columna.

Auditoría del respaldo existente: `VACUUM INTO` copia toda SQLite, incluidas
cotizaciones, líneas, vínculos, eventos y refs; la restauración existente valida
SHA-256 e integrity_check, instala el archivo y escribe `.pos_db_restored`.
No necesitó cambios en esos servicios. Se prueban ambos modos y los tres
estados, reinicio normal, restauración real y un segundo reinicio posterior.
Comparaciones completas de tablas, `PRAGMA integrity_check` y
`PRAGMA foreign_key_check` pasan; una tabla marcador confirma que no hubo reset.
No se tocó bootstrap/pull ni se eliminan estas tablas al aplicar eventos normales.
Los respaldos de esquema anterior siguen requiriendo un alcance explícito de
migración; no son evidencia de compatibilidad por compartir schemaVersion 8.

### Verificación y resultados

Comandos desde Flutter:

```sh
dart run build_runner build
dart analyze
flutter test test/application/commands/cotizaciones test/application/sync/payloads/cotizacion_guardada_payload_test.dart test/data/local/drift/quotation_backup_test.dart --reporter expanded
flutter test test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart --reporter expanded
flutter test --reporter expanded
git diff --check
```

- Build Runner: esquema regenerado; ejecución final correcta.
- Analyze: ejecución final `No issues found!`.
- Pruebas enfocadas de comando/contrato/respaldo: **29 aprobadas**.
  DI agrega **2 casos** en la suite completa: resolución real de puertos,
  repositorio y handler en ambos modos (**31 pruebas nuevas** en total).
- Primera suite completa: 1163 aprobadas, 1 fallo previo de Inventario y
  1 omitida. Reproducción individual: 21 aprobadas y el mismo fallo.
  Se corrigió sólo la interacción obsoleta de esa prueba, como se explica arriba.
- Suite completa final: **1164 aprobadas, 1 omitida, 0 fallos** (95 s). La omitida
  requiere un sync server configurado (`test/integration/variant_tracking_server_test.dart`).
- `git diff --check`: correcto para los cambios de Flutter.

Los ensayos inyectan fallos al insertar la segunda línea, después del handler
completo y al borrar la venta. Verifican rollback de todas las tablas, eventos,
refs y vínculo. Se compara el contenido de todas las tablas de negocio antes
y después de guardar (no sólo conteos), incluidos pagos, crédito/abonos/
asignaciones, inventario/balances, finanzas y caja. Guardar no cambia ninguno.
Fixtures con inventario directo y receta detectan consumo accidental; la línea
medida verifica 750 átomos, referencia/factor 1000 y half-up 7501 centavos.
Cobrar después produce exactamente un pago y los consumos esperados; guardar
no exigió una sesión abierta. Regresiones de pagos/crédito, caja y escaneo se
mantienen en la suite completa.

### Matriz C01–C36 al cerrar fase 1

“Parcial” significa que el tramo SQLite de esta fase está aprobado y la UI,
recuperación o evidencia nativa correspondiente pertenece a otra fase.

| Caso | Resultado de fase 1 | Evidencia / pendiente |
|---|---|---|
| C01 | Parcial aprobado | Comando rechaza origen ausente/sin líneas activas sin escrituras; botón pendiente fase 3 |
| C02 | Aprobado | Snapshots, IDs propios, precios capturados, piezas/medidas/rangos/BigInt/half-up |
| C03 | Aprobado | Propiedad usuario/dispositivo, estado/actividad, revisión, total y línea corrupta |
| C04 | Aprobado | Misma intención concurrente y reconstruida tras reinicio; ID/fecha originales; colisiones |
| C05 | Parcial aprobado | Dos intenciones serializadas, vínculo único y excepción con ID existente; widget pendiente |
| C06 | Parcial aprobado | Documento/líneas tras cierre/reapertura real; listado/ticket UI pendientes |
| C07 | Parcial aprobado | Limpieza conserva documento/precios y deriva Disponible; ticket/widget pendientes |
| C08 | Parcial aprobado | Guardar sin efectos en tablas de negocio ni pagos/deuda/inventario/caja; compartir pendiente |
| C09 | Pendiente fase 3 | Menú/pantalla/filtros UI |
| C10 | Parcial aprobado | Lectura intacta tras cambiar precios y borrar catálogo/origen; PNG pendiente |
| C11 | Pendiente fase 3 | Modelo/dibujo de ticket |
| C12 | Pendiente fase 3 | PNG e inspección visual |
| C13 | Pendiente fase 3 | Estados de pantalla y regreso |
| C14 | Pendiente fase 2 | Recuperación idempotente |
| C15 | Pendiente fase 2 | Recuperar con precio cotizado |
| C16 | Pendiente fase 2 | Consumo operativo vigente al recuperar |
| C17 | Pendiente fase 2 | Revalidar medidas al recuperar |
| C18 | Pendiente fase 2 | Rechazo por catálogo incompleto al recuperar |
| C19 | Pendiente fase 2 | Protección de otro borrador |
| C20 | Pendiente fases 2/3 | Continuar/navegar a Caja |
| C21 | Aprobado | Cobro real del origen cambia stream a Vendida sin tocar snapshot |
| C22 | Pendiente fase 2 | Limpiar recuperación y volver a recuperar |
| C23 | Pendiente fase 2 | Comando de recuperación rechaza Vendida |
| C24 | Aprobado en lectura | Venta confirmada pending/conflict/rejected sigue Vendida y fuera de Recuperables |
| C25 | Parcial aprobado | Rollback de guardar/limpiar; recuperación pendiente |
| C26 | Parcial aprobado | expectedDraftEventId, revisión cambiada y origen ausente no-op que conserva nueva captura; ticket pendiente |
| C27 | Parcial aprobado | Replay/colisión de guardado, origen limpiado/confirmado, sin duplicar ni resucitar; recuperación pendiente |
| C28 | Parcial aprobado | Los tres estados tras reinicio/restore en ambos modos; Continuar UI pendiente |
| C29 | Parcial aprobado | Editar origen vinculado no reescribe cotización; edición de recuperado/PNG pendientes |
| C30 | Parcial aprobado | Guardar directo/receta sin sesión de caja ni movimientos; recuperación pendiente |
| C31 | Pendiente fase 2 | Regresiones del cobro existente pasan; cobrar una recuperación aún no existe |
| C32 | Parcial aprobado | Guardar/limpiar locales standalone sin refs persistidas; runtime sin cambios; recuperación pendiente |
| C33 | Parcial aprobado | Guardar not_required con refs en server_sync; cobro origen único pending sin dependencia quotation; recuperación pendiente |
| C34 | Aprobado | Respaldo/restauración/reinicio real del esquema actual, ambos modos, tres estados y sin promoción a pending |
| C35 | Pendiente fase 3 | Compartir/WhatsApp nativo |
| C36 | Parcial aprobado | Regresiones Caja/escaneo/gestión existentes; callbacks y navegación de cotizaciones pendientes |

### Criterio de salida y siguiente trabajo

El criterio de fase 1 está satisfecho: documentos/líneas durables separados de
ventas, reintentos sin duplicados, lectura/limpieza conservan snapshot, estados
se derivan de la venta, clasificación/ref persistencia por modo correctas y
esquema regenerado con evidencia SQLite y respaldo. La funcionalidad aún no
está expuesta en Caja ni en pantallas: esa integración pertenece a fase 3.

Siguiente sesión autorizable: fase 2, recuperación transaccional. Agregar su
comando/contrato/handler y clasificación local explícita de cotizacion_recuperada,
revalidar catálogo/unidades/configuración operativa, mantener precio cotizado,
evitar pisar otro borrador y proteger replay histórico con wasCleared/versiones.
Luego fase 3 incorporará UI/ticket y enviará revisión esperada para limpiar;
fase 4 cerrará matriz visual/nativa. No hay placeholders de recuperación en
esta implementación ni cambios de sincronización remota.


## Implementación de fase 2 — 2026-10-05

Se consumió la revisión 2 del plan, matriz, continuidad y Sesiones/01 y 02.
Se leyeron AGENTS del análisis y Flutter, sus guías offline vigentes y las
notas de flujo local e idempotencia. Se verificaron los archivos y evidencia
de fase 1 y se reejecutaron sus 29 pruebas de comandos/contrato/respaldo: todas
aprobadas. No se encontraron prerrequisitos funcionales pendientes para recuperar.

### Estado del repositorio y alcance

HEAD de Flutter permanece en `56ddbc4`. El árbol inicial ya contenía la fase 1
sin commit, incluidos esquema generado, DI, limpieza segura y la corrección de
la prueba previa de Inventario. Se conservaron esos cambios y el código de
escaneo/Caja existente. No se crearon commits ni se abrió la base real del usuario.
El vault conservó sus modificaciones previas; esta fase sólo actualiza esta
nota y añade los logs en `Evidencia/2026-10-05-fase2/`.

Se implementó exclusivamente recuperación/continuación de core. No hay nuevas
pantallas, navegación, PNG, impresión, sincronización de cotizaciones ni cambios
en NestJS. `VentaCommandService.confirmar`, `VentaConfirmadaPayload` y
`ConfirmedSaleLine` permanecen sin modificaciones, comprobado con git diff.

### Comportamiento y contratos

- `RecuperarCotizacionCommand` recibe quotationId y expectedQuotationEventId;
  genera saleId/eventId/fecha una vez por intención y permite reconstruirlos
  explícitamente al reintentar. Fecha UTC a segundos, coherente con Drift.
  Las líneas nuevas se derivan de saleId y quotationItemId mediante SHA-256 y
  `Uuid.v4`, conservando identidades estables compatibles con el contrato de
  venta existente, que exige UUID v4. No reutiliza IDs de la venta origen,
  documentos/líneas de cotización ni ventas limpiadas.
- `CotizacionCommandService.recuperar` relee documento, propietario, revisión,
  vínculo y borrador en la transacción SQLite común con evento/refs/handler.
  Vendida rechaza incluso con venta pending/conflict/rejected, también cuando
  se reintenta la intención anterior. Continuar un borrador vinculado devuelve
  su ID sin copiar ni sobrescribir, aun después de editar o retirar catálogo.
- Dos intenciones simultáneas sobre la misma revisión continúan la primera
  captura comprometida. Cualquier otro borrador activo del usuario/dispositivo,
  incluso vacío, impide recuperar sin limpiar, reemplazar o mezclar.
- Para Disponible, `QuotationRecoveryValidator` valida cada artículo/variante
  activo y las medidas cotizadas: modo, unidad activa, código, símbolo, factor
  y referencia. Verifica también la dimensión de los códigos del catálogo
  estable g/kg/ml/l. Una incompatibilidad devuelve
  `QuotationRecoveryLineException(quotationItemId, reason)` sin escrituras.
  No se modifican los datos emitidos y el documento sigue siendo legible.
- Mantiene nombre, cantidad, precio, costo capturado y unidad del snapshot
  cotizado. Reemplaza únicamente la clave de consumo por la vigente. No llama
  a agregar productos, no consume, no reserva y no necesita una sesión de caja.
  Confirmar después sigue revalidando consumo/catálogo con el comando existente.
- `RecuperarCotizacionResult.priceChanges` es inmodificable y aporta ID de línea,
  variante, nombre y precios cotizado/catálogo observados al recuperar. El
  catálogo nunca sustituye el precio emitido; los reintentos conservan esos datos
  del evento original. `continued` distingue continuación de nueva creación.
- Un reintento de una intención ya limpiada o reemplazada devuelve su saleId
  original con `draftAvailable = false`, sin recrear ni navegar a una nueva
  captura. Para recuperar de nuevo se debe crear otra intención con la revisión
  actual. La futura UI deberá comprobar este campo antes de continuar.
- `CotizacionRecuperadaPayload`/`CotizacionRecuperadaLine` validan IDs, tipos,
  fechas, medidas, importes/suma con BigInt, consumo, órdenes y duplicados;
  ignoran extras desconocidos y no tienen compatibilidad legada. Se registró
  `CotizacionRecuperadaEventHandler` en EventProcessor y en DI real.
- El evento usa agregado quotation y su base_version actual. Crea la venta y
  cada línea en versión **1**, con su eventId como revisión inicial, y avanza
  sólo currentSaleId/version/lastEventId de quotation en una sola transacción.
  Las inserciones son estrictas; colisiones con otra venta/línea nunca hacen
  upsert. El vínculo usa comparación de revisión/vínculo anterior al actualizar.
- El handler relee estado y revalida snapshots operativos antes de insertar.
  Las versiones de quotation y `wasCleared(saleId)` bloquean reaplicaciones
  históricas: no resucitan capturas limpiadas, reabren confirmadas ni restauran
  vínculos anteriores. Colisiones de eventId/contenido se rechazan.
- Refs affects de quotation, sale y sale_items, y uses de productos, variantes
  y unidades utilizadas se declaran y validan en ambos modos, con deduplicación.
  Sólo server_sync persiste event_refs. DriftLocalEventStore clasifica
  explícitamente ambos eventos de cotización como `not_required`, incluso
  cuando se solicite pending. No se cambió el arranque de sync de standalone.
- Limpiar elimina únicamente captura/líneas y deriva Disponible; otro intento
  crea IDs nuevos. Cobrar deriva Vendida. Editar y cobrar nunca reescriben
  el documento. venta_confirmada conserva sus dependencias habituales de
  catálogo/recursos/cliente/caja, sin referencias ni dependencia de quotation
  o de sus eventos exclusivamente locales.

### Archivos de esta fase

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`.

| Área | Archivos nuevos |
|---|---|
| Intención/resultados | `lib/application/commands/cotizaciones/recuperar_cotizacion_command.dart`, `recuperar_cotizacion_result.dart`, `quotation_price_change.dart` |
| Contrato/handler | `lib/application/sync/payloads/cotizacion_recuperada_payload.dart`, `cotizacion_recuperada_line.dart`; `lib/application/sync/handlers/cotizacion_recuperada_event_handler.dart` |
| Revalidación | `lib/application/sync/quotation_recovery_validator.dart`, `quotation_recovery_line_exception.dart` |
| Tests | `test/application/commands/cotizaciones/recuperar_cotizacion_test.dart`; `test/application/sync/payloads/cotizacion_recuperada_payload_test.dart`; `test/application/sync/handlers/cotizacion_recuperada_event_handler_test.dart` |

Archivos existentes de fase 1 extendidos en esta fase:

- `lib/application/commands/cotizaciones/cotizacion_command_service.dart`
- `lib/application/sync/projections/quotation_projection_store.dart`
- `lib/data/local/drift/daos/quotation_dao.dart`
- `lib/data/local/drift/daos/sale_dao.dart` (mapeos comunes e inserción estricta)
- `lib/core/di/application_dependencies.dart`
- `lib/data/local/drift/drift_local_event_store.dart`
- `test/support/quotation_harness.dart` (handler, caja/cliente y métodos existentes)
- `test/core/di/quotation_dependencies_test.dart` (recuperación por DI en ambos modos)

No se añadieron tablas, columnas, índices, migraciones ni cambios de
schemaVersion en fase 2. Build Runner se reejecutó por los DAOs, conservando
el esquema de fase 1 y su política de desarrollo: esquema actual se conserva;
esquema anterior incompleto requiere reset según AGENTS, salvo respaldo
restaurado protegido. La compatibilidad de producción/migraciones sigue fuera
de alcance. Las pruebas de archivo temporal pasan por el arranque real de
AppDatabase y verifican una tabla marcador, integrity_check y foreign_key_check.

### Comandos y resultados

Desde el proyecto Flutter:

```sh
flutter test test/application/commands/cotizaciones/cotizacion_command_service_test.dart test/application/sync/payloads/cotizacion_guardada_payload_test.dart test/data/local/drift/quotation_backup_test.dart --reporter expanded
dart run build_runner build
flutter test test/application/commands/cotizaciones test/application/sync/payloads/cotizacion_guardada_payload_test.dart test/application/sync/payloads/cotizacion_recuperada_payload_test.dart test/application/sync/handlers/cotizacion_recuperada_event_handler_test.dart test/core/di/quotation_dependencies_test.dart test/data/local/drift/quotation_backup_test.dart --reporter expanded
dart analyze
flutter test --reporter expanded
git diff --check
git diff --exit-code -- lib/application/commands/ventas/venta_command_service.dart lib/application/sync/payloads/venta_confirmada_payload.dart lib/application/sync/payloads/confirmed_sale_line.dart
```

- Revalidación fase 1: **29 aprobadas**.
- Build Runner: **éxito**, 7 s; esquema regenerado sin modificaciones nuevas.
- Suite enfocada con fases 1/2, contratos, handler, DI y respaldo:
  **77 aprobadas, 0 fallos**. Incluye **46 pruebas nuevas** de fase 2
  (35 recuperación, 6 handler, 5 contrato). Las 2 pruebas DI existentes fueron
  extendidas para probar la recuperación real en ambos modos.
- Analyze final: **No issues found!**.
- Suite completa final: **1210 aprobadas, 1 omitida, 0 fallos**, 49 s, exit 0.
  La omitida existente necesita `POS_PHASE3_SYNC_URL` con un servidor aislado
  Nest/PostgreSQL; no se configura un servidor para esta fase exclusivamente local.
- git diff --check: **correcto**. Contratos/comando de confirmación sin diff.

Logs preservados dentro de esta carpeta:

- `Evidencia/2026-10-05-fase2/fase1-revalidada.log`
- `Evidencia/2026-10-05-fase2/build-runner.log`
- `Evidencia/2026-10-05-fase2/pruebas-enfocadas.log`
- `Evidencia/2026-10-05-fase2/dart-analyze.log`
- `Evidencia/2026-10-05-fase2/flutter-test.log`

La primera prueba de cobro detectó UUID v5 de línea incompatible con el
contrato vigente; se corrigió la generación local a v4 estable, sin modificar
venta_confirmada. Las últimas verificaciones incluyen esa corrección.

### Evidencia SQLite y matriz al cerrar fase 2

Los tests usan SQLite real en memoria y archivos temporales, sin tocar bases
de uso. Comparan **contenidos completos**, no sólo conteos, de todas las tablas
salvo las escrituras esperadas de recuperación (quotation, sales, sale_items,
events/event_refs). quotation_items permanece dentro de la comparación.
Incluyen recursos directos y receta, inventario/balances, pagos, crédito/abonos/
asignaciones, finanzas y caja. No hay efectos ni reservas al recuperar; ni se
requiere una sesión abierta aunque caja esté habilitada. Cobrar efectivo sin
sesión continúa rechazado conforme al flujo existente.

Con tres líneas de piezas/directo, receta y 750 átomos medidos, cotización total
13401; editar la primera cantidad a 2 produce venta 16901, manteniendo el
contenido emitido. Efectivo/transferencia generan un pago, crédito una deuda;
inventario consume exactamente -2/-3 y el balance queda en 995; sólo efectivo
produce movimiento de cajón. Repetir cobro y replay no duplican efectos.
Cambio de consumo directo→receta y componente 3→5 aplica claves vigentes sin
movimientos al recuperar; otro cambio posterior bloquea confirmar y conserva
la captura. Restaurar la configuración permite cobrar una vez con -2/-5.

Se inyectan fallos en segunda línea, cambio de vínculo, después del handler,
colisiones de venta/línea y cambio de revisión después de insertar el evento.
Todos revierten filas, eventos, refs y vínculo. Reiniciar conserva la captura
editada y luego la venta confirmada/rechazada, con sus identidades y estados,
sin reset ni promoción de eventos locales a pending. Las pruebas de respaldo
de fase 1 también se reejecutaron y siguen aprobadas.

| Caso | Resultado acumulado al cerrar fase 2 | Evidencia / pendiente |
|---|---|---|
| C01–C08 | Se conserva resultado fase 1 | 29 pruebas revalidadas; UI/ticket pendientes fase 3 según matriz previa |
| C09–C13 | Se conserva resultado fase 1 | Listado, ticket y PNG pendientes fase 3 |
| C14 | Core aprobado | Misma/dos intenciones, reconstrucción tras reinicio y ediciones conservadas; widget pendiente |
| C15 | Core aprobado | Nuevos IDs v4, precios/cantidades/nombres cotizados y datos de aviso; widget pendiente |
| C16 | Aprobado | Consumo directo/receta vigente y revalidación al cobrar |
| C17 | Core aprobado | Modo, unidad, código, símbolo, dimensión, factor/referencia incompatibles; UI pendiente |
| C18 | Core aprobado | Artículo/variante/unidad ausente o inactivo; rechazo por línea y documento legible; UI pendiente |
| C19 | Core aprobado | Otro borrador vacío/con líneas intacto; recuperación al resolverlo; widget pendiente |
| C20 | Core aprobado | Continúa origen/recuperación y devuelve ID existente sin escrituras; navegación pendiente |
| C21 | Aprobado | Cobro directo del origen revalidado en fase 1; bloqueo Vendida conserva criterio |
| C22 | Aprobado | Limpiar y nueva recuperación, nuevas identidades y versión inicial de venta 1 |
| C23 | Core aprobado | Vendida rechaza incluida misma intención previa; acción visual pendiente |
| C24 | Aprobado | pending/conflict/rejected no permiten otra recuperación, confirmado permanece Vendida |
| C25 | Aprobado en core | Rollback guardar/limpiar previo y todos los fallos de recuperación descritos |
| C26 | Se conserva resultado fase 1 | Revisión de limpieza/origen ausente revalidados; integración ticket pendiente |
| C27 | Aprobado | Replay/colisiones/wasCleared, captura editada/limpiada/confirmada y vínculo posterior |
| C28 | Core aprobado | Arranque real de recuperación editada y venta con incidencia en ambos modos; Continuar UI pendiente |
| C29 | Core aprobado | Edición/cobro cambian venta y conservan cabecera y líneas emitidas; PNG/widget pendientes |
| C30 | Aprobado | Recuperación sin sesión y sin pagos/deuda/reservas/consumos/caja, recursos directo/receta |
| C31 | Core aprobado | Efectivo/transferencia/crédito y efectos una vez con comandos vigentes, regresiones completas |
| C32 | Aprobado en core | Locales not_required sin event_refs en standalone; runtime de sync conservado |
| C33 | Aprobado en core | Locales not_required con refs; sólo cobro usa entrega de venta, sin dependencia quotation |
| C34 | Aprobado, revalidado | Respaldo/restauración temporal de fase 1 y arranque del esquema actual |
| C35–C36 | Se conserva resultado fase 1 | Nativo/PNG/navegación pendientes; regresiones de Caja/escaneo/gestión aprobadas |

### Criterio de salida y continuación

**Fase 2 completada.** Recuperación atómica e idempotente con precios cotizados,
continuación sin sobrescritura, documento inmutable tras editar/limpiar/vender,
revalidaciones y bloqueo de otras capturas probados; replay seguro y cobro
existente en ambos modos. C14–C24 y C27–C33 están cubiertos en su tramo de core,
además del rollback C25. C21 conserva su evidencia de fase 1.

Siguiente fase, sólo cuando se solicite: Sesión 3, historial/ticket y conexión
con Caja. Debe conservar la intención al reintentar, enviar la revisión actual,
consultar `draftAvailable`, presentar `priceChanges` y los errores por línea,
y navegar únicamente después del commit a la Caja existente. Fase 4 cerrará
los tramos visuales/nativos de la matriz; no se declaran completados aquí.


## Implementación de fase 3 — 2026-10-05

**Fase 3 completada conforme a revisión 2.** Cotizaciones ya está accesible desde
el menú lateral; Caja permite guardar, consultar el ticket emitido y comenzar
una nueva captura. El historial recupera/continúa en la Caja existente y permite
consultar documentos vendidos. El PNG se produce desde el documento guardado,
con datos originales aun después de reiniciar y editar captura/catálogo.

### Prerrequisitos, alcance y conservación

Se leyeron AGENTS del análisis y Flutter, guías offline de Flutter (flujo y
checklist), patrón/flujo local/idempotencia del análisis, plan revisión 2, matriz,
esta continuidad y notas de Sesiones 1, 2 y 3. Se inspeccionaron comandos,
repositorios, handlers, tablas y DI de las fases anteriores. Su suite de **77
pruebas** pasó de nuevo antes de integrar pantallas.

Flutter permanece en HEAD `56ddbc4`. Se conservaron los cambios sin commit de
fases 1/2, esquema generado, DI, limpieza y la corrección previa de la prueba de
Inventario. Se conservan los dos accesos de escaneo de Caja, el lector continuo,
compuerta, búsqueda, edición de captura y cobro. No se crearon commits ni se
abrió la base del usuario. Todas las bases de prueba son temporales/en memoria.

Esta fase modifica presentación y añade pruebas. No añade tablas, cambios de
esquema, migraciones, handlers, eventos ni comandos de core: reutiliza los
existentes. Por ello no se requirió volver a generar Drift. Mantiene schemaVersion
8 y la política de desarrollo ya documentada en fases 1/2. No se modifica NestJS,
sync, impresión física ni se añade edición/eliminación de cotizaciones.
`SaleReceiptScreen`, el comando de confirmación y los contratos de confirmación
permanecen sin modificaciones (diff comprobado).

### Comportamiento entregado

- `MenuLateral` agrega Cotizaciones. Su entrada serializa apertura, cierra el
  drawer, espera el siguiente frame y abre `QuotationsScreen`. Usa el resultado
  explícito de recuperación para llamar al Home original y seleccionar Caja;
  no construye ni apila otro Home. Evita llamadas tardías si su ruta dejó de ser
  la actual o su navegador ya se desmontó.
- `QuotationsScreen` observa el repositorio del contexto usuario/dispositivo
  configurado en DI. Recuperables es el filtro inicial (Disponible/En venta);
  Todas agrega Vendida. Muestra ID, fecha, total MXN y estado, en el orden
  descendente por fecha/ID del repositorio. Incluye carga, ambos vacíos, error
  y nueva suscripción al reintentar. Conserva el filtro al volver del detalle
  y bloquea dobles aperturas.
- `QuotationDetailScreen` observa el documento y su estado derivado, muestra
  todas las líneas y ofrece Ver ticket. Disponible ofrece Recuperar en Caja;
  En venta ofrece Continuar venta; Vendida ofrece Ver venta hacia el recibo
  vinculado y nunca recuperar. No hay booleanos de UI para determinar estados.
- Recuperar conserva una intención al reintentar la misma revisión y llama a
  `CotizacionCommandService.recuperar`. Comprueba `draftAvailable` y navega sólo
  después del commit. Explica la otra captura y los errores por artículo/unidad,
  identificando el nombre de la línea sin descartar el documento. Cuando hay
  `priceChanges`, muestra un aviso antes de pasar a Caja: se conserva el precio
  cotizado. Continuar devuelve el ID y las ediciones que ya existen en SQLite.
- Caja muestra Cotizar junto a Cobrar; vacío o sin revisión válida queda
  deshabilitado. Guardar envía origen, revisión y total vistos, con ID/evento/fecha
  estables por intención. El ticket se abre únicamente tras guardar. Ante
  `QuotationAlreadyLinkedException` consulta ese documento en modo histórico,
  sin crear otro ni ofrecer limpiar desde una consulta posterior.
- Caja serializa guardar, limpiar, editor, cobro y escáner; bloquea búsqueda y
  edición durante operaciones incompatibles. Limpiar desde Caja también envía
  la revisión vista. Se respetan `mounted` y la ruta actual después de esperar.
- `QuotationTicketScreen` carga mediante `watchById(quotationId)` y usa nombres,
  cantidades, unidades, precios, ID y fecha emitidos. COTIZACIÓN, MXN, filas,
  total y «No representa un pago ni reserva existencias» forman el PNG completo.
  Se excluyen método de pago, recibido, cambio, deuda y costo interno.
- Sólo el ticket de emisión recibe `LimpiarVentaBorradorCommand` con el origen
  y revisión esperados para Nueva captura. La limpieza espera el commit antes
  de cerrar. Revisión distinta conserva la captura y explica el error; origen
  ausente conserva el no-op del core y no borra otra captura. Historial abre y
  cierra sin limpiar. Un fallo de dibujo, incluido uno sincrónico, muestra que
  el documento sigue guardado y permite reintentar; no elimina persistencia.
- Compartir y WhatsApp usan el mismo selector de imagen, `cotizacion-ID.png`,
  bytes completos y origen de posición del botón. No interpretan el resultado
  como entrega ni limpian al cerrar/cancelar. Compartir y Nueva captura se
  excluyen mientras esperan; errores permiten reintentar. Callbacks tras dispose
  no hacen setState ni abren rutas.
- `TicketDocument` contiene únicamente datos del dibujo. `TicketImageGenerator`
  conserva la composición anterior del recibo y también dibuja cotizaciones.
  `SaleReceiptImageGenerator` queda como adaptador compatible; recibos de
  efectivo, transferencia y crédito conservan contenido y comportamiento.

### Archivos de fase 3

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`.

| Área | Nuevos archivos |
|---|---|
| Historial y detalle | `lib/presentation/pages/cotizaciones/quotations_screen.dart`, `quotation_detail_screen.dart` |
| Ticket emitido/histórico | `lib/presentation/pages/cotizaciones/quotation_ticket_screen.dart`, `models/quotation_display.dart` |
| Dibujo compartido | `lib/presentation/tickets/ticket_document.dart`, `ticket_image_generator.dart` |
| Pruebas UI | `test/presentation/pages/cotizaciones/quotations_screen_test.dart`, `quotation_ticket_test.dart`, `caja_quotation_test.dart` |
| Navegación/SQLite/reinicio | `test/presentation/pages/cotizaciones/quotation_navigation_test.dart` |
| Fixtures de UI | `test/support/quotation_ui_fixtures.dart` |

Archivos existentes modificados en esta fase:

- `lib/presentation/pages/pantalla_principal/menu_lateral.dart`
- `lib/presentation/pages/pantalla_principal/home_screen.dart`
- `lib/presentation/pages/caja/caja_screen.dart`
- `lib/presentation/pages/caja/models/sale_receipt_display.dart`
- `lib/presentation/pages/caja/sale_receipt_image_generator.dart`

En documentación se actualiza únicamente esta continuidad y se añaden los logs,
PNG y `inspeccion-visual.md` de `Evidencia/2026-10-05-fase3/`.

### Comandos y resultados

Desde Flutter:

```sh
flutter test test/application/commands/cotizaciones test/application/sync/payloads/cotizacion_guardada_payload_test.dart test/application/sync/payloads/cotizacion_recuperada_payload_test.dart test/application/sync/handlers/cotizacion_recuperada_event_handler_test.dart test/core/di/quotation_dependencies_test.dart test/data/local/drift/quotation_backup_test.dart --reporter expanded
flutter test test/presentation/pages/cotizaciones/quotation_navigation_test.dart --reporter expanded
flutter test test/presentation/pages/cotizaciones test/presentation/pages/caja test/presentation/pages/pantalla_principal/menu_lateral_test.dart --reporter expanded
POS_QUOTATION_PNG_DIR='/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Cotizaciones/Evidencia/2026-10-05-fase3/png' flutter test test/presentation/pages/cotizaciones/quotation_ticket_test.dart --plain-name 'PNG incluye todas las filas; exporta cotización y recibos para inspección' --reporter expanded
dart analyze
flutter test --reporter expanded
git diff --check
git diff --exit-code -- lib/application/commands/ventas/venta_command_service.dart lib/application/sync/payloads/venta_confirmada_payload.dart lib/application/sync/payloads/confirmed_sale_line.dart
```

- Fases 1/2 revalidadas: **77 aprobadas**, 0 fallos.
- Navegación/SQLite/reinicio: **4 aprobadas**, 0 fallos.
- Regresión enfocada de cotizaciones, Caja, escaneo, recibos y menú: **165
  aprobadas**, 0 fallos. Después se añadió la prueba responsive de UUID/nombres
  largos/texto ampliado, incluida en la suite completa final.
- Exportación PNG: **1 aprobada**, cinco PNG generados e inspeccionados.
- Analyze final: **No issues found!**.
- Suite completa final: **1244 aprobadas, 1 omitida, 0 fallos**, 49 s, exit 0.
  Son **34 pruebas nuevas** respecto a las 1210 de fase 2.
- La omisión preexistente requiere `POS_PHASE3_SYNC_URL` con servidor aislado
  Nest/PostgreSQL; no se configura para una fase local de cotizaciones.
- Diff check correcto y archivos/contratos de confirmación sin diff.

Logs finales: `fases1-2-revalidadas.log`, `navegacion-sqlite.log`,
`pruebas-enfocadas.log`, `exportacion-png.log`, `dart-analyze.log`,
`flutter-test.log`. Los tests de UI usan `closeStreamsSynchronously` en su
conexión SQLite temporal para que los timers de caché de Drift no queden
pendientes al desmontar widgets; no cambia las conexiones de la aplicación.
El reinicio UI cierra/reabre un archivo SQLite temporal. El arranque normal,
reset y restore siguen cubiertos por las pruebas de respaldo de fases 1/2.

### Evidencia visual y cobertura del criterio

Los originales están en `Evidencia/2026-10-05-fase3/png/`; el reporte
`Evidencia/2026-10-05-fase3/inspeccion-visual.md` contiene dimensiones,
SHA-256 y observaciones. Se inspeccionaron los cinco archivos completos:

- `cotizacion-quotation-1.png`: **880 × 1246**, tres filas, precio/cantidad
  medidos, total $245.00 y leyenda sin datos de cobro.
- `cotizacion-muchas-lineas.png`: **880 × 4046**, 18 filas sin truncamiento,
  nombres largos completos, total $1470.00 y margen/leyenda completos.
- `recibo-cash.png`: **880 × 4466**, 18 filas, resumen de 12 pzas · 4.500 kg ·
  1.500 L; total $1470.00, recibido $1570.00 y cambio $100.00.
- `recibo-transfer.png`: **880 × 4436**, referencia SPEI-2026 y transferencia
  recibida $1470.00, sin efectivo/cambio.
- `recibo-credit.png`: **880 × 4436**, cliente con nombre largo y cargo a la
  cuenta $1470.00, sin efectivo/cambio.

| Casos | Resultado del tramo de fase 3 | Evidencia |
|---|---|---|
| C01 | Aprobado | Cotizar vacío/sin revisión deshabilitado; core revalidado |
| C05 | Aprobado | Doble guardar/apertura, intención estable y consulta vinculada sin nueva cotización |
| C06 | Aprobado | Archivo SQLite cerrado/reabierto; ticket por ID y bytes iguales; historial por repositorio persistido |
| C07–C08 | Aprobado | Guardar real y Nueva captura; cancelar compartir no limpia; ausencia de efectos del core revalidada |
| C09 | Aprobado | Drawer cerrado, nueva pantalla, filtros; Home y borrador reales |
| C10–C12 | Aprobado | PNG idéntico tras editar captura/catálogo y reiniciar; modelo/PNG sin cobro/costos; cinco visuales inspeccionados |
| C13 | Aprobado | Carga/vacío/error/reintento, filtros conservados y UUID/texto ampliado |
| C14–C15 | Aprobado | Espera commit, dobles pulsaciones, intención al reintentar, aviso y draftAvailable |
| C17–C19 | Aprobado | Nombre/causa de línea incompatible y otra captura, documento intacto; core transaccional revalidado |
| C20 | Aprobado | Recuperar y Continuar regresan al mismo estado Home, Caja y borrador; ID/revisión/edición conservados |
| C21/C23 | Aprobado | Stream real pasa a Vendida tras cobrar; acción ausente; consulta de cotización y recibo vinculado |
| C26 | Aprobado | Nueva captura envía revisión, error no cierra; core de ausencia/no-op revalidado |
| C29 | Aprobado | Editar venta conserva PNG emitido tras reinicio; core de cobro inmutable revalidado |
| C35 | Automatizado aprobado; nativo pendiente | Mismo PNG/nombre por Compartir/WhatsApp, cancelación/error/reintento sin entrega ni limpieza; falta selector real |
| C36 | Aprobado | Operaciones pendientes, callbacks de dispose/ruta cubierta, sin segundo Home, regresiones completas |

Los demás casos conservan su resultado del core en fases 1/2; esta fase no
pretende cerrar toda la matriz de sesión 4.

### Salida y pendientes

El criterio de salida de fase 3 está satisfecho en implementación, pruebas de
widgets/SQLite y evidencia visual: menú/historial nuevo, documentos accesibles
tras reinicio, recuperación y continuación sin duplicar Home/captura, bloqueo
de Vendida, PNG histórico inmutable y flujos anteriores sin regresiones.

Pendiente para sesión 4: validar en tablet/dispositivo disponible el selector
nativo de compartir, WhatsApp, cancelación y manejo de errores del plugin
(C35). Los fakes verifican parámetros y comportamiento de la app, pero no
prueban entrega real. También siguen los pendientes físicos de cámara/escaneo
ya registrados en su roadmap; no pertenecen a esta fase. Impresión física,
edición de cotizaciones, sync remota y NestJS permanecen fuera de alcance.


## Verificación y cierre de sesión 4 — 2026-10-05

**Implementación completa conforme a revisión 2.** Persistencia, historial,
ticket, recuperación/continuación y cobro están implementados y probados.
C01–C34 y C36 están aprobados. C35 está aprobado en widgets y selector real de
macOS (cancelación, reintento y regreso); queda el tramo móvil con WhatsApp y
los errores del selector/plugin en hardware. Ese pendiente nativo se separa
del cierre funcional; no se afirma entrega a destinatarios ni impresión física.

### Auditoría, cambios y preservación

Se leyeron AGENTS del análisis/Flutter, las dos guías offline de Flutter,
flujo local/idempotencia, plan revisión 2, matriz, continuidad y las cuatro
notas de sesiones. Se contrastaron los tests y logs de fases 1–3 con la matriz.
La suite completa final revalida esos tests; no se volvieron a implementar sus
entregas ni se regeneraron PNG ya verificados cuyo dibujo sigue sin cambios.
Se inspeccionaron nuevamente los cinco PNG originales y sus hashes.

Flutter conserva HEAD `56ddbc49f7369b2598aabe3c67b03135b7c89b46`. El árbol inicial
contenía las fases 1–3 sin commit y la adaptación previa de la prueba de
Inventario. Se conservó todo, incluido escaneo/Caja/menú y esquema generado.
No hubo fallos funcionales nuevos ni cambios de código de producto en sesión 4.
Se añadieron **10 pruebas** en:

- `test/application/commands/cotizaciones/quotation_verification_test.dart`.

La prueba compara datos de negocio no vacíos y saldos derivados mediante
`CustomerAccountRepositoryImpl` y `CashRepositoryImpl`; también restaura una
recuperación editada con historial previo. Se corrigieron dos avisos de estilo
del propio test antes de los checks finales. No se cambió el esquema, DAO,
payload de venta ni NestJS; no correspondía regenerar Drift. No se crearon
commits ni despliegues y no se abrió la base de uso.

En el vault se modifica esta continuidad y se añade
`Evidencia/2026-10-05-fase4/`: logs, seis JSON de saldos completos, cuatro
respaldos SQLite con sus JSON/SHA-256, auditoría, entrypoint de ensayo nativo y
registro de cancelación/regreso. `native_probe.dart` es una herramienta de
verificación externa al código distribuido: usa `AppDatabase.forTesting` con
archivo temporal, fixture y pantalla real, sin DI ni servicios de runtime.

### Evidencia SQLite, saldos y efectos de cobro

Todas las bases fueron SQLite reales en memoria o archivos temporales. Los
seis casos nuevos de ambos modos y tres métodos crean antes una venta a
crédito, una en efectivo y otra por transferencia. Dejan pagos/deuda/consumos
ya existentes, fondo de cajón de 20000 centavos y dos recursos con saldos.
Se comparan filas completas de todas las tablas de negocio salvo las escrituras
esperadas de documento/captura/eventos/refs; los snapshots emitidos también
siguen cubiertos por las pruebas previas.

Antes y después de guardar, limpiar y recuperar se conserva el contenido
completo de pagos, deuda/abonos/asignaciones, inventario/balances, caja y finanzas.
La cuenta mantiene saldo **−13401** centavos, cajón esperado **33401**, recurso
por piezas **988** y medido **2750** átomos, tanto físicos como disponibles.
Guardar/recuperar no generan reservas, consumo ni movimientos. El tramo sin
sesión abierta sigue probado por `recuperar_cotizacion_test.dart` y pasa en la
suite final; cobrar efectivo sin sesión sigue rechazado cuando caja está habilitada.

Cobrar la recuperación de tres líneas por 13401 centavos genera una sola vez
los consumos **−1 directo, −3 receta y −750 medido**, dejando saldos **984** y
**2000**. Efectivo/transferencia agregan un pago; crédito agrega una deuda. El
cajón esperado pasa a **46802** sólo con efectivo; transferencia/crédito lo
conservan en 33401. La cuenta pasa a **−26802** sólo con crédito. Reintentar
cobro y reaplicar el handler de confirmación conservan filas y saldos posteriores.
Los JSON `sqlite/saldos-{standalone,serverSync}-{cash,transfer,credit}.json`
contienen contenido antes/después, saldos de repositorios y resultados.

Las pruebas previas revalidadas completan doble pulsación/reintento/colisiones,
revisiones obsoletas, otro borrador vacío o con líneas, fallos inyectados de
segunda línea/vínculo/handler/limpieza y rollback de evento/refs/proyecciones.
También prueban cambios compatibles de consumo, incompatibilidad de medidas,
precios cotizados y venta confirmada pending/conflict/rejected sin otra recuperación.

### Reinicios, respaldo, historial y compatibilidad

Se conservan las pruebas de archivo temporal de fases 1–3: guardar/reabrir y
reproducir PNG por ID, recuperar/editar/reabrir/continuar y confirmar/reabrir.
El nuevo tramo de respaldo usa el arranque normal de `AppDatabase` con
path_provider dirigido a un directorio temporal. Guarda, limpia, recupera,
limpia esa recuperación, recupera con nuevos IDs y edita cantidad a 4; el
documento conserva cantidad 1. En cada modo se prueban En venta y Vendida
(con conflicto de entrega en server_sync).

`VACUUM INTO` y restauración reales recuperan las **29 tablas** de contenido
exactamente iguales, incluidos documento, tres líneas, vínculo actual, captura
editada y dos eventos históricos de recuperación. Reaplicar guardado y la
recuperación anterior no recrea la captura limpiada ni cambia el vínculo.
Continuar conserva la edición; Vendida rechaza recuperar. El segundo arranque
conserva todas las filas y una tabla marcador con valor, demostrando ausencia
de reset. Los cuatro `.sqlite` exportados tienen SHA-256 igual al snapshot,
`integrity_check=ok` y `foreign_key_check=[]`, auditados además fuera de Drift.
Véase `sqlite/auditoria-respaldos.json` y `restore-*.json/.sqlite`.

`schemaVersion` sigue en **8**, sin nueva migración/onUpgrade. La política de
desarrollo de fases 1/2 sigue vigente: una base anterior incompleta se resetea
una vez; una base actual se conserva. Las pruebas existentes de tabla/columna/
índice faltante y respaldo antiguo protegido pasaron. No se garantiza migración
de producción ni restauración compatible de un respaldo antiguo sólo porque
comparta versión 8. Historial local requiere respaldo local; no se añadió sync
remota ni promoción de eventos standalone a pending.

### Modos, dependencias y regresiones

En standalone, guardar/recuperar/limpiar son `not_required`, refs declaradas y
validadas sin filas `event_refs`. `financial_sync_test.dart`, caso «standalone:
finanzas sin refs, not_required y sin monitor de sync», vuelve a verificar el
arranque común sin instanciar `SyncAvailabilityMonitor`: no arranca health,
push, pull, preflight o WebSocket. Se inspeccionó también la rama vigente de
`startConfiguredRuntimeServices`; cotizaciones no cambió ese runtime.

En server_sync, los dos tipos quotation siguen explícitamente `not_required`
aunque se solicite pending, con refs persistidas y fuera de selección de
pendientes. `venta_confirmada` conserva dependencias de catálogo/recursos/
cliente/caja y es elegible como venta; nunca depende de entregar quotation.
La edición/cobro no reescribe documento. Comando y contratos de confirmación
siguen sin diff. La suite final incluye pagos/crédito/caja, menú/Home, gestión,
recibos y escaneo, sin regresiones.

### PNG y comprobación nativa

Se abrieron e inspeccionaron otra vez los cinco PNG de fase 3. SHA-256 idéntico
al reporte previo: cotización corta **880×1246**, larga **880×4046**, recibo
cash **880×4466**, transfer/credit **880×4436**. Se ven las 18 filas completas,
nombres largos, cantidades kg/L/piezas separadas, total 1470.00, leyenda sin
campos de cobro en cotización y resúmenes propios de cada recibo. No se repitió
la exportación porque el dibujo y fixtures no cambiaron. Reporte vigente:
`Evidencia/2026-10-05-fase3/inspeccion-visual.md` y `png/`.

`flutter devices --machine` encontró macOS nativo e iPhone 17 simulado. Se
compiló la app normal en macOS debug; después se ejecutó el entrypoint de
ensayo con **SQLite temporal independiente**, pantalla y plugin reales. Se
abrió el selector desde Compartir y desde WhatsApp, se observó el PNG con
nombre `cotizacion-fb077c1a-1e72-4972-801d-66d6bf51c98a.png`, se cancelaron
ambos (`dismissed`) y se volvió mediante Cerrar. Las 29 tablas quedaron
idénticas a antes de compartir. JSON en `native/share-1.json`, `share-2.json`
y `regreso.json`; detalles en `native/observaciones.md`.

WhatsApp no aparece entre los destinos disponibles de ese selector. No se
seleccionaron destinatarios ni se enviaron archivos. Falta comprobar destino
WhatsApp y errores reales del plugin en tablet/dispositivo móvil; fakes cubren
error/reintento y callbacks desmontados. El ensayo se cerró y se recompiló el
entrypoint normal: el artefacto final macOS corresponde a la app, no al probe.
Impresión física sigue fuera de alcance.

### Comandos ejecutados y resultados finales

Desde `/Users/benjamin/Projects/POS/pos_flutter` (rutas de evidencia siempre
entre comillas por el espacio final de `analisis `):

```sh
flutter devices --machine
dart format test/application/commands/cotizaciones/quotation_verification_test.dart
POS_QUOTATION_VERIFICATION_DIR='/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Cotizaciones/Evidencia/2026-10-05-fase4/sqlite' flutter test test/application/commands/cotizaciones/quotation_verification_test.dart --reporter expanded
dart analyze
flutter test --reporter expanded
flutter build macos --debug
flutter run -d macos --debug -t '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Cotizaciones/Evidencia/2026-10-05-fase4/native_probe.dart'
flutter build macos --debug
git diff --check
git diff --exit-code -- lib/application/commands/ventas/venta_command_service.dart lib/application/sync/payloads/venta_confirmada_payload.dart lib/application/sync/payloads/confirmed_sale_line.dart
```

También se ejecutaron lecturas `rg`/git, SHA-256 de PNG, auditoría Python
`sqlite3` de snapshots y comparación nativa, y acciones UI mediante CUA:
abrir ticket/selector, cancelar, reintentar y regresar/cerrar. Los primeros
ensayos del test nuevo corrigieron uso de API de la propia prueba (refs y
replay directo del handler); no fueron fallos funcionales del producto.
Se reejecutó la suite final después de añadir assertions de los saldos
derivados reales; esa ampliación justificó la segunda ejecución.

| Verificación | Resultado | Archivo de evidencia |
|---|---|---|
| Nuevos tests SQLite/saldos/historia | 10 aprobadas, 0 fallos | `pruebas-cierre.log`, `sqlite/` |
| Analyze final | No issues found | `dart-analyze.log` |
| Suite completa final | 1254 aprobadas, 1 omitida, 0 fallos | `flutter-test.log` |
| Build macOS normal | Éxito; artefacto debug disponible | `build-macos.log`, `build-macos-final.log` |
| Ensayo nativo | Dos dismissals, nombre correcto, SQLite intacta y regreso | `native-run.log`, `native/` |
| Diff check y contratos de venta | Exit 0 | `diff-check.log`, `contratos-venta-sin-diff.log` |

No se detectaron fallos previos ajenos nuevos. Se conserva **una omisión
preexistente** en `test/integration/variant_tracking_server_test.dart`: requiere
`POS_PHASE3_SYNC_URL` apuntando a Nest/PostgreSQL aislados. No se configuró un
servidor para este cierre local. El build inicial mostró un aviso de
`mobile_scanner 7.4.2` sobre API de cámara deprecada; esa versión ya está en
`HEAD:pubspec.lock`, el aviso está en `build-macos.log` y no impidió compilar.
La corrección previa del test de Inventario pertenece a sesión 1 y se conserva.

### Matriz final C01–C36

Los nombres de tests son relativos al proyecto Flutter. Todos los tests
referenciados están aprobados en `Evidencia/2026-10-05-fase4/flutter-test.log`;
las diez pruebas nuevas tienen además log y artefactos propios.

| Caso | Resultado final | Evidencia concreta |
|---|---|---|
| C01 | Aprobado | `cotizacion_command_service_test.dart` rechaza ausente/vacío; `caja_quotation_test.dart` deshabilita |
| C02 | Aprobado | Contratos guardado + comando: piezas/medidas, BigInt, precios, líneas e IDs propios |
| C03 | Aprobado | Comando guardado: propiedad, confirmado, revisión/total obsoletos, sin escrituras |
| C04 | Aprobado | Comando guardado: misma intención, identidad/fecha, reinicio y colisión de contenido |
| C05 | Aprobado | Guardado concurrente/vínculo único; Caja serializa y consulta documento ya vinculado |
| C06 | Aprobado | `quotation_backup_test.dart` y `quotation_navigation_test.dart`: archivo/reinicio/PNG por ID |
| C07 | Aprobado | Comando limpieza y ticket Nueva captura: documento intacto y Disponible |
| C08 | Aprobado | Comparación completa en guardado y nuevo `quotation_verification_test.dart`; cancelaciones nativas sin cambio |
| C09 | Aprobado | `quotations_screen_test.dart` y navegación real Home: menú/drawer/filtros/estados |
| C10 | Aprobado | Guardado/consulta sin catálogo/origen + navegación reiniciada con PNG original |
| C11 | Aprobado | Modelo/test de ticket y PNG original: ID/fecha/MXN/leyenda sin cobro/costo |
| C12 | Aprobado | Cinco PNG de fase 3 inspeccionados nuevamente, hashes iguales, 18 filas sin truncar |
| C13 | Aprobado | Listado: carga/vacío/error/reintento, filtros y lectura sin escrituras |
| C14 | Aprobado | Recuperación concurrente/intención/reintento con ediciones; widget espera commit |
| C15 | Aprobado | Recuperación: IDs nuevos, precio emitido y `priceChanges`; aviso visible |
| C16 | Aprobado | `recuperar_cotizacion_test.dart`: directo→receta, componente cambiado y revalidación al cobrar |
| C17 | Aprobado | Trece incompatibilidades de catálogo/medida y error por línea sin escrituras |
| C18 | Aprobado | Artículo/variante/unidad ausente/inactivo, documento legible y error de detalle |
| C19 | Aprobado | Otro borrador vacío/con líneas preservado; UI y reintento al resolverlo |
| C20 | Aprobado | Continuación sin copiar; navegación devuelve mismo Home/Caja y edición |
| C21 | Aprobado | Guardado + cobro directo del origen: stream Vendida y recuperación bloqueada |
| C22 | Aprobado | Recuperación/limpieza/nuevos IDs; historia restaurada en prueba nueva |
| C23 | Aprobado | Comando rechaza Vendida; acción ausente y recibo vinculado en UI |
| C24 | Aprobado | Venta pending/conflict/rejected sigue Vendida y no se cobra/recupera de nuevo |
| C25 | Aprobado | Fallos inyectados al guardar/recuperar/limpiar: rollback de tablas/evento/refs/vínculo |
| C26 | Aprobado | Revisión esperada rechaza origen editado; ausente no-op preserva otra captura; ticket maneja error |
| C27 | Aprobado | Handler/core + nuevo restore: duplicados, wasCleared, confirmado y vínculo posterior conservados |
| C28 | Aprobado | Reinicio real de recuperación editada/venta; restore y segundo arranque en ambos modos |
| C29 | Aprobado | Editar/cobrar cambia venta; cantidad/documento/PNG emitidos conservados |
| C30 | Aprobado | Directo/receta/medido sin efectos antes de cobro; recuperación sin sesión; restricciones actuales de cobrar |
| C31 | Aprobado | Seis casos nuevos con saldos previos + cobro existente cash/transfer/credit y replay único |
| C32 | Aprobado | Guardar/recuperar/limpiar not_required sin refs; arranque común sin monitor ni servicios sync |
| C33 | Aprobado | Store fuerza quotation not_required y persiste refs; sólo venta usa push/dependencias habituales |
| C34 | Aprobado | Respaldo previo de tres estados + cuatro nuevos con recuperación/historia; SHA/integridad/segundo arranque |
| C35 | Automatizado y selector macOS aprobados; tramo móvil pendiente | Dos selectores/cancelaciones/reintento/regreso con PNG correcto; WhatsApp no disponible, error nativo móvil pendiente |
| C36 | Aprobado | Caja/menú/ticket/listado: operaciones pendientes, dispose/ruta cubierta, mismo Home; suite completa |

### Estado final de las sesiones

1. **Sesión 1 completada y revalidada:** persistencia/guardado, contratos,
   esquema, limpieza y modos con evidencia SQLite.
2. **Sesión 2 completada y revalidada:** recuperación/continuación atómicas,
   precios/revalidaciones, historia, protección de otras capturas y cobro.
3. **Sesión 3 completada y revalidada:** menú/listado/detalle/ticket y retorno
   al Home/Caja existentes, PNG y manejo de errores/callbacks.
4. **Sesión 4 completada en cierre funcional:** matriz, saldos, respaldo,
   reinicios, visuales y regresiones aprobados. Pendiente separado: C35 nativo
   móvil/WhatsApp y errores del plugin en hardware.

No quedan fallos funcionales abiertos ni estructura futura para historial o
recuperación. El siguiente trabajo, si se solicita, es exclusivamente ese ensayo
nativo pendiente. Edición/sync de cotizaciones, NestJS e impresión física no
forman parte de esta entrega.
