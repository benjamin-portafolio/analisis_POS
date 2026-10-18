# Sesión 1: contrato CSV y detección de diferencias

Implementa la sesión 1 del plan de actualización de productos por CSV.

Lee primero el `AGENTS.md` del vault y de `/Users/benjamin/Projects/POS/pos_flutter`,
las guías `docs/architecture/offline_feature_flow.md` y
`docs/templates/new_offline_feature_checklist.md`, y estas notas del vault:

- [[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|Plan vigente]].
- [[08 - Roadmap/Actualizacion de productos por CSV/Estado y continuidad|Estado y continuidad]].
- [[08 - Roadmap/Actualizacion de productos por CSV/Matriz de aceptacion|Matriz de aceptación]].

Antes de editar, inspecciona el estado Git y preserva cambios ajenos. Captura
una referencia reproducible del alta actual con 500 filas, con y sin seguimiento,
en datos aislados. Registra revisión, fixtures, entorno y separación entre
validación y guardado. Si no hay tablet, registra la referencia disponible y
deja explícitamente pendiente la comparación en dispositivo.

Implementa lectura/normalización de formatos de diez y doce columnas,
identidad por producto y variante, lectura local específica y clasificación
en nuevos, con cambios, sin cambios y errores. Mantén el parser puro. Las
actualizaciones se agrupan por ID y las altas por la regla actual de nombre.
No resolver IDs por nombre/barcode ni generar identidad durante la revisión.

Implementa las reglas de campos editables, vacíos, configuración e inventario
del plan. Considera todas las variantes existentes para validar la edición,
conserva las omitidas y no conviertas el orden de filas en `sort_order` nuevo.
Los errores de actualización excluyen el producto completo.

Prepara exportación, plantilla y notas de doce columnas, incluidos sus
conteos/helpers. Conserva el PDF. Coordina la activación pública con sesión 3:
ninguna actualización debe terminar en `crearArticulosLote` por compatibilidad
accidental. No publicar una versión parcial del recorrido.

Amplía los tests existentes para C01–C22, C25–C29 según correspondan a lectura,
comparación y contrato. Acredita cero escrituras al preparar. No agregues
comandos de guardado en esta fase ni cambios de esquema o servidor.

Ejecuta `dart analyze` y `flutter test` por AGENTS y registra los resultados.
Actualiza continuidad con archivos, referencia de rendimiento, casos resueltos
y trabajo concreto para sesión 2. No marcar como verificada la persistencia
de actualizaciones hasta implementar y probar la siguiente etapa.
