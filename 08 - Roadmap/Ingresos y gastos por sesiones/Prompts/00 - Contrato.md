# Sesión 0 — Cerrar contrato antes de modificar código

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


Objetivo: convertir el borrador revisión 0 en un contrato implementable. Esta sesión solo cambia documentación y fixtures de esta funcionalidad; no modifica código de Flutter/NestJS ni esquemas.

1. Revalida las tablas, handlers y servicios actuales. Usa los archivos de referencia del plan; consulta el video local indicado allí si necesitas precisar el flujo visual. No supongas que el código de documentación antigua sigue vigente.
2. Cierra las propuestas del contrato con decisiones explícitas sobre categorías, dirección/naturaleza, normalización, unicidad, fechas, método, montos, snapshots, auditoría y semántica de consultas. Conserva alta/consulta como alcance y operaciones inmutables. Resuelve decisiones técnicas rutinarias con las recomendaciones existentes; pregunta solo si una decisión de producto material no puede inferirse.
3. Fija el esquema lógico y mapeo físico de dos tablas, restricciones/índices y campos comunes; identifica las consultas reales que justifican cada índice.
4. Define exactamente los dos eventos de alta, sobres, payloads, tipos JSON, errores, refs y dependencia category_event_id. El registro debe poder aplicarse offline y esperar la categoría para su push. Gastos distintos de una misma categoría no modifican la versión de categoría.
5. Especifica idempotencia de la misma intención, reintentos, ecos, conflictos, colisiones, conservación del hecho financiero y protección de FK al limpiar categorías conflictivas. No copiar restauraciones de catálogo que eliminen registros de dinero.
6. Revisa la retención de events y respaldo/restauración para decidir qué auditoría requiere la proyección. Identifica el mecanismo real para inicializar otro cliente; no inventes un bootstrap de servidor.
7. Define puertos/repositorios que consumirá UI y contrato del informe de registros adicionales. Fija límites de período, orden, precisión y diferencias local/central. El informe existente de cobros mantiene su significado.
8. Crea una carpeta Fixtures junto al contrato con sobres/payloads JSON válidos e inválidos y un índice con resultados esperados. Incluye la cadena categoría + dos registros, montos extremos, direcciones inválidas y duplicados. Verifica que todos los archivos JSON sean sintácticamente válidos.
9. Documenta los puntos exactos de integración y orden de actualización de servidor y todos los clientes receptores. No habilitar eventos desconocidos para clientes antiguos.
10. Actualiza el contrato a revisión 1, estado listo_para_implementar, solo si no quedan ambigüedades bloqueantes. Ajusta plan/prompts posteriores si las decisiones cerradas lo requieren.

Criterio de salida: otra sesión puede implementar esquema, backend y Flutter usando el mismo contrato y fixtures, sin inventar nombres, reglas, política de conflictos ni reportes. Próximo: Prompt 01 — Esquemas.

Al terminar, actualiza `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Estado y continuidad.md` con archivos propios, revisión del contrato, pruebas realmente ejecutadas, resultados, límites, estado de habilitación, HEAD/commits o cambios sin commit, y próximo prompt. No marques completa una etapa con su prueba esencial pendiente. Si debes cambiar el contrato, actualiza su revisión y los fixtures/consumidores afectados; no mantengas variantes silenciosas entre Dart y TypeScript. Presenta cualquier pregunta necesaria como lista numerada.

