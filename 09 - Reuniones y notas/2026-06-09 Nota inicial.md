---
tipo: nota
fecha: 2026-06-09
estado: activo
---

# 2026-06-09 Nota inicial

Se define una estrategia inicial para un sistema POS/comandas offline-first.

## Decisiones base

- Usar SQLite local en dispositivos.
- Usar servidor propio como autoridad de sincronizacion.
- Sincronizar eventos, no estados completos.
- Usar `server_sequence` como cursor incremental.
- Modelar inventario como movimientos.
- Mantener como objetivo que offline cubra todas las operaciones online salvo imposibilidad externa.

## Pendientes principales

- Definir despliegue del servidor.
- Definir politica de inventario offline.
- Definir manejo de conflictos visibles al usuario.
- Definir tecnologia final de app movil y backend.
- Definir lista final de operaciones que solo pueden quedar como solicitud pendiente offline.

## Enlaces

- [[00 - Inicio/Mapa del vault|Mapa del vault]]
- [[02 - Decisiones/Registro de decisiones|Registro de decisiones]]
- [[07 - Riesgos y pendientes/Pendientes|Pendientes]]
