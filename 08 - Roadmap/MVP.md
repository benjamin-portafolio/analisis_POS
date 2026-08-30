---
tipo: roadmap
estado: borrador
actualizado: 2026-08-19
---

# MVP

## Objetivo del MVP

Probar que un dispositivo puede operar offline como POS local y que el mismo core puede, en modo `server_sync`, sincronizar despues para que otro dispositivo reciba los cambios sin duplicados.

El primer corte del MVP puede enfocarse en ventas, pero la arquitectura debe soportar paridad operativa offline para todos los modulos.

## Historias principales

- Como mesero, quiero crear una venta/comanda sin internet.
- Como usuario standalone, quiero usar el POS sin configurar un servidor.
- Como usuario standalone, quiero respaldar y restaurar mi informacion.
- Como cajero, quiero registrar pago aunque la conexion sea inestable.
- Como administrador, quiero crear o modificar productos sin internet y sincronizarlos despues.
- Como cajero, quiero vender `0.25 kg` u otra cantidad medida sin errores de
  coma flotante.
- Como administrador, quiero capturar cantidades de inventario en una unidad
  conocida aunque la base persista enteros atomicos.
- Como encargado, quiero registrar movimientos de inventario o caja sin internet.
- Como administrador, quiero ver conflictos de sincronizacion.
- Como sistema, quiero ignorar eventos duplicados.
- Como sistema, quiero aplicar eventos remotos en orden.

## Entregables tecnicos

- SQLite local con `events` y tablas de lectura.
- Modo `standalone` que no arranca monitor de servidor ni requiere endpoints.
- Configuracion de modo de app.
- Identidad local minima para auditoria.
- Respaldo/restauracion basico para standalone.
- Backend con `/sync/preflight`, `/sync/push` y `/sync/pull`.
- Base central con `server_sequence`.
- Tabla `event_refs` para pull ligero.
- Checkpoint separado para pull completo y preflight.
- Handlers para eventos de venta basicos.
- Handlers basicos para catalogo e inventario.
- Catalogo local de unidades y conversor decimal exacto compartido por ventas e
  inventario.
- Pruebas de duplicados y reconexion.
- Pruebas de arranque en `standalone` sin servidor.
- Pruebas de que el flujo local de comandos funciona igual en ambos modos.

## Eventos minimos del MVP

- `venta_creada`
- `producto_agregado`
- `producto_cancelado`
- `pago_registrado`
- `venta_cerrada`
- `venta_cancelada`
- `producto_creado`
- `producto_actualizado`
- `producto_desactivado`
- `ajuste_manual`
- `movimiento_caja_registrado`
