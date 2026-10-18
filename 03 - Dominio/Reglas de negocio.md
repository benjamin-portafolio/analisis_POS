---
tipo: dominio
estado: borrador
actualizado: 2026-10-02
---

# Reglas de negocio

## Regla general offline

- Toda operacion disponible online debe poder capturarse offline como evento o solicitud pendiente, salvo imposibilidad externa real.
- Una operacion capturada offline no equivale necesariamente a aceptacion oficial.
- El servidor conserva la autoridad final para aceptar, rechazar o marcar conflicto.

## Ventas

- Toda venta debe tener `sale_id` generado antes de guardar el primer evento.
- Todo item de venta debe tener `sale_item_id` unico.
- Todas las variantes de un producto comparten `sale_mode`, `sale_unit_id` y
  `price_reference_quantity_atomic` definidos por el producto.
- `sale_mode = unit` usa cantidad entera y no admite unidad ni cantidad de
  referencia. `sale_mode = measured` exige ambas y guarda la cantidad vendida
  como entero atomico.
- En `measured`, la unidad activa es la unidad de captura/presentacion; su
  `atomic_factor` convierte exactamente el texto decimal al atomo de la
  dimension antes de crear el evento.
- El total medido es `round_half_up(unit_price_minor *
  measured_quantity_atomic / price_reference_quantity_atomic)`. Los operandos
  son enteros, el intermedio usa precision ampliada y el redondeo ocurre una
  sola vez sobre el total actual de la linea.
- Toda linea captura snapshots de modo, codigo, simbolo, factor atomico, unidad,
  cantidad de referencia y costo estandar nullable para que una edicion
  posterior no cambie su calculo, presentacion ni margen de referencia.
- El total cobrado usa exclusivamente `unit_price_minor`; el costo estandar no
  modifica subtotal, impuestos, descuentos ni pagos.
- Si `standard_cost_minor_snapshot` existe, el costo estandar de la linea usa
  cantidad y referencia con la misma formula proporcional y redondeo `half-up`
  del precio. Si es nulo, costo y margen de referencia permanecen desconocidos.
- La configuracion comun de venta no puede cambiar mientras exista una linea
  abierta o provisional de cualquiera de las variantes del producto.
- Una venta cancelada no puede aceptar nuevos items ni pagos.
- Una venta cerrada solo puede modificarse mediante anulaciones o devoluciones.

## Pagos

- Todo pago debe tener `payment_id` unico.
- Un pago no debe duplicarse si el mismo evento se procesa mas de una vez.
- La cancelacion de pago debe generar evento propio.

## Inventario

- Las existencias pertenecen a `inventory_items`; productos y variantes no
  guardan saldos propios.
- La configuración de consumo pertenece a la variante: vínculo directo opcional
  o receta, excluyentes. El alta con seguimiento crea recurso/balance y declara
  dependencias de inventario; el saldo nunca se duplica en el catálogo.
- La decisión de recuperación y descarte seguro está especificada en
  [[02 - Decisiones/ADR-0017 Reutilizacion y descarte seguro de recursos de inventario|ADR-0017]],
  pendiente de implementar: guardar sin seguimiento conserva memoria para recuperar
  el recurso, sin nuevo balance ni existencia inicial al reactivarlo.
- Solo standalone permite descartar automáticamente un autogenerado sin movimientos,
  con ambos saldos cero y sin usos/capturas dependientes. Legado desconocido y
  recursos independientes se conservan. En server_sync no se borran recurso ni
  balance al quitar seguimiento, incluso sin movimientos oficiales todavía.
- Desactivar producto/variante no equivale a quitar seguimiento y no dispara ese
  descarte. Recursos conservados siguen activos y disponibles según Inventario.
- Toda linea confirmada conserva un `sale_item` relacionado con su variante,
  sin inferir movimientos fisicos desde el articulo.
- `inventory_movements` solo registra variaciones fisicas; las cantidades
  vendidas y los servicios prestados se consultan desde `sale_items`.
- `inventory_movements.total_cost_minor` representa el costo real de un
  movimiento concreto y no se sustituye ni se actualiza automaticamente desde
  el costo estandar de una variante.
- Entradas, conteos y ajustes de existencia siempre afectan al
  `inventory_item`; nunca escriben un saldo en producto o variante. Toda
  disponibilidad comercial se recalcula desde ese recurso compartido.
- Una reduccion o cancelacion genera movimientos compensatorios que referencian
  los movimientos originales.
- Las cantidades de inventario y venta medida se representan como enteros
  atomicos; las ventas por unidad conservan cantidad entera.
- Una cancelacion compensa exactamente los movimientos enteros originales; no
  repite conversiones ni redondeos.
- `initial_balance` representa únicamente una existencia inicial positiva
  creada con el recurso; `stock_receipt` representa una reposición positiva;
  ambos admiten motivo opcional.
- `manual_adjustment` admite delta positivo o negativo distinto de cero y
  siempre exige motivo. Todo motivo presente se normaliza con NFKC + `trim`,
  mide de 1 a 500 caracteres y la ausencia se representa con `null`.
- `reversal` queda reservado para compensaciones futuras, exige
  `reversal_of_movement_id`, no admite autorreferencia y conserva FK
  autorreferenciada `RESTRICT`. Los demás tipos exigen esa referencia nula.
- La unidad del recurso es inmutable durante la edición. El nombre y un
  movimiento capturados en la misma pantalla generan eventos separados.
- No se crean movimientos de cantidad cero ni snapshots de cantidad anterior
  o posterior. El saldo actual siempre se consulta en `inventory_balances`.
- `total_cost_minor` permanece nullable y en `null` hasta implementar valuación
  real de inventario.

## Catalogo

- En el alcance implementado, `categories` hereda `active`, pero no lo usa para
  filtrar ni expone desactivacion o reactivacion.
- Una categoria puede recibir hard delete cuando, al terminar la misma
  transaccion, ningun producto conserva su `category_id`.
- Antes de eliminar una categoria deben resolverse explicitamente todos sus
  articulos vinculados; la FK permanece `RESTRICT` como ultima defensa.
- El hard delete de una proyeccion de categoria o producto no elimina su
  historial de eventos.
- La categoria del producto es opcional.
- Los nombres de producto no son unicos.
- Todo producto ofrece una o mas variantes.
- El ciclo ordinario de producto y variantes usa desactivacion y reactivacion.
- En la futura accion `Eliminar todos` de una categoria, un producto sin ventas
  podra recibir hard delete y uno relacionado con al menos una venta recibira
  soft delete. Esta regla no se implementara antes de especificar Ventas.
- Un producto activo debe tener al menos una variante activa.
- La ultima variante activa no puede desactivarse mientras el producto siga
  activo.
- Las variantes no tienen prioridad de negocio; el precio resumen del listado
  se deriva del minimo y maximo de las variantes activas.
- El orden manual aplica solo a variantes dentro de su producto y debe ser
  consecutivo desde cero.
- El precio de venta pertenece a la variante y debe ser mayor que cero.
- El costo estandar pertenece a la variante, es opcional y solo admite `null` o
  un entero mayor o igual que cero. `null` significa desconocido y cero, costo
  conocido igual a cero.
- Precio de venta y costo estandar usan unidad monetaria menor. En venta medida
  ambos corresponden a la misma cantidad de referencia del producto.
- Las unidades pertenecen a `count`, `mass` o `volume`. Solo se convierten
  unidades de la misma dimension y nunca se usa `double` o un factor decimal
  en eventos y proyecciones.
- El catalogo inicial usa pieza, gramo, kilogramo, mililitro y litro. Sus
  factores atomicos son enteros; `0.25 kg` se persiste como `250` gramos.
- `inventory_items.default_unit_id` define la unidad predeterminada de captura
  y presentacion, no la representacion persistida de sus saldos.
- Codigo, dimension, factor y precision de una unidad usada son inmutables. La
  desactivacion solo impide nuevas selecciones y conserva historicos.
- `sku` y codigo de barras deben validarse como unicos al sincronizar.
- El nombre visible de una variante no se interpreta como unidad o cantidad de
  consumo.
- Cambios mutables deben incluir `base_version` o `base_server_sequence`.
- Cambios de actualizacion deben declarar columnas modificadas para permitir merge por columna.
- Vender un producto creado offline es posible localmente, pero ambas operaciones quedan sujetas a validacion del servidor.

## Caja

- Los movimientos de caja deben tener ID unico.
- Un corte generado offline es preliminar hasta que el servidor lo acepte.
- No se debe aplicar movimiento a una caja oficialmente cerrada sin resolver conflicto.

## Usuarios y permisos

- Los permisos offline se evaluan con el ultimo snapshot local.
- Un cambio de permisos offline no debe elevar privilegios globales hasta sincronizar.
- Cambios concurrentes de roles deben tratarse como conflicto de seguridad si no pueden fusionarse claramente.

## Sincronizacion

- El servidor debe validar cada evento antes de aceptarlo.
- El servidor debe rechazar eventos duplicados por `event_id`.
- El dispositivo debe poder aplicar eventos recibidos en orden de `server_sequence`.
- El servidor no debe marcar conflicto solo porque dos eventos actualizan el mismo registro; debe comparar columnas modificadas.
- Si dos eventos cambian columnas distintas del mismo registro, deben fusionarse salvo que violen otra regla de negocio.
- Si dos eventos cambian la misma columna del mismo registro, debe marcarse conflicto o revision.
- Los conflictos no deben bloquear la descarga de otros eventos validos.
- Los handlers deben mantener version y trazabilidad de eventos en tablas de lectura.

## Especificaciones modulares relacionadas

- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]]
- [[03 - Dominio/Modulos/Categorias|Modulo Categorias]]
- [[03 - Dominio/Modulos/Eliminacion de categorias|Eliminacion de categorias]]
