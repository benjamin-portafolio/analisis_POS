---
tipo: contexto
estado: borrador
actualizado: 2026-10-08
---

# Alcance inicial

## Criterio funcional general

El sistema objetivo debe permitir en offline todas las operaciones que permite online, salvo operaciones imposibles por requerir confirmacion externa inmediata.

El MVP debe validar que el core local funciona sin servidor y que ese mismo core puede conectarse posteriormente a sincronizacion. Por eso el alcance se divide en:

```text
core comun
modo standalone
modo server_sync
```

El MVP puede implementar primero un subconjunto funcional, pero no debe asumir que el offline solo aplica a ventas o comandas.

## Incluido en el MVP

- Configuracion de modo `standalone` o `server_sync`.
- Core offline-first comun basado en SQLite, eventos y proyecciones.
- Catalogo de productos y categorias.
- Precio de venta obligatorio y costo estandar opcional por variante, separados
  del costo real de movimientos de inventario.
- Catalogo metrico inicial de unidades y conversion exacta a cantidades
  atomicas para venta medida y movimientos de inventario.
- Alta, edicion, desactivacion y reactivacion basica de productos como eventos pendientes.
- Apertura de venta o comanda.
- Agregar, cancelar y modificar cantidades de productos.
- Venta por unidad y a granel con precio proporcional a una cantidad de
  referencia y snapshot nullable del costo estandar conocido al agregar la
  linea.
- Registro de pagos.
- Cierre o cancelacion de venta.
- Movimientos basicos de inventario registrados de forma independiente.
- Movimientos basicos de caja registrables localmente.
- Para `standalone`: operacion sin servidor de sync y respaldo/restauracion
  obligatorio mediante Google Drive.
- Para `server_sync`: sincronizacion push/pull.
- Para `server_sync`: prevalidacion de pendientes para cambios que puedan chocar.
- Para `server_sync`: registro de conflictos.
- Auditoria minima por usuario y dispositivo.

## Fuera del MVP

- Facturacion fiscal.
- Multiples sucursales con inventario separado.
- Promociones complejas.
- Cortes de caja avanzados.
- Integracion con terminal bancaria.
- Reportes contables completos.
- Sincronizacion multi-dispositivo usando Google Drive como si fuera servidor.
- Migracion automatica de una instalacion standalone a servidor sin flujo explicito de importacion.

## Por validar

- Si cocina/barra requiere una pantalla dedicada o solo impresion.
- Compatibilidad física por modelo de impresora Android: la impresión local
  Bluetooth de ventas/cotizaciones ya se solicita y tiene un
  [[08 - Roadmap/Impresion de tickets/Plan de implementacion|plan de implementación]],
  con varios perfiles y primera prueba de 58 mm pendientes de desarrollar/verificar.
- Para `server_sync`, si el servidor sera local, VPS o arquitectura mixta.
- Si habra roles separados para mesero, cajero, cocina y administrador.
- Lista final de operaciones que se registran offline como solicitud pendiente y no como confirmacion completada.
- Politica de retencion, recuperacion y evolucion del formato de respaldos en
  `standalone`.
- Flujo de migracion de `standalone` a `server_sync`.
