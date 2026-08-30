---
tipo: sincronizacion
estado: borrador
actualizado: 2026-07-23
---

# Protocolo de eventos

El formato base de eventos aplica al core local en ambos modos. Los campos de servidor se usan solo cuando el modo `server_sync` esta activo.

## Estructura base

```json
{
  "event_id": "evt_01J...",
  "aggregate_type": "sale",
  "aggregate_id": "sale_01J...",
  "event_type": "producto_agregado",
  "device_id": "device_tablet_01",
  "user_id": "user_mesero_01",
  "local_sequence": 1052,
  "server_sequence": null,
  "created_at_local": "2026-06-09T14:31:00-06:00",
  "created_at_server": null,
  "base_server_sequence": 9180,
  "base_version": 4,
  "payload": {
    "sale_item_id": "item_01J...",
    "product_id": "prod_taco",
    "quantity": 2,
    "unit_price": 25
  }
}
```

## Campos obligatorios

| Campo                  | Genera      | Descripcion                                       |
| ---------------------- | ----------- | ------------------------------------------------- |
| `event_id`             | dispositivo | UUID/ULID unico global                            |
| `aggregate_type`       | dispositivo | Tipo de agregado                                  |
| `aggregate_id`         | dispositivo | ID de venta, comanda, producto, etc.              |
| `event_type`           | dispositivo | Tipo de evento                                    |
| `device_id`            | dispositivo | Origen                                            |
| `user_id`              | dispositivo | Usuario que ejecuto accion                        |
| `local_sequence`       | dispositivo | Orden local por dispositivo                       |
| `server_sequence`      | servidor    | Orden oficial en `server_sync`, nulo en `standalone` |
| `base_server_sequence` | dispositivo | Ultimo cursor conocido al crear el evento, solo aplica cuando hay servidor |
| `base_version`         | dispositivo | Version conocida de la entidad mutable, si aplica |
| `payload`              | dispositivo | Datos especificos del evento                      |

## Contratos tipados de payload en la app

El sobre `SyncEvent` se mantiene generico y conserva `payload` como mapa porque
el almacenamiento y las respuestas de pull contienen eventos de distintos
tipos. El tipado se aplica al entrar al procesamiento especifico de cada
`event_type`.

Por cada evento implementado en Flutter debe existir un contrato en
`application/sync/payloads` que:

- Declare `aggregateType` y `eventType`.
- Represente cada campo conocido con su tipo de dominio o de aplicacion.
- Convierta el contrato a la forma canonica mediante `toJson`.
- Valide y normalice datos locales o remotos mediante `fromJson`.
- Tolere campos adicionales para evolucion compatible.
- Rechace campos conocidos ausentes, con tipo incorrecto o valor invalido.
- Admita representaciones legadas solo cuando exista una regla explicita y una
  prueba de compatibilidad.

```text
Creacion local:
CommandService -> XPayload -> toJson -> SyncEvent.payload

Recepcion remota:
SyncEvent.fromJson -> catalogo por event_type -> handler
  -> XPayload.fromJson -> proyeccion
```

El command service, el catalogo y cualquier revalidador deben reutilizar el
mismo contrato. No deben mantener listas paralelas de campos ni repetir
literales de `aggregate_type` y `event_type`.

### Contratos actuales

| Evento | Agregado | Contrato | Payload canonico |
|---|---|---|---|
| `espacio_creado` | `espacio` | `EspacioCreadoPayload` | `nombre: String`, `identificacion: String?`, `visibilidad: String` |
| `categoria_creada` | `category` | `CategoriaCreadaPayload` | `name: String`, `color_key: String`, `sort_order: int` |
| `categoria_actualizada` | `category` | `CategoriaActualizadaPayload` | `base_event_id: String`, `changed_fields: List<String>`, `changes: Map` |
| `categoria_movida` | `category` | `CategoriaMovidaPayload` | bases y cambios consecutivos de `sort_order` para dos categorias |

`EspacioCreadoPayload` normaliza textos, convierte una identificacion vacia en
`null` y conserva compatibilidad explicita con los indices legados de
visibilidad. `CategoriaCreadaPayload` normaliza el nombre, valida la clave de
color y solo acepta un orden entero mayor o igual que cero. `CategoriaActualizadaPayload`
permite modificar exclusivamente `name` y `color_key`, conserva los valores
`from` y `to` y referencia el evento base para trazabilidad y restauracion de
la proyeccion optimista si aparece un conflicto.
`CategoriaMovidaPayload` transporta un intercambio absoluto e idempotente entre
dos posiciones consecutivas y conserva la base conocida de cada categoria.

Si un payload remoto no cumple su contrato, el evento no se aplica. En el pull
actual, la pagina de eventos y el avance del checkpoint comparten transaccion,
por lo que el error tampoco debe dejar una aplicacion parcial.

## Campos para operaciones mutables

Las operaciones sobre entidades editables deben incluir una base conocida:

```text
base_server_sequence
base_version
```

Esto aplica especialmente a:

- Productos.
- Categorias.
- Usuarios.
- Roles y permisos.
- Configuracion.
- Caja.

En `standalone`, `base_version` puede bastar para reglas locales. En `server_sync`, `base_server_sequence` permite comparar contra cambios aceptados por el servidor.

Los eventos de actualizacion tambien deben declarar las columnas modificadas. Esto permite fusionar cambios concurrentes cuando tocan columnas distintas y detectar conflicto cuando tocan la misma columna.

Estructura recomendada para eventos `*_actualizado`:

```json
{
  "base_server_sequence": 9180,
  "base_version": 4,
  "payload": {
    "changed_fields": ["nombre"],
    "changes": {
      "nombre": {
        "from": "Terraza",
        "to": "Terraza VIP"
      }
    }
  }
}
```

Regla:

```text
mismo aggregate_type + mismo aggregate_id + misma columna = conflicto
mismo aggregate_type + mismo aggregate_id + columnas distintas = merge
```

Si el servidor detecta que la entidad cambio despues de la base conocida, debe comparar las columnas modificadas antes de decidir. No debe marcar conflicto solo porque cambio el mismo registro.

Las reglas de negocio que no dependen de columna siguen aplicando: claves unicas, estados bloqueantes, permisos, caja cerrada, impuestos o configuracion global pueden rechazar o mandar a revision un evento aunque no exista choque de columna.

## Tipos iniciales de eventos

### Espacios y mesas

- `espacio_creado`
- `espacio_actualizado`
- `espacio_desactivado`
- `mesa_creada`
- `mesa_actualizada`
- `mesa_desactivada`

### Venta

- `venta_creada`
- `producto_agregado`
- `producto_cancelado`
- `cantidad_producto_cambiada`
- `descuento_aplicado`
- `pago_registrado`
- `pago_cancelado`
- `venta_cerrada`
- `venta_cancelada`

### Comanda

- `comanda_creada`
- `item_enviado_a_cocina`
- `item_en_preparacion`
- `item_listo`
- `item_entregado`
- `item_cancelado`

### Inventario

- `entrada_inventario`
- `salida_por_venta`
- `ajuste_manual`
- `devolucion`
- `merma`

### Catalogo

- `producto_creado`
- `producto_actualizado`
- `precio_actualizado`
- `producto_desactivado`
- `producto_reactivado`
- `categoria_creada`
- `categoria_actualizada`
- `categoria_movida`

La desactivacion o reactivacion de categorias no forma parte del alcance
concluido actual y no tiene eventos definidos todavia.

### Caja

- `caja_abierta`
- `movimiento_caja_registrado`
- `corte_caja_preliminar_generado`
- `corte_caja_confirmado`
- `caja_cerrada`

### Usuarios y permisos

- `usuario_creado`
- `usuario_actualizado`
- `usuario_desactivado`
- `rol_creado`
- `rol_actualizado`
- `permiso_asignado`
- `permiso_revocado`

### Configuracion

- `configuracion_actualizada`
- `impuesto_actualizado`
- `metodo_pago_activado`
- `metodo_pago_desactivado`

## Regla de cobertura

Si una operacion existe online, debe tener un evento o solicitud pendiente equivalente para offline. Las excepciones se documentan en [[04 - Sincronizacion/Paridad operativa offline|Paridad operativa offline]].
