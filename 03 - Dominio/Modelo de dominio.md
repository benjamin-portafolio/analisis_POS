---
tipo: dominio
estado: borrador
actualizado: 2026-08-19
---

# Modelo de dominio

## Entidades principales

- `Device`: dispositivo movil o terminal.
- `User`: usuario operativo.
- `Product`: producto vendible.
- `Category`: agrupador de productos.
- `Unit`: unidad registrada de captura/presentacion con dimension y factor
  atomico entero.
- `InventoryItem`: recurso fisico cuyo saldo se expresa en atomos de su
  dimension.
- `RecipeComponent`: cantidad atomica de un recurso consumida por una variante.
- `Sale`: venta o cuenta.
- `SaleItem`: linea de venta.
- `Payment`: pago aplicado a una venta.
- `KitchenTicket`: comanda enviada a area de preparacion.
- `InventoryMovement`: movimiento de inventario.
- `CashSession`: sesion o caja operativa.
- `CashMovement`: movimiento de caja.
- `Role`: rol de permisos.
- `Settings`: configuracion operativa.
- `Event`: accion historica sincronizable.
- `SyncCheckpoint`: cursor de sincronizacion por dispositivo.
- `SyncConflict`: caso administrativo que agrupa eventos o registros en conflicto.
- `SyncConflictParticipant`: participacion de un evento dentro de un conflicto, como ganador por defecto o candidato conflictivo.

## Agregados sugeridos

| Agregado | ID | Eventos principales |
|---|---|---|
| Venta | `sale_id` | `venta_creada`, `producto_agregado`, `pago_registrado`, `venta_cerrada` |
| Comanda | `kitchen_ticket_id` | `comanda_creada`, `item_enviado_a_cocina`, `item_listo` |
| Inventario | `product_id` | `entrada_inventario`, `salida_por_venta`, `ajuste_manual` |
| Catalogo | `product_id` | `producto_creado`, `producto_actualizado`, `producto_desactivado` |
| Caja | `cash_session_id` | `caja_abierta`, `movimiento_caja_registrado`, `caja_cerrada` |
| Usuario | `user_id` | `usuario_creado`, `usuario_actualizado`, `usuario_desactivado` |
| Rol | `role_id` | `rol_creado`, `rol_actualizado`, `permiso_asignado`, `permiso_revocado` |
| Configuracion | `settings_scope_id` | `configuracion_actualizada`, `impuesto_actualizado` |

## Relacion con datos

Ver [[05 - Datos/Modelo de tablas|Modelo de tablas]].

Las reglas transversales de precision, conversion y proporcionalidad viven en
[[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]].
