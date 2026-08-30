---
tipo: indice
estado: activo
actualizado: 2026-08-26
---

# Mapa del vault

Este vault organiza el analisis del POS offline-first. La idea es que cada decision, pendiente, regla, modo de operacion y flujo quede enlazado desde aqui.

## Lectura recomendada

1. [[01 - Contexto/Objetivo del sistema|Objetivo del sistema]]
2. [[01 - Contexto/Modos de operacion|Modos de operacion]]
3. [[03 - Dominio/Modulos/Modulos|Modulos]]
4. [[03 - Dominio/Modulos/Articulos|Especificacion de Articulos]]
5. [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]]
6. [[04 - Sincronizacion/Vision general|Vision general de sincronizacion]]
7. [[02 - Decisiones/Registro de decisiones|Registro de decisiones]]
8. [[05 - Datos/Modelo de tablas|Modelo de tablas]]
9. [[05 - Datos/Catalogo e inventario|Catalogo e inventario]]
   Este es el único diagrama ER canónico para catálogo e inventario.
10. [[04 - Sincronizacion/Inicializacion de nuevos dispositivos|Inicializacion de nuevos dispositivos]]
11. [[04 - Sincronizacion/Paridad operativa offline|Paridad operativa offline]]
12. [[04 - Sincronizacion/Patron para nuevas funcionalidades offline first|Patron para nuevas funcionalidades offline first]]
13. [[04 - Sincronizacion/Tiempo real con WebSocket|Tiempo real con WebSocket]]
14. [[06 - API/Endpoints sync|Endpoints de sincronizacion]]
15. [[07 - Riesgos y pendientes/Pendientes|Pendientes]]
16. [[08 - Roadmap/MVP|MVP]]

## Secciones

- [[00 - Inicio/Como usar este analisis|Como usar este analisis]]
- [[00 - Inicio/Glosario|Glosario]]
- [[01 - Contexto/Alcance inicial|Alcance inicial]]
- [[01 - Contexto/Modos de operacion|Modos de operacion]]
- [[01 - Contexto/Supuestos y restricciones|Supuestos y restricciones]]
- [[01 - Contexto/Preguntas abiertas|Preguntas abiertas]]
- [[03 - Dominio/Modelo de dominio|Modelo de dominio]]
- [[03 - Dominio/Reglas de negocio|Reglas de negocio]]
- [[03 - Dominio/Modulos/Modulos|Modulos]]
- [[03 - Dominio/Modulos/Categorias|Modulo Categorias]]
- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]]
- [[04 - Sincronizacion/Flujo push pull|Flujo push pull]]
- [[04 - Sincronizacion/Flujo local de comandos y eventos|Flujo local de comandos y eventos]]
- [[04 - Sincronizacion/Patron para nuevas funcionalidades offline first|Patron para nuevas funcionalidades offline first]]
- [[04 - Sincronizacion/Inicializacion de nuevos dispositivos|Inicializacion de nuevos dispositivos]]
- [[04 - Sincronizacion/Paridad operativa offline|Paridad operativa offline]]
- [[04 - Sincronizacion/Prevalidacion de pendientes|Prevalidacion de pendientes]]
- [[04 - Sincronizacion/Tiempo real con WebSocket|Tiempo real con WebSocket]]
- [[04 - Sincronizacion/Protocolo de eventos|Protocolo de eventos]]
- [[04 - Sincronizacion/Resolucion de conflictos|Resolucion de conflictos]]
- [[04 - Sincronizacion/Implementacion de conflictos centralizados|Implementacion de conflictos centralizados]]
- [[05 - Datos/Eventos|Eventos]]
- [[05 - Datos/Crecimiento y retencion de eventos|Crecimiento y retencion de eventos]]
- [[05 - Datos/Tablas de lectura|Tablas de lectura]]
- [[05 - Datos/Catalogo e inventario|Catalogo e inventario]]
- [[05 - Datos/Trazabilidad entre proyecciones y eventos|Trazabilidad entre proyecciones y eventos]]
- [[05 - Datos/Auditoria|Auditoria]]

## Estado del analisis

| Area | Estado | Nota |
|---|---|---|
| Estrategia offline-first | Decidido | [[02 - Decisiones/ADR-0001 Offline first con SQLite local|ADR-0001]] |
| Sincronizacion por eventos | Decidido | [[02 - Decisiones/ADR-0002 Sincronizacion por eventos|ADR-0002]] |
| Cursor de sincronizacion | Decidido | [[02 - Decisiones/ADR-0003 Server sequence como cursor|ADR-0003]] |
| Inventario por movimientos | Decidido | [[02 - Decisiones/ADR-0004 Inventario por movimientos|ADR-0004]] |
| Alta de dispositivos nuevos | Decidido | [[02 - Decisiones/ADR-0005 Bootstrap con snapshot para dispositivos nuevos|ADR-0005]] |
| Trazabilidad de proyecciones | Decidido | [[02 - Decisiones/ADR-0006 Referenciar eventos desde tablas de lectura|ADR-0006]] |
| Paridad operativa offline | Decidido | [[02 - Decisiones/ADR-0007 Paridad operativa offline salvo operaciones imposibles|ADR-0007]] |
| Flujo de reconexion | Decidido | [[02 - Decisiones/ADR-0008 Flujo de sincronizacion con preflight antes de push|ADR-0008]] |
| Flujo local en app movil | Decidido | [[02 - Decisiones/ADR-0009 Command services por agregado y aplicacion compartida de eventos|ADR-0009]] |
| Tiempo real | Decidido | [[02 - Decisiones/ADR-0010 WebSocket como aviso de eventos disponibles|ADR-0010]] |
| Modos de app | Decidido | [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011]] |
| Unidades y cantidades atomicas | Decidido; pendiente de implementar | [[02 - Decisiones/ADR-0012 Cantidades atomicas y unidades por dimension|ADR-0012]] |
| Costo estandar por variante | Decidido; pendiente de implementar | [[02 - Decisiones/ADR-0013 Costo estandar opcional por variante|ADR-0013]] |
| Seguimiento directo de existencias | Decidido e implementado en alta | [[02 - Decisiones/ADR-0014 Seguimiento directo de existencias por variante|ADR-0014]] |
| Crecimiento de eventos | En analisis | [[05 - Datos/Crecimiento y retencion de eventos|Crecimiento y retencion de eventos]] |
| Categorias | Implementado con pendientes identificados | [[03 - Dominio/Modulos/Categorias|Modulo Categorias]] |
| Articulos | Alta sencilla parcial; listado y filtros especificados para implementacion | [[03 - Dominio/Modulos/Articulos|Modulo Articulos]] |
| Productos y variantes | Decidido en Articulos | [[03 - Dominio/Modulos/Articulos|Modulo Articulos]] |
| Catalogo de unidades | Contrato confirmado; pendiente de implementar | [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]] |
| Seguimiento directo de inventario | Decidido; consumo por venta pendiente | [[05 - Datos/Catalogo e inventario|Catalogo e inventario]] |
| Conflictos | Decidido con registro centralizado | [[04 - Sincronizacion/Resolucion de conflictos|Resolucion de conflictos]] |
| API final | Borrador | [[06 - API/Endpoints sync|Endpoints sync]] |
| MVP | Borrador | [[08 - Roadmap/MVP|MVP]] |
