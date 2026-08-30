---
tipo: ADR
id: ADR-0008
estado: decidido
fecha: 2026-06-14
---

# ADR-0008 Flujo de sincronizacion con preflight antes de push

## Contexto

Con paridad operativa offline, los dispositivos pueden generar eventos de ventas, catalogo, inventario, caja, usuarios, roles, permisos y configuracion. Muchas de estas operaciones son mutables y dependen de versiones, unicidad o estados globales que pudieron cambiar mientras el dispositivo estaba offline.

Hacer siempre `push -> pull` sube eventos basados en una realidad vieja. Hacer siempre `pull completo -> push` puede ser caro, traer cambios irrelevantes y provocar friccion visual antes de intentar sincronizar los pendientes locales.

## Decision

El flujo estandar de reconexion sera:

```text
preflight -> revalidar pendientes -> push -> pull completo final
```

## Por que no pull completo primero

Un pull completo antes del push no es el flujo normal porque:

- Puede descargar muchos eventos que no afectan los pendientes locales.
- Puede tardar demasiado si el dispositivo estuvo horas o dias offline.
- Puede aplicar cambios visuales no relacionados antes de preservar el trabajo local.
- Puede obligar al usuario a resolver cambios ajenos antes de subir eventos que no chocan.
- No elimina la validacion del servidor; el push debe validar de todos modos.

El pull completo sigue siendo obligatorio al final para dejar el dispositivo actualizado y avanzar el cursor global.

## Excepciones

El sistema puede hacer pull completo antes del push cuando:

- No hay eventos pendientes.
- El dispositivo estuvo demasiado tiempo offline.
- El servidor indica que el preflight seria demasiado grande o impreciso.
- Hay cambios pendientes de configuracion global, impuestos, permisos o caja que requieren contexto completo.
- El cursor local esta demasiado atrasado o ya no existe ventana de eventos recientes.

## Consecuencias

- Se requiere `/sync/preflight`.
- Se requiere indexar referencias de eventos con `event_refs`.
- El cursor de preflight no debe reemplazar al cursor de pull completo.
- El cliente debe poder revalidar y reclasificar eventos pendientes antes del push.
- El servidor debe validar oficialmente de nuevo en `/sync/push`.

## Enlaces

- [[04 - Sincronizacion/Flujo push pull|Flujo push pull]]
- [[04 - Sincronizacion/Prevalidacion de pendientes|Prevalidacion de pendientes]]
- [[05 - Datos/Modelo de tablas|Modelo de tablas]]

