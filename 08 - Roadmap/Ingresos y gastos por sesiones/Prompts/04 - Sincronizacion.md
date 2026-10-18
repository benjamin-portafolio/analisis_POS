# Sesión 4 — Integración completa de sincronización

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


Prerrequisito: sesiones 0–3 completas. Trabaja principalmente en Flutter; permite correcciones acotadas de NestJS si la prueba revela una discrepancia de contrato, documentándola y verificando ambos consumidores. Todavía sin UI.

Objetivo: verificar la ruta completa categoría offline → registro offline → servidor → segundo cliente y eco de confirmación.

1. Audita todos los consumidores por event_type/ref_type: registro, selección de pendientes, planificación de push, dependencias, preflight, revalidación, propagación de conflictos, despacho, acknowledger y DI. No basta con añadir un handler.
2. Usa category_event_id como dependencia causal real. Envía primero el alta de categoría, espera aceptación y después permite los registros; mientras tanto ya están aplicados localmente.
3. Dos registros diferentes que usan la misma categoría deben sincronizarse sin conflicto artificial de versión ni orden entre ellos.
4. Integra eco: actualizar estado/metadatos y last_server_sequence sin reaplicar la operación, duplicar dinero, incrementar versión ni sobreescribir negocio.
5. Rejected/conflict de categoría o registro conserva el hecho financiero local y motivo visible. Prueba limpieza/revalidación de categorías con entradas referenciadas, identidad en colisión y FK; no reutilices restauraciones destructivas de catálogo.
6. Duplicate respeta original_sync_status, incluso para un evento que no fue aceptado. Prueba respuesta perdida, timeout, reinicio y reintento.
7. Aplica página pull y checkpoint atómicamente. Prueba fallo intermedio, reintento y un segundo cliente vacío con el mecanismo de inicialización realmente disponible.
8. Verifica también backup/restauración compatible y que no se transforme historial standalone en pending.
9. Contrasta resumen/detalle local con central para el mismo conjunto aceptado. Explica las diferencias cuando hay pendientes/incidencias.
10. Garantiza que standalone no construye/inicia push, pull, preflight, health checks ni WebSocket. Valida ausencia de invocaciones de red; no basta comprobar que la red está caída.

Prueba esencial: dos instancias/bases SQLite aisladas A/B y un servidor de pruebas conectado a PostgreSQL aislado. A crea categoría + cash + transfer offline, sincroniza; B recibe; A recibe eco. Comprueba IDs, importes, snapshots, notas, fechas, conteos y estados. Si el entorno impide HTTP real entre runtimes, añade pruebas útiles con HTTP simulado pero registra la prueba esencial como pendiente; no la describas como end-to-end real.

Ejecuta dart analyze/flutter test y verificaciones backend de cualquier corrección. No conectes pruebas a bases de uso ni publiques cambios.

Criterio de salida: matriz de sincronización del plan satisfecha antes de conectar la pantalla. Próximo: Prompt 05 — Pantalla.

Al terminar, actualiza `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Estado y continuidad.md` con archivos propios, revisión del contrato, pruebas realmente ejecutadas, resultados, límites, estado de habilitación, HEAD/commits o cambios sin commit, y próximo prompt. No marques completa una etapa con su prueba esencial pendiente. Si debes cambiar el contrato, actualiza su revisión y los fixtures/consumidores afectados; no mantengas variantes silenciosas entre Dart y TypeScript. Presenta cualquier pregunta necesaria como lista numerada.

