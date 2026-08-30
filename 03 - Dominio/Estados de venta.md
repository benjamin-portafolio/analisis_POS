---
tipo: dominio
estado: borrador
actualizado: 2026-06-09
---

# Estados de venta

## Estados propuestos

| Estado | Descripcion | Permite agregar items | Permite pago | Permite cancelar |
|---|---|---:|---:|---:|
| abierta | Venta en captura | si | si | si |
| parcialmente_pagada | Tiene pagos pero no cubre total | si | si | si, con regla |
| pagada | Pagos cubren total | no | no | si, con devolucion |
| cerrada | Venta finalizada | no | no | no, requiere anulacion |
| cancelada | Venta anulada | no | no | no |
| en_conflicto | Requiere revision | no | no | segun caso |

## Reglas iniciales

- Una venta cerrada no debe aceptar nuevos productos.
- Una venta cancelada no debe aceptar pagos.
- Cancelar una venta con pagos requiere evento de devolucion o anulacion de pago.
- El servidor puede rechazar eventos que contradigan el estado actual.

## Eventos relacionados

- `venta_creada`
- `producto_agregado`
- `producto_cancelado`
- `pago_registrado`
- `pago_cancelado`
- `venta_cerrada`
- `venta_cancelada`

