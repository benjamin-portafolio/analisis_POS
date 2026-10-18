---
tipo: plan_implementacion
estado: cierre_automatizado_completado
revision: 1
actualizado: 2026-10-15
---

# Escaneo y asignación de códigos de barras en inventario

## Objetivo y solicitud

Completar catálogos importados sin códigos de barras desde Gestión del
inventario: escanear un envase, editar su artículo si el código ya existe o
seleccionar una variante existente para asignarlo si no existe. La variante
destino puede tener otro código; reemplazarlo requiere confirmación explícita.

Solicitud vigente: fase 3, verificación y cierre, completada el 2026-10-15.
Las fases 1 y 2 están implementadas. I01–I19 tienen verificación automatizada
aprobada; I20 conserva la prueba física pendiente por decisión del usuario.
La matriz, archivos y comandos están en [[08 - Roadmap/Escaneo en inventario/Estado y continuidad|Estado y continuidad]]
y en `docs/testing/inventory_barcode_verification.md` del proyecto Flutter.
No se modificó código de producción durante el cierre.

Proyecto Flutter: `/Users/benjamin/Projects/POS/pos_flutter`.
Análisis: este vault; su directorio `analisis ` incluye un espacio final.
Continuidad: [[08 - Roadmap/Escaneo en inventario/Estado y continuidad|Estado y continuidad]].

## Alcance de esta revisión

El agregado afectado es producto, incluyendo sus variantes. Se reutiliza
`producto_actualizado`, con su contrato tipado, base de edición, aplicación
local e idempotencia existentes. No hace falta un evento nuevo para el barcode.

Incluye acceso desde inventario, cámara de una lectura, consulta exacta local,
resolución de varias coincidencias, apertura de edición, búsqueda por variantes,
confirmación y asignación/reemplazo persistido. También incluye errores,
cancelación, concurrencia local y pruebas de regresión.

No incluye alta de productos, movimientos de existencias, escaneo continuo,
lector físico, nuevos formatos de códigos, múltiples códigos por variante,
unicidad de barcode, transferencia de códigos entre variantes ni trabajo de
servidor/transporte remoto. Los servicios de sincronización actuales conservan
su comportamiento; no se incorporan ni habilitan servicios adicionales.

## Criterios aplicados y punto pendiente

Los siguientes criterios se implementaron en las fases 1 y 2 autorizadas por el
usuario. La ampliación del punto 4 sigue pendiente de análisis:

1. Mostrar el botón sobre `+` solo en la pestaña Artículos de Gestión del
   inventario. Usar icono de lector y tooltip/semántica «Escanear código de
   barras». El botón `+` conserva su funcionamiento.
2. Una confirmación guarda directamente la asignación. No exigir guardar después
   todo el formulario. Al terminar, regresar a inventario y permitir un nuevo
   escaneo pulsando el botón; la cámara no queda abierta continuamente.
3. Conservar códigos repetidos como comportamiento vigente: varias coincidencias
   requieren selección. No imponer exclusividad ni retirar códigos de otros
   registros como efecto de esta función.
4. Queda pendiente de análisis una ampliación: «Asignar a otra variante» cuando
   el código ya aparece en un artículo equivocado. Antes de desarrollarla habrá
   que definir si se comparte el código o se retira de los orígenes, cómo se
   elige el origen si hay duplicados y cómo se confirma el conjunto de cambios.
   Esta ampliación no condiciona el alcance solicitado para códigos no encontrados.

## Comportamiento funcional

1. Pulsar el lector abre `BarcodeScannerScreen`, ya usado en el editor de
   variantes. Una lectura devuelve `String`; cancelar devuelve `null`.
2. Normalizar y validar con `CodigoBarras`: NFKC, trim, entre 1 y 32 dígitos,
   conservando ceros iniciales. Una entrada incompatible muestra un aviso y
   permite volver a intentarlo, sin consultar ni guardar datos inválidos.
3. Consultar `ProductoRepository.buscarVariantesPorCodigoBarras`.
4. Con una coincidencia, cargar el detalle vigente y abrir el formulario de
   edición existente del artículo, desplazado a la variante identificada.
   Leer el código no modifica ningún dato. Guardar y cancelar mantienen las
   reglas actuales del formulario.
5. Con varias coincidencias, mostrar producto, variante y precio para elegir
   cuál editar. No elegir automáticamente el primer resultado. Cancelar vuelve
   a inventario sin cambios.
6. Sin coincidencias, mostrar el código y «No se encontró un artículo con este
   código», con las acciones «Asignar a una variante existente» y «Cancelar».
7. El selector permite buscar por nombre de artículo y variante. Muestra una
   fila por variante activa de un producto activo, tenga o no barcode o
   seguimiento de existencias. El nombre de producto, variante y precio deben
   permitir distinguir presentaciones; no limitar el resultado a productos.
8. Seleccionar una fila carga el detalle actual y obtiene identidad, evento
   base y código vigente de la variante. El código actual se muestra en la
   confirmación; no hace falta ampliar todos los listados para consultarlo.
9. Sin código previo: «¿Asignar este código de barras?», artículo, variante y
   código nuevo; acciones «Cancelar» y «Asignar código».
10. Con código previo distinto: «¿Reemplazar el código de barras?», artículo,
    variante, código actual y código nuevo; acciones «Cancelar» y «Reemplazar
    código». Una variante mantiene un solo código; el anterior deja de estar
    asociado a esa variante, pero se conserva en el historial de eventos.
11. Si la variante ya tiene el mismo código al comprobar su detalle, informar
    que ya está asignado y no generar una actualización redundante.
12. Confirmar bloquea el doble toque, ejecuta el comando y solo muestra éxito
    cuando termina el guardado local. Después vuelve a inventario; sus listados
    se actualizan a través de los repositorios existentes.
13. Si el artículo cambió desde la confirmación, no aplicar sobre una base
    distinta. Explicar que debe revisarse nuevamente, recargar el detalle y
    solicitar otra confirmación antes de guardar.
14. Cancelar antes de confirmar nunca escribe. Un error de guardado conserva
    código y selección para reintentar. Durante el comando se espera su
    resultado antes de cerrar; salir no promete deshacer una escritura iniciada.
15. Un resultado asíncrono de una ruta cancelada no debe abrir otro formulario,
    diálogo ni iniciar un comando. Falta de permiso/cámara conserva salida y
    reintento; la edición manual existente continúa disponible.

```text
Botón en Artículos → cámara → validar código → consulta exacta local
  ├─ 1 coincidencia → editar artículo, ubicando la variante
  ├─ varias → elegir coincidencia → editar artículo
  └─ 0 → ofrecer asignación → buscar variante → cargar detalle actual
       → confirmar asignación/reemplazo → comando → producto_actualizado
       → aplicación local → listado actualizado
```

## Base real inspeccionada

Inspección: 2026-10-15, HEAD Flutter observado `672361f`, con cambios locales
ajenos en ventas, artículos, repositorios y pruebas. Esta es una referencia
temporal: revisar el estado real al iniciar cada sesión y preservar trabajo
previo, sin resetear archivos ni restaurar versiones antiguas.

| Pieza existente | Uso previsto |
|---|---|
| `InventoryManagementScreen` | Incorporar el acceso; delegar selección, confirmación y coordinación a archivos propios |
| `BarcodeScannerScreen` | Reutilizar una lectura, permisos y liberación de cámara; no usar el flujo continuo de Caja |
| `CodigoBarras` | Reutilizar normalización y validación sin crear reglas paralelas |
| `ProductoRepository.buscarVariantesPorCodigoBarras` | Ya devuelve cero, una o varias variantes activas con coincidencia exacta |
| `ArticleSearchItem.search` | Ya transforma artículos en resultados por variante y busca palabras en ambos nombres |
| `ArticleSearchScreen` | Está ligada a agregar a venta y observar el borrador; reutilizar solo búsqueda/componentes que tengan uso compartido real |
| `ProductoRepository.obtenerDetalle` | Ya incluye barcode de las variantes y `lastEventId`; usarlo antes de confirmar |
| `VarianteListado` | No contiene barcode; no ampliar este modelo solo para mostrar el código en la confirmación |
| `ArticleFormScreen` y apertura desde inventario | Reutilizar edición con su base; agregar identificación inicial de variante para ubicarla |
| `ProductoCommandService` y `ProductoActualizadoPayload` | Agregar intención acotada y reutilizar persistencia/evento del agregado |
| `ProductVariants.barcode` | Ya existe y no es único; no se prevén tablas, columnas, índices ni migraciones |

Los paths de la tabla son nombres de clases/archivos dentro del proyecto
Flutter indicado arriba. Antes de implementar, leer `AGENTS.md`,
`docs/architecture/offline_feature_flow.md` y
`docs/templates/new_offline_feature_checklist.md`.

## Diseño técnico

### Intención de aplicación y persistencia

Crear `AsignarCodigoBarrasVarianteCommand` en
`lib/application/commands/articulos/asignar_codigo_barras_variante_command.dart`,
con producto, variante, evento base confirmado y código nuevo. Incorporar su
procesamiento en `ProductoCommandService`, junto a los comandos del agregado.

Dentro de la transacción local:

1. Normalizar el código y rechazar vacío/inválido; comprobar producto y variante
   activos, pertenencia de la variante al producto y vigencia del evento base.
2. Leer el snapshot tipado del producto y construir el estado posterior
   cambiando únicamente el barcode de la variante elegida. Conservar nombres,
   precios, costos, orden, identidades, categoría, configuración de venta,
   proveedores con sus fechas, recetas y vínculos de inventario. Respetar la
   representación canónica/compatibilidad legada de los contratos vigentes.
3. Si no cambia el estado, no generar un evento nuevo.
4. Construir `ProductoActualizadoPayload` y `SyncEvent` con las constantes del
   contrato y `toJson`. Reutilizar helpers de actualización y referencias
   cuando correspondan; extraer solo la parte compartida necesaria.
5. Declarar y validar los `LocalEventRef` actuales de actualización de producto
   en ambos modos, sin inventar una referencia de unicidad para barcode.
6. Guardar y aplicar con el event store/handler existentes; mantener la base y
   el control de versión usados por las demás ediciones del producto.

No convertir una asignación en una reconstrucción desde valores de formulario
ni introducir llamadas de UI a Drift. No debe generar altas de recursos,
movimientos, descartes ni modificaciones de otras variantes como efecto lateral.

En `standalone`: `delivery_status = not_required`, sin filas en `event_refs`
ni inicio de push, pull, preflight, health checks o WebSocket. En `server_sync`:
preservar la política de actualización existente, con refs persistidas y evento
pendiente según su event store. La verificación de estos metadatos es local;
no requiere desarrollar transporte ni modificar NestJS.

### Presentación y reutilización

Separar selector de variantes, diálogo de confirmación y coordinación del
flujo dentro de `presentation/pages/gestion_inventario/articulos`. Cada
responsabilidad principal vive en su archivo y se prueba por separado cuando
corresponda. La pantalla principal se limita a abrir y conectar el flujo.

El selector puede apoyarse en `watchArticulos()` y la búsqueda por variantes
actual, con una fila por resultado. Si se extrae `ArticleSearchItem` a una
ubicación compartida, actualizar sus consumidores y pruebas en el mismo cambio.
No crear una arquitectura genérica de buscadores ni reutilizar el command
service/coordinador de ventas. Seleccionar para asignación no agrega a Caja.

Reutilizar la consulta exacta ya implementada; no cargar el catálogo completo
para resolver el código escaneado ni ejecutar una consulta de detalle por cada
fila del selector. Leer el detalle solo del destino seleccionado. Cargar/error/
vacío y resultados sin nombre de variante deben tener representación explícita.

## Sesiones recomendadas

Tres sesiones secuenciales. Cada una termina con cambios verificables y una
actualización de continuidad. Si se ejecuta todo en una sola sesión, mantener
el orden y los criterios de salida; no hace falta crear otros chats.

| Sesión | Trabajo | Entrega y criterio de salida |
|---|---|---|
| 1. Guardado acotado — completada | Comando de asignación, procesamiento por evento existente y pruebas de persistencia | 60 pruebas aprobadas; asignación/reemplazo acotados, base, idempotencia, rollback y ambos modos verificados |
| 2. Interfaz e integración — completada | Botón, cámara existente, cero/una/varias coincidencias, selector, confirmación, apertura de edición y errores | 31 pruebas aprobadas; recorrido con guardado real, cancelación y conservación de venta |
| 3. Verificación y cierre — automatizado completado | Matriz I01–I20, regresión, limpieza y documentación | 33 pruebas de navegación aprobadas (2 nuevas de CSV/reapertura en ambos modos), analyze aprobado y suite general de fase 2 reutilizada; I20 físico pendiente explícito |

### Sesión 1: tareas y comprobaciones

1. Releer guías y estado del repositorio; identificar cambios previos y una
   muestra de producto simple y otro con varias variantes/receta/proveedores.
2. Implementar el comando y la operación en el servicio. Mantener el contrato
   existente; no duplicar el algoritmo completo de actualización.
3. Probar asignación desde null, reemplazo, ceros iniciales, normalización,
   inválido/vacío, variante ajena/inactiva, producto inactivo y base obsoleta.
4. Probar conservación del snapshot y ausencia de movimientos/recursos nuevos,
   no-op del mismo código, idempotencia al reaplicar el mismo evento y rollback
   ante fallo de persistencia/aplicación.
5. Verificar con SQLite de prueba el evento, proyección, referencias y estado
   de entrega en ambos modos. Cubrir persistencia al reabrir una base temporal.
6. Ejecutar `dart analyze` y `flutter test`; registrar resultados y cualquier
   fallo previo ajeno sin modificarlo para ocultar la evidencia.

La operación puede quedar sin acceso visual al cerrar esta sesión como entrega
intermedia expresamente prevista. La sesión 2 debe consumirla; no dejar métodos
o helpers adicionales sin uso en el resultado final.

### Sesión 2: tareas y comprobaciones

1. Integrar el lector sobre `+`, exclusivamente en Artículos, con un solo flujo
   en curso y protección contra aperturas repetidas.
2. Resolver resultados usando la consulta existente y cargar detalle vigente
   antes de editar o confirmar. Agregar al formulario la ubicación inicial de
   variante sin alterar el uso habitual de edición.
3. Crear el selector por variante usando la búsqueda actual, incluyendo
   variantes con y sin código y sin seguimiento de existencias.
4. Incorporar las dos confirmaciones y conectar la operación de sesión 1.
   Mostrar código viejo/nuevo, bloqueo de doble toque, guardado, éxito y error.
5. Probar con la plataforma de cámara falsa existente: cancelar, una lectura,
   código inválido, permisos, liberación al cerrar, segundo plano y callbacks
   tardíos. Conservar las pruebas del lector del editor y de Caja.
6. Probar navegación completa de cero/una/varias coincidencias, búsqueda,
   selección, reemplazo y cancelar en cada paso; ejecutar `dart analyze` y
   `flutter test` y registrar evidencia.

### Sesión 3: tareas y comprobaciones

1. Ejecutar los casos de aceptación siguientes con almacenamiento temporal y
   flujos reales de comandos/repositorios, ampliando pruebas solo ante huecos.
2. Verificar que un catálogo importado sin barcode pueda completarse y que la
   consulta usada en Caja encuentre el nuevo código y deje de encontrar el
   anterior para esa variante. Si otra variante conserva el anterior, esa
   coincidencia debe permanecer.
3. Comprobar cámara en un dispositivo disponible con datos de prueba: permiso,
   lectura, ceros iniciales, cancelación, segundo plano y reapertura. Registrar
   plataforma y resultado; si falta dispositivo, marcar estos casos pendientes
   sin declararlos aprobados ni bloquear la integración automatizada.
4. Revisar imports, helpers, modelos y archivos sin uso con `rg`, y comprobar
   que no haya escritura Drift desde UI ni dependencias nuevas innecesarias.
5. Ejecutar `dart analyze` y `flutter test` sobre el resultado final. Si no hubo
   más cambios desde las verificaciones aprobadas de sesión 2, reutilizar su
   evidencia y ejecutar solo las comprobaciones nuevas justificadas.
6. Actualizar el estado de esta carpeta y las guías del proyecto que describan
   el acceso funcional. Registrar por separado entrega automatizada y pruebas
   físicas pendientes; no convertir estas últimas en una aprobación supuesta.

No se prevén cambios de esquema. Si una necesidad real obliga a cambiar tablas,
documentarla, mantener `schemaVersion` y `_resetDatabaseOnStartup` conforme a
AGENTS y ejecutar `dart run build_runner build`. No agregar migraciones.

## Casos de aceptación

Estado final al 2026-10-15: **I01–I19 aprobados mediante automatización; I20
físico pendiente**. Las expectativas siguientes se conservan como contrato.
El resultado y la evidencia individual se registran en la matriz de cierre de
Estado y continuidad y en la guía de verificación del proyecto. Cámara falsa
no equivale a aprobación física.

| ID | Caso | Resultado esperado |
|---|---|---|
| I01 | Botón en Artículos y cambio a otras pestañas | Sobre `+` en Artículos, ausente en las demás; `+` sigue operativo |
| I02 | Escaneo con coincidencia única | Edición del producto correcto, ubicada la variante; sin escritura por leer |
| I03 | Dos variantes comparten código | Selector explícito; elegir abre esa variante; cancelar no modifica |
| I04 | Código desconocido | Aviso y opción de asignar a existente; sin alta automática |
| I05 | Buscar por producto y variante | Filas separadas y resultados distinguibles; incluye destinos con/sin código |
| I06 | Variante sin nombre o sin control de existencias | Identificación comprensible y destino seleccionable |
| I07 | Destino sin barcode | Confirmación de asignación; un producto_actualizado y nuevo código persistido |
| I08 | Destino con otro barcode | Confirmación con ambos valores; reemplaza solo el destino seleccionado |
| I09 | Cancelar lector, aviso, selector o confirmación | Sin nuevos eventos ni cambios en catálogo, inventario o venta |
| I10 | Código con ceros iniciales y normalización admitida | Se conserva como texto y se encuentra por igualdad normalizada |
| I11 | Vacío, incompatible o demasiado largo | Error claro; sin evento ni alteración de datos |
| I12 | Producto/variante retirados o base cambiada | Se rechaza destino/base; requiere recargar y confirmar nuevamente |
| I13 | Código ya igual al del destino | Sin actualización redundante |
| I14 | Doble toque, lecturas repetidas o callback de ruta cerrada | Una sola operación; sin navegación tardía ni escrituras inesperadas |
| I15 | Producto con receta, proveedores y varias variantes | Único cambio de negocio: barcode elegido; existencias y venta intactas |
| I16 | Guardado falla / evento se reaplica | Rollback íntegro en fallo; replay idempotente sin efectos adicionales |
| I17 | Persistencia y consulta tras reabrir | Código nuevo disponible; el viejo no coincide con el destino reemplazado |
| I18 | standalone / server_sync | Refs declaradas/validadas en ambos, persistidas solo en server_sync; standalone not_required sin servicios remotos |
| I19 | Regresión del editor, buscador de venta y Caja | Conservan su interacción; asignar desde inventario no agrega líneas de venta |
| I20 | Permiso, segundo plano, cierre y reapertura reales | Cámara liberada y siguiente escaneo disponible; evidencia física o pendiente explícito |

## Cómo retomar en otro chat

Las tres fases están cerradas en su alcance automatizado. No repetir la
implementación ni las pruebas aprobadas del mismo código. El pendiente
concreto es I20 físico cuando el usuario solicite retomarlo, con datos aislados
y evidencia de plataforma, permisos, lectura/cancelación, segundo plano y
reapertura. Las transferencias/unicidad siguen fuera de alcance. Releer la
continuidad y comprobar el working tree antes de cualquier cambio.
