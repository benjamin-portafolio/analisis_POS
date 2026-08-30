---
tipo: sincronizacion
estado: borrador
actualizado: 2026-07-17
---

# Operacion offline

## Alcance

El dispositivo debe permitir offline todas las operaciones disponibles online, salvo las imposibles por depender de confirmacion externa inmediata. Esto incluye ventas, comandas, catalogo, inventario, caja, configuracion y administracion de usuarios/permisos segun los permisos conocidos localmente.

Este flujo aplica tanto a `standalone` como a `server_sync`. La diferencia no esta en si la accion puede capturarse, sino en que adaptador externo se activa despues.

En modo `server_sync`, la accion tiene un ciclo remoto:

```text
capturada localmente -> pendiente -> aceptada/rechazada/en conflicto
```

En modo `standalone`, la accion se considera aplicada localmente:

```text
capturada localmente -> aplicada en SQLite -> respaldable/restaurable
```

## Flujo local

1. Usuario ejecuta una accion.
2. La app valida reglas locales basicas.
3. La app crea un evento.
4. La app guarda el evento en SQLite.
5. La app aplica el evento a tablas de lectura locales.
6. La interfaz se actualiza inmediatamente.

En `server_sync`, el evento queda pendiente de servidor. En `standalone`, el evento queda como trazabilidad local y no requiere envio remoto.

## Reglas locales minimas

- No agregar productos a una venta localmente cancelada.
- No duplicar `event_id`.
- No duplicar `payment_id`.
- Mantener `local_sequence` incremental por dispositivo.
- Guardar fecha local solo como referencia, no como orden oficial.
- Validar permisos con el ultimo snapshot local conocido.
- Incluir `base_server_sequence` o `base_version` en cambios mutables como productos, usuarios, roles y configuracion.
- Distinguir entre evento aplicado localmente, evento que no requiere servidor y evento aceptado por servidor.

## Operaciones administrativas offline

Ejemplos de operaciones que deben poder capturarse offline:

- Crear, editar, desactivar y reactivar productos.
- Crear y editar categorias. Su ciclo futuro de desactivacion o eliminacion esta
  pendiente.
- Cambiar precios.
- Ajustar inventario.
- Registrar movimientos de caja.
- Generar cortes preliminares.
- Crear o modificar usuarios y roles, sujetos a validacion posterior.
- Cambiar configuracion local o global, sujeto a validacion posterior.

En modo `server_sync`, estas operaciones pueden quedar en conflicto si el servidor detecta cambios concurrentes, permisos insuficientes, unicidad violada o reglas globales incumplidas.

En modo `standalone`, las reglas son locales; no hay conflicto global salvo que se ejecute una migracion/importacion posterior hacia servidor.

## Limitaciones offline

- El dispositivo puede no saber que otro dispositivo cancelo una venta.
- El inventario puede no estar actualizado.
- El catalogo puede estar desfasado.
- El servidor puede rechazar eventos al reconectar.
- No se puede garantizar unicidad global de SKU, usuario, folio u otra clave sin sincronizar.
- No se puede confirmar autorizacion bancaria, timbrado fiscal u otra integracion externa sin conexion al servicio correspondiente.
- No se puede obtener `server_sequence` hasta que el servidor acepte el evento.
- En modo `standalone`, un respaldo externo no resuelve conflictos multi-dispositivo ni permisos remotos.

## Enlaces

- [[04 - Sincronizacion/Paridad operativa offline|Paridad operativa offline]]
- [[04 - Sincronizacion/Prevalidacion de pendientes|Prevalidacion de pendientes]]
- [[01 - Contexto/Modos de operacion|Modos de operacion]]
