---
tipo: sesion_implementacion
estado: historico_revision_2
revision_plan: 2
actualizado: 2026-10-06
---

# Sesión 1: persistencia y guardado

> Sesión histórica de revisión 2, ya implementada. Para modificar cotizaciones
> sin guardar precios, ejecutar
> [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/01 - Contrato y preparacion|la sesión 1 de revisión 3]]
> y su plan vigente. No usar este prompt para la modificación nueva.

## Objetivo

Guardar un documento independiente del borrador, con contratos tipados y
eventos exclusivamente locales. Crear esquema, consultas y limpieza segura.

## Solicitud para ejecutar

```text
Implementa sesión 1, revisión 2, de cotizaciones guardadas.
Flutter: /Users/benjamin/Projects/POS/pos_flutter
Documentación:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Cotizaciones/

Lee AGENTS/guías offline vigentes y Plan de implementacion.md,
Casos de aceptacion.md, Estado y continuidad.md y esta sesión. Usa revisión 2;
preserva cambios previos de escaneo. No implementes el plan temporal anterior.

Crea dominio de cotización/líneas, quotations y quotation_items con CommonFields,
campos documentados, snapshots inmutables y vínculos sin FK a un borrador que
se limpia físicamente. Añade índice de listado y unicidad de currentSaleId
no nulo según el plan. Implementa puerto, DAO, repositorio observable y DI.
El repositorio deriva Disponible/En venta/Vendida consultando la venta vinculada.

Implementa cotizacion_guardada con payload tipado, handler idempotente y
CotizacionCommandService.guardar. Valida origen, propiedad, revisión, total,
líneas y rangos bajo transacción. Usa identidad/fecha estables por intención,
IDs propios de documento/líneas y snapshots capturados; no precios de catálogo.
Guardar vincula el origen todavía activo para detectar su cobro directo.
Otra intención sobre esa captura no crea otra cotización ni reescribe la guardada.

Declara/valida LocalEventRef en ambos modos y persiste solo en server_sync.
Añade clasificación explícita de cotizacion_guardada como evento local
not_required en DriftLocalEventStore; registra handler en EventProcessor.
No basta asignar not_required en el comando. No añade pendientes ni backend.

Añade expectedDraftEventId opcional al comando de limpiar y valida revisión
dentro de su transacción. La limpieza no elimina documento/líneas de cotización.
Conserva no-op, propiedad, rollback e idempotencia actuales.

Regenera Drift con dart run build_runner build. Mantén schemaVersion fijo
y política de desarrollo según AGENTS; no añadas onUpgrade. Trabaja con bases
temporales y documenta reset/compatibilidad. Audita respaldo y detección de
esquema para incluir cotizaciones actuales sin perderlas en reinicio.

Prueba SQLite real: guardar/reintentar/colisión/rollback, precios medidos,
cotización durable, limpieza con revisión, origen ausente, documento intacto
y estados derivados al confirmar/limpiar. Demuestra ausencia de movimientos.
Ejecuta dart analyze y flutter test. Actualiza continuidad con evidencia.
Sin UI nueva, recuperación todavía, sync de cotizaciones, impresión o NestJS.
```

## Criterio de salida

Documento y líneas durables, separados de ventas; guardar no mueve dinero,
inventario ni caja. Reintentos no duplican. Leer y limpiar conservan snapshots
y estados derivados. Familia local correctamente clasificada por modo; esquema
regenerado y tests aplicables de C01–C08, C21, C25–C27, C32–C34 con evidencia.
