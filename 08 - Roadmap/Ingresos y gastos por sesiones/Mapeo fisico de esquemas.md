---
tipo: documentacion
relacionado: contrato revision 1
sesion: 1
actualizado: 2026-09-24
---

# Mapeo físico de esquemas — financial_categories y financial_entries

Implementación de la sesión 1 conforme al «Contrato funcional y de eventos» rev 1, §4. Ambos esquemas representan el **mismo contrato**: nombres físicos, tipos, restricciones, índices y significado idénticos entre SQLite (Drift, Flutter) y PostgreSQL (TypeORM, NestJS). El contrato JSON acordado (payloads/sobres, `Fixtures/`, 51 archivos) no cambió en esta sesión.

## Correspondencias generales

| Concepto | SQLite (Drift) | PostgreSQL (TypeORM) | Notas |
|---|---|---|---|
| UUID | `TextColumn` (TEXT) | `uuid` (`@PrimaryColumn('uuid')` / `@Column('uuid')`) | En SQLite la columna es texto y la validación de formato ocurre en payloads/comandos; en PG el motor valida el formato. El valor es el mismo UUID v4. |
| bigint | `IntColumn` (INTEGER de 64 bits) | `bigint` | TypeORM expone `bigint` como **string** en runtime (`last_server_sequence`, `amount_minor`, `occurred_at_ms`) para evitar pérdida por doble precisión. En Dart es `int` de 64 bits. Same value serializado. |
| Texto con longitud | CHECK `length(col) >= 1 AND length(col) <= N` | `varchar(N)` + CHECK `char_length(col) BETWEEN 1 AND N` | `length()` (SQLite) y `char_length()`/`varchar(N)` (PG) cuentan **code points**, igual que `runes.length` (Dart) y `[...s].length` (TS). Normalización NFKC+trim ocurre en los payloads, no en el esquema. |
| Bool | INTEGER 0/1 + DEFAULT 1 | boolean + DEFAULT true | `CommonFields` / `SyncProjectionEntity`. |
| Fechas | INTEGER epoch ms | `bigint` epoch ms | Sin zona horaria: son números UTC. El servidor filtra `[from_ms, to_ms)` sin interpretar zonas. `created_at_local` vive en el sobre/evento, no en la proyección. |
| Trazabilidad común | `CommonFields` (mixin) | `SyncProjectionEntity` (abstracta) | `active`, `version`, `created_event_id`, `last_event_id`, `last_server_sequence`. Solo PG agrega `created_at_server`/`updated_at_server` (`timestamptz(3) NOT NULL DEFAULT now()`); SQLite no los persiste. |
| `active` | `boolean().withDefault(true)` | boolean default true | **No funcional en v1** en ambos motores: convención de proyección, permanece `true`; no representa borrado ni anulación (no hay edición/eliminación en esta entrega). |
| Índices | `@TableIndex.sql(...)` | `@Index(...)` | Mismos nombres físicos. |

## financial_categories

| Columna | SQLite (Drift) | PostgreSQL (TypeORM) |
|---|---|---|
| `id` | TEXT PK (CommonFields `id`) | `uuid` PK (`@PrimaryColumn('uuid')`) |
| `name` | TEXT NOT NULL, `CHECK(length(name) BETWEEN 1 AND 100)` | `varchar(100)` NOT NULL, `CHECK(char_length(name) BETWEEN 1 AND 100)` |
| `direction` | TEXT NOT NULL, `CHECK(direction IN ('in','out'))` | `text` NOT NULL, CHECK igual |
| `nature` | TEXT NOT NULL, CHECK con los 5 valores | `text` NOT NULL, CHECK con los 5 valores |
| `active` | INTEGER NOT NULL DEFAULT 1 | boolean NOT NULL DEFAULT true |
| `version` | INTEGER NOT NULL DEFAULT 1 | integer NOT NULL DEFAULT 1 |
| `created_event_id` | TEXT NULL | `uuid` NULL |
| `last_event_id` | TEXT NULL | `uuid` NULL |
| `last_server_sequence` | INTEGER NULL | `bigint` NULL (string runtime) |
| `created_at_server` / `updated_at_server` | — (no existe en CommonFields) | `timestamptz(3)` NOT NULL DEFAULT now() |

Índices: **solo PK** en ambos motores (tabla pequeña; la lista se ordena por `(name, id)` sin índice adicional). Sin unicidad sobre `name`. Checks adicionales (ambos): compatibilidad dirección/naturaleza `NOT (direction = 'in' AND nature IN ('asset_purchase','inventory_purchase'))`.

## financial_entries

| Columna | SQLite (Drift) | PostgreSQL (TypeORM) |
|---|---|---|
| `id` | TEXT PK (CommonFields) | `uuid` PK |
| `category_id` | TEXT NOT NULL, FK `REFERENCES financial_categories(id) ON DELETE RESTRICT` | `uuid` NOT NULL, FK igual |
| `category_name_snapshot` | TEXT NOT NULL, `CHECK(length(category_name_snapshot) BETWEEN 1 AND 100)` | `varchar(100)` NOT NULL + CHECK `char_length(...)` |
| `direction` / `nature` | Igual que en categorías (snapshots) | Igual que en categorías (snapshots) |
| `amount_minor` | INTEGER NOT NULL, `CHECK(amount_minor > 0 AND amount_minor <= 9007199254740991)` | `bigint` NOT NULL + CHECK igual (string runtime) |
| `currency` | TEXT NOT NULL, `CHECK(currency = 'MXN')` | `varchar(3)` NOT NULL + CHECK igual |
| `method` | TEXT NOT NULL, `CHECK(method IN ('cash','transfer'))` | `text` NOT NULL + CHECK igual |
| `occurred_at_ms` | INTEGER NOT NULL, `CHECK(occurred_at_ms > 0 AND occurred_at_ms <= 9007199254740991)` | `bigint` NOT NULL + CHECK igual (string runtime) |
| `notes` / `reference` | TEXT NULL, `CHECK(col IS NULL OR length(col) <= 500)` | `text` NULL + CHECK `char_length(col) <= 500` |
| común | `active`, `version`, `created_event_id`, `last_event_id`, `last_server_sequence` | Iguales + `created_at_server`/`updated_at_server` |

Índices (mismos nombres y columnas en ambos):

- `ix_financial_entries_period ON financial_entries(occurred_at_ms, id)` — informe por período `[from_ms, to_ms)` sumado con BigInt y orden `occurred_at_ms DESC, id`.
- `ix_financial_entries_category ON financial_entries(category_id, occurred_at_ms, id)` — detalle por categoría y cobertura del lookup FK.
- PK `id` cubre identidad/idempotencia por `created_event_id`.

No existen columnas ni tablas de caja, venta, abono ni reversa (`cash_sessions`, `cash_movements`, etc. quedan fuera del alcance confirmado).

## Decisión: checks de dirección/naturaleza también en financial_entries

El esquema de `financial_entries` incluye los **mismos** CHECK que `financial_categories` para `direction`, `nature` y la compatibilidad dirección-naturaleza. El contrato §4.2 valida snapshots «contra la categoría al aplicar» (manejo en servidor); los CHECK son una defensa equivalente a nivel de base para que ambos motores representen el mismo invariante.

## Migración y puesta en marcha (NestJS)

- Migración: `src/migrations/1790251200000-CreateFinancialCategoriesAndEntries.ts` (up: crea las dos tablas con PK/FK/checks/índices; down: si existen categorías o registros **rechaza** — «No se puede retirar el esquema con categorías o registros financieros.» —; sin registros elimina índices y tablas). El downgrade con datos existentes **no se promete no destructivo**: protege el dinero en lugar de descartarlo.
- `AppModule` registra `FinancialCategoryEntity` y `FinancialEntryEntity` en `TypeOrmModule` (`synchronize: true` solo en desarrollo). Escribir/probar la migración **no** la aplica a instalaciones reales.
- Efecto en el entorno dev: al registrar las entidades, el servidor dev local (`--watch`) reinició y `synchronize` creó las dos tablas en la base dev `pos_nest` (2026-09-24, aprobado por el usuario; no es despliegue).

## Detección de esquema (Flutter)

- `schemaVersion` se mantiene en **7**; no se agregó `onUpgrade`.
- `_resetDatabaseOnStartup` ahora exige además las tablas `financial_categories` y `financial_entries` para considerar una base «actual»; una base anterior se recrea con el esquema actual (política de desarrollo de AGENTS.md). Un respaldo restaurado de esquema anterior queda **protegido** (StateError, no se borra); un respaldo restaurado que ya contiene las tablas financieras es compatible y se conserva.

## Verificación de la sesión 1

- NestJS: `npm run build` OK; spec de migración ejecutado con `RUN_POSTGRES_INTEGRATION=1` contra PostgreSQL real local en esquema aislado y transaccional (13/13 specs de migración pasan; datos previos conservados, restricciones e índices probados, FK RESTRICT protegida, downgrade con datos rechazado).
- Flutter: `dart run build_runner build`, `dart analyze` (sin issues) y `flutter test` (595 pruebas, todas pasan), incluidas las nuevas de detección de esquema/respaldos con archivos temporales.