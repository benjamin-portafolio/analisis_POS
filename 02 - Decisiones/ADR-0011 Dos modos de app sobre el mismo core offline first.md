---
tipo: ADR
id: ADR-0011
estado: decidido
fecha: 2026-07-08
actualizado: 2026-07-16
---

# ADR-0011 Dos modos de app sobre el mismo core offline first

## Contexto

El sistema necesita poder operar en dos escenarios:

1. Una instalacion standalone, usada por una sola persona o un solo
   dispositivo, con respaldo/restauracion obligatorio mediante Google Drive.
2. Una instalacion sincronizada, con varios dispositivos compartiendo datos mediante servidor propio.

Crear dos proyectos separados duplicaria reglas de negocio, pantallas, modelos, handlers de eventos y pruebas. A la vez, forzar que toda instalacion dependa del servidor haria mas pesada la adopcion de un POS personal o simple.

## Decision

Se mantendra una sola base de codigo para la app movil, con dos modos de operacion configurables:

```text
standalone
server_sync
```

El core offline-first sera comun:

- comandos,
- eventos,
- SQLite local,
- proyecciones,
- handlers,
- auditoria,
- reglas locales de negocio.

Las diferencias se implementaran mediante adaptadores:

- autenticacion local o backend,
- sincronizacion desactivada o sincronizacion con servidor,
- respaldo/restauracion obligatorio con Google Drive en `standalone` y sin
  respaldo propio de la app en `server_sync`.

Google Drive es obligatorio para completar la configuracion inicial de
`standalone`. Se usa para buscar y restaurar un respaldo compatible o para
crear el respaldo inicial, pero no sustituye al servidor de sincronizacion
multi-dispositivo.

## Reglas

- El servidor no debe ser una dependencia del core local.
- La sincronizacion debe ser una capacidad opcional.
- El respaldo con Google Drive es obligatorio para completar el onboarding de
  una instalacion `standalone` en la implementacion vigente.
- Las pantallas de servidor deben ocultarse o reemplazarse por pantallas de respaldo en modo standalone.
- La tabla de eventos existe en ambos modos.
- En modo standalone, los eventos sirven principalmente para trazabilidad, auditoria, restauracion y posible migracion futura.
- Los command services declaran y validan referencias de evento en ambos modos para conservar un core comun.
- En modo standalone, los eventos usan `delivery_status = not_required` y no se persisten filas en `event_refs`, porque son metadatos de preflight y conflictos de servidor.
- En modo `server_sync`, los eventos sirven tambien para push/pull, conflictos, idempotencia y orden global.
- Push, pull, preflight, health checks y WebSocket no deben iniciarse en standalone.
- La seleccion de modo debe ocurrir por configuracion, no por proyectos separados.
- No se deben distribuir condicionales de modo por toda la UI y servicios; se deben preferir interfaces e inyeccion de dependencias.
- Una futura importacion de historial standalone a servidor debe reconstruir las referencias necesarias mediante un flujo explicito; no debe convertir silenciosamente eventos `not_required` en pendientes.

## Consecuencias positivas

- Se evita duplicar el POS.
- El modo standalone puede avanzar sin esperar backend completo.
- El modo servidor reutiliza el mismo flujo local validado en standalone.
- Los eventos mantienen trazabilidad en ambos escenarios.
- La app puede ofrecer distintos paquetes o despliegues desde el mismo nucleo.

## Consecuencias negativas

- La arquitectura debe cuidar limites claros entre core y adaptadores.
- Se requieren pruebas por modo.
- El estado de eventos debe distinguir entre "pendiente de servidor" y "no requiere servidor".
- Una migracion futura de standalone a servidor no puede asumir que existen `event_refs` historicas.
- Restaurar respaldos en standalone requiere reglas para evitar perdida o sobrescritura accidental.
- Migrar de standalone a servidor necesita un flujo explicito de importacion/bootstrap.

## Alternativas consideradas

### Dos proyectos separados

Descartado por duplicacion y riesgo de divergencia entre reglas de negocio.

### Solo servidor

Descartado porque aumenta la complejidad para instalaciones simples y contradice la posibilidad de POS standalone.

### Usar Google Drive como sincronizador multi-dispositivo

Descartado para sincronizacion transaccional. Drive es adecuado para respaldos, pero no reemplaza validaciones, permisos, conflictos, orden global ni consultas centralizadas.

## Enlaces

- [[01 - Contexto/Modos de operacion|Modos de operacion]]
- [[02 - Decisiones/ADR-0001 Offline first con SQLite local|ADR-0001 Offline first con SQLite local]]
- [[02 - Decisiones/ADR-0002 Sincronizacion por eventos|ADR-0002 Sincronizacion por eventos]]
- [[02 - Decisiones/ADR-0009 Command services por agregado y aplicacion compartida de eventos|ADR-0009 Command services por agregado y aplicacion compartida de eventos]]
