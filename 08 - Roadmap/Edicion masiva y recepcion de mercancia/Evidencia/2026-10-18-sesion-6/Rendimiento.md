# Rendimiento: referencia medida en escritorio

Son mediciones observadas en este host, sin SLA ni umbral temporal de CI. No acreditan latencia ni presupuesto de tiempo de una tablet. M48 queda medido en escritorio; la referencia física sigue pendiente.

## Equipo, build y método

- Mac `Mac17,3`, Apple M5, 16 GiB RAM, arm64; macOS 27.0.1 (26A434).
- Flutter 3.41.6, framework db50e20168, engine 425cfb54d0; Dart 3.11.4. `flutter test`, debug, flutter_tester arm64. Aunque el directorio del ejecutable se llama darwin-x64, `file` confirma binario arm64. No es build APK/IPA ni profile de móvil.
- Ambos modos: standalone y server_sync. Sin HTTP ni PostgreSQL dentro del benchmark. El guardado server_sync queda pendiente localmente; no mide entrega de red.
- SQLite nativa real sobre archivos temporales; copia nueva de la misma base por corrida. Un calentamiento descartado y cinco corridas medidas por combinación. La preparación del fixture, apertura de esquema, captura de textos y comprobaciones posteriores quedan fuera de los cuatro cronómetros. Las aserciones ligeras de cada fase están dentro. No se vacía la caché del SO; no se mide arranque del proceso, pintura ni teclado físico.
- La pasada final se ejecutó sin otra suite o benchmark concurrente; los servidores aislados estaban inactivos. Se conservan las pasadas exploratorias separadas. No hay una referencia previa de tablet para definir un presupuesto temporal.

## Fixtures y fases

Cada catálogo tiene 1000 o 10000 variantes, cinco por producto. Los primeros 100 productos/500 variantes, usados como destinos, se crean por comandos reales, con recurso directo en piezas, saldo inicial 5, venta 20 y costo 10, historial y bases reales. Las variantes adicionales se insertan como proyecciones de listado completas con recursos/saldos; no se inventa historial de eventos para ellas ni se editan en la captura. Esto prueba el catálogo grande, **no un historial remoto de 10000 agregados**.

Se capturan 20/100/500 variantes, incluidas cinco del mismo producto. Cada quinto producto completo tiene venta explícita 20.00 (no-op). En los demás se captura costo 12; las variantes de índice par reciben +2 piezas. Venta permanece 20. Proveedores/recetas y unidades medidas se cubren en regresión funcional, no en este fixture de rendimiento.

- Carga: primera página de 100 filas.
- Filtro: búsqueda SQL `Artículo 000`, página de 100 filas.
- Revisión: relectura y validación de todas las 20/100/500 capturas.
- Guardado: reserva y ejecución secuencial por producto de las diferencias efectivas. Incluye transacciones del diario, eventos y proyecciones.

Las cinco corridas tienen exactamente los mismos contadores por fase en cada combinación; se validó esa igualdad sobre el JSON. Los tiempos están en **ms: mediana (mínimo–máximo)**.

| Modo | Catálogo | Captura | Carga | Filtro | Revisión | Guardado |
|---|---:|---:|---:|---:|---:|---:|
| standalone | 1000 | 20 | 6.98 (4.86–8.24) | 1.40 (1.28–1.68) | 0.57 (0.53–0.66) | 28.47 (26.01–30.94) |
| standalone | 1000 | 100 | 7.84 (5.14–8.33) | 1.30 (1.28–1.34) | 1.25 (1.23–1.40) | 123.07 (121.32–127.10) |
| standalone | 1000 | 500 | 8.00 (6.81–8.59) | 1.24 (1.22–1.27) | 4.65 (4.49–5.53) | 562.23 (555.12–589.58) |
| standalone | 10000 | 20 | 23.80 (23.26–24.29) | 3.27 (3.24–3.35) | 0.38 (0.37–0.42) | 26.16 (25.69–27.36) |
| standalone | 10000 | 100 | 22.71 (21.83–25.30) | 3.27 (3.26–3.32) | 1.01 (0.99–1.03) | 130.09 (129.24–137.01) |
| standalone | 10000 | 500 | 25.90 (22.66–28.51) | 3.26 (3.24–3.33) | 4.50 (4.44–4.59) | 654.03 (645.48–678.36) |
| server_sync | 1000 | 20 | 8.46 (4.85–8.97) | 1.18 (1.17–1.23) | 0.37 (0.34–0.42) | 25.96 (25.59–27.18) |
| server_sync | 1000 | 100 | 5.71 (5.03–5.91) | 1.17 (1.15–1.20) | 1.04 (0.97–1.19) | 130.91 (129.94–131.78) |
| server_sync | 1000 | 500 | 5.62 (4.46–6.07) | 1.18 (1.13–1.40) | 4.61 (4.31–4.95) | 640.71 (637.10–651.83) |
| server_sync | 10000 | 20 | 27.89 (22.30–28.57) | 3.24 (3.15–3.34) | 0.38 (0.34–0.39) | 29.65 (29.57–30.61) |
| server_sync | 10000 | 100 | 27.66 (24.87–28.35) | 3.21 (3.15–3.50) | 1.01 (0.99–1.11) | 153.88 (148.29–163.65) |
| server_sync | 10000 | 500 | 27.67 (25.71–28.12) | 3.20 (3.14–3.41) | 4.36 (4.26–4.51) | 762.81 (759.69–774.28) |

## Consultas, eventos y transacciones

Los conteos son llamadas SQLite observadas por QueryInterceptor. SELECT incluye lecturas de catálogo/historial; escrituras incluye insert/update/delete y ejecuciones de batch. Las transacciones exteriores y los savepoints se cuentan separados. No se cuentan lecturas auxiliares de verificación posteriores ni SQL interno de triggers. Las transacciones por fase de carga/filtro/revisión no escriben negocio.

| Modo | Captura | SELECT carga/filtro/revisión/guardado | Escrituras carga/filtro/revisión/guardado | Transacciones exteriores carga/filtro/revisión/guardado | Total transacciones con savepoints guardado | Eventos catálogo/entrada | Operaciones | Diario JSON bytes |
|---|---:|---|---|---|---:|---|---:|---:|
| standalone | 20 | 2/2/2/299 | 0/0/0/100 | 1/1/1/4 | 37 | 3/7 | 3 | 9815 |
| standalone | 100 | 2/2/2/1609 | 0/0/0/544 | 1/1/1/17 | 201 | 16/40 | 16 | 53952 |
| standalone | 500 | 2/2/4/8041 | 0/0/0/2720 | 1/1/1/81 | 1001 | 80/200 | 80 | 269760 |
| server_sync | 20 | 2/2/2/341 | 0/0/0/195 | 1/1/1/4 | 37 | 3/7 | 3 | 9818 |
| server_sync | 100 | 2/2/2/1833 | 0/0/0/1056 | 1/1/1/17 | 201 | 16/40 | 16 | 53968 |
| server_sync | 500 | 2/2/4/9161 | 0/0/0/5280 | 1/1/1/81 | 1001 | 80/200 | 80 | 269840 |

Los contadores de esta tabla coinciden para ambos tamaños de catálogo; los crudos por cada corrida están en `mediciones.json`. Carga/filtro leen 100 filas comerciales y cero filas de eventos, sin hidratar snapshots por fila. Revisión no lee historia. Standalone conserva cero event_refs. Los productos no-op completos no reservan diario ni generan eventos. Los 20/100/500 destinos dejan respectivamente 3/16/80 operaciones y 7/40/200 entradas; los eventos totales son 10/56/280.

El guardado tiene una transacción exterior de reserva más una por producto efectivo: 4/17/81. Los savepoints participan del commit exterior; no son commits comerciales separados. La comprobación posterior ejecuta integrity_check/foreign_key_check sobre cada base.

## Costo del diario

Fixture de 100/1000/10000 operaciones confirmadas válidas, con intención canónica, distribuidas cíclicamente en 500 variantes/100 productos reales (100 registros usan 100 variantes). El fixture se inserta directamente como metadato, sin ejecutar negocio. No se usa como prueba adicional de idempotencia. Se descarta un calentamiento y se miden cinco lecturas por modo/tamaño.

- Comando: leer y decodificar todas las operaciones del diario.
- Controlador: lectura anterior más nombres por conjuntos del catálogo, tal como al abrir recuperación.
- Bytes asignados: delta de page_count × page_size de la misma base, después de insertar solo diario/índices. No se interpreta como bytes exactos del archivo WAL ni como memoria heap.

| Modo | Operaciones | Comando ms | Controlador ms | SELECT comando/controlador | Bytes JSON intención | Delta SQLite diario/índices |
|---|---:|---:|---:|---|---:|---:|
| standalone | 100 | 1.30 (1.06–1.77) | 2.20 (1.83–5.58) | 1/3 | 85100 | 118784 |
| standalone | 1000 | 8.65 (8.56–8.75) | 13.05 (12.65–22.83) | 1/5 | 851000 | 1163264 |
| standalone | 10000 | 103.86 (102.81–104.62) | 109.82 (98.57–112.07) | 1/5 | 8510000 | 11689984 |
| server_sync | 100 | 0.87 (0.84–1.51) | 1.66 (1.65–5.61) | 1/3 | 85200 | 118784 |
| server_sync | 1000 | 8.63 (8.48–9.18) | 12.70 (12.46–12.77) | 1/5 | 852000 | 1171456 |
| server_sync | 10000 | 101.41 (100.69–111.30) | 107.33 (104.95–118.94) | 1/5 | 8520000 | 11689984 |

La consulta/decodificación crece con el historial retenido. No hay purga ni paginación del historial y la pantalla construye sus descripciones de grupos completas. Estas mediciones no incluyen construir/pintar 10000 tarjetas, memoria máxima, historial con todos los productos distintos o navegación completa de todas las páginas. No se declara rendimiento ilimitado. El catálogo principal sí acredita listado perezoso con 10000 variantes en `recepcion_verificacion_test.dart`.

No se fijó una garantía de tablet a partir de estas cifras. Para establecer presupuesto de UX faltan modelo/SO/build de un equipo representativo, medición profile en hardware, teclado y prueba sin red con cierre/reapertura conservando la base.

## Reproducción

Desde Flutter, con directorio de salida ya creado:

```sh
BULK_BENCH_OUT='<carpeta de evidencia>/mediciones.json' \
flutter test tool/benchmarks/recepcion_masiva_verification.dart --reporter expanded
```

`benchmark-final.log` conserva la ejecución; `mediciones.json` contiene 60 corridas de flujo y 60 lecturas de diario (cinco por combinación/camino). `mediciones-resumen.json` guarda medianas/rangos/contadores. `entorno.json` identifica el runtime real.
