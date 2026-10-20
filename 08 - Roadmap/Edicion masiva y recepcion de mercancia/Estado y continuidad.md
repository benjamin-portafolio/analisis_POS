---
tipo: seguimiento_implementacion
estado: sesion_6_automatizada_fisico_pendiente
revision_plan: 1
actualizado: 2026-10-19
---

# Estado y continuidad: edición masiva y recepción

Plan: [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Revisión 1]].
Aceptación: [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Matriz de aceptacion|M01–M48]].

## Estado actual

| Etapa | Estado |
|---|---|
| Evaluación del video y diseño con el usuario | Completada |
| Planificación y lectura de código | Completadas |
| 1. Contrato y borrador | Implementada y verificada en las capas de preparación; 43 pruebas específicas |
| 2. Edición comercial | Implementada y verificada en la capa de comando; 24 pruebas específicas |
| 3. Recepción y reintentos | Implementada y verificada localmente; 88 pruebas específicas con SQLite y cierres abruptos |
| 4. Interfaz por tarea | Implementada y verificada por acceso interno; 24 pruebas nuevas de controlador/UI |
| 5. Recepción compacta y revisión | Implementada y verificada localmente; menú público y 32 casos nuevos |
| 6. Verificación y cierre | Automatización local/remota y mediciones verificadas; M47 físico pendiente |

Las sesiones 1–5 implementan el contrato, core transaccional, diario y recorrido
público. «Edición masiva» abre dos composiciones del mismo borrador: por tarea y
recepción compacta. Ambas comparten validaciones, revisión, comandos y resultados;
venta/costo siguen independientes y las cantidades pendientes se sustituyen.
La revisión incluye filas ocultas, antes/después, proveedor/fecha, unidades,
sumas de entradas por unidad y previsión nueva cuando cambia el saldo.

La recuperación consulta el diario al abrir sin ejecutar, avisa de confirmadas
pendientes y permite continuar, revisar o cerrar pendientes. Los aplicados
recuperan sus IDs/resultados originales. Cancelar espera la transacción activa,
conserva commits y muestra los no iniciados. La entrega se consulta por evento,
separada del commit local y de la aceptación remota de las demás partes.
La sesión 6 verifica M01–M46 en su alcance automatizado local/remoto y M48
con mediciones de escritorio. Se corrigieron tres problemas de integración
Flutter: secuencia heredada en una base local pendiente, restauración de entrada
rechazada y preparación de la cadena optimista de recurso antes de aplicar el
oficial. Se conservaron el protocolo, servidor, CSV y escaneo. También se
ajustaron etiquetas/columnas estrechas y nombres completos en ambas vistas.

La suite completa registra **2423 aprobadas, cero fallos y cero omitidas**, con
los arneses HTTP/PostgreSQL aislados habilitados; las 10 integraciones omitidas
en sesión 5 ahora sí se ejecutan, además de los seis casos remotos nuevos.
`dart analyze`, build NestJS, 104 pruebas pertinentes de NestJS/PostgreSQL y
chequeo de tipos del arnés pasan. La evidencia final detalla comandos, deltas,
mediciones, incidencias intermedias y límites reales.

**No hay cierre completo:** M47 físico sigue pendiente por falta de teléfono/
tablet conectado. Los widgets, renders y SIGKILL de escritorio no acreditan
teclado, accesibilidad, reapertura ni rendimiento en hardware móvil.
Evidencia: [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Evidencia/2026-10-18-sesion-6/Verificacion y cierre|Verificación]],
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Evidencia/2026-10-18-sesion-6/Matriz verificada|Matriz por caso]] y
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Evidencia/2026-10-18-sesion-6/Rendimiento|Rendimiento]].

## Decisiones que se deben conservar

1. Dos vistas del mismo borrador: por tarea y recepción compacta.
2. Recepción incluye costo estándar, precio de venta y entrada; cambiar costo
   no recalcula venta. Proveedor predeterminado común y excepción por fila.
3. Costo capturado con proveedor actualiza estándar y pareja; conservar los
   demás proveedores. No hay proveedor principal ni sustitución global.
4. Entrada positiva sobre seguimiento directo; no conteo ni ajuste de saldo,
   receta, compra, gasto ni costo real por movimiento.
5. Guardado atómico local por producto y diario para reintentos de capturas
   confirmadas; resultados remotos separados por evento, sin otro protocolo.
6. `bulk_edit_operations` es metadato local, con excepción documentada a
   CommonFields. Mantener sus reservas/resultados al reabrir; el reset de
   desarrollo elimina también esta evidencia. Nunca interpretar saldo como
   prueba de ejecución ni commit local como aceptación remota.

## Estado observado de los repositorios

- Flutter HEAD `e5d9c7b`, con modificaciones/sin seguimiento de contrato,
  exportación, importación, DI y pruebas CSV; lector de Caja y sus pruebas;
  pruebas de escaneo de inventario y `tool/benchmarks/`. Preservar todo.
- NestJS HEAD `dcc2907`, sin cambios mostrados por `git status --short` en
  esta inspección. Se usó solo como referencia de los contratos existentes.
- Vault HEAD `b077dc7`, con continuidad y evidencia CSV ajenas a este plan.
  Esta entrega añade su carpeta y un enlace en el mapa del vault.

Estos datos corresponden a la planificación. Al iniciar esta implementación,
Flutter estaba limpio en `main`, HEAD `09a1529` (`Se implementa actualizacion
masiva en csv`). El CSV ya tiene sus sesiones 1–4 implementadas/verificadas
localmente, con pendientes físicos, del selector nativo macOS y HTTP detallados
en su propia continuidad. No rehacer ese flujo ni asumir que sigue en sesión 1.
El vault continúa en HEAD `b077dc7` con los cambios ajenos descritos en el
registro de esta sesión. Releer Git/AGENTS al retomar, sin resetear árboles ni
restaurar archivos ajenos. No se inspeccionó ni modificó NestJS en esta sesión.

## Próximo paso

Completar **M47 físico** en teléfono/tablet representativo, registrando modelo,
SO y build. Sin red, comprobar captura/revisión/commit, teclado/foco/selección,
Siguiente, retorno/orientación, texto ampliado y lector de pantalla. Cerrar antes
y después del commit y reabrir **la misma base con el diario conservado**;
reintentar sin duplicar movimientos. Medir en hardware para fijar presupuesto
de UX; los resultados del Mac no son garantía de tablet.

La automatización de M43–M46 y las mediciones de M48 ya están ejecutadas. No
rehacer sesiones 1–5 ni volver a implementar sincronización. Los arneses fueron
aislados y se detienen al terminar; no hubo despliegue ni acceso a bases del
usuario. Antes de repetirlos hay que iniciar otro cluster/servidor temporal,
no apuntar las variables de los tests a producción.

Mantener base/diario al reabrir. Un borrador sin confirmar sigue en memoria;
solo las intenciones confirmadas se recuperan. Revisar sobre estado nuevo es
explícito y requiere otra identidad para lo no aplicado. No repetir productos
aplicados ni convertir historial standalone en pendientes de sincronización.
La recuperación lee el historial completo del diario, sin purga/paginación;
el costo medido y sus límites están en `Evidencia/2026-10-18-sesion-6/Rendimiento.md`.

## Riesgos para la siguiente sesión

1. `actualizarArticulo` recibe un agregado completo; un formulario parcial
   puede borrar datos o activar caminos de inventario no solicitados. La sesión
   2 evita ese camino en lo comercial: relee el snapshot y superpone solo venta,
   costo y pareja. Al coordinar inventario en sesión 3, aplicar la misma
   relectura y no reutilizar agregados de alta.
2. `registrarMovimiento` conserva la semántica de sus consumidores anteriores.
   La recepción usa `registrarEntradaConfirmada`, que exige las bases revisadas
   de recurso/saldo. No sustituir esta variante estricta por el comando anterior.
3. Seleccionar proveedor global no debe retargetear costos ya capturados ni
   crear relaciones al editar solo venta/cantidad.
4. El servidor confirma cada evento por separado. Commit local y captura
   completamente aceptada no son equivalentes; no duplicar entradas al resolver.
5. UUID por invocación y botón deshabilitado no acreditan idempotencia de una
   captura. Probar el cierre posterior al commit y reabrir el mismo diario.

## Cómo cerrar y retomar una sesión

Actualizar la tabla de estado y añadir un registro con fecha, revisión del
plan/HEAD, archivos tocados, cambios ajenos preservados, casos M cubiertos,
comandos/resultados, evidencia, límites y siguiente archivo de sesión.
No repetir fases terminadas; releer su contrato y continuar desde el estado.
Si cambia una decisión, actualizar plan y matriz antes de seguir el código.
No marcar pruebas físicas o remotas aprobadas por pasar pruebas de escritorio.

### 2026-10-18 — Planificación

Se revisaron AGENTS, guías offline, comandos de producto/inventario, contratos,
capacidad transaccional local, tabla de proveedores y aplicación remota.
Se creó plan de seis sesiones, matriz M01–M48 y encargos para retomarlo.
La implementación permanece pendiente; no hubo despliegue ni acceso a bases
del usuario. La comprobación de esta entrega es documental.

### 2026-10-18 — Sesión 1: contrato, lectura y borrador

**Revisión:** plan 1, Flutter HEAD `09a1529`, vault HEAD `b077dc7`.
Implementación nueva en el árbol de trabajo, sin commit. Se leyeron los AGENTS
aplicables, las dos guías offline-first, los cuatro documentos de este plan,
la continuidad actual del CSV y sus contratos/lecturas implementadas.

**Trabajo ajeno preservado:** Flutter estaba limpio al comenzar; ningún archivo
preexistente de Flutter fue modificado. En el vault ya estaban modificados
`00 - Inicio/Mapa del vault.md`, el estado y la matriz de CSV, y sin seguimiento
su evidencia y la carpeta de este plan. Se editó únicamente este estado y se
añadió la evidencia de sesión 1; no se restauró ni limpió el resto.

**Archivos nuevos en Flutter** (rutas relativas a ese proyecto):

- `lib/application/edicion_masiva/`: `clave_variante.dart`,
  `cambio_explicito.dart`, `base_revision_masiva.dart`,
  `base_entrada_masiva.dart`, `fila_catalogo_masivo.dart`,
  `lectura_edicion_masiva.dart`, `catalogo_edicion_masiva.dart`,
  `entrada_mercancia_masiva.dart` y `cambio_variante_masiva.dart`.
- `lib/domain/articulos/importe_comercial_codec.dart`.
- `lib/data/repositories/drift_catalogo_edicion_masiva.dart`.
- `lib/presentation/pages/gestion_inventario/edicion_masiva/`:
  `fila_edicion_form.dart`, `fila_revision_masiva.dart`,
  `revision_edicion_masiva.dart` y `borrador_edicion_masiva.dart`.
- `test/domain/articulos/importe_comercial_codec_test.dart`.
- `test/presentation/pages/gestion_inventario/edicion_masiva/borrador_edicion_masiva_test.dart`.

**Contrato y comportamiento comprobado:**

- Conservar/establecer son intenciones explícitas. Venta y costo son
  independientes; costo desconocido sin tocar se conserva y cero es conocido.
  Importes exactos mediante `BigInt`, máximo seguro y hasta dos decimales;
  coma/punto equivalen. Se reutilizan los value objects de precios y el
  `InventoryQuantityCodec`. No se altera el redondeo propio del CSV.
- El puerto de lectura pagina de 1 a 200 filas y lee destinos por conjuntos
  de hasta 400 IDs. Une producto/variante, bases, unidad comercial, vínculo
  directo, recurso y saldo; solo consulta existencia de receta y las parejas
  necesarias. No hidrata snapshots completos ni consulta historial de eventos.
  Las consultas de cada lectura comparten transacción SQLite. La prueba de
  dos conexiones acredita que no mezcla precio y pareja de estados distintos;
  `NativeDatabase` bloquea al escritor con su `BEGIN IMMEDIATE` hasta terminar
  esa lectura. Esto no crea una reserva de ejecución ni filas persistidas.
- El borrador de pantalla se indexa por `ClaveVariante(productId, variantId)`.
  Guarda texto crudo, proveedor y fecha por fila; búsqueda, tarea, vista,
  filtro y selección no sustituyen las capturas. La primera base del producto
  se comparte entre sus variantes. Capturas concurrentes sobre una misma fila
  conservan todos sus campos y comparten su carga inicial.
- El proveedor global se fija al comenzar cada primera captura de costo,
  antes de esperar la lectura. Cambiarlo conserva las filas ya capturadas,
  incluidas las capturadas sin proveedor. El detalle puede elegir otro
  proveedor/fecha explícitamente con costo informado. Venta o cantidad solas
  no modifican parejas. Una pareja idéntica no refresca su fecha; un precio
  diferente o pareja nueva conserva la fecha de captura serializada a UTC.
- La entrada pendiente sustituye la anterior; vacío/cero la omiten. Se
  validan signo, decimales, magnitud atómica y rango del saldo previsto.
  Recetas, ausencia de seguimiento directo y recursos/unidades/saldos no
  disponibles explican el impedimento sin bloquear cambios comerciales.
  En medidos se conservan la referencia común de precios y ambas unidades.
- `prepararRevision()` relee todo el borrador, incluidas las filas ocultas,
  y clasifica cambios, errores y no-op. `revision.cambios` rechaza una revisión
  con cualquier error. Conserva las bases originales y expone la foto actual
  si cambió producto, vínculo, recurso, unidad o saldo; los ecos de la misma
  base no invalidan la propuesta. No sustituye silenciosamente la base.

**Casos de aceptación cubiertos en la responsabilidad de sesión 1:**

| Casos | Evidencia y límite |
|---|---|
| M01 | Apertura/preparación vacía, búsqueda, edición, filtro/vista y revisión: auditoría de cero sentencias de escritura y comparación exacta de todas las tablas en standalone y server_sync con fixtures creados por comandos reales. El recorrido de pantallas corresponde a sesiones 4–5. |
| M02 | Nombres repetidos, varias variantes del mismo producto, orden distinto y pertenencia incorrecta conservan/rechazan destinos por IDs. |
| M03, M11 | Una fila por identidad, sustitución de cantidad y proveedor global solo para nuevas capturas; texto, errores y selección conservados en el core compartido. Verificación visual posterior pendiente. |
| M04–M06 | Equivalencia decimal, rangos/precisión, cero/vacío, costo desconocido, cantidades positivas/omitidas/inválidas y átomos no representables. La ejecución comercial/de entradas se verificará en sesiones 2–3. |
| M16, M18 | Referencia medida común y unidad distinta del recurso; explicación de entrada bloqueada por receta/sin seguimiento, manteniendo cambios comerciales. UI posterior pendiente. |
| M25 | Revisión idéntica produce cero intenciones ejecutables y cero escrituras/refs/reservas. El no-op del comando de guardado se acredita en el registro de sesión 2 (estado completo idéntico y «solo entrada»). |

**Comandos y resultados** (ejecutados desde Flutter):

- `flutter test test/domain/articulos/importe_comercial_codec_test.dart test/presentation/pages/gestion_inventario/edicion_masiva/borrador_edicion_masiva_test.dart --reporter expanded`: **43 aprobadas**, cero fallos.
- `dart analyze`: **No issues found!**, salida 0.
- `flutter test --reporter expanded`: **2234 aprobadas, cero fallos, 10 omitidas**,
  salida 0. Las omisiones preexistentes necesitan `POS_PHASE3_SYNC_URL` o
  `POS_SUPPLIER_SYNC_URL` con NestJS/PostgreSQL aislados; no se aprobaron.
- `git diff --check`: sin problemas; además se comprobó whitespace de los
  17 archivos nuevos mediante `git diff --no-index --check /dev/null <archivo>`,
  ya que Git todavía los muestra sin seguimiento.
- Revisión de imports, dependencias entre capas, referencias y código sin uso:
  sin imports sobrantes, clases huérfanas, TODOs, placeholders ni dependencias
  nuevas. El core de preparación está probado, sin DI/pantalla pública todavía.
  Se confirmó que «Edición masiva» sigue con callback nulo.
- No cambió Drift, por lo que no correspondía ejecutar `build_runner`.

**Evidencia:** `Evidencia/2026-10-18-sesion-1/` contiene
`pruebas-enfocadas.log`, `dart-analyze.log`, `flutter-test.log` y
`git-diff-check.log`. La primera pasada enfocada corrigió dos expectativas de
prueba (costo ya igual en el medido y bloqueo del escritor SQLite); la evidencia
guardada contiene la pasada final aprobada.

**Límites y continuidad:** no hay guardado, diario, IDs/reservas de operación,
eventos nuevos, movimientos, pantallas públicas ni cambios de servidor.
El borrador es exclusivamente en memoria y no promete recuperación tras cerrar
el proceso. La lectura de parejas no representa conocimiento legado del
snapshot: sesión 2 debe releer y conservar explícitamente null/[]/poblado.
Detección de base obsoleta en preparación no sustituye validación dentro del
commit; recuperación/confirmación de propuestas obsoletas corresponde a fases
posteriores. No se ejecutaron pruebas físicas, rendimiento formal M48 ni remoto.

**Siguiente paso:** sesión 2, comando comercial acotado por producto,
preservación del agregado completo, evento único o no-op sin evento y refs
según modo, usando las intenciones/bases actuales. Entradas y diario continúan
reservados para sesión 3; la interfaz pública para sesiones 4–5.

### 2026-10-18 — Sesión 2: edición comercial acotada por producto

**Revisión:** plan 1, Flutter HEAD `09a1529`, vault HEAD `b077dc7`.
Implementación nueva en el árbol de trabajo, sin commit. Se leyeron los AGENTS
aplicables, las guías offline de Flutter, el plan, esta continuidad, la matriz y
el encargo de sesión 2; se releyeron los contratos y la aplicación existentes
(`ProductoActualizadoPayload`/`ProductoCreadoPayload`, proyección Drift,
almacén de eventos local) y los artefactos de sesión 1.

**Trabajo ajeno preservado:** en Flutter ya estaban modificados/sin seguimiento
los archivos de contrato/CSV y la sesión 1; se modificó únicamente
`lib/application/commands/articulos/producto_command_service.dart` y un doble de
prueba preexistente, y se añadieron los archivos de esta sesión. En el vault ya
estaban modificados el mapa y la continuidad/matriz de CSV, y sin seguimiento su
evidencia; solo se editó este estado y se añadió la evidencia de sesión 2. No se
restauró ni limpió nada ajeno.

**Archivos nuevos en Flutter** (rutas relativas a ese proyecto):

- `lib/application/commands/articulos/editar_articulo_comercial_command.dart`:
  comando tipado `EditarArticuloComercialCommand(productId, base, cambios)`.
- `lib/application/commands/articulos/editar_articulo_comercial_result.dart`:
  resultado tipado con `emitido({productId, eventId})` y `omitido({productId})`.
- `test/application/commands/articulos/editar_articulo_comercial_test.dart`:
  12 pruebas reales de SQLite duplicadas en standalone y server_sync (24 casos).

**Archivos modificados en Flutter:**

- `lib/application/commands/articulos/producto_command_service.dart`: método
  público `editarArticuloComercial` sobre `runInTransaction`, preparación
  `_prepareEdicionComercial`, superposición `_aplicarCambioComercial` y
  `_superponerProveedor`, validación `_validarProveedorIncorporado` y helper
  compartido `_currentInventoryDependencies` reutilizado por el CSV.
- `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`:
  el doble `_FakeProductoCommandService` implementa el nuevo método (no-op).

**Contrato y comportamiento comprobado:**

- El comando valida base confirmada (id, versión, evento vivo y `eventId` no
  nulo), cambios no vacíos, pertenencia por producto, eco de la misma base por
  cambio (`mismoEstado`), variante única, activa y del producto, y proveedor
  incorporado activo/existente. Falla con `StateError`/`FormatException` sin
  escribir.
- Relee el snapshot completo (`snapshot`, no `_snapshotForEdit`) y construye el
  `after` con `ProductoCreadoPayload.create`, conservando nombre, categoría,
  orden, códigos de barras, `inventoryItemId`, receta, configuración de venta y
  demás parejas/fechas. No usa comandos de alta ni valores por defecto.
- Costo con proveedor actualiza estándar y esa pareja juntos; costo sin
  proveedor solo el estándar; la venta no toca costo ni proveedores. Una pareja
  idéntica conserva su `quotedAtMs`; un precio distinto o pareja nueva usa la
  fecha informada (ya en UTC por el borrador), y las parejas se reordenan con
  `ProductoProveedorPrecio.validate`.
- Varias variantes producen un único `producto_actualizado` con
  `baseEventId` = base revisada. `sameState(before, after)` real → sin evento,
  sin refs, sin versión ni respaldo.
- `CambioVarianteMasiva.entrada` se ignora: una fila con solo entrada no emite
  `producto_actualizado` (alcance de sesión 3).
- Conocimiento legado: el snapshot se lee crudo; solo cuando una pareja
  explícita lo exige se promueve con `withKnownSuppliers()` (null→[]), de modo
  que `before`/`after` coinciden y `sameEditingBase` sigue válido. Editar sin
  incorporar pareja conserva la ausencia de conocimiento.
- Resultado tipado: `EditarArticuloComercialResult.emitido` expone el
  `eventId`; `omitido` no lo expone. Permite a la sesión 3 registrar el ID
  dentro de su transacción sin buscar «el último».
- Refleja refs por modo mediante `_buildArticleRefs`: declaradas/validadas en
  standalone y server_sync; persistidas en `event_refs` solo en server_sync
  (`delivery_status = not_required` sin filas en standalone).

**Casos de aceptación cubiertos en la responsabilidad de sesión 2:**

| Casos | Evidencia y límite |
|---|---|
| M04–M05 | Costo cero válido y venta cero rechazada por el value object; costo conocido/desconocido conservado. La equivalencia decimal fina sigue en el códec de sesión 1. |
| M07–M09 | Un solo evento superpone solo lo pedido; venta independiente del costo; costo sin proveedor cambia el estándar y conserva parejas/pistas. |
| M12–M16 | Variante y proveedor válidos, estándar igual con pareja distinta/nueva no es no-op, fecha conservada en pareja idéntica frente a fecha UTC en cambio nuevo, legado null/[]/poblado y medido con referencia/ambas unidades. |
| M19–M20 | Destinos inválidos rechazan sin escribir; base obsoleta rechaza sin sustituir la base viva. |
| M23–M25 | Un único `producto_actualizado` por varias variantes; conservación total del agregado; estado idéntico o «solo entrada» omiten sin evento/ref/versión/respaldo. |
| M41–M42 | Standalone declara/valida refs pero no persiste `event_refs` ni inicia transporte; server_sync persiste refs y conserva base pendiente hasta aceptarse. |
| M01, M02, M03, M06, M11, M18 | Fuera del alcance de comando: pertenecen a sesión 1 (lectura/borrador) y a sesiones 3–5 (entradas/UI). |

**Comandos y resultados** (ejecutados desde Flutter):

- `flutter test test/application/commands/articulos/editar_articulo_comercial_test.dart --reporter expanded`: **24 aprobadas**, cero fallos.
- `dart analyze`: **No issues found!**, salida 0. La primera pasada detectó que
  el doble `_FakeProductoCommandService` no implementaba el nuevo método; se
  añadió la implementación no-op y la segunda pasada quedó limpia.
- `flutter test --reporter expanded`: **2258 aprobadas, cero fallos, 10 omitidas**,
  salida 0 (+24 respecto de la línea base 2234 + 10 omitidas). Las omisiones
  preexistentes siguen necesitando NestJS/PostgreSQL aislados; no se aprobaron.
- `git diff --check`: sin problemas en ambos repos; además se comprobó
  whitespace de los 20 archivos sin seguimiento con
  `git diff --no-index --check /dev/null <archivo>`.
- Revisión de limpieza: sin imports sobrantes, código muerto, TODOs ni
  dependencias nuevas. El helper `_currentInventoryDependencies` se comparte con
  el CSV por necesidad real, conservando alcances distintos. No cambió Drift,
  por lo que no correspondía `build_runner`.

**Evidencia:** `Evidencia/2026-10-18-sesion-2/` contiene `pruebas-enfocadas.log`,
`dart-analyze.log`, `flutter-test.log` y `git-diff-check.log` con la pasada
final aprobada.

**Límites y continuidad:** no hay entradas/recepción, diario, IDs de operación,
pantallas públicas ni cambios de servidor. El comando comercial no toca
inventario, recetas ni memoria de seguimiento. `CambioVarianteMasiva.entrada` se
ignora deliberadamente; su ejecución y la transacción conjunta con el diario
corresponden a la sesión 3. La lectura de conocimiento legado se resuelve aquí
promoviendo a un único formato conocido cuando hace falta una pareja; la
importación de historial legado queda para fases posteriores. No se ejecutaron
pruebas físicas, rendimiento formal M48 ni remoto.

**Siguiente paso:** sesión 3, recepción de mercancía y diario de reintentos
dentro de la misma transacción local, usando el `eventId` tipado devuelto por
este comando y la validación de base/vínculo/saldo existente. La interfaz
pública continúa reservada para sesiones 4–5.


### 2026-10-18 — Sesión 3: recepción, transacción e idempotencia

**Revisión:** plan 1, Flutter HEAD `09a1529` (`main`), vault HEAD `b077dc7`.
Se leyeron AGENTS, guías offline-first, plan, continuidad, matriz y encargo de
sesión 3. Se revisaron sesiones 1–2, el estado Git y la continuidad/implementación
CSV vigente; las sesiones CSV 1–4 ya están implementadas localmente.

**Trabajo ajeno preservado:** Flutter ya tenía las sesiones 1–2 sin commit
(`ProductoCommandService`, su doble de pantalla y los archivos nuevos del core
comercial/borrador). No se restauraron ni rehicieron. El CSV, lector de Caja y
sus contratos/DI se conservan. El vault ya tenía cambios en mapa, estado/matriz
y evidencia CSV; solo se modificó esta continuidad y se añadió evidencia aquí.
No se modificó NestJS ni se accedió a datos del usuario. Todo sigue sin commit.

**Archivos nuevos en Flutter** (rutas relativas a ese proyecto):

- `lib/application/commands/edicion_masiva/edicion_masiva_command_service.dart`:
  `confirmar`, `ejecutar`, `continuar`, `pendientes`, `cerrarPendientes` y
  consulta de eventos originales para conocer su entrega actual.
- `lib/application/commands/inventario/registrar_entrada_confirmada_command.dart`
  y `registrar_entrada_confirmada_result.dart`: base revisada/cantidad y IDs
  tipados de recurso, evento y movimiento.
- `lib/application/edicion_masiva/`: `diario_edicion_masiva.dart`,
  `unidad_trabajo_masiva.dart`, `operacion_edicion_masiva.dart`,
  `registro_operacion_masiva.dart`, `resultado_operacion_masiva.dart` y
  `resultado_ejecucion_masiva.dart`.
- `lib/data/local/drift/tables/bulk_edit_operations.dart`,
  `daos/bulk_edit_operation_dao.dart` y `drift_diario_edicion_masiva.dart`.
- `docs/architecture/bulk_receipt_operations.md`: contrato de uso, transacción,
  identidad, esquema/campos, CommonFields, modos, recuperación y límites.
- `test/application/commands/edicion_masiva/edicion_masiva_command_service_test.dart`
  (71 pruebas) y `recepcion_reapertura_test.dart` (17 pruebas).
- `test/support/recepcion_masiva_fixture.dart` y
  `recepcion_masiva_crash_worker.dart`: fixtures reales y trabajador que el
  test padre termina con SIGKILL; este helper no es un test de descubrimiento.

**Archivos modificados en Flutter:**

- `lib/application/commands/inventario/inventory_command_service.dart`: nueva
  variante estricta con transacción real e historial; conserva sin cambios
  funcionales `registrarMovimiento` y sus consumidores.
- `lib/data/local/drift/app_database.dart`: registro de tabla/DAO.
- `lib/data/local/drift/app_database.g.dart`: regeneración Drift.
- `lib/data/local/drift/current_database_schema.dart`: exige columnas del diario
  e índice único de captura/producto en arranque y restore.
- `docs/architecture/offline_feature_flow.md`: enlace al contrato implementado.

**Comportamiento implementado:**

- Confirmar agrupa variantes por producto y reserva el conjunto antes de
  iniciar negocio. Omite filas sin cambios. Una captura/producto tiene UUID v5
  determinista y una intención JSON canónica versionada, con filas ordenadas
  por ID, valores enteros, proveedor/fecha y bases de producto/recurso/saldo,
  vínculo y unidad confirmados. Cambiar orden no cambia identidad ni intención.
- Una reserva se conserva como `confirmada`. El fallo mantiene ese estado;
  `aplicada` guarda IDs originales y `cerrada` retira explícitamente pendientes
  obsoletos. No se borra evidencia de operaciones aplicadas. No se persiste
  el borrador de cada pulsación.
- El adaptador construye comandos, handlers, lectura, historial y DAO con la
  misma instancia AppDatabase. Cada ejecución usa su transacción exterior
  real; no acepta un fallback serial como garantía. La reserva previa se
  mantiene aunque el producto completo se revierta.
- Primero se consulta la identidad y se compara intención. Aplicada devuelve
  el resultado original antes de validar bases antiguas; un ID reutilizado
  con intención diferente o una revisión cerrada se rechaza. Después se
  validan modo, actividad, pertenencia, producto/base, vínculo, recurso/base,
  unidad y saldo/base confirmados. No se rebasan propuestas obsoletas.
- Se ejecuta el comando comercial existente (evento único o no-op) y una
  entrada positiva stock_receipt por recurso con cantidad. Inventario valida
  su base esperada, revisión del saldo, representabilidad/rango e historial
  permitido, sin aceptar silenciosamente la base viva. El costo del movimiento
  sigue null; no se añade dependencia remota ficticia al evento de catálogo.
- Los IDs de comandos se guardan en el resultado del diario antes del commit,
  dentro de esa misma transacción. Un fallo revierte catálogo, movimientos,
  saldos, eventos, refs, respaldos y resultado aplicado de ese producto.
  Otros productos continúan secuencialmente y los reintentos devuelven los
  resultados originales de los ya aplicados.
- `pendientes()` solo lee y no ejecuta al arrancar. `continuar()` es explícito
  y revalida cada pendiente. Cerrar una propuesta y confirmar otra requiere
  nuevo batchId y solo los productos pendientes revisados por la persona;
  la interfaz para esta decisión corresponde a sesiones 4–5.
- Los eventos originales se consultan aparte para entrega/conflicto actual;
  un conflicto remoto no reabre ni vuelve a sumar la recepción local.
  Una pendiente en otro modo se bloquea. El historial standalone no se
  promueve, ni se reconstruyen refs, al reservar una captura en server_sync.

**Diario y esquema:** `bulk_edit_operations` documenta cada campo y su excepción
a CommonFields: es ejecución local durable, sin active/versión de agregado/
secuencia oficial, sin sincronización ni event_refs propios. Tiene PK de
operación e índice único batch/producto; el producto no tiene FK para conservar
la evidencia incluso si se elimina después. Mantiene schemaVersion **8** y no
se añadió ninguna migración ni rama onUpgrade; el onUpgrade preexistente no
se alteró. El esquema nuevo se conserva entre arranques. El anterior admite
el reset de desarrollo; una base restaurada protegida se rechaza intacta.

**Casos de aceptación cubiertos en la responsabilidad local de sesión 3:**

| Casos | Evidencia y alcance |
|---|---|
| M06 | Cantidad positiva, rango seguro, saldo previsto y magnitud no representable rechazan sin aplicación parcial; vacío/cero sigue omitido por la preparación de sesión 1. |
| M10, M17, M24–M25 | Entrada sola conserva catálogo/memoria/proveedores y no emite producto redundante; varias variantes generan un catálogo y movimientos solo donde hay entrada, saldo + delta, costo null e IDs originales. Filas omitidas no reservan ni escriben. |
| M19–M22 | Duplicados, pertenencia, destinos inexistentes/inactivos, bases dispares/obsoletas, vínculo/receta, actividad/unidad/base del recurso y cambios de saldo se rechazan. Volver al mismo saldo por dos movimientos no acredita idempotencia. Los ecos de las mismas bases acreditan secuencia sin sustituir el evento base. La nueva confirmación visual del saldo corresponde a sesión 5. |
| M26 | Triggers SQLite fallan antes del primer movimiento (catálogo ya aplicado), al comenzar el segundo (primer movimiento completo) y antes de registrar resultado. Comparación exacta de todas las tablas demuestra rollback de catálogo, eventos, refs, respaldos, saldos, movimientos y diario aplicado en ambos modos. |
| M27 | Tres productos: primero/tercero confirman, segundo se revierte completo; reintento conserva resultados/entradas de los exitosos y aplica solo el pendiente. |
| M28–M29 | Doble ejecución concurrente y repetición posterior devuelven JSON/IDs idénticos sin nuevas escrituras; mismo ID/intención distinta falla; recepción nueva explícita usa otra identidad. |
| M30 | SIGKILL del subproceso flutter_tester con SQLite en disco, antes y después del commit, en ambos modos. Antes: solo reserva confirmada, cero efectos de producto; después: una aplicación con resultado durable. Reapertura y reintento dejan exactamente una recepción. |
| M31 | Diario, eventos y proyecciones sobre la misma base/transacción; reapertura reconstruye resultado original y consulta entrega actual por ID. Cambiar entrega a conflicto no altera el diario ni genera otra entrada. La aceptación remota real queda para sesión 6. |
| M32, M34 | Reapertura ofrece lectura de pendientes sin ejecutar; continuación bajo otro modo se bloquea sin convertir eventos/refs. Propuesta obsoleta se cierra y confirma bajo identidad nueva; aplicadas conservadas. La oferta visual de recuperación queda para sesión 5. |
| M33 | Reapertura con arranque real conserva esquema/diario; falta de tabla, columna o índice provoca reset permitido o rechazo intacto si protegida. VACUUM INTO y restore vigentes conservan diario, negocio, eventos, pendientes e integridad; restore sin diario se rechaza antes de reemplazar. |
| M41–M42 | Standalone conserva not_required y cero event_refs; server_sync conserva refs y bases/dependencias vigentes. El adaptador solo compone servicios locales, sin transporte. Historial standalone de producto/recurso en server_sync se rechaza. Capability/HTTP y aceptación parcial remota siguen para sesión 6. |

**Comandos y resultados:**

- `dart run build_runner build`: salida **0**, regeneración final correcta;
  schemaVersion sigue 8, sin migración nueva.
- `flutter test test/application/commands/edicion_masiva --reporter expanded`:
  **88 aprobadas**, cero fallos (71 de coordinación y 17 de disco/esquema/backup).
- `dart analyze`: **No issues found!**, salida **0**.
- `flutter test --reporter expanded`: **2346 aprobadas, cero fallos, 10 omitidas**,
  salida **0** (+88 sobre las 2258 de sesión 2). Las omisiones HTTP preexistentes
  requieren NestJS/PostgreSQL aislados; no se consideran aprobadas.
- `git diff --check`: salida **0** en Flutter y vault. Se comprobaron además
  los **37 archivos fuente .dart/.md sin seguimiento de Flutter**, incluidos los
  de sesiones anteriores, mediante diff --no-index --check contra /dev/null.
- Limpieza: análisis sin imports/métodos sobrantes, sin dependencias nuevas,
  TODOs ni placeholders. Sin imports Drift en aplicación/dominio. El core se
  ejercita desde pruebas; su conexión a UI/DI pública está reservada por el
  alcance de sesión 4–5, no se añadió una pantalla de guardado parcial.

**Evidencia:** `Evidencia/2026-10-18-sesion-3/` contiene `build-runner.log`,
`pruebas-enfocadas.log`, `dart-analyze.log`, `flutter-test.log` y
`git-diff-check.log` de las pasadas finales. La suite completa emite advertencias
Drift de instancias múltiples en pruebas de esquema/backup existentes; termina
con salida 0. Las pruebas nuevas de cierre terminan intencionalmente el proceso
hijo y el padre acredita la recuperación; ese cierre no es un test omitido.

**Límites:** la atomicidad es local por producto. No se implementaron interfaz
pública, servidor ni protocolo/dependencias remotas nuevos. Los tests no
acreditan M43–M48 remotos/físicos/rendimiento. Un reset elimina también el
identificador/evidencia local; un snapshot conserva solo operaciones presentes
al tomarlo. Restaurar uno anterior no recupera ejecuciones posteriores ni
autoriza reejecutarlas suponiendo que no ocurrieron. No hay recuperación de
borradores no confirmados. La recuperación visual, errores/foco y cancelación
entre productos se integrarán en las sesiones de interfaz.

**Siguiente paso:** sesión 4, vista por tarea con el borrador compartido y este
coordinador como único acceso de ejecución. Mantener deshabilitado el acceso
público hasta completar recepción compacta y revisión en sesión 5.


### 2026-10-18 — Sesión 4: interfaz por tarea y navegación interna

**Revisión:** plan 1, Flutter HEAD `09a1529` (`main`), vault HEAD `b077dc7`.
Se retomó el árbol sin commit: sesiones 1–3 y una primera implementación de
pantalla/controlador/pruebas de sesión 4 ya estaban presentes. Se leyeron AGENTS,
ambas guías offline-first, plan, continuidad, matriz, encargo de sesión 4 y estado
CSV, y se contrastaron el borrador y coordinador existentes. No se repitieron las
sesiones anteriores ni se modificaron NestJS, dependencias o esquema Drift.

**Trabajo ajeno preservado:** se conservaron los cambios previos de comandos,
Drift/generados, diario, contratos y fixtures de sesiones 1–3 y su doble de
`inventory_management_screen_test.dart`. CSV y escaneo siguen sobre HEAD
`09a1529`, sin cambios de esta sesión. En el vault se preservaron mapa, estado,
matriz y evidencia CSV; se actualizó únicamente esta continuidad y se añadió la
evidencia de sesión 4. No hubo reset, limpieza de cambios ajenos ni commit.

**Archivos de Flutter completados/verificados** (rutas relativas al proyecto):

- `lib/presentation/pages/gestion_inventario/edicion_masiva/pantalla_edicion_masiva_por_tarea.dart`:
  navegación interna, tarea, búsqueda con debounce, proveedor predeterminado,
  contador/filtro, revisión, salida con continuar/descartar y protección de rutas.
- En esa misma carpeta, `controlador_edicion_masiva.dart`: paginación de 100,
  descarte de respuestas de búsquedas/páginas antiguas, controladores/foco por ID,
  notificaciones por fila, espera de capturas en curso y ejecución por el único
  coordinador existente. `borrador_edicion_masiva.dart` añade validación local
  reutilizando su normalización, sin nuevas lecturas/escrituras por pulsación.
- `listado_edicion_masiva.dart` y `fila_edicion_masiva.dart`: slivers perezosos,
  identidad estable y recuperación de selección, importes actuales precargados,
  propuesta textual, error junto al campo, unidad/referencia comercial y saldo
  previsto; entrada bloqueada con explicación cuando no hay seguimiento directo
  o existe receta. El encabezado se desplaza para dar espacio al campo/teclado.
- `detalle_proveedor_fila.dart`: proveedor efectivo, pareja actual y fecha;
  abrir detalle no crea captura. Su contenido desplaza y respeta los insets del
  contexto de la hoja. Cambiar proveedor global conserva las filas capturadas.
- `pantalla_revision_edicion_masiva.dart` y `fila_revision_edicion_masiva.dart`:
  todas las capturas sin aplicar la búsqueda/filtro de edición, diferencias
  textuales, proveedor/fecha efectiva, ambas unidades, entradas, foto nueva ante
  base obsoleta, corrección al volver y retirada explícita. Guardar/retirar no se
  admiten simultáneamente; botones accesibles con teclado simulado abierto.
- `resultado_guardado_masivo.dart` y `resultados_edicion_masiva.dart`: resultado
  local por producto y errores comprensibles; retorno correcto a captura y
  conservación de lo no aplicado. No se presenta commit local como aceptación
  remota. La consulta visual de entrega por evento se completa en sesión 5.
- Pruebas nuevas/completadas:
  `test/presentation/pages/gestion_inventario/edicion_masiva/controlador_edicion_masiva_test.dart`
  y `edicion_masiva_task_screen_test.dart` (**24 casos**). Se conserva y ejecuta
  `borrador_edicion_masiva_test.dart` de sesión 1, sin reemplazar su cobertura.

**Reglas y protección de ejecución:**

- Escribir, abrir detalle, buscar, cambiar tarea/proveedor/filtro y preparar
  revisión no reservan ni emiten eventos/movimientos. Campos sin tocar conservan
  valor; costo cero y vacío se distinguen, venta debe ser positiva y costo no
  recalcula venta. Entradas vacías/cero se omiten; negativos/precisión inválida
  se explican mediante los codecs existentes, sin `double`.
- «Solo cambios» y contador excluyen importes equivalentes y conservan filas con
  errores. Controladores viven por `ClaveVariante(productId, variantId)`; las
  pulsaciones notifican su fila, sin reconstruir el listado en cada pulsación.
  Las claves del sliver y la búsqueda conservan texto/selección por identidad.
- La revisión espera capturas que aún estén leyendo su base y relee todo el
  borrador. Una base nueva se muestra y bloquea; no reemplaza la confirmada.
  Volver conserva textos y errores; retirar es una acción explícita.
- Guardado secuencial mediante `confirmar`/`ejecutar`, sin imports Drift en UI.
  Bloquea guardados simultáneos; repetir la revisión ya aplicada devuelve su
  resultado. Éxitos salen del borrador y fallos permanecen; las pendientes
  conservan identidad. Una propuesta pendiente distinta se bloquea con mensaje,
  para resolverla explícitamente en la recuperación de sesión 5.
- Cerrar durante búsqueda, lectura de captura o preparación no navega ni
  notifica objetos destruidos. Cerrar antes de recibir la confirmación no inicia
  ejecución con su respuesta tardía; la reserva ya iniciada puede quedar en el
  diario para recuperación. Un producto ya iniciado puede terminar; no se
  comienzan los siguientes ni se navega con su respuesta tardía. Durante ese
  término se deshabilitan captura/revisión para no aceptar texto que se pierda.

**Casos de aceptación comprobados:**

| Casos | Evidencia y alcance |
|---|---|
| M01 | Controlador con SQLite real y auditoría en standalone/server_sync: foto completa idéntica, cero escrituras/historial/reservas durante captura y revisión. Recorrido widget audita búsqueda/filtro/edición y continuar/descartar sin escribir. |
| M35 | Búsqueda por artículo/variante, contador independiente del filtro, no-op, Solo cambios, cambio de tarea, texto/errores/selección por ID y salida continuar/descartar. Recepción compacta/cambio de vista siguen en sesión 5. |
| M37 | Revisión incluye filas ocultas y errores ocultos, antes/después textual, costo/proveedor/fecha, unidad/suma, base obsoleta con foto nueva, retirada explícita y vuelta con captura conservada. Guardado interno real y resultados por producto. |
| M38 | Teclado apropiado, Siguiente/foco, notificaciones acotadas, búsquedas y páginas fuera de orden; cierre durante lectura, preparación, confirmación y producto en curso, sin navegación tardía ni inicio del siguiente escritor. |
| M47, por tarea | Widgets a 320/360/390 y 800 px, altura 640, nombres largos, tres tareas, teclado simulado con inset 280, geometría del campo/botón y revisión desplazable sin overflow. Proveedor/detalle también a 320 px. Verificación física pendiente. |
| Regresión M04–M06, M09/M11/M18/M20, M25–M34/M41–M42 | Codecs y core comercial/recepción reales conservan casos previos, incluida SQLite, rollback, ambos modos y cierre/reapertura. UI añade costo cero/vacío, venta independiente, negativa inválida, proveedor global sin reasignación y base obsoleta sin pérdida. |

**Comandos y resultados finales** (desde Flutter):

- `flutter test test/domain/articulos/importe_comercial_codec_test.dart test/presentation/pages/gestion_inventario/edicion_masiva test/application/commands/articulos/editar_articulo_comercial_test.dart test/application/commands/edicion_masiva --reporter expanded`:
  **179 aprobadas**, cero fallos.
- `flutter test test/presentation/pages/gestion_inventario/edicion_masiva --reporter expanded`:
  **65 aprobadas**, cero fallos (incluye regresión de borrador).
- `dart analyze`: **No issues found!**, salida **0**.
- `flutter test --reporter expanded`: **2370 aprobadas, cero fallos, 10 omitidas**,
  salida **0**. Son las integraciones HTTP preexistentes que requieren
  `POS_PHASE3_SYNC_URL` o `POS_SUPPLIER_SYNC_URL` con infraestructura aislada;
  no se consideraron aprobadas ni se contactó producción.
- `git diff --check`: salida **0** en Flutter y vault. Además se comprobaron
  **48 archivos fuente .dart/.md sin seguimiento de Flutter** contra `/dev/null`.
- Sin imports de Drift/data local en UI, TODOs/implementaciones vacías ni
  dependencias nuevas. El callback de `bulk_edit_option` sigue literalmente
  `null`; no se implementó recepción compacta ni un guardado alternativo.
  No correspondió regenerar Drift en esta sesión.

**Evidencia:** `Evidencia/2026-10-18-sesion-4/` conserva `pruebas-enfocadas.log`,
`pruebas-ui.log`, `dart-analyze.log`, `flutter-test.log` y `git-diff-check.log`.
La primera pasada al retomar encontró errores reales de revisión/foco/layout y
navegación, además de auditoría sin reiniciar tras seed y un fixture de proveedor
que esperaba un stream bajo reloj simulado; se corrigieron antes de las pasadas
finales. Los logs finales corresponden a pruebas aprobadas, sin ocultar omisiones.

**Límites y siguiente paso:** M47 físico no está aprobado: falta registrar
modelo, SO y build de teléfono/tablet y verificar teclado real, foco/selección,
Siguiente, retorno, orientación y accesibilidad táctil. Los insets y dimensiones
de widgets no sustituyen esas pruebas. M48 formal y M43–M46 remotos quedan para
sesión 6. La sesión 5 debe añadir composición compacta, compartir controlador
entre vistas, recuperación visual explícita del diario/nueva revisión de bases,
cancelación/avance y entrega por evento, y habilitar el acceso público solo al
completar ambos recorridos. No se promete recuperar un borrador no confirmado
tras cerrar el proceso ni atomicidad remota por captura.

### 2026-10-18 — Sesión 5: recepción compacta y recorrido público

**Revisión:** plan 1, Flutter HEAD `09a1529` (`main`), vault HEAD `b077dc7`.
Se leyeron AGENTS aplicables, las dos guías offline-first, plan, continuidad,
matriz, sesión 5 y resultados de sesiones 1–4. Se revisó Git antes de editar.

**Trabajo ajeno preservado:** Flutter ya contenía las sesiones 1–4 sin commit,
incluidos comandos, esquema generado, diario, borrador y UI por tarea. Se
continuó sobre ellos; se conservaron CSV, cámaras/lectores y los demás accesos
de inventario. El vault ya tenía mapa, continuidad/matriz/evidencia CSV y esta
carpeta sin seguimiento. Solo se modifica esta continuidad y se añade evidencia
de sesión 5. No se modificó NestJS, no se accedió a bases del usuario ni se
crearon commits. Todos los tests usan datos sintéticos y bases aisladas.

**Archivos de implementación** (rutas relativas a Flutter):

- `lib/presentation/pages/gestion_inventario/edicion_masiva/`:
  `pantalla_edicion_masiva_por_tarea.dart` incorpora selección de vista, aviso
  del diario y navegación a recuperación; `fila_edicion_masiva.dart` incorpora
  composición compacta sobre el mismo `_campo`, controladores por campo/ID,
  Siguiente costo→venta→cantidad y explicación para entradas no disponibles.
- En esa carpeta, `controlador_edicion_masiva.dart` y
  `borrador_edicion_masiva.dart`: una ejecución secuencial compartida, resultados
  de no iniciados/omitidos, protección de intenciones pendientes, copia de
  confirmados desde diario, lectura de nombres y nueva revisión explícita.
  Adoptar bases nuevas conserva textos/proveedor/fecha; vínculo/unidad distintos
  bloquean reinterpretar cantidades. Se valida el modo antes de recuperar o
  adoptar bases de una reserva.
- `pantalla_revision_edicion_masiva.dart` y
  `fila_revision_edicion_masiva.dart`: revisión completa, sumas exactas por unidad
  sin convertir unidades/empaques, previsión sobre saldo nuevo, confirmación
  explícita para nuevas bases y cancelación que espera la transacción activa.
- `resultado_guardado_masivo.dart` y `resultados_edicion_masiva.dart`: estados
  aplicados, omitidos, fallidos y pendientes de ejecutar, con resultado local
  por producto y retorno al borrador que conserva lo no aplicado.
- Nuevos `recuperacion_edicion_masiva.dart` y `entrega_operacion_masiva.dart`:
  lectura del diario, continuar/ver resultados, revisar/cerrar pendientes y
  entrega actual de cada ID de evento, con actualización explícita sin iniciar
  transporte. Se presentan catálogo/entradas por separado, incluidos conflicto,
  rechazo y motivo; no se promete aceptación conjunta ni se reejecuta recepción
  al consultar una entrega.
- `lib/application/commands/edicion_masiva/edicion_masiva_command_service.dart`:
  consultas `registros` y `validarModo`; reutiliza `confirmar`/`ejecutar` y el
  puerto/transacciones existentes, sin otro mecanismo de persistencia.
- `lib/core/di/application_dependencies.dart`: catálogo y coordinador sobre la
  misma `AppDatabase`, configuración y contexto registrados en producción.
- `lib/presentation/pages/gestion_inventario/inventory_management_screen.dart`
  y `widgets/inventory_add_options_bottom_sheet.dart`: callback público de
  «Edición masiva»; no se reemplazan CSV ni otros accesos.
- `docs/architecture/bulk_receipt_operations.md`: recorrido público, recuperación,
  cancelación y límites de entrega. No se cambiaron tablas/DAOs/schemaVersion
  ni correspondía regenerar Drift en esta sesión.

**Archivos de pruebas:**

- Nuevos `test/presentation/pages/gestion_inventario/edicion_masiva/recepcion_recorrido_test.dart`
  (**19 casos**) y `recepcion_compacta_screen_test.dart` (**10 casos**).
- Nuevo `test/core/di/edicion_masiva_dependencies_test.dart` (**2 casos**, uno
  por modo), con DI de producción, base real y contador de conexiones HTTP cero.
- `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`:
  un caso nuevo del menú y ambas vistas; conserva las pruebas CSV/escaneo.
- `controlador_edicion_masiva_test.dart` y `edicion_masiva_task_screen_test.dart`:
  ajustan cancelación al contrato de sesión 5: esperar transacción y mostrar
  resultados/no iniciados, en lugar de salir de la revisión inmediatamente.
- `test/support/recepcion_masiva_crash_worker.dart`: el marcador de SIGKILL se
  escribe con flush en temporal y se publica mediante rename. Evita que el
  padre detecte un archivo todavía vacío. Es coordinación del arnés existente,
  no persistencia de negocio ni relajación de la prueba de cierre abrupto.

**Casos y evidencia:**

| Casos | Verificación y alcance |
|---|---|
| M03, M35–M36 | Edición conjunta por tarea/compacta, misma fila/identidad, venta precargada e independiente, entrada reemplazada en vez de acumulada, texto/errores/selección conservados al cambiar vista/tarea/búsqueda/filtro. Recorrido widget y ejecución real en ambos modos. |
| M09, M11–M12 | Venta sola con proveedor global no crea parejas; cambiar global conserva proveedor de costo ya capturado; detalle cambia solo su proveedor/fecha. Guardado SQLite y regresión completa de conservación comercial/proveedores de sesión 2. |
| M16, M18 | Precio/costo por 1 g y entrada en kg, cantidades atómicas/saldo correctos, sin conversión de empaques. Receta o ausencia de seguimiento bloquean entrada y conservan edición comercial. Adoptar base de otra unidad se rechaza conservando cantidad y base anterior. |
| M22, M37 | Revisión de todo el borrador aunque esté oculto, errores bloqueantes, proveedor/fecha, unidades, antes/después y totales de entradas. Saldo cambiado muestra nueva previsión, conserva cantidad y exige nueva revisión explícita; no registra un ajuste de saldo. |
| M34 | Reserva sin ejecutar, mezcla de aplicado/pendiente y reapertura de la misma SQLite sin ejecución al abrir. Continuar devuelve resultados originales; modificar pendiente requiere cerrar su reserva y otra identidad; excluye aplicados. Cambio de modo bloquea recuperación/adopción y no promueve historial. |
| M38, M40 | Doble confirmación bloqueada; avance después de commit/rollback. Puerta posterior al commit verifica espera/cancelación y producto no iniciado. Tres productos con trigger real: segundo revierte completo, primero/tercero quedan aplicados; reintento no los duplica. Volver durante guardado mantiene revisión hasta resultado. |
| M39 | Menú público abre ambas vistas, revisión, guardado y recuperación; demás accesos presentes y suite de CSV/escaneo conservada. DI real comprueba costo/entrada, diario, entrega/refs por modo y cero transporte iniciado. |
| M47 compacta | Widgets a 320/360/390 y 800 px, alto 640, nombres largos, insets de teclado 280, geometría de campos/botón, foco/Siguiente y selección entre vistas. Son pruebas automatizadas, no físicas. |
| Regresión M25–M33, M41–M42 | Core y reapertura reales de sesiones previas, rollback, idempotencia, SIGKILL antes/después de commit, esquema vigente y backup/restore. Standalone not_required sin refs; server_sync pending con refs. |
| Presentación de M31/M45 | Eventos reales de SQLite con estados de entrega sintéticos: catálogo aceptado/entrada en conflicto y catálogo rechazado/entrada aceptada. Refrescar/consultar/reintentar IDs originales no duplica entradas. No acredita HTTP, restauración remota ni convergencia M43–M46. |

**Comandos y resultados** (desde Flutter; logs finales en
`Evidencia/2026-10-18-sesion-5/`):

- `flutter test test/domain/articulos/importe_comercial_codec_test.dart test/presentation/pages/gestion_inventario/edicion_masiva test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart test/core/di/edicion_masiva_dependencies_test.dart test/application/commands/articulos/editar_articulo_comercial_test.dart test/application/commands/edicion_masiva --reporter expanded`:
  **233 aprobadas, cero fallos**, salida **0** (`pruebas-enfocadas.log`).
- `flutter test test/presentation/pages/gestion_inventario/edicion_masiva/recepcion_recorrido_test.dart --reporter expanded`:
  **19 aprobadas**, salida **0** (`pruebas-recorrido.log`).
- `flutter test test/application/commands/edicion_masiva/recepcion_reapertura_test.dart --reporter expanded`:
  **17 aprobadas**, salida **0** (`pruebas-reapertura.log`).
- `flutter test test/presentation/pages/cotizaciones/quotation_navigation_test.dart --reporter expanded`:
  **6 aprobadas**, salida **0** (`regresion-cotizaciones.log`).
- `dart analyze`: **No issues found!**, salida **0** (`dart-analyze.log`).
- `flutter test --concurrency=2 --reporter expanded`: **2402 aprobadas, cero
  fallos y 10 omitidas**, salida **0** (`flutter-test.log`). Las omisiones HTTP
  preexistentes requieren `POS_PHASE3_SYNC_URL` o `POS_SUPPLIER_SYNC_URL` con
  NestJS/PostgreSQL aislados; no se consideran aprobadas ni se contactó producción.
- `git diff --check`: salida **0** en Flutter y vault. Además **53 archivos
  nuevos .dart/.md** de Flutter se comprobaron contra `/dev/null`, sin salida
  de errores de whitespace (`git-diff-check.log`). El código **1** de
  `git diff --no-index --check` sin diagnóstico señala diferencias por ser
  archivo nuevo, no un error de whitespace.
- Revisión de usos/imports, capas y limpieza: sin Drift/data local en UI o
  aplicación de edición masiva, TODO/FIXME/placeholders ni dependencias nuevas
  (`revision-codigo.log`). `entorno.log` registra Flutter/Dart y host; no
  representa modelo/SO/build de dispositivo físico.

**Incidencias conservadas:** la primera suite completa terminó con
**2399 aprobadas, 1 fallida y 10 omitidas**: `FormatException` al leer el marcador
vacío de SIGKILL. Se corrigió la publicación atómica del marcador en el arnés;
las 17 reaperturas y las 233 enfocadas pasan después de la corrección.
La segunda suite completa terminó con **2401 aprobadas, 1 fallida y 10 omitidas**:
timeout de `pumpAndSettle` en el caso preexistente «Caja guarda una vez y Nueva
captura limpia sólo origen; historial conserva documento», de cotizaciones.
El archivo sin modificar pasa sus 6 casos aislados. La pasada
completa final con concurrencia 2 aprueba los 2402 casos; no se omite el caso
ni se modifica su negocio.
Se conservan `flutter-test-primer-intento.*` y
`flutter-test-segundo-intento.*`, además de los logs/JSON de resultados finales.
Las primeras iteraciones de UI corrigieron notificaciones durante teardown y
espacio de la revisión con teclado; las iteraciones de fixtures corrigieron un
stream Drift sin drenar y el nombre de columna en la simulación de cambio de
unidad. La evidencia final corresponde a los casos corregidos, no a una
aprobación ficticia de esas pasadas fallidas.

**Límites y siguiente paso:** M47 físico sigue pendiente: faltan modelo, SO,
build y prueba real de teléfono/tablet (sin red, teclado/foco/selección,
Siguiente, retorno/orientación, accesibilidad y cierre/reapertura). M43–M46
remotos y M48 formal corresponden a sesión 6. No se ha medido el coste de
consultar un historial extenso del diario; hoy la pantalla de recuperación
consulta sus registros completos y los nombres por conjunto de IDs. No se
promete recuperar borradores sin confirmar, sobrevivir a reset de desarrollo
o a restaurar un snapshot anterior a la captura, ni atomicidad remota por
producto/captura. Continuar con `Sesiones/06 - Verificacion y cierre.md`.

### 2026-10-18–19 — Sesión 6: verificación automatizada, rendimiento y cierre condicionado

**Revisión:** plan 1. Flutter HEAD `09a1529` en `main`; NestJS HEAD `dcc2907`;
vault HEAD `b077dc7`. Se leyeron los AGENTS aplicables de los tres proyectos,
las guías offline-first, el plan/matriz/continuidad y sesiones 1–5. No se
rehízo su funcionalidad. Todo sigue en el árbol de trabajo, sin commit nuevo.

**Trabajo ajeno preservado:** sesiones 1–5 sin commit; CSV completo de HEAD,
escaneo de inventario/Caja y demás funcionalidades. El vault conserva sus
cambios CSV y mapa del vault. NestJS permanece sin cambios. Los manifiestos
iniciales/finales y `delta-sesion.json` identifican exactamente esta sesión.
El SHA256 de `app_database.g.dart` y de tablas/DAOs recibidos se conserva;
no cambió Drift, schemaVersion ni migración, y no se ejecutó build_runner.

**Cambios Flutter de esta sesión** (rutas relativas al proyecto):

- `lib/application/commands/inventario/inventory_command_service.dart`:
  la entrada estricta usa base causal con secuencia null si el evento base está
  pendiente; conserva rechazo de historial standalone y referencias por modo.
- `lib/application/sync/sync_push_service.dart`: restaura también el movimiento
  rechazado mediante el limpiador existente; no vuelve a ejecutar recepción.
- `lib/application/sync/remote_event_preparer.dart`: retira la cadena optimista
  del recurso en orden inverso antes de aplicar oficial concurrente. Se conserva
  detección de ecos y protección por evento/versión del restaurador vigente.
- `lib/presentation/pages/gestion_inventario/edicion_masiva/fila_edicion_masiva.dart`:
  etiquetas flotantes, entrada en línea propia según ancho/escala y nombre
  completo para no ocultar la variante. Conserva ambos diseños, controles por
  ID, foco, Siguiente y único guardado.
- Nuevos `test/integration/recepcion_masiva_server_test.dart` (**6 escenarios**) y
  `test/presentation/pages/gestion_inventario/edicion_masiva/recepcion_verificacion_test.dart`
  (**5 casos**) para HTTP/PostgreSQL, accesibilidad, nombres y listado perezoso.
- `recepcion_compacta_screen_test.dart` y `edicion_masiva_task_screen_test.dart`
  vuelven por scroll al encabezado si un nombre largo lo retiró de la zona
  construida. Mantienen aserciones de teclado/foco/revisión y captura.
- Nuevo `tool/benchmarks/recepcion_masiva_verification.dart`: SQLite en archivos,
  ambos modos, 12 combinaciones y cinco corridas tras calentamiento descartado;
  diario medido en comando y controlador con 100/1000/10000 operaciones.
- `docs/architecture/bulk_receipt_operations.md`: contratos de correcciones,
  verificación remota, arnés y límites del historial del diario.

**Casos y resultados:**

| Casos | Evidencia real y estado |
|---|---|
| M01–M25 | Preparación, codecs, conservación exacta de omitidos/proveedores, venta independiente, fechas/unidades, no-op, entradas y concurrencia local pasan en la regresión con SQLite. |
| M26–M34 | Rollbacks por triggers, resultados parciales, doble ejecución, identidad, SIGKILL antes/después de commit, misma base al reabrir, esquema y backup/restore pasan. El diario no ejecuta al abrir ni promueve historial por modo. |
| M35–M40 | Ambas vistas, cambios ocultos en revisión, público/DI, cancelación/avance, teclado simulado, selección y Siguiente pasan. Renders finales con nombres completos y ancho/escala adaptados. |
| M41–M42 | Refs declaradas/validadas en ambos modos; standalone not_required, sin event_refs ni transporte. Server_sync conserva refs, capability y dependencias pendientes. Historial standalone rechazado sin importación explícita. |
| M43 | Pérdida de respuesta real después de commit, reapertura A, reenvío de los mismos IDs → duplicate; B y PostgreSQL acreditan una sola entrada/costo null. |
| M44 | Proveedor nuevo pendiente y dos recepciones encadenadas convergen; entrada no depende artificialmente del catálogo. Health real con capability retirada solo en el cliente bloquea push sin degradar ni escribir; después se entrega. |
| M45 | Catálogo aceptado/entrada rechazada y caso inverso con rechazo real NestJS por sobre inválido inyectado. Restauración/convergencia y SQL acreditan cero/una entrada. Resolver precio y consultar/reintentar IDs no duplica la entrada aceptada. |
| M46 | Dos terminales SQLite, catálogo/recurso concurrentes y cadena posterior, preflight/pull, restauración, resolución solo precio y restauración tardía sin borrar oficial posterior; no hay recepción implícita de reemplazo. |
| M47 automático | 320/360/390/800 px, nombres completos, texto 1.3, semántica y targets Android ≥48; tests previos mantienen teclado simulado/insets 280 y foco. **Físico pendiente**; solo macOS y Chrome disponibles. |
| M48 | 60 corridas de flujo + 60 lecturas de diario, mediana/rango de cinco, contadores comparables por escenario y fases separadas. Listado de 10000 real: página 100, sin detalle al abrir/buscar y menos de 20 TextField construidos. Medición de escritorio, sin garantía tablet. |

**Comandos y resultados finales:**

- `dart analyze`: salida **0**, No issues found.
- `flutter test --concurrency=2 --reporter expanded` con `POS_BULK_SYNC_URL`,
  `POS_SUPPLIER_SYNC_URL`, `POS_PHASE3_SYNC_URL`, schemas y `DATABASE_*` del
  cluster sintético: **2423 aprobadas, cero fallos, cero omitidas**, salida **0**.
- `flutter test test/presentation/pages/gestion_inventario/edicion_masiva test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart --reporter expanded`:
  **122 aprobadas**, salida **0** tras los ajustes.
- Render accesible con `BULK_UI_FONT=<Roboto del SDK>` y `BULK_UI_EVIDENCE=<S6>`:
  **5 aprobadas**, salida **0**; ocho PNG sintéticos de ambas vistas.
- `BULK_BENCH_OUT=<S6>/mediciones.json flutter test tool/benchmarks/recepcion_masiva_verification.dart --reporter expanded`:
  salida **0**; cinco corridas por combinación, sin otra suite concurrente.
- NestJS: `npm run build`, salida **0**; `RUN_POSTGRES_INTEGRATION=1 npm test -- --runInBand inventory-event.handler producto-event.handler product-suppliers.postgres sync.service.spec --json --outputFile=<S6>/nest-postgres.json`:
  **6 suites / 104 aprobadas, cero fallos/omisiones**, salida **0**.
- Typecheck explícito del arnés HTTP con `tsc --noEmit --skipLibCheck --experimentalDecorators --emitDecoratorMetadata --strictNullChecks --target ES2023 --module commonjs --esModuleInterop test/support/variant-tracking-server.ts`:
  salida **0**. El arnés y todo NestJS siguen sin cambios.
- `git diff --check`: Flutter, NestJS y vault; además archivos fuente nuevos
  contra `/dev/null`. Resultado y revisión de limpieza en evidencia.

**Mediciones principales del host:** Apple M5 / 16 GiB / macOS 27.0.1, Flutter
3.41.6 / Dart 3.11.4, flutter_tester debug arm64. Para catálogo 10000 y captura
500, medianas standalone: carga **25.90 ms**, filtro **3.26**, revisión **4.50**,
guardado **654.03**; server_sync: **27.67 / 3.20 / 4.36 / 762.81 ms**. El guardado
produce **80 eventos comerciales + 200 entradas**, **80 operaciones** y
**81 transacciones exteriores** (una reserva + 80 productos). Tablas completas,
rangos, consultas/escrituras/savepoints y fixtures están en `Rendimiento.md`.

Leer 10000 registros del diario desde controlador (incluidos nombres) tuvo
medianas **109.82 ms standalone / 107.33 ms server_sync** en este fixture y
aproximadamente **11.69 MB** de páginas SQLite adicionales. La consulta es lineal,
sin purga/paginación. No se midió pintar 10000 tarjetas ni memoria máxima;
no se promete historial ilimitado ni latencia de tablet.

**Incidencias y límites:** la prueba HTTP encontró un fallo introducido en la
entrada estricta y dos huecos previos de sync del cliente, corregidos sin cambio
de protocolo/servidor. Se conservan los logs fallidos y sus correcciones de
compilación, arnés de render/scroll y metadatos del benchmark. La primera pasada
NestJS adicional falló por DATABASE_PASSWORD vacía; la configuración sintética
se corrigió y sus 104 casos pasan. Los avisos preexistentes Drift/Helvetica no
se convierten en omisiones ni se borran del log. No se detectó necesidad de
cambiar semántica remota de servidor en los escenarios ejecutados.

**Cierre real:** automatización local/remota y mediciones completas. **No marcar
M47 físico aprobado ni declarar cierre global**: faltan modelo/SO/build móvil,
red deshabilitada, teclado/lector de pantalla reales y cierre/reapertura con base
conservada en teléfono/tablet. No se prometen borradores sin confirmar, supervivencia
a reset de desarrollo, operaciones posteriores a un snapshot antiguo ni
atomicidad remota conjunta. El siguiente paso es esa validación física.

**Evidencia:** `Evidencia/2026-10-18-sesion-6/` conserva matriz por caso,
verificación y límites, mediciones crudas/resumen, entorno, PNG, comandos/logs,
manifiestos/delta y limpieza del cluster/arneses temporales.
