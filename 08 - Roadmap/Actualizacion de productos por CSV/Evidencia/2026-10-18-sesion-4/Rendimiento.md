# Sesión 4 — Rendimiento reproducible

Fecha: 2026-10-18. Flutter HEAD `e5d9c7bbc581380d01ffe12088c317891573384f`,
árbol de trabajo de sesiones 1–4 sin commit. Revisión de archivos en
`estado-inicial.json` y `estado-final.json`.

## Condiciones

Mismo MacBook Air Mac17,3, Apple M5, 16 GiB, macOS 27.0.1 (26A434), arm64;
Flutter 3.41.6 (`db50e20168`), Dart 3.11.4. `flutter test`, VM/JIT de escritorio,
SQLite `NativeDatabase.memory()`. No son mediciones de tablet ni profile/release.
Cada modo se ejecutó en un proceso separado, sin otros tests o builds concurrentes.
Una corrida de calentamiento descartada por escenario, seguida de cinco medidas
secuenciales; base nueva por corrida, cerrada siempre al terminar. Nunca se
reutilizan bases acumuladas ni se mezclan modos en las estadísticas.

El fixture de altas es exactamente el anterior de diez columnas, 500 productos
con una variante, fracción/kg, 18.005 → 1801 centavos, costo 10, barcode 00123,
con 1.250 de stock o sin seguimiento/0. Hashes y archivos originales en sesión 1;
no se modificaron. Esquema, cinco unidades iniciales, generación de CSV, semillas
y comprobaciones excluidos del cronómetro. Catálogo inicial de altas vacío.

Los existentes se siembran por el flujo real de importación: 500 productos,
500 variantes, 500 recursos/balances/memorias y 1000 eventos. En server_sync sus
refs están pendientes. El CSV posterior tiene doce columnas, IDs generados en
esa base y existencias 999 deliberadamente distintas (informativas). La edición
cambia solo precio a 20.00. Mezcla intercalada cada cinco filas: alta con stock,
dos actualizaciones y dos omisiones (100/200/200). Los seis lotes ejecutables
contienen tanto altas como actualizaciones, comprobado por aserción. Catálogo mayor: los 500 destinos anteriores
más 9500 productos **y** variantes adicionales insertados por batch, fuera de
medición; esos extras no requieren historial para clasificar los destinos.
Son 10000 productos/variantes, no solo 10000 nombres.

Lectura/validación mide `ArticuloImportPreparationService.preparar`: inspección
de encabezado, foto transaccional ligera (nombres/categorías/unidades/IDs) y
clasificación. A diferencia del baseline, incluye la lectura de categorías y
una transacción consistente. No incluye selector/lectura física de archivo ni UI.
Guardado mide `ArticuloImportBatchService.importar` con altas, cambios y omitidos,
lectura de unidades cuando corresponde, preparación bajo transacción, comandos,
eventos, refs, proyecciones y undo. La UI vuelve a preparar antes de confirmar;
estas cifras corresponden a una preparación, igual que la comparación histórica.

`QueryInterceptor` cuenta consultas y sentencias batch separadamente: INSERT /
UPDATE / DELETE no incluyen las instrucciones de `runBatched`; la columna batch
sí las incluye (refs). Custom es cero en todas las fases. Se distingue begin
exterior de anidado usando el tipo del executor; el store observa además las
transacciones exteriores de guardado. Diez commits exteriores de altas; las
20/520 llamadas actuales incluyen 10 fronteras anidadas de append y, con
seguimiento, otras 500 de handlers. El baseline contaba 10/510 llamadas y ya
usaba diez commits exteriores: no son veinte commits actuales.

Todas las corridas comprueban errores vacíos, 500 filas, conteos de creados /
actualizados / omitidos, eventos, refs, undo, lotes y entrega. Preparar hace cero
escrituras e historial. Los escenarios íntegramente omitidos hacen cero SQL de
guardado, cero eventos/refs/undo y cero transacciones de escritura. Los 6 SELECT
de detección son por conjuntos; ningún SELECT a events, balances ni snapshots
por fila. Las lecturas de historial de las tablas siguientes solo ocurren para
productos modificados y corresponden a conservación de proveedores/bases y
validación idempotente; no se atribuyen a los omitidos.

## Comparación con referencia histórica

- 500 altas sin seguimiento: mediana total 142.427 ms / baseline 128.675 ms = **1.1069×**, menor que 1.20×.
- 500 altas con seguimiento: mediana total 437.438 ms / baseline 377.960 ms = **1.1574×**, menor que 1.20×.

Objetivo cumplido para ambas altas standalone en este entorno comparable. No
se necesitó optimización del código de negocio. El costo añadido de altas es
una lectura de categorías y la frontera transaccional de preparación; las
consultas/escrituras de negocio y los diez lotes son los del baseline.
No existe baseline histórico equivalente de server_sync ni de tablet: no se
inventa un ratio para ellos. Las diferencias actuales entre modos incluyen
refs y los respaldos legítimos de actualizaciones, detallados por separado.

## standalone

Milisegundos: mediana [mínimo–máximo]; cinco corridas por fila.

| Escenario | Lectura/validación | Guardado | Total por corrida |
|---|---:|---:|---:|
| 500 altas sin seguimiento | 5.496 [5.377–7.203] | 137.050 [122.615–158.251] | 142.427 [128.095–165.454] |
| 500 altas con seguimiento | 5.786 [5.138–5.851] | 431.652 [420.041–442.114] | 437.438 [425.472–447.910] |
| 500 existentes iguales | 13.071 [13.038–27.237] | 0.011 [0.008–0.021] | 13.079 [13.049–27.258] |
| 20 cambios + 480 omitidos | 12.972 [12.549–26.349] | 27.619 [27.214–29.107] | 40.211 [39.797–55.019] |
| 500 modificados | 12.069 [11.514–12.344] | 666.072 [646.801–682.299] | 677.586 [658.686–694.643] |
| 100 altas + 200 cambios + 200 omitidos | 10.299 [10.185–10.637] | 339.881 [335.784–352.188] | 350.070 [346.083–362.373] |
| 500 iguales en catálogo de 10000 | 37.759 [37.478–44.768] | 0.013 [0.011–0.019] | 37.770 [37.493–44.787] |

| Escenario | SELECT validar / guardar | INSERT / UPDATE / DELETE guardar | Sentencias batch | Tx exteriores validar / guardar | Tx totales guardar | Eventos / refs / undo nuevos |
|---|---:|---:|---:|---:|---:|---:|
| 500 altas sin seguimiento | 3 / 1501 | 1500 / 0 / 0 | 0 | 1 / 10 | 20 | 500 / 0 / 0 |
| 500 altas con seguimiento | 3 / 6501 | 4000 / 0 / 0 | 0 | 1 / 10 | 520 | 1000 / 0 / 0 |
| 500 existentes iguales | 6 / 0 | 0 / 0 / 0 | 0 | 1 / 0 | 0 | 0 / 0 / 0 |
| 20 cambios + 480 omitidos | 6 / 560 | 20 / 60 / 20 | 0 | 1 / 1 | 2 | 20 / 0 / 0 |
| 500 modificados | 6 / 14000 | 500 / 1500 / 500 | 0 | 1 / 10 | 20 | 500 / 0 / 0 |
| 100 altas + 200 cambios + 200 omitidos | 6 / 6901 | 1000 / 600 / 200 | 0 | 1 / 6 | 112 | 400 / 0 / 0 |
| 500 iguales en catálogo de 10000 | 6 / 0 | 0 / 0 / 0 | 0 | 1 / 0 | 0 | 0 / 0 / 0 |

| Escenario | SELECT de events al guardar | Filas de events retornadas |
|---|---:|---:|
| 500 altas sin seguimiento | 0 | 0 |
| 500 altas con seguimiento | 0 | 0 |
| 500 existentes iguales | 0 | 0 |
| 20 cambios + 480 omitidos | 80 | 100 |
| 500 modificados | 2000 | 2500 |
| 100 altas + 200 cambios + 200 omitidos | 800 | 1000 |
| 500 iguales en catálogo de 10000 | 0 | 0 |

`ProcessInfo.maxRss`: máximo acumulado del proceso 367099904 bytes (350.1 MiB), incluyendo calentamiento/semillas y todos sus escenarios. No es memoria atribuible al importador ni pico por fase.

## server-sync

Milisegundos: mediana [mínimo–máximo]; cinco corridas por fila.

| Escenario | Lectura/validación | Guardado | Total por corrida |
|---|---:|---:|---:|
| 500 altas sin seguimiento | 5.518 [5.162–7.316] | 153.813 [140.884–206.034] | 159.331 [146.046–213.350] |
| 500 altas con seguimiento | 6.003 [5.302–6.787] | 477.464 [471.288–499.847] | 483.467 [478.075–505.463] |
| 500 existentes iguales | 13.422 [12.965–25.938] | 0.010 [0.009–0.022] | 13.434 [12.974–25.960] |
| 20 cambios + 480 omitidos | 13.804 [12.336–43.315] | 36.845 [32.806–55.824] | 50.649 [45.142–99.139] |
| 500 modificados | 11.528 [11.259–12.084] | 799.904 [786.436–823.468] | 811.988 [797.966–834.996] |
| 100 altas + 200 cambios + 200 omitidos | 10.597 [10.412–10.852] | 398.842 [397.059–409.462] | 409.694 [407.656–420.061] |
| 500 iguales en catálogo de 10000 | 38.861 [37.151–43.006] | 0.018 [0.012–0.023] | 38.879 [37.163–43.029] |

| Escenario | SELECT validar / guardar | INSERT / UPDATE / DELETE guardar | Sentencias batch | Tx exteriores validar / guardar | Tx totales guardar | Eventos / refs / undo nuevos |
|---|---:|---:|---:|---:|---:|---:|
| 500 altas sin seguimiento | 3 / 1501 | 1500 / 0 / 0 | 1500 | 1 / 10 | 20 | 500 / 1500 / 0 |
| 500 altas con seguimiento | 3 / 6501 | 4000 / 0 / 0 | 3500 | 1 / 10 | 520 | 1000 / 3500 / 0 |
| 500 existentes iguales | 6 / 0 | 0 / 0 / 0 | 0 | 1 / 0 | 0 | 0 / 0 / 0 |
| 20 cambios + 480 omitidos | 6 / 680 | 40 / 60 / 20 | 100 | 1 / 1 | 2 | 20 / 100 / 20 |
| 500 modificados | 6 / 17000 | 1000 / 1500 / 500 | 2500 | 1 / 10 | 20 | 500 / 2500 / 500 |
| 100 altas + 200 cambios + 200 omitidos | 6 / 8101 | 1200 / 600 / 200 | 1700 | 1 / 6 | 112 | 400 / 1700 / 200 |
| 500 iguales en catálogo de 10000 | 6 / 0 | 0 / 0 / 0 | 0 | 1 / 0 | 0 | 0 / 0 / 0 |

| Escenario | SELECT de events al guardar | Filas de events retornadas |
|---|---:|---:|
| 500 altas sin seguimiento | 0 | 0 |
| 500 altas con seguimiento | 0 | 0 |
| 500 existentes iguales | 0 | 0 |
| 20 cambios + 480 omitidos | 100 | 120 |
| 500 modificados | 2500 | 3000 |
| 100 altas + 200 cambios + 200 omitidos | 1000 | 1200 |
| 500 iguales en catálogo de 10000 | 0 | 0 |

`ProcessInfo.maxRss`: máximo acumulado del proceso 367280128 bytes (350.3 MiB), incluyendo calentamiento/semillas y todos sus escenarios. No es memoria atribuible al importador ni pico por fase.
## Reproducción

Desde `/Users/benjamin/Projects/POS/pos_flutter`, con el harness adjunto en
`tool/benchmarks/articulo_import_verification.dart` y las dependencias actuales:

```sh
CSV_BENCH_MODE=standalone CSV_BENCH_OUTPUT=/tmp/csv-standalone.json flutter test tool/benchmarks/articulo_import_verification.dart --reporter expanded
CSV_BENCH_MODE=server_sync CSV_BENCH_OUTPUT=/tmp/csv-server-sync.json flutter test tool/benchmarks/articulo_import_verification.dart --reporter expanded
```

Ejecutar secuencialmente, sin builds/tests simultáneos. Opcionalmente seleccionar
un solo escenario con `CSV_BENCH_SCENARIO` usando las claves del JSON. Los JSON
incluyen cada muestra en microsegundos y los contadores; el resumen usa mediana
de **totales por corrida**, no suma de medianas. Logs: una prueba aprobada por
modo; 35 muestras por modo y 14 calentamientos descartados en total.

Memoria: se registró el máximo acumulado RSS del proceso VM. No se midió el
pico aislado por importador/fase ni captura de memoria en tablet. Tampoco se
comparan duraciones de suite ni del recorrido manual con el baseline.
