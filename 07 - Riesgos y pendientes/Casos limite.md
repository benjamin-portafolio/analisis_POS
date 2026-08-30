---
tipo: pruebas
estado: borrador
actualizado: 2026-08-24
---

# Casos limite

## Sin conexion

- Dispositivo crea venta, agrega productos, cobra y cierra sin internet.
- Dispositivo crea venta y se apaga antes de sincronizar.
- Dispositivo cambia de red durante push.

## Duplicados

- El mismo evento se envia dos veces.
- El mismo pago se envia con dos eventos distintos por error.
- El mismo item se agrega por doble toque en interfaz.

## Conflictos

- Dispositivo A cancela venta offline.
- Dispositivo B agrega producto a la misma venta offline.
- Ambos sincronizan despues.

## Inventario

- Dos dispositivos venden el ultimo producto offline.
- Se registra ajuste manual mientras hay ventas offline pendientes.
- Se cancela una venta despues de descontar inventario.
- Se captura `0.25 kg`, `0.001 kg` y una precision no representable como
  `0.0005 kg` con atomo gramo.
- Se desactiva una unidad usada por productos, recursos y ventas historicas.

## Catalogo

- Producto se desactiva mientras un dispositivo esta offline.
- Precio cambia mientras un dispositivo tiene venta abierta.
- Costo estandar cambia despues de agregar una linea; el snapshot historico no
  debe modificarse.
- Una entrada de inventario tiene costo real diferente al costo estandar de la
  variante; ambos valores permanecen independientes.
- Categoria referenciada cambia mientras existe un producto pendiente.
- Dos dispositivos crean variantes con el mismo SKU offline.
- Un dispositivo crea producto offline y otro modifica la categoria relacionada.
- Un producto creado offline se vende antes de ser aceptado por el servidor.

## Caja

- Dispositivo registra retiro offline mientras otro dispositivo cierra la caja.
- Dispositivo genera corte preliminar offline con ventas aun pendientes de sincronizar.
- Dos dispositivos abren caja para el mismo punto operativo.

## Usuarios y permisos

- Usuario opera offline con permiso que fue revocado en servidor.
- Dos administradores modifican el mismo rol offline.
- Dispositivo crea usuario offline con identificador ya usado.

## Configuracion

- Se cambia impuesto offline mientras otro dispositivo vende con impuesto anterior.
- Se desactiva metodo de pago mientras un dispositivo lo usa offline.
