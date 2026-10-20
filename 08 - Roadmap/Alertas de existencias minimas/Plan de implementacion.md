---
tipo: plan_implementacion
estado: implementado_pendiente_verificacion_fisica
revision: 1
actualizado: 2026-10-19
---

# Alertas de existencias mínimas por variante

## Objetivo y alcance

Guardar en `product_variants` un mínimo opcional por variante y mostrar
cuándo su existencia actual alcanza o baja de ese mínimo. Funciona offline
en Flutter y conserva el dato entre dispositivos en `server_sync`.

El usuario solicitó el mínimo por variante y un plan ejecutable en una o
varias sesiones. Las reglas de comparación, presentación, compatibilidad y
conservación siguientes son propuestas de esta revisión del plan, basadas
en el análisis previo; no se atribuyen como decisiones adicionales del usuario.
La revisión inicial fue documental. Las sesiones 1–5 implementaron y verificaron
la funcionalidad; la sesión 6 complementaria comprueba de nuevo la disponibilidad
de hardware y no encuentra móvil físico accesible. A42 conserva pendiente físico,
según la matriz y evidencia vigente; no hay cierre total.

Primera entrega: captura en el editor de variantes, indicador en el informe
de existencias, contador y filtro de existencias bajas. Se reutilizan eventos,
movimientos, reporte y sincronización existentes. Quedan fuera notificaciones
del sistema, ventanas emergentes repetidas, avisos por correo, compras
automáticas, bloqueo de ventas y cálculo de producción disponible por recetas.
CSV y edición masiva conservarán el mínimo; no incorporarán su captura.

## Reglas funcionales propuestas

| Situación | Resultado |
|---|---|
| Mínimo `null` | Aviso desactivado |
| Mínimo `0` | Aviso con existencia cero o negativa |
| Mínimo positivo | Aviso con existencia igual o menor al mínimo |
| Existencia superior al mínimo | Sin aviso |
| Producto o variante inactivos | Fuera del aviso y del contador |
| Variante sin vínculo directo, incluida una receta | Fuera del aviso; conservar cualquier mínimo anterior |
| Se desactiva seguimiento o se retira una variante | Conservar el mínimo; suspender su evaluación |
| Se recupera el seguimiento compatible | Usar el mínimo conservado y el saldo vigente |

La condición utiliza el saldo físico `quantity_on_hand_atomic`, que ya lee el
reporte. No calcula reservas ni cantidad producible. Un mínimo de cinco piezas
avisa también al quedar cinco, no solo cuatro. Subir el saldo por encima del
mínimo retira el aviso; cambiar el mínimo también recalcula inmediatamente.

Se persiste el umbral. El estado de alerta se deriva de catálogo y saldo;
no requiere una tabla de alertas, un booleano persistido, otro evento por
venta ni un proceso que recorra movimientos. La UI evalúa el estado local:
los cambios de otros dispositivos se reflejan cuando llega su sincronización.

En una variante sin seguimiento no se ofrece configurar un mínimo nuevo.
Quitar el vínculo no equivale a borrar el mínimo. Vaciar explícitamente el
campo con seguimiento activo sí desactiva el aviso. Los modelos de formulario
y comandos deben distinguir conservar de borrar.

## Base de código inspeccionada

Referencias al planificar el 2026-10-19:

- Flutter: `/Users/benjamin/Projects/POS/pos_flutter`, HEAD `3e8e1ed`.
- NestJS: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`, HEAD `dcc2907`.
- Vault: carpeta `analisis ` con espacio final, HEAD `b077dc7`.

Flutter contiene cambios ajenos en el editor de variantes, gestión de
inventario e informes, además de archivos nuevos del informe de existencias
y su edición. El vault tiene cambios previos en el mapa, continuidad/evidencia
CSV y edición masiva. NestJS no mostró cambios locales. Releer Git y AGENTS
al iniciar cada sesión y preservar lo ajeno; estas referencias no sustituyen
una inspección del árbol vigente.

| Responsabilidad | Archivo relativo al proyecto correspondiente |
|---|---|
| Variante SQLite y restricciones | Flutter: `lib/data/local/drift/tables/product_variants.dart` |
| Saldo físico y unidad | Flutter: `tables/inventory_balances.dart`, `tables/inventory_items.dart`, bajo `lib/data/local/drift/` |
| Esquema aceptado y reset de desarrollo | Flutter: `lib/data/local/drift/current_database_schema.dart`, `app_database.dart` |
| Parseo exacto de cantidades | Flutter: `lib/domain/inventario/inventory_quantity_codec.dart` |
| Detalle y listado de variantes | Flutter: `lib/domain/articulos/variante_detalle.dart`, `variante_listado.dart` |
| Intenciones y emisión de eventos | Flutter: `lib/application/commands/articulos/producto_command_service.dart`, `crear_articulo_variante_command.dart` |
| Contratos de producto | Ambos: `producto_creado_payload.dart` / `producto-creado.payload.ts` y actualizado, en sus carpetas de payloads |
| Aplicación, snapshot y reversión | Flutter: `lib/data/local/drift/drift_producto_projection_store.dart`, `lib/application/sync/handlers/producto_event_handler.dart`, `revalidation/producto_pending_event_validator.dart` |
| Lecturas | Flutter: `lib/data/local/drift/daos/producto_dao.dart`, `lib/data/repositories/producto_repository_impl.dart` |
| Formulario y conversión a comando | Flutter: `lib/presentation/pages/gestion_inventario/articulos/models/articulo_form_result.dart`, `articulo_preview_form.dart`, `articulo_form_command.dart`, `widgets/variant_editor_screen.dart` |
| Informe observable y edición desde informe | Flutter: `lib/presentation/pages/informes/remaining_stock_screen.dart`, `remaining_stock_variant_editor.dart`, `models/remaining_stock_item.dart`, `widgets/remaining_stock_report_card.dart` |
| Variante PostgreSQL y receptor | NestJS: `src/entities/product-variant.entity.ts`, `src/sync/producto-event.handler.ts` |
| Persistencia de rechazo/borrado | Flutter: `lib/data/local/drift/tables/product_update_undo.dart` y consumidores del snapshot JSON |

El informe y su coordinador de edición ya existen en el árbol de trabajo,
aunque algunos archivos aún no están versionados. Extenderlos y preservar sus
cambios; no crear otro informe ni asumir que solo existe lo incluido en HEAD.
Los nombres de columnas mencionados arriba son código inspeccionado;
en esa inspección inicial `minimum_stock_atomic` todavía no existía; las sesiones
1–4 lo incorporaron y la sesión 5 verifica su conservación.

## Contrato de datos

- Columna `product_variants.minimum_stock_atomic`: entero nullable en SQLite
  y `bigint` nullable en PostgreSQL. Nombre JSON idéntico.
- Rango permitido: `0..9007199254740991`, además de `null`. Aplicar el
  límite común también en PostgreSQL y en ambos contratos JSON.
- Guardar átomos de la dimensión del recurso vinculado. La pantalla captura y
  muestra en su unidad de inventario; no en la cantidad de referencia del
  precio de venta. Ejemplo: `1.5 kg` equivale a `1500` átomos de masa.
- Reutilizar el codec de cantidades, con validación en el command service.
  Rechazar negativos, fracciones de piezas, exceso de precisión, desbordamiento,
  strings o fracciones JSON, booleanos y valores no finitos.
- No añadir una unidad independiente al mínimo ni una restricción SQL que
  obligue a borrarlo al desvincular inventario. Validar la dimensión al
  recuperar un recurso según las reglas existentes.
- Editarlo pertenece al agregado `product`: conserva la concurrencia por
  producto, incluso si otra tablet cambia otra variante del mismo artículo.
  No modifica saldo, movimientos, recetas, precios ni la clave de consumo.

### Compatibilidad de eventos y clientes

La ausencia histórica del campo no tiene la misma intención que un `null`
explícito. El parser y serializador tipados deben conservar esa distinción.
Usar una señal de presencia propia del contrato; el nombre de esa señal se
resuelve al implementar, sin agregar otra columna de negocio por prevención.

1. Un snapshot legado omite el campo en todas sus variantes. Una creación
   legada se aplica con mínimo físico `null` y su JSON permanece legado.
2. Un snapshot actual declara el campo en todas sus variantes, aunque su
   valor sea `null`. Rechazar snapshots parcialmente declarados y una
   actualización que mezcle conocimiento legado y actual entre before/after.
3. Permitir que un cliente actual edite una base legada convirtiendo de forma
   explícita su estado previo a mínimos conocidos `null`. La equivalencia
   con la base se comprueba dentro de `sameEditingBase`, sin relajar la
   comparación de los demás campos ni evento, versión o secuencia base.
4. Un escritor legado puede editar una base realmente legada mientras todos
   sus mínimos almacenados sean `null`. Una vez que la base aceptada declara
   mínimos, una edición legada se rechaza indicando que requiere una app
   actualizada; nunca se acepta una degradación que borre valores. Esto
   incluye el borrado del producto desde un escritor legado.
5. `sameState` incluye los valores del mínimo. La normalización de presencia
   de una base legada, sin cambio de negocio, no genera por sí sola eventos.
   Un `null` explícito en una edición actual sí retira un mínimo existente.
6. Conservar el conocimiento a través de eventos base, snapshots, pendientes,
   confirmaciones y restauraciones. La tabla con `null` no permite deducir si
   el evento conocía el campo. El patrón de proveedores sirve como referencia,
   pero no se debe cambiar su compatibilidad al añadir la del mínimo.

Esta política admite leer historia antigua y evita pérdida silenciosa por
escritores antiguos; no promete que una app antigua pueda seguir editando
productos que ya usan el contrato nuevo. La recepción de un evento nuevo en
un servidor antiguo tampoco queda soportada: preparar primero el receptor
compatible antes de habilitar escritores actuales en un despliegue posterior.

Agregar fixtures equivalentes para Dart y TypeScript: legado, actual con
`null`, cero, positivo, medido, snapshot parcial inválido y edición que intenta
volver a legado. Comprobar round-trip y canonicalización sin reescribir
eventos históricos ni perder campos en push/pull.

## Escritura y conservación

Mantener el flujo UI → comando → evento tipado → aplicación idempotente →
proyección → repositorio observable. La UI no escribe Drift.

Los comandos distinguen tres intenciones: conservar, establecer un número y
retirar el mínimo. Evitar que un constructor anterior con valor por defecto
`null` borre mínimos. Reutilizar un tipo de cambio explícito existente si
encaja, sin crear infraestructura genérica nueva.

Auditar todos los constructores/copiadores de variantes, no solo el editor:

- Alta sencilla/avanzada, edición del artículo completo y edición de una
  variante desde el informe.
- Asignación o reemplazo de barcode, incluido el recorrido del lector físico.
- CSV de diez/doce columnas, altas y actualizaciones, variantes omitidas y
  lotes mixtos. Mantener los encabezados vigentes; las altas quedan sin
  mínimo y las actualizaciones conservan el del catálogo.
- Edición comercial masiva y recepción de mercancía: preservar el mínimo y
  su semántica de presencia al modificar venta, costo y proveedores. Una
  entrada de mercancía puede cambiar el aviso por el nuevo saldo.
- Recetas, proveedores, orden de variantes, retirada, eliminación y
  recuperación de seguimiento: no perder un mínimo que no se está editando.

Los cambios acotados superponen campos permitidos sobre el snapshot completo.
El saldo vivo no forma parte de `sameState` de producto. Un cambio solo de
mínimo genera un `producto_actualizado`; un guardado idéntico genera cero.
Conservar la base confirmada y la atomicidad existente de eventos/proyecciones.

## Esquemas, modos y restauración

En Flutter seguir AGENTS vigente: `schemaVersion` fijo y reset de desarrollo,
sin añadir una migración local ni subir versión para esta columna. Actualizar
la comprobación de esquema usada por arranque y restauración; una base sin
la columna no debe aceptarse como actual. Regenerar Drift.

El reset puede eliminar los datos locales del esquema anterior. Las pruebas
usan bases temporales; no abrir la instalación operativa para comprobarlo.
Conservar la protección existente de respaldos restaurados incompatibles.
Respaldar/restaurar una base del nuevo esquema debe conservar el mínimo.
Si se requiere migración local con conservación, modificar expresamente esta
política antes de implementar ese requisito; no introducirla implícitamente.

En NestJS añadir una migración aditiva, posterior a las existentes, registrada
en la configuración real del proyecto. Verificarla sobre esquema previo con
datos: mismos IDs, saldos, movimientos y eventos; mínimo `null` en variantes
previas. Probar constraints y rollback de la migración en un esquema aislado.
No ejecutar migraciones ni limpiezas sobre la base operativa como parte del plan.

En ambos modos los comandos declaran y validan `LocalEventRef`. En
`standalone` se persisten eventos `delivery_status = not_required`, se
aplican localmente y no se crean filas `event_refs`; tampoco se ejecutan
push, pull, preflight, health checks ni WebSocket. En `server_sync` se
conservan refs, dependencias y el protocolo existentes; el mínimo no crea
un nuevo tipo de referencia ni un agregado adicional.

Probar pendientes, rechazo, conflicto, rollback y eliminación optimista:
`before`, `after` y `product_update_undo` deben conservar el valor y el
conocimiento correctos. Una restauración nunca debe sobreescribir una base
posterior aceptada. Reabrir/reconstruir debe producir el mismo estado.
No convertir historial standalone en pendiente ni reconstruir refs por
añadir este campo.

## Interfaz y lectura

- Campo «Existencia mínima» con unidad visible en el editor compartido.
  Vacío significa aviso desactivado y cero es un valor válido.
- Cargar el mínimo existente en preview, form result, copyWith y conversión
  a comando, también al abrir desde el informe o escáner.
- Conservarlo al ocultar/deshabilitar seguimiento y al guardar otros campos.
  Cancelar una edición del mínimo no genera eventos.
- En el informe existente mostrar el mínimo configurado y el distintivo
  «Existencia baja». Ofrecer «Todas» y «Existencias bajas», y un estado vacío
  específico cuando no hay alertas. Conservar navegación y edición actuales.
- La tarjeta de Informes conserva el total de variantes con seguimiento y
  añade cuántas tienen existencia baja. Contador, filtro y filas usan una
  misma regla de dominio sin importar Drift.
- Observar cambios de catálogo y balance con el repositorio existente.
  No añadir temporizadores, peticiones por fila, sumas del historial ni un
  segundo flujo de sincronización.

## Sesiones y criterios de salida

Cinco sesiones secuenciales recomendadas. También puede hacerse en una
sesión larga manteniendo este orden y sus verificaciones. Se pueden agrupar
1–2 y 3–4 si el contexto permite terminar cada criterio de salida.
No habilitar la captura pública antes de completar core local y receptor.

| Sesión | Trabajo | Criterio de salida |
|---|---|---|
| [[08 - Roadmap/Alertas de existencias minimas/Sesiones/01 - Contratos y esquemas\|1. Contratos y esquemas]] | Contrato Dart/TypeScript, presencia legada, fixtures, tablas y migración PostgreSQL | Rango y round-trip equivalentes; esquemas/restore correctos; sin UI pública |
| [[08 - Roadmap/Alertas de existencias minimas/Sesiones/02 - Persistencia local y conservacion\|2. Persistencia local y conservación]] | Comandos, snapshots, proyecciones, repositorios, reversión y todos los escritores Flutter | SQLite real en ambos modos; cambiar/preservar/borrar y no-op correctos |
| [[08 - Roadmap/Alertas de existencias minimas/Sesiones/03 - Servidor y sincronizacion\|3. Servidor y sincronización]] | Receptor, bases, canonicalización, push/pull e integración entre clientes | PostgreSQL y HTTP aislados: convergencia, rechazo legado y conflictos sin pérdida |
| [[08 - Roadmap/Alertas de existencias minimas/Sesiones/04 - Editor e informe\|4. Editor e informe]] | Captura compartida, aviso observable, contador y filtro en informe existente | Recorrido de usuario con persistencia real, cancelación y actualización por saldo |
| [[08 - Roadmap/Alertas de existencias minimas/Sesiones/05 - Verificacion y cierre\|5. Verificación y cierre]] | Regresión, reapertura/backup, prueba manual y evidencia de matriz | Casos resueltos con alcance acreditado y pendientes físicos explícitos |
| [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion6/README\|6. Complementaria: verificación física]] | Detectar hardware, aislar instalación/datos y ejecutar A42 en teléfono/tablet | Solo cerrar A42 con evidencia física; ejecución 2026-10-19 pendiente de hardware, sin móvil accesible |

Cada sesión lee este plan, la [[08 - Roadmap/Alertas de existencias minimas/Matriz de aceptacion|matriz]]
y [[08 - Roadmap/Alertas de existencias minimas/Estado y continuidad|continuidad]],
revisa Git/AGENTS y deja archivos, comandos, resultados, limitaciones y siguiente
paso. No repetir trabajo terminado ni declarar aprobadas pruebas omitidas.

## Verificación y definición de terminado

Antes de implementar leer las guías offline de Flutter y AGENTS de ambos
proyectos. Usar pruebas existentes de contratos, comandos, SQLite,
seguimiento, CSV, edición masiva e informes, extendiéndolas para estas reglas.
Las nuevas pruebas deben acreditar comportamiento/persistencia y pérdida de
datos evitada, no solo repetir llamadas de métodos.

Tras cambios Drift ejecutar `dart run build_runner build`. En cada sesión con
cambios funcionales Flutter ejecutar `dart analyze` y `flutter test` según
AGENTS. Para NestJS ejecutar `npm run build` y los tests pertinentes con
`npm test -- --runInBand`; habilitar `RUN_POSTGRES_INTEGRATION=1` en los
casos PostgreSQL con configuración de pruebas aislada. Usar los arneses HTTP
existentes y verificar sus variables reales al iniciar la sesión 3; no
contabilizar integraciones omitidas como aceptación.

No usar `npm run lint` como chequeo de lectura: actualmente lleva `--fix`.
Si hace falta lint, limitar el chequeo sin autofix a los archivos de la entrega.
No instalar dependencias para esta característica salvo necesidad demostrada.

La prueba manual usa una base aislada: configurar mínimo cinco, llegar a cinco
mediante venta confirmada, verificar aviso, reponer a seis y verificar retirada,
cambiar el mínimo, desactivarlo, reabrir y editar desde el informe. Cubrir una
variante medida y, cuando haya hardware disponible, teclado/decimal/scroll en
teléfono o tablet. Los widgets de escritorio no acreditan dispositivo físico.

La entrega termina cuando la matriz acredita contratos, persistencia,
conservación, interfaz y sincronización; los pendientes deben figurar con su
causa y próximo paso. Actualizar notas canónicas de Artículos, catálogo y
sincronización marcando qué se implementó, sin presentar propuestas como código.
No hacer commits, push, despliegues ni migraciones operativas como efecto
automático de ejecutar las sesiones.

## Estado de ejecución — sesión 6 complementaria, 2026-10-19

Sesiones 1–4 completadas en sus alcances; sesión 5 completa regresión, restore
integrado y manual de la app macOS aislada. A01–A41 tienen evidencia identificable.
A42 parcial: falta probar teclado decimal real, legibilidad, scroll y navegación
en teléfono/tablet físico. La sesión 6 ejecutó Flutter, ADB, devicectl, xctrace y
enumeración USB (09:48–09:49, America/Mexico_City), sin móvil físico accesible.
No se instaló ni ejecutó la app y no se abrieron datos operativos. Permanecen
pendientes metadatos del hardware/versión instalada/idioma/teclado/escala, instalación
aislada, captura kg con punto/coma/precisión/cero/vacío, texto grande/scroll,
navegación, venta 6→5/reposición a 6, edición desde informe/vacío/reapertura en
piezas y kg, contador/filtros/cancelación/offline en ese hardware.

Las fuentes/evidencias del manifest final de sesión 5 coinciden por SHA256
(48 Flutter, 12 Nest, 276 vault); no hubo cambios funcionales ni repetición de
suites aprobadas. Ver [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion6/README|Evidencia vigente, preservación y checklist físico]].
No hay cierre total. No se modifican las reglas de
esta revisión ni se autoriza despliegue. Ver [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|Resultado final y límites]].
