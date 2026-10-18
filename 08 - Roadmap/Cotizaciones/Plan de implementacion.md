---
tipo: plan_implementacion
estado: historico_reemplazado_por_revision_3
revision: 2
actualizado: 2026-10-06
---

# Cotizaciones guardadas y recuperación en Caja

> **Documento histórico de revisión 2.** La solicitud del 2026-10-06 reemplaza
> las reglas de guardar/conservar precios. El plan vigente es
> [[08 - Roadmap/Cotizaciones/Sin precios guardados/Plan de implementacion|Cotizaciones sin precios guardados, revisión 3]].
> Usar sus sesiones para la modificación; este contenido conserva la base de
> la implementación anterior y no debe ejecutarse para restaurar precios.

## Objetivo y cambio de alcance

Guardar las cotizaciones como documentos propios del POS, consultarlas desde
una nueva pantalla «Cotizaciones» del menú lateral y recuperarlas para vender.
La solicitud vigente define esa pantalla como listado de cotizaciones que se
pueden recuperar. La creación continúa desde el borrador de Caja.

Esta revisión reemplaza el alcance temporal de revisión 1: ahora incluye
persistencia, historial, reimpresión y recuperación. La generación del PNG ya
no es la operación que guarda el documento. Guardar y recuperar usan comandos
y eventos locales; listar, ver y compartir son lecturas.

Flujo previsto:

```text
Caja → Cotizar → guardar documento → ticket
Menú lateral → Cotizaciones → detalle → Recuperar en Caja
             → borrador de venta → Cobrar → venta confirmada
```

La recuperación prepara una venta; elegir pago y cobrar la confirman. Guardar
y recuperar no crean pagos, deuda, reservas, consumos, movimientos de caja ni
comandas. La cotización permanece consultable después de vender.

## Alcance de esta revisión

1. Cotización persistente con identidad propia y snapshots inmutables de
   nombres, cantidades, unidades, precios e importes.
2. Entrada «Cotizaciones» en el menú lateral que abre una pantalla nueva de
   listado y detalle. Vista inicial «Recuperables» y filtro «Todas».
3. Cotizaciones disponibles recuperables; cotizaciones en captura permiten
   «Continuar venta»; las vendidas siguen visibles en Todas y no se recuperan otra vez.
4. Ticket PNG generado desde el documento guardado, reproducible tras reinicio,
   con compartir/WhatsApp mediante la interacción existente.
5. Recuperación al mismo flujo de Caja y cobro existente, conservando el precio
   cotizado, con nuevas identidades de venta y líneas cuando hace falta crear un borrador.
6. Persistencia local en ambos modos, para el usuario y dispositivo actuales.
   No se incorpora sincronización de cotizaciones entre tablets ni backend.
7. Sin edición/eliminación de cotizaciones, vencimientos, nuevos campos de
   cliente, descuentos, impuestos, pagos mixtos o reembolsos en esta entrega.
   Se puede editar el borrador recuperado con las operaciones existentes.
8. Impresión física como extensión posterior: «Imprimir» está deshabilitado
   en el recibo actual. Generar o compartir no demuestra impresión física.

No borrar la cotización al limpiar un borrador ni después de cobrar. No
promover eventos standalone a pendientes. El historial local no se recupera
desde un bootstrap del servidor: requiere el respaldo local existente.

## Referencias y estado inicial

```text
Análisis:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /
Flutter:
/Users/benjamin/Projects/POS/pos_flutter
Servidor, referencia de confirmación:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest
```

La carpeta `analisis ` termina en espacio. Flutter fue revalidado el 2026-10-05
en HEAD `65c07bc`, con cambios previos de escaneo en Caja, repositorios y pruebas.
La modificación de esta sesión es documental. Conservar esos cambios al implementar.

| Punto verificado | Consecuencia |
|---|---|
| `MenuLateral` cierra el drawer y abre rutas de gestión | Añadir Cotizaciones con el mismo patrón |
| `HomeScreen` selecciona Caja en su navegación inferior | Volver al Home existente y seleccionar Caja después de recuperar; no apilar otro Home |
| `SaleDraftRepository` observa una captura por usuario/dispositivo | Reutilizarla para la venta recuperada |
| `Sales` tiene índice único de borrador activo por usuario/dispositivo | Recuperar no puede sobrescribir ni mezclar otra captura |
| `AgregarProductoBorradorCommand` toma el precio vigente | No recuperar con un bucle de agregar: perdería los precios cotizados |
| `SaleItemSnapshot` conserva importes, medidas y clave de consumo | Guardar esos datos y preparar condiciones operativas vigentes al recuperar |
| `VentaCommandService.confirmar` resuelve consumo al cobrar | Reutilizarlo sin introducir una confirmación alternativa |
| Limpieza borra `sales/sale_items` y conserva eventos locales | La cotización necesita tablas independientes y vínculos que toleren esa ausencia |
| `DriftLocalEventStore` convierte familias desconocidas a pending en server_sync | Declarar explícitamente la nueva familia como exclusivamente local |
| Recibo e imagen dependen de `ConfirmedSale` | Extraer dibujo común sin crear ventas ficticias |

Leer los AGENTS vigentes y las guías `docs/architecture/offline_feature_flow.md`
y `docs/templates/new_offline_feature_checklist.md` de Flutter al empezar.
NestJS no se modifica: la venta confirmada conserva su contrato remoto.

## Guardar desde Caja

1. «Cotizar» requiere borrador no vacío, usuario/dispositivo válidos y ninguna
   operación incompatible pendiente. No exige caja abierta ni método de pago.
2. Crear una identidad de intención estable: quotationId, eventId y fecha de
   emisión. Reintentar la misma intención no genera otra cotización.
3. El comando relee cabecera y líneas en una transacción. Comprueba propiedad,
   actividad, estado borrador, último evento y total vistos. Captura solamente
   líneas activas y valida sumas/rangos con enteros seguros y BigInt.
4. Guarda evento, referencias según modo, cabecera y líneas de cotización de
   forma atómica. Sus precios vienen de la captura; no se sustituyen con los
   del catálogo. El ticket se abre únicamente después del commit.
5. Inicialmente vincula la cotización al borrador origen todavía abierto.
   Esto permite «Continuar venta» y detectar una venta cobrada directamente
   desde ese origen, evitando dejar la cotización recuperable después de vender.
6. Una captura no puede quedar vinculada a dos cotizaciones. Una repetición
   idéntica devuelve la guardada. Otra intención sobre un borrador ya vinculado
   no crea una segunda cotización ni sobrescribe la primera; la UI ofrece
   consultar el documento existente.
7. Compartir, cancelar, cerrar o un fallo al dibujar no eliminan lo guardado.
   El documento sigue disponible en Cotizaciones, aunque no se generó el PNG.
8. «Nueva captura» desde el ticket recién emitido limpia el origen con revisión
   esperada. La cotización queda disponible para recuperar. No esperar al
   selector de compartir para decidir si guardar o limpiar.
9. Si el origen cambió, no limpiarlo desde ese ticket. Si ya se limpió, no-op
   sin afectar una captura posterior. Desde el historial no limpiar un origen
   antiguo por abrir o cerrar su documento.

Los snapshots de cotización no se modifican si después cambia el catálogo o
se edita el borrador vinculado. Reimprimir muestra siempre el documento emitido.

## Listado y detalle

`MenuLateral → QuotationsScreen` abre una pantalla independiente, con título
«Cotizaciones». Lee un `QuotationRepository` local mediante stream, limitado
al usuario/dispositivo actuales. Orden descendente por fecha, con ID como
desempate. Mostrar identificador, fecha, total y estado; detalle con todas las líneas.

| Estado visible | Condición local | Acción |
|---|---|---|
| Disponible | No hay venta activa o confirmada en el vínculo actual | Recuperar en Caja |
| En venta | El vínculo apunta a un borrador activo | Continuar venta |
| Vendida | La venta vinculada está confirmada | Ver cotización y venta; sin recuperar otra vez |

Disponible y En venta forman la vista inicial «Recuperables». Todas también
incluye Vendida. La ausencia de un artículo del catálogo no oculta una cotización:
se sigue viendo/reimprimiendo y recuperar muestra la causa si ya no es viable.

Los estados se derivan de la cotización y la venta vinculada, no de un campo
que la UI cambie al navegar. `confirmada` prevalece aunque la entrega de esa
venta esté pendiente, en conflicto o rechazada. Esas incidencias no habilitan
otra venta ni devuelven la cotización a Disponible.

Incluir carga, lista vacía y error/reintento. Volver del detalle conserva filtros;
guardar, limpiar y cobrar actualizan el listado mediante su observación local.

## Recuperar para vender

1. El comando relee cotización y vínculo bajo transacción, validando propiedad
   y revisión. Si la venta está confirmada, rechaza una segunda recuperación.
2. Si ya existe el borrador vinculado activo, devuelve su ID para continuar,
   sin copiar líneas, sobrescribir ediciones ni crear eventos duplicados.
3. Si la captura anterior fue limpiada, puede recuperar con un saleId nuevo.
   Nunca reutiliza IDs de venta/líneas descartados ni modifica el documento.
4. Si ya existe otro borrador en Caja, conserva ambas cosas y explica que debe
   resolverse esa captura primero. No descarta, reemplaza ni fusiona automáticamente.
   Esta regla también resuelve el caso de un borrador vacío existente.
5. Antes de crear, revalida artículos y variantes activos, modo de venta,
   unidad/código/símbolo/factor y cantidad de referencia. Si cambió la
   interpretación de una medida o falta un artículo, rechaza sin escrituras
   y explica qué línea necesita revisión. La cotización permanece guardada.
6. Conserva cantidades y precios cotizados. Si cambió solo el precio del catálogo,
   no lo sustituye; indica que se usará el precio de la cotización. No añade
   un editor de precios ajeno al flujo existente.
7. El borrador usa la clave de configuración de consumo vigente al recuperar.
   Una cotización no comprometió receta ni existencias. El cobro vuelve a
   revalidar esas condiciones con `VentaCommandService.confirmar`.
8. Guarda un único evento local de recuperación que crea el borrador completo
   y cambia el vínculo actual de la cotización en la misma transacción.
   Solo después del commit navega a la Caja existente.
9. Si falla cualquier paso, no deja un borrador parcial ni un vínculo cambiado.
   Doble pulsación/reintento se serializan y continúan el mismo borrador.
10. Limpiar un borrador recuperado vuelve a dejar disponible la cotización.
    Cobrar lo marca Vendida por la relación con `sales`. Editar cantidades en
    Caja modifica la futura venta, conservando la cotización original.

La intención «convertir en venta» se representa en la UI como «Recuperar en
Caja» para que el usuario revise y cobre. No confirma automáticamente con un
pago ficticio. El importe final de venta puede diferir si se editó la captura.

## Modelo y contratos locales

### Dominio y tablas

Crear `Quotation`, estado derivado y modelos de línea inmutables, separados
de `SaleDraft` y `ConfirmedSale`. Los modelos de dominio no importan Drift
ni payloads de application. Los importes siguen en centavos y las medidas en átomos.

| Tabla sugerida | Datos y reglas |
|---|---|
| `quotations` | CommonFields; usuario/dispositivo, emisión, MXN, total, sourceSaleId/sourceDraftEventId y currentSaleId nullable |
| `quotation_items` | CommonFields; quotationId, orden, identidad de variante y snapshots de nombres, modo, cantidades, precio, importe y unidades |

Las líneas de cotización tienen IDs nuevos, distintos de las del borrador.
El vínculo línea-cotización tiene integridad referencial. IDs del borrador
origen, su evento y currentSaleId son trazabilidad sin FK que impida limpiar
`sales`. Los datos del documento no dependen de un JOIN al catálogo para leerlos.

Definir índice de listado por usuario/dispositivo/fecha y unicidad de
currentSaleId no nulo entre cotizaciones activas. Ese vínculo identifica la
única cotización asociada a una captura. No borrar la cotización al desaparecer
la captura; una recuperación posterior reemplaza solo el vínculo actual y
deja trazabilidad de los intentos anteriores en los eventos.

No persistir un estado Vendida separado que pueda desincronizarse de `sales`.
El repositorio deriva Disponible/En venta/Vendida y observa ambas tablas.

### Eventos

| Evento | Contrato y efecto |
|---|---|
| `cotizacion_guardada` | aggregate_type quotation, aggregate_id quotationId, base_version 0; snapshot completo, IDs de líneas nuevos, origen/revisión y total; crea cotización y vincula el origen |
| `cotizacion_recuperada` | Mismo agregado, base_version de cotización actual; saleId y líneas nuevos con snapshots operativos validados; crea borrador y sustituye currentSaleId |

Cada evento tiene payload tipado con constantes, `fromJson/toJson`, validaciones
y refs declaradas/validadas. El handler de recuperación crea la versión inicial
del borrador en 1; no copia a la venta el base_version del agregado quotation.
Usa su eventId como lastEventId del nuevo borrador para la revisión posterior.

Refs de guardado: affects de cotización/líneas y uses del origen. Refs de
recuperación: affects de cotización, venta y líneas; uses de artículos,
variantes/unidades realmente utilizadas. Ambas familias son `not_required`
en ambos modos y solo server_sync persiste esas refs.

Idempotencia: un eventId aplicado no reaplica; misma intención devuelve resultado
original; colisión con contenido diferente se rechaza. Reaplicar una recuperación
antigua no resucita una venta limpiada, reabre una confirmada, cambia un vínculo
posterior ni duplica líneas. Consultar `wasCleared(saleId)` y respetar versiones.

Extender explícitamente la clasificación local de `DriftLocalEventStore` para
los dos event types del agregado quotation. No basta asignar not_required en
el comando: hoy un tipo desconocido se convierte en pending en server_sync.
Registrar payloads/handlers en EventProcessor y auditar consumidores por tipo.

La confirmación sigue siendo `venta_confirmada` con sus dependencias habituales
de catálogo y recursos. No añade una dependencia remota a una cotización local
ni cambia el payload de NestJS. La procedencia queda en el vínculo local y
los eventos de recuperación.

### Comandos y datos

`CotizacionCommandService.guardar/recuperar` usa puertos de proyección,
contexto y unidad de trabajo común sobre SQLite. No escribe desde widgets ni
llama repetidamente a agregar con precios vigentes. Implementar DAOs, repositorio,
mapeos y DI con una clase principal por archivo.

Conservar `expectedDraftEventId` opcional en el comando existente de limpieza,
validado dentro de su transacción antes de escribir. El ticket inicial siempre
lo envía. La desaparición del borrador conserva el documento y el vínculo
histórico; no requiere un evento adicional para actualizar el estado derivado.

### Esquema, respaldo y modos

Esta revisión sí requiere tablas Drift y regeneración con
`dart run build_runner build`. Seguir AGENTS de desarrollo: mantener schemaVersion
fijo y política de reset vigente; no añadir onUpgrade por esta entrega. Probar
en bases temporales y documentar qué datos previos se reinician. La preservación
mediante migración en una instalación de producción requiere un alcance explícito.

Auditar respaldo/restauración y detección de esquema para que un respaldo del
esquema actual incluya cotizaciones, líneas, vínculos y eventos; probar reinicio
sin reset de una base ya actualizada. No borrar tablas locales de cotización
al recibir eventos normales de pull ni asumir que el servidor las reconstruirá.

| Modo | Comportamiento |
|---|---|
| standalone | Eventos not_required, sin filas event_refs ni push/pull/preflight/health/WebSocket |
| server_sync | Cotizaciones y recuperaciones locales not_required, refs persistidas; solo el cobro usa la sincronización habitual de ventas |

No hay endpoints ni tablas nuevos en NestJS en esta revisión. Una futura
sincronización de cotizaciones deberá diseñar contrato, conflictos, bootstrap
y recuperación entre tablets; no convertir el historial local silenciosamente.

## Ticket y navegación

Compartir dibujo entre recibo y cotización mediante datos de ticket independientes
de ConfirmedSale. La cotización se carga por quotationId desde su repositorio:
fecha/identidad son las guardadas y los reintentos no emiten otro documento.
PNG con COTIZACIÓN, ID, fecha, MXN, filas, total y «No representa un pago ni
reserva existencias». Omitir pago, recibido, cambio, deuda y costos internos.

Conservar SaleReceiptScreen y recibos de efectivo, transferencia y crédito.
Compartir/WhatsApp usa `cotizacion-ID.png`; no inferir entrega del selector.
Callbacks tardíos no navegan ni actualizan widgets desmontados.

La ruta del historial devuelve a Home un resultado de recuperación o utiliza
un callback explícito del menú para seleccionar Caja. No crear otro Home ni
otra captura en memoria; Caja observa el borrador ya comprometido en SQLite.
`Continuar venta` usa la misma navegación y el mismo ID.

## Sesiones

Cuatro sesiones secuenciales, combinables en una sola manteniendo sus salidas.

| Sesión | Entrega | Criterio de salida |
|---|---|---|
| [[08 - Roadmap/Cotizaciones/Sesiones/01 - Persistencia y guardado\|1. Persistencia y guardado]] | Contratos, tablas, DAO/repo, guardar, clasificación local y limpieza segura | Documento durable sin efectos de venta; eventos/refs correctos por modo |
| [[08 - Roadmap/Cotizaciones/Sesiones/02 - Recuperacion a venta\|2. Recuperación a venta]] | Comando/evento transaccional, vínculo, revalidaciones y estados | Recuperar preserva precio y no pisa otra captura; cobrar/limpiar determina estado |
| [[08 - Roadmap/Cotizaciones/Sesiones/03 - Historial y ticket\|3. Historial y ticket]] | Menú, listado/detalle, guardar desde Caja, PNG, compartir y navegación | Cotizaciones accesibles tras reinicio y recuperables desde la pantalla nueva |
| [[08 - Roadmap/Cotizaciones/Sesiones/04 - Verificacion y cierre\|4. Verificación y cierre]] | Matriz completa, respaldo, visuales y regresiones | Evidencia por caso y límites registrados |

Prompt conjunto:

```text
Implementa cotizaciones guardadas y recuperables en /Users/benjamin/Projects/POS/pos_flutter.
Lee AGENTS y guías offline vigentes. La documentación está en:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Cotizaciones/

Usa revisión 2 de Plan de implementacion.md, Casos de aceptacion.md,
Estado y continuidad.md y las cuatro notas de Sesiones. Completa las sesiones
1 a 4 en orden, aprovechando trabajo ya verificado y conservando cambios previos.

Entrega guardar desde Caja, historial local en Cotizaciones del menú lateral,
detalle/reimpresión/compartir y recuperar o continuar un borrador en Caja.
Conserva precios cotizados, revalida catálogo, evita sobrescribir otra captura
y duplicar una venta. La cotización persiste al limpiar y cobrar.
Solo Cobrar genera pagos/deuda, consumo y caja. Mantén eventos de cotización
y recuperación not_required en ambos modos, refs solo en server_sync.
No implementes sync de cotizaciones, NestJS, impresión física o edición de documentos.

Regenera Drift si cambia, ejecuta dart analyze y flutter test, verifica
respaldo/reinicio y PNG. Actualiza continuidad con evidencia por C01–C36.
```

La matriz canónica está en
[[08 - Roadmap/Cotizaciones/Casos de aceptacion|Casos de aceptación]].
Cada sesión incluye pruebas de su responsabilidad. Registrar resultado y
siguiente paso en
[[08 - Roadmap/Cotizaciones/Estado y continuidad|Estado y continuidad]].

## Extensiones posteriores

Impresión física: definir plataforma/impresora/conexión/ancho, conectar al
documento guardado y verificar en hardware. Los reintentos no guardan otra
cotización ni confirman una venta.

Sincronización, edición/anulación de cotizaciones y vigencia requieren contratos
adicionales. Guardado, historial y recuperación ya forman parte de esta revisión
y no deben posponerse a una extensión.
