# Sesión 5: verificación y cierre parcial — 2026-10-19

A01–A41 verificados con evidencia individual. A42 parcial: falta teléfono/tablet
físico para teclado decimal real, legibilidad, scroll y navegación. No se declara
cierre total. La funcionalidad no requirió correcciones productivas en esta sesión.

[Casos A01–A42](Casos.md), [recorrido manual](Manual.md),
[matriz](../../Matriz%20de%20aceptacion.md) y
[continuidad](../../Estado%20y%20continuidad.md).

## Alcance ejecutado y preservación

Se leyeron sesión 5, plan, matriz, continuidad, evidencias 1–4, AGENTS de los tres
árboles y guías offline de Flutter. No se usan subagentes. Git se inspeccionó antes
de editar: Flutter HEAD `3e8e1ed`, Nest `dcc2907`, vault `b077dc7`, con cambios previos
sin commit. `baseline.json` registra HEAD completos, estado y SHA256 de todos los
archivos modificados/nuevos previos. No se restauró ningún archivo desde HEAD.

`previous-evidence-validation.json` compara los manifests 1–4 con los archivos
vigentes. Esquema/generado/contratos Flutter y core local mantienen las revisiones
acreditadas; receptor, entidad, payloads, migración y pruebas Nest conservan sus
hashes. Las diferencias con registros antiguos corresponden a ampliaciones ya
acreditadas en sesiones posteriores y documentación. El código del editor/informe
de sesión 4 coincide íntegramente. La evidencia remota previa sigue válida.

`preservation.json` verifica los archivos previos al terminar y distingue los
cambios autorizados de esta sesión. La comparación identifica rutas y hashes antes/después sin atribuir como nuevos
los cambios previos aún sin commit.
`manifest.json` identifica fuentes finales y resultados. Los logs de sesiones
1–4 se conservan como historia, incluidas sus omisiones/fallos intermedios.

No hubo commit, push, despliegue, instalación de dependencias ni migración sobre
base operativa. No se abrió la SQLite de la instalación operativa ni se cargó .env.

## Verificación integrada añadida

Flutter: `test/presentation/pages/informes/minimum_stock_restore_test.dart`, dos
recorridos, standalone y server_sync, sobre ProductSupplierHarness existente:

- Editor real desde informe cambia mínimo; SQLite en disco conserva todas las
  tablas al cerrar/reabrir con un executor nuevo.
- Snapshot/restore mediante DriftDatabaseSnapshotService/DriftDatabaseRestoreService
  reales: retirada posterior al snapshot, restauración exacta y nueva reapertura.
- Informe, contador y filtro vuelven a mostrar la misma condición para piezas y
  kg; mínimo medido, null conocido, ausencia legada, undo, eventos/refs e integridad
  permanecen idénticos. La base restaurada queda protegida y vuelve a abrir.
- Los tests existentes de esquema anterior siguen verificando detector, reset de
  desarrollo, hash intacto de restaurada incompatible y rechazo antes de reemplazar.

Se reforzaron, dentro de sus tests existentes, dos suites de conservación:
`actualizar_articulo_csv_test.dart` comprueba explícitamente presencia ausente/
conocida antes/después y en proyección; `editar_articulo_comercial_test.dart`
comprueba mínimo/presencia de todas las variantes y que promover proveedores no
promueve el mínimo legado. Las 68 pruebas de ambas suites pasan con esas aserciones.
CSV conserva sus diez columnas solo para altas y doce para altas/actualizaciones;
no se agrega captura ni columna de mínimo. Resto de writers/undo/reentregas/conflictos
se conservan y pasan en la regresión, con el localizador individual en Casos.md.

No cambian código productivo, tablas, schemaVersion=8, generated Drift, contratos,
receptor ni navegación. Helpers de prueba usados; entrypoint manual retirado del
proyecto. Analyze confirma ausencia de imports/referencias sin uso introducidos.

## Comandos y resultados reales

Desde Flutter, salvo el runner Python en esta carpeta. Los conteos se superponen;
no se suman como casos adicionales. El código productivo es idéntico en todas
las corridas. Después de la suite completa solo se añadieron aserciones de
conservación a dos tests existentes; se repitieron ambas suites afectadas y analyze,
sin repetir las otras 2499 pruebas ni volver a iniciar servidores innecesariamente.

| Comando | Resultado | Evidencia |
|---|---|---|
| `flutter test test/presentation/pages/informes/minimum_stock_restore_test.dart --reporter expanded` final | Exit 0, 2 aprobadas en ambos modos | flutter-restore-final.log |
| `python3 run_http_regression.py` → cuatro arneses → `flutter test --reporter expanded` | Exit 0, **2567 aprobadas**, cero fallos/omisiones, **23 HTTP reales** | flutter-completo-final.log, http-run-result.json |
| `flutter test test/application/commands/articulos/actualizar_articulo_csv_test.dart test/application/commands/articulos/editar_articulo_comercial_test.dart --reporter expanded` tras reforzar aserciones | Exit 0, 68 aprobadas, cero fallos/omisiones | flutter-conservacion-final.log |
| `dart analyze` definitivo | Exit 0, No issues found | dart-analyze-definitivo.log |
| `flutter build macos --debug` con main normal, sin ejecutarlo | Exit 0 | flutter-build-final.log |
| `dart format --output=none --set-exit-if-changed test/presentation/pages/informes/minimum_stock_restore_test.dart` | Exit 0, 0 cambios | checks.log |
| `git diff --check` en Flutter, Nest y vault | Exit 0 en los tres | checks.log |
| `flutter devices --machine` | iPhone 17 emulator=true, macOS y Chrome; ningún teléfono/tablet físico | devices.json |
| `flutter run -d macos -t test/support/session5_manual_entry.dart`, tres arranques y `q` | Build/ejecución correctos, recorrido y dos reaperturas reales | manual-app*.log, Manual.md, manual-*.json |

`dart-analyze-final.log` es la primera ejecución limpia, anterior al refuerzo de
aserciones; `dart-analyze-definitivo.log` corresponde a los archivos finales.
No se ejecutó build_runner: no hubo cambio Drift. No se repitieron build/tests
Nest porque no cambió backend: [build de sesión 3](../2026-10-19-sesion3/nest-build-final.log)
y [50 suites/587 PostgreSQL aprobadas, cero skips](../2026-10-19-sesion3/nest-completo-final.log)
se conservan por hashes. La regresión HTTP final de sesión 5 sí usa el receptor real
vigente y PostgreSQL real, sin mocks ni aceptación simulada.

## PostgreSQL y HTTP de sesión 5

`run_http_regression.py` conserva los comandos exactos; `http-run-result.json`
registra cada ejecución/exit y cierre. PostgreSQL 18.4 de Postgres.app se inició
en un cluster temporal propio, host 127.0.0.1, puerto 52886; base descartable
`pos_nest_test_minimum_stock_session5`. Sin .env ni migraciones operativas.

Se ejecutaron cuatro instancias independientes del arnés existente Nest
`test/support/variant-tracking-server.ts`, con `node node_modules/ts-node/dist/bin.js`.
Cada una crea su propio schema con entidades reales; no ejecuta migraciones.
`environment-public.json` registra DATABASE_HOST/PORT/NAME y las URLs/schemas reales:

- POS_MINIMUM_SYNC_URL/POS_MINIMUM_PG_SCHEMA: siete pruebas del mínimo.
- POS_PHASE3_SYNC_URL: una prueba de seguimiento.
- POS_SUPPLIER_SYNC_URL/POS_SUPPLIER_PG_SCHEMA: nueve de proveedores.
- POS_BULK_SYNC_URL/POS_BULK_PG_SCHEMA: seis de recepción.

DATABASE_USER/PASSWORD solo pertenecen al cluster descartable y se definen en el
runner; no se reutilizan credenciales operativas. PATH incluye psql de Postgres.app.
Ningún schema/URL se comparte entre suites que comparan tablas completas.
Las cuatro URLs estaban habilitadas en la suite completa; **ningún skip cuenta
como aprobado**. Las 23 forman parte de las 2567, no se agregan al conteo.

Los cuatro servidores terminaron con exit 0, dejaron cero schemas HTTP, y pg_ctl
stop terminó con exit 0. Se eliminó su directorio temporal. `postgres-stop.log` y
`http-run-result.json` acreditan la limpieza. Las URLs archivadas son históricas,
los servidores están detenidos. No hay endpoint, cron o WebSocket nuevo de alertas.

## Manual, integridad y límites

[Manual.md](Manual.md) registra la app completa macOS con rutas temporales:
configurar cinco, venta confirmada de una pieza/un kg desde seis, observar dos
avisos, reponer cada variante a seis, ver retirada/contador cero/vacío, editar desde
informe a seis y 6,001 kg, cerrar/reabrir con mínimos, vaciar, cerrar/reabrir de nuevo.
El segundo reinicio muestra Sin mínimo para ambas y contador cero. Las variantes
comparten la venta, y cada una completa los pasos de inventario/editor individualmente.

`manual-invariants.json` compara literalmente balances, movimientos, ventas,
líneas/snapshots de consumo, pagos y refs de las etapas posteriores a la reposición:
ninguna edición de mínimo altera esos datos. Cero refs persistidos, entrega
not_required y sin evento de alerta. Copia final real `manual-final.sqlite`,
integrity_check=ok; el directorio manual aislado y entrypoint temporal se retiraron.
El debug app se reconstruyó desde el main de producción sin abrir datos operativos.

Los servicios de snapshot/restore se prueban integrados con catálogo/informe y
disco, en ambos modos. No se realizó autenticación/subida/descarga Google Drive;
ese transporte no cambia por esta funcionalidad y no se acredita con esta prueba.
La política local sigue siendo reset de desarrollo, no migración conservadora de
bases antiguas. El detector/protección evita aceptar o destruir restauradas incompatibles.

No hubo teléfono/tablet físico disponible. El simulador iPhone y los widgets
320/1024 con texto x2 son evidencia distinta. **A42 queda parcial**. Siguiente paso:
conectar hardware, abrir base aislada, capturar kg con teclado decimal real/coma,
verificar precisión, legibilidad/texto grande, scroll hasta mínimo/proveedores y
navegación Artículos/editor/informe/Caja; repetir venta/reposición/vacío/reapertura
y registrar modelo/SO/resultados. Solo después actualizar A42 y evaluar cierre total.
No hace falta rehacer sesiones 1–4 si su código sigue sin cambios.

## Incidencias intermedias conservadas

`flutter-restore-inicial.log`: primera corrida 1 aprobada/1 fallida por
pumpAndSettle virtual mientras continuaba la transacción SQLite en disco. Se añadió
espera acotada de cierre del editor, conservando todas las aserciones; focalizada
final 2/2 y suite completa 2567/2567. No se modificó guardado ni código productivo.

El capturador SQLite inicial consultó payload_json; la columna real es payload.
Se corrigió el script antes de generar la primera etapa; no escribió en la base.
En CUA, un atajo de selección concatenó 56 al editar el 5; se verificó y corrigió
explícitamente a 6. El evento intermedio real permanece en las lecturas, como
describe Manual.md. No se ocultan resultados ni se presenta ese manejo como fallo
funcional. Los avisos Drift de múltiples instancias y pg de deprecación en arneses
no produjeron fallos en las corridas definitivas.

## Documentación final

Matriz con localizador individual de los 42 casos, continuidad y estados de las
cinco sesiones, plan con estado de ejecución, mapa del vault y notas canónicas de
Artículos/catálogo/sincronización/payloads actualizados. Conservan propuestas fuera
de alcance y señalan expresamente A42 físico pendiente. Las evidencias 1–4 y los
otros planes conservan sus contenidos. No hay cierre total ni autorización de despliegue.
