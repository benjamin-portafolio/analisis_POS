---
tipo: contexto
estado: borrador
actualizado: 2026-07-16
---

# Supuestos y restricciones

## Supuestos

- Cada dispositivo tiene un `device_id` unico.
- Cada instalacion conoce su modo de operacion: `standalone` o `server_sync`.
- Cada usuario inicia sesion o se identifica con PIN local, usuario local o proveedor remoto segun el modo.
- El dispositivo puede guardar datos en SQLite.
- En modo `server_sync`, el servidor propio esta disponible al menos cuando existe red local o internet.
- En modo `standalone`, no existe obligacion de servidor.
- Los eventos pueden generarse offline y enviarse despues.
- Toda operacion online tendra una representacion offline como evento o solicitud pendiente, salvo imposibilidad externa.
- En modo `server_sync`, los permisos se evaluan localmente con el ultimo snapshot conocido y se validan oficialmente al sincronizar.
- En modo `standalone`, los permisos pueden ser locales y no requieren validacion de servidor.
- En la implementacion vigente, Google Drive es obligatorio para completar la
  configuracion inicial de `standalone` y sirve solo para
  respaldo/restauracion, no para sincronizacion transaccional
  multi-dispositivo.

## Restricciones

- No se usaran servicios externos de paga como dependencia principal.
- El sistema debe tolerar reintentos de sincronizacion.
- En modo `server_sync`, no se debe confiar en el reloj del dispositivo como orden oficial.
- En modo `standalone`, el reloj local puede usarse como referencia operativa, pero no debe confundirse con orden global si despues se migra a servidor.
- No se deben borrar fisicamente registros necesarios para sincronizar.
- En modo `server_sync`, el servidor debe poder rechazar eventos invalidos.
- Una operacion que requiere autorizacion externa en tiempo real no debe marcarse como completada offline.
- En modo `server_sync`, un cambio de permisos hecho offline no debe elevar privilegios globales hasta ser aceptado por el servidor.
- En modo `standalone`, un respaldo no debe sobrescribir datos locales sin confirmacion explicita y mecanismo de seguridad.

## Decisiones relacionadas

- [[02 - Decisiones/ADR-0001 Offline first con SQLite local|ADR-0001 Offline first con SQLite local]]
- [[02 - Decisiones/ADR-0002 Sincronizacion por eventos|ADR-0002 Sincronizacion por eventos]]
- [[02 - Decisiones/ADR-0003 Server sequence como cursor|ADR-0003 Server sequence como cursor]]
- [[02 - Decisiones/ADR-0007 Paridad operativa offline salvo operaciones imposibles|ADR-0007 Paridad operativa offline salvo operaciones imposibles]]
- [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011 Dos modos de app sobre el mismo core offline first]]
