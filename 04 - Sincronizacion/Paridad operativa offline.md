---
tipo: sincronizacion
estado: activo
actualizado: 2026-08-04
---

# Paridad operativa offline

## Principio

Los dispositivos deben poder realizar offline todas las operaciones que pueden realizar online, salvo las operaciones imposibles por depender de una confirmacion externa inmediata.

El principio aplica tanto a `standalone` como a `server_sync`. En `standalone`, la validacion termina localmente; en `server_sync`, puede existir validacion posterior del servidor.

Esto incluye:

- Ventas.
- Comandas.
- Pagos registrables localmente.
- Cancelaciones y anulaciones.
- Altas y cambios de productos.
- Cambios de precios.
- Categorias.
- Ajustes de inventario.
- Movimientos de caja.
- Cortes preliminares.
- Cambios de configuracion.
- Cambios de usuarios, roles y permisos, con validacion posterior.

## Matiz importante

Offline no significa que todo quede aceptado oficialmente. Significa que el dispositivo puede registrar la operacion como evento local o solicitud pendiente.

Estados posibles:

| Estado | Significado |
|---|---|
| `local_applied` | Aplicado localmente |
| `pending_sync` | Pendiente de sincronizar |
| `synced` | Aceptado oficialmente por servidor |
| `conflict` | Requiere resolucion |
| `rejected` | Rechazado por regla del servidor |
| `pending_external_confirmation` | Requiere confirmacion externa, como banco o facturacion |

En modo `standalone`, `local_applied` puede ser el estado final normal. En modo `server_sync`, `local_applied` es un estado transitorio antes de la validacion remota.

## Operaciones imposibles offline

No pueden considerarse completadas offline:

- Autorizacion bancaria en linea.
- Timbrado fiscal en linea.
- Confirmacion global de unicidad si depende del servidor.
- Descarga de informacion que no esta en SQLite local.
- Acciones contra hardware inaccesible.

Estas operaciones pueden dejar una solicitud pendiente, pero no deben mostrarse como confirmadas.

## Reglas para operaciones administrativas

- Todo cambio mutable debe incluir `base_server_sequence` o `base_version`.
- En modo `server_sync`, el servidor debe detectar si la entidad cambio desde la base conocida por el dispositivo.
- En modo `server_sync`, los cambios de permisos hechos offline no deben usarse para elevar permisos globales hasta ser aceptados por el servidor.
- Si dos dispositivos editan el mismo registro offline, solo hay conflicto automatico cuando modifican la misma columna.
- En modo `server_sync`, si modifican columnas distintas del mismo registro, el servidor debe fusionar y aceptar ambos eventos si no violan otra regla.

## Ejemplo

Un administrador crea offline un producto cuya variante inicial usa el SKU
`ABC-001`.

Localmente:

```text
producto_creado
estado local = local_applied
delivery_status = pending si esta en server_sync
```

Al sincronizar:

```text
Si el SKU sigue libre -> accepted
Si otro dispositivo ya uso el SKU -> conflict
```

## Decision relacionada

[[02 - Decisiones/ADR-0007 Paridad operativa offline salvo operaciones imposibles|ADR-0007 Paridad operativa offline salvo operaciones imposibles]]

[[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011 Dos modos de app sobre el mismo core offline first]]
