# Sesión 6 — Verificación transversal y cierre

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


Prerrequisito: sesiones 0–5 completas. Objetivo: verificar el resultado completo, corregir defectos de este módulo y dejar documentación y preparación de despliegue concretas. No ampliar alcance.

1. Revisa contrato, fixtures, esquema de ambos proyectos y flujo UI completo. Confirma que no quedaron diferencias de nombres, tipos, límites, fechas, clasificación o estados entre consumidores.
2. Ejecuta la matriz de aceptación del plan, prestando atención a standalone, dependencia categoría offline → registro, dinero conservado ante conflicto, reintento, doble toque, eco, segundo dispositivo y página pull fallida.
3. Ejecuta escenario desde UI hasta persistencia y consulta; comprueba que categorías y registros sobreviven reinicio y backup/restauración compatible.
4. Verifica reportes por período/método, límite [inicio, fin), fechas pasadas, precisión y diferencias esperadas entre tablet pendiente y servidor.
5. Verifica que sale_payments/customer_payments no se duplican en financial_entries y que no se ha introducido gestión de caja fuera de alcance.
6. Revisa arquitectura, DI, imports y código sin uso. Elimina placeholders propios y ayudas temporales de implementación. Conserva cambios ajenos.
7. Ejecuta dart analyze, flutter test, generación Drift si procede, npm run build y pruebas backend pertinentes incluyendo PostgreSQL aislado. Distingue HTTP simulado, integración real y pruebas en dispositivo físico; no declares las últimas si no se hicieron.
8. Actualiza documentación de módulo/modelo/eventos/API/patrón donde sea necesario, haciendo cambios focalizados que preserven ediciones previas. Contrato y estado deben reflejar la implementación final.
9. Prepara orden de puesta en marcha: esquema y servidor compatibles → todos los clientes receptores compatibles → habilitar captura. Explica cómo se evita que un cliente viejo encuentre un event_type desconocido. No habilitar solo porque el servidor ya acepta el evento.
10. Documenta política local de desarrollo y datos existentes: schemaVersion/reset, respaldo protegido y lo que falta para preservar instalaciones reales. Nunca pruebes un reset en una base de uso.
11. Entrega lista de archivos/cambios propios, resultados y limitaciones materiales, más el procedimiento de actualización sin ejecutarlo.

Criterio de salida: funcionalidad implementada y verificada dentro del alcance, con evidencia de las pruebas esenciales y sin decisiones pendientes disfrazadas de éxito. Si una verificación esencial no pudo ejecutarse, conserva estado «requiere verificación» y deja pasos precisos para terminarla.

Al terminar, actualiza `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Estado y continuidad.md` con archivos propios, revisión del contrato, pruebas realmente ejecutadas, resultados, límites, estado de habilitación, HEAD/commits o cambios sin commit, y próximo prompt. No marques completa una etapa con su prueba esencial pendiente. Si debes cambiar el contrato, actualiza su revisión y los fixtures/consumidores afectados; no mantengas variantes silenciosas entre Dart y TypeScript. Presenta cualquier pregunta necesaria como lista numerada.

