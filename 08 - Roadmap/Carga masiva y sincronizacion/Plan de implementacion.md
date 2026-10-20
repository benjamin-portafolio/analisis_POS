---
tipo: plan_implementacion
estado: planificado_sin_implementar
revision: 1
actualizado: 2026-10-19
---

# Carga masiva de hasta 200 filas y seguimiento de sincronización

## Objetivo y alcance de esta entrega

Permitir seguir cada importación CSV hasta conocer su resultado local y remoto.
Conservar los comandos y eventos por producto/recurso, limitar los archivos a
200 filas y bloquear otra carga masiva mientras la anterior necesite completar
su sincronización o revisar incidencias. Las demás operaciones siguen disponibles.

El usuario solicitó **documentar las reglas y el plan**. Este documento no cambia
Flutter, NestJS, SQLite ni los archivos CSV. Todo el comportamiento nuevo descrito
aquí está pendiente de implementar y verificar.

Es una ampliación del [[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|plan de alta y actualización por CSV]].
Los resultados históricos de aquel trabajo con 500 filas siguen siendo evidencia
de la versión anterior, no aceptación del límite nuevo.

## Decisiones confirmadas y criterios de diseño

| Regla | Definición |
|---|---|
| Máximo por archivo | 200 filas de datos, excluyendo encabezado y líneas vacías. Se cuentan variantes, no solo productos; las filas omitidas o inválidas también consumen el límite |
| Formatos | El límite aplica tanto a altas de diez columnas como a archivos de doce columnas con altas, actualizaciones y omisiones |
| Una carga a la vez | En `server_sync`, impedir confirmar otra importación mientras la carga anterior siga en ejecución, tenga eventos por entregar o incidencias sin revisar |
| Resto de la aplicación | Ventas, altas individuales, edición, movimientos y demás operaciones conservan sus reglas actuales y pueden seguir generando eventos |
| Conexión | Recomendar conexión disponible al servidor para iniciar y terminar la carga. Tener Internet o WiFi por sí solo no acredita acceso al servidor |
| Eventos | Conservar `producto_creado`, `recurso_inventario_creado` y `producto_actualizado`. No crear un evento único que contenga todo el catálogo |
| Transporte | Mantener hasta 150 eventos por petición y agregar un presupuesto de bytes, continuación automática y reanudación |
| Modos | En `standalone` no se exige conexión, no se espera sincronización y no se ejecuta actividad remota |

Las siguientes precisiones son **propuestas de ingeniería para implementar las
decisiones**, no requisitos adicionales atribuidos al usuario:

1. El bloqueo se aplica a importaciones CSV del mismo dispositivo/base local.
   No se introduce una reserva global entre dispositivos en el servidor.
2. «De preferencia con conexión» se interpreta como recomendación, no como una
   prohibición de la primera carga offline. Sin servidor se informa que quedará
   pendiente y que no se podrá confirmar otro CSV hasta atenderla.
3. Una incidencia remota no equivale a sincronización completada. Mostrarla y
   conservar el bloqueo; cerrar el detalle o revisar el error no acredita entrega.
   No ofrecer un cierre de carga que permita el siguiente CSV con eventos sin
   sincronizar: esa excepción no fue solicitada por el usuario.

## Base real inspeccionada

Repositorios de referencia:

- Flutter: `/Users/benjamin/Projects/POS/pos_flutter`.
- NestJS: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`.
- Análisis: este vault. Los árboles contienen trabajo de otras funcionalidades;
  releer `git status --short` antes de implementar y preservarlo.

| Pieza, ruta relativa al repositorio indicado | Situación observada |
|---|---|
| Flutter: `lib/data/local/import/articulo_import_csv.dart` | Máximo actual de 500 filas; error estructural antes de revisar datos si se supera |
| Flutter: `lib/application/import/articulo_import_batch_service.dart` | Guarda lotes mixtos de hasta 50 productos; cuenta creados, actualizados, omitidos y fallidos |
| Flutter: `lib/application/commands/articulos/producto_command_service.dart` | Crea eventos individuales dentro de transacciones por lote; el resultado público del lote no expone sus IDs de evento |
| Flutter: `lib/presentation/pages/gestion_inventario/carga_masiva/bulk_import_screen.dart` | Revisión y confirmación local; el avance actual no representa aceptación remota |
| Flutter: `lib/application/sync/sync_push_service.dart` | Envía un conjunto elegible de hasta 150 eventos por llamada; el resto queda pendiente. Respeta dependencias |
| Flutter: `lib/application/sync/sync_availability_monitor.dart` | Observa pendientes y solicita otras vueltas. No sustituye un seguimiento persistente por importación |
| Flutter: `lib/application/sync/sync_preflight_service.dart` | Construye la petición con referencias de todos los pendientes; `max_events` limita la respuesta, no el tamaño enviado |
| Flutter: `lib/data/local/drift/tables/bulk_edit_operations.dart` | Diario duradero de otra funcionalidad. Su estado aplicado acredita ejecución local, nunca entrega remota; no reutilizarlo sin un contrato compatible explícito |
| NestJS: `src/main.ts` | Arranque predeterminado de Nest/Express, sin límite JSON configurado explícitamente |
| NestJS: `src/sync/sync.service.ts` | `/sync/push` recibe una lista y procesa/idempotentiza por evento. El límite de 150 observado está en Flutter |

El análisis previo ejecutó la prueba existente de 1,000 eventos con servidor
simulado: pasó mediante llamadas sucesivas a push, no con una sola llamada.
Un diagnóstico de 190 altas con seguimiento produjo 380 eventos; dos paquetes
de 150 pesaron aproximadamente 116 KB y 147 KB. Una aplicación HTTP aislada con
las dependencias instaladas rechazó 103,000 bytes con 413 al usar el límite
predeterminado de 102,400 bytes. Son observaciones de diagnóstico de esta
conversación, no una prueba integral del cambio ni confirmación de la causa del
incidente del usuario. Reproducir con evidencia guardada durante la implementación.

## Límite, agrupación y conteos

- Aceptar hasta 200 filas y rechazar 201 antes de escribir o reservar una carga.
  No importar silenciosamente solo las primeras 200.
- Conservar la agrupación actual: una fila representa una variante. Varias
  variantes de un producto generan un solo evento de producto.
- Un archivo de 200 altas distintas, con una variante con seguimiento cada una,
  puede generar **400 eventos**. El límite de filas no es un límite de eventos
  ni garantiza por sí solo que una petición quepa en el servidor.
- Mantener lotes locales de hasta 50 productos. No confundirlos con los paquetes
  de red de hasta 150 eventos.
- Al partir un catálogo para altas, mantener juntas todas las variantes del
  mismo producto. Una parte posterior sin IDs no agrega variantes a un producto
  que ya se creó: su nombre existente se rechaza. El fraccionamiento debe respetar
  el grupo completo, aunque un archivo quede con menos de 200 filas.
- La exportación completa del catálogo puede superar 200 filas: sigue siendo
  una exportación. Informar que para reimportarla se deben preparar partes.
  Un producto nuevo con más de 200 variantes requiere el editor u otro alcance;
  no ofrecer dividirlo como si fueran altas independientes.

## Admisión, conexión y estados por modo

### Modo servidor

Antes de confirmar, mostrar la disponibilidad conocida del servidor y el estado
de la carga anterior. Si la comprobación está desactualizada, solicitarla mediante
el coordinador existente y con espera acotada; evitar health checks duplicados.

Si no hay conexión y no existe una carga bloqueante, permitir la confirmación
local con esta consecuencia explícita en la revisión: la carga quedará pendiente
y habrá que sincronizarla antes de importar otro CSV. No añadir otra ronda de
confirmaciones fuera del diálogo actual.

El cierre de pantalla no cancela eventos ya guardados ni libera la reserva.
Tampoco liberan el bloqueo un timeout, una reconexión, un health exitoso o ver el
producto en la proyección local. El servidor debe acreditar los eventos asociados.

El flujo normal será:

```text
Archivo de hasta 200 filas
-> revisión y confirmación
-> reserva local persistente de la carga
-> commits locales por lotes de 50 productos
-> envío automático por paquetes con sus dependencias
-> confirmaciones remotas y actualización del progreso
-> carga sincronizada: habilitar el siguiente CSV
```

Un error local parcial conserva el resultado de los lotes ya confirmados y los
errores de los revertidos. Los eventos confirmados continúan su sincronización.
Cuando todos se entreguen, mostrar «sincronización completada con errores de
importación», no «todos los productos importados». Si no se confirmó ningún
evento, cerrar la ejecución fallida y liberar la reserva sin esperar al servidor.

### Modo standalone

Aplicar el máximo de 200 filas y las validaciones locales. Al terminar la
ejecución local, permitir otra carga. No esperar estados remotos ni consultar
servidor, preflight, push, pull, health o WebSocket.

Los command services siguen declarando y validando `LocalEventRef` en ambos
modos. Solo `server_sync` persiste `event_refs`; standalone conserva eventos
aplicados con `delivery_status = not_required`. No convertir historial standalone
en pendiente ni reconstruir sus referencias como parte de esta funcionalidad.

## Seguimiento persistente por importación

Diseñar un registro exclusivamente local, con identidad estable de carga, modo,
nombre/huella del archivo, fecha de confirmación y resultado local. Asociar a él
los **IDs exactos de los eventos creados**, sus productos y las líneas/variantes
del archivo. Conservar errores por línea/producto/lote para ubicar fallas.

La huella sirve para identificación y diagnóstico, no para omitir por sí sola
una reimportación que tenga otra intención. Los IDs de evento existentes son la
base de los reintentos idempotentes.

Requisitos de persistencia y concurrencia:

1. Reservar atómicamente la carga antes del primer lote. Dos pantallas o dobles
   confirmaciones no pueden admitir dos cargas simultáneas.
2. Guardar la asociación carga/eventos en la misma transacción que confirma cada
   lote, incluyendo los recursos de inventario. Si el lote revierte, su asociación
   también revierte. No reconstruirla por intervalos de secuencia, nombre o tipo:
   otras operaciones pueden intercalarse.
3. Ampliar el resultado tipado de los comandos de importación para exponer los
   IDs efectivamente guardados. No atribuir eventos a omisiones o no-ops.
4. Recuperar reserva y progreso al reiniciar sin reejecutar altas automáticamente.
   Si hubo interrupción local, reconciliar lotes confirmados y señalar filas no
   ejecutadas; nunca volver a crear productos solo por haber perdido una respuesta.
5. Derivar el estado remoto de cada evento persistido. Solo `delivered` acredita
   entrega. Una respuesta `duplicate` debe conservar su estado original: no todos
   los duplicados equivalen a aceptación.
6. Liberar al finalizar la ejecución local y entregar todos sus eventos. Una cola
   global con ventas u otros cambios pendientes no mantiene el bloqueo del CSV.
7. Rechazos/conflictos llevan a «requiere revisión» y mantienen bloqueada otra
   carga. La resolución debe acreditar un resultado remoto válido, no cambiar
   artificialmente el estado de entrega ni limitarse a cerrar el aviso. La pérdida
   de conexión deja «pendiente», sin opción de aparentar sincronización.
8. El seguimiento no se infiere de importaciones históricas sin asociación. La
   primera versión debe informar los pendientes existentes y documentar ese límite,
   sin vincular ventas o ediciones ajenas a una carga supuesta.

No agregar un evento de catálogo ni sincronizar el diario de seguimiento.
Resolver nombres y estructura definitivos durante la primera fase. Si se crean
tablas, documentar por qué su identidad/estado de ejecución no corresponde a
`CommonFields`; seguir la política de esquema de `AGENTS.md` del proyecto.

**Riesgo a resolver antes de implementar la recuperación:** un rechazo definitivo
puede impedir entregar el evento original. Verificar qué resolución soporta el
protocolo actual y cómo se acredita en el seguimiento. Si requiere una excepción
al bloqueo o una cancelación administrativa, documentarla y obtener una decisión
explícita antes de incorporarla. Este plan no autoriza desbloquear descartando
eventos ni marcándolos entregados, ni promete resolver todos los conflictos con
un simple reintento. Las operaciones restantes continúan disponibles.

## Envío por paquetes y reanudación

### Cantidad y bytes

Propuesta inicial verificable: conservar `maxEventsPerPush = 150`, presupuestar
un máximo de **512 KiB de JSON UTF-8 por petición** en el cliente y configurar
explícitamente **1 MiB** de aceptación JSON en NestJS. Comprobar también cualquier
proxy del entorno. Son parámetros técnicos propuestos, sujetos a las mediciones
de esta implementación, no límites comerciales solicitados por el usuario.

Medir el cuerpo completo serializado, con sobre y referencias. Un evento no se
parte arbitrariamente: si él solo supera el presupuesto, mostrar un diagnóstico
identificable y detener ese avance, sin recursión o reintento infinito.

Incluir preflight y los reportes de conflictos del recorrido en la revisión de
tamaños. No conservar un preflight ilimitado aunque el push ya se parta. Preparar
las referencias del conjunto que realmente se va a enviar y conservar sus
dependencias y bases. `max_events` de preflight no divide sus `pending_refs`.
No interpretar un checkpoint de una consulta parcial como cobertura de toda la
cola ni avanzar el cursor de pull a partir de preflight.

### Coordinación y condición de parada

Un único coordinador debe serializar monitor y envío manual, preparar/revalidar
cada conjunto y continuar después de aplicar las confirmaciones. Releer la cola
para habilitar productos cuyas dependencias acaban de entregarse. Conservar el
pull requerido por el protocolo y sus excepciones de preflight.

No hace falta que todos los recursos y sus productos viajen en la misma petición.
Sí hace falta respetar sus dependencias y mantener los mismos IDs en reintentos.

Continuar mientras haya eventos elegibles y progreso. Detener el ciclo inmediato
ante fallo de red, ausencia de progreso o dependencias que requieran revisión.
Reutilizar la política de reintento con espera; no crear un bucle que repita 413
sin cambiar el paquete. Una sesión de envío debe tener un conjunto/límite de
trabajo finito para no perseguir indefinidamente nuevas ventas del usuario.

Las demás operaciones comparten la cola con sus reglas existentes. No se
promete entrega inmediata de una venta que dependa de un producto aún pendiente,
pero la pantalla y el registro local de esa venta siguen disponibles.

## Interfaz y mensajes

- Antes de importar: máximo de 200 filas, disponibilidad del servidor y aviso
  offline cuando corresponda.
- Durante y después: nombre de archivo, filas/productos, creados, actualizados,
  omitidos, fallidos localmente y eventos entregados/pendientes/con incidencias.
- Mostrar por separado «guardado local» y «sincronización con servidor».
  Un recurso entregado no significa que su producto ya esté entregado.
- Una carga bloqueante sustituye «Confirmar importación» por acceso al detalle
  y al reintento de sincronización. Puede seguirse consultando/exportando catálogo.
- El detalle enlaza cada incidencia con producto, variante, líneas originales,
  tipo de evento y motivo útil. No exigir revisar manualmente todos los eventos.
- «Reintentar sincronización» envía eventos pendientes existentes; no vuelve a
  ejecutar la importación. Salir del detalle conserva el resultado parcial,
  las incidencias y el bloqueo sin borrar eventos ni marcarlos entregados.

## Plan por fases

| Fase | Trabajo | Criterio de salida |
|---|---|---|
| 1. Contrato y seguimiento local | Cambiar máximo a 200; actualizar mensajes/notas/tests; diseñar reserva y asociación transaccional a eventos; revisar el diario existente sin mezclar semánticas | 200 se acepta y 201 no escribe; grupos intactos; reserva única; IDs exactos y recuperación en disco |
| 2. Transporte y servidor | Coordinación de ciclos, presupuesto de bytes, preflight acotado, límite JSON explícito, dependencias, idempotencia y parada sin progreso | Hasta 400 eventos de una carga se entregan automáticamente; no hay 413 con paquetes dentro de presupuesto; fallos recuperables sin duplicados |
| 3. Interfaz y admisión | Avisos de conexión, bloqueo de otro CSV, progreso local/remoto y detalle de incidencias | Flujo comprensible al salir, volver, reiniciar y operar otras funciones; standalone independiente |
| 4. Verificación integral | SQLite en disco, NestJS/PostgreSQL aislados y recorrido de dispositivo | Matriz aprobada con evidencia real, o límites físicos/externos identificados sin declararlos aprobados |

Antes de cada fase leer este plan, el estado real de Git y las instrucciones de
cada proyecto. Implementar solo el alcance descrito. Ante cambios de esquema,
regenerar Drift; después de cambios funcionales ejecutar `dart analyze` y
`flutter test`, además de las pruebas relevantes de NestJS. Usar datos aislados
para las pruebas de importación y sincronización.

## Matriz de aceptación pendiente

Todos los casos siguientes están **pendientes**. La evidencia anterior con 500
filas o servidor simulado no los acredita.

| Caso | Condición | Resultado exigido |
|---|---|---|
| M01 | 200 filas válidas y 201 filas | 200 admitidas; 201 rechazadas sin reservas, eventos ni proyecciones nuevas |
| M02 | Encabezado, vacías, omitidas e inválidas | Conteo definido y consistente en ambos formatos CSV |
| M03 | 200 productos con seguimiento | Hasta 400 eventos; lotes locales de 50 productos y entrega automática en varios paquetes |
| M04 | Varias variantes y mezcla de altas/updates/no-ops | Un evento de producto por agregado; recursos solo para altas con seguimiento; no-ops sin eventos |
| M05 | Otra carga mientras la anterior tiene pendientes | Confirmación bloqueada, incluso desde otra pantalla o tras reiniciar |
| M06 | Todos los eventos de la carga entregados, otras ventas pendientes | Nueva carga habilitada; no depender de que toda la cola esté vacía |
| M07 | Vender, editar o dar alta individual durante la carga | Operaciones locales disponibles y eventos ajenos excluidos de su seguimiento |
| M08 | Caída antes/después de cada commit y pérdida de respuesta | Asociación exacta, recuperación duradera y ninguna alta duplicada |
| M09 | Sin servidor antes de empezar; caída durante el envío | Aviso previo, guardado local permitido sin otra carga activa, pendientes conservados y reanudación |
| M10 | Rechazo o conflicto parcial | Motivo y filas identificables; sin falso éxito ni desbloqueo por cerrar el aviso; recuperación respaldada por el protocolo |
| M11 | Doble confirmación y carreras monitor/manual | Una sola reserva/carga y un coordinador de transporte, sin doble ejecución |
| M12 | JSON grande en push/preflight/reporte de conflictos | Peticiones acotadas por bytes; prueba HTTP real del límite y errores visibles para un evento indivisible demasiado grande |
| M13 | Respuesta perdida, duplicado aceptado o duplicado en conflicto | Reenvío con mismos IDs; solo el estado remoto correcto acredita entrega |
| M14 | Sin elegibles o sin progreso | Fin del ciclo inmediato y diagnóstico; sin bucles de red ni bloqueo de la UI |
| M15 | Error local con lotes previos confirmados, o sin ningún commit | Sincronizar solo lo confirmado; conservar fallidos; cero commits no espera entrega remota |
| M16 | Standalone y posterior cambio de modo | 200 filas; cero red/event_refs; `not_required`; ninguna promoción silenciosa de historial |
| M17 | Reinicio con historial de importaciones sin trazabilidad | No inventar asociaciones ni declarar aceptación; informar límite de seguimiento histórico |
| M18 | Archivo dividido por productos completos | Ninguna variante perdida/duplicada entre partes; altas y actualizaciones conservan su semántica |

## Estado y siguiente paso

Decisiones documentadas el 2026-10-19. **No implementado.** La siguiente sesión
de implementación debe comenzar por la fase 1 y registrar aquí revisión, archivos,
pruebas y resultados. Conservar intactas las evidencias históricas y los pendientes
de dispositivo/selector/HTTP del trabajo anterior salvo verificación nueva real.
