---
tipo: seguimiento
estado: fase_3_verificada_fase_4_pendiente
revision_contrato: 1
actualizado: 2026-10-04
---

# Seguimiento de existencias: estado y continuidad

## Estado real

Plan y especificación documentados el 2026-10-02. El usuario aceptó recuperación
del recurso anterior y limpieza limitada. La ejecución se divide en cinco fases.

**La fase 1 (contratos y esquemas) está implementada y verificada** el 2026-10-02
y **la fase 2 (servidor) el 2026-10-03**.

**La fase 3 (Flutter y sincronización) quedó corregida y verificada en su alcance**
el 2026-10-04, tras la petición «corrige los fallos de la fase 3». Memoria derivada,
recuperación legada, descarte standalone, undo exacto, eco, DI y transporte real
están probados. Evidencia actual: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].
Los relevos de bloqueo anteriores se conservan como historial y quedan superados
por esta corrección únicamente en el alcance core/transportes comprobado.

| Entrega | Estado | Evidencia |
|---|---|---|
| 1. Contratos y esquemas | **Completa** | Contrato rev. 1; migraciones/esquemas revalidados en aislamiento |
| 2. Servidor | **Completa en su alcance** | 44 pruebas PG pertinentes aprobadas; HTTP real con SQLite clientes |
| 3. Flutter y sincronización | **Verificada en su alcance** | 43 pruebas SQLite nuevas + 1 HTTP real; analyze/build_runner/build correctos; suite 1061/1/0, una búsqueda preexistente |
| 4. Interfaz | **Pendiente, prerrequisito core satisfecho** | No se implementó UI de recuperación, selector, resultados de descarte ni revisión tablet |
| 5. Verificación y cierre | **No iniciada; falta fase 4** | La matriz mantiene límites de UI/físicos; no se cierra el plan |

El command recupera el mismo ID con historial/saldo cero y no agrega iniciales.
El handler deriva memoria; push/eco avanzan solo la fuente correspondiente. El
update captura/restaura memoria exacta o ausencia. Standalone puede emitir el
descarte después de la edición en una transacción SQLite exterior; el handler
revalida y el tombstone comprobado impide resurrección. Server_sync conserva
recurso/balance y rechaza descarte externo. El resultado del commit devuelve IDs
descartados/motivos para que fase 4 los presente. La UI actual todavía no consume
ese resultado ni la resolución durable al abrir.

Siguiente paso: **fase 4 — Interfaz**. Fase 5 y el plan permanecen abiertos.
No hubo commit, despliegue ni migraciones en dev; se conservaron cambios ajenos.

**Decisiones vigentes sobre la base dev `pos_nest`:**
- 2026-10-02: la migración `1790774400000-AddInventoryOriginAndVariantMemory.ts`
  NO se aplica a la base dev. Sigue pendiente a decisión del usuario.
- 2026-10-03: la migración `1790860800000-ReconstructLegacyVariantInventoryMemory.ts`
  tampoco se aplicó, por la misma regla de no migrar datos de uso. Se aplicó solo
  contra esquemas PostgreSQL aislados y desechables de prueba.

## Acuerdos que se conservan entre sesiones

1. Reutilizar recurso e historial al reactivar; no crear otra existencia inicial.
2. Descartar únicamente autogenerados vacíos y libres de dependencias, en standalone.
3. Conservar siempre recurso/balance en server_sync para operaciones tardías.
4. Origen desconocido no autoriza limpieza. Legado ambiguo se resuelve explícitamente.
5. No desactivar recursos automáticamente ni ampliar a purga masiva/remota.
6. LocalEventRef en ambos modos; filas solo server_sync; standalone not_required y sin red.

## Alcance entregado en la fase 1

La fase 1 entregó estructuras y contratos, no comportamiento:

- `inventory_items.origin_variant_id` — procedencia del recurso, nullable,
  indexada y **sin** FK (el recurso se aplica antes de que exista la variante).
- `variant_inventory_memory` — último recurso directo conocido por una variante,
  PK por variante, FK en cascada hacia los dos lados, índice por recurso.
- Contratos tipados del alta ampliada y del descarte nuevo, en Dart y TS.
- 33 fixtures con matriz de validez e índice.

Al terminar la fase 1 ninguna estructura tenía consumidor; ese era su alcance.
El consumo actual se describe en «Estado real».
Detalle físico completo en
[[08 - Roadmap/Seguimiento de existencias/Mapeo fisico de esquemas|Mapeo físico de esquemas]].

## Alcance entregado en la fase 2

La fase 2 entregó comportamiento en el servidor, no en el cliente:

- `inventory_items.origin_variant_id` se persiste al dar de alta un recurso y se
  conserva en la canonicalización; edición y movimientos no lo pueden cambiar.
- `variant_inventory_memory` se mantiene dentro de la transacción y el lock de
  producto ya existentes: acredita al vincular, asegura el vínculo anterior al
  desvincular, deja la fila intacta si el recurso no cambia y la sustituye si el
  vínculo cambia a otro. Desactivar el producto conserva vínculo y memoria.
- Un recurso generado para otra variante se rechaza con motivo; procedencia
  desconocida se acepta.
- `recurso_inventario_descartado` se rechaza por push antes de abrir
  transacción: no borra nada, no se persiste y no se distribuye.
- Reconstrucción legada en la migración
  `1790860800000-ReconstructLegacyVariantInventoryMemory.ts`, idempotente, que
  solo siembra memoria demostrable e informa por consola lo que no resuelve.

Al terminar la fase 2 todavía faltaba el comportamiento Flutter. Ahora hay
resolución parcial en commands, descrita en el relevo 2026-10-04; el editor aún
solo conoce el vínculo actual y el descarte no tiene flujo ejecutable.

## Inspección inicial de referencias

Ramas y HEAD observados el 2026-10-02; se registran para trazabilidad, no para
volver a ellos con reset/checkout en futuras sesiones:

| Proyecto | Rama | HEAD | Estado observado |
|---|---|---|---|
| Vault `analisis ` | `main` | `424c8bb7995f49a2255e97c778155efd31b1f648` | Muchas modificaciones y notas sin commit anteriores al plan; conservarlas |
| Flutter | `main` | `4787855f76c0e1820d3f2772039c130879499876` | Sin cambios pendientes al inspeccionar |
| NestJS | `main` | `cdd0d690d5338cb3b0331b902275e2ed80c5ee9e` | Sin cambios pendientes al inspeccionar |

Evidencia del comportamiento previo:

- `ProductoCommandService._prepareInventoryBindings` crea UUID si `before` ya no
  tiene vínculo directo; no hay memoria durable para esa recuperación.
- `InventoryItems`/`InventoryItemEntity` no tienen procedencia explícita por variante.
- Balance usa cascada al recurso; movimientos, recetas y vínculo directo usan
  `RESTRICT`. El stock es del recurso, no de producto/variante.
- `VentaEventHandler` del servidor valida la configuración histórica y exige
  recurso y balance aunque la configuración vigente se haya desvinculado.
- El rollback actual de producto y `product_update_undo` requieren ampliación para
  conservar la nueva memoria; no asumir que `before` la restaura por sí solo.
- Flutter observado usa `schemaVersion = 8`. Releer AGENTS y código al implementar;
  no copiar el 7 de otras notas históricas ni aumentar la versión por cuenta propia.

## Relevo obligatorio

Agregar un bloque por cada sesión de implementación, sin sustituir evidencia
anterior ni atribuir a esta funcionalidad resultados de otras sesiones:

```text
Fecha / fase / revisión del contrato:
Estado: en curso | completa | pendiente de verificación
Rama y HEAD de proyectos intervenidos:
Archivos propios y cambios relevantes:
Contrato/fixtures actualizados:
Pruebas realmente ejecutadas (comando + resultado):
Pruebas omitidas y razón:
Casos SEG cubiertos y evidencia:
Datos/esquemas usados (aislados o temporales):
Límites o discrepancias encontradas:
Estado de habilitación de la función:
Próximo documento / trabajo exacto restante:
```

Marcar completa una fase solo al satisfacer su criterio esencial. Si necesita
otra sesión, continuarla; no avanzar para dejar sus pruebas al cierre.

## Relevo — sesión 2026-10-02 (fase 1)

```text
Fecha / fase / revisión del contrato:
  2026-10-02 / Fase 1 — Contratos y esquemas / revisión del contrato: **1, sin
  cambios**. No hizo falta revisión nueva: ningún nombre ni estructura del
  contrato se modificó al implementar. Las aclaraciones que aparecieron
  (invariantes del descarte, obligatoriedad de `origin_variant_id`) ya se
  deducían del contrato y quedan explícitas en «Mapeo fisico de esquemas» y en
  los comentarios de código, no en una revisión 2.

Estado: completa (criterio esencial satisfecho, ver abajo)

Rama y HEAD de proyectos intervenidos:
  Vault `analisis `   main @ 424c8bb7995f49a2255e97c778155efd31b1f648
  Flutter pos_flutter main @ 56df46b7c3846a886f039b3e3a7afb8c2bc19974
  NestJS  pos-nest     main @ cdd0d690d5338cb3b0331b902275e2ed80c5ee9e
  Nada se commiteó. La carpeta `Seguimiento de existencias/` completa sigue
  sin trackear en el vault. Se conservaron las modificaciones previas ajenas al
  plan; no se ejecutó `git reset`, `checkout` ni `stash`.

Archivos propios y cambios relevantes (Flutter):
  M lib/application/sync/payloads/recurso_inventario_creado_payload.dart
      (`origin_variant_id` opcional: lectura de legado, `null` explícito,
      constante compartida, roundtrip que no lo pierde)
  M lib/data/local/drift/tables/inventory_items.dart (columna + índice)
  M lib/data/local/drift/app_database.dart (tabla registrada,
      `schemaVersion` sigue en 8, sin `onUpgrade`; `_resetDatabaseOnStartup`
      exige además tabla y columna)
  M lib/data/local/drift/app_database.g.dart (generado por build_runner)
  N lib/application/sync/payloads/recurso_inventario_descartado_payload.dart
  N lib/data/local/drift/tables/variant_inventory_memory.dart
  N test/application/sync/recurso_inventario_descartado_payload_test.dart
  M test/application/sync/recurso_inventario_creado_payload_test.dart
      (grupo de origen añadido; no se duplicó el basename bajo `payloads/`)
  N test/data/local/drift/variant_inventory_memory_schema_test.dart
  N test/data/local/drift/variant_memory_schema_reset_test.dart
  N test/fixtures/variant_tracking_fixture_loader.dart

Archivos propios y cambios relevantes (NestJS):
  M src/sync/payloads/recurso-inventario-creado.payload.ts
  M src/sync/payloads/recurso-inventario-creado.payload.spec.ts
  N src/sync/payloads/recurso-inventario-descartado.payload.ts
  N src/sync/payloads/recurso-inventario-descartado.payload.spec.ts
  M src/entities/inventory-item.entity.ts
  N src/entities/variant-inventory-memory.entity.ts
  M src/app.module.ts (solo registro de la entidad)
  N src/migrations/1790774400000-AddInventoryOriginAndVariantMemory.ts
  N src/migrations/1790774400000-AddInventoryOriginAndVariantMemory.postgres.spec.ts
  N src/testing/variant-tracking-fixtures.ts

Archivos propios (vault):
  N 08 - Roadmap/Seguimiento de existencias/Fixtures/**  (33 JSON + index.md +
      generar_fixtures.py)
  N 08 - Roadmap/Seguimiento de existencias/Mapeo fisico de esquemas.md
  M 08 - Roadmap/Seguimiento de existencias/Estado y continuidad.md (este bloque)
  M 08 - Roadmap/Seguimiento de existencias/Fases/01 - Contratos y esquemas.md
      (estado -> completa)

Contrato/fixtures actualizados:
  Contrato: sin cambios (rev. 1). Tipos Dart y TS del alta y del descarte
  coinciden nombre por nombre. Lo único asimétrico es deliberado: Dart expone
  `refs(String inventoryItemId)` para que el command service declare `affects`
  del recurso, `uses` del producto y `uses` de la variante; TypeScript no
  declara refs porque el servidor **no** registra el evento como emisor.
  Fixtures: 33 archivos JSON válidos en `Fixtures/` con `index.md` como matriz
  (alta 8, descarte 7, producto 4, memoria 3, venta_tardia 4, escenarios 7).
  `generar_fixtures.py` re-ejecutado: reproduce los 33 archivos idénticamente.
  Consumidos desde tests reales de Dart y TS, no desde asserts sueltos.

Pruebas realmente ejecutadas (comando + resultado):
  Flutter, en /Users/benjamin/Projects/POS/pos_flutter
    dart run build_runner build          -> regenerado sin error
    dart format                         -> sin cambios pendientes
    dart analyze                        -> "No issues found!"
    flutter test                        -> 1009 aprobadas, 1 fallo
    flutter test .../recurso_inventario_creado_payload_test.dart
                                        -> 14 aprobadas (incluye el grupo de origen)
    flutter test .../recurso_inventario_descartado_payload_test.dart
                                        -> 17 aprobadas
    flutter test .../variant_inventory_memory_schema_test.dart
                                        -> 5 aprobadas (esquema + cascadas)
    flutter test .../variant_memory_schema_reset_test.dart
                                        -> 3 aprobadas (detección + respaldo)
  NestJS, en .../Projects/POS/pos-nest
    npm run build                       -> OK (tsc), prettier aplicado
    npm test                            -> 246 aprobadas, 109 omitidas
    RUN_POSTGRES_INTEGRATION=1 npx jest -> 338 aprobadas, 17 fallidas
    RUN_POSTGRES_INTEGRATION=1 npx jest src/migrations/1790774400000-AddInventoryOriginAndVariantMemory.postgres.spec.ts
                                        -> 6/6 aprobadas en PostgreSQL real
    npx jest src/sync/payloads/recurso-inventario-creado.payload.spec.ts
             src/sync/payloads/recurso-inventario-descartado.payload.spec.ts
                                        -> 32 aprobadas en 2 suites
    Verificación de fixtures: los 33 JSON parsean y coinciden con el generador

Pruebas omitidas y razón:
  Las 109 pruebas omitidas de `npm test` y las 17 fallidas de la corrida con
  RUN_POSTGRES_INTEGRATION=1 NO se cuentan como aprobadas. Las 17 fallidas son
  2 suites preexistentes (`cash-events.postgres.spec.ts`,
  `account-balance-baselines.postgres.spec.ts`) que exigen las bases
  `pos_cash_test_*`; no se tocaron ni se adaptaron para esta fase.
  No se ejecutaron pruebas funcionales de la regla de descarte: la fase 2 y la 3
  no existen todavía. No hay verificación de rollback de producto ni de
  `product_update_undo` porque todavía no conservan la memoria nueva.

Casos SEG cubiertos y evidencia:
  SEG-01 a SEG-04 (forma y obligatoriedad del contrato de descarte) ->
  `recurso_inventario_descartado_payload_test.dart` y
  `recurso-inventario-descartado.payload.spec.ts`.
  SEG-10 (restricciones) -> validaciones de clave estricta, `policy_version`
  exactamente 1 y `trigger_product_event_id != base_event_id` en ambos payloads.
  SEG-18 (forma de contrato, roundtrip del alta con y sin origen) ->
  `recurso_inventario_creado_payload_test.dart` y su spec TS.
  SEG-28 (detección de esquema y respaldo incompatible) ->
  `variant_memory_schema_reset_test.dart`.
  Migración PG con vínculos activos e inactivos, recetas y movimientos ->
  `1790774400000-AddInventoryOriginAndVariantMemory.postgres.spec.ts`.
  NO cubiertos por diseño: los casos de descarte real, de recuperación y de
  conflicto. Se probarán en fases 2, 3 y 5; aquí solo existen estructuras.

Datos/esquemas usados (aislados o temporales):
  La migración se probó en PostgreSQL real dentro de un **esquema aislado** con
  `search_path` por conexión (`extra: { options: '-c search_path=...,' }`,
  porque el `schema` de TypeORM no afecta a `query()`).
  Los tests de Drift y de detección usan **archivos SQLite temporales**.
  La base dev `pos_nest` **no se migró**: por política no se ejecutan
  migraciones contra datos de uso. Allí `synchronize: true` ya creó el esquema
  (solo estructura): `variant_inventory_memory` con 0 filas e
  `inventory_items` con 15 filas y 0 con `origin_variant_id`. No se abrió ni se
  reinició ninguna base real del usuario.

Límites o discrepancias encontradas:
  1. El `down` de la migración destruye memoria y procedencia. Se declara
     expresamente como pérdida, no como recuperación, en el archivo, en el
     mapeo y aquí.
  2. La siembra cubre solo variantes con vínculo directo actual y evento de
     producto acreditado. Reconstruir memoria de variantes **ya desvinculadas**
     queda para la fase 2; el fixture `memoria-legada-recuperable.json`
     documenta ese caso pendiente.
  3. `origin_variant_id` no es FK a propósito: el recurso se aplica antes de que
     exista la variante. Una FK invertiría el orden causal y rompería el replay.
  4. `variant_inventory_memory` no extiende `CommonFields` ni
     `SyncProjectionEntity`: es dato derivado y reemplazable, sin ciclo de vida
     ni versión propios. Documentado en ambos comentarios de tabla/entidad.
  5. HEAD de Flutter real (`56df46b`) **difiere** del registrado en la
     inspección inicial (`4787855`). Se anota, no se corrige con reset.
  6. `flutter test` tiene 1 fallo preexistente en
     `inventory_management_screen_test.dart` ("busca con debounce…"). Se
     reprodujo en un worktree limpio del HEAD `56df46b` y no lo causa esta fase.
  7. Las migraciones de NestJS no están registradas en ninguna configuración de
     data source; se aplican a mano. No se cambió eso.
  8. Tres expectativas del spec de migración resultaron mal escritas al
     principio y se corrigieron, no el código: el evento acreditador más
     reciente de la variante inactiva intacta es el de desvinculación (seq 47),
     no el de renombrado (seq 45); `ON DELETE RESTRICT` lanza SQLSTATE **23001**,
     no 23503; y las filas de movimiento sembradas también restringen el borrado
     del recurso.

Estado de habilitación de la función:
  Deshabilitada y así se deja. `recurso_inventario_descartado` **no** se
  registró como emisor: `InventoryEventHandler.supports()` y las allowlists de
  `sync.service.ts` están intactas. No hay UI, no hay comando que escriba las
  estructuras nuevas, no hay snapshot de sync que las transporte. El
  `schemaVersion` sigue en 8 y no se agregó `onUpgrade`: una base anterior se
  reconstruye según la política de desarrollo vigente.

Próximo documento / trabajo exacto restante:
  [[08 - Roadmap/Seguimiento de existencias/Fases/02 - Servidor|Fase 2 — Servidor]].
  **Decisión ya tomada:** la migración
  `1790774400000-AddInventoryOriginAndVariantMemory.ts` **no** se aplica a la
  base dev `pos_nest`. El usuario decidió dejarla pendiente para la fase 2,
  cuando la memoria empieza a usarse. La base dev conserva solo el esquema de
  `synchronize` y no se volvió a tocar.
```

## Criterio esencial de la fase 1

Cumplido. Payloads y esquema de ambos proyectos coinciden en una sola revisión
(1), los fixtures son verificables y reproducibles, la migración PostgreSQL se
ejecutó contra una base real conservando los datos, y la política de esquema
SQLite está probada con archivos temporales. No se avanzó de fase.

## Relevo — sesión 2026-10-03 (fase 2)

```text
Fecha / fase / revisión del contrato:
  2026-10-03 / Fase 2 — Servidor / revisión del contrato: **1, sin cambios**.
  No hizo falta revisión 2: ningún nombre, campo ni regla del contrato se
  modificó al implementar. Las tres discrepancias que aparecieron están al final
  de este bloque y **no se resolvieron por decisión propia**: quedan planteadas
  para el usuario.

Estado: completa (criterio esencial satisfecho, ver abajo)

Rama y HEAD de proyectos intervenidos:
  Vault `analisis `   main @ 424c8bb7995f49a2255e97c778155efd31b1f648
  Flutter pos_flutter main @ 56df46b7c3846a886f039b3e3a7afb8c2bc19974  (solo lectura)
  NestJS  pos-nest     main @ cdd0d690d5338cb3b0331b902275e2ed80c5ee9e
  Nada se commiteó, no se hizo `reset`, `checkout` ni `stash`. Flutter no se
  modificó: sus cambios pendientes siguen siendo los de la fase 1.

Archivos propios y cambios relevantes (NestJS):
  M src/entities/inventory-item.entity.ts   (columna `origin_variant_id`)
  M src/sync/inventory-event.handler.ts     (persiste y conserva el origen;
                                              replay, renombrado y movimientos
                                              documentados como no mutables)
  M src/sync/inventory-event.handler.spec.ts
  M src/sync/payloads/recurso-inventario-creado.payload.ts (+ spec)
  M src/sync/producto-event.handler.ts       (validateOriginCoherence,
                                              maintainVariantInventoryMemory,
                                              upsertVariantInventoryMemory)
  M src/sync/producto-event.handler.postgres.spec.ts (registra la entidad nueva
                                              en su DataSource aislado)
  M src/sync/sync.service.ts                 (rechazo del descarte por push;
                                              13 líneas, sin reformatear el resto)
  M src/sync/sync.service.spec.ts            (descarte rechazado sin transacción)
  M src/app.module.ts                        (solo registro de la entidad)
  N src/entities/variant-inventory-memory.entity.ts   (ya de la fase 1)
  N src/migrations/1790860800000-ReconstructLegacyVariantInventoryMemory.ts
  N src/migrations/1790860800000-ReconstructLegacyVariantInventoryMemory.postgres.spec.ts
  N src/sync/variant-inventory-memory.postgres.spec.ts
  N src/sync/variant-tracking-late-sale.postgres.spec.ts
  N src/testing/variant-tracking-scenario.ts (identidades y semillas del escenario)

Archivos propios (vault):
  M 08 - Roadmap/Seguimiento de existencias/Estado y continuidad.md (este bloque)
  M 08 - Roadmap/Seguimiento de existencias/Fases/02 - Servidor.md
      (estado -> completa, con vía de reconstrucción, verificación y límites)

Contrato/fixtures actualizados:
  Contrato: sin cambios (rev. 1). Ningún fixture se editó. Se consumieron 5 de
  los 33 (desvinculación, directo-a-receta, descarte y venta tardía) y el resto
  queda para las fases 3 a 5. Las pruebas nuevas de vínculo directo usan
  identidades locales declaradas en `VARIANT_TRACKING_LOCAL`, porque los
  fixtures compartidos combinan venta por unidad con un recurso en gramos y esa
  combinación la rechaza la validación preexistente del servidor.

Pruebas realmente ejecutadas (comando + resultado):
  NestJS, en .../Projects/POS/pos-nest
    npm run build                       -> OK (tsc; excluye specs)
    npm test                            -> 247 aprobadas, 139 omitidas
    RUN_POSTGRES_INTEGRATION=1 npx jest -> 369 aprobadas, 17 fallidas
    npx jest src/sync/sync.service.spec.ts src/sync/inventory-event.handler.spec.ts
                                        -> 21 aprobadas (descarte no soportado y
                                           rechazado sin abrir transacción)
    RUN_POSTGRES_INTEGRATION=1 npx jest src/sync/variant-inventory-memory.postgres.spec.ts
                                        -> 19/19 aprobadas
    RUN_POSTGRES_INTEGRATION=1 npx jest src/sync/variant-tracking-late-sale.postgres.spec.ts
                                        -> 3/3 aprobadas
    RUN_POSTGRES_INTEGRATION=1 npx jest src/migrations/1790860800000-ReconstructLegacyVariantInventoryMemory.postgres.spec.ts
                                        -> 8/8 aprobadas
  Flutter: no se ejecutó nada. No se modificó Flutter en esta fase.

Pruebas omitidas y razón:
  Las 139 omitidas de `npm test` son las de PostgreSQL y requieren
  RUN_POSTGRES_INTEGRATION=1; no se cuentan como aprobadas.
  Las 17 fallidas de la corrida completa son las 2 suites **preexistentes**
  `cash-events.postgres.spec.ts` y `account-balance-baselines.postgres.spec.ts`,
  que exigen una base cuyo nombre empiece por `pos_cash_test_*`. Se verificó que
  fallan por esa guarda y que ambos archivos están intactos: no los causa esta
  fase y no se adaptaron.
  Errores de `tsc --noEmit` preexistentes en tres specs de handlers
  (`categoria`, `financial-entry`, `producto`) siguen ahí; `npm run build` no los
  incluye y pasa.

Casos SEG cubiertos y evidencia:
  SEG-13 venta tardía con configuración anterior -> `variant-tracking-late-sale.postgres.spec.ts`
  SEG-14 deshabilitar conserva recurso, sin descarte remoto ni temporizador ->
    mismo spec y `variant-inventory-memory` (descarte rechazado, recurso `active`)
  SEG-15 conflicto por carrera -> `convierte una carrera por el mismo producto en
    conflicto, no en error`
  SEG-16 eco de base vieja -> `no retrocede la memoria con un eco de base vieja`
  SEG-17 recurso ocupado, inactivo o incompatible -> tres pruebas de rechazo con
    motivo (ocupado, inactivo, unidad incompatible) y ninguna crea reemplazo
  SEG-19 directo -> receta que usa el mismo recurso -> directo ->
    `reutiliza el mismo recurso al volver de receta a directo (SEG-19)`
  SEG-20 idempotencia del servidor -> `es idempotente al repetir la creación y la
    desvinculación`, y el reenvío de la venta tardía da `duplicate`
  SEG-22 legado ambiguo o cadena incompleta -> las 8 pruebas de la migración:
    nunca elige por nombre ni por reloj, deja sin memoria lo no demostrable y
    lo informa
  SEG-23 carrera -> misma prueba que SEG-15, con `['accepted','conflict']`
  SEG-25 descarte por push -> `rechaza el descarte por push sin borrar nada ni
    distribuirlo` y la prueba unitaria de `sync.service.spec.ts`
  SEG-30 desactivar producto/variante -> `conserva vínculo y memoria al desactivar
    el producto`; la mitad de «eliminar categoría» es comportamiento histórico
    que no se tocó
  MEDIO SERVIDOR de SEG-05 -> desactivar conserva saldo e historial y reactivar
    reutiliza el mismo ID sin alta ni inicial nuevas; la reactivación «en otro
    guardado» es de Flutter (fase 4)
  NO cubiertos por diseño: todo lo que exige cliente o UI (SEG-26, SEG-27, la
    mitad de SEG-14 «conservar en A» y el resto de SEG-05/19/17), más la
    reejecución desde cero (fase 5).

Datos/esquemas usados (aislados o temporales):
  Todo el trabajo de PostgreSQL fue contra **esquemas aislados** creados y
  destruidos dentro de la corrida (`CREATE SCHEMA` + `DROP SCHEMA ... CASCADE`),
  con `search_path` por conexión donde las consultas no son de TypeORM. Los specs
  de handler usan `synchronize: true` sobre un esquema propio; los de migración
  usan un esquema mínimo escrito a mano. La base dev `pos_nest` **no se migró ni
  se reinició** y no se le escribió ninguna fila de estas pruebas.

Límites o discrepancias encontradas:
  1. **Memoria al desvincular: contrato contra fixture.** §5.2 dice «asegura
     primero una memoria del vínculo anterior y la conserva», y eso se implementó
     y probó (la fila no se reacredita y conserva el evento de creación como
     origen). Pero `Fixtures/memoria/memoria-despues-conflicto.json` espera
     `source_event_id` igual al evento de desvinculación. Si la lectura correcta
     es reacreditar siempre con el evento de producto vigente, hay que cambiar
     el comportamiento **y** el fixture, no el test.
  2. **`base_version: null` en la venta tardía.** Toda venta confirmada exige
     `base_version: 1` con `base_server_sequence` nulo: regla vigente del
     servidor, anterior a este plan. El spec corrige el sobre de forma explícita
     y documentada; el fixture sigue declarando `null`.
  3. **Venta por unidad con recurso en gramos.** Los fixtures compartidos
     combinan `sale_configuration.mode: unit` con un recurso en gramos, que la
     validación preexistente rechaza («La venta por unidad requiere seguimiento
     de inventario en piezas»). Esos fixtures solo se aplican en transiciones cuyo
     `after` no tiene vínculo directo.
  4. **Ausencia de snapshot/bootstrap en el servidor.** La memoria entra por
     replay de eventos; un futuro contrato de snapshot debe incluirla. No se
     construyó un bootstrap como efecto colateral.
  5. **Reporte de casos no resueltos por consola.** La migración no crea tabla
     de incidencias; si se quiere trazabilidad consultable hay que decidirlo
     explícitamente.
  6. `validateOriginCoherence` trata la ausencia de la columna igual que `null`.
     Sin esa normalización, un `DataSource` de pruebas que no registre la entidad
     rechaza vínculos legítimos; se detectó porque dos pruebas preexistentes de
     `producto-event.handler.spec.ts` empezaron a fallar.
  7. `producto-event.handler.postgres.spec.ts` tuvo que registrar
     `VariantInventoryMemoryEntity`: sin ella el handler lanzaba
     `EntityMetadataNotFoundError`. Es un ajuste de fixture, no de comportamiento.
  8. `sync.service.ts` sigue sin cumplir prettier en tres zonas **previas** a
     esta fase (duplicado de caja, `isCashEvent` y el bloque de apply). No se
     reformató para no mezclar un cambio ajeno; se comprobó que las 13 líneas
     agregadas sí son conformes.

Estado de habilitación de la función:
  En el servidor la función está activa y es el comportamiento vigente: no hay
  bandera ni doble camino, los handlers aplican la memoria y el descarte se
  rechaza siempre. Lo que sigue deshabilitado es el cliente: sin comando, sin
  pantalla y sin usar la memoria, el efecto observable por el usuario es nulo.
  Las migraciones no se aplicaron a la base dev.

Próximo documento / trabajo exacto restante:
  [[08 - Roadmap/Seguimiento de existencias/Fases/03 - Flutter y sincronizacion|Fase 3 — Flutter y sincronización]].
  Antes de empezar conviene que el usuario resuelva las discrepancias 1 y 2 de
  arriba: la 1 cambia un comportamiento ya probado y un fixture; la 2 decide si
  se corrige el fixture o la regla del servidor.
```

## Criterio esencial de la fase 2

Cumplido. El servidor conserva recurso y saldo tras quitar el seguimiento, acepta
una sola vez la venta tardía contra su configuración histórica, recupera vínculos
reutilizando el mismo identificador y mantiene la memoria idempotente. Las
restricciones y la carrera por el mismo producto se verificaron contra PostgreSQL
real, no con simulaciones. Las tres discrepancias quedan planteadas, no resueltas
por decisión propia.

## Relevo — sesión 2026-10-03 (fase 4 abierta y **detenida**)

```text
Fecha / fase / revisión del contrato:
  2026-10-03 / Fase 4 — Interfaz, NO iniciada / revisión del contrato: **1, sin
  cambios**. No se tocó ningún contrato ni fixture en esta sesión.

Estado: **pendiente — bloqueada**. La fase 4 no se implementó porque su
  prerrequisito esencial (fase 3) no está cumplido. No se modificó código de
  Flutter. El único archivo modificado es este documento.

Rama y HEAD de proyectos intervenidos:
  Vault `analisis `   main @ 424c8bb7995f49a2255e97c778155efd31b1f648
  Flutter pos_flutter main @ 56df46b7c3846a886f039b3e3a7afb8c2bc19974 (solo lectura)
  Nada se commiteó. No hubo `reset`, `checkout` ni `stash`.

Hallazgo principal — la fase 3 NO satisface su criterio esencial:
  El árbol de trabajo de `pos_flutter` contiene trabajo **sin commitear** de la
  fase 3. Es un **esqueleto**: los tipos, la tabla, el DAO y el store existen y
  compilan, pero **ninguna lógica los consume**. Los cuatro bloques que había que
  verificar antes de abrir la interfaz fallan:

  1. **Recuperación: ausente.** En `producto_command_service.dart` el cambio real
     es de firma: `_prepareInventoryBindings` pasó de `List` a `Future<List>` y el
     llamador a `await`. **La resolución §3 no está escrita.** El cuerpo conserva
     el `continue` original y sigue generando un UUID nuevo con
     `_uuid.v4()` en cada variante sin vínculo directo. Lo único añadido son dos
     comentarios: `// Conservar el mismo recurso existente` y
     `// Check for memory/recovery - Phase 3 logic`.
     `variantInventoryMemoryStore` se añadió como parámetro del constructor
     (línea 41) y **nunca se asigna a un campo ni se lee**. Consecuencia: no hay
     puerto consultable para el editor, y apagar/encender no conserva identidad.
  2. **Descarte: ausente.** `recurso_inventario_descartado` existe **solo como
     clase de payload** (contrato de fase 1). No hay comando, ni evaluación de
     elegibilidad del §4, ni handler, ni registro, ni entrada en allowlists.
     `InventoryEventHandler.supports()` no lo menciona.
  3. **Restauración de conflictos: ausente.** `producto_event_handler.dart`,
     `sync_conflict_projection_cleaner.dart` y `remote_event_applier.dart` están
     **intactos** (`git diff` vacío). No hay `maintainVariantInventoryMemory` ni
     equivalente: la memoria **no se registra ni se preserva** al aplicar un
     evento de producto, que es el requisito base del §5.2 y de SEG-15/16.
     Lo único añadido es la columna `memoryJson` en `product_update_undo.dart` y
     su escritura/lectura en `producto_dao.dart`, con dos defectos frente al
     contrato: la restauración va envuelta en `try { ... } catch (_) {
     // ignore if memory not stored }`, que **traga cualquier fallo** en silencio
     en lugar de revertir; y **no restaura la ausencia de memoria**, solo
     reinserta filas, cuando el contrato exige «guardar fila previa exacta o
     ausencia, no solo ID».
  4. **Sincronización: ausente.** No hay integración de origen/recuperación con
     push, preflight ni pull, ni rechazo explícito de un descarte remoto.
     Lo único presente es `originVariantId` propagado en el alta del recurso
     (`inventory_event_handler.dart` y `drift_inventory_projection_store.dart`).

  Tipos declarados **sin ningún consumidor** en `lib/` ni `test/` (cero
  referencias fuera de su propio archivo): `RecursoRecuperacionResultado` y sus
  cuatro subtipos, e `InventoryResourceMemory`. Sirven de andamiaje para
  terminar la fase 3; no son comportamiento.

Archivos propios y cambios relevantes:
  Ninguno en Flutter, NestJS ni otro proyecto. Este documento es el único cambio.
  No se creó, modificó ni eliminó código.

Contrato/fixtures actualizados:
  Ninguno. No se editó contrato ni fixture.

Pruebas realmente ejecutadas (comando + resultado):
  Flutter, en /Users/benjamin/Projects/POS/pos_flutter (línea base, sin cambios)
    dart analyze -> "No issues found!"
    flutter test -> **1017 aprobadas, 1 fallida**
  La única fallida es
  `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`
  → «busca con debounce y conserva búsqueda y filtros al cambiar de pestaña».
  Es el **mismo fallo preexistente** ya registrado en el relevo de fase 1 y
  reproducido en un worktree limpio del HEAD `56df46b`. No lo causa este trabajo.
  Nota: `dart analyze` limpio **no** delata el hueco, porque las piezas sin
  usar son clases públicas y un parámetro opcional, y nada las referencia.

Pruebas omitidas y razón:
  Todas las de la fase 4. No hay entregable implementado que probar: no se
  escribieron pruebas de widgets ni la integración UI → command → event store →
  proyecciones → reapertura. No se hizo revisión visual del editor, porque no se
  modificó la interfaz.

Casos SEG cubiertos y evidencia:
  Ninguno. SEG-05, SEG-07, SEG-17–19, SEG-22, SEG-26–27 y la confirmación de
  SEG-30 **siguen pendientes** y dependen de la fase 3.

Datos/esquemas usados (aislados o temporales):
  Ninguno. No se abrió ni se reinició ninguna base real. `schemaVersion` sigue
  en 8, sin `onUpgrade`.

Límites o discrepancias encontradas:
  1. **El trabajo sin commitear de la fase 3 es engañoso.** Compila y analyzes
     limpio, y los archivos tienen nombres correctos (`recurso_recuperacion_
     resultado.dart`, `drift_variant_inventory_memory_store.dart`), así que una
     sesión que solo mirara la existencia de los archivos daría la fase 3 por
     hecha. La señal real son los comentarios de fase y el parámetro sin usar.
     De aquí que este documento pasara de «fase 3 pendiente» a «en curso, no
     verificada».
  2. `catch (_)` en `producto_dao.dart:440-460` oculta errores de restauración
     de memoria. Debe desaparecer: una restauración fallida es una
     inconsistencia, no un caso tolerado.
  3. El esqueleto mezcla comentarios en inglés (`// Check for memory/recovery -
     Phase 3 logic`) con el resto del archivo en español, y dejó dos líneas en
     blanco duplicadas en los campos del command service. Son marcas de trabajo
     inconcluso, no deuda que conservar.
  4. Conviven cambios **ajenos** al plan en el mismo árbol: `pubspec.yaml`
     (`mobile_scanner: ^7.4.2`), `barcode_scanner_screen.dart`, `fake_mobile_
     scanner_platform.dart`, `variant_editor_barcode_test.dart`,
     `article_form_screen_test.dart`, `AGENTS.md`, los `Info.plist`/entitlements
     y los `Podfile.lock`. Son del escáner de códigos de barras. **No se tocaron
     y no deben mezclarse ni descartarse** al retomar la fase 3.

Estado de habilitación de la función:
  Igual que al cierre de la fase 2. La función sigue **deshabilitada y sin efecto
  observable**: no hay comando, no hay UI y la memoria no se escribe. Agregar la
  columna `memoryJson` no habilita nada por sí solo.

Próximo documento / trabajo exacto restante:
  [[08 - Roadmap/Seguimiento de existencias/Fases/03 - Flutter y sincronizacion|Fase 3 — Flutter y sincronización]].
  Bloque 1 — recuperación (§3): resolver por variante en
  `ProductoCommandService` usando `VariantInventoryMemoryStore` (hoy sin usar),
  devolver los cuatro resultados de `RecursoRecuperacionResultado`, aceptar
  `existingInventoryItemId` validado y **eliminar los dos comentarios de fase**.
  Bloque 2 — memoria y restauración (§5.2): `maintainVariantInventoryMemory` en
  `producto_event_handler.dart` (hoy intacto), preservar al pasar a
  ninguno/receta, reconstruir faltantes legados, y arreglar `product_update_undo`
  para guardar fila previa **o ausencia**, con fallo ruidoso y no silencioso.
  Bloque 3 — descarte standalone (§4 y §6.3): elegibilidad completa, evaluación
  dentro del límite transaccional con el estado posterior previsto, lote atómico
  edición + descarte, handler que revalida antes del `delete`, idempotencia por
  evento aplicado.
  Bloque 4 — sincronización (§7 y §10): rechazo explícito de descarte remoto,
  origen y recuperación en push/preflight/pull, eco antiguo que no pise memoria
  reciente, venta tardía.
  Después de eso: `dart analyze`, `flutter test`, y recién entonces abrir la
  fase 4. Las discrepancias 1 y 2 del relevo de fase 2 (memoria al desvincular
  frente al fixture, y `base_version: null` de la venta tardía) siguen sin
  resolverse y el usuario debe decidirlas antes de cerrar la fase 3.
```

## Relevo — sesión 2026-10-04 (fase 4: prerrequisito fallido)

Fecha / fase / contrato: **2026-10-04 / fase 4 — Interfaz / revisión 1**, sin
cambios de contrato. Estado: **bloqueada; no iniciada**, porque la verificación
real de fase 3 falla. Este relevo actualiza el estado vigente; el relevo anterior
se conserva como evidencia histórica.

Ramas y HEAD: Flutter `main @ 56df46b7c3846a886f039b3e3a7afb8c2bc19974`;
vault `main @ 424c8bb7995f49a2255e97c778155efd31b1f648`. Ambos ya tenían cambios
pendientes al entrar. No se modificó código Flutter/NestJS, no se crearon commits,
no se hicieron restauraciones masivas y se conservaron los cambios del escáner y
del seguimiento. Se comparó el diff binario y el estado Flutter al salir con la
captura inicial. No se abrió ninguna base de uso.

### Evidencia real de los bloqueos

1. **Recuperación parcial, legado incompleto.**
   `lib/application/commands/articulos/producto_command_service.dart` ahora
   consulta `InventoryResourceResolver` y valida que una recuperación no lleve
   inicial. El resolver conserva vínculo actual, lee memoria y busca origen;
   devuelve nuevo sin consultar historia acreditable cuando esas fuentes están
   vacías. En SQLite aislado, alta legada → guardar sin seguimiento → reactivar
   crea otro UUID en ambos modos, aunque el recurso original tiene movimiento
   inicial y existe su historia. No satisface SEG-05/27. Tampoco distingue una
   variante realmente nueva de un catálogo legado con historia incompleta.
2. **Memoria no mantenida por producto.**
   `lib/application/sync/handlers/producto_event_handler.dart` y
   `lib/data/local/drift/drift_producto_projection_store.dart` no crean,
   mantienen ni avanzan memoria al aplicar altas/ediciones/ecos. La sonda de
   alta aplicada obtiene cero filas de memoria en ambos modos. El pull que
   recorre esos handlers no puede reconstruir la memoria requerida. Sí hay
   propagación de origen en alta/edición/movimientos del recurso: no se atribuye
   ausencia a ese código existente.
3. **Descarte standalone sin implementar.**
   `lib/application/sync/handlers/inventory_event_registry.dart` registra solo
   alta, edición y movimiento. No hay consumidor ejecutable del payload de
   descarte, evaluación transaccional completa ni protección del alta antigua
   con tombstone. La sonda crea por command un recurso autogenerado con origen,
   cero saldo y cero movimientos; guardar apagado lo conserva y no descarta.
   Fallan SEG-06 y la precondición de SEG-07. No hay resultado confirmado de
   descarte que la interfaz pueda informar después del commit.
4. **Restauración no exacta.**
   `lib/data/local/drift/drift_producto_projection_store.dart` solo solicita
   backup en eliminación de producto o variantes, no en cualquier cambio de
   memoria. `lib/data/local/drift/daos/producto_dao.dart` reinserta las filas
   guardadas sin retirar memorias agregadas y conserva `catch (_)` que oculta
   errores. Una sonda del DAO con backup sin memoria y fila añadida antes de
   restaurar devuelve éxito y deja esa fila. Falla la ausencia exacta de SEG-15;
   no se verifica restauración transaccional completa de conflictos.
5. **DI y pruebas existentes sin adaptar.**
   `lib/core/di/data_dependencies.dart` registra el store de memoria usando
   `getIt<VariantInventoryMemoryDao>()`, pero no registra ese DAO. La inspección
   de registros detecta el hueco; no se inició la app contra su base real para
   provocarlo. Numerosos harnesses existentes construyen el command sin los
   nuevos puertos: el guardado falla con «No se configuró la resolución de
   recursos de inventario». Las sondas conectan los puertos explícitamente y
   demuestran que el bloqueo va más allá de la configuración de tests.
6. **Validación de selección incompleta.** El resolver acepta una selección
   antes de consultar memoria, no valida `originVariantId` en `_validateCandidate`
   y la rama de vínculo actual solo verifica existencia. La selección de
   candidatos solo busca procedencia y unidad activa: no suministra nombre de
   unidad/saldo ni filtra todos los casos de actividad, ocupación y
   compatibilidad. Son hallazgos de inspección, no criterios aprobados.

### Archivos propios y pruebas ejecutadas

Se modificaron exclusivamente `Estado y continuidad.md` y el estado documental
`Fases/04 - Interfaz.md`, y se creó
`Evidencia/2026-10-04-auditoria-core/` con `Resultados.md`, logs y fuente de la
sonda con sufijo `.dart.txt`. No hay archivos propios en Flutter. La sonda se
escribió y ejecutó desde `/tmp`, fuera de su suite permanente.

Comandos ejecutados desde `/Users/benjamin/Projects/POS/pos_flutter`:

- `dart analyze`: **exit 0, No issues found!**
- `flutter test --reporter json`: **exit 1, 1002 aprobadas / 16 fallidas / 0
  omitidas**. Se excluyen las pruebas ocultas de carga del reporter. Los nombres
  y archivos de las 16 fallidas se archivan en `Resultados.md`. Una es el fallo
  de búsqueda registrado previamente; las otras afectan commands de artículos,
  importación, seguimiento/receta y widgets de movimientos. No se presentan
  como fallos introducidos por esta sesión, que no cambió código.
- `flutter test /tmp/pos-seguimiento-fase4-20261004-audit/core_prerequisites_test.dart
  --reporter expanded`: **exit 1, 0 aprobadas / 8 fallidas**. Aserciones de negocio
  con SQLite en memoria y commands/handlers/stores reales: memoria ausente (2),
  identidad legada cambiada (2), descarte faltante (1), historia incompleta
  interpretada como alta nueva (2), ausencia no restaurada (1).
- Lectura/parseo de los **33 fixtures JSON compartidos**: válidos, sin cambios
  ni regeneración. Se revisaron los estados de recuperación legada y conflicto;
  la sonda usa los eventos del test Flutter existente, no sustituye los fixtures
  compartidos ni verifica paridad con el servidor.

Datos: SQLite en memoria para sondas; bases temporales/fixtures de las suites
existentes. Sin cambios de esquema, sin build_runner, sin migraciones, sin tocar
bases dev ni iniciar red del POS. No se ejecutaron pruebas NestJS, dos terminales,
bootstrap o reapertura de archivo de fase 4.

### Casos solicitados y límites

| Caso | Resultado de esta sesión |
|---|---|
| SEG-05 | **Fallido en legado**, ambos modos, con puertos completos; recurso original con movimiento se conserva pero la reactivación genera otro ID |
| SEG-07 | **Bloqueado**: el descarte previo SEG-06 no existe |
| SEG-17 | Validación parcial de memoria en resolver; UI no disponible y validación completa/concurrencia **pendientes** |
| SEG-18 | Command rechaza inicial en recuperación; integración UI y salida a movimientos **pendientes**, suite de movimientos falla |
| SEG-19 | Directo/receta cubierto por test preexistente que ahora falla por puertos faltantes; recuperación por memoria no acreditada; **pendiente** |
| SEG-22 | **Fallido** para historia legada incompleta; selector informado y validación de procedencia **pendientes** |
| SEG-26–27 | **No implementados**: no se añadieron widgets ni integración UI → command → event store → proyecciones → reapertura |
| SEG-30 | Comportamiento actual confirmado por seis tests de desactivación histórica con none/inventory/recipe en ambos modos y tests existentes de eliminación de categoría. No hay código de descarte que active esos disparadores; repetir al completar fase 3 |

**Evidencia visual: no realizada.** No se lanzó editor en tablet, emulador,
dispositivo físico ni renderer para capturar pantallas. Los widget tests de la
suite general no equivalen a inspección visual de fase 4. Carga/error, saldo
recuperable y selección legada no están implementados; la revisión visual queda
pendiente después de completar el core. No se afirma prueba táctil ni física.

Estado de habilitación: recuperación parcial ya conectada al command por cambios
anteriores, con fallos; no declarar la función completa ni deshabilitada sin
ningún efecto. La UI de fase 4 no se conectó en esta sesión. No se avanzó a fase 5,
no se desplegó y no se amplió limpieza, purga, unidades ni confirmaciones.

Trabajo exacto pendiente antes de interfaz: completar fase 3 con memoria derivada
y legada acreditable, validación de procedencia/disponibilidad, descarte standalone
atómico con replay y resultado de commit, undo exacto con fallos transaccionales,
ecos/pull/restauración y DI; adaptar harnesses y lograr suites verdes. Después
retomar los nueve entregables de fase 4, sus widgets, integración completa de
reapertura y revisión visual tablet. No resolver estos huecos desde presentation.

## Criterio esencial de la fase 4

**No cumplido ni marcado completo.** La verificación del core falla antes de
conectar la UI. Recuperación entre guardados/reapertura, cancelación, doble toque
y estados no disponibles permanecen pendientes. Se sigue exclusivamente el
alcance autorizado: auditar el prerrequisito, documentar los pendientes y mantener
bloqueada la interfaz.

## Verificación de la entrega documental inicial

Sección histórica de la sesión de planificación (2026-10-02): solo se revisaron
código y documentación; no se ejecutaron suites de Flutter, NestJS ni bases de
datos para la nueva regla. Validación documental realizada: 10 notas nuevas y 12
notas existentes actualizadas, 40 enlaces internos introducidos resueltos, dos
ejemplos JSON parseados, 30 casos SEG únicos y cinco documentos de fase con
cercas de código completas. Se comprobaron reglas de modos y coherencia del
relevo. Esa validación no verifica comportamiento de código; la verificación de
comportamiento de las fases 1 y 2 está en sus bloques de relevo.

## Enlaces

- [[08 - Roadmap/Seguimiento de existencias/Plan de implementacion|Plan de implementación]]
- [[08 - Roadmap/Seguimiento de existencias/Contrato funcional y de eventos|Contrato rev. 1]]
- [[08 - Roadmap/Seguimiento de existencias/Casos de aceptacion|Casos de aceptación]]
- [[08 - Roadmap/Seguimiento de existencias/Mapeo fisico de esquemas|Mapeo físico de esquemas]] (fase 1)
- [[08 - Roadmap/Seguimiento de existencias/Fixtures/index|Índice de fixtures]] (fase 1)
- [[08 - Roadmap/Seguimiento de existencias/Fases/01 - Contratos y esquemas|Fase 1 — Contratos y esquemas]] (completa)
- [[08 - Roadmap/Seguimiento de existencias/Fases/02 - Servidor|Fase 2 — Servidor]] (completa)
- [[08 - Roadmap/Seguimiento de existencias/Fases/03 - Flutter y sincronizacion|Fase 3 — Flutter y sincronización]] (core y transporte verificados)
- [[08 - Roadmap/Seguimiento de existencias/Fases/04 - Interfaz|Fase 4 — Interfaz]] (siguiente: pendiente de implementar)

## Relevo — 2026-10-04, solicitud de fase 5 / entrada no satisfecha

**No se inició la fase 5 ni se completó el plan.** Se respetó la condición del
usuario de documentar el trabajo exacto restante si persistían los fallos de
fases anteriores. La fase 3 permanece en curso y fase 4 sin iniciar. Fases 1–2
conservan su verificación acotada, revalidada con contratos, SQLite temporal y
44 pruebas PostgreSQL de migraciones/memoria/venta tardía/producto aprobadas.

Contrato rev. 1 sin cambios, 33 fixtures conservados. Ramas/HEAD con cambios
previos: vault main @ 424c8bb7995f49a2255e97c778155efd31b1f648;
Flutter main @ 56df46b7c3846a886f039b3e3a7afb8c2bc19974;
NestJS main @ cdd0d690d5338cb3b0331b902275e2ed80c5ee9e.
Son HEAD base, no commits de una entrega cerrada: el comportamiento auditado
incluye el árbol pendiente. `conservacion-codigo.json` acredita cero cambios de
archivos de ambos proyectos durante la sesión. No hubo commit ni despliegue.

Pruebas: `dart analyze` exit 0; `flutter test --reporter json` exit 1
(1002 aprobadas / 16 fallidas / 0 omitidas); sonda SQLite de core exit 1
(0 aprobadas / 8 fallidas); `npm run build` exit 0; suite completa NestJS con
RUN_POSTGRES_INTEGRATION=1 en base aislada `pos_cash_test_seg_fase5`, exit 1
(381 aprobadas / 5 fallidas / 0 omitidas). La primera corrida PG (368/18) tuvo
17 fallas por prefijo de base exigido y una carrera financiera intermitente;
se archiva también, sin contarlas como aprobadas ni declarar esa carrera resuelta.

Comparaciones mediante `git archive HEAD` a directorios temporales:
Flutter, cinco archivos afectados: 51 aprobadas / 1 falla de búsqueda, confirmando
15 regresiones del árbol pendiente respecto de HEAD. NestJS completo:
320 aprobadas / los mismos 5 fallos bancarios; esos cinco son preexistentes con
las dependencias instaladas. La carrera financiera pasó en dos ejecuciones HEAD
y en la segunda actual: atribución inconclusa. No se corrigieron defectos ajenos.
No hubo cambios Drift/DAOs: no se requirió regenerar el esquema en esta auditoría.

Datos: SQLite en memoria y archivos temporales de las suites; clúster PostgreSQL
18.4 nuevo, puerto 55839, usuario seg_audit, tres bases aisladas. Se detuvo al
terminar. No se consultó/intervino `pos_nest` ni se aplicaron allí las dos
migraciones pendientes; no se abrió la app con bases de uso. Versiones completas,
comandos, logs, sonda y manifiestos en [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-prerrequisitos-fase5/Resultados|Auditoría de entrada a fase 5, 2026-10-04]].

Archivos propios: evidencia nueva, matriz Casos de aceptación, Estado y continuidad,
Plan, Contrato, Mapeo físico, estados de fases 3/5, ADR-0017 y aclaraciones de
seguimiento en Catálogo e inventario, Artículos, Eventos, Modelo de tablas y
Validaciones servidor. Se conservaron los bloques históricos y cambios ajenos.
Los logs no son tests nuevos incorporados a la suite permanente.

Relevo preciso para continuar:

1. Derivar memoria local/remota por eventos y avanzar solo su eco acreditador;
   conservar memoria al pasar a ninguno/receta y reconstruir legado comprobable.
2. Resolver historia incompleta/ambigua sin alta silenciosa; validar memoria,
   selección y vínculo actual, con candidatos informados y disponibilidad real.
3. Implementar descarte standalone atómico y su handler/registro, elegibilidad
   completa, prueba del evento aplicado y protección contra resurrección/replay;
   cubrir todas las exclusiones y fallos transaccionales SEG-06–12/20–24.
4. Capturar undo para cualquier cambio de memoria y restaurar fila/fuente/secuencia
   o ausencia exactas sin catch silencioso; probar cadenas inversas/eco/conflicto.
5. Completar DI (registro del DAO de memoria), adaptar harnesses/consumidores,
   revisar piezas sin uso y verificar transporte/dependencias/venta tardía/guardas
   de modo. Reejecutar AGENTS checks y casos esenciales de fase 3.
6. Completar los nueve entregables de fase 4, widgets e integración de reapertura,
   flujo unitario/medido, cancelación/doble toque y revisión visual tablet real o
   método documentado. La inspección no reemplaza esa revisión.
7. Satisfechas fases 3–4, ejecutar la fase 5 íntegra y actualizar SEG-01–30 con
   evidencia completa, incluido dos clientes A/B y pull real hasta SQLite.

La matriz tiene resultado de auditoría en cada SEG; mantiene pendientes esenciales.
SEG-25 está verificado en SyncService/PG, sin instancia HTTP. SEG-13/14 solo tienen
la porción receptora. SEG-28 solo acredita partes de detección/reapertura/guardas,
no restauración con descarte real. SEG-29 no se ejecutó con terminal nueva.
No hubo tablet, emulador, renderer, prueba física/táctil ni dos clientes completos.

### Puesta en marcha y compatibilidad (futura, no ejecutada)

No habilitar esta revisión parcial. Tras satisfacer todos los criterios:

1. Respaldar y ensayar restauración compatible con identidades/historial/origen/
   memoria/descarte. Inventariar esquemas y versiones de clientes receptores.
2. Preparar PostgreSQL y servidor receptor; aplicar explícitamente las migraciones
   1790774400000 y 1790860800000, tras autorización sobre el destino. No están
   registradas en un DataSource de migración del proyecto; no suponer que build
   o levantar AppModule las ejecuta. Evitar synchronize como migrador de datos de uso.
3. Coordinar clientes compatibles. SQLite mantiene schemaVersion 8 y detección
   de tabla/columna más inventory_item_discards; el reset de desarrollo pierde
   datos antiguos. Si una instalación en uso debe conservarlos, implementar y
   probar esa preservación como trabajo explícito previo. No existe garantía de
   actualización sin pérdida por este plan. Un respaldo antiguo incompatible
   protegido falla sin borrado; los down no sustituyen una restauración.
4. Ejecutar checks integrados con datos aislados, verificar todos los SEG y decidir
   habilitación de forma coordinada. Esta documentación no despliega ni aplica nada.

Límites vigentes: sin purga server_sync, fusión de recursos legados, importación
standalone/server_sync ni bootstrap por snapshot. El pull real existe; hidratar
origen/memoria mediante ese camino hasta Flutter sigue pendiente. Sin prueba
física o visual del nuevo flujo, sin E2E A/B y sin cierre verificable todavía.

## Relevo — 2026-10-04, corrección de fase 3

[[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]]. Contrato rev. 1 sin modificaciones de forma, schemaVersion 8 fijo.
44 pruebas nuevas permanentes (43 SQLite + 1 HTTP), 44 PG pertinentes; se usaron
snapshot/restore reales con rutas temporales y se reconstruyó cliente C por el
pull disponible. Suite completa Flutter: 1061 aprobadas / 1 búsqueda preexistente
fallida / 0 omitidas. No se declara la suite completamente verde.

Archivos principales: command/resolver/result, handlers producto/inventario/descarte,
política, stores/puertos, DAOs memoria/producto/inventario, DI y transporte/ack.
Se adaptaron harnesses de importación/productos/movimientos y el override de test
del resultado; no se cambió presentation productiva. En NestJS solo se añadió el
harness HTTP de prueba. Huellas/HEAD base y comandos en la evidencia.

La siguiente sesión debe implementar los nueve entregables de fase 4 y sus casos
UI, con la disponibilidad revalidada al guardar y resultados después del commit.
Repetir fase 5 solo tras esa salida; no acreditar pruebas físicas con estos clientes
headless. Mantener las dos migraciones pendientes fuera de pos_nest dev.
