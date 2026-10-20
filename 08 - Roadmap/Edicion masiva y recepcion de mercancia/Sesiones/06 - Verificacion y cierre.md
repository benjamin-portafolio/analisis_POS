# Sesión 6: verificación, rendimiento y cierre

Continúa desde la sesión 5 sin rehacer funcionalidad. Lee AGENTS de los tres
proyectos, el [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Plan]],
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Estado y continuidad|Estado]] y
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Matriz de aceptacion|Matriz]].
Revisa Git y conserva otros trabajos. Resuelve casos pendientes con evidencia.

Verifica M01–M48: no-op, conservación, fechas, unidades, entradas, conflictos,
rollback, modos, diario y cierre/reapertura. Usa SQLite real y el arnés remoto
existente con HTTP/PostgreSQL aislados y dos terminales lógicas. No acceder a
bases del usuario ni desplegar. No añadir otro protocolo ni código funcional
de servidor sin revisar el alcance si aparece una necesidad real.

Para M43–M46 prueba pérdida de respuesta/reenvío de eventos, proveedor/base
pendientes, capability ausente y ambos sentidos de aceptación parcial de
catálogo/entrada. Resolver un precio en conflicto no debe repetir una entrada
aceptada. Standalone conserva not_required, refs no persistidas y cero
actividad de transporte; no promover historial al cambiar modo.

Mide catálogos de 1000/10000 variantes y capturas de 20/100/500: carga,
filtrado, revisión y guardado por separado, consultas, eventos, transacciones,
mediana/rango de cinco corridas comparables. Registra equipo/build y costo de
la tabla de diario; corrige regresiones atribuibles a esta entrega. No usar
resultados de escritorio como garantía de tablet.

Comprueba 320/360/390 px y tablet, accesibilidad, teclado, foco, Siguiente y
nombres largos. En móvil físico registra modelo/SO/build, prueba sin red y
cierre/reapertura con base conservada. Si falta equipo, documenta claramente
la prueba física pendiente y deja automatización y verificación física con
estados distintos; no inventar aprobación.

Ejecuta `dart analyze`, `flutter test`, `git diff --check` y checks pertinentes
del arnés modificado; build_runner solo si cambió Drift. Limpia código sin uso
y conserva logs/mediciones sintéticos en Evidencia, no datos del usuario.
Actualiza continuidad con matriz resuelta, comandos/resultados, límites y
próximo paso concreto. Declara cierre completo solo si los criterios están
cumplidos; informa por separado cualquier validación real pendiente.
