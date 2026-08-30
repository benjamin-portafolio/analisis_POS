---
tipo: dominio
estado: borrador
actualizado: 2026-06-09
---

# Estados de comanda

## Estados de ticket

| Estado | Descripcion |
|---|---|
| creada | Comanda creada localmente |
| enviada | Enviada a cocina/barra |
| en_preparacion | Area de preparacion la acepto |
| lista | Preparacion terminada |
| entregada | Entregada al cliente |
| cancelada | Comanda anulada |
| en_conflicto | Requiere revision |

## Estados por item

| Estado | Descripcion |
|---|---|
| pendiente_envio | Item creado pero no enviado |
| enviado | Item enviado a preparacion |
| preparando | Item en preparacion |
| listo | Item listo |
| entregado | Item entregado |
| cancelado | Item cancelado |

## Pendiente de resolver

Definir si un item ya enviado a cocina puede cancelarse automaticamente o requiere confirmacion de cocina.

