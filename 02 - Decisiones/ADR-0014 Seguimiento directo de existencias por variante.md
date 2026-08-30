---
tipo: ADR
id: ADR-0014
estado: decidido
fecha: 2026-08-26
actualizado: 2026-08-26
---

# ADR-0014 Seguimiento directo de existencias por variante

## Contexto

El alta avanzada de artículos debe permitir decidir, por variante, si se
controlarán existencias y capturar una existencia inicial. El modelo ya separa
el catálogo vendible de los recursos físicos mediante `inventory_items`,
`inventory_balances` e `inventory_movements`.

Todavía no existe un evento de Ventas que confirme operativamente una línea y
autorice el descuento automático.

## Decisión

- `product_variants.inventory_item_id` es una FK nullable y única hacia
  `inventory_items.inventory_item_id`, con `ON DELETE RESTRICT`.
- `NULL` significa que la variante no controla existencias. No se agrega un
  booleano redundante como `inventory_enabled`.
- Activar el seguimiento durante el alta crea un `inventory_item` y exactamente
  un `inventory_balance`. Si la existencia inicial es mayor que cero, también
  crea un `inventory_movement` de tipo `manual_adjustment`.
- La unidad del recurso debe ser pieza (`count`, factor atómico `1`) para venta
  `unit`. En venta `measured`, debe tener la misma dimensión que la unidad de
  venta.
- Un recurso puede estar vinculado directamente con, como máximo, una variante.
  El recurso mantiene identidad, saldo, historial y ciclo de vida propios.
- Los movimientos son el historial inmutable y auditable. El saldo es una
  proyección materializada: cada comando inserta el movimiento y actualiza el
  único balance dentro de la misma transacción.
- Las lecturas ordinarias consultan `inventory_balances` en O(1). Sumar todos
  los movimientos se reserva para auditoría, reconstrucción o reparación; no
  se hace en cada consulta.
- La creación local es un lote atómico de eventos: primero cada
  `recurso_inventario_creado` y después `producto_creado`. Este último declara
  la dependencia causal `inventory_item` y persiste el vínculo en la variante.
- En `server_sync`, el push espera a que se acepte cada evento de recurso antes
  de enviar el artículo. El servidor elimina `depends_on_event_id` del payload
  canónico, conserva la dependencia por `ref_id` y guarda una referencia
  `inventory_item uses`.
- En `standalone`, los command services declaran las mismas referencias, pero
  `event_refs` no se persiste y los eventos usan `delivery_status =
  not_required`.
- No se genera todavía `sale_consumption`. Cuando Ventas incorpore un evento de
  confirmación, su handler resolverá `product_variants.inventory_item_id`,
  insertará el movimiento negativo y actualizará el balance en una sola
  transacción.

## Consecuencias

- El listado de recursos y las consultas de stock siguen leyendo balances sin
  recorrer el historial.
- La existencia puede verificarse reconstruyendo el saldo como la suma de
  movimientos y comparándolo con `inventory_balances`.
- Desactivar o desvincular una variante no debe borrar el recurso, su balance ni
  sus movimientos. El flujo de edición/desvinculación se especificará cuando se
  implemente edición de artículos.
- Recetas, alertas de stock bajo, bloqueo de ventas sin existencia y reposición
  permanecen fuera de esta característica.

## Referencia canónica

El modelo ER normativo es
[[05 - Datos/Catalogo e inventario|Catálogo e inventario]]. Los diagramas
anteriores incluidos en notas históricas de Artículos no definen el esquema
vigente.

## Enlaces

- [[02 - Decisiones/ADR-0004 Inventario por movimientos|ADR-0004]]
- [[02 - Decisiones/ADR-0012 Cantidades atomicas y unidades por dimension|ADR-0012]]
- [[03 - Dominio/Modulos/Articulos|Módulo Artículos]]
- [[04 - Sincronizacion/Flujo local de comandos y eventos|Flujo local de comandos y eventos]]
