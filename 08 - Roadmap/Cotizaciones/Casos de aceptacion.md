---
tipo: casos_aceptacion
estado: historico_revision_2
revision_plan: 2
actualizado: 2026-10-06
---

# Casos de aceptación: cotizaciones guardadas

> **Matriz histórica de revisión 2.** Las expectativas de precio conservado
> quedan reemplazadas para el cambio del 2026-10-06 por
> [[08 - Roadmap/Cotizaciones/Sin precios guardados/Casos de aceptacion|P01–P28 de revisión 3]].
> Conservar esta matriz y su evidencia como historial de lo implementado.

Contrato:
[[08 - Roadmap/Cotizaciones/Plan de implementacion|Plan, revisión 2]].
Esta matriz reemplaza C01–C23 de revisión 1: el documento ahora es persistente
y recuperar sí escribe un borrador, aunque no hace movimientos de venta.

| ID | Caso | Resultado esperado | Evidencia |
|---|---|---|---|
| C01 | Cotizar sin borrador/líneas activas | Deshabilitado; llamada directa rechazada sin escrituras | Widget + SQLite |
| C02 | Guardar piezas y cantidades medidas | Documento completo, suma/rangos correctos, snapshots inmutables e IDs propios | Contrato + SQLite |
| C03 | Origen ajeno, confirmado, revisión o total obsoleto | Rechazo; no documento parcial ni eventos nuevos | SQLite |
| C04 | Reintentar guardar la misma intención | Una cotización y evento; devuelve identidad/fecha originales; contenido diferente rechazado | SQLite |
| C05 | Doble pulsación u otra intención sobre captura ya vinculada | Sin segunda cotización ni asociación ambigua; permite consultar la existente | SQLite + widget |
| C06 | Reiniciar tras guardar | Documento/listado/ticket disponibles con identidad, fecha, precios y líneas originales | SQLite en archivo + UI |
| C07 | Nueva captura/limpiar después de guardar | Elimina solo borrador y sus líneas; cotización queda Disponible y reimprimible | SQLite + widget |
| C08 | Guardar y compartir | Cambian solo documento/evento/refs esperados; sin pagos, deuda, inventario, caja ni reportes de venta | SQLite |
| C09 | Menú Cotizaciones | Cierra drawer y abre nueva pantalla; Recuperables muestra Disponible/En venta; Todas incluye Vendida | Widget |
| C10 | Ver/reimprimir tras editar catálogo o borrar origen | Mismo documento emitido; lectura/PNG no crean eventos | SQLite + PNG |
| C11 | Contenido de ticket | COTIZACIÓN, ID/fecha guardados, MXN, filas, total y leyenda; sin campos de cobro ni costo interno | Modelo + PNG |
| C12 | Muchas líneas/nombres largos/unidades distintas | PNG completo, legible, sin filas truncadas ni sumas incompatibles de cantidades | Inspección visual |
| C13 | Listado vacío/carga/error/regreso | Mensajes y reintento claros; filtros conservados; no escrituras por navegar | Widget |
| C14 | Recuperar repetidamente o con respuesta perdida | Un borrador completo vinculado; reintento continúa ese ID y conserva ediciones | SQLite + widget |
| C15 | Recuperar cotización Disponible con precio de catálogo distinto | Nuevos saleId/lineIds, cantidades y precio cotizado; aviso de precio conservado | SQLite + widget |
| C16 | Receta/vínculo de consumo cambió con modo/unidad compatibles | Usa configuración operativa vigente; no consume al recuperar; confirmación revalida | SQLite |
| C17 | Cambió modo/unidad/factor/referencia de precio | No interpreta medidas con reglas nuevas; rechazo explicado sin perder documento | SQLite + widget |
| C18 | Artículo/variante/unidad ausente o inactivo | Se ve y reimprime cotización; no recuperación parcial, error por línea | SQLite + widget |
| C19 | Existe otro borrador, incluso vacío | No sustituye ni mezcla; usuario puede resolverlo y reintentar | SQLite + widget |
| C20 | Cotización vinculada al borrador activo | Continuar venta abre la Caja existente sin copiar ni sobrescribir | SQLite + navegación |
| C21 | Cobrar directamente el origen cotizado sin limpiarlo | Cotización queda Vendida por vínculo; no se ofrece otra recuperación | SQLite |
| C22 | Limpiar borrador recuperado y recuperar después | Vuelve a Disponible; siguiente recuperación usa nuevas identidades | SQLite |
| C23 | Recuperar cotización ya vendida | Acción ausente y comando rechaza; no segunda venta | SQLite + widget |
| C24 | Venta vinculada con sync pending/conflict/rejected | Sigue Vendida; incidencia no habilita recuperación ni revierte venta | SQLite |
| C25 | Fallo durante guardar/recuperar/limpiar | Rollback de filas, evento, refs y vínculo; sin datos parciales | SQLite con fallo inyectado |
| C26 | Limpieza desde ticket de origen editado o ausente | Revisión distinta rechazada; ausencia es no-op; no borra otra captura | SQLite + widget |
| C27 | Reaplicar eventos antiguos/duplicados | No duplica documentos/líneas ni resucita borrador limpiado o confirmado ni regresa vínculo | Handler + SQLite |
| C28 | Reiniciar con cotización En venta o Vendida | Estado derivado correcto; Continuar conserva captura; Vendida no se recupera | SQLite en archivo |
| C29 | Editar cantidades del borrador recuperado y cobrar | Cambia venta final; cotización/PNG conservan condiciones originales | SQLite + widget |
| C30 | Recuperar recursos directos/por receta y caja sin sesión abierta | Sin movimientos/reservas ni requisito de caja abierta; restricciones de cobro siguen actuales | SQLite |
| C31 | Cobrar recuperación en efectivo/transferencia/crédito | Flujo actual de pago/deuda, inventario y caja, una sola vez; recibos y ventas correctos | Comandos + regresión |
| C32 | Guardar/recuperar/limpiar en standalone | not_required, refs declaradas/validadas sin filas event_refs; sin arranque de sync | SQLite + modo |
| C33 | Guardar/recuperar en server_sync y después cobrar | Cotizaciones locales not_required con refs; solo venta_confirmada es elegible para push; sin dependencia remota de quotation | SQLite + selección de pendientes |
| C34 | Respaldo/restauración del esquema actual | Recupera documentos, líneas, vínculos y eventos; no transforma locales en pending ni hace reset en reinicio siguiente | Respaldo local temporal |
| C35 | Compartir/WhatsApp, cancelar/error/reintentar | Archivo cotizacion-ID.png correcto; documento conservado; misma fecha/ID; no informa entrega por cerrar selector | Widget + plataforma nativa |
| C36 | Acciones pendientes, callbacks tardíos y navegación del menú | Sin dobles rutas/envíos, setState tras dispose ni otro Home; Caja/escaneo/gestión existente sin regresiones | Widget + regresión |

## Evidencia de ausencia de movimientos

Guardar escribe cotización, líneas, evento y refs cuando corresponde. Recuperar
escribe un borrador, sus líneas, evento y vínculo. Estas escrituras son esperadas:
ya no es correcto exigir cero eventos como en revisión 1.

Comparar antes/después contenido relevante y saldos de sale_payments,
credit_sales y proyecciones de crédito, inventory_movements/inventory_balances
y cash_movements. Los tests deben incluir artículos con inventario directo y
por receta para detectar consumo accidental. Confirmar después demuestra que
los movimientos ocurren una vez al cobrar, no al guardar/recuperar.

Comparar también events/event_refs y pendientes: guardado/recuperación deben
seguir not_required en server_sync pese a la conversión por defecto del store.
El cobro no puede depender de entregar un evento quotation inexistente en NestJS.

## Estados, persistencia y trazabilidad

Crear fixtures con origen activo, origen limpiado, recuperación editada,
recuperación limpiada y venta confirmada con incidencia. El repositorio observa
documento y venta; no actualizar el estado con un booleano de UI.

Reaplicar una recuperación histórica después de limpieza no debe reconstruir
esa captura. Mantener el snapshot emitido aunque desaparezca el origen/catalogo.
Probar respaldos y reinicios con archivos temporales del esquema actual.

## Registro de resultados

Registrar por C01–C36: aprobado/fallido/pendiente, comando o archivo de evidencia.
Las pruebas visuales requieren inspección del PNG; bytes válidos no bastan.
El selector nativo requiere una plataforma disponible; fakes no demuestran uso
real de WhatsApp. Si no está disponible, registrar ese tramo pendiente y
separarlo del alcance automatizado completado. Impresión física queda fuera.
