---
tipo: plan_implementacion
estado: planificado
revision: 1
actualizado: 2026-10-18
---

# Alta y actualización de productos por CSV

## Objetivo y decisiones del usuario

Ampliar la carga masiva para crear productos nuevos, actualizar productos
identificados por ID y omitir los que no tienen cambios. Conservar la rapidez
del alta y el flujo local por comandos, eventos y proyecciones.

El usuario eligió identificar por IDs y solicitó un plan ejecutable en una o
varias sesiones. Esta entrega es documental: no implementa la funcionalidad.

La exportación incluirá `product_id` y `variant_id`. Las filas nuevas llevarán
ambos vacíos; las existentes conservarán los identificadores exportados.
Ni el nombre ni el código de barras sustituirán a los IDs para actualizar.

**Ampliación documental del 2026-10-19:** el usuario definió un máximo futuro de
200 filas y una carga CSV pendiente a la vez en modo servidor, con conexión
recomendada, seguimiento remoto y envío automático por paquetes. El alcance y
las fases están en [[08 - Roadmap/Carga masiva y sincronizacion/Plan de implementacion|Carga masiva y sincronización]].
Esa ampliación no está implementada. Las referencias a 500 filas de esta
revisión y sus evidencias describen el contrato anterior y no se reescriben.

Las reglas de alcance y compatibilidad siguientes son decisiones de diseño
de esta primera entrega. No se atribuyen al usuario decisiones adicionales
sobre inventario, eliminación o sincronización.

## Base real inspeccionada

Código Flutter: `/Users/benjamin/Projects/POS/pos_flutter`, HEAD `e5d9c7b` al
planificar. Existía una modificación ajena en
`lib/presentation/pages/caja/sale_barcode_scanner_screen.dart`; preservarla.
Releer `git status --short` al iniciar cada sesión porque el estado puede cambiar.

| Pieza actual | Archivo relativo a Flutter | Consecuencia |
|---|---|---|
| Contrato CSV | `lib/data/local/export/articulo_catalog_csv.dart` | Diez columnas, una fila por variante; no incluye identidad |
| Validación | `lib/data/local/import/articulo_import_csv.dart` | Encabezado estricto, máximo 500 filas, agrupación por nombre, rechazo de nombres existentes |
| Reporte | `lib/application/import/articulo_catalog_import_service.dart` | Modela altas y errores; no actualizaciones ni omisiones |
| Escritura masiva | `lib/application/import/articulo_import_batch_service.dart` | Lotes de 50 productos mediante `crearArticulosLote` |
| Edición completa | `lib/application/commands/articulos/producto_command_service.dart` | Valida `baseEventId`, conserva identidad y emite `producto_actualizado` |
| Edición acotada | Mismo command service, `asignarCodigoBarrasVariante` | Referencia para modificar campos sobre un snapshot completo sin perder datos ajenos |
| Comparación | `lib/application/sync/payloads/producto_actualizado_payload.dart` | `sameState` compara estado de negocio; no sirve comparar directamente el CSV incompleto con el snapshot |
| Persistencia | `lib/data/local/drift/drift_producto_projection_store.dart` | Actualiza el agregado completo y conserva respaldo para pendientes de `server_sync` |
| Pantalla | `lib/presentation/pages/gestion_inventario/carga_masiva/bulk_import_screen.dart` | Lee `watchArticulos().first`, revisa otra vez antes del diálogo y solo ofrece altas |
| Exportación | `lib/data/local/export/drift_articulo_catalog_export_service.dart` | CSV y PDF comparten lectura, pero son formatos distintos |

La suite actual de importación ya verifica 500 filas con seguimiento, 1000
eventos y diez lotes, ambos modos, y reversión completa de un lote fallido.
Son referencias existentes inspeccionadas, no pruebas ejecutadas en esta
sesión. No se midió tiempo ni memoria en tablet.

## Contrato del archivo

### Dos formatos reconocidos explícitamente

Formato nuevo, en este orden exacto:

```csv
product_id,variant_id,categoria,nombre_articulo,tipo_venta,unidad_venta,nombre_variante,precio_venta,precio_coste,seguimiento_existencias,existencias,codigo_barras
```

1. La exportación y la plantilla nuevas usan doce columnas. La exportación
   llena ambos IDs; los ejemplos de la plantilla los dejan vacíos.
2. El formato actual de diez columnas sigue admitiéndose únicamente para
   altas. Un nombre existente sigue siendo error, sin actualización implícita.
3. Encabezados desconocidos, incompletos, duplicados o desordenados siguen
   siendo errores estructurales. No aceptar columnas arbitrarias.
4. Conservar BOM UTF-8, delimitador, reglas de importes y límite de 500 filas.
   El límite cuenta todas las variantes del archivo, incluidas las omitidas.
5. Actualizar notas de columnas, ejemplos y helpers que dependen de posiciones
   de columnas, incluido el conteo de productos de la plantilla.
6. El PDF sigue siendo una presentación comercial; no agregarle los IDs.

### Identidad y agrupación

| IDs de una fila | Resultado |
|---|---|
| Ambos vacíos | Alta; agrupar sus variantes por nombre con las reglas actuales |
| Ambos informados y activos, con relación correcta | Candidato a actualización del producto indicado |
| Solo uno informado | Error; no inferir el faltante |
| ID inexistente o inactivo | Error; no generar otro ID ni reactivar registros |
| Variante de otro producto | Error de pertenencia |
| `variant_id` repetido en el archivo | Error, aunque las filas sean iguales |

Los IDs son texto opaco: recortar espacios externos y conservar el valor.
No convertirlos a números ni modificar mayúsculas para buscar coincidencias.

Las actualizaciones se agrupan por `product_id`, aunque las filas no sean
contiguas. Nombre, categoría y configuración común deben ser coherentes entre
las filas del mismo ID. Dos IDs distintos nunca se fusionan por nombre.
No introducir una nueva unicidad global de nombres o códigos de barras.
Las altas conservan su protección actual contra nombres ya existentes.

Una fila con IDs vacíos no se une a un grupo con IDs, aunque comparta nombre.
Si el archivo intenta dar de alta el mismo nombre de un producto que actualiza,
reportar esa alta como duplicada; no reinterpretarla como una variante nueva.

## Qué puede actualizar esta primera entrega

| Campo | Producto nuevo | Producto existente |
|---|---|---|
| Nombre del artículo y categoría | Reglas actuales | Modificables; categoría vacía retira la asociación |
| Nombre de la variante | Reglas actuales | Modificable, respetando las invariantes del producto completo |
| Precio de venta | Obligatorio | Modificable; nunca vacío |
| Precio de coste | Opcional | Modificable; vacío significa costo desconocido, no conservar el anterior |
| Código de barras | Opcional | Modificable; vacío retira el código y se conservan ceros iniciales |
| Tipo y unidad de venta | Reglas actuales | Deben coincidir con la configuración existente |
| Seguimiento de existencias | Reglas actuales | Debe coincidir; no activar ni desactivar desde este CSV |
| Existencias | Saldo inicial según reglas actuales | Informativas: no compararlas como cambio ni escribir un saldo |

Para existentes, `existencias` admite vacío o una cantidad sintácticamente
válida; una cantidad inválida sigue siendo un error de archivo. No compararla
contra el saldo vivo: ventas y movimientos posteriores a la exportación no
deben convertir el archivo en una actualización de catálogo. Mostrar esta
regla en pantalla y en las notas, no ignorarla sin informar.

Conservar íntegros los siguientes datos en las actualizaciones:

- Identidad, evento de creación y orden de todas las variantes.
- Variantes omitidas en el archivo: no retirarlas ni reemplazar el conjunto.
- Recursos, saldos, movimientos y memoria de seguimiento de inventario.
- Recetas y proveedores, incluidos precios/fechas y desconocimiento legado.
- Configuración completa de venta, incluida la cantidad atómica de referencia
  del precio que el CSV no representa; no recalcularla al actualizar.

Puede enviarse solo parte de las variantes de un producto. El nombre y la
categoría son campos del producto: cambiarlos afecta al artículo completo.
La validación final debe considerar también las variantes que no están en el
archivo, por ejemplo para detectar un nombre de variante duplicado.
Reordenar filas del CSV no cambia el orden de las variantes existentes.

Quedan fuera agregar o eliminar variantes de un producto existente, eliminar
productos, cambiar recetas/proveedores, ajustar inventario, aumentar el límite
de filas y agregar contratos o infraestructura de servidor. Una variante nueva
de un artículo existente se agrega por el editor actual.

## Detección de cambios y concurrencia

La preparación devuelve cuatro conjuntos: productos nuevos, productos con
cambios, productos sin cambios y errores. Cuenta productos por separado de
filas/variantes para evitar inflar las cifras del reporte.

1. Leer y normalizar el CSV sin escribir en la base. El parser sigue siendo
   puro y no importa Drift ni llama command services.
2. Leer una foto local consistente con IDs, relación producto-variante,
   estado activo, campos comparables y `lastEventId` de cada producto.
   Resolver categorías y unidades una vez. Para altas, leer nombres con una
   consulta ligera en lugar del listado completo con saldos y datos de UI.
3. Construir mapas por ID. Agrupar y validar los cambios sobre el estado final
   del producto, incluyendo variantes omitidas.
4. Comparar valores de negocio normalizados: importes enteros en centavos,
   textos según sus value objects, opcionales vacíos como `null` y categorías
   por ID. `25`, `25.0` y `25.00` representan el mismo importe.
   No convertir todos los textos a minúsculas: cambiar mayúsculas visibles
   puede ser una edición real aunque no cambie la clave de unicidad.
5. Solo los productos con diferencias pasan a escritura. Los omitidos no
   crean eventos, refs, respaldos, versiones ni modificaciones de metadatos.
6. Preparar otra vez antes del diálogo final. Si cambia el conjunto o los
   valores que se mostrarán, actualizar el reporte antes de confirmar.
7. El plan confirmado transporta el `baseEventId` observado. Al guardar, el
   command service vuelve a validar base, actividad y pertenencia dentro de
   la transacción. No sustituir silenciosamente una base confirmada por otra.

Si alguna fila de una actualización contiene un error, se excluye el producto
completo. La opción «solo válidos» importa otros productos válidos; no una
edición parcial accidental del mismo agregado. Conservar la política actual
de selección de filas válidas para altas, sin ampliar ese cambio de alcance.

**Límite del archivo sin revisión exportada:** estos dos IDs identifican el
registro, pero no detectan si un CSV fue editado a partir de una exportación
antigua. La protección de base comienza al preparar la importación. La
confirmación presenta los valores actuales y propuestos antes de aplicarlos.
Agregar una revisión exportada sería una ampliación de contrato futura.

## Diseño técnico y rendimiento

### Lectura y preparación

Agregar una lectura específica de importación mediante un puerto de aplicación
y un adaptador Drift. No cargar el detalle completo de cada fila ni recorrer
todo el catálogo por cada búsqueda. El puerto devolverá DTOs propios, sin
filas generadas de Drift hacia `application` o `presentation`.

Separar parseo/normalización, lectura de catálogo y clasificación. El nombre
exacto de las clases se resuelve al implementar; mantener una clase principal
por archivo. Extender los modelos del reporte y el progreso para distinguir
altas, actualizaciones, omisiones y fallos sin hacer pasar actualizaciones por
la lista de altas actual. Ajustar DI y los dobles de prueba afectados.

Las consultas de detección deben crecer por tablas/grupos de IDs, no por fila.
Las lecturas de snapshots completos y dependencias se reservan para productos
que realmente cambian. Los mapas y comparaciones tienen costo proporcional
al archivo y a las variantes de los productos involucrados.

### Comando acotado y lotes

Agregar una intención de actualización desde CSV en
`application/commands/articulos`, recibida por `ProductoCommandService`.
Debe contener IDs, base esperada y valores editables; no pedir a la UI que
reconstruya recetas, proveedores o recursos.

Tomar como referencia `asignarCodigoBarrasVariante`: leer el snapshot completo,
superponer solo campos permitidos y construir `ProductoActualizadoPayload`
con `before` y `after`. Reutilizar normalización, validadores, resolución de
dependencias, `_updateEvent` y referencias existentes. No reutilizar a ciegas
el command de alta: sus valores por defecto pueden borrar datos omitidos o
intentar crear nuevamente existencias iniciales. Mantener la semántica legada
de proveedores sin promoverla solo por importar otro campo.

Usar `sameState` como comprobación final sobre dos estados completos y
canónicos. Si no hay cambio, no emitir evento. Un producto con varias filas
modificadas genera un único `producto_actualizado`.

Mantener lotes de hasta 50 productos ejecutables, excluyendo los omitidos.
Dar al command service una operación de lote que use la capacidad
transaccional real del event store. Las altas pueden reutilizar la preparación
actual y las actualizaciones el comando acotado dentro de la misma frontera.
Conservar recursos antes de sus productos y no paralelizar escritores SQLite.

Si un lote mixto falla, se revierten altas, actualizaciones, eventos, refs y
respaldos de ese lote. Continúan los siguientes y el reporte identifica el
lote, productos, líneas y causa. No añadir reintentos automáticos ni cambiar
a commits individuales para salvar silenciosamente parte del lote.

El progreso se publica tras confirmar o revertir cada lote. No abrir una
transacción por cada fila ni usar directamente `INSERT/UPDATE` desde la UI.
Mantener el camino de altas puro tan cercano al actual como sea posible.

### Modos y esquema

- Declarar y validar `LocalEventRef` en ambos modos.
- En `standalone`, eventos `not_required`, sin filas en `event_refs` ni
  push, pull, preflight, health checks o WebSocket.
- En `server_sync`, persistir referencias y conservar las dependencias,
  bases pendientes y reversión existentes de `producto_actualizado`.
- No crear eventos para la consulta, la comparación ni las omisiones.
- No convertir historial standalone a pendiente ni reconstruir refs al
  cambiar de modo. Mantener el rechazo actual a editarlo desde `server_sync`
  cuando requiere importación explícita.
- No se prevén tablas, migraciones, dependencias nuevas ni cambios NestJS.
  Si surge una necesidad real de esquema, documentarla y aplicar AGENTS;
  no introducirla como requisito preventivo de esta funcionalidad.

## Sesiones y criterios de salida

Cuatro sesiones secuenciales recomendadas. Pueden ejecutarse en una sola
sesión larga conservando el orden y todos los criterios de salida. No liberar
una versión intermedia que exporte IDs pero todavía trate las actualizaciones
como altas: activar el recorrido público completo en la sesión 3.

| Sesión | Trabajo | Criterio de salida |
|---|---|---|
| [[08 - Roadmap/Actualizacion de productos por CSV/Sesiones/01 - Contrato y deteccion\|1. Contrato y detección]] | Capturar referencia de rendimiento; formatos de diez/doce columnas; lectura específica; clasificación pura; exportación/plantilla/notas preparadas | Casos de identidad, comparación, compatibilidad y conservación de variantes cubiertos; cero escrituras al preparar |
| [[08 - Roadmap/Actualizacion de productos por CSV/Sesiones/02 - Comandos y lotes\|2. Comandos y lotes]] | Actualización acotada, no-op final, base confirmada y lote mixto transaccional | SQLite real: un evento por producto cambiado, omisiones sin efectos, rollback completo y ambos modos correctos |
| [[08 - Roadmap/Actualizacion de productos por CSV/Sesiones/03 - Interfaz y recorrido completo\|3. Interfaz y recorrido completo]] | Activar nueva exportación y carga; resumen/diferencias, confirmación, progreso, errores y revalidación | Exportar → editar → revisar → importar; repetir CSV con IDs no genera otros eventos; CSV anterior sigue dando altas |
| [[08 - Roadmap/Actualizacion de productos por CSV/Sesiones/04 - Verificacion y rendimiento\|4. Verificación y rendimiento]] | Regresión, mediciones comparables, limpieza y evidencia | Matriz resuelta, análisis y tests documentados, comparación contra referencia y límites de dispositivo explícitos |

En cada sesión leer el plan y [[08 - Roadmap/Actualizacion de productos por CSV/Estado y continuidad|Estado y continuidad]],
actualizar avances, registrar archivos/comandos/resultados y dejar el siguiente
paso concreto. Leer AGENTS de ambos proyectos y guías offline de Flutter antes
de implementar. Una sesión posterior continúa el trabajo, no lo reinicia.

## Verificación y presupuesto de rendimiento

La [[08 - Roadmap/Actualizacion de productos por CSV/Matriz de aceptacion|Matriz de aceptación]]
es el criterio funcional. Priorizar pruebas reales de persistencia,
conservación de datos y concurrencia; no limitarse a mocks de métodos llamados.

Antes de cambiar código, medir el importador actual con fixtures aislados de
500 filas, con y sin seguimiento. Registrar revisión, plataforma/modelo, SO,
modo de app, build, tamaño del catálogo inicial y contenido del fixture.
Medir por separado lectura/validación y guardado, con al menos cinco corridas
comparables y la misma política de calentamiento/restauración de la base.
Registrar mediana y rango, consultas, transacciones exteriores y eventos.
Si el entorno permite medir memoria pico, hacerlo; no inventarla si falta.

Después medir estos escenarios en iguales condiciones:

| Escenario de 500 filas | Resultado esperado |
|---|---|
| Todas nuevas, con/sin seguimiento | Misma semántica y lotes del alta actual |
| Todas existentes sin cambios | Cero escrituras de negocio, eventos, refs y respaldos |
| 20 productos existentes modificados, una variante por producto | 20 eventos de actualización; los otros 480 productos omitidos |
| Todos existentes modificados | 500 eventos de actualización y diez lotes; documentar el costo de snapshots y respaldos |
| Mixto de altas/actualizaciones/omisiones | Solo los ejecutables consumen lotes; conteos coherentes |
| Catálogo local mayor que el archivo, por ejemplo 10000 productos | Lectura ligera; sin 500 búsquedas lineales ni detalles de los no involucrados |

Objetivo inicial de ingeniería para altas: mediana total no mayor que 1.20
veces la referencia del mismo dispositivo/build/fixture. Es un presupuesto
propuesto de regresión, no una velocidad medida ni garantía de milisegundos.
Si se excede, localizar el costo y corregir lo atribuible a esta entrega antes
de declarar cumplido ese objetivo. No usar umbrales de tiempo frágiles en CI.

Para los omitidos, la condición verificable es cero escrituras y ausencia de
lecturas completas de historial por fila. No prometer que actualizar 500
productos costará lo mismo que crearlos: son caminos distintos.

Usar primero las pruebas existentes de importación/exportación y comandos,
ampliándolas; agregar pruebas nuevas donde la responsabilidad lo necesite.
En cada sesión con cambios funcionales ejecutar `dart analyze` y `flutter test`
según AGENTS. `build_runner` solo si realmente cambian tablas Drift. Separar
fallos preexistentes de los introducidos; no declarar aprobación global con
pruebas omitidas o no ejecutadas sin identificarlas.

La prueba manual usa base aislada: exportar, modificar algunos valores,
reimportar, verificar identidades/inventario y repetir el mismo archivo. En
tablet medir con una build profile o release y registrar el modelo. Si no hay
dispositivo, cerrar la automatización con esa medición pendiente explícita;
las mediciones de escritorio no acreditan rendimiento de tablet.

## Entrega final

1. Nuevo CSV con IDs y compatibilidad explícita de altas anteriores.
2. Detección de diferencias y omisiones sin efectos de persistencia.
3. Actualización acotada por eventos, con conservación de datos no editados.
4. Lotes mixtos atómicos y reporte comprensible antes/después de importar.
5. Evidencia funcional y de rendimiento, más continuidad actualizada con
   cualquier verificación real pendiente.
