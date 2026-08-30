---
tipo: datos
estado: borrador
actualizado: 2026-08-24
---

# Tablas de lectura

Las tablas de lectura representan el estado actual para que la app sea rapida y sencilla de consultar.

Estas tablas existen en ambos modos. En `standalone`, los campos relacionados con servidor pueden permanecer nulos; en `server_sync`, ayudan a controlar cursor, conflictos y auditoria central.

## Ejemplos

- `sales`
- `sale_items`
- `payments`
- `kitchen_tickets`
- `kitchen_ticket_items`
- `inventory_movements`
- `products`
- `categories`

## Relacion con eventos

Cuando ocurre un evento:

1. Se guarda en `events`.
2. Se aplica con un handler.
3. El handler actualiza una o varias tablas de lectura.

Ejemplo:

```text
producto_agregado
  -> insert sale_items
  -> recalcular sales.total
```

`sale_items` se crea para toda variante vendida. `inventory_movements` no es un
libro de actividad comercial: solo registra variaciones fisicas de
`inventory_items`. Las cantidades vendidas se consultan desde `sale_items`.

Cada `sale_item` captura `sale_mode_snapshot`, codigo, simbolo y factor atomico
de la unidad y cantidad de referencia usadas al crear la linea. Las ventas
`unit` guardan `quantity`; las ventas `measured` guardan
`measured_quantity_atomic`. Un cambio posterior de producto o unidad no
reinterpreta lineas historicas.

La linea tambien captura `standard_cost_minor_snapshot`, incluido `null`, desde
la variante. Si existe, el costo estandar total usa la misma cantidad,
referencia y redondeo proporcional que el precio; nunca modifica
`sale_items.total_minor`. Cambiar `product_variants.standard_cost_minor` no
reescribe lineas anteriores. El costo real de una entrada fisica permanece en
`inventory_movements.total_cost_minor`.

Para una linea medida, `sale_unit_atomic_factor_snapshot` permite presentar el
entero en la unidad original: `250 / 1000 = 0.25 kg`. El total se reproduce con
`round_half_up(unit_price_minor * measured_quantity_atomic /
price_reference_quantity_atomic_snapshot)` sin consultar la unidad actual.

## Campos recomendados para tablas mutables

- `created_by_user_id`
- `created_by_device_id`
- `created_at_local`
- `created_at_server`
- `updated_by_user_id`
- `updated_by_device_id`
- `updated_at_server`
- `deleted_by_user_id`
- `deleted_at_server`
- `created_event_id`
- `last_event_id`
- `last_server_sequence`

## Campos por tipo de tabla

| Tipo de tabla | Campos de evento recomendados |
|---|---|
| Mutable | `version`, `created_event_id`, `last_event_id`, `last_server_sequence` |
| Cancelable | `version`, `created_event_id`, `canceled_event_id`, `last_event_id`, `last_server_sequence` |
| Append-only | `event_id`, `server_sequence` |

## Regla

Estos campos ayudan a consultar rapido, pero la auditoria completa vive en `events`.

En dispositivos moviles se guardara el ID del evento relacionado, pero la llave foranea hacia `events` no sera estrictamente necesaria. Esto permite purgar eventos locales sincronizados sin romper las tablas de lectura.

En `standalone`, la purga local debe ser mas conservadora porque el dispositivo puede ser la fuente principal de auditoria.

Ver [[05 - Datos/Trazabilidad entre proyecciones y eventos|Trazabilidad entre proyecciones y eventos]].

## Entidades mutables administrativas

Productos, categorias, usuarios, roles, permisos, configuracion y caja deben guardar `version` para detectar cambios concurrentes cuando un dispositivo vuelve de offline.
