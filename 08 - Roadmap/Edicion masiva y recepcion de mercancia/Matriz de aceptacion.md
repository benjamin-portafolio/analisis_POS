---
tipo: matriz_aceptacion
estado: automatizacion_verificada_fisico_pendiente
revision_plan: 1
actualizado: 2026-10-19
---

# Aceptación: edición masiva y recepción

Referencia: [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Plan revisión 1]].
Resultado de sesión 6: M01–M46 verificados local/remoto, M48 medido en escritorio.
M47 automático verificado; su parte física sigue pendiente. No hay cierre global.
Detalle y archivos por caso: [[08 - Roadmap/Edicion masiva y recepcion de mercancia/Evidencia/2026-10-18-sesion-6/Matriz verificada|Matriz verificada]].
«Sesión» conserva la asignación original, no sustituye la evidencia.

## Contrato y preparación

| ID | Caso y resultado exigido | Sesión | Resultado S6 |
|---|---|---|---|
| M01 | Abrir, buscar, filtrar, editar y preparar revisión: cero eventos, refs, movimientos y escrituras de negocio; no reservar operaciones antes de confirmar | 1, 4 | Aprobado automatizado |
| M02 | Nombres repetidos, variantes del mismo producto y cambio de orden del listado: identificar por IDs y conservar el destino correcto | 1 | Aprobado automatizado |
| M03 | Editar una variante desde ambas vistas: una intención por variante; modificar la entrada sustituye la pendiente, sin sumarla dos veces | 1, 5 | Aprobado automatizado |
| M04 | `20`, `20.0`, `20,00` equivalen según el codec admitido; decimales/rangos inválidos se rechazan sin usar float | 1, 2 | Aprobado automatizado |
| M05 | Costo cero válido, venta cero inválida, costo desconocido sin tocar conservado; borrar importe informado produce error, sin convertirlo en cero/null | 1, 2 | Aprobado automatizado |
| M06 | Entrada vacía/cero no genera movimiento; negativa, exceso de decimales, rango o magnitud no representable se rechazan | 1, 3 | Aprobado automatizado |

## Costo, venta y proveedores

| ID | Caso y resultado exigido | Sesión | Resultado S6 |
|---|---|---|---|
| M07 | Capturar costo con proveedor: estándar y precio de esa pareja se actualizan en el mismo evento del producto | 2 | Aprobado automatizado |
| M08 | Capturar costo sin proveedor: cambia estándar y se conservan todos los precios/fechas de proveedores | 2 | Aprobado automatizado |
| M09 | Cambiar solo venta con proveedor predeterminado seleccionado: no crear/actualizar relaciones, fechas ni costo | 2, 5 | Aprobado automatizado |
| M10 | Cambiar solo entrada: conservar catálogo y precios; no emitir `producto_actualizado` redundante | 3 | Aprobado automatizado |
| M11 | Cambiar proveedor del encabezado después de editar una fila: su intención anterior conserva proveedor; selección global aislada no escribe | 1, 5 | Aprobado automatizado |
| M12 | Cambiar proveedor en el detalle de una fila: crear/actualizar únicamente la pareja elegida y conservar las demás | 2, 5 | Aprobado automatizado |
| M13 | Estándar igual al costo capturado, pero precio del proveedor diferente o pareja inexistente: la intención explícita actualiza la relación, sin tratarla como no-op | 2 | Aprobado automatizado |
| M14 | Precio de pareja idéntico conserva fecha; precio/pareja nuevos usan fecha informada UTC. Reabrir/revisar no modifica fechas | 2 | Aprobado automatizado |
| M15 | Proveedores legados omitidos, conjunto conocido vacío y conjunto poblado: conservar semántica al editar otros campos; incorporación explícita usa transición válida | 2 | Aprobado automatizado |
| M16 | Producto medido: venta/costo/precio de proveedor mantienen referencia común; entrada usa unidad del recurso, con ambas bases visibles | 1, 2, 5 | Aprobado automatizado |

## Inventario y concurrencia

| ID | Caso y resultado exigido | Sesión | Resultado S6 |
|---|---|---|---|
| M17 | Entrada directa: un `stock_receipt` positivo por recurso, cantidad atómica correcta y saldo anterior + delta; `total_cost_minor` permanece null | 3 | Aprobado automatizado |
| M18 | Variante sin seguimiento directo o con receta: entrada deshabilitada con explicación; cambios comerciales siguen disponibles | 1, 5 | Aprobado automatizado |
| M19 | Producto/variante inactivos, inexistentes, ID repetido o pertenencia incorrecta: rechazar antes de escribir | 2, 3 | Aprobado automatizado |
| M20 | Cambio de producto entre revisión y commit: rechazar la operación completa de ese producto y pedir nueva revisión; no sustituir la base | 2, 3 | Aprobado automatizado |
| M21 | Cambian vínculo, actividad, unidad o base del recurso: impedir ingreso al recurso equivocado y conservar intención para revisar | 3 | Aprobado automatizado |
| M22 | Cambia el saldo durante captura/revisión: actualizar previsión y solicitar nueva confirmación; nunca convertir el saldo anterior en un ajuste | 3, 5 | Aprobado automatizado |
| M23 | Edición parcial de variantes: preservar exactamente otras variantes, nombres, orden, barcode, categoría, venta/configuración no editada, recetas, recursos, memoria y proveedores ajenos | 2 | Aprobado automatizado |
| M24 | Varias variantes modificadas del mismo producto: un evento comercial y movimientos solo para recursos con entrada; una operación local por producto | 2, 3 | Aprobado automatizado |
| M25 | Estado final idéntico y sin entrada: cero eventos, versiones, refs, respaldos y reservas nuevas para productos omitidos en la preparación | 1, 2, 3 | Aprobado automatizado |

## Transacción y recuperación

| ID | Caso y resultado exigido | Sesión | Resultado S6 |
|---|---|---|---|
| M26 | Fallo inyectado tras catálogo, tras primer movimiento y antes del registro final: rollback de todas las partes del producto en SQLite real | 3 | Aprobado automatizado |
| M27 | Tres productos, falla el segundo: primero/tercero se confirman, segundo completo se revierte y se identifica; reintentar no repite los otros | 3 | Aprobado automatizado |
| M28 | Doble confirmación/reintento con mismo `operationId` e intención: devolver resultados originales, sin nuevos eventos ni entradas | 3 | Aprobado automatizado |
| M29 | Mismo ID con intención distinta: rechazar reutilización; una nueva recepción explícita obtiene otra identidad | 3 | Aprobado automatizado |
| M30 | Cierre antes del commit y después del commit pero antes de responder: reabrir conserva exactamente cero o una aplicación del producto | 3 | Aprobado automatizado |
| M31 | Diario, eventos y proyecciones comparten transacción/base. Reconstruir resultado al reabrir y consultar estado de entrega actual, sin confundir commit local con aceptación remota | 3, 6 | Aprobado automatizado |
| M32 | Captura confirmada en otro modo: bloquear continuación automática; no convertir eventos/refs ni importar historial standalone | 3, 6 | Aprobado automatizado |
| M33 | Esquema nuevo exige diario en la comprobación de arranque y conserva base/diario al reabrir; esquema anterior sigue reset permitido. Verificar respaldo/restauración vigente y documentar límites tras reset | 3, 6 | Aprobado automatizado |
| M34 | Confirmada pero todavía no ejecutada: reapertura ofrece continuar, no ejecuta al arrancar. Propuesta obsoleta se revisa con nueva identidad y no repite partes aplicadas | 3, 5 | Aprobado automatizado |

## Interfaz y recorrido

| ID | Caso y resultado exigido | Sesión | Resultado S6 |
|---|---|---|---|
| M35 | Búsqueda, «Solo cambios» y cambio de tarea/vista conservan borrador, errores y selección; salir antes de confirmar permite continuar/descartar sin escribir | 4, 5 | Aprobado automatizado |
| M36 | Recepción muestra costo y venta juntos, cantidad/saldo debajo. Venta precargada e independiente: cambiar costo no la altera; cambiar venta se destaca | 5 | Aprobado automatizado |
| M37 | Revisión reúne cambios ocultos por búsqueda/filtro, proveedor efectivo, fecha y unidades, antes/después y suma de entradas; errores requieren corregir o retirar filas explícitamente | 4, 5 | Aprobado automatizado |
| M38 | Teclado numérico, Siguiente, foco estable, nombres largos y respuesta tardía al cerrar: entrada visible, borrador conservado, sin navegación/escritura tardía | 4, 5 | Aprobado automatizado |
| M39 | Menú «Edición masiva» abre ambas vistas y guardado completo solo al finalizar sesión 5; carga CSV y demás accesos conservan su funcionamiento | 5 | Aprobado automatizado |
| M40 | Guardado informa avance tras commit/rollback, bloquea doble toque; cancelar detiene pendientes y conserva aplicados, sin prometer rollback global | 5 | Aprobado automatizado |

## Modos, integración y calidad

| ID | Caso y resultado exigido | Sesión | Resultado S6 |
|---|---|---|---|
| M41 | Standalone: refs declaradas/validadas, `not_required`, cero filas `event_refs` y cero push/pull/preflight/health/WebSocket | 2, 3, 6 | Aprobado automatizado |
| M42 | Server_sync: refs/dependencias vigentes y capability de proveedores; conservar bases pendientes y rechazo de historial standalone sin importación explícita | 2, 3, 6 | Aprobado automatizado |
| M43 | Reintento HTTP tras pérdida de respuesta: mismos eventos, sin invocar nuevamente comandos de recepción y sin duplicar movimientos en servidor/terminal | 6 | Aprobado automatizado |
| M44 | Proveedor creado localmente pendiente y ediciones encadenadas: entregar por dependencias existentes; un servidor sin capability deja pendiente la parte correspondiente, sin degradar payload | 6 | Aprobado automatizado |
| M45 | Catálogo aceptado/entrada rechazada y caso inverso: informar cada parte y usar restauración existente; resolver catálogo no vuelve a sumar una entrada aceptada | 6 | Aprobado automatizado |
| M46 | Dos terminales lógicas: convergencia y conflicto sobre producto/recurso; restauración no borra cambios posteriores y no genera una recepción de reemplazo implícita | 6 | Aprobado automatizado |
| M47 | 320/360/390 px y tablet: controles legibles y accesibles; teclado/foco reales verificados en móvil físico o registrados como pendientes con modelo/build faltantes | 4, 5, 6 | Automático aprobado; **físico pendiente** |
| M48 | Medir catálogos de 1000/10000 variantes y capturas de 20/100/500: carga/filtrado/revisión/guardado, consultas, eventos y transacciones; listado perezoso sin hidratar todo el detalle, regresión y límites documentados | 6 | Medido en escritorio; tablet sin garantía |

## Registro de resultados

Por cada sesión añadir en continuidad: IDs cubiertos, archivo de pruebas,
comandos, revisión y resultado real. Mantener los casos remotos/físicos no
ejecutados como pendientes, aunque pasen mocks o renders. No declarar cierre
global por completar únicamente la interfaz o el camino exitoso local.
