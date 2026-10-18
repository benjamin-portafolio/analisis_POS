---
tipo: ADR
id: ADR-0004
estado: decidido
fecha: 2026-06-09
actualizado: 2026-10-02
---

# ADR-0004 Inventario por movimientos

## Contexto

El inventario cambia por ventas, cancelaciones, entradas, ajustes, devoluciones y mermas. Guardar solo `stock_actual` dificulta auditoria y sincronizacion.

## Decision

El inventario se registrará como movimientos inmutables con
`quantity_delta_atomic`. El stock actual será una proyección materializada en
`inventory_balances`.

## Consecuencias

- Se puede auditar por que cambio el inventario.
- Los recursos y sus movimientos conservan identidad y ciclo de vida
  independientes del catálogo.
- La recuperación del recurso al reactivar seguimiento y el descarte standalone
  de autogenerados sin movimientos se especifican en ADR-0017, pendiente de
  implementación. Nunca se elimina un movimiento para permitir ese descarte;
  saldo cero no equivale a ausencia de historial.
- Una variante puede enlazar opcionalmente un recurso directo conforme a
  ADR-0014. El alta con existencia inicial genera un movimiento físico; el alta
  sin cantidad crea el saldo en cero sin movimiento artificial.
- `inventory_balances` es la proyección materializada para lecturas normales.
  La suma completa de movimientos se usa para auditoría o reconstrucción, no en
  cada consulta de existencias.
- Las cancelaciones generan movimientos compensatorios solo por movimientos
  fisicos originales.
- `quantity_delta` se persiste como entero atomico conforme a ADR-0012. Una
  compensacion reutiliza exactamente el entero original y no repite
  conversiones ni redondeos.
- El movimiento conserva solo el delta; no guarda snapshots de cantidad
  anterior o posterior.
- `initial_balance` es una entrada positiva creada con el recurso;
  `stock_receipt` es una reposición positiva; `manual_adjustment` es una
  corrección positiva o negativa distinta de cero; `reversal` queda reservado
  para compensaciones que referencian al movimiento original.
- `reason` es nullable. Solo `manual_adjustment` lo exige; cualquier valor
  presente se normaliza con NFKC + `trim` y mide entre 1 y 500 caracteres.
- `reversal_of_movement_id` continúa nullable con FK autorreferenciada
  `RESTRICT`, sin autorreferencias. `total_cost_minor` continúa nullable y se
  mantiene en `null` hasta implementar costos reales.
- Los eventos nuevos de alta usan `initial_balance`. Los eventos históricos
  que usaron `manual_adjustment` como existencia inicial se interpretan sin
  cambiar su payload, tipo ni estado de entrega.
- La politica de vender sin stock confirmado queda pendiente.

## Enlaces

- [[05 - Datos/Modelo de tablas|Modelo de tablas]]
- [[02 - Decisiones/ADR-0012 Cantidades atomicas y unidades por dimension|Cantidades atomicas y unidades por dimension]]
- [[02 - Decisiones/ADR-0014 Seguimiento directo de existencias por variante|Seguimiento directo de existencias por variante]]
- [[02 - Decisiones/ADR-0017 Reutilizacion y descarte seguro de recursos de inventario|Reutilización y descarte seguro]]
- [[01 - Contexto/Preguntas abiertas|Preguntas abiertas]]
