---
tipo: ADR
id: ADR-0013
estado: decidido
fecha: 2026-08-24
actualizado: 2026-08-24
---

# ADR-0013 Costo estandar opcional por variante

## Contexto

Cada variante necesita conservar el precio obligatorio que se cobra al cliente
y puede conocer ademas el costo de referencia de esa presentacion. El segundo
valor sirve para estimar costo y margen comercial, pero no necesariamente
coincide con el desembolso real de una compra, entrada o lote de inventario.

Llamarlo costo inicial volveria ambiguo si el valor puede corregirse o cambiar
con el tiempo. Tambien seria incorrecto usarlo como sustituto de
`inventory_movements.total_cost_minor`, que representa el costo total real de
un movimiento fisico concreto.

## Decision

- `product_variants.sale_price_minor` conserva el precio de venta vigente. Es
  obligatorio, entero en unidad monetaria menor y mayor que cero.
- `product_variants.standard_cost_minor` conserva el costo estandar vigente de
  la variante. Es nulable y entero en unidad monetaria menor.
- `standard_cost_minor = null` significa costo desconocido o no capturado;
  `standard_cost_minor = 0` significa costo conocido igual a cero. Un valor
  negativo es invalido.
- En `sale_mode = unit`, ambos importes corresponden a una unidad vendible. En
  `sale_mode = measured`, ambos corresponden a la misma
  `price_reference_quantity_atomic` definida por el producto.
- Solo `sale_price_minor` participa en el total cobrado al cliente. El costo no
  modifica subtotal, impuestos, descuentos, pagos ni `sale_items.total_minor`.
- Al agregar una linea de venta, `sale_items` captura
  `standard_cost_minor_snapshot` con el valor vigente de la variante, incluido
  `null`. Una edicion posterior del catalogo no reescribe ese snapshot.
- Cuando el snapshot existe, el costo estandar de la linea se deriva con la
  misma base cuantitativa y regla de redondeo que el precio:

```text
unit:
  standard_total_cost_minor = standard_cost_minor_snapshot * quantity

measured:
  standard_total_cost_minor = round_half_up(
    standard_cost_minor_snapshot * measured_quantity_atomic
    / price_reference_quantity_atomic_snapshot
  )
```

- El margen bruto de referencia de la linea solo puede calcularse cuando el
  snapshot no es nulo. No equivale a utilidad contable ni incorpora por si solo
  descuentos, impuestos, mermas, mano de obra u otros gastos.
- `inventory_movements.total_cost_minor` continua representando el costo total
  real de una entrada o movimiento de inventario. No se copia ni reconcilia
  automaticamente con `standard_cost_minor`.
- `standard_cost_minor` viaja en `producto_creado`, puede cambiar mediante
  `producto_actualizado` y tiene su propio path de concurrencia
  `variant:<id>:standard_cost_minor`.
- Al sincronizar una venta offline, el servidor conserva el snapshot capturado
  localmente y no lo sustituye por el costo actual del catalogo central.
- El campo escalar no crea `LocalEventRef` ni filas adicionales en
  `event_refs`. Se mantiene la regla general de referencias para `standalone` y
  `server_sync`.
- Una migracion de datos existentes agrega la columna nulable y deja las filas
  previas en `null`; no inventa costos a partir del precio de venta ni de
  movimientos de inventario.

## Consecuencias

- Cada variante ofrece dos valores monetarios con responsabilidades distintas:
  precio de venta obligatorio y costo estandar opcional.
- La ausencia de costo no impide crear, editar, sincronizar ni vender una
  variante.
- Las ventas historicas pueden reproducir el costo estandar conocido al momento
  de la linea sin consultar el catalogo actual.
- Cambiar el costo estandar no altera ventas, movimientos de inventario ni
  reportes historicos ya materializados.
- Cualquier reporte de rentabilidad debe nombrar el resultado como estimado o
  de referencia mientras no exista una politica contable mas completa.

## Enlaces

- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]]
- [[05 - Datos/Catalogo e inventario|Catalogo e inventario]]
- [[02 - Decisiones/ADR-0004 Inventario por movimientos|Inventario por movimientos]]
