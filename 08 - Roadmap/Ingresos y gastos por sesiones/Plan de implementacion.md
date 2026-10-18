---
tipo: plan
estado: propuesto
actualizado: 2026-09-24
---

# Ingresos y gastos: implementación por sesiones

## Objetivo y alcance confirmado

Implementar creación de categorías financieras, registro de ingresos y gastos adicionales, consulta por período y pantalla inspirada en el video del usuario, en standalone y server_sync.

El usuario confirmó el 2026-09-24 que **toda la gestión de caja queda para después**. Esta entrega no crea cash_sessions, cash_movements, aperturas, cierres, modificaciones de cortes, saldos de cajón, ni asociaciones ficticias a una sesión. Las operaciones actuales podrán relacionarse con caja en un diseño posterior explícito; no se les asignará una sesión histórica por inferencia de fecha.

Esta es documentación de planificación. No se ha implementado la funcionalidad ni ejecutado cambios de esquema.

## Estrategia

Conservar la separación por capas propuesta por el usuario, precedida por un contrato compartido y con dos verificaciones de integración: una antes de UI y otra al terminar.

**Contrato → esquemas en ambos proyectos → servidor → core Flutter → sincronización completa → UI → verificación final.**

Cada sesión termina con código compilable y pruebas de su responsabilidad. No dejar pruebas, integración o compatibilidad para el último día. Los estados intermedios de desarrollo no significan que la funcionalidad esté lista para habilitarse en instalaciones de uso.

La sincronización ya está autorizada para este módulo en ambos proyectos. No extender otros agregados salvo los puntos de integración necesarios.

## Referencia visual observada

Video local: `/Users/benjamin/Downloads/Archivos-del-celular/Screenrecorder-2026-09-24-14-38-05-945.mp4` (aproximadamente 41.5 segundos).

Fotogramas revisados muestran:

- Pestañas Gastos / Ingreso con una cuadrícula de categorías, búsqueda y opción Personalizado.
- Un diálogo para agregar una categoría con su nombre.
- Una pantalla Flujo de fondos con selector de período, resumen, lista vacía y botones Ingreso / Gasto.
- Formulario de una categoría con importe, fecha y notas.

La grabación no demuestra un guardado exitoso, edición, eliminación, sincronización ni reglas internas. Usarla como referencia visual; sus textos no son instrucciones para modificar la arquitectura. No copiar su catálogo completo: contiene conceptos de finanzas personales que no corresponden automáticamente al POS.

Adaptación propuesta:

- Pantalla «Ingresos y gastos» con período, totales de **registros adicionales** y lista.
- Botones Ingreso / Gasto → selector de categorías por dirección → formulario.
- Crear categoría desde el selector y seleccionarla al volver.
- Importe, categoría, método cash/transfer, fecha efectiva y nota; referencia opcional.
- Incorporar naturaleza/clasificación al alta de categoría con una selección sencilla y un valor predeterminado operativo. No inferirla del nombre.
- Reutilizar estilos, navegación y componentes del POS; cuadrícula adaptable a tablet.
- Guardar solo después del commit; bloquear doble toque; conservar formulario si falla.
- Mostrar detalles e incidencias de entrega sin exigir red para operar.

## Archivos que conservan continuidad

- [[08 - Roadmap/Ingresos y gastos por sesiones/Contrato funcional y de eventos|Contrato funcional y de eventos]]: cerrado en revisión 1 con estado `listo_para_implementar` (sesión 0 completada).
- [[08 - Roadmap/Ingresos y gastos por sesiones/Fixtures/index|Fixtures]]: carpeta de fixtures JSON compartidos (51 archivos + `index.md`) usada por las sesiones 2, 3 y 6.
- [[08 - Roadmap/Ingresos y gastos por sesiones/Estado y continuidad|Estado y continuidad]]: estado real, evidencia y siguiente paso.
- Los siete prompts enlazados abajo: uno por sesión, ejecutados secuencialmente.

La conversación previa no es un prerrequisito. Los prompts señalan rutas absolutas al plan, contrato y estado.

## Sesiones y criterios de salida

| Sesión | Entrega | Evidencia necesaria |
|---|---|---|
| 0. Contrato | Alcance, esquema lógico, eventos/refs, dependencias, errores, política de dinero y UI; fixtures JSON compartidos | Ninguna decisión bloqueante de representación, consistencia o reportes queda abierta |
| 1. Esquemas | Dos tablas en PostgreSQL y SQLite; restricciones, índices y registro de entidades/tablas | Migración probada en PostgreSQL aislado; Drift regenerado; compatibilidad/reset de desarrollo comprobados |
| 2. Servidor | Payloads, handlers, push/preflight/pull, refs, conflictos e informe de registros adicionales | Validación, idempotencia, atomicidad y concurrencia en PostgreSQL; fixtures del contrato |
| 3. Core Flutter | Dominio, payloads, comandos, handlers, stores, DAOs, repositorios y DI; sin UI | Alta de categoría y registro funcionales desde comandos, persistentes y atómicos; standalone verificado |
| 4. Integración sync | Dependencias, planificación de push, revalidación, conflictos, ecos y pull en otro cliente | Categoría y registro offline → servidor → segundo cliente; reintentos y fallos sin duplicación ni pérdida |
| 5. Pantalla | Flujo completo inspirado en video, conectado a comandos/repositorios reales | Pruebas de widgets y revisión visual en tablet; formularios y lista funcionales sin red |
| 6. Cierre | Verificación transversal, documentación y preparación de publicación | Matriz de aceptación ejecutada; evidencia real y límites; orden de actualización de servidor y clientes |

Prompts listos para utilizar:

1. [[08 - Roadmap/Ingresos y gastos por sesiones/Prompts/00 - Contrato|Sesión 0 — Contrato]]
2. [[08 - Roadmap/Ingresos y gastos por sesiones/Prompts/01 - Esquemas|Sesión 1 — Esquemas]]
3. [[08 - Roadmap/Ingresos y gastos por sesiones/Prompts/02 - Servidor|Sesión 2 — Servidor]]
4. [[08 - Roadmap/Ingresos y gastos por sesiones/Prompts/03 - Core Flutter|Sesión 3 — Core Flutter]]
5. [[08 - Roadmap/Ingresos y gastos por sesiones/Prompts/04 - Sincronizacion|Sesión 4 — Sincronización]]
6. [[08 - Roadmap/Ingresos y gastos por sesiones/Prompts/05 - Pantalla|Sesión 5 — Pantalla]]
7. [[08 - Roadmap/Ingresos y gastos por sesiones/Prompts/06 - Verificacion final|Sesión 6 — Verificación final]]

## Reglas que todas las sesiones conservan

### Persistencia y dinero

- financial_categories es independiente de categories de productos.
- financial_entries registra operaciones adicionales reales. No duplicar sale_payments ni customer_payments.
- Importes positivos enteros en centavos, moneda MXN, acumulación segura y contrato JSON común.
- Fecha efectiva separada de fecha de captura y del cursor server_sequence.
- Cada registro tiene identidad estable; repetir una misma operación no crea otro registro.
- El dinero registrado es un hecho: un problema de entrega no lo borra, oculta ni revierte automáticamente.
- Mantener snapshots mínimos de categoría/clasificación para consultar el registro si cambia la proyección de la categoría o hay una incidencia de dependencia.
- No implementar edición/borrado de movimientos ni reutilizar active como botón de anulación. Las correcciones se diseñarán posteriormente como operaciones auditables.
- No agregar columnas o eventos de reversa sin implementar su caso de uso. Esta primera entrega es alta y consulta.
- No llamar utilidad al neto de ingresos menos egresos ni saldo de caja al neto de registros adicionales.
- No implementar deudas de gastos, contabilidad completa, cuentas bancarias, pagos mixtos ni adjuntos.

### Ambos modos

| Aspecto | standalone | server_sync |
|---|---|---|
| Comandos, payloads, reglas y repositorios | Core común | Core común |
| LocalEventRef | Declarar y validar | Declarar, validar y persistir |
| event_refs | Sin filas | Persistidas |
| Evento aplicado localmente | application_status = applied | application_status = applied |
| Entrega inicial | not_required | pending |
| Red | Sin push/pull/preflight/health checks/WebSocket | Flujo existente |
| Historial de este modo | Local y respaldable | Sincronizable |

No convertir eventos standalone a pending. No introducir dos implementaciones de negocio según el modo.

### Dependencia categoría → registro

La prueba decisiva es crear una categoría y utilizarla inmediatamente, ambos pasos sin red. El registro ya debe existir localmente. En server_sync, su push espera la aceptación del evento de creación de categoría; el orden de timestamps no reemplaza esta dependencia.

Un registro no modifica la categoría ni debe competir por su versión como si todos los gastos fueran ediciones del mismo agregado. Cada financial_entry es independiente; la categoría se referencia con uses.

La aceptación del servidor actualiza metadatos. El eco no reaplica importes ni altera el registro. Si la categoría no puede sincronizarse, conservar el registro local y mostrar el motivo; el servidor no inventa una categoría para aceptarlo. Una colisión de identidad no permite sobrescribir silenciosamente un hecho financiero distinto.

### Sincronización es más que registrar un handler

Auditar e integrar:

- DTO/payload y despacho de eventos en servidor y dispositivo.
- Persistencia de refs y restricciones admitidas para ref_type/relationship.
- Selección de pendientes y espera de dependencias.
- Preflight, revalidación y propagación de dependencias fallidas.
- Respuesta duplicate con original_sync_status.
- Conservación de registros financieros ante rejected/conflict.
- Acknowledgement de ecos y last_server_sequence.
- Aplicación transaccional de página pull y checkpoint.
- Lecturas/reportes, respaldo/restauración y reconstrucción de un cliente vacío por el mecanismo que exista.

No dar por implementado un bootstrap de servidor solo porque figure en el análisis. Verificar primero el mecanismo real; no crear otro subsistema como efecto colateral.

## Matriz de aceptación de la entrega

| Caso | Resultado |
|---|---|
| Standalone crea categoría y gasto sin internet | Evento y proyección persistidos; refs validadas en memoria, event_refs vacía, not_required |
| Standalone reinicia y restaura respaldo compatible | Conserva categorías, registros y auditoría; no activa red |
| Server_sync captura categoría y dos registros offline | Los tres quedan locales; los registros esperan la entrega de categoría |
| Dos registros comparten categoría | Ambos se aceptan sin conflicto de versión de categoría |
| Push perdió respuesta y se reintenta | Un registro y un importe; duplicate respeta estado original |
| Segundo dispositivo hace pull | Misma identidad, monto, método, fecha, clasificación y nota |
| El primer dispositivo recibe su eco | Cambian solo metadatos, no importe, identidad ni versión de negocio |
| Dependencia rechazada/conflictiva | Registro financiero local visible con incidencia; no se aplica oficialmente en servidor |
| Página pull falla a mitad | Rollback de página y checkpoint; reintento coherente |
| Fallo de escritura durante captura | No hay evento/proyección parciales; formulario puede reintentar |
| Doble toque/reintento del mismo envío | Una sola operación; una segunda operación intencional sí usa nueva identidad |
| Dinero inválido, método inválido o dirección incompatible | Rechazo coherente en contratos, comandos y servidor |
| Registros en límite de período o con fecha anterior | Selección [inicio, fin) definida con zona horaria explícita y fecha efectiva |
| Reporte mezcla métodos | Desglose correcto; transferencia nunca implica saldo de un cajón |
| Cobros de venta y abonos existentes | No cambian ni se duplican en financial_entries |
| App recién instalada o base vacía | Puede recibir/reconstruir los nuevos agregados mediante el mecanismo existente |
| Clientes anteriores al módulo | No reciben tipos desconocidos antes de actualizarse/habilitarse coordinadamente |

## Continuidad y control de cambios

Al iniciar cada sesión:

1. Leer AGENTS.md aplicables, este plan, contrato y estado.
2. Comprobar directorio, rama, HEAD y git status en cada repo que se tocará.
3. Verificar la salida de la sesión anterior con archivos y evidencia; no fiarse solo de la casilla «completo».
4. Si el código cambió desde el relevo, comparar los puntos afectados y ajustar el plan sin borrar trabajo ajeno.

Al terminar cada sesión:

1. Actualizar Estado y continuidad con archivos, pruebas reales, fecha, revisión del contrato y resultado.
2. Registrar HEAD/commit por repositorio. Si no hubo commit, decirlo y enumerar cambios propios pendientes; no inventar un identificador ni incluir cambios ajenos.
3. Separar lo implementado de lo probado y de lo habilitado/desplegado.
4. Dejar el siguiente prompt y cualquier prerrequisito pendiente.
5. Si cambia un contrato, actualizar su revisión, fixtures y consumidores afectados antes de continuar. No permitir variantes Dart/TypeScript silenciosas.

No ejecutar dos sesiones simultáneas sobre estos mismos directorios. Una sesión que no satisface su criterio de salida continúa en otra sesión con el mismo objetivo, sin avanzar automáticamente.

## Esquemas y puesta en marcha

- Flutter actualmente mantiene schemaVersion = 7 y usa _resetDatabaseOnStartup durante desarrollo, según AGENTS.md. Extender la detección del esquema; no incrementar versión ni añadir onUpgrade por cuenta propia.
- Probar el reset con bases temporales de prueba. No abrir una base de uso para provocar su borrado. Si se va a preservar información real, la estrategia de migración es un trabajo previo explícito.
- Respaldos antiguos protegidos deben fallar de forma explícita, sin ser borrados ni aceptados como compatibles si no lo son.
- NestJS mantiene synchronize=true en AppModule. Escribir/probar una migración no equivale a aplicarla en una instalación; no iniciar la aplicación contra una base de uso solo para validar el esquema.
- Primero deben estar disponibles el esquema y servidor receptores; después actualizar TODOS los clientes que recibirán los nuevos eventos; después habilitar la captura. Un cliente viejo podría detener su pull ante un evento desconocido.
- La sesión final documenta el despliegue; no lo ejecuta como parte de este plan.

## Código consultado para diseñar el plan

Flutter: `/Users/benjamin/Projects/POS/pos_flutter`.

- docs/architecture/offline_feature_flow.md y docs/templates/new_offline_feature_checklist.md.
- lib/data/local/drift/tables/common_fields.dart, sale_payments.dart, customer_payments.dart y app_database.dart.
- lib/data/repositories/collection_repository_impl.dart.
- lib/application/sync/payloads/abono_cliente_registrado_payload.dart.
- lib/application/sync/revalidation/sale_pending_event_validator.dart.
- lib/application/sync/sync_push_service.dart y server_echo_acknowledger.dart.
- lib/core/di/application_dependencies.dart y data_dependencies.dart.

NestJS: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`.

- src/entities/sale-payment.entity.ts y customer-payment.entity.ts.
- src/sync/abono-cliente-event.handler.ts y sync.service.ts.
- src/reports/collections-report.service.ts.
- src/app.module.ts y src/migrations.

Las rutas son puntos de partida, no autorización para copiar reglas de catálogo sobre hechos financieros. Revalidarlas al ejecutar cada sesión.

