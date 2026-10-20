# Sesión 1: contrato, lectura y borrador

Implementa la sesión 1, sin activar todavía «Edición masiva». Lee AGENTS del
vault y Flutter, `docs/architecture/offline_feature_flow.md`,
`docs/templates/new_offline_feature_checklist.md` y estos documentos:

- [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Plan revisión 1]].
- [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Estado y continuidad|Estado y continuidad]].
- [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Matriz de aceptacion|Matriz M01–M48]].

Relee Git y el estado del CSV. Conserva cambios ajenos. Crea modelos tipados
para conservar o establecer valores comerciales, proveedor efectivo/fecha,
entrada positiva y bases esperadas por producto/recurso. Mantén resultados de
formulario en presentation e intenciones/comandos en aplicación, sin Drift.

Implementa lectura consistente y un borrador compartido por ambas vistas,
indexado por IDs. No hidrates snapshots completos de todo el catálogo para
buscar; usa un puerto/adaptador específico cuando las lecturas existentes no
alcancen. La cantidad pendiente se sustituye al editarla otra vez. El proveedor
global solo predetermina nuevas capturas y no reasigna filas anteriores.

Define importes, vacío/cero, unidades, venta medida, seguimiento directo,
fechas y clasificación de filas sin cambios/errores. Preparar una revisión
no escribe eventos ni reserva ejecuciones. Deja implementada y probada esta
responsabilidad, sin agregar placeholders para el resto de las fases.

Cubre M01–M06, M11, M16, M18, M25 y M03 en la capa correspondiente. Verifica
que cambiar búsqueda/vista no modifique identidad ni intención. No crear aún
tabla de diario, nuevos eventos, pantallas públicas ni cambios NestJS.

Ejecuta `dart analyze` y `flutter test` si cambias código funcional; revisa
limpieza y `git diff --check`. Actualiza continuidad con archivos, evidencia
y resultados. El siguiente paso es la sesión 2; no presentar preparación
probada como capacidad de guardar ya implementada.
