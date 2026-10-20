---
tipo: matriz_aceptacion
estado: verificada_local_con_pendientes
revision_plan: 1
actualizado: 2026-10-18
---

# Matriz de aceptación: actualización por CSV

Plan: [[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|Revisión 1]].
Sesión 4: C01–C43 aprobados en su alcance local de escritorio con los tests
re-ejecutados y mediciones de esta sesión. C44 permanece parcial: no hubo tablet
y falló el selector nativo macOS; el resto del recorrido manual se verificó
con un callback explícito al archivo aislado. No se declara cierre físico ni HTTP.

Evidencia completa: [[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Verificacion y cierre|Verificación, comandos, resultados y límites]],
[[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Rendimiento|Rendimiento]] y
[[08 - Roadmap/Actualizacion de productos por CSV/Evidencia/2026-10-18-sesion-4/Recorrido manual|Recorrido manual]].

Claves de evidencia ejecutada (rutas completas y alcance en la nota de
verificación): **P** parser/identidad, **L** lectura SQLite, **C** comandos SQLite,
**B** lotes SQLite, **W** widgets con persistencia real, **E** exportación/CSV/PDF,
**R** reapertura SQLite en disco (ambos modos), **M** 70 muestras de rendimiento.
La suite final: 2191 aprobadas, cero fallos y 10 integraciones HTTP omitidas;
las omitidas no se consideran aprobadas.

| Caso | Entrada o condición | Resultado esperado | Sesión | Estado sesión 4 | Evidencia ejecutada |
|---|---|---|---|---|---|
| C01 | CSV actual de diez columnas, nombres nuevos | Mismas altas, normalización e inventario inicial actuales | 1–3 | Aprobado local | P, B, E, W |
| C02 | CSV anterior con nombre existente | Error; no actualizar por nombre | 1 | Aprobado local | P, W |
| C03 | CSV nuevo con ambos IDs vacíos | Alta con IDs generados por command service | 1–2 | Aprobado local | P, B |
| C04 | Producto y variante existentes sin cambios | Omitido; cero eventos/refs/undo y mismos metadatos | 1–2 | Aprobado local | P, L, C, B |
| C05 | Cambio de precio, costo o barcode | Una actualización del producto; barcode textual con ceros | 1–2 | Aprobado local | P, C, W, R |
| C06 | Cambiar nombres del producto y variante | Mismos IDs y evento de creación; nombre nuevo persistido | 1–2 | Aprobado local | P, C, R |
| C07 | Solo un ID informado | Error; no inferir ni crear | 1 | Aprobado local | P |
| C08 | ID desconocido, producto o variante inactivos | Error; no reactivar ni crear reemplazo | 1–2 | Aprobado local | P, L, C |
| C09 | Variante de otro producto | Error de pertenencia, también al guardar | 1–2 | Aprobado local | P, L, C |
| C10 | `variant_id` repetido, filas iguales o distintas | Error del producto completo; no elegir la primera | 1 | Aprobado local | P, C |
| C11 | Varias filas del mismo producto con campos comunes contradictorios | Error del producto completo | 1 | Aprobado local | P |
| C12 | Dos IDs de producto distintos con el mismo nombre | Nunca fusionar; aplicar las reglas de negocio existentes | 1 | Aprobado local | P |
| C13 | Una variante del producto incluida y otras omitidas | Actualizar la incluida y conservar todas las omitidas | 1–2 | Aprobado local | P, C, W, R |
| C14 | Nombre de variante colisiona con otra omitida | Error por invariante del agregado completo | 1–2 | Aprobado local | P, C |
| C15 | Filas existentes en distinto orden, o cambio de precio en varias variantes | Conservar `sort_order`; un evento por producto | 1–2 | Aprobado local | P, C |
| C16 | `25`, `25.0`, `25.00`, textos equivalentes por NFKC/trim | Sin cambio si el valor canónico es el mismo | 1 | Aprobado local | P, C |
| C17 | Cambio solo de mayúsculas visibles del nombre | Comparación por valor normalizado visible; no descartarlo por `nameKey` | 1–2 | Aprobado local | P, C |
| C18 | Categoría, costo y barcode vacíos en actualización | Retirar categoría/barcode y costo desconocido; no conservarlos implícitamente | 1–2 | Aprobado local | P, C, W |
| C19 | Cambiar tipo/unidad de venta o seguimiento | Error; no reinterpretar inventario | 1–2 | Aprobado local | P, C |
| C20 | Venta medida con referencia atómica no expresada en CSV | Conservar referencia exacta al actualizar otros campos | 1–2 | Aprobado local | P, C, R (referencia histórica 250) |
| C21 | Saldos actuales diferentes de los exportados | No contar como cambio; no movimientos ni cambios de balance | 1–2 | Aprobado local | P, C, W, R |
| C22 | Existencias vacías en existente; cantidad inválida | Vacío admitido; inválida reportada; nunca escribir saldo | 1 | Aprobado local | P |
| C23 | Producto con receta, recurso, memoria y proveedores con fechas | Preservar valores e identidades exactos al cambiar precio/nombre | 2 | Aprobado local | C, W, R |
| C24 | Proveedores legados desconocidos frente a conjunto conocido vacío | Conservar la semántica de ambos estados | 2 | Aprobado local | C |
| C25 | Dos variantes comparten barcode | Mantener política actual; no imponer unicidad ni transferir código | 1–2 | Aprobado local | P, C |
| C26 | Una fila inválida en actualización de varias variantes; solo válidos activo | Excluir producto completo y permitir otros válidos | 1–3 | Aprobado local | P, W |
| C27 | Alta y actualización del mismo nombre con/sin IDs | No fusionar; alta duplicada reportada | 1 | Aprobado local | P |
| C28 | Encabezado incompleto/desconocido/desordenado/duplicado; 501 filas | Error estructural; cero aplicación | 1–3 | Aprobado local | P, L, W |
| C29 | Exportar catálogo y plantilla nuevos | Doce columnas correctas; IDs reales solo en catálogo; notas coherentes; PDF sin IDs | 1–3 | Aprobado local | E, W, manual parcial |
| C30 | Revisar archivo, abrir diálogo y cancelar | Cero eventos, proyecciones, refs y respaldos nuevos | 3 | Aprobado local | L, W, manual (todas las tablas) |
| C31 | Cambio del catálogo entre revisión y diálogo | Mostrar revisión actual antes de confirmar | 3 | Aprobado local | W |
| C32 | Cambio del producto después de confirmar y antes del guardado | Rechazar base obsoleta, sin rebasar silenciosamente; lote revertido | 2–3 | Aprobado local | C, B, W |
| C33 | Lote mixto con error inyectado después de proyectar un cambio | Rollback de todo el lote, incluidos eventos/refs/undo; otros lotes continúan | 2 | Aprobado local | B, W, R |
| C34 | Alta sin IDs y actualización de existente en `standalone` | Refs declaradas/validadas; cero `event_refs`; eventos `not_required`; sin actividad remota | 2–4 | Aprobado local | C, B, W, R; monitor remoto no resuelto |
| C35 | Mismas operaciones en `server_sync` | Eventos pendientes y refs/dependencias correctas; recuperación ante conflicto conservada | 2–4 | Aprobado local | C, B, W, R; HTTP omitido |
| C36 | Historial standalone observado al cambiar a `server_sync` | No promover eventos ni reconstruir refs; conservar rechazo de edición que exige importación explícita | 2–4 | Aprobado local | C; sin promoción de eventos ni refs |
| C37 | Confirmar dos veces, o volver a importar el CSV con IDs ya aplicado | Sin doble ejecución ni otro evento para mismos valores | 2–3 | Aprobado local | C, B, W, R, manual |
| C38 | Archivo con todo sin cambios | Resumen «sin cambios»; cero lotes ejecutables y sin botón de escritura habilitado | 3 | Aprobado local | B, W, M, manual |
| C39 | 500 altas con y sin seguimiento | Semántica y diez lotes del baseline; objetivo de rendimiento documentado | 4 | Aprobado local | M; 10 lotes, 500/1000 eventos, presupuesto standalone |
| C40 | 500 existentes, solo 20 productos cambiados | 20 eventos; resto omitido; conteos de productos/filas correctos | 2–4 | Aprobado local | B, M; 20 eventos y 480 omitidos |
| C41 | 500 existentes sin cambios con catálogo local mayor | Lecturas por conjunto; cero escritura; no leer historial completo por fila | 4 | Aprobado local | L, M; 10000 productos/variantes, 6 SELECT, cero historial/escritura |
| C42 | Todos cambiados y mezclas de altas/actualizaciones/omisiones | Medir por separado detección/guardado y documentar diferencias de costo | 4 | Aprobado local | M; 500 cambios y seis lotes realmente mixtos |
| C43 | SQLite cerrado y abierto después de importar | IDs, datos, inventario y estado de entrega persistidos correctamente | 4 | Aprobado local | R, manual; igualdad completa después de reabrir |
| C44 | Tablet, archivo compartido/editado y reimportado | Recorrido manual, build/modelo y mediciones reales registrados, o pendiente explícito | 4 | Parcial / pendiente físico | Manual parcial con archivo aislado; selector macOS fallido; tablet no ejecutada |

Las afirmaciones de conservación y rollback se comprueban contra SQLite real.
Comparar datos y cantidades de eventos, refs, movimientos y respaldos antes y
después; verificar también el estado del producto y variantes omitidas.
Para modos, probar refs declaradas mediante un store que las observe y refs
persistidas mediante la base: cero filas no prueba por sí solo declaración.

Las mediciones y resultados reales están en `Evidencia/2026-10-18-sesion-4/`,
con revisión, fixtures, entorno, comandos y límites. Solo las altas standalone
se comparan con el baseline histórico equivalente; falta baseline de tablet y
de server_sync. Se mantienen pendientes C44 y las diez integraciones HTTP.
El fallo nativo de selector macOS no se disfraza como prueba aprobada.
