# Sesión 3: servidor y sincronización — 2026-10-19

Completada en su alcance. Receptor, canónico y transporte del mínimo verificados
con PostgreSQL real y HTTP. La captura pública continúa para sesión 4.
No hubo commit, push, despliegue, migración operativa ni instalación de dependencias.

## Base, instrucciones y preservación

Se leyeron la solicitud de sesión 3, plan, matriz, continuidad, evidencias 1–2,
AGENTS del vault/Nest/Flutter y las dos guías offline de Flutter. Se inspeccionó
Git antes de editar y se guardaron HEAD/SHA256 en baseline.json.

HEAD continúa en Flutter 3e8e1ed, Nest dcc2907 y vault b077dc7. De los archivos
preexistentes modificados o sin versionar al comenzar, permanecen idénticos
40/42 Flutter y 8/9 Nest; las únicas diferencias de ese conjunto son las dos
guías Flutter y la guía Nest actualizadas deliberadamente. Todo el código,
contratos, esquema, fixtures y pruebas de sesiones 1–2 permanecen idénticos,
incluidos los quince archivos ajenos de editor/informe. No se rehízo persistencia
local. Los cambios previos ajenos del vault se conservaron; solo matriz y
continuidad del plan cambian entre los 223 archivos de la línea base.
Comparación íntegra y hashes finales en preservation.json y manifest.json.

## Archivos de esta sesión

Rutas relativas al proyecto indicado. Los archivos nuevos no se incorporaron a Git.

| Proyecto/archivo | Resultado |
|---|---|
| Nest `src/sync/producto-event.handler.ts` | Snapshot vigente reconstruye mínimo/presencia; altas/ediciones persisten bigint/null; retirada y borrado lógico conservan umbrales; rechaza antiguo sobre base conocida |
| Nest `src/sync/payloads/supplier-event-identity.ts` | El sobre estricto y deduplicación compartidos incluyen también mínimos sin suppliers; mismo event_id con otra presencia/valor no se acepta |
| Nest `src/sync/product-suppliers.postgres.spec.ts` | Veinte casos nuevos dentro del arnés PostgreSQL/SyncService existente, además de su regresión de proveedores |
| Nest `docs/minimum_stock_contract.md` | Estado implementado del receptor, compatibilidad, verificación y despliegue futuro |
| Flutter `test/integration/minimum_stock_server_test.dart` | Siete recorridos HTTP reutilizando ProductSupplierHarness/VariantTrackingHarness, SQLite en disco y servicios reales de push/pull/preflight/reporte |
| Flutter `docs/architecture/minimum_stock_contract.md`, `offline_feature_flow.md` | Alcance remoto acreditado, variables del arnés y siguiente sesión |
| Vault matriz y continuidad | Estados remotos A08/A10–A15/A27–A30/A32–A35, comandos, límites y siguiente paso |
| Vault `03 - Dominio/Modulos/Articulos.md`, `05 - Datos/Catalogo e inventario.md`, `04 - Sincronizacion/Flujo push pull.md` | Nota canónica del core/sync implementados y UI pendiente |

No se modificaron tablas, migraciones, versión local, generado Drift, endpoints,
cron ni WebSocket. La migración de sesión 1 vuelve a verificarse en la regresión
PostgreSQL, únicamente en la base aislada.

## Comportamiento acreditado

- La presencia proviene del evento aceptado vigente de products.last_event_id,
  además de la defensa por valores físicos. SQL null solo no decide conocimiento.
  Un intento actual rechazado no promueve historia legada.
- Alta legada guarda null físico y omite el campo en canónico/pull. Edición legada
  sobre base legada se acepta y conserva omisión. Un cliente actual promueve
  before a null conocido y declara after completo sin relajar otros campos.
- Valores físicos existentes con metadata legada, también en variantes retiradas,
  quedan protegidos. Un before que finge null ante un valor físico se rechaza;
  un cliente actual que declara correctamente el valor puede editar.
- Base conocida rechaza edición/borrado legado con «Actualiza la app para editar
  o borrar este artículo», también con null conocido. Base falsa, evento obsoleto,
  versión incorrecta o secuencia falsa siguen rechazados/en conflicto según el
  protocolo anterior. Proveedores conserva su compatibilidad independiente.
- Creación/edición soportan null, cero, positivo, 1500 átomos medidos y máximo
  común. Strings, booleanos, fracciones, negativos y exceso de rango se rechazan
  sin cambiar el catálogo. Snapshot parcial o before/after mixtos se rechaza;
  no se borra minimum_stock_atomic para canonicalizar un evento incompleto.
- Retirada conserva mínimo físico y proveedores; alta de otra variante mantiene
  el contrato completo. Borrado lógico conserva mínimos de activas e históricas.
- El arnés PostgreSQL inyecta fallo después de proyectar: revierte evento, refs
  y catálogo completos. Dos pushes concurrentes reales dan un aceptado y un
  conflicto. Reentrega idéntica mantiene estado; mismo ID con contenido diferente
  se rechaza, también sin suppliers en el payload.
- HTTP usa dos clientes actuales A/B y C vacío, con paginación y replay ordenado.
  Compara payload, presencia, versión, evento, secuencia, saldos y condición de
  dominio de existencia baja. Verifica cadenas causales, pendientes tras cierre
  y reapertura, confirmaciones y ecos que no pisan una edición posterior.
- Preflight de cambios concurrentes entre variantes restaura ganador y marca
  dependientes en conflicto. Se reportan conflictos al servidor y la resolución
  se acredita con un nuevo comando sobre la base oficial. Reapertura y limpieza
  tardía de perdedores no pisan el nuevo mínimo/barcode aceptados.
- Rechazo HTTP real de una base falsa revierte raíz y dependiente, también tras
  reapertura. Borrado optimista legado rechazado restaura valor/presencia desde
  undo. Una restauración tardía respeta otro evento aceptado posteriormente.
- Cambiar solo mínimo compara recursos, balances, movimientos, ventas, líneas y
  pagos no vacíos en PostgreSQL antes/después; todos idénticos. SQLite también
  conserva tablas y clave de consumo. Una venta abierta confirma después del
  cambio y lleva el saldo físico a 4 con mínimo 4, convergente en A/B.
- Standalone conserva not_required y cero event_refs persistidos. La regresión
  incluye minimum_stock_local_test y guardas reales de DI/runtime en
  asignar_codigo_barras_variante_test, editar_articulo_comercial_test (M41),
  proveedor_dependencies_test y product_suppliers_transport_safety_test. No se
  habilitaron servicios remotos ni se promovió historial standalone a pendiente.

## Entornos y variables habilitadas

PostgreSQL 18.4 arm64 de Postgres.app, Node 26.0.0/npm 11.12.1 y Flutter 3.41.6 /
Dart 3.11.4. Runtime Flutter detallado en flutter-version.log.

Se creó un cluster propio con initdb/pg_ctl en un directorio temporal del sistema,
trust local, puerto 61042 y host 127.0.0.1. No se cargó .env ni se conectó a la
instalación operativa. Bases descartables:

- Nest: pos_cash_test_minimum_stock_session3, con RUN_POSTGRES_INTEGRATION=1.
- HTTP: pos_nest_test_minimum_stock_session3, cuatro instancias del arnés
  `pos-nest/test/support/variant-tracking-server.ts`. Cada instancia crea su
  schema con synchronize sobre entidades reales y no ejecuta migraciones.

| Variable real de esta ejecución | Valor |
|---|---|
| POS_MINIMUM_SYNC_URL | http://127.0.0.1:61110 |
| POS_MINIMUM_PG_SCHEMA | seg_phase3_http_85371_1792416322267 |
| POS_PHASE3_SYNC_URL | http://127.0.0.1:62880 |
| POS_SUPPLIER_SYNC_URL | http://127.0.0.1:62878 |
| POS_SUPPLIER_PG_SCHEMA | seg_phase3_http_88442_1792416669324 |
| POS_BULK_SYNC_URL | http://127.0.0.1:62879 |
| POS_BULK_PG_SCHEMA | seg_phase3_http_88426_1792416669385 |
| DATABASE_HOST / DATABASE_PORT | 127.0.0.1 / 61042 |
| DATABASE_NAME para Flutter | pos_nest_test_minimum_stock_session3 |

environment-public.json conserva esas variables sin credenciales. DATABASE_USER y
DATABASE_PASSWORD se configuraron solo para el cluster temporal; los tests
existentes exigen password no vacío aunque trust no lo use. No se publican sus
valores. PATH incluyó `/Applications/Postgres.app/Contents/Versions/18/bin` para
las comprobaciones psql. Las URLs son evidencia histórica: los cuatro servidores
y el cluster están detenidos; cleanup.log acredita cero schemas HTTP restantes.

No compartir un target entre suites HTTP concurrentes que comparan tablas
completas o inyectan un evento futuro. Esta ejecución final usa un schema/URL
por suite. No se modificaron los tests históricos para eludir sus comparaciones.

## Comandos y resultados definitivos

Desde el repositorio correspondiente, tras configurar las variables anteriores
y las credenciales temporales. Salidas completas adjuntas; no se suman corridas
superpuestas como pruebas distintas.

| Comando | Resultado | Log |
|---|---|---|
| Nest `npm run build` | Exit 0 | nest-build-final.log |
| Nest `RUN_POSTGRES_INTEGRATION=1 npm test -- --runInBand` | Exit 0; 50 suites, 587 aprobadas, cero fallos/omisiones | nest-completo-final.log |
| Flutter `dart analyze` | Exit 0; No issues found | dart-analyze-definitivo.log |
| Flutter `flutter test --reporter expanded` con cuatro URLs/schemas | Exit 0; 2540 aprobadas, cero fallos/omisiones | flutter-completo-final.log |
| Flutter `flutter test test/integration/minimum_stock_server_test.dart --reporter expanded` | Exit 0; 7/7 HTTP reales | flutter-http-definitivo.log |
| Nest `npx prettier --check` de los tres TypeScript de sesión 3 | Exit 0 | checks.log |
| Flutter `dart format --output=none --set-exit-if-changed test/integration/minimum_stock_server_test.dart` | Exit 0 | checks.log |
| Ambos proyectos y vault `git diff --check` | Exit 0 | checks.log |
| Comparación SHA256 de línea base y archivos finales | Código previo intacto; solo docs previstas difieren | preservation.json |

Las 2540 incluyen 23 integraciones HTTP: las 16 históricas antes omitidas
(recepción 6, proveedores 9, seguimiento 1) y las siete nuevas del mínimo.
Los veinte casos nuevos Nest forman parte de las 587; no son un conteo añadido.
No se necesitó build_runner: no cambiaron tablas ni generado Drift.

Inicio de cada servidor (ejecutado cuatro veces con distinto archivo de salida):

```sh
# DATABASE_* ya apunta al cluster temporal y base pos_nest_test_*.
POS_PHASE3_URL_FILE="$TEMP_RESULT_DIR/http-minimum.json" npx ts-node test/support/variant-tracking-server.ts
```

El arnés escribe URL/schema dinámicos en ese JSON. Asignarlos a la pareja de
variables de la suite correspondiente y habilitar las cuatro URLs antes de
`flutter test`. Para la regresión Nest cambiar DATABASE_NAME a la base
pos_cash_test_* indicada; conservar RUN_POSTGRES_INTEGRATION=1 y los otros datos
del mismo cluster aislado. No usar .env operativa para reproducir estos comandos.

postgres-summary.json y su consulta SQL conservan un resumen real del schema de
mínimos tras las corridas (incluye historia de intentos intermedios; no es conteo
de pruebas). Las comparaciones de invariantes por producto ocurren dentro de las
pruebas, antes/después de cada operación.

## Incidencias intermedias corregidas

- Primera focalizada Nest: 62 aprobadas, dos fallos de datos de prueba al asumir
  que producto_creado tenía dos variantes. Se añadió explícitamente la segunda
  variante a los fixtures de parcial/retirada; la corrida final incluye ambos
  casos correctos. Logs nest-focal*. No se debilitó el receptor.
- Primera HTTP nueva: cuatro aprobadas/tres fallos. Se intentó corromper el tipo
  del mínimo en un evento pendiente; el lector local lo rechazó antes de red,
  por lo que no acreditaba rechazo remoto. El caso final envía una base falsa
  pero tipada, conserva el payload de undo original y recibe rechazo HTTP real.
  Los tipos inválidos se prueban por envío HTTP directo al receptor. También se
  asignaron secuencias/dispositivos únicos a las solicitudes sintéticas: antes
  se detenían por secuencia local reutilizada, sin llegar al caso pretendido.
- Primer analyze: cuatro infos de llaves en bucles/if del test nuevo. Corregidas;
  análisis definitivo limpio.
- Primera regresión Flutter con URLs habilitadas: 2537 aprobadas, tres fallos,
  cero omisiones. Varias suites concurrentes compartían target: el pull repetido
  recibía eventos ajenos y la comparación de movimientos incluía nuevas filas
  de otra suite. Además faltó POS_SUPPLIER_PG_SCHEMA para el caso SQL histórico.
  Se configuraron cuatro targets/schemas independientes y todas las variables.
  Resultado final 2540/2540 sin cambiar esos tests ni relajar expectativas.
- Logs incluyen avisos Drift de múltiples instancias de arneses y deprecación pg
  sobre client.query concurrente. Las bases usan executors aislados; ninguna
  advertencia produce fallo en las corridas definitivas.

## Límites y continuación

A08, A10–A15, A27–A30 y A32–A35 quedan acreditados en el alcance remoto solicitado;
A35 ya estaba verificado en sesión 1 y vuelve a pasar su suite de migración.
A31 se conserva en la regresión de modo/DI/runtime. Ningún skip o mock acredita
sincronización; las pruebas nuevas usan recepción real y almacenamiento real.
El fallo transaccional es una inyección deliberada alrededor del handler real.

La presentación pública de mínimos, filas/filtro/contador y cancelación del
editor continúan para sesión 4. Pruebas manuales/físicas y cierre global siguen
para sesión 5; no se acredita dispositivo físico con estas pruebas.

En un despliegue futuro, preparar y verificar esquema/receptor compatibles
antes de habilitar escritores nuevos. Un servidor anterior no admite el nuevo
contrato. Esta sesión no autoriza despliegues ni migraciones operativas.
