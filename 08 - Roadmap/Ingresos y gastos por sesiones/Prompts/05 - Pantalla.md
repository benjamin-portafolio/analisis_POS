# Sesión 5 — Pantalla de categorías e ingresos/gastos

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


Prerrequisito: contrato, persistencia, backend, core y sincronización completos. La UI utiliza las APIs públicas acordadas; si falta una regla de dominio, implementa la corrección en su capa con pruebas, no dentro del widget.

Objetivo: flujo usable inspirado en el video del usuario y adaptado al POS.

Video: `/Users/benjamin/Downloads/Archivos-del-celular/Screenrecorder-2026-09-24-14-38-05-945.mp4`.
Revisa sus pantallas mediante las herramientas disponibles. No infieras guardado, reglas contables o funciones no mostradas.

1. Conecta «Ingresos y gastos» a la navegación existente usando el estilo visual actual.
2. Muestra selector de período, totales de registros adicionales y lista reactiva. Indica el alcance de los totales: no son utilidad ni saldo de caja.
3. Botones Ingreso / Gasto abren selector con categorías de su dirección, cuadrícula adaptable y búsqueda. Estado vacío invita a crear categoría.
4. Permite crear categoría desde el selector con nombre y clasificación sencilla según contrato; guardar por comando real y seleccionarla al regresar. No crear categorías solo en memoria del formulario.
5. Formulario de registro: categoría, importe, fecha efectiva, método cash/transfer, nota y referencia opcionales. Prefill y conversión de fecha/dinero respetan el contrato; no usar double para persistir.
6. Guardar después del commit local; deshabilitar envío mientras corre; reintentar la misma intención sin duplicación; conservar valores ante error; cancelar no registra dinero.
7. Detalle muestra clasificación, monto, fecha, método, nota, referencia y trazabilidad/estado de entrega. Un problema de sincronización no hace desaparecer el registro.
8. Listas y totales se actualizan al guardar y al recibir pull. Toda lectura pasa por repositorios y modelos de dominio; widgets no importan tablas Drift.
9. Separa pantalla coordinadora, selector, formulario, tarjetas y modelos de formulario por responsabilidades. Reutiliza componentes comunes en lugar de copiar estructura visual ajena al proyecto.
10. Sin pantalla/botones de caja, cortes, edición/borrado de movimientos, contabilidad, adjuntos ni pagos mixtos. No copiar todo el catálogo de ejemplo del video.

Pruebas: creación de categoría desde captura, selección automática, formulario inválido, éxito, doble toque, fallo/reintento conservando campos, cancelación, vacío, filtros, detalle y actualización reactiva. Verifica uso standalone sin red y server_sync offline con estado pendiente.

Ejecuta dart analyze y flutter test. Revisa visualmente la pantalla en un entorno Flutter disponible, con resolución de tablet y teclado; registra la herramienta/dispositivo usado y cualquier revisión visual no ejecutada.

Criterio de salida: usuario recorre categoría → ingreso/gasto → lista/detalle sin internet y sin inconsistencias con la sincronización ya probada. Próximo: Prompt 06 — Verificación final.

Al terminar, actualiza `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Ingresos y gastos por sesiones/Estado y continuidad.md` con archivos propios, revisión del contrato, pruebas realmente ejecutadas, resultados, límites, estado de habilitación, HEAD/commits o cambios sin commit, y próximo prompt. No marques completa una etapa con su prueba esencial pendiente. Si debes cambiar el contrato, actualiza su revisión y los fixtures/consumidores afectados; no mantengas variantes silenciosas entre Dart y TypeScript. Presenta cualquier pregunta necesaria como lista numerada.

