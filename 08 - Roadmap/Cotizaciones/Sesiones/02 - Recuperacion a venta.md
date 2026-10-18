---
tipo: sesion_implementacion
estado: historico_revision_2
revision_plan: 2
actualizado: 2026-10-06
---

# Sesión 2: recuperación a venta

> Sesión histórica de revisión 2, ya implementada. La modificación nueva se
> ejecuta con
> [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/02 - Core y esquema|la sesión 2 de revisión 3]],
> siguiendo su plan y dependencias. No usar este prompt para conservar precios.

## Objetivo y prerrequisito

Crear o continuar el borrador asociado sin sobrescribir capturas ni cobrar.
Requiere persistencia/guardado y estados de sesión 1.

## Solicitud para ejecutar

```text
Implementa sesión 2, revisión 2, de cotizaciones guardadas.
Flutter: /Users/benjamin/Projects/POS/pos_flutter
Documentación:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Cotizaciones/

Lee AGENTS/guías vigentes, plan/matriz/continuidad y sesiones 1 y 2.
Verifica salida de sesión 1; completa faltantes antes de recuperar.

Implementa RecuperarCotizacionCommand y CotizacionCommandService.recuperar.
Relee cotización/vínculo, propiedad y revisión en una transacción compartida
con borrador y evento. Vendida no admite otra venta. Si existe el borrador
vinculado, devuelve su ID conservando ediciones. Si hay otro borrador activo,
incluso vacío, rechaza sin sobrescribir, mezclar o limpiarlo.

Para Disponible genera saleId y saleItemIds nuevos y estables por intención.
No uses agregar producto en un bucle: conserva precio/cantidad/nombre/unidad
cotizados. Revalida variantes/artículos activos y unidad/mode/factor/referencia
compatibles. Cambio solo de precio no reemplaza el cotizado; expone información
para el aviso de UI. Cambios que reinterpretan medidas o artículos ausentes
rechazan sin escrituras. La cotización permanece legible.

Prepara clave de consumo vigente, sin consumir ni reservar. Confirma después
con VentaCommandService existente, que vuelve a revalidar catálogo. No alteres
su payload ni añadas dependencia remota de quotation.

Crea payload tipado y handler de cotizacion_recuperada, agregado quotation
con base_version de cotización. El evento crea borrador versión 1, líneas y
currentSaleId en una sola transacción. No uses la versión de cotización como
versión inicial de venta. Define refs reales del conjunto y valida ambas
modalidades; clasifica también este evento not_required en server_sync.

Cubre idempotencia por intención/evento, colisiones y reaplicación histórica.
wasCleared y versiones deben impedir resucitar un borrador limpiado, reabrir
una venta confirmada o regresar currentSaleId a una recuperación anterior.
Al limpiar vuelve a Disponible; al cobrar queda Vendida aun con incidencia
de entrega. Solo cambia el vínculo, no el documento emitido.

Prueba SQLite temporal real con origen limpiado, otra captura, continuación,
reinicio, precios cambiados, medidas incompatibles, recurso directo/receta,
rollback, doble recuperación y cobro con métodos existentes. Demuestra que
guardar/recuperar no generan pagos/deuda/consumo/caja. Ejecuta dart analyze
y flutter test y registra evidencia. Sin UI nueva, backend o impresión.
```

## Criterio de salida

Recuperación atómica e idempotente con precios cotizados; continuación de
captura existente sin duplicar; documento inmutable tras editar, limpiar o
vender. Casos C14–C24, C27–C33 probados en su parte de core; navegación y avisos
se integran en sesión 3.
