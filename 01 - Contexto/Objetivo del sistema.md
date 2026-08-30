---
tipo: contexto
estado: activo
actualizado: 2026-07-16
---

# Objetivo del sistema

Implementar un sistema de punto de venta y comandas para dispositivos moviles que pueda operar con o sin internet, con dos modos de uso sobre la misma base de codigo:

```text
standalone
server_sync
```

En `standalone`, el dispositivo funciona como POS local y requiere configurar
Google Drive para el respaldo/restauracion inicial. En `server_sync`, varios
dispositivos sincronizan datos mediante servidor propio.

## Objetivos principales

- Registrar ventas aunque el dispositivo este offline.
- Tomar comandas desde varios dispositivos.
- Permitir una instalacion standalone sin servidor para escenarios simples o personales.
- Permitir offline las mismas operaciones que online, salvo las imposibles por depender de confirmacion externa inmediata.
- Reflejar cambios en otros dispositivos cuando haya sincronizacion.
- Evitar duplicados de ventas, pagos e inventario.
- Mantener trazabilidad de quien hizo que y desde que dispositivo.
- No depender de servicios externos de paga como fuente principal de sincronizacion.

## Resultado esperado

Un sistema con almacenamiento local en cada dispositivo y un core offline-first comun.

Segun el modo:

- En `standalone`, los eventos locales sirven como trazabilidad, auditoria, respaldo y posible migracion futura.
- En `server_sync`, los eventos locales se sincronizan contra servidor propio mediante un protocolo incremental basado en eventos.

Las operaciones offline quedan como eventos locales aplicados o como solicitudes pendientes de confirmacion externa.

## Principio rector

El core local no debe depender del servidor. Debe depender de eventos inmutables, identificadores unicos y proyecciones locales.

Cuando se active `server_sync`, la sincronizacion no debe depender de comparar estados completos. Debe depender de eventos inmutables, identificadores unicos y cursores incrementales.

La experiencia funcional debe buscar paridad offline: si una operacion existe online, debe poder registrarse offline como evento o solicitud pendiente, excepto cuando sea imposible completarla sin un tercero o sin el servidor.

## Enlaces

- [[01 - Contexto/Modos de operacion|Modos de operacion]]
- [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011 Dos modos de app sobre el mismo core offline first]]
