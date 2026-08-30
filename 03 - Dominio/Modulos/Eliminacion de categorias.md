---
tipo: especificacion_funcionalidad
modulo: categorias
estado: segunda_entrega_implementada
actualizado: 2026-08-13
---

# Eliminacion de categorias

Esta nota especifica el flujo aprobado para eliminar categorias. La primera y
segunda entrega estan implementadas en Flutter y NestJS. Solo el comportamiento
futuro `Eliminar todos`, dependiente de Ventas, permanece pendiente.

## Decisiones confirmadas

1. El flujo se abre exclusivamente desde el icono de papelera; tocar el resto
   de la tarjeta continua abriendo la edicion.
2. Una categoria sin articulos vinculados puede recibir hard delete.
3. Cuando existan articulos, la interfaz muestra su cantidad total antes de
   ofrecer una resolucion.
4. Los articulos pueden moverse en conjunto a otra categoria antes de eliminar
   la categoria origen.
5. Los articulos pueden quedar `Sin categoria` antes de eliminar la categoria
   origen.
6. `Eliminar todos` formara parte del comportamiento futuro: cada articulo sin
   ventas recibira hard delete y cada articulo relacionado con una o mas ventas
   recibira soft delete. La accion no se implementara ni se mostrara como
   utilizable hasta especificar Ventas.
7. Resolver articulos, eliminar la categoria, compactar el orden, guardar el
   evento y actualizar las proyecciones constituye una operacion atomica.
8. La interfaz muestra confirmacion de exito o un error recuperable.
9. La funcionalidad debe conservar paridad entre `standalone` y `server_sync`.
10. Si una eliminacion iniciada offline encuentra estado oficial nuevo, no se
    aplica una resolucion predeterminada: el evento entra en conflicto y la app
    restaura la categoria.
11. La implementacion se divide en dos entregas actuales y una entrega futura
    dependiente de Ventas.

## Objetivo

Permitir que una categoria deje de ocupar una fila en las proyecciones
operativas cuando ya no conserva referencias desde articulos, sin borrar el
historial de eventos y sin tomar decisiones destructivas sobre datos que el
usuario no vio al confirmar.

## Terminologia

- **Articulo:** agregado `product`. Sus variantes no incrementan la cantidad de
  articulos.
- **Articulo vinculado:** cualquier producto cuyo `category_id` coincida con la
  categoria, con independencia de su valor `active`.
- **Hard delete:** eliminacion fisica de una proyeccion operativa en SQLite o
  PostgreSQL.
- **Soft delete:** conservacion de una proyeccion con `active = false`.
- **Historial:** filas de eventos, referencias de sincronizacion y datos de
  conflictos que deban conservarse conforme a su propia politica de retencion.
- **Sin categoria:** `products.category_id = null`; no existe una categoria
  ficticia para representar esta opcion.

El hard delete libera la fila operativa, no necesariamente el espacio fisico
del archivo de base de datos de inmediato. SQLite puede reutilizar ese espacio
y PostgreSQL lo administra mediante sus procesos de vacuum. Esta funcionalidad
no ejecuta `VACUUM` ni define una politica de purga de eventos.

## Reglas de negocio

### Categorias

- Una categoria solo puede recibir hard delete cuando, al terminar la misma
  transaccion, ningun producto conserva su `category_id`.
- Una categoria vacia puede eliminarse directamente despues de confirmar.
- Una categoria con articulos solo puede eliminarse despues de moverlos,
  dejarlos sin categoria o, en el futuro, eliminarlos conforme a su propio
  ciclo de vida.
- El hard delete de la categoria no borra sus eventos ni los eventos historicos
  que la hayan referenciado.
- La eliminacion compacta `sort_order` para conservar la secuencia `0..n-1`.
- `active` no se convierte en un ciclo funcional de desactivacion/reactivacion
  de categorias.

### Articulos

- Mover o dejar sin categoria no modifica `active`, variantes, precio ni
  configuracion de inventario del articulo.
- La futura accion `Eliminar todos` aplicara hard delete a un articulo que no
  este relacionado con ninguna venta.
- La futura accion `Eliminar todos` aplicara soft delete a un articulo que este
  relacionado con una o mas ventas.
- Hasta que Ventas permita determinar esa relacion, `Eliminar todos` queda
  fuera de la interfaz y de los contratos ejecutables.
- La definicion exacta de que estados de venta constituyen historia se decidira
  en la especificacion de Ventas.

## Conteo de articulos vinculados

La consulta usa `products.category_id` y debe:

- Contar productos, no variantes.
- Incluir productos activos e inactivos.
- Ejecutarse al pulsar la papelera.
- Volver a validarse dentro de la operacion de eliminacion.
- No confiar en el numero mostrado como unica precondicion; para las entregas
  que afecten productos, el evento conserva tambien el conjunto exacto que el
  usuario confirmo.

Si la consulta falla, no se abre una ruta destructiva y se muestra:

> No se pudo comprobar si la categoría tiene artículos vinculados.

## Interaccion comun

- El icono de papelera tiene callback, clave de prueba, tooltip y semantica
  propios.
- El resto de la tarjeta conserva la accion de editar.
- Mientras se consulta o ejecuta la eliminacion se impiden envios duplicados.
- `Cancelar`, back y cierre explicito no modifican datos.
- Los dialogos destructivos no confirman al tocar fuera de ellos.

Resultado exitoso:

> Categoría eliminada.

Resultado fallido:

> No se pudo eliminar la categoría. Inténtalo nuevamente.

## Primera entrega: categoria vacia

### Alcance funcional

La primera entrega:

- Activa la papelera.
- Consulta la cantidad total vinculada.
- Permite hard delete solo cuando la cantidad es cero.
- Compacta el orden.
- Implementa `categoria_eliminada` en Flutter y NestJS.
- Implementa aplicacion local, push, pull, preflight, conflictos, restauracion e
  idempotencia.
- Cubre `standalone` y `server_sync`.

Cuando la cantidad sea cero se muestra:

**Titulo**

> Eliminar categoría

**Mensaje**

> ¿Quieres eliminar la categoría "Test"? Esta acción no se puede deshacer.

**Acciones**

- `Cancelar`
- `Eliminar`

Cuando la cantidad sea mayor que cero, la primera entrega muestra el total y
bloquea la eliminacion:

> La categoría "Test" tiene 12 artículos vinculados. Esta categoría no puede
> eliminarse hasta resolver sus artículos vinculados.

La unica accion disponible en este estado es `Cerrar`. No se muestran
placeholders para acciones de entregas posteriores.

### Flujo de aplicacion

```text
papelera
-> consultar todos los productos vinculados
-> categoria vacia: confirmacion directa
-> categoria vinculada: elegir move o uncategorize y confirmar
-> EliminarCategoriaCommand
-> CategoriaCommandService
-> CategoriaEliminadaPayload
-> SyncEvent categoria_eliminada
-> LocalEventStore.appendAndApply(event, refs)
-> CategoriaEventHandler idempotente
-> validar nuevamente origen, destino, conjunto exacto de productos y orden
-> actualizar category_id y metadata de productos cuando corresponda
-> hard delete de categories
-> compactar sort_order
-> repository notifica a presentation
```

Evento, borrado y compactacion se realizan en una unica transaccion local.

## Segunda entrega: resolver articulos

Esta entrega esta implementada de extremo a extremo en Flutter y NestJS.

Cuando existan articulos se muestra:

> La categoría "Test" tiene 12 artículos vinculados. Antes de eliminarla, elige
> qué hacer con sus artículos.

Acciones:

- `Mover a otra categoria`
- `Dejar sin categoria`
- `Cancelar`

### Mover a otra categoria

- El selector muestra una sola eleccion.
- Solo incluye categorias activas disponibles.
- Excluye la categoria origen.
- No permite confirmar sin destino.
- Si no hay destinos, informa esa condicion y mantiene disponible `Dejar sin
  categoria`.

Confirmacion:

> Se moverán 12 artículos de "Test" a "Bebidas" y se eliminará la categoría
> "Test".

Acciones:

- `Cancelar`
- `Mover y eliminar`

La transaccion asigna el ID destino a todos los productos confirmados, elimina
la categoria origen y compacta el orden.

### Dejar sin categoria

Confirmacion:

> Los 12 artículos vinculados quedarán sin categoría y se eliminará la
> categoría "Test".

Acciones:

- `Cancelar`
- `Dejar sin categoria y eliminar`

La transaccion asigna `category_id = null` a todos los productos confirmados,
elimina la categoria y compacta el orden.

## Entrega futura: eliminar todos

Esta accion se documenta, pero no se implementa antes de Ventas.

Cuando exista la fuente de verdad necesaria:

1. Se calcula que articulos tienen relaciones con ventas.
2. Cada articulo sin ventas recibe hard delete junto con sus datos
   subordinados.
3. Cada articulo con una o mas ventas recibe soft delete.
4. Se elimina fisicamente la categoria despues de resolver todos los articulos.
5. La operacion completa es atomica.

La confirmacion desglosa ambos resultados, por ejemplo:

> Se eliminarán definitivamente 8 artículos y se desactivarán 4 porque tienen
> ventas relacionadas. Después se eliminará la categoría "Test".

## Contrato de `categoria_eliminada`

Constantes:

```text
aggregate_type = category
event_type = categoria_eliminada
```

El envelope usa la base de la categoria eliminada:

- `aggregate_id`: ID de la categoria.
- `base_version`: version observada al confirmar.
- `base_server_sequence`: ultima secuencia oficial conocida, nulable si la base
  aun es local.

Payload canonico para `none`:

```json
{
  "base_event_id": "event_category_base",
  "deleted_category": {
    "name": "Test",
    "color_key": "amber",
    "sort_order": 2,
    "active": true,
    "created_event_id": "event_category_created"
  },
  "product_resolution": {
    "type": "none"
  },
  "linked_products": [],
  "shifted_categories": [
    {
      "category_id": "category_after",
      "base_event_id": "event_after_base",
      "base_version": 3,
      "base_server_sequence": 21,
      "sort_order": {
        "from": 3,
        "to": 2
      }
    }
  ]
}
```

Para `move`, `product_resolution` declara la categoria destino y cada producto
confirma su base y el cambio de categoria:

```json
{
  "product_resolution": {
    "type": "move",
    "destination_category": {
      "category_id": "category_destination",
      "base_event_id": "event_destination_base",
      "base_version": 4,
      "base_server_sequence": 30
    }
  },
  "linked_products": [
    {
      "product_id": "product_1",
      "base_event_id": "event_product_1_base",
      "base_version": 2,
      "base_server_sequence": 25,
      "category_id": {
        "from": "category_source",
        "to": "category_destination"
      }
    }
  ]
}
```

Para `uncategorize`, la resolucion no incluye `destination_category` y cada
producto usa `category_id.to = null`. En los tres casos el payload completo
conserva tambien `base_event_id`, `deleted_category` y `shifted_categories`.

Reglas vigentes:

- `base_event_id`, `created_event_id` e IDs deben ser no vacios y validos para
  el contrato comun.
- `name`, `color_key`, `active` y `sort_order` deben representar exactamente la
  proyeccion observada.
- `product_resolution.type` admite exactamente `none`, `move` y
  `uncategorize`; `delete` se rechaza.
- `linked_products` es obligatorio, no repite IDs y se ordena canonicamente por
  `product_id`.
- Cada producto declara evento, version y secuencia base, y siempre usa la
  categoria eliminada en `category_id.from`.
- `none` exige `linked_products` vacio y ausencia de destino.
- `move` exige un destino activo diferente del origen, su base exacta y el
  mismo ID en todos los valores `category_id.to`.
- `uncategorize` prohibe el destino y exige `category_id.to = null`.
- `shifted_categories` contiene exactamente todas las categorias posteriores,
  ordenadas por su posicion original.
- Cada cambio de orden es `to = from - 1`.
- No se repiten IDs, posiciones ni referencias.
- Campos conocidos con tipos invalidos se rechazan; campos adicionales
  desconocidos pueden ignorarse conforme al contrato comun de payloads.

El tipo futuro `delete` no forma parte del contrato ejecutable.

La instantanea permite restaurar la proyeccion optimista si la eliminacion
entra en conflicto. El evento no se convierte en sustituto permanente de una
tabla de categorias eliminadas.

## Referencias

Todas las resoluciones declaran:

```text
category <deleted_category_id> affects
category <each_shifted_category_id> affects
```

Cuando hay productos o destino se agregan:

```text
product <each_linked_product_id> affects
category <destination_category_id> uses
```

Los command services construyen y validan las referencias en ambos modos.

| Modo | Evento | `event_refs` locales | Procesos remotos |
|---|---|---|---|
| `standalone` | Aplicado y `delivery_status = not_required` | No se persisten | No se ejecutan |
| `server_sync` | Aplicado y `delivery_status = pending` | `source = local_pending` | Preflight, push, pull y conflictos |

`categoria_eliminada` siempre requiere preflight en `server_sync`, aunque todas
sus referencias usen `affects`.

## Aplicacion e idempotencia

### Aplicacion local

Antes del hard delete, el handler valida:

- Existencia e identidad de la categoria.
- Base, version y valores de la instantanea.
- Coincidencia exacta entre los productos vinculados actuales y
  `linked_products`, incluyendo activos e inactivos.
- Base y `category_id` actual de cada producto confirmado.
- Existencia, estado activo y base de la categoria destino para `move`.
- Integridad de la lista de categorias desplazadas.
- Consecutividad del orden antes y despues del cambio.

Reaplicar el mismo evento:

- No vuelve a compactar el orden.
- No vuelve a mover o desvincular productos ni incrementa su version.
- No falla solo porque la categoria ya fue eliminada por ese evento.
- No borra una categoria nueva que reutilice indebidamente el mismo ID.
- En el eco del servidor solo reconoce la entrega y completa la metadata que
  corresponda en eventos y referencias; no necesita recrear la fila eliminada.

### Aplicacion remota

Un evento oficial debe aplicarse de forma segura aun cuando el dispositivo
tenga comandos locales pendientes relacionados:

- Si una eliminacion local pendiente oculto fisicamente la categoria y llega
  un evento oficial que la necesita, la app restaura primero la instantanea,
  los productos y el orden que aun pertenezcan a la mutacion local, aplica el
  estado oficial y despues marca la eliminacion local como conflicto.
- Si un evento oficial afecta el destino o un producto confirmado, la
  eliminacion pendiente se restaura y entra en conflicto antes de aplicar el
  evento oficial.
- Si llega una eliminacion oficial y existe un `producto_creado` local pendiente
  que usa la categoria, ese producto pendiente entra en conflicto y su
  proyeccion optimista se retira antes de completar el hard delete local.
- Una pagina de pull o preflight no puede quedar aplicada parcialmente ni
  avanzar su cursor si esta preparacion falla.

La implementacion puede resolver estas condiciones mediante un coordinador de
aplicacion remota o una restauracion previa equivalente, pero no debe omitirlas
ni convertirlas en actualizaciones silenciosas de productos.

## Validacion y autoridad del servidor

NestJS aplica `categoria_eliminada` dentro de la misma transaccion que guarda
el evento oficial y sus referencias. Bajo el bloqueo global de orden de
categorias debe:

1. Bloquear el orden global, origen, destino, categorias desplazadas y
   productos confirmados.
2. Comprobar la base, version, secuencia e instantanea del origen.
3. Consultar `products` sin filtrar por `active` y comparar el conjunto exacto.
4. Validar la base y categoria actual de cada producto.
5. Validar la categoria destino y su base para `move`.
6. Actualizar productos, incrementando version y trazabilidad una vez.
7. Ejecutar hard delete y compactar el orden.
8. Persistir un payload canonico y todas las referencias oficiales.

La FK de `products.category_id` permanece `RESTRICT`; actua como ultima defensa.
La aplicacion debe resolver o rechazar relaciones explicitamente, nunca
depender de un cascade accidental.

Resultados esperados:

| Situacion | Resultado |
|---|---|
| Payload o tipos invalidos | `rejected` |
| Falta origen, destino, producto o categoria desplazada | conflicto `missing_aggregate` |
| El conjunto vinculado difiere del confirmado | conflicto `category_linked_products_changed` |
| Cambio la categoria o base de un producto | conflicto `concurrent_product_category_update` |
| Cambio el origen, destino, instantanea u orden | conflicto `concurrent_category_delete` |
| Mismo `event_id` ya procesado | duplicado idempotente |
| Todas las precondiciones coinciden | `synced` |

Un cambio oficial posterior a la base que afecte la categoria, alguno de los
productos esperados o el orden involucrado impide tomar una decision
automatica.

## Restauracion de conflictos

Cuando una eliminacion optimista entra en conflicto, Flutter debe:

- Recrear la categoria con la instantanea base si todavia no existe.
- Restaurar `category_id`, version, evento y secuencia base de cada producto que
  todavia pertenezca al evento local conflictivo.
- Restaurar las posiciones anteriores solo cuando sigan perteneciendo al
  evento local conflictivo.
- Preservar cualquier estado oficial mas reciente aplicado durante preflight o
  pull.
- Mantener el evento local con estado `conflict` y su motivo.
- Devolver la categoria a la UI con el estado oficial o base valido.

La restauracion se ejecuta dentro de la misma transaccion de limpieza o
revalidacion de pendientes y debe ser idempotente.

## Atomicidad

La frontera atomica de cada entrega es:

```text
resolver relaciones permitidas
-> eliminar categoria
-> compactar orden
-> guardar evento y referencias del modo
-> actualizar proyecciones
```

Si falla cualquier paso:

- No queda una categoria parcialmente eliminada.
- No queda un cambio parcial de articulos.
- No queda el orden parcialmente compactado.
- No queda un evento separado de sus proyecciones.
- Pull y preflight no avanzan el cursor de una pagina parcialmente aplicada.

## Criterios de aceptacion implementados

| ID | Criterio |
|---|---|
| `CAT-DEL-AC-001` | La papelera abre eliminacion y el resto de la tarjeta abre edicion. |
| `CAT-DEL-AC-002` | El conteo incluye productos activos e inactivos y no cuenta variantes. |
| `CAT-DEL-AC-003` | Una categoria vacia requiere confirmacion antes del hard delete. |
| `CAT-DEL-AC-004` | Una categoria con articulos ofrece moverlos o dejarlos sin categoria; no muestra `Eliminar todos`. |
| `CAT-DEL-AC-005` | Cancelar, back o cerrar no genera evento ni modifica proyecciones. |
| `CAT-DEL-AC-006` | La eliminacion conserva un orden consecutivo desde cero. |
| `CAT-DEL-AC-007` | Productos, evento, referencias, hard delete y orden cambian atomicamente. |
| `CAT-DEL-AC-008` | Reaplicar `categoria_eliminada` no compacta ni borra dos veces. |
| `CAT-DEL-AC-009` | Standalone usa `not_required`, no persiste refs y no inicia procesos remotos. |
| `CAT-DEL-AC-010` | Server sync persiste refs, exige preflight y reconoce el eco sin recrear la categoria. |
| `CAT-DEL-AC-011` | Un producto oficial nuevo produce conflicto y restaura la categoria; no se elimina ni mueve automaticamente. |
| `CAT-DEL-AC-012` | Un cambio oficial de categoria u orden produce conflicto y preserva el estado oficial. |
| `CAT-DEL-AC-013` | El servidor consulta todos los productos y solo elimina cuando el conjunto exacto y sus bases coinciden. |
| `CAT-DEL-AC-014` | Un fallo local, de push o de aplicacion remota no deja cambios parciales. |
| `CAT-DEL-AC-015` | Exito y error muestran los mensajes acordados y bloquean doble envio. |

## Pruebas de las entregas implementadas

### Flutter

- `CategoriaEliminadaPayload.fromJson/toJson`, tipos invalidos y campos
  adicionales.
- Command service con `none`, `move` y `uncategorize`, conjunto exacto, destino,
  productos activos e inactivos, bases invalidas y orden corrupto.
- Handler local, eco, aplicacion remota e idempotencia.
- Restauracion por conflicto sin estado oficial y con estado oficial mas
  reciente.
- Compactacion al eliminar primera, intermedia, ultima y unica categoria.
- Rollback transaccional ante fallo de borrado o cambio de orden.
- Refs y delivery status en ambos modos.
- Preflight obligatorio para `categoria_eliminada`.
- Pull/preflight con producto oficial concurrente.
- Evento oficial de eliminacion frente a un producto local pendiente.
- Widget de tarjeta, opciones, selector por ID, ausencia de destinos,
  confirmaciones, cancelar, singular/plural, exito, error y doble toque.

### NestJS

- Registro y despacho del nuevo tipo.
- Parseo y normalizacion de `none`, `move` y `uncategorize`, incluido el rechazo
  de `delete`.
- Aceptacion de primera, intermedia, ultima y unica categoria vacia.
- Rechazo controlado del payload invalido.
- Aplicacion de productos activos e inactivos y conflictos de conjunto/base.
- Conflicto por base, instantanea u orden concurrente.
- Hard delete, compactacion y referencias dentro de una transaccion.
- Duplicado idempotente.
- Pull devuelve el evento canonico.
- Preflight encuentra eventos oficiales por las referencias declaradas.
- Integracion PostgreSQL real para FK `RESTRICT`, bloqueo y rollback total.

## Verificacion ejecutada

El 2026-08-13 se verifico el estado final:

```text
Flutter: dart analyze sin hallazgos; 206 pruebas aprobadas
NestJS:  54 pruebas unitarias aprobadas; npm run build correcto
PostgreSQL real: 3 pruebas de integracion aprobadas
```

## Entregas

| Entrega | Alcance | Estado |
|---|---|---|
| 1 | Categoria vacia, hard delete, orden, evento, sync y conflictos | Implementada |
| 2 | Mover articulos o dejarlos sin categoria y eliminar | Implementada |
| Futura | Eliminar todos segun relaciones con Ventas | Documentada, bloqueada por Ventas |

## Fuera de alcance actual

- Reactivar categorias eliminadas.
- Una tabla permanente de categorias eliminadas.
- Recuperacion manual desde la UI.
- `Eliminar todos` antes de Ventas.
- Implementar Ventas como parte de este flujo.
- Purga o compactacion del historial de eventos.
- `VACUUM` automatico.
- Resolver conflictos moviendo, desvinculando o eliminando articulos nuevos sin
  confirmacion del usuario.

## Enlaces

- [[03 - Dominio/Modulos/Categorias|Modulo Categorias]]
- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[03 - Dominio/Reglas de negocio|Reglas de negocio]]
- [[04 - Sincronizacion/Patron para nuevas funcionalidades offline first|Patron para nuevas funcionalidades offline first]]
- [[01 - Contexto/Modos de operacion|Modos de operacion]]
