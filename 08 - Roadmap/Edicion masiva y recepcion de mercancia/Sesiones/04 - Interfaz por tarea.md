# Sesión 4: interfaz por tarea

Continúa el core de sesiones 1–3. Lee AGENTS/guías offline y el
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Plan]],
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Estado y continuidad|Estado]] y
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Matriz de aceptacion|Matriz]].
Revisa Git y preserva cambios ajenos. El acceso público se completa en sesión 5.

Implementa pantalla y controlador con selección de tarea: venta, costo/proveedor
y agregar existencias. Usa el borrador compartido por ID y el coordinador
existente. Separa listado, fila, detalle de proveedor, revisión y resultados
según responsabilidades; no concentrar todo en InventoryManagementScreen.

Incorpora búsqueda, «Solo cambios», contador, diferencias textuales y detalle
con proveedor/fecha de la fila. Conservar cambios al filtrar y al volver de
revisión. Campo sin tocar conserva; validar vacío/cero de acuerdo con el plan.
La entrada no está disponible para receta/ausencia de seguimiento directo.

Cuida listado perezoso y foco: controles numéricos, acción Siguiente, campo
visible con teclado y acción de revisión accesible. Mostrar revisión de todo
el borrador, no solo del filtro actual. Salir sin confirmar permite continuar
o descartar; guardar usa exclusivamente comandos, nunca Drift desde UI.

Cubre M01, M35, M37–M38 y la parte por tarea de M47, además de regresión de
los casos de core afectados. Prueba búsqueda y nombres largos a 320/360/390 px,
entradas inválidas, base obsoleta y cierres con respuestas asíncronas tardías.
Mantén la navegación interna comprobable en tests; no habilites aún el callback
público de una funcionalidad que debe incluir la otra vista.

Ejecuta `dart analyze`, `flutter test`, `git diff --check` y limpieza. Actualiza
continuidad con evidencia y límites físicos. La sesión 5 añade recepción
compacta reutilizando este controlador/revisión y habilita el recorrido entero.
