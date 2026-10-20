---
tipo: indice
estado: activo
actualizado: 2026-10-19
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
17. [[08 - Roadmap/Seguimiento de existencias/Plan de implementacion|Plan de seguimiento de existencias por fases]]
18. [[08 - Roadmap/Escaneo en caja/Plan de implementacion|Plan de escaneo de códigos de barras en Caja]]
19. [[08 - Roadmap/Cotizaciones/Sin precios guardados/Plan de implementacion|Plan de cotizaciones sin precios guardados en cuatro sesiones]]
20. [[08 - Roadmap/Proveedores de productos/Plan de implementacion|Plan de proveedores y precios por variante en varias sesiones]]
21. [[08 - Roadmap/Impresion de tickets/Plan de implementacion|Plan de impresión de tickets Bluetooth en Android, en cuatro sesiones]]
22. [[08 - Roadmap/Escaneo en inventario/Plan de implementacion|Plan de escaneo y asignación de códigos de barras en inventario, en tres sesiones]]
23. [[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|Plan de alta y actualización de productos por CSV con IDs, en cuatro sesiones]]
24. [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Plan de edición masiva y recepción compacta con costo, venta y existencias, en seis sesiones]]
25. [[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion|Plan de alertas de existencias mínimas por variante, en cinco sesiones]]
26. [[08 - Roadmap/Carga masiva y sincronizacion/Plan de implementacion|Plan de carga CSV de hasta 200 filas, seguimiento y sincronización por paquetes]]

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
- [[03 - Dominio/Modulos/Pagos por transferencia y reportes por metodo|Pagos por transferencia y reportes por método]]
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
- [[02 - Decisiones/ADR-0017 Reutilizacion y descarte seguro de recursos de inventario|Recuperación y descarte seguro de inventario]]
- [[08 - Roadmap/Seguimiento de existencias/Contrato funcional y de eventos|Contrato de recuperación y descarte]]
- [[08 - Roadmap/Seguimiento de existencias/Estado y continuidad|Continuidad de la implementación de seguimiento]]

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
| Seguimiento directo de existencias | Decidido e implementado en alta y edición de recursos | [[02 - Decisiones/ADR-0014 Seguimiento directo de existencias por variante|ADR-0014]] |
| Alertas de existencias mínimas por variante | Implementadas; A01–A41 verificados, A42 parcial por hardware físico. Sesión 5: 2567 Flutter incluidas 23 HTTP sin skips, restore/manual macOS | [[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion\|Plan en cinco sesiones]], [[08 - Roadmap/Alertas de existencias minimas/Estado y continuidad\|Continuidad]], [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README\|Verificación final y pendiente físico]] |
| Carga masiva CSV y seguimiento remoto | Plan documentado; implementación pendiente; hasta 200 filas y una carga pendiente a la vez en modo servidor | [[08 - Roadmap/Carga masiva y sincronizacion/Plan de implementacion\|Plan en cuatro fases]] |
| Recuperación y descarte de recursos de seguimiento | Decidido; plan documentado, implementación pendiente | [[08 - Roadmap/Seguimiento de existencias/Plan de implementacion\|Plan en cinco fases]], [[02 - Decisiones/ADR-0017 Reutilizacion y descarte seguro de recursos de inventario\|ADR-0017]] |
| Crecimiento de eventos | En analisis | [[05 - Datos/Crecimiento y retencion de eventos|Crecimiento y retencion de eventos]] |
| Categorias | Implementado con pendientes identificados | [[03 - Dominio/Modulos/Categorias|Modulo Categorias]] |
| Articulos | Alta sencilla parcial; listado y filtros especificados para implementacion | [[03 - Dominio/Modulos/Articulos|Modulo Articulos]] |
| Productos y variantes | Decidido en Articulos | [[03 - Dominio/Modulos/Articulos|Modulo Articulos]] |
| Catalogo de unidades | Contrato confirmado; pendiente de implementar | [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]] |
| Pagos por transferencia y reportes por método | Alcance confirmado; pendiente de implementar | [[03 - Dominio/Modulos/Pagos por transferencia y reportes por metodo|Pagos por transferencia y reportes por método]] |
| Cotizaciones guardadas y recuperables | Revisión 3 verificada/cerrada en alcance local; P01–P28 resueltos con límites WhatsApp, móvil físico/iOS y build universal macOS | [[08 - Roadmap/Cotizaciones/Sin precios guardados/Plan de implementacion\|Plan vigente en cuatro sesiones]], [[08 - Roadmap/Cotizaciones/Sin precios guardados/Estado y continuidad\|Continuidad vigente]], [[08 - Roadmap/Cotizaciones/Estado y continuidad\|Historial de revisión 2]] |
| Impresión local de tickets | Plan documentado; implementación y pruebas físicas pendientes; varios perfiles Bluetooth ESC/POS en Android | [[08 - Roadmap/Impresion de tickets/Plan de implementacion\|Plan en cuatro sesiones]], [[08 - Roadmap/Impresion de tickets/Estado y continuidad\|Continuidad]] |
| Seguimiento directo de inventario | Decidido; consumo por venta pendiente | [[05 - Datos/Catalogo e inventario|Catalogo e inventario]] |
| Conflictos | Decidido con registro centralizado | [[04 - Sincronizacion/Resolucion de conflictos|Resolucion de conflictos]] |
| API final | Borrador | [[06 - API/Endpoints sync|Endpoints sync]] |
| MVP | Borrador | [[08 - Roadmap/MVP|MVP]] |
