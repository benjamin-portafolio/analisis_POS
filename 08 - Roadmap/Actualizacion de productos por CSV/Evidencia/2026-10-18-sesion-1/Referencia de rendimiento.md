# Referencia previa a implementar la sesión 1

Capturada el 2026-10-18 **antes de cambiar el importador**, sobre Flutter
`e5d9c7bbc581380d01ffe12088c317891573384f`. Las modificaciones ajenas de escaneo
de Caja no intervienen en el harness; se preservaron. El único archivo añadido
para medir fue `tool/benchmarks/articulo_import_baseline.dart`.

## Entorno y límites

- MacBook Air Mac17,3, Apple M5 (10 núcleos), RAM 16 GB.
- macOS 27.0.1, build 26A434, darwin-arm64.
- Flutter 3.41.6 stable, framework `db50e20168`; Dart 3.11.4.
- `flutter test`, VM/JIT de pruebas de escritorio; **no** build profile/release.
- `AppMode.standalone`, procesador y event store reales, SQLite
  `NativeDatabase.memory()` aislada. No se abre la base de la instalación ni se
  ejecutan servicios remotos.
- Catálogo inicial: cero productos/variantes/recursos/eventos/categorías;
  cinco unidades sembradas por `AppDatabase`. Apertura/esquema/semillas fuera
  del cronómetro. Las categorías se proporcionan como conjunto vacío, porque
  el fixture no las utiliza.
- `flutter devices` encontró macOS y Chrome, sin tablet ni dispositivo
  inalámbrico. **Queda pendiente la medición real en tablet**, en profile o
  release y registrando modelo. Estos resultados no la sustituyen.

## Fixtures y política

Dos archivos de 500 filas, diez columnas anteriores, un producto y una variante
sin nombre por fila (`Artículo 0` a `Artículo 499`). Venta medida en kg,
precio `18.005` (1801 centavos tras half-up), costo `10`, barcode textual
compartido `00123`. Sin seguimiento: `no,0`; con seguimiento: `si,1.250`
(1250 átomos). No se usan categorías. Los fixtures adjuntos tienen UTF-8 sin BOM;
el parser admite BOM, cubierto aparte por tests.

SHA-256:

- `500-sin-seguimiento.csv`: `8e4ca093a38b836463d56866ebe1e7f23ed6ec624814cb73b0721495d94f3d78`.
- `500-con-seguimiento.csv`: `cae7b94e508dd4e324b8282bdcb9dce33d59826ebe4a2191cccda9e4afb171a3`.

Por escenario: una corrida de calentamiento descartada y cinco registradas,
secuenciales, cada una con base nueva y cerrada al terminar. El escenario sin
seguimiento precede al de seguimiento. La generación del fixture no se mide.

**Lectura/validación:** lectura de unidades activas y nombres vía el repositorio
anterior `watchArticulos().first`, construcción de catálogo y `validar` puro.
No incluye selector/lectura de archivo, consulta de categorías vacías ni UI.
**Guardado:** `ArticuloImportBatchService.importar`, incluidos su lectura de
unidades y sus diez lotes, comandos, eventos y proyecciones. Las consultas de
verificación de resultados quedan fuera del cronómetro y de los contadores.

## Resultados

Milisegundos, mediana y [mínimo–máximo] de cinco corridas:

| 500 altas | Lectura/validación | Guardado | Total por corrida |
|---|---:|---:|---:|
| Sin seguimiento | 5.261 [5.008–7.600] | 123.414 [109.837–140.903] | 128.675 [114.908–148.503] |
| Con seguimiento | 5.623 [4.879–6.022] | 372.337 [362.617–384.351] | 377.960 [367.920–389.230] |

Contadores idénticos en las cinco corridas de cada escenario:

| Fase/escenario | SELECT | INSERT | UPDATE/DELETE/custom | Transacciones externas | Eventos | event_refs |
|---|---:|---:|---:|---:|---:|---:|
| Validación, ambos | 2 | 0 | 0 | 0 | 0 | 0 |
| Guardado sin seguimiento | 1501 | 1500 | 0 | 10 | 500 | 0 |
| Guardado con seguimiento | 6501 | 4000 | 0 | 10 | 1000 | 0 |

El interceptor registró 10 llamadas `beginTransaction` sin seguimiento y 510
con seguimiento: estas últimas incluyen **500 transacciones anidadas** de los
handlers. Los diez lotes exteriores se observaron también en las llamadas
atómicas del event store. No confundir las 510 llamadas con 510 commits de
productos individuales. Con seguimiento se crean recursos antes de productos.

`ProcessInfo.maxRss` devolvió 368574464 bytes: es el máximo acumulado del proceso
VM, con calentamiento y ambas fases, **no** memoria atribuible a una corrida o
al importador. No hay medición de memoria pico por fase ni en tablet.

## Reproducción y archivos

El harness adjunto es autocontenido en cuanto a setup, usa imports del paquete
Flutter y genera exactamente ambos fixtures. Para repetir la referencia,
colocarlo como `tool/benchmarks/articulo_import_baseline.dart` en un checkout
aislado de la revisión indicada, con sus dependencias resueltas, y ejecutar:

```sh
CSV_BENCH_OUTPUT=/tmp/csv-baseline.json flutter test tool/benchmarks/articulo_import_baseline.dart --reporter expanded
```

Conservar hardware, versión de Flutter, modo, base en memoria, fixtures y
política de calentamiento/restauración para comparar. Ejecutarlo sobre el árbol
posterior mide otra revisión; no sustituye la captura previa.

- `baseline-resultados.json`: diez muestras originales en microsegundos y SQL.
- `baseline-ejecucion.log`: salida original; una prueba aprobada.
- `articulo_import_baseline.dart`: harness reproducible.
- Los dos CSV: contenido exacto de los fixtures.

No se midieron todavía los escenarios finales de escritura de actualizaciones:
pertenecen a sesiones 2–4. El presupuesto de 1.20× del plan sigue pendiente de
comparación en condiciones equivalentes, especialmente en tablet.
