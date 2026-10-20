from pathlib import Path
import json,statistics
p=Path(__file__).resolve().parent
base=json.loads((p.parent/'2026-10-18-sesion-1/baseline-resultados.json').read_text())
names={'new_untracked':'500 altas sin seguimiento','new_tracked':'500 altas con seguimiento','unchanged':'500 existentes iguales','changed_20':'20 cambios + 480 omitidos','changed_all':'500 modificados','mixed':'100 altas + 200 cambios + 200 omitidos','large_unchanged':'500 iguales en catálogo de 10000'}
summary=[];sections=[]
def stat(v):return {'median':statistics.median(v),'min':min(v),'max':max(v)}
def fmt(s):return f"{s['median']:.3f} [{s['min']:.3f}–{s['max']:.3f}]"
for mode in ['standalone','server-sync']:
 d=json.loads((p/f'rendimiento-{mode}.json').read_text())
 lines=[f'## {mode}', '', 'Milisegundos: mediana [mínimo–máximo]; cinco corridas por fila.', '', '| Escenario | Lectura/validación | Guardado | Total por corrida |', '|---|---:|---:|---:|']
 for s in names:
  rr=[r for r in d if r['scenario']==s];assert len(rr)==5
  vs=stat([r['validation_us']/1000 for r in rr]);ss=stat([r['save_us']/1000 for r in rr]);ts=stat([(r['validation_us']+r['save_us'])/1000 for r in rr])
  counters={k:rr[0][k] for k in ['validation_sql','save_sql','events','event_refs','undo','batches','outer_transactions_save','created','updated','omitted']}
  assert all(all(r[k]==v for k,v in counters.items()) for r in rr)
  item={'mode':mode,'scenario':s,'validation_ms':vs,'save_ms':ss,'total_ms':ts,**counters};summary.append(item)
  if mode=='standalone' and s in ['new_untracked','new_tracked']:
   baseline=stat([(r['validation_us']+r['save_us'])/1000 for r in base if r['tracking']==(s=='new_tracked')])
   item['baseline_total_ms']=baseline;item['ratio']=ts['median']/baseline['median'];assert item['ratio']<=1.2
  lines.append(f'| {names[s]} | {fmt(vs)} | {fmt(ss)} | {fmt(ts)} |')
 lines+=['', '| Escenario | SELECT validar / guardar | INSERT / UPDATE / DELETE guardar | Sentencias batch | Tx exteriores validar / guardar | Tx totales guardar | Eventos / refs / undo nuevos |', '|---|---:|---:|---:|---:|---:|---:|']
 for s in names:
  a=next(x for x in summary if x['mode']==mode and x['scenario']==s);v=a['validation_sql'];q=a['save_sql']
  lines.append(f"| {names[s]} | {v['selects']} / {q['selects']} | {q['inserts']} / {q['updates']} / {q['deletes']} | {q['batch_statements']} | {v['outer_transactions']} / {q['outer_transactions']} | {q['transactions']} | {a['events']} / {a['event_refs']} / {a['undo']} |")
 lines+=['', '| Escenario | SELECT de events al guardar | Filas de events retornadas |', '|---|---:|---:|']
 for s in names:
  q=next(x for x in summary if x['mode']==mode and x['scenario']==s)['save_sql']
  lines.append(f"| {names[s]} | {q['history_selects']} | {q['history_rows']} |")
 peak=max(r['peak_rss_bytes_cumulative_process'] for r in d)
 lines+=['',f'`ProcessInfo.maxRss`: máximo acumulado del proceso {peak} bytes ({peak/1024/1024:.1f} MiB), incluyendo calentamiento/semillas y todos sus escenarios. No es memoria atribuible al importador ni pico por fase.']
 sections.append('\n'.join(lines))
(p/'rendimiento-resumen.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
prefix='''# Sesión 4 — Rendimiento reproducible

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

'''
for a in summary:
 if 'ratio' in a:
  prefix+=f"- {names[a['scenario']]}: mediana total {a['total_ms']['median']:.3f} ms / baseline {a['baseline_total_ms']['median']:.3f} ms = **{a['ratio']:.4f}×**, menor que 1.20×.\n"
prefix+='''
Objetivo cumplido para ambas altas standalone en este entorno comparable. No
se necesitó optimización del código de negocio. El costo añadido de altas es
una lectura de categorías y la frontera transaccional de preparación; las
consultas/escrituras de negocio y los diez lotes son los del baseline.
No existe baseline histórico equivalente de server_sync ni de tablet: no se
inventa un ratio para ellos. Las diferencias actuales entre modos incluyen
refs y los respaldos legítimos de actualizaciones, detallados por separado.

'''
suffix='''
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
'''
(p/'Rendimiento.md').write_text(prefix+'\n\n'.join(sections)+suffix)
print('Report generated:',len(summary),'scenarios, 70 measured samples')
