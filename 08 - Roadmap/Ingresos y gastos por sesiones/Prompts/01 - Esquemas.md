# Sesión 1 — Esquemas SQLite y PostgreSQL

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


Prerrequisito: sesión 0 completa, contrato listo_para_implementar y fixtures disponibles. Si falta, completa únicamente ese prerrequisito documental antes de tocar esquema; no inventes contratos durante una migración.

Objetivo: implementar exclusivamente las estructuras persistentes de financial_categories y financial_entries en ambos proyectos conforme al contrato.

1. NestJS: entidades compatibles con SyncProjectionEntity, registro de entidades y migración según convenciones existentes. Agrega PK/FK, checks e índices definidos; no crear cash_sessions ni cash_movements.
2. Implementa y prueba la migración en una base PostgreSQL temporal aislada, incluyendo esquema existente representativo. Conserva datos anteriores; documenta el comportamiento de downgrade con registros existentes sin prometer que sea no destructivo.
3. No inicies AppModule contra una base de uso para «probar»: synchronize=true puede modificarla. La migración escrita no cuenta como aplicada a instalaciones reales.
4. Flutter: tablas Drift documentadas, CommonFields, registro en AppDatabase y restricciones equivalentes. Aclara el uso no funcional de active en esta primera versión.
5. Respeta AGENTS.md: mantener schemaVersion y usar la política de _resetDatabaseOnStartup de desarrollo, sin agregar onUpgrade por cuenta propia. Prueba con archivos temporales, no con una base real del usuario.
6. La detección de esquema debe reconocer las nuevas tablas y columnas y conservar la base actual en siguientes arranques. Comprueba respaldo restaurado antiguo protegido y respaldo nuevo compatible; no borrar respaldos protegidos.
7. Documenta correspondencias de UUID, bigint, nombres físicos, nullable/defaults y fechas entre SQLite/PostgreSQL. Conserva el contrato JSON acordado.
8. No agregues comandos, UI, endpoints de escritura ni nuevas operaciones de negocio en esta sesión. Las tablas forman una entrega intermedia explícita cuyo consumidor llega en las próximas sesiones.

Verificación: dart run build_runner build, dart analyze, flutter test conforme AGENTS.md; npm run build y pruebas de esquema/migración pertinentes con PostgreSQL real aislado. Inspecciona el diff generado y los datos previos de las pruebas. No reportes una integración PostgreSQL omitida como aprobada.

Criterio de salida: ambos esquemas representan el mismo contrato y compilan; nuevas bases y evolución de desarrollo verificadas. Próximo: Prompt 02 — Servidor.

Al terminar, actualiza `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Estado y continuidad.md` con archivos propios, revisión del contrato, pruebas realmente ejecutadas, resultados, límites, estado de habilitación, HEAD/commits o cambios sin commit, y próximo prompt. No marques completa una etapa con su prueba esencial pendiente. Si debes cambiar el contrato, actualiza su revisión y los fixtures/consumidores afectados; no mantengas variantes silenciosas entre Dart y TypeScript. Presenta cualquier pregunta necesaria como lista numerada.

