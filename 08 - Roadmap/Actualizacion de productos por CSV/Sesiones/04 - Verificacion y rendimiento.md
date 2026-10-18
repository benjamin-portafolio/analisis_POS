# Sesión 4: verificación, rendimiento y cierre

Ejecuta la sesión 4 del plan de actualización por CSV. Lee AGENTS, el
[[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|Plan]],
[[08 - Roadmap/Actualizacion de productos por CSV/Estado y continuidad|Estado y continuidad]] y
[[08 - Roadmap/Actualizacion de productos por CSV/Matriz de aceptacion|Matriz de aceptación]],
además de la evidencia existente. Inspecciona Git y preserva cambios ajenos.

Revisa C01–C44 y completa lo que falte con pruebas significativas. Prioriza
SQLite real para conservación, identidad, no-op, rollback y reapertura.
Comprueba compatibilidad de diez columnas, exportación de doce, variantes
omitidas, recetas/proveedores, saldos intactos y conflicto de base confirmada.
Comprueba refs declaradas en ambos modos y persistencia/entrega por modo.
No contactar un servidor de producción ni instalar infraestructura nueva.

Compara contra el baseline de sesión 1 en el mismo entorno y con fixtures
equivalentes. Ejecuta al menos cinco corridas comparables por escenario del
plan: todo nuevo con/sin seguimiento, todo igual, 20 de 500 modificados, todos
modificados, mezclas y catálogo local mayor. Registra validación, guardado,
mediana/rango, consultas, transacciones exteriores y eventos; memoria pico si
se puede medir. No mezcles modos/builds ni bases acumuladas entre corridas.

Comprueba el presupuesto inicial de altas de 1.20 veces la mediana previa.
Si se excede, identifica y corrige el costo atribuible a este cambio. No usar
tiempos de CI como umbral de corrección. Para los omitidos, acredita cero
escrituras y ausencia de snapshots/historial completos por fila. Registra
por separado el costo legítimo de updates y respaldos de `server_sync`.

Realiza el recorrido manual de exportación/edición/importación/repetición con
datos aislados. Si hay tablet, usa profile/release y registra modelo y SO.
Si no existe baseline real de tablet, no inventes comparación histórica:
registra las mediciones disponibles y el límite o pendiente correspondiente.

Ejecuta `dart analyze` y `flutter test` y revisa imports/helpers, firmas viejas,
textos de «solo altas» y dependencias sin uso. No cambiar esquema, servidor o
funciones ajenas como optimización especulativa.

Guarda evidencia en esta carpeta, actualiza resultados de la matriz y
continuidad, y enlázala desde documentación de Flutter si ayuda a retomar.
Entrega cambios, resultados, rendimiento observado y pendientes reales. No
declarar validación física ni sincronización HTTP que no se hayan ejecutado.
