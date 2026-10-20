# Sesión 1: contratos y esquemas — 2026-10-19

Resultado final: sesión 1 completa en su alcance de contratos y esquemas.
No se habilitó captura pública. Persistencia por eventos, conservación en todos
los escritores y sincronización del mínimo siguen pendientes de sesiones 2–3.

## Árboles e instrucciones

Flutter HEAD `3e8e1ed`; NestJS HEAD `dcc2907`. HEAD completo y hashes de archivos
en `manifest.json`. Se leyeron AGENTS de análisis/Flutter/Nest, las dos guías
offline de Flutter, la solicitud de sesión 1, el plan, matriz y continuidad.

Git se revisó antes de editar. Los 15 archivos modificados/nuevos previos de
Flutter conservan su hash, incluido editor de variantes e informe de
existencias. No se tocaron los cambios previos del vault en CSV, mapa ni
edición masiva. No hubo commit, push, despliegue ni instalación de dependencias.

## Implementación

Flutter (rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`):

- `lib/data/local/drift/tables/product_variants.dart`: campo nullable documentado,
  rango 0..9007199254740991 y CHECK de tipo entero SQLite.
- `lib/data/local/drift/current_database_schema.dart`: exige nueva columna en
  detector compartido de arranque/restore; versión 8 y política de reset intactas.
- `lib/data/local/drift/app_database.g.dart`: generación Drift (81 líneas añadidas).
- `lib/application/sync/payloads/producto_creado_payload.dart`: valor/presencia,
  validación, round-trip, snapshots completos y copia/promoción explícita.
- `lib/application/sync/payloads/producto_actualizado_payload.dart`: coherencia de
  before/after, comparación de negocio y promoción/rechazo en sameEditingBase.
- `test/application/sync/minimum_stock_contract_test.dart`,
  `test/data/local/drift/minimum_stock_schema_test.dart` y
  `test/fixtures/minimum_stock_v1/contracts.json`: pruebas y vectores compartidos.
- `docs/architecture/minimum_stock_contract.md` y enlace/precisión de detector en
  `docs/architecture/offline_feature_flow.md`.

NestJS (rutas relativas al proyecto pos-nest):

- `src/entities/product-variant.entity.ts`: bigint nullable, comentario y CHECK.
- `src/migrations/1792368000000-AddVariantMinimumStock.ts`: up aditivo repetible y
  down protegido si queda cualquier mínimo no nulo, incluido cero.
- `src/app.module.ts`: registro de la migración con migrationsRun=false;
  conserva synchronize=true de desarrollo. No inicia migraciones automáticas.
- `src/sync/payloads/producto-creado.payload.ts` y
  `producto-actualizado.payload.ts`: equivalentes tipados Dart/TypeScript.
- `src/sync/payloads/minimum-stock-contract.spec.ts`,
  `src/migrations/1792368000000-AddVariantMinimumStock.postgres.spec.ts`,
  `test/fixtures/minimum_stock_v1/contracts.json` y
  `docs/minimum_stock_contract.md`.

Vault: matriz, continuidad y esta carpeta de evidencia. El plan y la solicitud
originales se conservan como referencia; la implementación vigente se acredita
con este registro, no con las descripciones de la inspección inicial del plan.

## Decisiones de contrato

Dart usa int? minimumStockAtomic y bool knowsMinimumStock. Un número acredita
presencia; un null explícito de constructor requiere knowsMinimumStock=true.
El null por defecto anterior no representa intención de retirada. TypeScript
usa minimumStockAtomic?: number|null, con undefined como ausencia.

Un snapshot declara el campo en todas sus variantes o lo omite en todas.
Before/after conservan el mismo conocimiento. Las copias/promociones preservan
proveedores y su política independiente. sameState compara valores y considera
ausencia/null equivalentes en negocio; sameEditingBase rechaza cualquier before
legado cuando current conoce mínimos. La promoción desde legado solo admite
null y exige los demás campos exactos. No se tocaron evento, versión o secuencia.
Los JSON de borrado conservan before y after=null.

Los fixtures son idénticos en ambos repositorios (15 creaciones, 9 ediciones,
19 comparaciones). Cubren legado, null, cero, positivo, medido, máximo,
inválidos, snapshots parciales, degradación y proveedores. Hash SHA256:
`390c2720a6413e7a87afbe5fc07733526dab97e8de2f372b6dc0522189002295`.

Se valida valor numérico entero seguro; 1.0 y 1 son equivalentes. JavaScript no
preserva su grafía JSON. Se rechazan fracciones no enteras, strings, booleanos,
negativos, desbordamiento y no finitos. El codec existente acredita 1.5 kg =
1500 átomos y rechazo de precisión excesiva/fracciones de pieza; no hay captura
ni evaluación del saldo/aviso implementadas en esta sesión.

## Aislamiento

SQLite: NativeDatabase.memory o directorios del sistema con path_provider
simulado. Ninguna prueba abre la instalación operativa. Se verifica columna,
constraints, reset ante ausencia, protección de respaldo incompatible con hash
idéntico, validación antes de reemplazar y reopen/snapshot/restore directo.
Para simular ausencia local se renombra la columna en la copia temporal.

PostgreSQL: cluster propio creado mediante initdb/pg_ctl de Postgres.app en
un directorio `/tmp/pos_minimum_stock_pg_*`, trust local, usuario
minimum_stock_test, host 127.0.0.1, puerto 57079. PostgreSQL 18.4 arm64. No se
carga .env. La base final fue pos_cash_test_minimum_stock_session1. Cada nueva
prueba de migración crea y elimina su esquema con timestamp; arranca desde las
entidades reales, retira solo la columna añadida y conserva filas previas de
productos, variantes, recursos, balances, movimientos y eventos. Se comparan
literalmente antes/después de up y down. El CHECK de la entidad se prueba antes
de retirar la columna, además del CHECK de la migración.

La instancia temporal se detuvo y eliminó al cerrar la sesión. La regeneración
y las pruebas no ejecutaron migraciones ni limpiezas en bases del usuario.

## Comandos y resultados finales

Ejecutados desde el repositorio indicado; salida completa en los archivos .log
adjuntos. Flutter 3.41.6 / Dart 3.11.4; Node 26.0.0 / npm 11.12.1.

| Proyecto | Comando | Resultado |
|---|---|---|
| Flutter | `dart run build_runner build` | Exit 0; 233 s; 650 outputs internos, solo app_database.g.dart cambió entre generados versionados |
| Flutter | `dart analyze` | Exit 0; No issues found |
| Flutter | `flutter test test/application/sync/minimum_stock_contract_test.dart test/data/local/drift/minimum_stock_schema_test.dart` | Exit 0; 57 aprobadas, cero fallos/omisiones |
| Flutter | `flutter test` | Exit 0; 2492 aprobadas, 16 omitidas HTTP, cero fallos |
| Nest | `npm run build` | Exit 0 |
| Nest | comando PostgreSQL completo de abajo | Exit 0; 50 suites, 567 aprobadas, cero fallos/omisiones |
| Nest | `npx prettier --check` limitado a los siete archivos TypeScript de la entrega | Exit 0 |
| Ambos | `git diff --check` | Exit 0 |
| Ambos | comparación binaria/hash de fixtures | Idénticos |
| Flutter | hashes de archivos ajenos contra registro previo | 15/15 preservados |

```sh
RUN_POSTGRES_INTEGRATION=1 \
DATABASE_HOST=127.0.0.1 DATABASE_PORT=57079 \
DATABASE_USER=minimum_stock_test DATABASE_PASSWORD=isolated-test \
DATABASE_NAME=pos_cash_test_minimum_stock_session1 \
npm test -- --runInBand
```

No ejecutar este comando sobre una base operativa: algunas suites existentes
truncan tablas y exigen deliberadamente el prefijo de base temporal. El puerto
mostrado corresponde únicamente al cluster descartable de esta ejecución.

Las 16 omisiones Flutter son seis de recepción masiva, nueve de proveedores y
una de seguimiento. Faltaban POS_BULK_SYNC_URL, POS_SUPPLIER_SYNC_URL y
POS_PHASE3_SYNC_URL. Ninguna se contabiliza aprobada ni acredita HTTP o dos
clientes para el nuevo mínimo. No hubo prueba manual, física ni despliegue.

## Corridas intermedias e incidencias

- Flutter focalizado inicial: 54 aprobadas / 3 fallidas. La prueba de 1.0 tenía
  una expectativa que no coincidía con TypeScript y el guard numérico existente
  lanzaba UnsupportedError con infinito. Se añadió guard de finitud para este
  campo y se alineó el vector de valor entero. Final: 57/57.
- Nest focalizado inicial: 59/59 con PostgreSQL, antes de añadir el vector 1.0.
  La regresión final incluye las 60 nuevas pruebas (49 contrato + 11 esquema).
- Regresión Nest inicial: 91 fallos por DATABASE_PASSWORD vacío exigido por
  arneses; siguiente intento 29 fallos por prefijo DATABASE_NAME, resolución
  de uuid_generate_v4 y una carrera en financial-events. Se corrigieron las
  variables de prueba y search_path del nuevo test para resolver UUID desde
  public. No se modificó código financiero; el último recorrido completo
  pasó las 567 pruebas. Esa corrida intermedia no se presenta aprobada.
- Los logs contienen avisos Drift por varias instancias en pruebas y un aviso
  de deprecación pg sobre client.query concurrente; no hubo fallos finales.

## Alcance acreditado y siguiente paso

A09 y A35 completos en esquemas; A36 acreditado con archivos SQLite temporales.
A08/A11/A12 verificados en contratos. A06/A07/A10/A13/A14/A15 y A37 parciales
según la matriz. Especialmente, un parser aprobado no acredita la aplicación
funcional de eventos ni el rechazo con mensaje desde comando/receptor.

Sesión 2: intenciones conservar/establecer/retirar, validación en comando,
DTOs/proyecciones/DAO/repositorios, snapshots que reconstruyen conocimiento desde
el evento base, pendientes/undo/reversión, no-op y conservación en barcode,
CSV, edición masiva/recepción, recetas y retirada en ambos modos. Mantener
refs declaradas/validadas en ambos modos, persistidas solo en server_sync y
standalone not_required sin actividad remota. Sesión 3 completa receptor y
sincronización; sesión 4 habilita captura pública tras verificar el core.
