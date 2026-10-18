---
tipo: seguimiento_implementacion
estado: fase_7_completa_plan_terminado
revision_plan: 1
actualizado: 2026-10-08
---

# Estado y continuidad: proveedores de productos

## Sesión de planificación del 2026-10-07

El usuario solicita un plan para guardar proveedores relacionados con productos,
capturar los precios que ofrecen mediante una interacción similar a recetas y
agregar una pestaña como la de recursos de inventario.

Se revisaron los proyectos reales Flutter y NestJS. Se creó el
[[08 - Roadmap/Proveedores de productos/Plan de implementacion|Plan de implementación, revisión 1]],
con cinco sesiones para la función local y dos
adicionales para servidor/sincronización cuando se solicite ese alcance.

No se modificó código Flutter/NestJS ni se ejecutaron pruebas funcionales,
reinicios de bases o migraciones. La inspección de fuentes sustenta el plan,
pero no es evidencia de que la funcionalidad exista.

## Estado por sesión

| Sesión | Estado | Evidencia |
|---|---|---|
| Planificación | Documentada | Plan rev. 1 e inspección del código |
| 1. Contrato y esquema local | Completa (2026-10-07) | Contrato/fixtures, Drift regenerado, 94 pruebas nuevas; suite completa 1400 aprobadas y 1 omitida preexistente |
| 2. Catálogo de proveedores | Completa (2026-10-07) | 39 pruebas nuevas; suite completa 1439 aprobadas y 1 omitida preexistente; analyze y Drift aprobados |
| 3. Relaciones con variantes | Completa (2026-10-08) | 54 pruebas nuevas; suite completa 1493 aprobadas y 1 omitida preexistente; analyze y Drift aprobados |
| 4. Editor de precios | Completa (2026-10-08) | 66 pruebas nuevas; suite completa 1559 aprobadas y 1 omitida preexistente; analyze aprobado y 6 capturas automatizadas revisadas |
| 5. Verificación local y cierre | Completa (2026-10-08); alcance local cerrado | Matriz con 32 comprobaciones locales aprobadas; 8 pruebas nuevas; 1567 aprobadas y 1 omitida remota; respaldo/restauración/reinicio y comprobaciones finales aprobados |
| 6. Servidor | Completa (2026-10-08); PostgreSQL real verificado | Entidades/migración, contratos con fixtures Dart, handlers y sync; 48 suites / 507 pruebas sin omisiones |
| 7. Sincronización y cierre remoto | Completa (2026-10-08); plan revisión 1 terminado | 1578 Flutter sin omisiones; 9 casos nuevos HTTP/PostgreSQL/WebSocket y regresión remota de seguimiento; 507 NestJS/PostgreSQL sin omisiones |

## Reglas fijadas en la sesión 1

1. Relación por variante; no por producto completo ni recurso de inventario.
2. Un precio vigente y fecha por pareja proveedor/variante; auditoría en eventos,
   sin pantalla de historial en la primera versión.
3. Nombre obligatorio; teléfono/notas opcionales. Alta y edición, sin borrado o
   desactivación del catálogo en esta versión.
4. Precio en la moneda del POS, no negativo, hasta dos decimales; cero explícito
   y retirada de relación explícita. Misma base de unidad/referencia de la variante.
5. Compatibilidad de eventos históricos y ediciones con campo ausente: nunca
   borrar silenciosamente proveedores que una versión antigua desconoce.

La solicitud de implementación confirmó estas reglas iniciales. Quedaron
fijadas en `docs/architecture/product_suppliers.md` de Flutter, con contratos
tipados, fixtures y restricciones SQLite. No se agregaron otros flujos de negocio.

## Base del código revisado

- Flutter: `/Users/benjamin/Projects/POS/pos_flutter`, rama `main`, HEAD
  `56ddbc4`, con cambios locales preexistentes en Cotizaciones, DI, Drift,
  pantallas y pruebas. Las siguientes sesiones deben volver a inspeccionar el
  estado y conservar ese trabajo.
- NestJS: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`,
  rama `main`, HEAD `e451d1b`; sin cambios locales reportados en esta revisión.
- El análisis también tenía cambios preexistentes. La planificación agrega
  solo esta carpeta y su entrada en el mapa del vault.

## Estado vigente

El plan revisión 1 está completo. Proveedores y precios funcionan offline en
standalone y server_sync. Dependencias, preflight/push/pull, confirmaciones,
restauración y convergencia están verificados con dos runtimes reales y
terminales lógicas independientes. No hubo pruebas físicas ni despliegue.

La operación requiere actualizar coordinadamente el servidor y todos los
clientes antes de utilizar los nuevos tipos: pull no filtra por versión.
Los servidores anteriores sin product_suppliers_v1 dejan los datos nuevos
pendientes. Standalone no ejecuta transporte ni convierte su historial.
La evidencia histórica de fases 1–6 se conserva abajo; sus siguientes pasos y
restricciones temporales fueron resueltos por la fase 7 al final del documento.

## Implementación de fase 1 del 2026-10-07

Criterio de salida cumplido: contrato verificable, esquema Drift regenerado y
pruebas de restricciones/serialización aprobadas. Solo se implementó contrato y
esquema local. Los nuevos payloads/tablas son estructura solicitada para fases
posteriores; no hay catálogo, nuevos command services, handlers de proveedor,
repositorios, pestañas ni editor de precios. No se modificó NestJS ni se agregó
sincronización remota.

### Decisiones y compatibilidad

- Catálogo `supplier` con nombre requerido y teléfono/notas opcionales recortados;
  opcionales vacíos a null, sin unicidad global de nombre. Eventos
  `proveedor_creado` y `proveedor_actualizado`; la edición conserva UUID del
  evento base y estados completos before/after para validación/reversión.
- Relación por variante y pareja única; precio entero no negativo en unidad
  monetaria menor, hasta 9007199254740991. Cero explícito permitido; ausencia,
  null, texto vacío, negativos, fracciones y fuera de rango rechazados. Fecha
  informada UTC como `quoted_at_ms`, entero entre 1 y 9007199254740991.
- Precio por unidad o cantidad de referencia del producto medido. Proveedores
  coexisten con receta/seguimiento directo/sin seguimiento; capturarlos no altera
  venta, costo estándar, inventario ni movimientos. La captura decimal y su UI
  pertenecen a la fase 4.
- JSON canónico: `suppliers` por variante, ordenados por supplier_id, listas
  inmutables y dependencias `supplier` exactas, sin repetidos, ordenadas por
  ref_id. Solo alta local pendiente agrega `depends_on_event_id`.
- Campo ausente se conserva como null tipado y se omite al serializar: legado
  desconoce el conjunto. `suppliers: []` es conjunto vacío explícito;
  `suppliers: null` es inválido. Todas las variantes de un snapshot declaran
  el campo o todas preservan ausencia; se rechazan snapshots parciales.
- `ProductoActualizadoPayload` rechaza before/after con distinto conocimiento
  del campo. `sameState` compara presencia, proveedor, precio y fecha: una base
  legada no coincide con una base actual que conoce proveedores. Retirada
  explícita conserva before y lista vacía en after; una omisión no autoriza
  eliminar relaciones. Ediciones legadas coherentes siguen serializando su
  ausencia. La fase 3 deberá integrar esta política en snapshots/proyecciones,
  undo, revalidación, comandos y formularios reconstruidos antes de habilitar
  relaciones; esta fase no aplica todavía precios a proyecciones de producto.
- Contrato documenta refs exactas: `supplier/affects` para proveedor;
  `product`, `product_variant` y `variant_suppliers/affects` para producto y la
  unión de variantes, incluidas retiradas; `supplier/uses` para la unión de
  proveedores before/after, incluidos retirados. Sin `supplier_name` ni
  unicidad por precio. Se conservan refs existentes de receta/categoría/unidad.
- `suppliers` hereda CommonFields; `variant_suppliers` es un hijo reemplazable
  sin ciclo/version/evento propios, excepción documentada como recetas. PK
  variant_id/supplier_id, FK CASCADE a variante y RESTRICT a proveedor; CHECK
  de tipos enteros y límites de precio/fecha. No índice por proveedor sin consulta.
- `schemaVersion = 8` y onUpgrade preexistente se conservaron literalmente.
  Detección de desarrollo exige las columnas nuevas. Restore verifica esquema
  de proveedores y foreign_key_check antes de cerrar/reemplazar la base actual,
  además de sha256/integrity_check. Respaldos antiguos incompatibles fallan
  sin reemplazar la base; los ya restaurados protegidos no se eliminan.
- Regla por modo intacta: LocalEventRef se declara/valida en ambos modos;
  solo server_sync persiste event_refs. Standalone usa not_required y no
  ejecuta actividad remota. No se tocó DriftLocalEventStore. Una importación
  futura deberá reconstruir refs explícitamente.

### Archivos de esta fase

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`:

- Documentación nueva: `docs/architecture/product_suppliers.md`.
- Payloads nuevos: `lib/application/sync/payloads/proveedor_creado_payload.dart`,
  `proveedor_actualizado_payload.dart`, `producto_proveedor_precio.dart`,
  `producto_proveedor_dependencia.dart` y `supplier_json.dart` en esa carpeta.
- Payloads extendidos: `lib/application/sync/payloads/producto_creado_payload.dart`
  y `lib/application/sync/payloads/producto_actualizado_payload.dart`.
- Tablas nuevas: `lib/data/local/drift/tables/suppliers.dart` y
  `lib/data/local/drift/tables/variant_suppliers.dart`.
- Registro/detección: `lib/data/local/drift/app_database.dart`, generado
  `lib/data/local/drift/app_database.g.dart` y nuevo
  `lib/data/local/drift/supplier_schema.dart` (validación de columnas compartida).
- Respaldo: `lib/data/local/backup/database_restore_service.dart`.
- Fixtures nuevos en `test/fixtures/suppliers_v1/`: `proveedor_creado.json`,
  `proveedor_actualizado.json`, `producto_creado.json`, `producto_legado.json`,
  `producto_sin_proveedores.json`, `producto_retirada_explicita.json` y
  `producto_medido_con_receta.json`.
- Lector de fixtures: `test/support/supplier_contract_fixtures.dart`.
- Contratos: `test/application/sync/payloads/proveedor_payload_test.dart` y
  `test/application/sync/payloads/producto_suppliers_payload_test.dart`.
- SQLite/respaldos: `test/data/local/drift/supplier_schema_test.dart` y
  `test/data/local/drift/supplier_backup_test.dart`.
- Análisis: este `Estado y continuidad.md`. El plan revisión 1 se conserva.

Flutter sigue en `main`, HEAD `56ddbc4`. Se conservaron cambios preexistentes de
Cotizaciones/DI/Drift/pantallas/tests. La comparación contra copias del estado
inicial verificó los cambios acotados de AppDatabase y la regeneración de
proveedores sobre el generado existente; DriftLocalEventStore quedó intacto.
No se ejecutó la aplicación contra la base del usuario ni se reiniciaron sus
datos. Las pruebas de archivo nuevas simulan path_provider hacia directorios
temporales aislados.

### Verificaciones y resultados

| Verificación | Resultado |
|---|---|
| `dart analyze` antes de editar | Sin problemas |
| `flutter test --reporter expanded` antes de editar | 1306 aprobadas, 1 omitida preexistente |
| `dart run build_runner build` | Aprobado; esquema regenerado (9 s) |
| Cuatro archivos de pruebas nuevas | 94 aprobadas |
| `dart analyze` final | Sin problemas |
| `flutter test --reporter expanded` final | 1400 aprobadas, 1 omitida preexistente (1 min 11 s) |
| `git diff --check` | Sin errores |

Las pruebas cubren normalización, roundtrip JSON, nombre/base requeridos,
precios/fechas inválidos y límites, duplicados, dependencias exactas, dos
variantes con proveedor compartido, producto medido con receta, cero, vacío
explícito, ausencia legada y comprobación de base. SQLite cubre PK/NOT NULL/CHECK,
FK, CASCADE/RESTRICT, retirada del último y catálogo conservado. Los archivos
prueban arranque actual sin pérdida, snapshot/restore/reinicio, esquema antiguo
con/sin protección y rechazo previo al reemplazo por esquema viejo o FK huérfana.

La primera corrida detectó una ambigüedad de import `isNull` en una prueba
nueva; se corrigió con `hide isNull` en Drift. No quedan fallos introducidos ni
fallos preexistentes en las verificaciones finales. La única prueba omitida ya
lo estaba antes: requiere `POS_PHASE3_SYNC_URL` apuntando a un servidor Nest con
PostgreSQL aislado. No cuenta como validación remota y no se ejecutó servidor.
No se realizaron pruebas visuales ni flujos funcionales de proveedores, que
pertenecen a fases posteriores.

La fase 1 está completa. El siguiente paso autorizado por una nueva solicitud
es la fase 2, catálogo local de proveedores, usando estos contratos y tablas.


## Implementación de fase 2 del 2026-10-07

Se implementó el catálogo local reutilizando los payloads, constantes y tablas
existentes de la fase 1. Permite crear, editar y consultar desde PROVEEDORES y
abrir el alta desde Agregar. Cancelar y volver atrás descartan el borrador sin
escrituras; el formulario vuelve al catálogo solo tras completar el guardado.
Criterio de salida cumplido: crear, editar y consultar sin conexión, persistir
evento/proyección atómicamente, cancelar sin escrituras y conservar el
comportamiento existente. La suite completa confirma las verificaciones con
SQLite aislado detalladas abajo.

### Decisiones y comportamiento

- Dominio y repositorio de lectura reactiva separados de Drift. El DAO observa
  el catálogo ordenado por nombre e identidad, sin unicidad global. Las listas
  del repositorio son inmutables y conservan trazabilidad/base de edición.
- Normalización centralizada en los payloads existentes: nombre obligatorio
  recortado, teléfono y notas opcionales recortados, vacíos a null. Teléfono
  textual libre, incluidos ceros iniciales, prefijos y extensiones.
- La edición recibe el snapshot capturado al abrir el formulario. El servicio
  comprueba evento, versión, secuencia conocida y estado before dentro de una
  transacción; el handler repite la comprobación antes de escribir. Conserva
  id/created_event_id, incrementa versión y actualiza last_event_id. Un no-op
  normalizado no genera evento; una base desactualizada falla sin datos parciales.
- Alta idempotente por created_event_id, incluso tras una edición; actualización
  idempotente por last_event_id. Identidades ocupadas fallan. Evento y proyección
  comparten la transacción de DriftLocalEventStore, con reversión probada incluso
  cuando se inyecta un fallo después de modificar la proyección.
- Referencia supplier/affects declarada en cada comando, sin supplier_name ni
  requires_unique. DriftLocalEventStore permanece idéntico al inicio: standalone
  guarda applied/not_required y cero event_refs; conserva la regla compartida de
  refs en server_sync. La prueba del adaptador en ese modo no habilita el catálogo.
- Disponibilidad solo standalone en pestaña, menú y formulario; el menú abierto
  reacciona también a cambios de modo. El servicio público rechaza invocaciones
  directas en server_sync antes de guardar eventos, evitando envíos futuros al
  servidor que todavía no conoce estos contratos. Sin configuración conocida,
  la pantalla conserva únicamente los tres accesos existentes.
- Pestañas desplazables en teléfono y distribuidas en tablet. Menú de una/dos
  columnas según ancho, altura limitada y scroll. Formulario con scroll/ancho
  máximo 720; guardado bloquea doble toque y salida mientras está en curso.
  Los errores conservan los campos y permiten reintentar o cancelar.
- Sin borrado/desactivación. Sin relaciones/precios/variantes ni cambios
  funcionales de producto. Sin NestJS o integración remota. AppDatabase solo
  registra ProveedorDao; schemaVersion = 8 y onUpgrade se conservaron.

### Archivos de fase 2

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`:

- Dominio: `lib/domain/proveedores/proveedor.dart` y
  `lib/domain/repositories/proveedor_repository.dart`.
- Lectura: `lib/data/local/drift/daos/proveedor_dao.dart` y
  `lib/data/repositories/proveedor_repository_impl.dart`.
- Proyección: `lib/application/sync/projections/proveedor_projection.dart`,
  `proveedor_projection_store.dart` y
  `lib/data/local/drift/drift_proveedor_projection_store.dart`.
- Comandos en `lib/application/commands/proveedores/`: `crear_proveedor_command.dart`,
  `editar_proveedor_command.dart` y `proveedor_command_service.dart`.
- Handlers en `lib/application/sync/handlers/`:
  `proveedor_creado_event_handler.dart` y `proveedor_actualizado_event_handler.dart`.
- Registro: `lib/core/di/data_dependencies.dart`,
  `lib/core/di/application_dependencies.dart` (incluye mapa de EventProcessor),
  `lib/data/local/drift/app_database.dart` y generado `app_database.g.dart`.
- Navegación/menú: `lib/presentation/pages/gestion_inventario/inventory_management_screen.dart`
  y `widgets/inventory_add_options_bottom_sheet.dart`.
- UI en `lib/presentation/pages/gestion_inventario/proveedores/`:
  `inventory_suppliers_tab.dart`, `proveedor_form_screen.dart`,
  `models/proveedor_form_result.dart` y `widgets/inventory_supplier_card.dart`.
- Pruebas: `test/application/commands/proveedores/proveedor_command_service_test.dart`,
  `test/presentation/pages/gestion_inventario/proveedores/proveedor_catalog_test.dart`,
  `test/core/di/proveedor_dependencies_test.dart` y `test/support/proveedor_harness.dart`.
- Documentación: `docs/architecture/product_suppliers.md` y este documento.

Se conservó el trabajo preexistente de Cotizaciones, esquema, DI, pantallas y
pruebas. Se reconstruyó la copia inicial de los archivos tracked a partir de
HEAD más el diff guardado al iniciar. Todos los archivos ya modificados fuera
de los cuatro ampliados (DI × 2, AppDatabase y generado) permanecen idénticos.
El delta revisado de esos cuatro solo añade el catálogo/registro: AppDatabase
agrega dos líneas y su generado solo el accessor/mixin/manager del DAO. Las
definiciones de tablas, contratos/fixtures de la fase 1 y DriftLocalEventStore
no se modificaron. La documentación de arquitectura se actualizó de fase 1 a 2.

### Verificaciones y límites

- Base inicial: `dart analyze` sin problemas y `flutter test --reporter expanded`
  con 1400 aprobadas, 1 omitida preexistente.
- `dart run build_runner build`: aprobado, 11 s; DAO regenerado manteniendo
  tablas, esquema, versión y migración existentes.
- Pruebas nuevas: 23 de comandos/SQLite, 14 de UI y 2 de DI real. Cubren nombre
  obligatorio, normalización, duplicados permitidos, lectura reactiva,
  trazabilidad, idempotencia, no-op, evento/versión/secuencia/before incompatibles,
  una secuencia conocida, guardados concurrentes y rollback tras proyectar.
- La UI cubre creación/edición desde menú/lista, vacío/carga/error/datos,
  cancelar/volver atrás sin escrituras, edición concurrente, doble toque,
  reintento, disponibilidad/cambio de modo y regresión de las tres pestañas.
- Tamaños automatizados 320×640, 740×360 y 1280×800 con escala de texto 1.3:
  pestañas, menú y formulario accesibles sin overflow. No se probó un teléfono
  o tablet físico ni se inició la aplicación contra la base del usuario.
- SQLite en memoria y archivo temporal prueba cierre/reapertura. DI real usa
  path_provider temporal y bloquea conexiones con HttpOverrides; no se creó
  HttpClient ni conexión WebSocket al operar el catálogo. El runtime standalone
  tampoco resuelve el monitor de push/pull/preflight/health/WebSocket.
- Las primeras pruebas detectaron errores de sintaxis, fixtures/finder y manejo
  de timers del entorno fake de widgets, que se corrigieron. La limpieza de
  listeners/SQLite y los guardados con rollback usan la cola de prueba apropiada.
  Los resultados finales se consignan a continuación.


| Verificación final | Resultado |
|---|---|
| `dart analyze` | Sin problemas |
| `flutter test --reporter expanded` | 1439 aprobadas, 1 omitida preexistente (1 min 12 s) |
| Nuevas pruebas de fase 2 | 39 aprobadas: comandos/SQLite 23, UI 14, DI 2 |
| `dart run build_runner build` | Aprobado; nuevo DAO regenerado, schemaVersion 8 y onUpgrade intactos |
| `git diff --check` | Sin errores |
| Comparación del trabajo previo y delta de DI/Drift | Conservado; solo registro/generado de catálogo en esos archivos |
| Standalone | Eventos applied/not_required, cero event_refs, cero conexiones HTTP/WebSocket y monitor remoto sin resolver |

No quedaron fallos introducidos ni fallos preexistentes en las verificaciones
finales. Las 54 advertencias de Drift sobre varias instancias de bases en las
pruebas ya estaban presentes en la corrida inicial; el número es idéntico en
la final. La única omisión sigue siendo la prueba que necesita
POS_PHASE3_SYNC_URL con Nest/PostgreSQL aislados. No se ejecutó ese servidor y
esta entrega no constituye validación ni habilitación remota.

La fase 2 está completa. El siguiente paso es la fase 3, relaciones con
variantes, bajo una nueva solicitud. El editor de precios sigue en fase 4 y el
catálogo continúa limitado a standalone hasta cerrar fases 6–7.


## Implementación de fase 3 del 2026-10-08

Criterio de salida cumplido: proveedores, precios y fechas integrados en alta,
guardado, lectura, reaplicación y restauración atómicos del producto. Editar
otros campos conserva las relaciones; retirada explícita, compatibilidad
legada y bases incompatibles tienen pruebas. La fase 4 queda como siguiente
paso. No se implementó selector, campos visuales de precios ni navegación,
NestJS, preflight, push, pull o una integración remota nueva.

### Decisiones y comportamiento

- Se reutilizan tablas, constraints, payloads/dependencias, fixtures, catálogo
  y puerto de proveedor de las fases 1–2. `PrecioProveedor` permite cero y el
  rango entero seguro; `ProveedorVariante` conserva UUID normalizado,
  precio y fecha UTC Unix, con copia canónica e inmutable sin duplicados.
- Los constructores `.conProveedores` de comando y formulario copian y
  congelan la captura. Los constructores const preexistentes siguen expresando
  omisión. null interno conserva relaciones; [] las retira. El payload nunca
  serializa suppliers:null. El detalle devuelve listas inmutables también.
- Los comandos de alta/lote/edición/borrado mantienen lectura, validación,
  preparación y appendAndApply bajo la transacción real. Verifican existencia
  de proveedores de before/after y reutilizan dependencias tipadas. Solo alta
  local pending exige depends_on_event_id; not_required permanece sin dependencia
  causal remota. Cambios del catálogo no cambian precios ni sus bases.
- Se construyen listas completas de todas las variantes, incluso []. Una
  omisión de comando conserva el conjunto por identidad de variante. Si el
  precio de una pareja no cambia, se conserva su fecha anterior; un precio
  nuevo usa la fecha informada. No se alteran venta, costo estándar, consumo,
  saldos ni movimientos. La concurrencia sigue siendo del producto completo:
  dos ediciones desde la misma base no se fusionan aunque afecten proveedores
  diferentes. El handler verifica evento, versión, secuencia conocida y before.
- Las refs añaden variant_suppliers/affects para conjuntos explícitos de la
  unión before/after y supplier/uses para su unión de proveedores, incluidos
  los retirados. Se conservan product, product_variant, categoría, unidades,
  inventario, recetas y unicidad de nombre de variante. En el borrado se
  mantienen las refs anteriores de todas las variantes históricas y las nuevas
  procedentes de before. Standalone valida/declara las refs sin persistirlas.
- `supplierSets` lee las parejas reales y el conocimiento acreditado por
  snapshots registrados del producto. Devuelve todos los conjuntos activos
  conocidos o conserva ausencia legada para todo el agregado. No se exige un
  payload histórico completo para leer detalles antiguos; se reutilizan los
  helpers tipados del contrato para identificar/validar suppliers.
- Transición legada explícita: los comandos standalone toman before de la
  proyección actual, completando con [] un conjunto desconocido sin filas.
  No fabrican before desde el alta/eventos históricos. `sameState` sigue
  distinguiendo ausencia y vacío; `sameEditingBase` permite únicamente esa
  transición exacta a una base completa vacía. Una base legada no coincide
  con un estado conocido, aunque esté vacío. El replay histórico sin suppliers
  antes de la transición mantiene la ausencia y nunca reemplaza hijos omitidos.
- El conocimiento no retrocede al deshacer la primera edición moderna de un
  artículo legado: before en la bitácora acredita el campo y la lectura real
  devuelve [] tras retirar sus filas y reabrir SQLite. Una transacción fallida
  revierte su evento y no acredita conocimiento. Los cambios de categoría
  tampoco eliminan ese conocimiento. El reconstruidor de seguimiento acepta
  esta transición vacía sin inventar recursos ni una historia de inventario.
- Retirar una pareja/conjunto conserva el proveedor del catálogo. Reordenar o
  retirar variantes conserva las relaciones que no edita; la desactivación de
  variante/artículo mantiene hijos históricos y las lecturas activas los
  excluyen. El borrado físico existente usa CASCADE sin eliminar suppliers.
- El respaldo `product_update_undo.snapshot_json` conserva todas las parejas,
  incluidas variantes ya retiradas, con precios, fechas y metadatos. Restore
  recupera ese snapshot y retira variantes añadidas por el evento revertido.
  Un respaldo viejo sin la clave conserva las relaciones retenidas. El
  fallback usa before completo, diferencia [] de ausencia y restaura precios.
  No se crea otra infraestructura de recuperación o respaldo.
- Detalle, preview, editor de variante, copyWith, comparación del borrador y
  conversión a comando conservan las relaciones. El modo sencillo conserva
  identidad y proveedores al reconstruir una variante. No se añadieron campos
  visibles ni editor de precios. La importación CSV actual crea nuevos
  artículos con [] en standalone y no modifica relaciones existentes; sin
  formato CSV nuevo. Edición masiva sigue siendo una opción sin acción;
  no existe un flujo de escritura que ampliar en esta fase.
- La captura nueva, incluso [], se rechaza en server_sync. El handler exige
  también not_required y ninguna server_sequence para estados conocidos,
  protegiendo accesos directos. Los artículos legados de ese modo conservan
  altas/ediciones/borrados y refs anteriores. No se habilita transporte.
  DI real prueba standalone con applied/not_required, cero event_refs, cero
  HttpClient/HTTP/WebSocket y runtime remoto sin activar.

### Archivos de fase 3

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`:

- Dominio nuevo: `lib/domain/articulos/precio_proveedor.dart` y
  `proveedor_variante.dart`; ampliado `variante_detalle.dart`.
- Comandos: `lib/application/commands/articulos/crear_articulo_variante_command.dart`,
  `producto_command_service.dart` y `inventory_resource_resolver.dart`.
- Contratos: `lib/application/sync/payloads/producto_creado_payload.dart` y
  `producto_actualizado_payload.dart`, con helpers de conocimiento/transición.
- Capacidad de proyección nueva:
  `lib/application/sync/projections/producto_proveedores_projection_store.dart`.
- Aplicación/DI: `lib/application/sync/handlers/producto_event_handler.dart` y
  `lib/core/di/application_dependencies.dart` (solo inyección/modo de producto).
- Persistencia/lectura: `lib/data/local/drift/daos/producto_dao.dart`,
  `drift_producto_projection_store.dart`, generado `app_database.g.dart` y
  `lib/data/repositories/producto_repository_impl.dart`.
- Presentación: `lib/presentation/pages/gestion_inventario/inventory_management_screen.dart`
  (conversión a comando); en `articulos/`, `article_form_screen.dart`,
  `models/articulo_form_result.dart`, `models/articulo_preview_form.dart` y
  `widgets/variant_editor_screen.dart`.
- Pruebas nuevas: `test/application/commands/articulos/product_supplier_relations_test.dart`
  (49), `test/presentation/pages/gestion_inventario/articulos/product_supplier_forms_test.dart`
  (4) y `test/support/product_supplier_harness.dart`.
- Pruebas ampliadas: `test/core/di/proveedor_dependencies_test.dart` (1 caso
  nuevo), `test/support/variant_tracking_harness.dart` (registro del catálogo),
  `test/presentation/pages/gestion_inventario/articulos/articulo_preview_form_test.dart`
  y `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`
  (ajuste de const para detalle con copia defensiva).
- Documentación: `docs/architecture/product_suppliers.md` y este documento.

Se preservó el trabajo preexistente con copia inicial y hashes de los archivos
bajo lib/test/docs. Los únicos 21 archivos existentes de código/pruebas cuyo
contenido cambió corresponden al alcance listado. En particular permanecen
idénticos AppDatabase, tablas de proveedores/relaciones, detección de esquema,
restauración de archivos y DriftLocalEventStore. El delta del generado solo
agrega 10 líneas de accesores del DAO; no cambia tablas, schemaVersion=8 ni
onUpgrade. Los fixtures de fases 1–2, Cotizaciones, el plan rev. 1 y NestJS no
se modificaron. Flutter conserva main/HEAD 56ddbc4 y los cambios locales.
No se abrió, reinició ni reemplazó la base del usuario.

### Verificaciones y resultados

| Verificación | Resultado |
|---|---|
| Base inicial `dart analyze` | Sin problemas |
| Base inicial `flutter test --reporter expanded` | 1439 aprobadas, 1 omitida preexistente (1 min 23 s) |
| Drift inicial y regeneración final | Aprobadas; última 7 s; únicamente accesores del DAO |
| 54 casos nuevos | Dominio/comandos/SQLite 49, formulario/widgets 4, DI real 1 |
| Regresiones enfocadas tras corregir lecturas | 190 aprobadas: detalle, seguimiento/restore, Cotizaciones/respaldo, catálogo y escáner de Caja |
| Cierre de 56 pruebas enfocadas tras reutilizar constantes del contrato | Aprobado (incluye los 54 casos nuevos y 2 de DI preexistentes) |
| Último `dart analyze` | Sin problemas |
| Último `flutter test --reporter expanded` | 1493 aprobadas, 1 omitida preexistente (1 min 4 s) |
| `git diff --check` | Sin errores |
| Standalone | applied/not_required, cero event_refs, sin conexiones HTTP/WebSocket |

Las nuevas pruebas cubren varios proveedores/variantes y proveedor compartido,
cero/límite seguro, fechas, conservación al editar otros campos, retirada del
último, duplicados/inexistentes/datos inválidos sin escrituras parciales,
idempotencia, rollback tras proyectar producto y recursos, concurrencia,
restauración fallback/DAO con variantes inactivas y añadidas, borrado lógico
/físico, replay legado, promoción de snapshot actual completo, rechazo de
bases/evento/versión/secuencia incompatibles, importación, receta/directo/sin
seguimiento, fixtures medidos, cierre/reapertura y capturas inmutables.

Las corridas intermedias detectaron regresiones introducidas al reconstruir
payloads completos para leer metadatos o IDs antiguos, una comparación de filas
sin orden y ajustes de constructores/matchers de las pruebas. Se corrigieron
sin modificar los datos del usuario ni las invariantes de artículos legados.
Una corrida completa con pausas prolongadas registró timeouts y fallos de
limpieza posteriores; no se cuenta como verificación aprobada. Las regresiones
focalizadas y la corrida final completa pasan. No quedan fallos funcionales
introducidos o preexistentes en los resultados finales.

La única omisión permanece igual: requiere POS_PHASE3_SYNC_URL con
Nest/PostgreSQL aislados. No se ejecutó ese servidor. Persisten las 54
advertencias Drift de varias instancias de la base inicial y se añaden 2 por
el caso de reapertura con bases independientes en memoria/archivo temporal;
no comparten executor ni datos del usuario. No se hicieron pruebas físicas
ni del editor de fase 4. Las verificaciones visuales nuevas solo ejercitan
los formularios existentes conservando datos ocultos.

La fase 3 está completa. El siguiente paso es fase 4, editor de precios,
reutilizando modelos y guardado completo sin habilitar server_sync.


## Implementación de fase 4 del 2026-10-08

Criterio de salida cumplido mediante interfaz y pruebas con SQLite temporal:
seleccionar proveedores, capturar/cambiar precios, retirar relaciones, guardar
el artículo y reabrirlo con las parejas correctas. Cancelar selector, variante
o artículo no cambia relaciones/eventos. La fase 4 está completa y la fase 5
queda como siguiente paso; no se ejecutó su cierre ni se habilitó server_sync.

### Decisiones y comportamiento

- Selector por variante, independiente de receta/seguimiento directo/sin
  seguimiento, alimentado por ProveedorRepository. Selección explícita por
  checkbox, precio/fecha por proveedor, carga de relaciones, errores por
  campo y Guardar. Carga/error/reintento/vacío conservan el borrador; una
  recarga o identidad no disponible nunca retira una relación automáticamente.
  Se puede retirar el último y guardar []. No hay alta en el selector; se
  indica usar la pestaña PROVEEDORES. Volver a seleccionar conserva los campos
  capturados durante la apertura, sin duplicar identidades.
- Navegación desde VariantEditorScreen y resumen en edición/consulta con
  nombres locales, precios, fechas y base del precio. La consulta no ofrece
  edición de proveedores. Selector identifica artículo/presentación. Precio
  por una unidad vendible o por la cantidad de referencia con su unidad real,
  formateada por InventoryQuantityCodec. El formulario conserva la configuración
  original en edición y comparte la misma base entre pantalla y guardado.
  No cambia la regla del core que exige referencia igual al factor de la unidad.
- Conversión decimal exacta con BigInt y comprobación antes de int; formato
  de salida con división entera/resto. Coma/punto, hasta dos decimales, cero
  explícito y máximo 90071992547409.91 admitidos. Vacío, negativos, precisión
  excesiva, formatos no monetarios y fuera de rango generan errores. Vacío
  no es cero ni retirada. CurrencyInputFormatter no se reutiliza porque admite
  signos/rechaza ediciones de manera incompatible; venta/costo no cambian.
- Precio equivalente conserva el instante anterior exacto y deshabilita
  cambiar fecha, con nota visible. Una relación nueva propone la fecha local
  al seleccionarla; al cambiar precio se permite elegir fecha informada. El
  calendario captura el día local a medianoche y la pareja convierte a UTC.
  Cancelar el calendario conserva la fecha. Se preservan también instantes
  del contrato mayores que el rango de DateTime, mostrando milisegundos UTC;
  para cambiar ese precio se exige elegir fecha. El reloj no resuelve conflictos.
- Guardar selector devuelve ProveedorPreciosFormResult canónico/inmutable;
  guardar variante actualiza únicamente el borrador del artículo. Solo guardar
  artículo llama al comando atómico ya existente. Identidad, comparación de
  cambios y listas inmutables se conservan. Un fallo después de proyectar
  revierte evento/relaciones y mantiene los campos para reintentar una vez.
- Catálogo/configuración standalone conocidos requeridos para acceso y
  navegación. Selector/editor observan cambios de modo y comprueban el modo
  antes de devolver cambios. Una variante abierta no entrega proveedores
  modificados si se cambia a server_sync. Las defensas de comandos/handlers
  anteriores quedan intactas. Los flujos legados de server_sync conservan
  comportamiento; no se añade transporte ni actividad remota.

### Archivos de fase 4

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`:

- Nuevos modelos en `lib/presentation/pages/gestion_inventario/articulos/models/`:
  `proveedor_precio_input.dart`, `proveedor_precio_form.dart` y
  `proveedor_precios_form_result.dart`.
- Nuevos widgets/pantalla en `lib/presentation/pages/gestion_inventario/articulos/widgets/`:
  `variant_suppliers_editor_screen.dart`, `proveedor_precio_card.dart` y
  `variant_suppliers_summary.dart`.
- Ampliados: `widgets/variant_editor_screen.dart`, `article_form_screen.dart`,
  `models/articulo_form_result.dart` (comentario) e
  `lib/presentation/pages/gestion_inventario/inventory_management_screen.dart`.
- Nuevas pruebas en `test/presentation/pages/gestion_inventario/articulos/`:
  `proveedor_precio_form_test.dart`, `variant_suppliers_editor_test.dart` y
  `product_supplier_ui_flow_test.dart`.
- Contrato actualizado: `docs/architecture/product_suppliers.md`.
- Análisis: este documento y evidencia en `Evidencia/2026-10-08-fase4/`.
  El plan revisión 1 permanece intacto.

Se conservaron todos los cambios preexistentes con copia inicial y hashes de
lib/test/docs. Solo cambiaron cuatro archivos existentes de presentación y el
contrato; otros 739 archivos existentes comparados permanecen idénticos. Los
nuevos son seis archivos de presentación y tres de pruebas. No hay cambios a
application/domain/data/DI, AppDatabase, tablas, generado, schemaVersion=8,
onUpgrade o DriftLocalEventStore, ni se regenera Drift. No se modificó NestJS.
No se abrió/reinició/restauró la base del usuario ni se inició su aplicación.

### Verificaciones y resultados

| Verificación | Resultado |
|---|---|
| Base inicial `dart analyze` | Sin problemas |
| Base inicial `flutter test --reporter expanded` | 1493 aprobadas y 1 omitida preexistente (1 min 2 s) |
| 66 pruebas nuevas en suite final | 33 de dinero/fecha/modelo, 26 de widgets y 7 de flujo UI/SQLite |
| Último `dart analyze` | Sin problemas |
| Último `flutter test --reporter expanded` | 1559 aprobadas y 1 omitida preexistente (1 min) |
| `git diff --check` | Sin errores |
| Preservación de código previo | Comparación por hashes, incluida la igualdad literal de core/Drift |
| Standalone desde interfaz | applied/not_required, cero event_refs y cero HttpClient con HTTP/WebSocket bloqueados |

Las pruebas nuevas cubren selección múltiple/no duplicados, dinero exacto,
precio cero/vacío/negativos/precisión/límites, fechas UTC y conservación de
milisegundos, retiro/reselección, carga/error/reintento y datos no disponibles,
resumen sin edición, modos/cambio de modo, coexistencia con receta/directo/sin
seguimiento, cancelación en los tres niveles, alta desde menú, guardado y
reapertura por UI, cierre/reapertura del archivo SQLite temporal con parejas
positivas y vacías, fallo atómico/reintento y venta/costo estándar conservados.
La suite completa mantiene también las regresiones anteriores de artículos,
catálogo, recetas, seguimiento, Caja y Cotizaciones, incluida la prueba DI
standalone que no resuelve el runtime remoto.

Diseño automatizado en 320×640 y 740×360 con texto 1.3, y 1280×800 con texto
1.5: selector, editor y consulta sin overflow; precio enfocado, scroll y Guardar
accesible con insets de teclado simulados de 260/170/300. Se renderizaron y
revisaron seis PNG con Roboto/MaterialIcons del SDK: apertura y precio enfocado
por tamaño. Estas son capturas del motor de pruebas con teclado simulado,
no pruebas físicas ni capturas de un teclado/dispositivo real. Los comandos
y logs de render se conservan con las imágenes. No hubo pruebas físicas de
Android/iOS/tablet ni arranque contra datos reales.

Las corridas intermedias corrigieron fixtures de repositorio (streams de una
sola escucha), bombeo del botón de fecha, nombres de campos de detalle en
tests y la captura asíncrona del render dentro de runAsync. Un fixture medido
no válido se ajustó al factor real de la unidad sin ampliar el core. No se
cuentan esas corridas fallidas/interrumpidas como aprobación. Las verificaciones
finales anteriores no tienen fallos. La única omisión sigue requiriendo
POS_PHASE3_SYNC_URL con Nest/PostgreSQL aislados; no cuenta como prueba remota.

La fase 5 debe completar respaldo/restauración, reinicio y aceptación local
según el plan, registrando sus límites. No se añadieron compras, movimientos,
historial UI, preferencias de proveedor ni cambios automáticos de venta/costo.


## Verificación y cierre de fase 5 del 2026-10-08

**Fase 5 completa; alcance local de fases 1–5 cerrado.** Aceptación,
persistencia, respaldo/restauración, reinicios y comprobaciones finales
aprobados, sin defectos funcionales conocidos pendientes en el alcance local.
Las fases 6–7 requieren una solicitud explícita; no se modificó NestJS ni se
habilitó server_sync.

La [[08 - Roadmap/Proveedores de productos/Matriz de aceptacion local|matriz]]
relaciona los 16 casos esenciales del plan y las comprobaciones complementarias
con pruebas realmente ejecutadas: 32 filas locales aprobadas, 3 remotas no
ejecutadas y pruebas físicas no ejecutadas. El informe
[[08 - Roadmap/Proveedores de productos/Verificacion local - fase 5|Verificación local de fase 5]]
registra datos comprobados, comandos, resultados, corrección, límites y
preservación. Logs, inventario por caso, hashes y resultados sintéticos se
conservan en `Evidencia/2026-10-08-fase5/`.

### Defecto corregido y archivos

La validación de restore aceptaba respaldos con tablas de proveedores válidas
pero esquema de arranque incompatible o versión SQLite distinta. Tres casos
nuevos reprodujeron la aceptación indebida antes de corregirla. Restore ahora
exige versión actual y el mismo predicado de esquema del arranque, además de
SHA/integridad/FK, antes de cerrar/reemplazar la base vigente. Un rechazo
conserva sus filas/eventos, conexión y posterior reinicio.

Archivos relativos a `/Users/benjamin/Projects/POS/pos_flutter`:

- Nuevo `lib/data/local/drift/current_database_schema.dart`: extracción del
  predicado preexistente de arranque, sin cambiar sus reglas.
- `lib/data/local/drift/app_database.dart`: reutiliza el predicado extraído;
  schemaVersion=8 y onUpgrade conservados literalmente.
- `lib/data/local/backup/database_restore_service.dart`: validación antes del
  reemplazo, incluida versión SQLite.
- Nuevo `test/data/local/drift/supplier_local_acceptance_test.dart`: 8 casos.
- `test/data/local/drift/quotation_backup_test.dart`: la regresión legada
  comprueba rechazo de restore y, por separado, protección de arranque.
- `docs/architecture/product_suppliers.md`: estado final y límites reales.

No cambian tablas, DAOs ni generado; no se regenera Drift. No cambiaron archivos
de presentación ni se añadieron funcionalidades. La copia inicial/hash de los
753 archivos previos permite identificar solo el delta de esta fase; el resto
de cambios preexistentes de proveedores, Cotizaciones y otros módulos se
conserva. Plan revisión 1 y evidencias anteriores intactos.

### Persistencia, respaldo, interfaz y regresiones

Dos conjuntos creados por comandos reales: uno con catálogo editado, dos
proveedores y tres variantes (varios precios/fechas, proveedor compartido y
lista vacía); otro con catálogo vacío y listas explícitamente vacías. Se
abrió/cerró AppDatabase real dos veces antes del respaldo, se generó snapshot
con VACUUM INTO/SHA, se restauró en un segundo directorio temporal con datos de
control y se reinició dos veces. Todas las tablas Drift, identidad, datos,
metadatos, eventos y relaciones conservan su contenido. Los repositorios y la
interfaz real reabren las tres variantes/selector con los precios correctos.
Consultar/cancelar no escribe. El origen mantiene su cambio posterior al
snapshot. Integrity=ok, FK habilitadas, foreign_key_check vacío.

Se rechazan SHA incorrecto, archivo no SQLite, columna requerida renombrada y
versiones 7/9 antes de reemplazar la base temporal actual; se mantienen los
casos anteriores de esquema de proveedores incompleto y FK huérfana. La nueva
regresión comercial abre Caja, guarda cotización y confirma venta de variantes
con stock directo y receta. Capturar precios conserva filas no vacías de
ventas/pagos/Caja/Cotizaciones/recetas/saldos/movimientos, venta/costo y consumo.

Las suites existentes cubren flujo completo, cancelación en tres niveles,
cero/coma/punto/fechas, último proveedor, rechazo de datos/base, conservación
del borrador y reintento, compatibilidad, idempotencia, restauración,
importación y cuatro pestañas. Standalone conserva applied/not_required,
event_refs=0, pendientes=0 y HttpClient=0 con red bloqueada; DI/runtime no
inician servicios remotos. Referencias declaradas/validadas en ambos modos,
nuevos accesos protegidos en server_sync y artículos legados conservados. No
se convierten eventos standalone en pendientes.

### Resultados finales y límites

| Verificación | Resultado |
|---|---|
| Base inicial analyze / suite | Sin problemas; 1559 aprobadas y 1 omitida remota |
| Aceptación/respaldo después de la corrección | 48 aprobadas (8 nuevas) |
| Último dart analyze | Sin problemas; exit 0 |
| Último flutter test --reporter json | 1567 aprobadas, 0 fallidas, 1 omitida; exit 0; 62.733 s |
| Último git diff --check | Sin errores; exit 0 |
| Alcance local | Aceptación satisfecha; sin defectos conocidos pendientes |

Se mantienen 56 advertencias Drift preexistentes por múltiples instancias de
prueba; las nuevas no comparten executor. Corridas intermedias fallidas o
interrumpidas se registran y no se cuentan como aprobación: preparación de
fixture, apertura diferida de SQLite en reloj de widget, trazas temporales y
los tres rechazos que detectaron el defecto ya corregido.

Se reutilizan las seis capturas inspeccionadas de fase 4. La suite final vuelve
a ejecutar layout/scroll/Guardar en 320×640 y 740×360 (texto 1.3) y 1280×800
(texto 1.5), con teclado/insets simulados. No hubo pruebas físicas ni teclado
real. No se abrió, reinició o reemplazó la base del usuario ni se inició su app.
No se verificó respaldo en una cuenta remota. La omisión requiere
POS_PHASE3_SYNC_URL con Nest/PostgreSQL aislados; no se ejecutó ni acredita
validación local/remota. Dependencias, conflictos entre terminales y clientes
antiguos en servidor corresponden a fases 6–7, pendientes de solicitud explícita.


## Implementación y cierre de fase 6 del 2026-10-08

**Fase 6 completa; servidor verificado con PostgreSQL real.** Solicitud explícita
para NestJS/PostgreSQL del plan revisión 1, conservando cambios preexistentes y
sin habilitar la función remota en Flutter. El criterio de salida se satisface
con contratos/fixtures, esquema conservador y aplicación atómica/idempotente.
El informe [[08 - Roadmap/Proveedores de productos/Verificacion servidor - fase 6|Verificación de servidor]]
y `Evidencia/2026-10-08-fase6` registran comandos, resultados, hashes, archivos,
corridas intermedias y límites. El plan rev. 1 permanece intacto.

### Entrega y compatibilidad

- SupplierEntity hereda trazabilidad del servidor y conserva nombre/teléfono/
  notas; sin unicidad global del nombre, borrado ni desactivación del catálogo.
  VariantSupplierEntity tiene PK variante/proveedor, CASCADE a variante y
  RESTRICT a proveedor, bigint de precio/instante con límites seguros completos.
- Migración aditiva CreateProductSuppliers1791417600000; no inventa proveedores,
  precios o fechas y no modifica datos/eventos previos. Up repetible, ejecución
  TypeORM registrada en pruebas y down protegido ante datos de proveedores.
- Contratos nuevos de proveedor, precio, dependencia y validación común; los
  siete fixtures son copias literales de Dart con hashes comparados. Las listas
  se normalizan/ordenan y se preserva ausencia legada. Enteros seguros antes de
  convertir a texto bigint; quoted_at_ms no pasa por Date.
- ProveedorEventHandler y despacho/DI actuales: identidad, base aceptada,
  versión, secuencia y before; advisory locks por identidad/evento, idempotencia
  incluso al repetir altas después de editar y conflictos oficiales.
- ProductoEventHandler reconstruye base con filas y conocimiento del último
  evento aceptado; incluye precios/fechas en comparación y reemplazo atómico.
  Valida existencia/dependencias de after y el alta aceptada original cuando
  se declara depends_on_event_id. Before no fuerza entrega de altas retiradas.
- sameState conserva ausencia != []; sameEditingBase permite solo transición
  legada vacía exacta. Snapshot parcial/null y mezclas before/after fallan.
  Un parser viejo que omite campos no puede sobrescribir conjuntos conocidos,
  aunque ya estén vacíos. No se interpreta omisión como retirada.
- Refs supplier/affects, variant_suppliers/affects y supplier/uses, deduplicadas,
  con unión before/after y conjuntos retirados. Borrado lógico conserva precios
  históricos e incluye refs inactivas; CASCADE cubre el borrado físico sin
  eliminar catálogo. Se mantiene la concurrencia del producto completo y las
  refs/flujos anteriores de producto, recetas, inventario, categorías y unidades.
- Endpoints/respuestas y transporte existentes: push deduplica y devuelve
  resultados actuales; preflight encuentra refs nuevas y pull entrega aceptados.
  No se crea otra infraestructura de sincronización ni negociación de versiones.

### Archivos modificados

Servidor, rutas relativas a pos-nest:

- Entidades nuevas `src/entities/supplier.entity.ts`, `variant-supplier.entity.ts`.
- Migración y suite nuevas `src/migrations/1791417600000-CreateProductSuppliers*`.
- `src/sync/payloads/`: proveedor-creado/actualizado.payload.ts,
  producto-proveedor-precio.ts, producto-proveedor-dependencia.ts,
  supplier-json.ts, supplier-event-envelope.ts, supplier-event-identity.ts y
  supplier-contracts.spec.ts; extensiones producto-creado/actualizado.payload.ts.
- Handler nuevo `src/sync/proveedor-event.handler.ts`; ampliados
  producto-event.handler.ts, sync.service.ts y `src/app.module.ts`.
- Pruebas nuevas `src/sync/product-suppliers.postgres.spec.ts`, soporte
  `src/testing/supplier-contract-fixtures.ts` y siete `test/fixtures/suppliers_v1`.
- Ajustados producto-event.handler.spec.ts, producto-event.handler.postgres.spec.ts,
  sync.service.spec.ts y `src/testing/variant-tracking-scenario.ts` para metadatos
  de base y entidades actuales. Los fixtures de seguimiento no se modificaron.
- Ajuste mínimo a `src/sync/account-balance-baseline-event.handler.ts`: where:{}
  requerido por TypeORM para seleccionar la declaración global más antigua;
  conserva la regla anterior, verificada por su suite PostgreSQL de ocho casos.
- Contrato servidor `docs/product_suppliers.md`.

Flutter: únicamente documentación `docs/architecture/product_suppliers.md`.
Sus fuentes lib/test y fixtures permanecen idénticos por SHA256. No se cambian
protecciones standalone/server_sync, generado, esquema, migraciones locales,
comandos, handlers o interfaz. El inventario/delta final detalla todos los
archivos nuevos/modificados y los demás hashes conservados.

### Verificación final

| Comando/comprobación | Resultado |
|---|---|
| npm run build | Exit 0 |
| npm test -- --runInBand (con reporte JSON) | 21 suites / 314 pruebas aprobadas; 27 suites / 193 pruebas PostgreSQL omitidas aquí |
| RUN_POSTGRES_INTEGRATION=1 npm test -- --runInBand (con reporte JSON) | 48 suites / 507 pruebas aprobadas; cero fallos y cero omisiones |
| git diff --check, servidor/análisis/Flutter | Exit 0 |
| flutter test de los dos archivos de payloads de proveedores | 68 aprobadas; cero fallos/omisiones |
| SHA256 de fixtures Dart/TS | Los siete idénticos |
| Preservación | Plan y código funcional Flutter sin cambios; cambios previos conservados |

PostgreSQL 18.4 / Node v26.0.0. Se creó un cluster independiente con initdb,
puerto local 60832 y base sintética pos_cash_test_fase6, además de esquemas de
prueba aislados. El nombre permite ejecutar las protecciones de las suites de
Caja/saldo bancario. La suite completa verifica migraciones, proveedores,
productos/recetas/inventario/ventas, Caja, clientes/crédito, finanzas y sync.
La corrida ordinaria omitida no se usa como evidencia PostgreSQL.

Se conservaron las corridas intermedias fallidas, que no cuentan como aprobación:
comparación JSON entre realms pg/Jest, fixtures de saldo/FK, secuencias de
seguimiento, nombre protegido de la base de Caja, consulta sin where y
preparación de ocho casos adicionales. Se corrigieron antes del resultado final.
La comparación JSON de deduplicación usa valores canónicos y no prototipos.
El seed ahora acredita 41/42 reservadas por los fixtures en la secuencia real.

### Límites y siguiente paso

No se desplegó servidor, no se ejecutaron migraciones en datos del usuario ni
se probaron dispositivos físicos, transporte Flutter o dos terminales. Pull
entrega todos los tipos aceptados, sin filtrar por versión: lectura compatible
y habilitación pertenecen a fase 7. JavaScript no conserva la grafía 1.0 frente
a 1 tras JSON.parse; el contrato TS valida valor entero seguro y rechaza strings,
fracciones y exceso de rango. No se añadió un parser léxico a los endpoints.
La suite completa muestra dos advertencias pg sobre consultas en un cliente
ocupado; no causan fallos y su origen no se investigó en esta fase.

No se promueven/importan eventos standalone not_required. No se agregan compras,
gastos, cambios automáticos de costo ni pantallas. **Fase 7 queda como siguiente
paso y la funcionalidad remota todavía no está habilitada en Flutter.**


## Implementación de fase 7 del 2026-10-08

Solicitud explícita de integrar/habilitar proveedores y precios en server_sync,
verificar dos terminales y cerrar la funcionalidad. Criterio de salida cumplido:
plan completo, convergencia entre terminales lógicas, conflictos consistentes,
compatibilidad sin pérdida y standalone intacto. No se desplegó nada.

### Cambios

Flutter integra disponibilidad en catálogo/editor/consulta y comandos/handlers;
registra ProveedorPendingEventValidator y extiende el de producto. Reutiliza
PendingEventRevalidator, SyncPushService, RemoteEventPreparer, ServerEchoAcknowledger
y SyncConflictProjectionCleaner. ProveedorConflictProjectionRestorer y el puerto
existente restauran/retiran proveedores por lastEventId/createdEventId. Las cadenas
se procesan de último a primero, antes de las FK. El producto conserva su undo
con variantes, recetas, proveedores/precios y memoria de inventario.

Bases pendientes declaran secuencia causal null y esperan confirmación. Los
productos dependen del alta original del proveedor; nombre/notas no la cambian.
Solo after/base exige entrega; before mantiene historia y refs de retirados.
Se corrige ProductoDao para no acreditar como oficial la secuencia de una base
conflictiva/rechazada al restaurar. No hay fusión por proveedor ni reloj.

Antes del push de contratos nuevos se comprueba product_suppliers_v1 en health;
la ausencia deja cambios pendientes. NestJS solo añade este anuncio/DTO/prueba.
El arnés HTTP existente registra proveedor y el gateway real. Pull/preflight
fallan ante entradas inválidas/tipos desconocidos, incluidos ecos, conservando
la transacción y el checkpoint. Una terminal nueva utiliza pull desde cero.
No se añade transporte, bootstrap o recuperación alternativos.

Standalone mantiene applied/not_required, event_refs=0 y sin actividad remota.
Cambiar modo no promueve/importa historial; comandos remotos rechazan bases y
altas standalone sin importación explícita. No cambian tablas, generado Drift,
schemaVersion=8 ni onUpgrade. Se conservan Cotizaciones y cambios preexistentes.

### Verificación y evidencia

- dart analyze: sin problemas. flutter test: 1578 aprobadas, cero fallidas y cero
  omisiones, con nueve casos nuevos HTTP/PostgreSQL/WebSocket reales, cuatro
  protecciones complementarias y la regresión remota de seguimiento activada.
- npm run build: aprobado. npm test: 314 aprobadas, 193 PostgreSQL omitidas por
  opt-in; RUN_POSTGRES_INTEGRATION=1: 48 suites / 507 aprobadas, cero omisiones.
- git diff --check aprobado en Flutter, NestJS y análisis; arnés HTTP typecheck
  aprobado. SHA256 de app_database.g.dart intacto; cero archivos eliminados.
- PostgreSQL temporal independiente, escucha loopback y esquemas sintéticos;
  dos SQLite/identidades por caso y una tercera terminal para pull inicial.
  Reinicio de A conserva pendientes; WebSocket real confirma avisos/reconexión.
- Cadenas, rechazo de alta/base, concurrencia, ecos, replay, reintentos, precios
  cero/máximo, fecha de rango completo, cliente legado y cursor ante evento futuro.
  Venta, receta/directo, costos, existencias y movimientos permanecen intactos.

[Verificación remota](Verificacion%20remota%20-%20fase%207.md),
[Matriz remota](Matriz%20de%20aceptacion%20remota.md) y
[Evidencia](Evidencia/2026-10-08-fase7) conservan comandos/resultados, corridas
intermedias fallidas, correcciones, manifiestos, compatibilidad y limpieza.
Se completan A14–A16 de la matriz de fase 5 y se repiten sus pruebas locales.

### Límites de cierre

Son terminales lógicas, no dispositivos físicos. No hubo pruebas físicas,
despliegue, migración de datos del usuario o actualización coordinada real.
El despliegue exige todos los clientes compatibles: la capability del servidor
no acredita versiones de otras terminales y pull distribuye todos los tipos.
La protección ante servidor anterior se prueba con HTTP sintético; no sustituye
la integración real contra NestJS/PostgreSQL. Las advertencias preexistentes de
pg y Drift están documentadas. No se añaden compras, gastos, proveedores
preferidos, historial visual o cambios automáticos de costos.

**Fase 7 y plan revisión 1 terminados; no queda otra fase de implementación.**
