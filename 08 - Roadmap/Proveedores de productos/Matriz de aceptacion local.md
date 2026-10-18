---
tipo: matriz_aceptacion
estado: aceptacion_local_y_remota_satisfecha
revision_plan: 1
actualizado: 2026-10-08
---

# Matriz de aceptación local · fase 5

Fase 5 completa. La matriz vincula los 16 casos esenciales del plan y las comprobaciones complementarias de la solicitud con pruebas ejecutadas. Resultado final: **1567 aprobadas, 0 fallidas y 1 omitida remota**. Las 32 filas de aceptación local están aprobadas; 3 casos remotos y las pruebas físicas están **no ejecutados**. No se usan como equivalentes de los casos locales.

Actualización de fase 7: el cierre local se revalida con 1578 pruebas Flutter,
sin omisiones. A14–A16 ya están aprobados contra NestJS/PostgreSQL real;
[matriz remota](Matriz%20de%20aceptacion%20remota.md) e
[informe de fase 7](Verificacion%20remota%20-%20fase%207.md). V02 continúa sin
pruebas físicas. Los resultados de fase 5 arriba se conservan como historia.

[Resultados y límites](Verificacion%20local%20-%20fase%205.md). Inventario exacto por prueba, archivo y resultado: [casos-ejecutados.json](Evidencia/2026-10-08-fase5/casos-ejecutados.json); relaciones de esta matriz con los IDs de ejecución: [matriz-aceptacion.json](Evidencia/2026-10-08-fase5/matriz-aceptacion.json).

## Casos esenciales y complementarios

| ID | Caso / comprobación | Resultado esperado comprobado | Resultado | Evidencia ejecutada |
|---|---|---|---|---|
| A01 | Crear/editar proveedor offline | Identidad, datos normalizados, metadatos y eventos conservados tras reinicio. | Aprobado | [catalog][catalog], [acceptance][acceptance] |
| A02 | Una variante con dos proveedores | Precios y fechas independientes; cero explícito. | Aprobado | [commands][commands], [ui][ui] |
| A03 | Dos variantes del mismo producto | Listas propias; proveedor compartido; tercera lista explícitamente vacía. | Aprobado | [commands][commands], [acceptance][acceptance] |
| A04 | Proveedor repetido en la variante | Rechazo sin evento ni escrituras parciales. | Aprobado | [commands][commands] |
| A05 | Precio inválido o proveedor inexistente | Errores de dominio/UI/payload; rollback y proyecciones intactas. | Aprobado | [commands][commands], [editor][editor] |
| A06 | Precio cero / vacío | Cero admitido; vacío genera error y conserva el borrador. | Aprobado | [editor][editor] |
| A07 | Cambiar receta, nombre, venta o costo estándar | Conservar listas omitidas y fechas; seguimiento y consumo mantienen su contrato. | Aprobado | [commands][commands], [forms][forms] |
| A08 | Retirar el último proveedor | Guardar [] sin eliminar el catálogo; vacío conocido tras reapertura. | Aprobado | [commands][commands], [ui][ui] |
| A09 | Cancelar selector, variante o artículo | No cambia relaciones/eventos; cancelar alta/edición de proveedor tampoco escribe. | Aprobado | [ui][ui], [catalog][catalog] |
| A10 | Capturar precio de proveedor | Sin cambios a venta/costo, ventas/caja, cotizaciones, saldos o movimientos con datos existentes. | Aprobado | [acceptance][acceptance], [commands][commands] |
| A11 | Replay del mismo evento | No duplica ni incrementa versión; alta/edición de proveedor y producto. | Aprobado | [commands][commands], [supplier][supplier] |
| A12 | Respaldo/restauración compatible | VACUUM INTO, hash, restauración aislada, repositorios, UI y reinicios; poblado y vacío. | Aprobado | [acceptance][acceptance], [backup][backup] |
| A13 | Standalone | Eventos applied/not_required, event_refs=0, pendientes=0 y HttpClient=0; runtime remoto no resuelto. | Aprobado | [di][di], [supplier][supplier], [acceptance][acceptance] |
| B01 | Coma/punto, precisión y fechas informadas | Conversión exacta; cambio conserva fecha informada y precio equivalente conserva instante anterior. | Aprobado | [editor][editor], [commands][commands] |
| B02 | Error al guardar y reintento | Conservar borrador; rollback de artículo/hijos/evento; reintento persiste una vez. | Aprobado | [ui][ui], [catalog][catalog] |
| B03 | Base de edición obsoleta | Rechazar evento/versión/secuencia/before incompatibles sin cambios parciales. | Aprobado | [commands][commands], [supplier][supplier] |
| B04 | Compatibilidad legada | Ausencia distinta de []; no borrado silencioso ni pérdida al reconstruir formularios. | Aprobado | [commands][commands], [forms][forms] |
| B05 | Restauración de proyecciones y borrado existente | Snapshot fallback/DAO, variantes inactivas/añadidas, borrado de artículo y recuperación. | Aprobado | [commands][commands] |
| B06 | Arranques sucesivos del esquema actual | Abrir AppDatabase real dos veces antes y después de restore conserva filas, identidades y marcador. | Aprobado | [acceptance][acceptance], [backup][backup] |
| B07 | Integridad y claves foráneas | integrity_check=ok, foreign_keys=1, foreign_key_check vacío; esquema versión 8. | Aprobado | [acceptance][acceptance] |
| B08 | Respaldo inválido/incompatible | Rechazar SHA, archivo no SQLite, columnas requeridas ausentes, FK huérfana y versiones 7/9 antes del reemplazo. | Aprobado | [acceptance][acceptance], [backup][backup] |
| B09 | Origen y destino aislados | Restaurar solo el destino temporal; cambio posterior del origen permanece intacto. | Aprobado | [acceptance][acceptance] |
| B10 | Referencias por modo | Declarar/validar refs en ambos modos; persistirlas únicamente en server_sync. | Aprobado | [supplier][supplier], [commands][commands] |
| B11 | Nuevos accesos offline en server_sync (fase 7) | Catálogo/comandos/handlers/UI permiten captura; transporte exige capability. | Aprobado | [supplier][supplier], [commands][commands], [editor][editor], [catalog][catalog]; matriz remota S01/S21 |
| B12 | Artículos legados en server_sync | Alta/edición/borrado y refs anteriores mantienen su contrato en SQLite aislado. | Aprobado | [commands][commands] |
| B13 | No promover historial standalone | not_required no se convierte en pending ni inventa dependencia de entrega. | Aprobado | [commands][commands], [acceptance][acceptance] |
| R01 | ARTÍCULOS, CATEGORÍA, RECURSOS y PROVEEDORES | Navegación, carga, consulta, edición y menú mantienen el flujo. | Aprobado | [catalog][catalog], [inventory][inventory] |
| R02 | Artículos y variantes; formularios reconstructores | Identidad/proveedores preservados en alta, edición, modo sencillo y copyWith. | Aprobado | [forms][forms], [ui][ui], [commands][commands] |
| R03 | Recetas y seguimiento directo | Relaciones comerciales independientes; venta consume según receta/vínculo existentes. | Aprobado | [commands][commands], [acceptance][acceptance] |
| R04 | Ventas/Caja y Cotizaciones | Datos no vacíos comparados antes/después; suites preexistentes completas aprobadas. | Aprobado | [acceptance][acceptance] |
| R05 | Importación existente | Alta con [] y conservación del catálogo existente; no nuevo CSV de proveedores. | Aprobado | [commands][commands], [inventory][inventory] |
| V01 | Teléfono/tablet, scroll, teclado y Guardar | Layout sin overflow y Guardar alcanzable: 320×640/740×360 texto 1.3; 1280×800 texto 1.5; insets simulados. | Aprobado | [editor][editor], [catalog][catalog] |
| A14 | Sync: proveedor offline y después utilizado | Alta original confirmada antes de producto; reinicio y refs completos. | Aprobado (fase 7) | Matriz remota S02/S03/S16; HTTP/NestJS/PostgreSQL real |
| A15 | Sync: edición concurrente del precio | Conflicto explícito por producto completo; restauración de receta/precios y secuencias oficiales. | Aprobado (fase 7) | Matriz remota S07/S11/S12; HTTP/NestJS/PostgreSQL real |
| A16 | Sync: edición desde cliente antiguo | Rechazo contra conjunto conocido sin pérdida; ausencia/[] y transición conservadas. | Aprobado (fase 7) | Matriz remota S19/S20; HTTP/NestJS/PostgreSQL real |
| V02 | Pruebas físicas Android/iOS/tablet | No se inició la aplicación ni se probó teclado, tacto o dispositivo físico. No exigidas para este cierre automatizado; permanecen sin ejecución. | **No ejecutado** | Sin ejecución. |

## Evidencia visual reutilizada

Se reutilizan las seis capturas inspeccionadas de fase 4: [README de render](Evidencia/2026-10-08-fase4/README.md). No cambió ningún archivo de presentación en fase 5, por lo que no se repitieron renders. La suite final sí volvió a ejecutar las pruebas de layout, scroll e insets simulados (V01). No equivalen a V02.

## Alcance de las regresiones

Además de los casos señalados, la suite completa ejecutó las pruebas preexistentes de catálogo, seguimiento/recetas, ventas/Caja, Cotizaciones, importación, respaldo, formularios y modos. Los resultados y conteos por archivo están en [resultados-suite.json](Evidencia/2026-10-08-fase5/resultados-suite.json). Edición masiva sigue sin acción implementada; no existe un flujo adicional que validar ni se añadió uno.

## Fallos intermedios y resolución

Las tres pruebas nuevas de respaldo incompatible fallaron antes de la corrección: se aceptaba una columna de variante renombrada y versiones SQLite 7/9. Tras corregir la validación previa al reemplazo, las cinco variantes negativas y las dos restauraciones pasan. Hubo una preparación inválida del fixture (DROP COLUMN limitado por CHECK), dos corridas de widget interrumpidas por apertura diferida en el reloj del test y avisos de analyze por trazas temporales; se corrigieron en las pruebas. Sus logs se conservan, pero no cuentan como aprobación. Ver el registro de [resultados y comandos](Verificacion%20local%20-%20fase%205.md).

## Fuentes de pruebas

[commands]: /Users/benjamin/Projects/POS/pos_flutter/test/application/commands/articulos/product_supplier_relations_test.dart
[supplier]: /Users/benjamin/Projects/POS/pos_flutter/test/application/commands/proveedores/proveedor_command_service_test.dart
[catalog]: /Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/gestion_inventario/proveedores/proveedor_catalog_test.dart
[editor]: /Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/gestion_inventario/articulos/variant_suppliers_editor_test.dart
[ui]: /Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/gestion_inventario/articulos/product_supplier_ui_flow_test.dart
[backup]: /Users/benjamin/Projects/POS/pos_flutter/test/data/local/drift/supplier_backup_test.dart
[acceptance]: /Users/benjamin/Projects/POS/pos_flutter/test/data/local/drift/supplier_local_acceptance_test.dart
[di]: /Users/benjamin/Projects/POS/pos_flutter/test/core/di/proveedor_dependencies_test.dart
[forms]: /Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/gestion_inventario/articulos/product_supplier_forms_test.dart
[inputs]: /Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/gestion_inventario/articulos/proveedor_precio_form_test.dart
[inventory]: /Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart
