# Fixtures de fase 1, revisión 3

Entradas/expectativas preparadas en fase 1 y consumidas por las pruebas Flutter
desde fase 2; revalidadas durante el cierre de fase 4.
No se importan en bases de uso ni cambian la app. Valores monetarios únicamente
en catálogo, eventos/expectativas de venta y ejemplos antiguos destinados a rechazo.

| Archivo | Uso |
|---|---|
| `seleccion-sin-precios.json` | Payload canónico cotizacion_guardada formato 2: dos piezas de Pan y 500 g de Café, sin precios/moneda/importes/consumo |
| `guardado-evento-v2.json` | Mismo payload, sobre SyncEvent y LocalEventRef del guardado |
| `catalogo-inicial.json` | Preparación de catálogo: Pan $100/pieza, costo $60; Café $0.20/g, costo $0.08 por referencia; unidad g, factor 1 |
| `catalogo-actualizado.json` | Pan $120/pieza, costo $70 y otro recurso; Café $30/100 g, costo $12 por referencia; nombres vigentes cambiados, unidad idéntica |
| `identidades-estables.json` | UUIDs de origen/selección y dos intenciones con mapa determinista de líneas/eventos/vínculo |
| `recuperacion-eventos-borrador.json` | N=2 eventos producto_agregado_borrador con payload existente plano, cantidades absolutas, precios/costos/consumo vigentes y refs |
| `recuperacion-vinculo-v2.json` | Evento cotizacion_recuperada formato 2 con IDs/versión/vínculo; sin snapshot ni importe |
| `recuperacion-esperada.json` | Precondiciones, proyecciones/result esperados: sale versión 2, líneas $240 y $150, total $390; quotation solo cambia vínculo/revisión |
| `guardado-antiguo-incompatible.json` | Payload real de estructura anterior, sin format_version y con moneda/total/snapshot monetario; deberá fallar |
| `recuperacion-antigua-incompatible.json` | Payload anterior con total, snapshot y catalog_unit_price_minor; deberá fallar |
| `esquema-compatibilidad.json` | Columnas finales/prohibidas e índices, versión fija 8; base nueva, antigua superconjunto y protección restaurada |

## Consumo por las pruebas

1. Cargar JSON del vault de análisis o copiar fielmente a fixtures del repositorio
   Flutter al ejecutar fase 2. Los archivos `*evento*`/`*vinculo*` envuelven `event`
   y `refs` como datos de prueba; **solo event.payload** va a events.payload. El
   array de eventos de borrador tiene el mismo envoltorio por entrada.
2. Los catálogos son filas declarativas mínimas para sembrar Drift, no payloads
   SyncEvent de artículos. Convertir nombres snake_case a companions, aportar
   los metadatos normales del harness y actualizar por ID, nunca duplicar units
   ya sembradas por AppDatabase. No cambian precios escribiendo quotation.
3. Para guardar, crear la venta origen con IDs del manifiesto, dos líneas de
   selección y snapshots construidos del catálogo inicial. Aplicar eventos de
   borrador con IDs source_draft_event_ids del manifiesto, base 0/1; lastEventId
   = source_draft_event_id. Total origen $300; no enviarlo al nuevo comando.
4. Para recuperar, guardar selección y limpiar origen por el flujo habitual.
   El currentSaleId histórico sigue siendo sourceSaleId. Reemplazar catálogo con
   actualizado, tomar la primera intención y comparar los eventos/proyecciones
   exactos. La segunda intención se ejecuta solo después de limpiar la primera,
   usando la revisión quotation avanzada y nuevos IDs; no es un retry.
5. Reintentar primera intención después de editar venta o cambiar catálogo debe
   conservar el estado real de esa venta, no volver a imponer recuperacion-esperada.
   Tras rollback sin commit, el mismo comando puede capturar el catálogo nuevo.
6. Los campos `issued_at_ms`, `created_at_ms`, `updated_at_ms` de las expectativas
   son fechas para asserts/DTOs: mapear a DateTime y a columnas Drift *_at_local;
   no son nuevas columnas. La expectativa sale_items contiene snapshot plano más
   metadatos/total, igual a la proyección persistida. source_sale_item_id vive solo
   en el evento de guardado. Listas required/forbidden no sustituyen los requisitos
   actuales del resto del esquema.

El caso medido con referencia 100 admite el cálculo existente, pero el editor de
artículos impone referencia=factor de unidad. Sembrar ese catálogo directamente
para P07; este paquete no amplía la edición de artículos. 500 átomos mass con
g/factor 1 son 500 g. Los nombres guardados permanecen Pan/Café medido aunque
la venta nueva capture los nombres actualizados.

## Comprobación del paquete

```sh
python3 validar_fixtures.py
```

Comprueba JSON/claves sin importes de quotation, ambas intenciones/algoritmos,
mapas de eventos/versiones/refs, cálculo half-up y expectativas cruzadas. Solo
lee estos archivos; no importa Flutter ni abre SQLite. No acredita fromJson,
rollback ni otros Pxx de la app; esos resultados están en la evidencia Dart. Las muestras antiguas se conservan tal
cual; además, sus pruebas deberán agregar format_version=2 y probar rechazo,
para que etiquetar un payload viejo no lo vuelva compatible.
