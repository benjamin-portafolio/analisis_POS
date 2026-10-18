---
tipo: documentacion
relacionado: contrato revision 1
fase: 1
actualizado: 2026-10-04
---

# Mapeo físico de esquemas — procedencia y memoria de variante

Implementación de la fase 1 conforme al «Contrato funcional y de eventos» rev. 1,
§5 y §6.1/§6.3. Los esquemas de esta fase representan **el mismo contrato** en
SQLite (Drift, Flutter) y PostgreSQL (TypeORM, NestJS): mismos nombres físicos,
mismos tipos lógicos, mismos índices y mismas cascadas.

El contrato JSON **no cambió**: sigue en revisión 1. Las aclaraciones que
aparecieron al escribir el código (invariantes del descarte, obligatoriedad de la
procedencia) ya estaban implícitas en el contrato y se registran aquí y en los
comentarios de código, no en una revisión nueva.

## Alcance histórico de la fase 1

Solo dos elementos nuevos:

1. `inventory_items.origin_variant_id` — procedencia del recurso.
2. `variant_inventory_memory` — último recurso directo conocido por una variante.

Nada más cambió de nombre ni de forma. No se agregó `onUpgrade`, no se conectó
UI y el evento `recurso_inventario_descartado` **no** se registró como emisor:
`InventoryEventHandler.supports()` y las allowlists de `sync.service.ts` siguen
exactamente como estaban.

## Correspondencias generales (sin cambios respecto al roadmap anterior)

| Concepto | SQLite (Drift) | PostgreSQL (TypeORM) | Notas |
|---|---|---|---|
| UUID | `TextColumn` (TEXT) | `uuid` | En SQLite el formato se valida en el contrato del evento; en PG el motor lo valida. Mismo UUID v4. |
| bigint | `IntColumn` (INTEGER 64 bits) | `bigint` | TypeORM expone `bigint` como **string** en runtime. Dart usa `int` de 64 bits. |
| Trazabilidad común | `CommonFields` | `SyncProjectionEntity` | `active`, `version`, `created_event_id`, `last_event_id`, `last_server_sequence`. Solo PG añade `created_at_server`/`updated_at_server`. |
| Índices | `@TableIndex.sql(...)` | `@Index(...)` | Mismos nombres físicos. |

## inventory_items.origin_variant_id

| | SQLite (Drift) | PostgreSQL (TypeORM) |
|---|---|---|
| Columna | `origin_variant_id TEXT NULL` | `origin_variant_id uuid` nullable |
| FK | **Ninguna** | **Ninguna** |
| Índice | `ix_inventory_items_origin_variant ON inventory_items (origin_variant_id)` | `ix_inventory_items_origin_variant` btree `(origin_variant_id)` |
| Unicidad | No | No |

### Por qué no es una FK

El evento de recurso se aplica **antes** de que exista la variante: el alta del
producto declara la dependencia del recurso, no al revés. Declarar la referencia
invertiría el orden causal recurso → producto y rompería el replay. Es una
**identidad de procedencia**, y el formato UUID v4 se valida en el contrato del
evento (`RecursoInventarioCreadoPayload`), no en el motor.

### Por qué el índice no es único

Pueden existir recursos históricos o creaciones concurrentes con el mismo
origen. La unicidad normativa sigue siendo la del **vínculo directo** en
`product_variants.inventory_item_id`; este índice solo sirve para encontrar
recursos que comparten procedencia. Probado en PostgreSQL: dos filas con el mismo
`origin_variant_id` conviven.

### `NULL` significa desconocido

Recursos independientes, eventos legados y `null` explícito. No autoriza ningún
descarte: la procedencia comprobable es requisito de elegibilidad (§6.3).

## variant_inventory_memory

DDL literal generado por Drift y su equivalente en PostgreSQL:

```sql
-- SQLite
CREATE TABLE "variant_inventory_memory" (
  "variant_id" TEXT NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
  "inventory_item_id" TEXT NOT NULL REFERENCES inventory_items (id) ON DELETE CASCADE,
  "source_event_id" TEXT NOT NULL,
  "source_server_sequence" INTEGER NULL,
  PRIMARY KEY ("variant_id")
);
CREATE INDEX ix_variant_inventory_memory_item
  ON variant_inventory_memory (inventory_item_id);
```

```sql
-- PostgreSQL
CONSTRAINT "pk_variant_inventory_memory" PRIMARY KEY (variant_id)
CONSTRAINT "fk_variant_inventory_memory_variant"
  FOREIGN KEY (variant_id) REFERENCES product_variants (variant_id) ON DELETE CASCADE,
CONSTRAINT "fk_variant_inventory_memory_inventory_item"
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items (inventory_item_id) ON DELETE CASCADE
CREATE INDEX ix_variant_inventory_memory_item ON variant_inventory_memory (inventory_item_id)
```

| Columna | SQLite | PostgreSQL | Significado |
|---|---|---|---|
| `variant_id` | TEXT NOT NULL, PK | `uuid` NOT NULL, PK | Variante que recuerda el recurso. Es la identidad de la fila. |
| `inventory_item_id` | TEXT NOT NULL, FK CASCADE | `uuid` NOT NULL, FK CASCADE | Último recurso directo conocido. **No único**: el índice permite detectar memorias de otras variantes (condición 6 de elegibilidad). |
| `source_event_id` | TEXT NOT NULL | `uuid` NOT NULL | Evento de producto que acreditó la memoria. **No es FK** al historial de eventos. |
| `source_server_sequence` | INTEGER NULL | `bigint` NULL | Secuencia oficial del evento acreditado; `null` mientras el estado es solo local. Permite reconocer un eco sin sobrescribir una memoria posterior. |

### Cascadas

Simétricas y de una sola dirección:

- Borrar el **recurso** elimina **solo** su memoria; nunca la variante.
- Borrar la **variante** elimina **solo** su memoria; nunca el recurso.

Probado en ambos motores. Nótese que el vínculo directo
(`product_variants.inventory_item_id`) y los movimientos siguen siendo `RESTRICT`:
la memoria no exime al recurso de un saldo o historial real, y el orden real del
descarte es primero soltar el vínculo directo y después borrar el recurso.

### Por qué no usa `CommonFields` / `SyncProjectionEntity`

Cada fila es un dato **derivado y reemplazable** del agregado producto/variante:

- **No tiene ciclo de vida propio.** No se anula (`active`): una memoria se
  sustituye cuando aparece un vínculo directo nuevo o recuperado, y se elimina
  cuando el recurso se descarta.
- **No tiene versión propia.** Su identidad es la variante; la concurrencia la
  serializa el lock del producto en `server_sync`, igual que el resto de la
  configuración de variantes.
- **No lleva `created_event_id`/`last_event_id`/`last_server_sequence`.** Lleva su
  propio par `source_event_id`/`source_server_sequence`, que apunta al evento de
  producto que acreditó el vínculo, no al ciclo de vida de la fila.

Esta excepción está documentada en el comentario de la tabla de Drift y en el de
la entidad de TypeORM, para que no se lea como omisión.

### No reserva existencias

No participa del saldo, no habilita consumo y no se usa para cobrar una venta. La
configuración de venta capturada sigue siendo la única fuente de consumo
histórico.

## Migración PostgreSQL

`src/migrations/1790774400000-AddInventoryOriginAndVariantMemory.ts`.

- **Idempotente**: `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`,
  `CREATE TABLE IF NOT EXISTS` y `ON CONFLICT ("variant_id") DO NOTHING`. Se puede
  aplicar dos veces sin efecto.
- **Preserva todos los datos**: no toca `inventory_items`, `inventory_balances`,
  `inventory_movements`, `recipe_components`, `product_variants` ni `events`.
- **Origen legado queda en `NULL`.** No inventa procedencia a partir del nombre,
  del más reciente ni de la variante más cercana.
- **Siembra memoria solo con evidencia comprobable.** Una fila por variante con
  vínculo directo actual (`product_variants.inventory_item_id IS NOT NULL`)
 —incluidas las variantes **inactivas**— siempre que exista un evento de producto
  aceptado (`sync_status = 'synced'`) que declarara ese mismo vínculo:
  `producto_creado`, o el `after` de un `producto_actualizado` que no elimina el
  producto. Gana el de mayor `server_sequence`.
- **No copia `last_event_id`.** Podría apuntar a un evento de Categorías o de otro
  agregado sin configuración; la accreditedora es el evento de producto.
- **Variante sin evidencia no recibe fila.** Ausencia de memoria significa «sin
  demostrar», no «sin vínculo anterior».

### Qué NO hace la siembra (límite declarado)

La reconstrucción de memoria de variantes **ya desvinculadas** requiere una cadena
demostrable de eventos de producto y corresponde a la **fase 2**. Esta migración
no la intenta y no inventa fuentes. El fixture
`Fixtures/memoria/memoria-legada-recuperable.json` describe ese caso pendiente.

### `down` no es una recuperación de datos

El downgrade **destruye** la memoria sembrada y el índice de procedencia, y elimina
la columna. **No se ofrece como recuperación**: memoria y procedencia quedan
perdidas y solo pueden reconstruirse volviendo a aplicar esta migración con las
mismas evidencias. Se declara expresamente aquí, en el comentario de la migración
y en `Estado y continuidad`.

## Entorno de desarrollo (fotografía histórica, no revalidada en esta auditoría)

`VariantInventoryMemoryEntity` está registrada en `AppModule`, y `synchronize:
true` (mecanismo aceptado del proyecto en desarrollo) ya creó la tabla y la columna
en la base dev local `pos_nest`: **solo esquema**.

Estado real de esa base tras esta fase:

- `variant_inventory_memory`: **0 filas**.
- `inventory_items`: 15 filas, **0 con `origin_variant_id`**.

La migración **no** se aplicó a la base dev. Decisión del 2026-10-02: se deja
pendiente a propósito. Al 2026-10-04 también sigue pendiente la migración
1790860800000; la fase 2 se verificó exclusivamente con esquemas aislados.
Los conteos anteriores describen aquella sesión, no una consulta actual a datos
de uso. Ninguna se aplicó a `pos_nest` durante esta auditoría.

## Detección de esquema (Flutter)

- `schemaVersion` se mantiene en **8**; no se agregó `onUpgrade`.
- `_resetDatabaseOnStartup` exige **además** de lo anterior:
  - la tabla `variant_inventory_memory` exista, y
  - `inventory_items.origin_variant_id` exista.
- Una base anterior se **reconstruye** con el esquema actual (política de
  desarrollo de `AGENTS.md`). Un respaldo restaurado de esquema anterior queda
  **protegido**: `StateError`, no se borra.
- Un respaldo restaurado que ya contiene tabla y columna es compatible y se
  conserva entre arranques, con su procedencia y su memoria intactas.

## Contrato: aclaraciones registradas (sin cambio de revisión)

Estas invariantes ya se deducían del contrato; se hacen explícitas aquí y en los
comentarios de código para que no se reimprueben por separado.

1. `origin_variant_id` es **opcional** en `recurso_inventario_creado` (alta
   legada, recurso independiente) y **obligatorio** en
   `recurso_inventario_descartado`: sin procedencia comprobada no hay descarte.
2. `trigger_product_event_id != base_event_id`. Son eventos de agregados
   distintos; si coincidieran, el disparador sería el propio alta.
3. `policy_version` admite **exactamente 1**. Cualquier otro valor se rechaza en
   el contrato, antes de evaluar elegibilidad o borrar nada.
4. El payload de descarte **no** incluye `inventory_item_id`: el `aggregate_id` del
   sobre ya es el recurso.
5. El payload de descarte valida **claves estrictamente** (como
   `recurso_inventario_actualizado`): un campo desconocido se rechaza.
6. `delivery_status = not_required` es obligatorio en el descarte. En `standalone`
   no genera filas en `event_refs`; el push no transporta refs y el servidor
   rechaza el evento funcionalmente sin borrar nada.
7. Dart expone `refs(String inventoryItemId)` (espejo de
   `VentaConfirmadaPayload.refs(String saleId)`) para que el command service
   declare `affects` del recurso, `uses` del producto y `uses` de la variante.
   TypeScript **no** declara refs para este evento: el servidor no lo registra
   como emisor.

## Verificación de la fase 1

Registrada con detalle en `Estado y continuidad.md`. Resumen:

- NestJS: `npm run build` OK; `npm test` OK (246 pruebas, 22 suites saltadas por
  convención); spec de migración ejecutado con `RUN_POSTGRES_INTEGRATION=1`
  contra PostgreSQL real en **esquema aislado** (6/6).
- Flutter: `dart run build_runner build`, `dart analyze` (sin issues) y
  `flutter test` (1009 aprobadas, 1 fallo **preexistente** en
  `inventory_management_screen_test.dart`, reproducido en un worktree limpio del
  HEAD `56df46b`), incluidas las nuevas de esquema, cascadas, detección de reset
  y respaldo con archivos temporales.
- La migración **no** se aplicó a `pos_nest`; la base dev solo tiene el esquema
  creado por `synchronize`.

## Adiciones físicas y consumo real revalidados — 2026-10-04

Los elementos de fase 1 ya forman parte del esquema declarado/regenerado. La
segunda migración PG, `1790860800000-ReconstructLegacyVariantInventoryMemory.ts`,
reconstruye variantes desvinculadas con evidencia y deja intactos recursos,
saldos, movimientos/eventos/origen. Su spec pasa 8 pruebas reales aisladas.
Su down conserva filas. El receptor deriva memoria bajo lock de producto;
la existencia de la tabla SQLite todavía no implica esa derivación en Flutter.

El árbol Flutter pendiente además contiene `inventory_item_discards`, sin
equivalente PostgreSQL porque el servidor no admite descarte. Forma física del
esquema Drift regenerado actual:

| Campo SQLite | Tipo / restricción | Uso |
|---|---|---|
| inventory_item_id | TEXT NOT NULL, PK; sin FK | Identidad que debe sobrevivir al borrado |
| discard_event_id | TEXT NOT NULL | Prueba del mismo descarte aplicado |
| trigger_product_event_id | TEXT NOT NULL | Evento de producto disparador |

La tabla no usa CommonFields y no tiene FK/cascada hacia el recurso. El DAO tiene
lectura/registro, pero no existe emisor/handler de descarte ni guarda de alta
antigua con su tombstone. Es estructura parcial, no descarte implementado.
`product_update_undo.memory_json` es TEXT NOT NULL con default `[]`, ya está en
el esquema generado; el backup captura filas, pero la restauración no repone
la ausencia previa y oculta errores. No acredita undo exacto.

La detección de arranque exige además `inventory_item_discards`. `schemaVersion`
permanece **8**, sin una migración onUpgrade para esta funcionalidad. El
onUpgrade histórico sigue presente para versiones anteriores y otros agregados. No se promete conservar instalaciones antiguas
al resetearlas. Pruebas de esquema/reapertura: 5/3 aprobadas; sonda de negocio:
8 fallidas. No se cambió/regeneró Drift durante esta auditoría. Ver [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-prerrequisitos-fase5/Resultados|Auditoría de entrada a fase 5, 2026-10-04]].

## Aplicación comprobada — corrección de fase 3, 2026-10-04

Sin cambios físicos ni aumento de schemaVersion en esta corrección. La memoria,
product_update_undo.memory_json y inventory_item_discards ya presentes tienen
consumidores funcionales: write por producto, restore exacto/ausencia, avance
por source_event_id en push/eco y descarte standalone atómico. La prueba de
idempotencia contrasta tombstone con evento aplicado/alta histórica. Balance y
memoria se eliminan por cascada; eventos/variante permanecen. Build_runner pasó
sin diferencia adicional de app_database.g.dart frente al inicio de la sesión.
Ver [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]]. PG dev sigue sin las dos migraciones pendientes; la verificación
usó exclusivamente PostgreSQL temporal.
