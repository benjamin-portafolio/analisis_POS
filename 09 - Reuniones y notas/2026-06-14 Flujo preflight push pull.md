---
tipo: nota
fecha: 2026-06-14
estado: activo
---

# 2026-06-14 Flujo preflight push pull

Se ajusta el flujo de sincronizacion recomendado.

## Decision

El flujo estandar de reconexion sera:

```text
preflight -> revalidar pendientes -> push -> pull completo final
```

## Motivo

Con paridad operativa offline, los dispositivos pueden cambiar catalogo, caja, permisos, configuracion e inventario. Esos cambios pueden depender de versiones, estados globales o claves unicas.

Un pull completo antes del push puede traer demasiados eventos irrelevantes y retrasar la subida de pendientes locales. El preflight trae solo eventos impactantes.

## Cambios documentados

- Se agrega [[02 - Decisiones/ADR-0008 Flujo de sincronizacion con preflight antes de push|ADR-0008]].
- Se actualiza [[04 - Sincronizacion/Flujo push pull|Flujo push pull]].
- Se detallan criterios en [[04 - Sincronizacion/Prevalidacion de pendientes|Prevalidacion de pendientes]].
- Se separan checkpoints de pull completo y preflight en [[05 - Datos/Modelo de tablas|Modelo de tablas]].
