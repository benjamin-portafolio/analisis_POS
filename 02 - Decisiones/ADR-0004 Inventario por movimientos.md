---
tipo: ADR
id: ADR-0004
estado: decidido
fecha: 2026-06-09
actualizado: 2026-08-26
---

# ADR-0004 Inventario por movimientos

## Contexto

El inventario cambia por ventas, cancelaciones, entradas, ajustes, devoluciones y mermas. Guardar solo `stock_actual` dificulta auditoria y sincronizacion.

## Decision

El inventario se registrara como movimientos con `quantity_delta`. El stock actual sera una proyeccion calculada.

## Consecuencias

- Se puede auditar por que cambio el inventario.
- Los recursos y sus movimientos conservan identidad y ciclo de vida
  independientes del catálogo.
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
- La politica de vender sin stock confirmado queda pendiente.

## Enlaces

- [[05 - Datos/Modelo de tablas|Modelo de tablas]]
- [[02 - Decisiones/ADR-0012 Cantidades atomicas y unidades por dimension|Cantidades atomicas y unidades por dimension]]
- [[02 - Decisiones/ADR-0014 Seguimiento directo de existencias por variante|Seguimiento directo de existencias por variante]]
- [[01 - Contexto/Preguntas abiertas|Preguntas abiertas]]
