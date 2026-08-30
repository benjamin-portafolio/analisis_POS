---
tipo: ADR
id: ADR-0007
estado: decidido
fecha: 2026-06-10
---

# ADR-0007 Paridad operativa offline salvo operaciones imposibles

## Contexto

El sistema no debe limitar la operacion offline solo a ventas o comandas. Un dispositivo puede necesitar hacer offline las mismas operaciones que haria online: vender, cobrar, cancelar, modificar catalogo, ajustar inventario, operar caja, cambiar configuracion o administrar usuarios, siempre que la operacion tenga sentido sin comunicarse en tiempo real con un servicio externo o con el servidor.

## Decision

Toda operacion disponible online debe tener un equivalente offline basado en eventos, salvo que sea imposible completarla sin una respuesta externa inmediata.

La operacion offline se registra como evento local pendiente, se aplica a las tablas de lectura locales cuando sea seguro hacerlo, y queda sujeta a validacion oficial del servidor al sincronizar.

## Que significa "imposible offline"

Una operacion es imposible offline cuando necesita una respuesta externa en tiempo real para considerarse completada.

Ejemplos:

- Autorizar una tarjeta bancaria con una pasarela externa.
- Timbrar una factura fiscal si el servicio fiscal no esta disponible.
- Obtener un `server_sequence`.
- Confirmar unicidad global de un SKU si otro dispositivo pudo crear el mismo SKU.
- Consultar datos que no estan en el snapshot local.
- Imprimir en una impresora que no esta accesible por red local o conexion directa.

En estos casos el dispositivo puede registrar una intencion o solicitud pendiente, pero no debe presentarla como definitivamente completada si depende de la confirmacion externa.

## Consecuencias

- Catalogo, inventario, caja, configuracion y usuarios tambien deben modelarse con eventos.
- Los eventos mutables deben incluir version o base conocida para detectar cambios concurrentes.
- Habra mas conflictos que resolver al reconectar.
- El servidor sigue siendo la autoridad final.
- La interfaz debe distinguir entre "aplicado localmente", "sincronizado", "rechazado" y "en conflicto".

## Regla de implementacion

Si una accion online existe como comando, debe existir una de estas dos rutas offline:

```text
evento offline pendiente
```

o

```text
solicitud pendiente que requiere confirmacion externa
```

No debe existir una accion online que simplemente desaparezca offline sin explicacion funcional.

## Enlaces

- [[04 - Sincronizacion/Paridad operativa offline|Paridad operativa offline]]
- [[04 - Sincronizacion/Operacion offline|Operacion offline]]
- [[04 - Sincronizacion/Prevalidacion de pendientes|Prevalidacion de pendientes]]
- [[04 - Sincronizacion/Resolucion de conflictos|Resolucion de conflictos]]

