# Sesión 2: actualización acotada y lotes atómicos

Implementa la sesión 2 del plan de actualización por CSV, continuando la fase
anterior sin rehacerla. Lee AGENTS y las guías offline de Flutter, además del
[[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|Plan]],
[[08 - Roadmap/Actualizacion de productos por CSV/Estado y continuidad|Estado y continuidad]] y
[[08 - Roadmap/Actualizacion de productos por CSV/Matriz de aceptacion|Matriz de aceptación]].
Inspecciona Git y conserva cambios ajenos.

Agrega un command acotado de edición comercial desde CSV, procesado por
`ProductoCommandService`. Recibe identidad, base confirmada y valores
editables. Relee/valida dentro de la transacción, toma el snapshot completo y
superpone únicamente los campos permitidos. Usa como referencia
`asignarCodigoBarrasVariante`, preservando recetas, proveedores conocidos o
legados, recursos, variantes omitidas, orden y configuración completa de venta.

Reutiliza `ProductoActualizadoPayload`, normalización, dependencias y refs
vigentes. Un producto cambiado genera un evento aunque tenga varias filas.
Una comparación final sin diferencias no emite nada. No reconstruyas
existencias iniciales de un recurso existente ni sustituyas bases confirmadas.

Extiende la ejecución masiva a lotes mixtos de hasta 50 productos ejecutables,
sin contar los omitidos. Usa una transacción exterior real por lote para que
altas y actualizaciones se reviertan juntas. Conserva recursos antes de sus
productos, el camino de altas actual y la publicación de progreso tras commit
o rollback. Un fallo revierte el lote y permite continuar los demás; no crear
reintentos ni commits parciales automáticos.

Verifica SQLite real, no solo mocks: preservación exacta, una actualización
por producto, cero efectos en omitidos, base obsoleta y fallo inyectado después
de proyectar. Cubre C03–C06, C08–C09, C13–C15, C17–C25, C32–C37 y C40 en lo
que corresponda al core. Comprueba refs declaradas/validadas en ambos modos y
persistidas solo en `server_sync`; standalone conserva `not_required` y cero
actividad remota. No promover historial standalone ni agregar contratos nuevos.

Ejecuta `dart analyze` y `flutter test`, revisa limpieza y actualiza continuidad
con evidencia, archivos y próximo paso. La interfaz final y la activación del
recorrido público corresponden a sesión 3; no presentar core probado como
flujo de usuario ya terminado.
