---
tipo: ADR
id: ADR-0001
estado: decidido
fecha: 2026-06-09
---

# ADR-0001 Offline first con SQLite local

## Contexto

Los dispositivos moviles deben poder registrar ventas y comandas aunque no tengan internet. La disponibilidad del negocio no debe depender de la conexion.

## Decision

Cada dispositivo tendra una base local SQLite con eventos, tablas de lectura y estado de sincronizacion.

## Consecuencias

- La app puede operar offline.
- Se requiere resolver sincronizacion, conflictos e idempotencia.
- El servidor deja de ser el unico punto necesario para capturar una venta.
- La app movil debe incluir logica local de aplicacion de eventos.

## Alternativas consideradas

- Solo servidor en linea: descartado porque falla sin internet.
- Sincronizacion directa entre dispositivos: descartado para MVP por complejidad.
- Servicio externo tipo BaaS: descartado por restriccion de no depender de servicios externos de paga.

## Enlaces

- [[04 - Sincronizacion/Operacion offline|Operacion offline]]
- [[05 - Datos/Modelo de tablas|Modelo de tablas]]

