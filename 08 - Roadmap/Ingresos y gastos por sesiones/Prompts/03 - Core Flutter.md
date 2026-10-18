# Sesión 3 — Dominio, eventos y repositorios Flutter

Trabaja en la implementación de ingresos y gastos adicionales del POS. Esta sesión es parte de un plan secuencial; no depende del historial de otra conversación.

Lee primero:
- `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Plan de implementacion.md`
- `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Contrato funcional y de eventos.md`
- `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Estado y continuidad.md`
- Los AGENTS.md aplicables de cada proyecto que inspecciones o modifiques.

Proyectos:
- Análisis: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ` (el nombre del directorio termina en un espacio).
- Flutter: `/Users/benjamin/Projects/POS/pos_flutter`.
- NestJS: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`.

Alcance confirmado: crear categorías financieras y registrar/consultar ingresos y gastos adicionales, con pantalla y funcionamiento standalone/server_sync. Toda la gestión de caja queda fuera: no cash_sessions, cash_movements, aperturas, cortes ni asociaciones ficticias. No duplicar cobros de ventas o abonos.

Inspecciona rama, HEAD, cambios pendientes y evidencia de la sesión anterior. Conserva cambios ajenos. No uses reset/checkout para volver al HEAD observado en el plan. Trabaja solo en la etapa indicada; no abras tareas nuevas, no delegues y no despliegues.

Reglas comunes: importes enteros en centavos; contratos tipados; comandos → eventos → handlers idempotentes → proyecciones → repositorios; UI sin Drift directo. LocalEventRef se declara y valida en ambos modos, se persiste solo en server_sync; standalone usa not_required y no inicia push/pull/preflight/health checks/WebSocket. No convertir historial standalone en pendiente. Un problema de entrega no borra ni revierte dinero ya registrado.


Prerrequisito: esquemas y backend completos con evidencia; contrato y fixtures coinciden. Trabaja en Flutter y continuidad; no implementes presentation ni UI.

Objetivo: crear categorías y registrar/consultar operaciones desde comandos reales, sin pantalla.

1. Lee docs/architecture/offline_feature_flow.md y docs/templates/new_offline_feature_checklist.md.
2. Implementa modelos, enums y validaciones en domain sin importar Drift. Agrega contratos de repositorios y consultas previstos para listado, detalle, filtros y resumen.
3. Implementa comandos y command services por agregado, con LocalCommandContext. Normaliza entradas antes de crear SyncEvent. Reutiliza una identidad estable para un reintento de la misma captura conforme al contrato.
4. Implementa payloads tipados con fromJson/toJson, constantes y mismas reglas/fixtures que NestJS. Declara refs para agregado principal y categoría en ambos modos.
5. Usa LocalEventStore.appendAndApply y transacciones existentes; eventos/proyecciones/refs aplicables se guardan juntos. No escribir Drift desde comandos ni construir una segunda ruta directa de persistencia.
6. Implementa puertos/DTOs de proyección, handlers idempotentes, stores Drift, DAOs, repositorios y DI. Reutiliza CommonFields/SyncProjection donde corresponda.
7. El alta de categoría y un registro dependiente deben funcionar sin red. El payload conserva dependencia de creación y snapshots; no modificar la versión de categoría al registrar dinero.
8. Conserva consultas de operaciones aplicadas localmente incluso si hay incidencia de entrega. Expone estado/motivo de entrega al consumidor sin convertirlo en estado de dinero.
9. Registra los handlers para aplicación local y recepción por EventProcessor. La integración completa de transporte se verifica en sesión 4; no anunciar server_sync completo todavía.
10. No añadir una ruta visible ni habilitar captura en instalaciones de uso en esta etapa intermedia.

Pruebas: comandos → SQLite real temporal → repositorio, ambos modos para persistencia de refs, standalone sin servicios de red, reinicio, rollback, idempotencia, límite de dinero, textos, fecha, filtro y sumas. Un mock del store por sí solo no verifica atomicidad.
Ejecuta dart run build_runner build si se modificaron tablas/DAOs, dart analyze y flutter test.

Criterio de salida: los comandos permiten crear una categoría y dos registros sin red, se recuperan tras reinicio, standalone usa not_required y no persiste refs. Próximo: Prompt 04 — Sincronización.

Al terminar, actualiza `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Estado y continuidad.md` con archivos propios, revisión del contrato, pruebas realmente ejecutadas, resultados, límites, estado de habilitación, HEAD/commits o cambios sin commit, y próximo prompt. No marques completa una etapa con su prueba esencial pendiente. Si debes cambiar el contrato, actualiza su revisión y los fixtures/consumidores afectados; no mantengas variantes silenciosas entre Dart y TypeScript. Presenta cualquier pregunta necesaria como lista numerada.

