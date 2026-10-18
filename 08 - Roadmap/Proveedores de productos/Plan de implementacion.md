---
tipo: plan_implementacion
estado: completo
revision: 1
actualizado: 2026-10-08
---

# Proveedores de productos: plan de implementación por sesiones

## Objetivo

Registrar proveedores, relacionarlos con las presentaciones de un producto y
conservar el precio que ofrece cada uno. Agregar una pestaña PROVEEDORES a
Gestión del inventario y un editor de proveedores en cada variante, siguiendo
la interacción actual de las recetas: elegir elementos de un catálogo y
capturar un valor para cada relación.

Plan revisión 1 completado el 2026-10-08: fases 1–5 locales, servidor de fase 6
e integración remota de fase 7 verificados. El diseño inicial fue confirmado
por las solicitudes de implementación. Ver Estado y continuidad y las matrices
de aceptación local/remota para resultados, evidencia y límites físicos.

## Base verificada en código

- Gestión del inventario tiene ARTÍCULOS, CATEGORÍA y RECURSOS. El controlador,
  las vistas y el menú Agregar deberán incorporar PROVEEDORES.
- La receta pertenece a una variante, no al producto completo. Su tabla
  `recipe_components` tiene clave compuesta por variante y recurso.
- `RecipeEditorScreen` permite capturar cantidades y devuelve un resultado de
  formulario. El producto se persiste mediante comandos y eventos.
- `producto_creado` incluye variantes y recetas. `producto_actualizado`
  transporta estados completos `before` y `after`; la comparación del estado,
  la proyección y la reversión también conocen las recetas.
- Precio de venta y costo estándar ya son valores distintos de la variante.
- No se encontró un catálogo de proveedores ni relaciones comerciales con
  proveedores implementados en los proyectos revisados.

Fuentes de referencia:

| Responsabilidad | Archivo |
|---|---|
| Pestañas y navegación | [inventory_management_screen.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/presentation/pages/gestion_inventario/inventory_management_screen.dart) |
| Menú Agregar | [inventory_add_options_bottom_sheet.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/presentation/pages/gestion_inventario/widgets/inventory_add_options_bottom_sheet.dart) |
| Interacción de receta | [recipe_editor_screen.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/presentation/pages/gestion_inventario/articulos/widgets/recipe_editor_screen.dart) |
| Editor de variante | [variant_editor_screen.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/presentation/pages/gestion_inventario/articulos/widgets/variant_editor_screen.dart) |
| Relación de receta | [recipe_components.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/data/local/drift/tables/recipe_components.dart) |
| Comandos de producto | [producto_command_service.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/application/commands/articulos/producto_command_service.dart) |
| Estado completo y comparación | [producto_actualizado_payload.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/application/sync/payloads/producto_actualizado_payload.dart) |
| Proyección y restauración | [drift_producto_projection_store.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/data/local/drift/drift_producto_projection_store.dart) |
| Revalidación | [producto_pending_event_validator.dart](/Users/benjamin/Projects/POS/pos_flutter/lib/application/sync/revalidation/producto_pending_event_validator.dart) |
| Aplicación en servidor | [producto-event.handler.ts](</Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest/src/sync/producto-event.handler.ts>) |
| Despacho de eventos remoto | [sync.service.ts](</Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest/src/sync/sync.service.ts>) |

## Alcance inicial propuesto

1. Asociar proveedores por **variante**. Un producto de una sola presentación
   utiliza su única variante; distintas presentaciones pueden tener precios y
   proveedores diferentes.
2. Un proveedor puede atender muchas variantes y una variante puede tener
   muchos proveedores. No repetir al mismo proveedor dentro de una variante.
3. Guardar un precio vigente por pareja proveedor/variante, en la misma moneda
   del POS, junto con la fecha del precio informado. Una nueva captura
   reemplaza el precio vigente; los eventos conservan los cambios anteriores.
4. Capturar nombre obligatorio del proveedor, teléfono y notas opcionales.
   Crear y editar desde su pestaña. No imponer unicidad global al nombre.
5. Separar el precio informado por el proveedor del precio de venta, del costo
   estándar y del costo real de movimientos de inventario. Su captura no
   modifica esos valores ni genera entradas, compras o gastos.
6. Permitir proveedores en variantes con receta, seguimiento directo o sin
   seguimiento. La selección de proveedores no pertenece al selector excluyente
   entre receta y seguimiento directo.

Estos valores son la propuesta de partida para la sesión 1. Si se pide
historial consultable, proveedores de ingredientes, precios por caja o varias
monedas, ajustar el contrato antes de programar esas capacidades.

Quedan fuera de esta primera versión: órdenes de compra, cuentas por pagar,
recepciones de mercancía, proveedores preferidos, desactivación/borrado del
catálogo de proveedores, vínculos con recursos de inventario, conversiones de
empaque y pantalla de historial de precios. Los precios de proveedor tampoco
son las cotizaciones para clientes del módulo existente de Cotizaciones.

## Modelo y flujo propuestos

| Tabla local | Datos y responsabilidad |
|---|---|
| `suppliers` | `id`, `name`, `phone`, `notes` y metadatos heredados de `CommonFields`; catálogo con identidad y trazabilidad propias |
| `variant_suppliers` | `variant_id`, `supplier_id`, `quoted_price_minor`, `quoted_at_ms`; precio vigente de la pareja, clave primaria compuesta |

`variant_suppliers` seguiría el patrón de hijos reemplazables de la receta:
sin versión/evento independientes, porque el agregado producto conserva la
concurrencia y trazabilidad. Documentar esta excepción a `CommonFields`.
Relacionar la variante con FK CASCADE y el proveedor con FK RESTRICT. El índice
por proveedor permite consultar sus productos si esa lectura llega a ser
necesaria; no añadir índices sin una consulta que los utilice.

El precio se almacena como entero en unidad monetaria menor, dentro del rango
seguro compartido Dart/JSON/TypeScript. Propuesta: aceptar cero como precio
informado igual a cero; rechazar negativos, más de dos decimales y valores
fuera de rango. Un campo vacío no representa un precio cero. La selección y
la retirada del proveedor deben ser explícitas.

En venta unitaria, el precio corresponde a una unidad de esa variante. En
venta medida, corresponde a la cantidad de referencia del producto, que la UI
debe mostrar. La fecha del precio se normaliza a UTC; no decide el ganador de
un conflicto ni cambia por volver a abrir el formulario.

Eventos propuestos:

- `proveedor_creado`, agregado `supplier`.
- `proveedor_actualizado`, agregado `supplier`, con base y estados necesarios
  para edición y reversión.
- Extender `producto_creado` y `producto_actualizado` con la lista de
  proveedores/precios de cada variante y sus dependencias. Mantener el guardado
  atómico del artículo, como ocurre con sus recetas.

Seguir el patrón existente:

```text
Formulario -> Command -> CommandService -> payload tipado -> evento
-> LocalEventStore.appendAndApply -> handler idempotente -> proyección
-> repository de dominio -> interfaz reactiva
```

Reutilizar la interacción de recetas y los componentes que realmente puedan
compartirse. Los precios necesitan su validación monetaria y su modelo propio;
no reutilizar `quantity_atomic` para almacenar dinero ni modificar la receta
para convertirla en un catálogo de proveedores.

Los command services declaran y validan `LocalEventRef` en ambos modos:
`affects` para proveedor o producto/variante y `uses` para proveedores
referenciados. Fijar los tipos exactos en sesión 1, incluidos los conjuntos
retirados, sin introducir unicidad de nombres no solicitada.

- `standalone`: evento con `delivery_status = not_required`, aplicación local
  y cero filas en `event_refs`. Sin push, pull, preflight, health checks o
  WebSocket.
- `server_sync`: persistir referencias. La integración remota se desarrolla en
  las sesiones 6–7 únicamente cuando se solicite ese alcance. Antes de
  completarlas, la disponibilidad inicial de la UI es solo en `standalone`;
  habilitarla en `server_sync` al cerrar la integración, para evitar enviar
  eventos nuevos a un servidor que todavía no entiende esos datos.

## Sesiones y criterios de salida

Las sesiones 1–5 entregan una función local completa. Las sesiones 6–7 son la
extensión para servidor y sincronización. Una sesión puede abarcar más de un
turno; si no alcanza su criterio de salida, continuarla antes de iniciar la
siguiente. No desarrollar simultáneamente sobre los mismos archivos.

| Sesión | Entrega concreta | Criterio de salida |
|---|---|---|
| 1. Contrato y esquema local | Definir reglas, payloads, compatibilidad, fixtures y tablas Drift | Contrato verificable, esquema regenerado y pruebas de restricciones/serialización aprobadas |
| 2. Catálogo de proveedores | Core local, repositorio, formulario y pestaña PROVEEDORES | Crear, editar y consultar proveedores sin conexión; cancelar no escribe |
| 3. Relaciones con variantes | Extender el flujo de producto y sus lecturas con proveedores/precios | Guardado y reaplicación atómicos; cambios de otros campos conservan proveedores |
| 4. Editor de precios | Selector por variante basado en la interacción de receta | Agregar, cambiar precio, retirar y reabrir relaciones; cancelar descarta el borrador |
| 5. Verificación local y cierre | Pruebas integradas, respaldo, reinicio y regresiones | Casos locales aprobados; standalone sin actividad remota ni event_refs |
| 6. Servidor, si se solicita sync | Esquema PostgreSQL, contratos TS, handlers y despacho | Paridad Dart/TS, persistencia idempotente y pruebas con PostgreSQL real |
| 7. Sincronización y cierre remoto — completa (2026-10-08) | Dependencias, preflight, pull/push, conflictos y pruebas entre terminales | Cambios convergen, conflictos revierten correctamente y standalone conserva sus reglas |

### Sesión 1: contrato y esquema local

Convertir las propuestas anteriores en contrato implementable. Definir JSON
canónico, identidad, fecha, precio, vacíos, duplicados, conjunto vacío y
referencias. Preparar fixtures para proveedor y producto con varios proveedores.
Crear las tablas Drift con comentarios, constraints y registro en `AppDatabase`.

Cerrar la compatibilidad antes de programar la edición: eventos históricos sin
proveedores deben seguir reproduciéndose; omitir el campo en una edición nueva
no puede interpretarse silenciosamente como eliminar relaciones. Distinguir
ausencia legada de retirada explícita y verificar el estado base.

Respetar la política actual de Flutter: no subir `schemaVersion` ni agregar
otra migración `onUpgrade`. Extender la detección del esquema de desarrollo en
`_resetDatabaseOnStartup`, que puede recrear una base anterior, y revisar la
validación de respaldos. No ejecutar reinicios sobre datos del usuario durante
la planificación. Regenerar Drift con `dart run build_runner build`.

### Sesión 2: catálogo de proveedores

Implementar modelos de dominio, DAO, repositorio, puerto/adaptador de
proyección, commands y command service, payloads y handlers idempotentes.
Registrar dependencias en los módulos actuales de DI. Agregar la cuarta
pestaña, listado, estados vacíos y formulario de alta/edición; adaptar el menú
Agregar y verificar que cuatro pestañas quepan en teléfono/tablet.

Normalizar nombre, teléfono y notas. Evitar escrituras directas desde la UI.
Cubrir nombre requerido, normalización, edición basada en versión/evento e
idempotencia. La búsqueda por nombre puede incluirse como lectura local del
catálogo, sin expandir el alcance hacia búsquedas remotas.

### Sesión 3: relaciones con variantes

Extender los comandos de artículo, `ProductoCreadoPayload`, los estados
`before`/`after`, `sameState`, snapshots de proyección, handlers, DAO,
repositorios y detalle de variante. Añadir el valor monetario de dominio
correspondiente sin usar `PrecioVenta` si sus invariantes son diferentes.

Validar proveedores existentes, precios, fechas y duplicados. Guardar la lista
completa de cada variante en la misma transacción del producto. Actualizar
comparaciones del formulario y preparar la representación que utilizará el
selector. Preservar fechas cuando el precio no cambie.

Verificar alta, edición, retirar el último proveedor, eliminación de variante
o artículo por los flujos ya existentes, y restauración de un snapshot. Revisar
también importación/edición masiva y los formularios que reconstruyen el estado
completo: no deben perder relaciones que no están editando. No incorporar un
nuevo formato de intercambio de proveedores en CSV en esta sesión.

### Sesión 4: editor de precios

Crear un editor de proveedores por variante: listado seleccionable, precio por
proveedor, fecha informada, errores y acción Guardar. Mostrar la presentación y
la base del precio; resumir las relaciones en el editor de variante y en su
vista de consulta. Permitir una lista vacía y retirar relaciones explícitamente.

El selector devuelve un `FormResult`; la relación se persiste al guardar el
artículo. Cancelar el selector o el artículo no persiste cambios de relaciones.
Para mantener claras las fronteras de guardado, la primera versión crea nuevos
proveedores desde su pestaña; no requiere alta de proveedor dentro del selector.

Cubrir precio cero, coma/punto decimal, errores, vacío, quitar el último,
cancelación, reabrir y coexistencia con recetas/seguimiento directo. Verificar
el diseño en tamaños representativos de teléfono y tablet.

### Sesión 5: verificación local y cierre

Ejecutar los casos de aceptación, `dart analyze` y `flutter test`; regenerar
Drift si hay cambios finales de tablas. Revisar respaldo/restauración y que
abrir/reiniciar con el esquema ya actualizado no borre proveedores.

Verificar como regresión las tres pestañas existentes, creación/edición de
artículos, recetas, seguimiento de existencias, ventas y Cotizaciones. Registrar
evidencia y límites de las pruebas visuales/físicas realmente realizadas.

Cerrar el alcance local solo cuando estén satisfechos sus criterios. El cierre
local no equivale a que la función esté habilitada para `server_sync`.

### Sesión 6: servidor, si se solicita sincronización

Crear entidades y migración PostgreSQL preservando datos existentes. Escribir
payloads TS con los mismos fixtures Dart, `ProveedorEventHandler` y extensión de
`ProductoEventHandler`. Registrar entidades/handlers en `AppModule` y despacho
en `SyncService`, incluyendo validación, deduplicación, refs y conflictos.

Comprobar bases de edición, existencia de proveedores y preservación de listas
en ediciones legadas. Adoptar una estrategia explícita de compatibilidad entre
versiones de cliente/servidor: un cliente viejo no puede sobrescribir precios
que desconoce. No confiar en que todos los parsers preservan campos adicionales.

Probar constraints y migración en esquema aislado con PostgreSQL real, además
de `npm run build` y `npm test -- --runInBand`. Las suites saltadas por falta de
`RUN_POSTGRES_INTEGRATION=1` no cuentan como verificación PostgreSQL.

### Sesión 7: sincronización y cierre remoto

Extender revalidadores, resolución de dependencias e historia sincronizada:
un proveedor creado offline debe confirmarse antes del producto que lo utiliza;
si falla, sus dependientes no deben enviarse como si el proveedor existiera.
Extender la limpieza/restauración de conflictos para proveedor y producto,
incluyendo sus listas de precios, en el orden inverso de dependencias.

Verificar preflight, push, pull, replay, reinicio y la inicialización de otra
terminal mediante el mecanismo realmente existente. No crear otra
infraestructura de bootstrap/WebSocket como parte del catálogo de proveedores.
La concurrencia inicial conserva la base del agregado producto: dos ediciones
del mismo artículo pueden entrar en conflicto aunque cambien proveedores
distintos; no implementar fusión por proveedor sin otro contrato.

No convertir eventos históricos standalone en pendientes de sync. Mantener la
prueba de cero actividad remota en standalone y realizar pruebas con dos
terminales: edición concurrente del precio, proveedor local pendiente y rechazo
de una base, sin pérdida de recetas, relaciones ni estado oficial.

## Casos de aceptación esenciales

| Caso | Resultado esperado |
|---|---|
| Crear/editar proveedor offline | Datos visibles localmente y persistidos tras reinicio |
| Una variante con dos proveedores | Ambos conservan precios y fechas independientes |
| Dos variantes del mismo producto | Cada una conserva su propia lista |
| Proveedor repetido en la variante | Rechazo sin evento ni escritura parcial |
| Precio inválido o proveedor inexistente | Error antes de persistir el cambio |
| Precio cero / vacío | Cero es explícito; vacío no se convierte a cero |
| Cambiar receta, nombre, precio de venta o costo estándar | Relaciones de proveedores intactas |
| Retirar el último proveedor | Lista vacía guardada sin borrar el proveedor del catálogo |
| Cancelar selector o artículo | Borrador descartado y relaciones persistidas intactas |
| Capturar precio de proveedor | No cambia ventas, costo estándar, stock ni movimientos |
| Replay del mismo evento | Sin duplicados ni cambios adicionales de versión |
| Respaldo/restauración compatible | Proveedores y precios conservados |
| Standalone | `not_required`, sin filas event_refs y sin llamadas remotas |
| Sync: proveedor creado offline y después utilizado | Orden de dependencias correcto |
| Sync: edición concurrente del precio | Conflicto explícito, reversión consistente y sin último ganador por reloj |
| Sync: edición desde cliente antiguo | Rechazo/preservación definida; nunca borrado silencioso de precios |

## Cómo continuar en otra sesión

Leer primero [[08 - Roadmap/Proveedores de productos/Estado y continuidad|Estado y continuidad]]
y este plan. Releer los `AGENTS.md` aplicables y las guías
offline-first de Flutter. Revisar el estado real del código antes de dar una
fase por hecha; preservar cambios ajenos.

Prompt para las sesiones locales:

```text
Implementa la sesión N del plan de Proveedores de productos, revisión 1.
Lee Plan de implementacion.md y Estado y continuidad.md en
08 - Roadmap/Proveedores de productos del análisis POS.
Continúa solo el alcance de esa sesión, respeta los AGENTS.md y conserva
los cambios preexistentes. Ejecuta sus verificaciones y actualiza Estado
y continuidad con archivos, resultados, decisiones y siguiente paso.
```

Para las sesiones 6–7, incluir explícitamente en la solicitud que se desea
implementar servidor/sincronización. Si una fase queda incompleta, registrar su
avance sin declararla cerrada. No reconstruir el plan ni repetir fases verificadas.

## Enlaces

- [[04 - Sincronizacion/Patron para nuevas funcionalidades offline first|Patrón offline-first]]
- [[02 - Decisiones/ADR-0013 Costo estandar opcional por variante|Costo estándar]]
- [[05 - Datos/Catalogo e inventario|Catálogo e inventario]]
- [[08 - Roadmap/Proveedores de productos/Estado y continuidad|Estado y continuidad]]
