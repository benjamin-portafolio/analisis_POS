---
tipo: nota
fecha: 2026-06-10
estado: activo
---

# 2026-06-10 Paridad operativa offline

Se ajusta el analisis para que la operacion offline no quede limitada a ventas o comandas.

## Decision

Toda operacion disponible online debe poder registrarse offline como evento o solicitud pendiente, salvo que sea imposible completarla sin confirmacion externa inmediata.

## Impacto

- Catalogo requiere eventos, versionado y conflictos propios.
- Caja requiere estados y reconciliacion.
- Usuarios, roles y permisos requieren validacion conservadora.
- Configuracion e impuestos requieren versionado y reglas de revision.
- El flujo recomendado incorpora prevalidacion de pendientes antes del push.

## Enlaces

- [[02 - Decisiones/ADR-0007 Paridad operativa offline salvo operaciones imposibles|ADR-0007]]
- [[04 - Sincronizacion/Paridad operativa offline|Paridad operativa offline]]
- [[04 - Sincronizacion/Prevalidacion de pendientes|Prevalidacion de pendientes]]
