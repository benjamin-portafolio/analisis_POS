---
tipo: plan_implementacion
estado: planificado
revision: 1
actualizado: 2026-10-18
---

# Edición masiva y recepción de mercancía

## Objetivo confirmado

Implementar en Gestión del inventario el flujo mostrado en el video: buscar,
editar varias variantes, destacar cambios, filtrar los modificados y revisar
antes de guardar. Ofrecer dos vistas del mismo borrador:

1. **Por tarea:** precio de venta, costo/proveedor o agregar existencias.
2. **Recepción compacta:** costo estándar y precio de venta en la primera
   línea; existencias y cantidad a agregar en la segunda. Proveedor común
   para la captura, con posibilidad de cambiarlo en el detalle de una fila.

El usuario aceptó ambas distribuciones y pidió agregar precio de venta a
recepción compacta. Cambiar el costo no recalcula automáticamente la venta.
Un costo capturado con proveedor actualiza el costo estándar y el precio de
esa pareja variante/proveedor; agregar existencias registra una entrada.

Esta entrega contiene el plan, no la implementación. Las reglas de
concurrencia, recuperación y alcance siguientes son decisiones de ingeniería
propuestas para ejecutarlo; no son requisitos adicionales atribuidos al usuario.

## Referencias y estado inspeccionado

- Flutter: `/Users/benjamin/Projects/POS/pos_flutter`, HEAD `e5d9c7b`.
- Backend: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`, HEAD `dcc2907`.
- Análisis: este vault, HEAD `b077dc7` antes de añadir estos documentos.
- Video: `/Users/benjamin/Downloads/Archivos-del-celular/Screenrecorder-2026-10-18-10-14-05-789.mp4`.
- Boceto explorado: `/Users/benjamin/.codex/visualizations/2026/10/18/01a14fd7-9448-7200-b72c-650f70412dfa/edicion-masiva-movil.html`.

El boceto ilustra distribución e interacción; este documento precisa las
reglas de guardado. Releer Git al iniciar cada sesión: hay trabajo ajeno en
Flutter sobre CSV, lector de Caja y pruebas, y evidencia/continuidad del CSV
en el vault. Preservarlo. No asumir que esos HEAD describen todo el árbol.

| Pieza actual, rutas relativas a Flutter | Uso y límite |
|---|---|
| `lib/presentation/pages/gestion_inventario/widgets/inventory_add_options_bottom_sheet.dart` | «Edición masiva» existe con callback nulo; conectar al completar el recorrido |
| `lib/presentation/pages/gestion_inventario/inventory_management_screen.dart` | Navegación y DI del acceso; mantener coordinación en archivos propios |
| `lib/domain/repositories/producto_repository.dart` | Detalle y búsqueda actuales; evaluar lectura específica para listados grandes |
| `lib/application/commands/articulos/producto_command_service.dart` | Edición completa y asignación acotada de barcode; no acepta todavía esta intención masiva |
| `lib/application/sync/payloads/producto_actualizado_payload.dart` | Snapshot completo, base y comparación; venta/costo/proveedores caben en un evento por producto |
| `lib/data/local/drift/tables/variant_suppliers.dart` | PK variante/proveedor, precio y fecha; no hay proveedor principal |
| `lib/application/commands/inventario/inventory_command_service.dart` | Registra entradas; el comando actual no recibe la base confirmada por esta pantalla |
| `lib/application/sync/payloads/inventory_movement_payload.dart` | `stock_receipt` positivo; costo real del movimiento sigue siendo null |
| `lib/application/sync/local_event_store.dart` | Capacidad de transacción exterior y aplicación atómica de varios eventos |
| `lib/data/local/drift/drift_local_event_store.dart` | Implementa esas capacidades en la misma SQLite y aplica política de modos |

NestJS ya aplica producto/proveedores y movimientos mediante contratos
existentes, con transacción **por evento**, no por captura completa. Se
inspeccionaron `src/sync/producto-event.handler.ts`,
`src/sync/inventory-event.handler.ts`, `src/sync/sync.service.ts` y sus payloads.
No se ejecutaron pruebas durante esta planificación.

## Alcance de la primera entrega

- Editar venta y costo estándar de variantes activas de productos activos.
- Agregar o actualizar precio del proveedor seleccionado conservando los demás.
- Registrar entradas positivas sobre recursos ya vinculados directamente.
- Compartir cambios entre vistas, búsquedas y el filtro «Solo cambios».
- Revisar todo el borrador y reportar resultados por producto/variante.
- Recuperar una ejecución ya confirmada y reintentar sin duplicar entradas.
- Funcionar offline en ambos modos mediante los contratos vigentes.

Quedan fuera altas/bajas de productos o proveedores desde esta pantalla,
retirar relaciones, proveedor principal, cambiar recetas o seguimiento,
ajustes negativos, conteos físicos, conversiones de cajas/paquetes, compras,
gastos, costo real por entrada, recálculo automático de venta y cambios al
protocolo o infraestructura remota. El catálogo de proveedores actual se
reutiliza. La cámara y el lector físico de esta pantalla son ampliaciones
posteriores; la búsqueda inicial es por artículo/variante.

## Reglas de captura y borrador

1. Identificar por `productId`/`variantId`, nunca por nombre o posición visual.
   Una variante aparece una sola vez en el borrador; editar otra vez sustituye
   su intención pendiente, sin acumular dos entradas por cambiar de vista.
2. Precargar venta/costo actuales y mostrar unidad o cantidad de referencia.
   Campo sin tocar significa conservar. Borrar un importe informado produce
   error en esta primera entrega; no convertir vacío a cero ni retirar costo
   accidentalmente. Un costo desconocido vacío sin tocar sigue desconocido.
3. Venta debe ser positiva. Costo admite cero explícito. Normalizar importes
   a unidad menor sin `double`; respetar los límites seguros del contrato.
4. El proveedor del encabezado es el predeterminado para **nuevas capturas**
   de costo. Cambiarlo no reasigna filas ya capturadas: cada intención conserva
   su proveedor y el detalle permite modificarlo explícitamente. La revisión
   muestra el proveedor efectivo de cada fila.
5. Editar solo venta o cantidad no crea relaciones ni refresca precios/fechas
   de proveedor. Capturar costo con proveedor expresa actualizar ambos datos;
   sin proveedor expresa actualizar solo el costo estándar.
6. Elegir explícitamente otro proveedor para una fila permite agregar/actualizar
   esa pareja usando un costo informado, incluso si coincide con el estándar.
   Nunca retirar los otros proveedores. Una selección global aislada no escribe.
7. Usar una fecha informada visible, inicialmente la fecha local de captura,
   editable desde el detalle. Serializarla a UTC. Si la pareja ya tiene el
   mismo precio, conservar su fecha actual, como hace el contrato existente.
   Precio nuevo o pareja nueva usa la fecha capturada; abrir/revisar no la cambia.
8. Cantidad vacía o cero significa sin entrada; negativos e importes inválidos
   son error. Una entrada efectiva es positiva y usa `InventoryQuantityCodec`
   y la unidad real del recurso. No escribir el saldo final como cantidad.
9. Sin seguimiento directo o con receta, deshabilitar la entrada y explicar
   dónde gestionar los recursos. Permitir los cambios comerciales de esa fila.
10. En venta medida, costo estándar, precio de venta y precio del proveedor
    mantienen la misma cantidad de referencia del producto; el ingreso usa la
    unidad del recurso. Mostrar ambas bases si difieren, sin inventar empaques.
11. Cambiar búsqueda, filtro o vista conserva texto, selección y errores. No
    generar eventos al escribir. Antes de confirmar, el borrador es de pantalla;
    salir con cambios ofrece continuar o descartar. No se promete recuperar
    un borrador sin confirmar tras cerrar el proceso.
12. No aplicar ningún cambio mientras haya errores en la revisión inicial.
    Corregirlos o retirar explícitamente las filas correspondientes. La unidad
    de guardado posterior es el producto completo, incluidas sus variantes.

## Concurrencia y revisión

- Capturar la base del producto al iniciar sus cambios. Para entradas capturar
  vínculo variante/recurso, unidad, base del recurso y revisión del saldo.
- Preparar una lectura consistente antes de la revisión final. Mostrar cambios
  comerciales antes/después y saldo actual + entrada = saldo previsto.
- Un cambio externo de base, actividad, vínculo, unidad o saldo invalida esa
  propuesta. Mantener lo escrito, mostrar el estado nuevo y exigir revisarlo
  y confirmarlo otra vez. No cambiar silenciosamente la base confirmada.
- El command service vuelve a validar dentro de la transacción. Un eco que
  acredita la secuencia de la misma base se resuelve con los mecanismos
  existentes; no inventar otra política de versiones.
- Varias variantes del mismo producto se agrupan en una actualización. No
  permitir que una fila inválida deje aplicado solo parte de ese producto.

## Arquitectura de escritura

### Edición comercial acotada

Crear una intención de edición comercial por producto, en
`application/commands/articulos`, procesada por `ProductoCommandService`.
Transportar IDs, base esperada y cambios explícitos de las variantes. El
nombre definitivo de las clases se resuelve al implementar.

Dentro de la transacción leer el snapshot completo y superponer solo venta,
costo y la pareja de proveedor indicada. Conservar variantes omitidas, orden,
nombres, categoría, barcodes, configuración de venta, recetas, recursos,
memoria de seguimiento y demás proveedores/precios/fechas. Preservar el
conocimiento legado de proveedores cuando no se tocan; para incorporar una
relación usar la transición canónica admitida por el contrato, sin mezclar
snapshots conocidos y desconocidos.

Usar contratos tipados y `sameState` como comprobación final: un producto
comercialmente modificado genera un `producto_actualizado`; uno idéntico no
genera eventos, versiones, refs ni respaldos. No pasar formularios parciales a
comandos de alta ni reconstruir existencias iniciales.

Devolver un resultado tipado con el ID del evento emitido, o la omisión sin
evento. La variante de comando de entrada devuelve también sus IDs. El diario
usa esos resultados dentro de la transacción; no infiere los eventos leyendo
«el último» después de guardar ni modifica las respuestas de otros recorridos
sin necesidad.

### Coordinación de recepción

Agregar un command service de edición masiva que coordine los comandos de
producto e inventario. La UI envía intenciones y observa resultados; no
importa Drift ni llama comandos por fila mientras la persona escribe.

Por cada producto confirmado, en una **transacción exterior real**:

1. Consultar primero la operación estable: si ya terminó con la misma intención,
   devolver los eventos originales sin ejecutar otra vez ni exigir la base vieja.
2. Comprobar modo, identidad, actividad, bases, pertenencia y vínculos confirmados.
3. Aplicar un evento de catálogo si hay diferencias comerciales.
4. Aplicar un `movimiento_inventario_registrado` de tipo `stock_receipt` por
   recurso con entrada, validando la base esperada. Extender la intención de
   inventario o agregar una variante acotada del comando actual; no aceptar
   automáticamente la base más reciente sin la comprobación de revisión.
5. Registrar los IDs/resultados de la operación en la misma transacción.

Un fallo revierte catálogo, entradas, eventos, refs y respaldos de ese producto.
Los demás productos se procesan secuencialmente y su resultado se informa.
No paralelizar escritores SQLite. Reintentar solo fallidos/no ejecutados;
los ya confirmados localmente quedan excluidos de una nueva ejecución.
No usar el fallback serial de `appendAndApplyAll` como garantía de atomicidad:
este recorrido exige las capacidades transaccionales reales del adaptador.

### Recuperación e idempotencia de la captura

Deshabilitar doble toque es insuficiente ante un cierre después del commit y
antes de mostrar éxito. Proponer un diario local de operaciones confirmadas,
con un puerto de aplicación y adaptador Drift, separado de eventos de negocio.

- Una fila por producto/operación, con `operationId` estable, `batchId`, modo,
  producto, intención normalizada, bases, estado local, IDs de eventos y fechas.
  Reservar el conjunto confirmado antes de comenzar; no persistir el borrador
  de cada pulsación. Garantizar unicidad por operación y por producto/captura.
- Guardar el resultado final junto con los eventos, en la misma SQLite y
  transacción. Estado «aplicada localmente» no significa «aceptada por servidor».
- Repetir la misma operación devuelve su resultado; reutilizar su ID con otra
  intención falla. Comparar la solicitud canónica, no el saldo resultante.
- Tras reabrir, presentar las capturas confirmadas incompletas y permitir
  continuar tras revalidar; no ejecutarlas automáticamente al arrancar.
  Si hay que modificar una propuesta obsoleta, crear una nueva revisión/ID y
  cerrar explícitamente la anterior sin volver a ejecutar las partes aplicadas.
- El diario no viaja al servidor ni crea `event_refs`. Es metadato de ejecución,
  no una proyección sincronizable: documentar la excepción a `CommonFields`.
  No borrar automáticamente la evidencia que protege contra reintentos.
- No cambiar tablas comerciales. Para esta tabla local, seguir AGENTS:
  `schemaVersion` fijo, sin `onUpgrade` y regenerar Drift. La reapertura de
  prueba debe conservar la misma base aislada; un reset de desarrollo elimina
  también este diario y no acredita recuperación tras cierre.
- Registrar tabla/DAO y exigir su presencia en `hasCurrentAppDatabaseSchema`:
  el arranque actual conserva esquemas vigentes y reinicia los anteriores.
  Probar que un esquema previo sigue el reset permitido y el nuevo se conserva
  al reabrir. Verificar el respaldo/restauración vigente respecto al diario,
  sin añadir otro sistema de backup ni migración.

## Modos y límite remoto

- Comandos declaran y validan `LocalEventRef` en `standalone` y `server_sync`.
- `standalone`: aplicar proyecciones, `delivery_status = not_required`, cero
  filas en `event_refs` y cero push/pull/preflight/health/WebSocket.
- `server_sync`: persistir refs y usar bases, dependencias, capability de
  proveedores, entrega, revalidación y restauración ya implementadas.
- Una captura reservada en otro modo no se ejecuta automáticamente. No
  promover/importar historial standalone ni reconstruir sus referencias.
- La atomicidad local por producto **no se extiende al servidor**: catálogo y
  movimientos siguen siendo eventos independientes. La revisión de resultados
  debe distinguir pendiente, aceptado y conflicto/rechazo para cada parte.
- Si el servidor acepta la entrada y rechaza el catálogo, resolver el catálogo
  sin crear otra entrada. Si acepta catálogo y rechaza entrada, mostrar el
  resultado correspondiente y usar la restauración vigente. Un reintento HTTP
  reenvía eventos existentes, no vuelve a invocar el comando de recepción.
- No introducir una falsa dependencia catálogo→movimiento que el contrato
  actual no representa, ni prometer una recepción remota indivisible.
- No se planifica código funcional NestJS ni otro protocolo. La fase final
  verifica la compatibilidad existente con datos aislados. Una necesidad de
  cambiar semántica remota se documenta en una revisión de alcance antes de
  implementarla. `total_cost_minor` sigue null; no deducir costo real de compra.

## Interfaz y comportamiento móvil

- Una pantalla, un controlador de borrador y una revisión compartidos. Dos
  composiciones de filas; evitar dos implementaciones del guardado.
- Buscar artículo/variante, «Solo cambios», contador de variantes modificadas
  y resultado agrupado por producto. Conservar la selección fuera del filtro.
- Por tarea: un valor editable por fila. Costo permite proveedor predeterminado
  y detalle de la fila; la entrada muestra su unidad y suma prevista.
- Recepción compacta: costo y venta juntos; entrada y saldo debajo. Mantener
  proveedor común fuera de las filas y mostrar excepciones en el detalle.
- Venta se precarga y solo cambia por edición explícita. Resaltar diferencias
  con texto además de color. No mostrar margen ni recálculos no solicitados.
- Listado perezoso, controladores por ID y foco estable al filtrar/actualizar;
  no reconstruir todos los campos en cada pulsación ni perder selección.
- Teclado numérico/decimal según campo, acción Siguiente y desplazamiento al
  campo enfocado. Acción de revisión accesible con teclado abierto, respetando
  `viewInsets`, sin cubrir entradas ni reducir el tamaño de toque.
- Al guardar, bloquear doble confirmación y publicar avance tras cada commit
  o rollback. Cancelar detiene productos todavía no iniciados; no deshace
  commits. Una salida espera la transacción activa y presenta su resultado.
- Conectar «Edición masiva» al completar ambas vistas y el recorrido de
  revisión/recuperación. No habilitar una pantalla que todavía guarda a medias.

## Relación con la actualización por CSV

El [[08 - Roadmap/Actualizacion de productos por CSV/Estado y continuidad|trabajo CSV]]
tiene contrato/detección implementados; comandos y lotes seguían pendientes
al planificar. Releer su estado antes de modificar `ProductoCommandService`.

Compartir únicamente una implementación real de superposición comercial,
construcción de snapshots, bases y no-op cuando ambos recorridos la necesiten.
No crear dos escritores incompatibles ni forzar a este flujo a esperar las
fases restantes del CSV. Cada caso de uso conserva sus reglas: este plan
recibe entradas y proveedor; el CSV vigente no modifica ninguno de los dos.
El diario de recepción y su transacción por producto no sustituyen los lotes
de hasta 50 productos definidos para CSV. Evitar refactors amplios preventivos.

## Sesiones y criterios de salida

Seis sesiones secuenciales recomendadas. Pueden realizarse en una sola sesión
larga conservando el orden y las verificaciones; dividir por criterios de
salida, sin estimaciones horarias ni aprobación ficticia por agotar una sesión.

| Sesión | Entregable | Criterio de salida |
|---|---|---|
| [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Sesiones/01 - Contrato y borrador\|1. Contrato y borrador]] | Intenciones, bases, lectura y borrador compartido | Cambios por ID, unidades, proveedor por fila y revisión sin escrituras probados |
| [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Sesiones/02 - Edicion comercial\|2. Edición comercial]] | Comando acotado de venta/costo/proveedor | Un evento por producto, conservación exacta y no-op real en SQLite |
| [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Sesiones/03 - Recepcion y reintentos\|3. Recepción y reintentos]] | Transacción por producto, diario y recuperación | Fallos inyectados, doble ejecución y cierre/reapertura no duplican entradas |
| [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Sesiones/04 - Interfaz por tarea\|4. Interfaz por tarea]] | Vista por tarea conectada al core | Búsqueda, foco, cambios, errores y revisión compartidos, acceso aún interno |
| [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Sesiones/05 - Recepcion compacta y revision\|5. Recepción compacta y revisión]] | Vista compacta con venta/costo/entrada y recorrido público | Cambiar vistas conserva borrador; revisión y resultados completos; menú habilitado |
| [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Sesiones/06 - Verificacion y cierre\|6. Verificación y cierre]] | Regresión, compatibilidad, rendimiento y prueba física | Matriz resuelta con evidencia y límites pendientes explícitos |

Si se agrupa trabajo, combinar 1+2 y 4+5 es razonable. Mantener los criterios
de la sesión 3 como hito propio por el riesgo de duplicar movimientos.

## Verificación y cierre

La [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Matriz de aceptacion|matriz M01–M48]]
es la referencia de aceptación. Usar SQLite real para integridad, rollback,
modos, diario y reapertura; mocks solo para condiciones de UI/errores concretos.
Para remoto usar el arnés existente HTTP/PostgreSQL con bases sintéticas y
dos SQLite, sin datos del usuario ni despliegue. Registrar aceptación parcial,
reconexión y reintento de eventos; no sustituirlos por pruebas solo de parser.

Cada sesión con cambios funcionales ejecuta `dart analyze` y `flutter test`.
Si cambia Drift: `dart run build_runner build`. Verificar limpieza y
`git diff --check`. Una modificación eventual de tests/arnés NestJS requiere
los checks pertinentes; no ejecutar herramientas que reformateen todo el repo.

Probar anchos 320/360/390 y tablet, teclado abierto, nombres largos, accesibilidad
y salto entre campos. En móvil físico registrar modelo, SO y build; una captura
de escritorio no acredita teclado, foco ni rendimiento físico.

Medir catálogos de 1000/10000 variantes y capturas de 20/100/500 variantes,
incluyendo varias del mismo producto, campos sin cambios y entradas. Separar
carga, filtrado, revisión y guardado; registrar consultas, eventos, transacciones,
mediana y rango de al menos cinco corridas comparables. La carga/filtrado no
debe hidratar snapshots completos por cada fila ni crear controladores de todo
el catálogo. Definir el presupuesto temporal con la referencia del dispositivo,
sin inventar tiempos garantizados ni poner umbrales frágiles en CI.

Actualizar [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Estado y continuidad|Estado y continuidad]]
en cada sesión con cambios, pruebas, evidencia y próximo paso. Si falta un
dispositivo, cerrar la automatización documentando la prueba física pendiente;
no marcarla aprobada. El cierre funcional exige ambas vistas, idempotencia,
conservación de datos, política de modos y resultados remotos distinguibles.
