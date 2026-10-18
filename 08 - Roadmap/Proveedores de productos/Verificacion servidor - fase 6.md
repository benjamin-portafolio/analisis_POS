---
tipo: evidencia_implementacion
estado: fase_6_completa
revision_plan: 1
actualizado: 2026-10-08
---

# Verificación del servidor: fase 6

Criterio de salida satisfecho: contratos con los fixtures Dart existentes,
esquema PostgreSQL conservador, handlers atómicos/idempotentes, dependencias y
referencias verificadas, y protección de precios frente a ediciones legadas.
La fase 7 queda pendiente; Flutter sigue sin habilitar proveedores en server_sync.

## Entorno y preservación

- NestJS: rama main, HEAD e451d1b4d9b9a4182aa41d3e8a525bf60c465c3e;
  estado inicial limpio. 10 archivos existentes modificados y 23 nuevos,
  incluidos documentación, pruebas y los siete fixtures.
- Flutter: main, HEAD 56ddbc49f7369b2598aabe3c67b03135b7c89b46, con cambios
  preexistentes. Solo cambia docs/architecture/product_suppliers.md; otros
  755 archivos inventariados de lib/test/docs/AGENTS permanecen idénticos.
- Análisis: main, HEAD 424c8bb7995f49a2255e97c778155efd31b1f648, con cambios
  previos conservados. Se actualiza Estado y continuidad.md y se agregan este
  informe y la evidencia. Plan revisión 1 y AGENTS.md no cambian.
- Node v26.0.0 y PostgreSQL 18.4 (Postgres.app, aarch64).

Se creó un cluster independiente con initdb, directorio temporal propio,
usuario phase6 y escucha exclusiva en 127.0.0.1:60832. Se usó primero phase6_test
y después pos_cash_test_fase6 para respetar la protección de nombre de las
suites de Caja/saldo bancario. Los demás tests crean y eliminan esquemas
sintéticos aislados. No se conectó una base del usuario ni se arrancó su app.

Los hashes iniciales/finales, estados Git, delta e inventario están en
`Evidencia/2026-10-08-fase6/`. La evidencia conserva logs/JSON de corridas
intermedias fallidas y las aprobadas, sin confundirlas. No se hicieron commits,
push, despliegues ni cambios al historial standalone.

## Comandos y resultados finales

Ejecutados en pos-nest:

```sh
npm run build
npm test -- --runInBand --json --outputFile='<evidencia>/unit-final.json'
git diff --check
```

Y con el PostgreSQL temporal:

```sh
RUN_POSTGRES_INTEGRATION=1 \
DATABASE_HOST=127.0.0.1 DATABASE_PORT=60832 \
DATABASE_USER=phase6 DATABASE_PASSWORD=isolated-test \
DATABASE_NAME=pos_cash_test_fase6 \
npm test -- --runInBand --json --outputFile='<evidencia>/postgres-final.json'
```

`<evidencia>` es `08 - Roadmap/Proveedores de productos/Evidencia/2026-10-08-fase6`
del repositorio de análisis. Los JSON de comandos conservan las rutas absolutas,
argumentos, variables sintéticas y exit codes exactos.

Ejecutado en Flutter sin cambiar código:

```sh
flutter test \
  test/application/sync/payloads/proveedor_payload_test.dart \
  test/application/sync/payloads/producto_suppliers_payload_test.dart \
  --reporter json
```

| Verificación | Resultado final |
|---|---|
| Build | Exit 0 |
| Suite ordinaria | 21 suites / 314 pruebas aprobadas; 27 suites / 193 pruebas PostgreSQL omitidas por opt-in |
| Suite completa con RUN_POSTGRES_INTEGRATION=1 | 48 suites / 507 pruebas aprobadas; cero fallos, cero omisiones; 6.534 s |
| Contratos Dart existentes | 68 aprobadas; cero fallos/omisiones; 2.169 s |
| Fixtures Dart/TS | Siete archivos idénticos byte por byte, SHA256 comparado |
| git diff --check: NestJS, Flutter y análisis | Exit 0 |
| Preservación | Fuentes funcionales Flutter y plan intactos; sin archivos previos eliminados |

La suite ordinaria omitida no acredita PostgreSQL. Esa verificación se obtiene
exclusivamente de postgres-final.json/log y su comando con la variable activa.
El inventario `postgres-final-casos.json` registra los 507 resultados por nombre.

## Cobertura nueva y regresiones

121 pruebas nuevas: 67 de contratos TS, 44 de proveedores/productos con
PostgreSQL y 10 de migración PostgreSQL.

| Área | Evidencia ejecutada |
|---|---|
| Contratos/normalización | supplier-contracts.spec.ts y los dos tests Dart: siete roundtrips, nombre requerido, opcionales, teléfono, UUID, dinero/fecha seguros, duplicados, dependencias, campos futuros, listas inmutables, constructores y sameState/sameEditingBase |
| Migración anterior con datos | CreateProductSuppliers.postgres.spec.ts: esquema anterior reducido con productos/variantes/eventos/recetas no vacíos; runMigrations, segundo run sin cambios, up repetido y comparación literal de filas |
| Restricciones | PK compuesta, bigint, cero/máximo, límites inválidos, fracción, FK huérfanas, RESTRICT, CASCADE y down que protege datos |
| Catálogo | Alta/edición, mismo nombre en dos proveedores, sobre/payload inválidos, identidad/base/versión/secuencia/before, concurrencia e idempotencia tras edición |
| Atomicidad | Fallo deliberado después de escribir proveedor/refs y producto/precios; snapshot completo recuperado por rollback y reintento correcto |
| Relaciones | Varios proveedores/variantes y proveedor compartido; cero y máximo de fecha/precio; edición de otros campos conserva las parejas; receta medida; directo→receta→ninguno conserva precios, fechas y saldo |
| Dependencias | Proveedor inexistente, alta ausente, de otro proveedor, editada, no aceptada o distinta de created_event_id; confirmado sin causal y alta original tras edición |
| Retirada y ciclo de vida | Retirada del último proveedor con []; deps históricas de before no obligan entrega; refs retiradas; variante inactiva conserva historia; borrado lógico/físico y replay sin resucitar |
| Compatibilidad | Replay legado mantiene omisión; promoción exacta de base vacía; before no puede inventar precios; estado conocido vacío no vuelve a legado; parser antiguo que elimina campos no borra precios |
| Concurrencia de producto | Dos ediciones de proveedores distintos compiten por una sola base del producto; el estado final corresponde a un ganador completo, sin arbitraje por fecha |
| Sync existente | Registro/dispatch, deduplicación de intención, colisión device/local_sequence, rechazo de reutilización de ID, notificación de aceptados, preflight de conjuntos retirados y pull sin rechazados |
| Regresiones completas | Producto, variantes, recetas, recursos/movimientos/memoria, ventas tardías, clientes/crédito, Caja, saldo bancario, finanzas, categorías, payloads y migraciones previas |

## Decisiones de compatibilidad

No hay una columna nueva de conocimiento en productos. El último evento
aceptado preserva la presencia del campo; la proyección se reconstruye con filas
actuales. Por eso [] permanece conocido incluso sin relaciones. sameState
mantiene ausencia y vacío distintos. sameEditingBase solo promueve una base
legada sin relaciones a before completo con []. After también debe ser completo.
La omisión no sustituye un conjunto; una edición legada contra uno conocido
se rechaza sin tocar la proyección.

Las dependencias supplier coinciden exactamente con la unión de precios de
cada snapshot. After se valida contra catálogo/altas aceptadas; before conserva
historia y no exige entregar proveedores retirados. Cuando se declara un evento,
se comprueban tipo, agregado, identidad, estado synced y supplier.created_event_id.
Una edición de nombre no cambia el alta causal válida para el producto.

Se conservan el producto completo como agregado concurrente y el flujo existente
de variantes inactivas. La pareja no tiene versión/evento independiente. Refs
supplier/affects, variant_suppliers/affects y supplier/uses se deduplican e incluyen
uniones retiradas y variantes históricas en borrado lógico. Se mantienen las refs
anteriores y se utiliza la misma infraestructura de conflictos/transacciones.

El contrato detallado está en pos-nest/docs/product_suppliers.md y el contrato
Flutter incorpora el cierre del servidor. Los endpoints mantienen sus respuestas;
pull distribuye todos los eventos aceptados, sin filtrar por versión/capacidad.
No se presupone que los parsers antiguos conserven campos. La coordinación de
lectura y habilitación entre versiones corresponde a fase 7.

## Correcciones durante la verificación

Las corridas fallidas se conservan y no cuentan como aprobación:

- La comparación de deduplicación basada en prototipos distinguía arrays
  construidos por pg/Jest aunque el JSON fuera idéntico. Se compara ahora JSON
  canónico por valor; reintentos de altas después de editar/eliminar pasan.
- Se corrigieron datos sintéticos de saldo y la expectativa SQLSTATE de RESTRICT
  observada en PostgreSQL 18.4. La comprobación posterior al down califica el
  esquema para no confundir las tablas públicas sintéticas de otras suites.
- Los seeds de seguimiento guardaban last_server_sequence=null y generaban
  secuencias distintas de 41/42 reservadas en sus fixtures. Ahora acreditan esas
  secuencias reales y el metadato del producto/variantes. Los fixtures no cambian.
- La primera corrida completa no satisfacía el prefijo de base temporal exigido
  por Caja/saldo bancario. Se creó una segunda base dentro del mismo cluster.
- AccountBalanceBaselineEventHandler usaba findOne sin where, rechazado por la
  versión instalada de TypeORM. El único cambio funcional fuera de proveedores
  añade where:{} manteniendo su selección global más antigua. Sus ocho pruebas
  PostgreSQL pasan, incluida identidad, unicidad, causalidad e idempotencia.
- Ocho casos adicionales quedaron inicialmente fuera del callback de integración
  por la preparación del archivo; se corrigió su ubicación. Las corridas finales
  los ejecutan con PostgreSQL y los omiten únicamente en la suite ordinaria.

## Límites reales

La migración con datos utiliza un esquema previo reducido, no una copia de una
base de producción. La integración utiliza además las entidades completas y las
tablas nuevas recreadas con la migración real. No se migraron datos del usuario.
No hubo pruebas de despliegue, dispositivos físicos, transporte Flutter ni dos
terminales; no se habilitó la interfaz remota ni se probaron revalidadores nuevos.

JavaScript pierde la diferencia léxica entre 1 y 1.0 tras JSON.parse. Los contratos
TS validan valores enteros seguros y rechazan strings/fracciones/excesos; no se
agregó un parser de tokens numéricos a los endpoints. Quoted_at_ms conserva todo
el rango contractual, incluso mayor que Date.

La suite completa emitió dos advertencias pg por llamadas en un cliente ocupado;
no causaron fallos y su origen no se investigó aquí. No hay omisiones PostgreSQL
en el resultado final. El cluster temporal se detuvo al cerrar la verificación;
su limpieza está registrada en postgres-limpieza.json.

Fase 7: habilitación remota en Flutter, dependencias/revalidadores, restauración
de conflictos y dos terminales, manteniendo standalone sin transporte, sin refs
persistidas y con delivery_status=not_required. No comenzar sin esa solicitud.
