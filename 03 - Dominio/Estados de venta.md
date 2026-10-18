---
tipo: dominio
estado: implementado_parcial
actualizado: 2026-09-21
---

# Estados de venta

## Implementado: caja directa en efectivo

- `borrador`: captura local editable; no consume inventario ni viaja al servidor.
- `confirmada`: cobrada íntegramente en efectivo, con pago y consumo atómicos. No admite
  agregar líneas ni confirmar otra vez. Se conserva para consulta.
- Limpiar un borrador conserva su evento local y elimina la captura. No cancela cobros.

La entrega es independiente: `pending`, `delivered`, `conflict`, `rejected` o
`not_required`. Un cobro con incidencia sigue siendo `confirmada`; no se oculta ni
se revierte automáticamente. La UI muestra su estado de entrega por separado.

Evento implementado: `venta_confirmada`. Ver
[[04 - Sincronizacion/Confirmacion de ventas en efectivo|Confirmación en efectivo]].

## Crédito de clientes implementado

`confirmada` también incluye ventas íntegramente a crédito: cliente obligatorio,
sin pago de efectivo y con deuda en `credit_sales`. El consumo de inventario se
confirma en la misma transacción. Los abonos viven en `customer_payments`; FIFO
se proyecta en `credit_allocations`. La deuda puede estar pendiente, parcialmente
liquidada o liquidada sin cambiar `sales.status`.

Ver [[03 - Dominio/Modulos/Creditos de clientes|Créditos de clientes]].

## Fuera de alcance

Los anteriores estados propuestos `parcialmente_pagada`, `cerrada`, `cancelada` y
los eventos de reembolso/cancelación no están implementados. Tampoco hay comandas ni
pagos mixtos en caja. Los abonos parciales a créditos sí están implementados.
Una futura devolución monetaria no implicará devolver inventario: cualquier compensación deberá referenciar pago, línea y movimiento.
