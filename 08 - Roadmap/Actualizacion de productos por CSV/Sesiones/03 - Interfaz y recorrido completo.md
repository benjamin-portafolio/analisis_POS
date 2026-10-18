# Sesión 3: revisión, confirmación y recorrido completo

Implementa la sesión 3 del plan de actualización por CSV. Lee AGENTS, guías
offline y el [[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|Plan]],
[[08 - Roadmap/Actualizacion de productos por CSV/Estado y continuidad|Estado y continuidad]] y
[[08 - Roadmap/Actualizacion de productos por CSV/Matriz de aceptacion|Matriz de aceptación]].
Inspecciona Git, conserva cambios ajenos y reutiliza lo terminado en fases 1/2.

Conecta la preparación y los lotes a `BulkImportScreen`, sus modelos de
progreso y DI. Activa la exportación/plantilla/notas de doce columnas junto al
recorrido de importación completo. Conserva carga de archivos anteriores para
altas y no agregues IDs al PDF.

Antes de confirmar, muestra productos nuevos, con cambios, sin cambios y con
errores, distinguiendo cantidades de productos y filas. Ofrece diferencias
actuales/propuestas por producto/campo sin obligar a revisar filas idénticas.
Explica que los IDs se conservan para editar, ambos vacíos son alta, vacíos
editables retiran valores y existencias de existentes son informativas.
Con todo sin cambios, informa el resultado y no habilites una escritura.

Conserva «solo válidos», aplicándola a productos completos en actualizaciones.
Vuelve a preparar antes del diálogo y muestra el reporte actualizado antes de
confirmar. Transporta al command la base que se confirmó; no sustituirla al
guardar si hubo otra edición. Muestra el fallo del lote según su atomicidad.

El progreso separa creados, actualizados, omitidos y fallidos, y avanza solo
después de commit/rollback. Bloquea doble confirmación y muestra los errores
con línea/producto y causa. Revisar y cancelar no deben escribir.

Verifica C01, C26, C28–C32, C37–C38 y el recorrido C29→C05→C37 con repositorios
y persistencia reales donde corresponda. Exporta, modifica algunos campos,
importa y repite el CSV con IDs: la segunda vez debe omitirlos sin eventos.
No generes ajustes de inventario ni elimines variantes omitidas.

Ejecuta `dart analyze` y `flutter test`; registra archivos, casos, resultados y
límites en continuidad. Deja las mediciones comparables y el cierre de la
matriz a sesión 4, sin atribuir tiempos de escritorio a una tablet.
