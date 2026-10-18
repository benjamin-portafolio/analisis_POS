---
tipo: api
estado: borrador
actualizado: 2026-08-29
---

# Payloads ejemplo

Estos payloads describen eventos del core offline-first. En modo `server_sync` viajan por la API de sincronizacion; en modo `standalone` quedan en SQLite y pueden incluirse en respaldos.

## espacio_creado

```json
{
  "event_type": "espacio_creado",
  "aggregate_type": "espacio",
  "aggregate_id": "espacio_01J...",
  "payload": {
    "nombre": "Terraza",
    "identificacion": "terraza",
    "visibilidad": 0
  }
}
```

Referencias recomendadas:

```text
ref espacio espacio_01J... affects
ref espacio_identificacion terraza requires_unique
```

## categoria_creada

```json
{
  "event_type": "categoria_creada",
  "aggregate_type": "category",
  "aggregate_id": "cat_01J...",
  "payload": {
    "name": "Bebidas",
    "color_key": "cyan",
    "sort_order": 0
  }
}
```

`name` es obligatorio pero no unico. `sort_order` es un entero requerido. La
app propone la siguiente posicion local y el servidor asigna la posicion
oficial al final de la lista dentro de la misma transaccion que acepta el
evento. Cuando el usuario no elige color, `color_key` usa `neutral`.

Referencia recomendada:

```text
ref category cat_01J... affects
```

## categoria_movida

```json
{
  "event_type": "categoria_movida",
  "aggregate_type": "category",
  "aggregate_id": "cat_bebidas",
  "base_server_sequence": 9184,
  "base_version": 2,
  "payload": {
    "base_event_id": "evt_base_bebidas",
    "changed_fields": ["sort_order"],
    "changes": {
      "sort_order": {
        "from": 1,
        "to": 0
      }
    },
    "displaced_category": {
      "category_id": "cat_alimentos",
      "base_event_id": "evt_base_alimentos",
      "base_version": 4,
      "base_server_sequence": 9183,
      "sort_order": {
        "from": 0,
        "to": 1
      }
    }
  }
}
```

El movimiento siempre intercambia dos posiciones consecutivas. El servidor
serializa los cambios del orden completo, bloquea ambas categorias y registra
un conflicto si alguna posicion oficial ya no coincide con su valor `from`.

Referencias requeridas:

```text
ref category cat_bebidas affects
ref category cat_alimentos affects
```

## categoria_actualizada

```json
{
  "event_type": "categoria_actualizada",
  "aggregate_type": "category",
  "aggregate_id": "cat_01J...",
  "base_server_sequence": 9184,
  "base_version": 2,
  "payload": {
    "base_event_id": "evt_01J...",
    "changed_fields": ["name", "color_key"],
    "changes": {
      "name": {
        "from": "Bebidas",
        "to": "Bebidas frías"
      },
      "color_key": {
        "from": "cyan",
        "to": "blue"
      }
    }
  }
}
```

El servidor acepta el evento si la categoria existe y ninguna columna
declarada fue modificada desde la base conocida. Los cambios oficiales sobre
otras columnas se fusionan.

Referencia recomendada:

```text
ref category cat_01J... affects
```

## venta_creada

```json
{
  "event_type": "venta_creada",
  "aggregate_type": "sale",
  "aggregate_id": "sale_01J...",
  "payload": {
    "sale_id": "sale_01J...",
    "table_name": "Mesa 4",
    "customer_name": "Mesa 4"
  }
}
```

## producto_agregado

```json
{
  "event_type": "producto_agregado",
  "aggregate_type": "sale",
  "aggregate_id": "sale_01J...",
  "payload": {
    "sale_item_id": "item_01J...",
    "product_id": "prod_001",
    "quantity": 2,
    "unit_price": 120,
    "notes": "Sin cebolla"
  }
}
```

## pago_registrado

```json
{
  "event_type": "pago_registrado",
  "aggregate_type": "sale",
  "aggregate_id": "sale_01J...",
  "payload": {
    "payment_id": "pay_01J...",
    "method": "efectivo",
    "amount": 240,
    "currency": "MXN",
    "reference": null
  }
}
```

## venta_cerrada

```json
{
  "event_type": "venta_cerrada",
  "aggregate_type": "sale",
  "aggregate_id": "sale_01J...",
  "payload": {
    "sale_id": "sale_01J...",
    "closed_reason": "paid"
  }
}
```

## recurso_inventario_creado

Las altas nuevas usan `initial_balance` positivo. `reason` puede ser `null` y
no se rellena con un texto artificial. Si no existe cantidad inicial,
`initial_movement` es `null`. El lector también acepta el formato histórico
con `movement_type = manual_adjustment` sin reescribirlo.

```json
{
  "inventory_item": {
    "inventory_item_id": "20000000-0000-4000-8000-000000000001",
    "name": "Harina",
    "default_unit_id": "10000000-0000-4000-8000-000000000003"
  },
  "initial_movement": {
    "movement_id": "30000000-0000-4000-8000-000000000001",
    "movement_type": "initial_balance",
    "quantity_delta_atomic": 250,
    "reason": null,
    "reversal_of_movement_id": null,
    "total_cost_minor": null
  }
}
```

## recurso_inventario_actualizado

La unidad no es un campo mutable. El payload contiene únicamente el cambio de
nombre y la base causal.

```json
{
  "base_event_id": "40000000-0000-4000-8000-000000000001",
  "changed_fields": ["name"],
  "changes": {
    "name": {
      "from": "Harina",
      "to": "Harina integral"
    }
  }
}
```

## movimiento_inventario_registrado

Una reposición ordinaria positiva no exige motivo:

```json
{
  "base_event_id": "40000000-0000-4000-8000-000000000002",
  "movement": {
    "movement_id": "30000000-0000-4000-8000-000000000002",
    "movement_type": "stock_receipt",
    "quantity_delta_atomic": 500,
    "reason": null,
    "reversal_of_movement_id": null,
    "total_cost_minor": null
  }
}
```

Una corrección manual usa la misma forma, admite signo positivo o negativo y
exige `reason`. `reversal` queda reservado: exige
`reversal_of_movement_id`, mientras los demás tipos lo mantienen nulo.
`total_cost_minor` permanece nulo hasta implementar valuación. El payload no
transporta cantidad anterior ni posterior; el saldo se consulta en
`inventory_balances`.

## producto_creado

SKU, codigo de barras, precio de venta y costo estandar opcional pertenecen a
la variante. La configuracion comun de venta (`sale_mode`, `sale_unit_id`,
`price_reference_quantity_atomic`) pertenece al producto. La creacion debe
conservar atomicamente el invariante de producto con al menos una variante y
admitir `category_id = null`.

`standard_cost_minor` se serializa explicitamente como entero no negativo o
`null` conforme a ADR-0013. No sustituye el costo real de un movimiento de
inventario.

Las cantidades de venta medida llegan ya convertidas a enteros atomicos
conforme a ADR-0012. Un valor capturado como `0.25 kg` se serializa como `250`
con atomo gramo; no se envia `0.25` como numero JSON.

La forma canonica confirmada vive en
[[03 - Dominio/Modulos/Articulos|Articulos, payload producto_creado]].
Transporta el producto con su configuracion de venta, todas sus variantes
iniciales y las dependencias de categoría, unidad y recursos directos.

Una variante con seguimiento incluye `inventory_item_id`. Debe existir una
dependencia `inventory_item` con el mismo ID. Durante el alta offline,
`depends_on_event_id` apunta al `recurso_inventario_creado` generado antes; el
servidor lo valida y lo retira del payload canónico aceptado, conservando
`ref_type` y `ref_id`.

```json
{
  "product": {
    "name": "Agua mineral",
    "category_id": null,
    "sale_configuration": { "mode": "unit" }
  },
  "variants": [
    {
      "variant_id": "00000000-0000-4000-8000-000000000001",
      "name": null,
      "sku": null,
      "barcode": null,
      "sale_price_minor": 2500,
      "standard_cost_minor": null,
      "inventory_item_id": "00000000-0000-4000-8000-000000000010",
      "sort_order": 0
    }
  ],
  "dependencies": [
    {
      "ref_type": "inventory_item",
      "ref_id": "00000000-0000-4000-8000-000000000010",
      "depends_on_event_id": "00000000-0000-4000-8000-000000000011"
    }
  ]
}
```

Si la variante no controla existencias, omite `inventory_item_id` y no declara
la dependencia. No se transportan `inventory_enabled`, receta ni componentes.

## producto_actualizado

El contrato canonico confirmado vive en
[[03 - Dominio/Modulos/Articulos|Articulos, payload producto_actualizado]].
Un guardado genera un solo change-set atomico con cambios de producto,
variantes y las bases de cada entidad interna. Modo/unidad de venta son cambios
del producto; precio, costo estandar, SKU y codigo nunca se
interpretan como columnas planas de `products`.

## Especificaciones modulares relacionadas

- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[03 - Dominio/Modulos/Categorias|Modulo Categorias]]
