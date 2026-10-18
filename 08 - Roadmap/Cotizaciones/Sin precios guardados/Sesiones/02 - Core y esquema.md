---
tipo: sesion_implementacion
estado: completada
revision_plan: 3
actualizado: 2026-10-06
---

# Sesión 2: core y eliminación del esquema anterior

## Entrada

Sesión 1 completada, contrato y fixtures registrados. Leer Plan, Mapeo, Casos,
Continuidad y AGENTS/guías de Flutter. Revalidar cambios previos antes de editar.

## Trabajo

1. Implementar el snapshot de selección sin importes y adaptar dominio,
   payload/proyecciones/handler de guardado, DAO y repository. Retirar
   `GuardarCotizacionCommand.expectedTotalMinor` de command/servicio/Caja/tests,
   conservando revisión del origen y validaciones internas de venta.
2. Preparar recuperación desde catálogo actual con cantidades guardadas y
   unidades compatibles. Construir snapshots de venta completos con precio,
   costo, referencia de precio y consumo vigentes. Mantener cálculo/rangos
   compartidos con ventas; permitir cambio de denominador compatible.
3. Emitir/aplicar los eventos de línea sale_draft y el vínculo quotation sin
   importes en una transacción. IDs estables por intención; versión de borrador
   N; metadatos de primer/último evento correctos. Adaptar retries/Continuar
   venta/idempotencia que hoy dependen de la identidad compartida de eventos.
4. El handler de recuperación solo verifica y vincula. Retirar snapshots,
   totales y `catalog_unit_price_minor` de su payload. Quitar
   `QuotationPriceChange`, `priceChanges` y el diálogo de precio conservado.
5. Eliminar físicamente las siete columnas y CHECKs del mapeo. Ajustar predicate
   de esquema con columnas requeridas/prohibidas, dejando schemaVersion 8.
   Conservar protección del respaldo restaurado. Regenerar Drift.
6. Actualizar DI, refs/classificación local y pruebas de contratos/core/backup.
   Eliminar métodos de inserción de recuperación sin consumidores. Los eventos
   de venta siguen capturando precios y no se cambia NestJS.
7. Adaptar todos los consumidores de UI para que compilen y funcionen con el
   nuevo dominio. Implementar lectura de estimación en memoria y conectarla,
   con precios/total vigentes, cálculo coherente y sin escritura. No usar precios cero,
   referencias obligatorias ficticias ni campos persistidos como puente.
8. Actualizar fixtures/tests afectados y cumplir checks; la sesión 3 completa
   reactividad, textos, invalidación de imagen y QA visual. Esta sesión no puede
   cerrarse con referencias rotas o pruebas que exijan el contrato retirado.

## Verificación

Desde el repositorio Flutter:

```sh
dart run build_runner build
dart analyze
flutter test
git diff --check
```

Priorizar evidencia P01–P18 y P20/P22–P24: columnas y JSON reales, precio actual,
referencia medida actual, rollback de N eventos y vínculo, y reintentos. Una
ejecución correcta de la suite al final basta salvo cambios/fallos posteriores.
Usar bases temporales; el predicado de reset se verifica en copias controladas.

## Criterio de salida

La app funciona con el esquema sin precios de quotation y sus payloads nuevos.
Recuperar crea venta con precio actual; continuar/reaplicar no lo sustituye.
Analyze/suite pasan o se identifican con evidencia fallos previos reproducibles
ajenos al cambio. Registrar versión efectiva y archivos eliminados. Si requiere
otra sesión de trabajo por tamaño, continuar este mismo corte antes de darla por
completada; no etiquetar la persistencia como terminada sin adaptar consumidores.

## Prompt de ejecución

```text
Ejecuta la sesión 2 de Cotizaciones/Sin precios guardados, revisión 3, sobre
/Users/benjamin/Projects/POS/pos_flutter. Consume el contrato y los fixtures de
sesión 1; conserva cambios previos. Elimina precios/costos/totales y datos
operativos de la persistencia de quotation, incluyendo events.payload.
Recupera con precios actuales mediante eventos sale_draft y vínculo quotation
sin importes en una transacción. Retira código muerto y adapta consumidores.
Mantén schemaVersion 8/reset de desarrollo y refs por modo; verifica en bases
temporales. Regenera Drift, ejecuta analyze y flutter test, registra evidencia
y continuidad. No agregues sincronización de cotizaciones ni cambios de NestJS.
```

## Cierre — 2026-10-06

Fase 2 completada con selección/formatos 2 sin importes, recuperación vigente
N eventos sale_draft + vínculo atómicos, siete columnas retiradas y consumidores
adaptados con estimación en memoria. SchemaVersion 8, sin migración nueva,
reset/restore verificados sólo en archivos temporales. Build_runner/analyze/
suite completa/diff check pasan: 1292 aprobadas y 1 integración de servidor omitida.

Detalle, archivos, criterios y límites en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-2-core-y-esquema|Evidencia fase 2]].
Fase 3 queda pendiente: observación de catálogo, textos/fecha de vigencia,
invalidación del PNG y QA de compartir. No se ejecutó en este corte.
