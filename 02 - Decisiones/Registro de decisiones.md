---
tipo: indice_decisiones
estado: activo
actualizado: 2026-10-02
---

# Registro de decisiones

| ID | Decision | Estado | Fecha | Consecuencia |
|---|---|---|---|---|
| ADR-0001 | [[02 - Decisiones/ADR-0001 Offline first con SQLite local|Offline first con SQLite local]] | decidido | 2026-06-09 | Cada dispositivo puede operar sin conexion |
| ADR-0002 | [[02 - Decisiones/ADR-0002 Sincronizacion por eventos|Sincronizacion por eventos]] | decidido | 2026-06-09 | La sincronizacion usa eventos inmutables |
| ADR-0003 | [[02 - Decisiones/ADR-0003 Server sequence como cursor|Server sequence como cursor]] | decidido | 2026-06-09 | El orden oficial lo asigna el servidor |
| ADR-0004 | [[02 - Decisiones/ADR-0004 Inventario por movimientos|Inventario por movimientos]] | decidido | 2026-06-09 | Movimientos auditables y balance materializado para lectura rápida |
| ADR-0005 | [[02 - Decisiones/ADR-0005 Bootstrap con snapshot para dispositivos nuevos|Bootstrap con snapshot para dispositivos nuevos]] | decidido | 2026-06-09 | Un dispositivo nuevo no reproduce todo el historial |
| ADR-0006 | [[02 - Decisiones/ADR-0006 Referenciar eventos desde tablas de lectura|Referenciar eventos desde tablas de lectura]] | decidido | 2026-06-09 | Las proyecciones conocen que evento las creo o modifico |
| ADR-0007 | [[02 - Decisiones/ADR-0007 Paridad operativa offline salvo operaciones imposibles|Paridad operativa offline salvo operaciones imposibles]] | decidido | 2026-06-10 | Todo comando online debe poder registrarse offline salvo imposibilidad fisica o externa |
| ADR-0008 | [[02 - Decisiones/ADR-0008 Flujo de sincronizacion con preflight antes de push|Flujo de sincronizacion con preflight antes de push]] | decidido | 2026-06-14 | La reconexion prevalida pendientes antes de subirlos |
| ADR-0009 | [[02 - Decisiones/ADR-0009 Command services por agregado y aplicacion compartida de eventos|Command services por agregado y aplicacion compartida de eventos]] | decidido | 2026-06-21 | La UI solicita comandos y los eventos se aplican por handlers reutilizables |
| ADR-0010 | [[02 - Decisiones/ADR-0010 WebSocket como aviso de eventos disponibles|WebSocket como aviso de eventos disponibles]] | decidido | 2026-06-23 | El tiempo real dispara pull sin transportar la verdad historica |
| ADR-0011 | [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|Dos modos de app sobre el mismo core offline first]] | decidido | 2026-07-08 | La app puede compilarse/configurarse como standalone o con sincronizacion de servidor |
| ADR-0012 | [[02 - Decisiones/ADR-0012 Cantidades atomicas y unidades por dimension|Cantidades atomicas y unidades por dimension]] | decidido | 2026-08-19 | Inventario y ventas medidas persisten enteros con escala propia por dimension |
| ADR-0013 | [[02 - Decisiones/ADR-0013 Costo estandar opcional por variante|Costo estandar opcional por variante]] | decidido | 2026-08-24 | La variante separa precio de venta, costo de referencia e inversion real de inventario |
| ADR-0014 | [[02 - Decisiones/ADR-0014 Seguimiento directo de existencias por variante\|Seguimiento directo de existencias por variante]] | parcialmente reemplazado por ADR-0017 | 2026-08-26 | Una variante enlaza un recurso único; ADR-0017 añade recuperación y descarte vacío standalone |
| ADR-0015 | [[02 - Decisiones/ADR-0015 Corte de caja siempre habilitado|Corte de caja siempre habilitado]] | parcialmente reemplazado | 2026-09-26 | Sin bandera de compilación; la habilitación por instalación la sustituye (ADR-0016) |
| ADR-0016 | [[02 - Decisiones/ADR-0016 Habilitacion de caja por instalacion|Habilitacion de caja por instalacion]] | decidido, implementado | 2026-09-26 | `AppConfig.cashEnabled` persistente en `pos_flutter`, con interruptor en instalación y ajustes; el servidor no lo valida |
| ADR-0017 | [[02 - Decisiones/ADR-0017 Reutilizacion y descarte seguro de recursos de inventario\|Reutilización y descarte seguro de recursos de inventario]] | decidido, pendiente de implementar | 2026-10-02 | Recuperar recurso previo; descarte solo de autogenerados vacíos standalone; conservar recurso/balance server_sync para ventas tardías |

## Decisiones pendientes candidatas

- Politica de ventas offline cuando no hay stock confirmado.
- Estrategia concreta de despliegue del servidor para modo `server_sync`.
- Manejo de impresion offline.
- Estrategia de autenticacion local.
- Politica de retencion de eventos.
- Politica de compactacion o archivado de eventos antiguos.
- Lista final de operaciones realmente imposibles offline.
- Politica de retencion, compatibilidad de versiones y recuperacion ante
  respaldos corruptos en modo `standalone`; Google Drive y su obligatoriedad
  inicial ya estan definidos.
