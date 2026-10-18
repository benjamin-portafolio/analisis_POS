---
tipo: api
estado: borrador
actualizado: 2026-10-04
---

# Validaciones servidor

Estas validaciones aplican al modo `server_sync`. En modo `standalone`, las reglas equivalentes son locales y no existe aceptacion/rechazo por servidor hasta una posible migracion/importacion futura.

## Validaciones generales

- `event_id` no debe existir previamente para procesarlo como nuevo. Si ya existe, responder segun el estado original del evento.
- `device_id` debe estar registrado y activo.
- `user_id` debe existir y tener permiso.
- `event_type` debe ser conocido.
- `payload` debe cumplir esquema del evento.
- `local_sequence` no debe romper reglas basicas por dispositivo.
- Si el evento modifica una entidad mutable, validar `base_version` o `base_server_sequence`.
- Si el evento actualiza columnas, validar `payload.changed_fields`.
- Si el evento queda en `conflict`, persistirlo en `events`, generar `event_refs`, crear o reutilizar `sync_conflicts` y agregar participantes.
- Si dos eventos concurrentes pasan la prevalidacion pero chocan en una restriccion unica de la base, capturar el error de unicidad y convertirlo en respuesta `conflict`, no en error 500.

## Validaciones por venta

- La venta debe existir para eventos posteriores a `venta_creada`.
- La linea debe usar la configuracion comun del producto conocida al crearla.
- `unit` exige `quantity > 0` y campos medidos nulos; `measured` exige
  `measured_quantity_atomic > 0`, snapshot de unidad y cantidad de referencia,
  y `quantity = null`.
- En `measured`, unidad, referencia y cantidad vendida deben compartir la misma
  dimension atomica. La cantidad decimal de UI no forma parte del payload.
- El total debe coincidir con `round_half_up(unit_price_minor *
  measured_quantity_atomic / price_reference_quantity_atomic_snapshot)`. La
  validacion usa precision ampliada y rechaza overflow.
- Modo, codigo, simbolo, factor atomico, unidad y cantidad de referencia se
  capturan como snapshots y no se recalculan desde el producto despues de
  confirmar la linea.
- La linea captura `standard_cost_minor_snapshot` con el costo conocido al
  agregarla, incluido `null`. El servidor valida su forma y conserva el snapshot
  de una venta offline; no lo reemplaza por el costo central vigente al
  sincronizar.
- Si el snapshot existe, el costo estandar total debe coincidir con
  `standard_cost_minor_snapshot * quantity` en `unit` o con
  `round_half_up(standard_cost_minor_snapshot * measured_quantity_atomic /
  price_reference_quantity_atomic_snapshot)` en `measured`.
- `standard_cost_minor_snapshot` nunca modifica el total cobrado; un snapshot
  nulo deja desconocidos el costo y margen de referencia de la linea.
- No aceptar items si la venta esta `cancelada` o `cerrada`.
- No aceptar pago si la venta esta `cancelada`.
- No cerrar venta si el total no esta cubierto, salvo politica definida.

## Validaciones por inventario

> Receptor de seguimiento implementado, revalidado el 2026-10-04 en PG aislado:
> 44 pruebas de migraciones/memoria/venta tardía/producto aprobadas. La verificación
> integrada está bloqueada por core Flutter/interfaz; no se probó una instancia HTTP.
> Evidencia: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-prerrequisitos-fase5/Resultados|Auditoría de entrada a fase 5, 2026-10-04]]. Decisión vigente:
> [[02 - Decisiones/ADR-0017 Reutilizacion y descarte seguro de recursos de inventario|ADR-0017]]
> y [[08 - Roadmap/Seguimiento de existencias/Contrato funcional y de eventos|contrato de seguimiento]].
> Al desvincular se preservan recurso/balance y se deriva memoria durable para
> recuperación. No hay descarte físico automático server_sync, aunque no haya
> movimientos oficiales; una venta histórica puede llegar de otra terminal.
> El servidor conserva procedencia opcional al canonicalizar y rechaza
> `recurso_inventario_descartado` sin alterar proyecciones. Validar nuevamente
> existencia, actividad, unidad y unicidad al recuperar un recurso.

- El servidor administra `inventory_items`, saldos y movimientos como un
  agregado independiente.
- `producto_creado` admite `product_variants.inventory_item_id` nullable. Cada
  valor debe ser UUID v4, existir, estar activo y aparecer exactamente una vez
  como dependencia `inventory_item`.
- Un `inventory_item_id` no puede repetirse entre variantes. La restricción
  única y la validación del handler convierten una carrera remota en
  `variant_inventory_item_conflict`, no en error 500.
- Si `depends_on_event_id` existe, debe identificar un evento
  `recurso_inventario_creado` aceptado para el mismo recurso. El payload
  canónico conserva `ref_type/ref_id` y elimina el ID causal local.
- Venta `unit` exige recurso con dimensión `count` y factor atómico `1`;
  `measured` exige que recurso y unidad de venta compartan dimensión.
- Activar seguimiento en el alta crea primero `inventory_item` y
  `inventory_balance`; una existencia inicial positiva agrega un movimiento
  `initial_balance` con motivo opcional. Recurso, saldo, movimiento y vínculo se
  aplican atómicamente en el dispositivo; el servidor procesa los eventos en
  orden causal.
- `recurso_inventario_actualizado` solo admite `name`, exige `base_event_id`,
  `base_version` y una base oficial coherente. Nunca admite
  `default_unit_id`; la unidad es inmutable desde dispositivo y servidor.
- `movimiento_inventario_registrado` exige `movement_id` idempotente,
  `base_event_id`, `base_version`, delta entero seguro distinto de cero y una
  combinación válida de tipo, signo, motivo y reversión. El servidor bloquea
  recurso y balance, inserta el movimiento y actualiza ambos dentro de la
  misma transacción.
- `initial_balance` y `stock_receipt` exigen delta positivo y permiten
  `reason = null`. `manual_adjustment` admite ambos signos y exige un motivo
  normalizado con NFKC + `trim` de 1 a 500 caracteres. Una cadena vacía se
  rechaza; no representa ausencia.
- `reversal` exige `reversal_of_movement_id` de otro movimiento del mismo
  recurso. Los demás tipos exigen esa referencia nula. Se conservan la FK
  autorreferenciada `RESTRICT` y la prohibición de autorreferencia.
- El saldo resultante debe permanecer dentro del rango entero seguro común.
  Movimiento, `quantity_on_hand_atomic` y `quantity_available_atomic` avanzan
  atómicamente; recurso y balance incrementan versión y actualizan
  `last_event_id`/`last_server_sequence`.
- `movement_id` repetido por otro evento produce conflicto funcional. Un
  `event_id` repetido devuelve duplicado sin insertar ni sumar otra vez.
- Los eventos históricos `recurso_inventario_creado` con existencia inicial
  `manual_adjustment` continúan siendo válidos y conservan su payload; las
  altas nuevas deben emitir `initial_balance`.
- La existencia ordinaria se lee de `inventory_balances`. La suma completa de
  `inventory_movements` se reserva para auditoría o reconstrucción.
- Desactivar un producto o una variante no desactiva ni elimina recursos de
  inventario.
- Toda linea confirmada conserva su `sale_item` y `variant_id` aunque no genere
  inventario. `inventory_movements` solo se crea para variaciones fisicas de
  `inventory_items`.
- `inventory_movements.total_cost_minor` es el costo real del movimiento y no
  se infiere ni actualiza automaticamente desde el costo estandar de catalogo.
  En este alcance debe permanecer `null`.
- No existen columnas ni payloads de cantidad anterior o posterior. La
  existencia actual se consulta exclusivamente desde `inventory_balances`.
- Si la politica bloquea stock negativo, validar existencias oficiales.
- El código actual admite recetas y consumo por confirmación de ventas según
  [[04 - Sincronizacion/Confirmacion de ventas en efectivo|contrato vigente]].
  La configuración histórica determina el consumo de una venta tardía, no el
  vínculo actual ni la memoria de recuperación.

## Validaciones por unidades y cantidades

- `units.dimension` solo admite `count`, `mass` o `volume` en el alcance
  inicial.
- `atomic_factor` debe ser entero positivo y una potencia de diez admitida; no
  se acepta `conversion_to_base` decimal.
- `max_fraction_digits` debe ser compatible con `atomic_factor` y estar entre
  cero y seis. Pieza, gramo y mililitro usan cero; kilogramo y litro usan tres.
- Codigo, dimension, factor y precision de una unidad que ya tiene referencias
  son inmutables. Nombre, simbolo o `active` no reinterpretan cantidades.
- Una unidad inactiva se rechaza para configuraciones o capturas nuevas, pero
  sigue siendo valida al reproducir eventos y snapshots historicos.
- `inventory_items.default_unit_id` debe existir y estar activo al crear el
  recurso. Una captura alternativa solo puede usar otra unidad activa de la
  misma dimension.
- La unidad predeterminada de un recurso no puede cambiarse mediante edición
  ordinaria, aunque otra unidad pertenezca a la misma dimensión. El historial
  y el saldo continúan interpretándose con la unidad estable del recurso.
- Payloads de venta, entrada, ajuste y movimiento transportan enteros
  atomicos seguros. Se rechazan numeros fraccionarios JSON, notacion cientifica,
  cero, negativos fuera de movimientos con signo y valores fuera de rango.
- Los calculos intermedios de multiplicacion y division usan `bigint` o un
  equivalente exacto; el resultado persistido debe caber en el rango comun.

## Validaciones por catalogo

- `categoria_creada` debe incluir `name` no vacio despues de `trim` y un
  `color_key` de la paleta controlada.
- `sort_order` de categoria es obligatorio y debe ser un entero mayor o igual
  que cero. El servidor asigna al crear la siguiente posicion oficial.
- Los nombres de categoria no son unicos y no generan conflicto entre si.
- `categoria_actualizada` debe incluir `base_event_id`, al menos uno de
  `base_version` o `base_server_sequence`, y declarar en `changed_fields`
  exclusivamente `name`, `color_key` o ambos.
- Cada campo declarado por `categoria_actualizada` debe incluir sus valores
  `from` y `to`; no se aceptan cambios que conserven el mismo valor.
- `categoria_movida` debe declarar exclusivamente `sort_order`, identificar la
  categoria desplazada, incluir las bases de ambas categorias e intercambiar
  dos posiciones consecutivas.
- El servidor serializa creaciones y movimientos de categoria. Un movimiento
  solo se acepta cuando los dos valores `from` coinciden con la proyeccion
  oficial; de lo contrario se registra conflicto.
- SKU y codigo de barras no deben duplicarse dentro del catalogo actual.
- Si `category_id` no es nulo, la categoria relacionada debe existir. En el
  alcance actual no existe estado activo/inactivo para categorias.
- Un producto activo debe conservar al menos una variante activa.
- El precio de venta de cada variante debe ser mayor que cero.
- El costo estandar de cada variante admite `null` o un entero mayor o igual
  que cero. `null` significa desconocido y cero, costo conocido igual a cero.
- `sale_mode` solo admite `unit` o `measured` y usa `unit` por defecto.
- `unit` exige `sale_unit_id = null` y
  `price_reference_quantity_atomic = null`; `measured` exige una unidad activa
  y cantidad de referencia positiva.
- En `measured`, `sale_unit_id` determina la unidad de captura y la referencia
  esta expresada en atomos de su dimension. Por ejemplo, kilogramo con factor
  `1000` y referencia `1000` representa precio y costo estandar por un
  kilogramo.
- Las tres columnas de configuracion de venta pertenecen al producto y cambian
  como un solo campo logico. El servidor bloquea el cambio si encuentra una
  linea abierta o provisional de cualquiera de sus variantes.
- Ninguna variante puede sobrescribir modo, unidad o cantidad de referencia.
- El precio es el unico dato de negocio incondicional que el usuario captura
  para una variante; el costo estandar es opcional. La configuracion de venta
  se captura una vez en el producto y orden, estado,
  habilitacion, version y trazabilidad siguen siendo valores estructurales
  obligatorios del sistema.
- `sort_order` debe ser unico y consecutivo dentro de cada producto contando
  variantes activas e inactivas.
- No borrar fisicamente productos ni variantes; usar desactivacion o
  reactivacion.
- `producto_actualizado` se valida y aplica como change-set atomico; no se
  aceptan parcialmente producto o variantes.
- Cambios mutables deben revisarse contra la version oficial actual.
- Si hubo cambios posteriores sobre el mismo registro, solo marcar conflicto automatico cuando coincida al menos una columna modificada.
- Si los cambios posteriores tocaron columnas distintas, fusionar y aceptar si no viola otra regla de negocio.

## Validaciones por caja

- La caja debe existir o el evento debe abrirla.
- No aceptar movimientos normales sobre caja oficialmente cerrada.
- Los cortes offline son preliminares hasta reconciliacion.

## Validaciones por usuarios y permisos

- El usuario que genero el evento debe haber tenido permiso en la base conocida.
- Si el permiso fue revocado antes de la sincronizacion, decidir entre rechazo o revision segun criticidad.
- Cambios de roles/permisos concurrentes deben ser conservadores y pueden marcar conflicto.

## Validaciones por configuracion

- Cambios globales deben incluir version conocida.
- Cambios de impuestos, moneda, folios o metodos de pago pueden requerir revision.
- Si una operacion depende de servicio externo, marcar como pendiente de confirmacion externa o rechazar segun regla.

## Respuestas posibles

| Estado | Significado |
|---|---|
| `accepted` | Evento aceptado y aplicado |
| `duplicate` | Evento ya recibido; debe incluir o preservar el estado efectivo original |
| `rejected` | Evento invalido |
| `conflict` | Evento requiere resolucion |

## Respuesta para duplicados

El servidor debe ser idempotente, pero `duplicate` no debe significar automaticamente que el evento esta sincronizado. Si el evento original quedo como `conflict` o `rejected`, el reintento debe informar ese estado para que el dispositivo no marque el evento como `synced`.

```text
event_id existente + sync_status = synced   -> duplicate / synced efectivo
event_id existente + sync_status = conflict -> conflict o duplicate con original_sync_status = conflict
event_id existente + sync_status = rejected -> rejected o duplicate con original_sync_status = rejected
```

## Registro de conflictos

Al marcar un evento como `conflict`, el servidor debe:

1. Guardar el evento en `events` con `sync_status = conflict` y `rejection_reason`.
2. Guardar sus `event_refs`, incluyendo referencias de unicidad, campo o regla global.
3. Identificar el ganador por defecto, normalmente el evento `synced` que ya aplico el estado oficial.
4. Buscar un `sync_conflicts` abierto para la causa normalizada.
5. Crear el caso si no existe.
6. Insertar participantes en `sync_conflict_participants`.
7. Responder `conflict_id`, `default_winner_event_id` y `reason`.

## Especificaciones modulares relacionadas

- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[03 - Dominio/Modulos/Categorias|Modulo Categorias]]

## Estado actualizado del seguimiento — corrección de fase 3, 2026-10-04

La auditoría inicial fallida se conserva como historial. El core Flutter ahora
mantiene memoria por eventos, recupera el mismo recurso con historial, descarta
solo standalone elegible con rollback/replay comprobados y restaura memoria exacta.
Server_sync conserva recurso/balance; transporte HTTP/PG/SQLite y pull a cliente
vacío están verificados en su alcance. UI de fase 4 y cierre de fase 5 pendientes;
no se acredita uso físico ni despliegue. Evidencia y comandos: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].
