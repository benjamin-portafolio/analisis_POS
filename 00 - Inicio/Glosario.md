---
tipo: referencia
estado: activo
actualizado: 2026-08-24
---

# Glosario

## POS

Punto de venta. Sistema usado para registrar ventas, pagos, tickets y operaciones de caja.

## Comanda

Pedido operativo enviado a cocina, barra u otra area de preparacion.

## Offline-first

Estrategia en la que el dispositivo puede operar sin internet porque guarda datos localmente y sincroniza despues.

## Modo standalone

Modo de la app donde SQLite local es la fuente operativa principal y no se
requiere servidor de sincronizacion. La implementacion vigente exige Google
Drive para respaldo/restauracion inicial, pero no lo usa como sincronizacion
multi-dispositivo transaccional.

## Modo server_sync

Modo de la app donde el mismo core local sincroniza eventos con un servidor propio que valida, asigna `server_sequence` y coordina multiples dispositivos.

## Paridad operativa offline

Principio de que toda operacion disponible online debe poder registrarse offline como evento o solicitud pendiente, salvo que sea imposible completarla sin confirmacion externa inmediata.

## Evento

Registro inmutable de algo que ya ocurrio, por ejemplo `producto_agregado` o `pago_registrado`.

## Comando

Intencion del usuario o sistema, por ejemplo "agregar producto". El comando puede producir un evento si la operacion es valida.

## Handler

Funcion que valida o aplica un evento. Ejemplo: `aplicarProductoAgregado(evento)`.

## Idempotencia

Propiedad que permite procesar el mismo evento mas de una vez sin duplicar efectos.

## Cursor de sincronizacion

Valor que indica hasta donde un dispositivo ya recibio cambios. En este analisis se propone `server_sequence`.

## Proyeccion

Tabla de lectura generada a partir de eventos. Ejemplo: `sales`, `sale_items`, `payments`.

## Dimension de unidad

Familia de magnitudes que pueden convertirse entre si. El alcance inicial usa
masa, volumen y conteo; no convierte entre dimensiones distintas.

## Atomo de cantidad

Menor incremento persistible de una dimension. Inicialmente es gramo para
masa, mililitro para volumen y pieza para conteo.

## Factor atomico

Numero entero de atomos representados por una unidad registrada. Por ejemplo,
un kilogramo tiene factor `1000` cuando el atomo de masa es el gramo.

## Cantidad atomica

Entero canonico persistido en eventos, saldos, ventas medidas y
movimientos. Una captura de `0.25 kg` se convierte en `250` atomos de masa.

## Cantidad de referencia

Cantidad atomica a la que corresponde el precio de una venta medida.

## Costo estandar

Costo monetario vigente y opcional de una variante, guardado en
`standard_cost_minor`. Sirve como referencia comercial; no representa por si
solo una compra, un movimiento de inventario ni utilidad contable.

## Costo real de inventario

Desembolso total asociado a una entrada o movimiento fisico concreto, guardado
cuando corresponde en `inventory_movements.total_cost_minor`. Es independiente
del costo estandar vigente de una variante.

## Articulo de inventario

`inventory_item` que representa un recurso fisico contabilizable. Es
propietario de su saldo y movimientos y no pertenece a un producto o variante.

## Conflicto

Evento que no puede aplicarse automaticamente porque contradice reglas del servidor o cambios previos.

## Solicitud pendiente

Accion capturada localmente que requiere confirmacion externa antes de considerarse completada, por ejemplo una autorizacion bancaria o un timbrado fiscal.

## Respaldo

Copia de seguridad de datos locales para recuperar informacion ante perdida, cambio de dispositivo o restauracion controlada. No equivale a sincronizacion entre multiples dispositivos activos.
