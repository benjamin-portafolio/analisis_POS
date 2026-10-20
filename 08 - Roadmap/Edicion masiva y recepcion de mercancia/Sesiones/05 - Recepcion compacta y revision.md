# Sesión 5: recepción compacta y recorrido completo

Continúa las sesiones 1–4. Lee AGENTS/guías offline y el
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Plan]],
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Estado y continuidad|Estado]] y
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Matriz de aceptacion|Matriz]].
Revisa Git; preserva CSV, escaneo y otros trabajos ajenos.

Añade la composición de recepción compacta: costo estándar y precio de venta
juntos, existencias y cantidad a agregar debajo. Proveedor predeterminado
fuera de las filas y excepciones por fila en detalle. Venta precargada e
independiente; modificar costo no la recalcula. Mostrar la referencia correcta
en productos medidos y la unidad real de ingreso, sin conversiones de empaques.

Ambas vistas usan el mismo borrador, comandos y revisión. Cambiar de vista o
filtrar conserva capturas, errores y foco apropiado. No duplicar lógica de
persistencia ni volver a sumar una cantidad por visitarla desde otra vista.

Completa confirmación, progreso, errores por producto y recuperación del
diario. Cancelar detiene productos no iniciados y espera la transacción en
curso; mostrar qué quedó aplicado. Reintentar solo operaciones elegibles y
devolver las ya aplicadas. Para una base obsoleta, mantener lo escrito y pedir
otra revisión, nunca rebasar automáticamente una entrada.

Habilita «Edición masiva» desde el menú cuando funcionen ambas vistas y el
guardado completo. Presenta estado local y remoto por separado usando los
mecanismos vigentes; no inventar que una captura fue aceptada en conjunto.
No agregar margen, compras, escaneo ni cambios al servidor.

Cubre M03, M09, M11–M12, M16, M18, M22, M34–M40 y la parte compacta de M47.
Comprueba edición conjunta → revisión → guardado → resultado → recuperación,
incluyendo parte ya aplicada y fallos, con persistencia real cuando corresponde.

Ejecuta `dart analyze`, `flutter test`, `git diff --check`, limpieza y registro
de evidencia/continuidad. No declarar pruebas físicas o remotas aprobadas por
widget tests. La sesión 6 completa integración, mediciones y cierre.
