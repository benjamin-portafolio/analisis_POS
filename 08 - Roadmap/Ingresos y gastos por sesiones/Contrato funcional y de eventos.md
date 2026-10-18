---
tipo: contrato
estado: listo_para_implementar
revision: 1
actualizado: 2026-09-24
---

# Contrato funcional y de eventos — Ingresos y gastos adicionales

## 1. Estado y alcance

**Revisión 1, listo para implementación.** Este documento sustituye el borrador revisión 0. Todas las propuestas quedaron cerradas tras revalidarlas contra el código real de Flutter (`/Users/benjamin/Projects/POS/pos_flutter`) y NestJS (`/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`). Las sesiones 1 a 6 deben implementar exactamente los nombres, reglas, política de conflictos, errores y consultas aquí definidos, con los fixtures de la carpeta `Fixtures/` junto a este documento.

Alcance confirmado:

- Crear y listar **categorías financieras** (`financial_categories`).
- Registrar, listar y consultar **ingresos y gastos adicionales** (`financial_entries`), por período, método, dirección y categoría.
- Funcionamiento en modo **standalone** y **server_sync** con el mismo core.
- Consulta/informe adicional (local y central) sin tocar el significado del informe de cobros existente.

Fuera de alcance (explícito):

- Toda gestión de caja: no `cash_sessions`, `cash_movements`, aperturas, cortes, saldos de cajón ni asociaciones ficticias a una sesión.
- No duplicar `sale_payments` ni `customer_payments` en `financial_entries`.
- No edición, eliminación, desactivación funcional ni reversas de categorías o registros en esta entrega. `active` permanece `true` y representa convención de proyección, no borrado.
- No contabilidad completa, deudas de gastos, cuentas bancarias, pagos mixtos, adjuntos, ni copiar el catálogo de la app del video.
- No bootstraps inventados: no hay snapshot de servidor implementado; ver §6.8.

Esta sesión (0) solo modifica documentación y fixtures. No tocó código de Flutter/NestJS ni esquemas.

## 2. Decisiones cerradas

### 2.1 Categorías financieras

- `financial_categories` es independiente de `categories` de productos (agregado y tablas propios).
- Se crean vacías: no hay siembra inicial de categorías. El usuario las crea desde el selector.
- **Dirección** `direction`: `in` (ingreso) | `out` (gasto). Explícita e inmutable desde el alta. La UI la deriva del contexto del botón presionado: «Ingreso» → `in`, «Gasto» → `out`.
- **Naturaleza** `nature` (clasificación para reportes de flujo; no es contabilidad ni reconocimiento de utilidad). Es explícita e inmutable desde el alta; se elige con una selección sencilla en el alta, **nunca se infiere del nombre**. Valor predeterminado: `operating`.

| nature | Direcciones admitidas | Etiquetas UI |
|---|---|---|
| `operating` | `in`, `out` | Ingreso operativo / Gasto operativo |
| `capital` | `in`, `out` | Aportación de capital (in) / Retiro de capital (out) |
| `asset_purchase` | solo `out` | Compra de equipo o activo |
| `inventory_purchase` | solo `out` | Compra de mercancía |
| `financing` | `in`, `out` | Préstamo recibido (in) / Pago de préstamo (out) |

- **Unicidad**: no hay unicidad global por nombre. Dos categorías pueden tener el mismo texto y distintos UUID. No hay clave única sobre `name` en ningún motor.
- **Orden estable**: por `name` y luego `id` (ascendente, byte-wise). No hay ordenamiento manual ni columna de orden.
- Una categoría no se edita ni elimina en esta entrega; la única mutación de sus metadatos es el avance de `last_server_sequence` con su propio eco.

### 2.2 Normalización de textos

- `name`: se normaliza con **NFKC + trim**. Obligatorio, longitud 1..100 **code points** tras normalizar.
- `notes` y `reference`: opcionales, **NFKC + trim**, vacío → `null`, máximo 500 code points.
- Conteo idéntico en Dart y TypeScript: tras `normalize('NFKC')`, contar code points (`[...s].length` en TS; `runes.length` en Dart). Ambos proyectos ya tienen los helpers: `InventoryMovementPayload.normalizeReason` y `requiredUuidV4` en `lib/application/sync/payloads/inventory_movement_payload.dart` (Dart, usa `unorm_dart`), y `normalizeRequiredText`/`requiredUuidV4` en `src/sync/payloads/inventory-movement.payload.ts` (TS). Reutilizarlos; no duplicar literales.
- UUIDs: v4, validados con el mismo regex en ambos lados (mayúsculas/minúsculas aceptadas; se conserva el texto recibido una vez validado).

### 2.3 Montos y moneda

- Importes **enteros en centavos**, positivos: `1 <= amount_minor <= 9007199254740991` (`Number.MAX_SAFE_INTEGER`).
- Moneda fija **`MXN`**, con CHECK en ambas bases y validación en ambos payloads.
- Acumulación de totales con **`BigInt`**; totales serializados como **string decimal** (sin notación científica).
- No se usa `double` para persistir ni para totalizar.

### 2.4 Fechas y períodos

- `occurred_at_ms`: instante efectivo **UTC en milisegundos** (epoch ms), separado de `created_at_local` (captura) y de `server_sequence` (cursor). Valores permitidos: entero seguro `> 0` y `<= 9007199254740991`.
- Captura: la UI usa fecha/hora **local del dispositivo** con predeterminado «ahora» y permite fechas pasadas. El **command** rechaza programar futuro: `occurred_at_ms > now + 5 min` es inválido (tolerancia de reloj de 5 minutos). Los payloads Dart/TS y el servidor validan solo el entero seguro (no rechazan futuro por diferencia de reloj entre dispositivos).
- Períodos: semántica **`[inicio, fin)`** con `from_ms`/`to_ms` en **epoch ms UTC**. La UI construye el intervalo en la zona local del dispositivo: inicio de día local (`00:00` local → UTC ms) y fin exclusivo `+1 día` local. El patrón `ReportPeriod` existente (`lib/presentation/pages/informes/models/report_period.dart`) ya implementa `[start, endExclusive)` en hora local; el repositorio recibe `fromMs`/`toMs` UTC derivados.
- El servidor no interpreta zonas horarias: solo filtra epoch en `[from_ms, to_ms)` sobre `occurred_at_ms`.
- `occurred_at_ms` no reemplaza a `created_at_local` ni a `server_sequence` como cursor.

### 2.5 Método

- `method`: `cash` | `transfer` (strings, como los pagos actuales; no se introduce un enum nuevo). «Transfer» nunca implica saldo de un cajón: es solo el medio del registro.

### 2.6 Snapshots y auditoría

- Cada `financial_entry` conserva `category_name_snapshot`, `direction` y `nature` al capturar, validados contra la categoría en ese momento (la categoría es inmutable, así que coinciden siempre con la categoría capturada).
- Trazabilidad por fila: `created_event_id`, `last_event_id`, `last_server_sequence` (convención `CommonFields` / `SyncProjectionEntity`, verificado en `lib/data/local/drift/tables/common_fields.dart` y `src/entities/sync-projection.entity.ts`).
- **Retención de events**: hoy no existe política de purga de la tabla `events` ni en Flutter ni en NestJS (verificado; `EventDao` no borra filas). Por lo tanto, el reporte local puede unir `financial_entries` con `events` (`created_event_id`) para exponer `delivery_status`, `rejection_reason`, `user_id` y `device_id`, igual que el reporte de cobros (`lib/data/repositories/collection_repository_impl.dart`). No se requiere copiar auditoría adicional a la proyección mientras no haya purga; si en el futuro se retiene/purga `events`, es un cambio transversal fuera de esta entrega.
- **Respaldo/restauración local**: existe snapshot SQLite (`VACUUM INTO`) + manifest (Google Drive) en Flutter (`lib/application/backup/`, `lib/data/local/backup/`). Restaura eventos y proyecciones completos. Compatible solo si la base restaurada es del esquema actual (evolución de detección en sesión 1); respaldos de esquema anterior fallan de forma explícita y protegida (`StateError` en `_resetDatabaseOnStartup`).
- **Cliente nuevo**: no hay bootstrap de servidor. Cliente `server_sync` nuevo se llena con pull incremental desde `since=0` (cursor por defecto de `SyncCheckpoints`); standalone con restore de Google Drive. Este módulo no crea ningún subsistema extra.

### 2.7 Consultas y reportes

- El informe «Ingresos y gastos» incluye **exclusivamente** `financial_entries` (adicionales) y lo dice expresamente. No incluye cobros de venta ni abonos; el informe de cobros existente conserva su significado.
- Totales del período: ingresos (`income_minor` = suma de `direction in`), gastos (`expense_minor` = suma de `direction out`), desglose por método (`cash_minor`, `transfer_minor`) y **`net_minor` = ingresos − gastos**. `net_minor` se etiqueta «Neto de registros adicionales»; **nunca** «utilidad» ni «saldo de caja». Los totales son de registros adicionales, no del negocio completo.
- Consulta local: proyecciones aplicadas localmente, **incluidos pendientes y con incidencia**, con su `delivery_status`/`rejection_reason` visibles (una incidencia de entrega no oculta ni revierte dinero).
- Consulta central: solo proyecciones oficialmente aceptadas por el servidor (`events` con `sync_status='synced'`).
- Mismo intervalo `[from_ms, to_ms)`, misma moneda, mismas sumas con `BigInt`, mismo orden (`occurred_at_ms DESC, id`) en local y central. Las diferencias entre ambos se explican por registros pendientes/incidentes.

### 2.8 Modos standalone / server_sync

Reglas idénticas al resto del sistema (ver `AGENTS.md` de Flutter y `lib/data/local/drift/drift_local_event_store.dart`):

| Aspecto | standalone | server_sync |
|---|---|---|
| Comandos, payloads, reglas y repositorios | Core común | Core común |
| `LocalEventRef` | Declarar y validar | Declarar, validar y persistir |
| `event_refs` | Sin filas | Persistidas (`source='local_pending'`) |
| Aplicación local | `application_status='applied'` | `application_status='applied'` |
| `delivery_status` inicial | `not_required` | `pending` |
| Red | Sin push/pull/preflight/health/WebSocket | Flujo existente |

No convertir historial standalone a `pending`. No implementar dos variantes de negocio por modo.

## 3. Modelo de eventos

### 3.1 Sobres

Se reutiliza el sobre existente (`SyncEvent` en Flutter, `PushEventDto`/`PullEventDto` en NestJS): `event_id`, `aggregate_type`, `aggregate_id`, `event_type`, `device_id`, `user_id`, `local_sequence`, `base_server_sequence`, `base_version`, `created_at_local` (ISO-8601 UTC), `payload` (objeto JSON).

Para altas de este módulo:

- `event_id`: UUID v4 nuevo por intención (estable en el reintento de la misma captura).
- `base_version = 1` y `base_server_sequence = null` (agregados nuevos de un solo evento).
- Sin `depends_on_event_id` en el sobre; la dependencia causal es `category_event_id` en el payload (ver §4.3).

### 3.2 Agregados y eventos

| aggregate_type | event_type | aggregate_id | payload |
|---|---|---|---|
| `financial_category` | `categoria_financiera_creada` | UUID de la categoría | `{name, direction, nature}` |
| `financial_entry` | `movimiento_financiero_registrado` | UUID del registro | ver §5.2 |

### 3.3 Refs y relaciones

| Evento | refs (Dart `refs(id)` / server canónico) | relationship |
|---|---|---|
| `categoria_financiera_creada` | `financial_category` → category_id | `affects` |
| `movimiento_financiero_registrado` | `financial_entry` → entry_id<br>`financial_category` → category_id | `affects`<br>`uses` |

- `category_event_id` identifica el **evento de creación** de la categoría (no una edición ni su última secuencia).
- Sin `requires_unique` por nombre.
- Standalone declara/valida las mismas refs sin persistirlas.
- El servidor **reconstruye las refs canónicas desde el payload ya validado** y las persiste con `source='server'`; no acepta refs arbitrarias del cliente como autoridad.

### 3.4 Dependencia categoría → registro

- El registro se aplica localmente aunque la categoría aún no haya sido aceptada por el servidor (depende de `category_event_id`).
- `dependencyEventIds` del registro = `[category_event_id]`.
- En push, `_dependsOnEventIds` (`lib/application/sync/sync_push_service.dart`) debe incluir el caso `movimiento_financiero_registrado` → `dependencyEventIds.any(eventIds.contains)`, para que el registro **espere** la entrega de la categoría; el orden de timestamps no reemplaza esta dependencia.
- La aceptación de la categoría no incrementa versión de categoría por cada registro: cada `financial_entry` es independiente y referencia la categoría con `uses`. Dos registros de la misma categoría no compiten por la versión del agregado.
- Si la categoría no puede sincronizarse, el registro se conserva localmente visible con incidencia; el servidor **no inventa una categoría** para aceptarlo.

## 4. Esquema lógico y mapeo físico

### 4.1 financial_categories

Lógico (ambos motores):

| Columna | Regla |
|---|---|
| `id` | UUID v4, PK (clave global del dispositivo) |
| `name` | TEXT/VARCHAR(100), NOT NULL, NFKC+trim 1..100 |
| `direction` | `in` / `out`, NOT NULL |
| `nature` | `operating` / `capital` / `asset_purchase` / `inventory_purchase` / `financing`, NOT NULL |
| `active` | BOOL NOT NULL default true. **No funcional en v1** (convención de proyección) |
| `version` | INT NOT NULL default 1 |
| `created_event_id` | UUID NULL (evento de creación) |
| `last_event_id` | UUID NULL |
| `last_server_sequence` | BIGINT NULL |

Restricciones (ambos motores):

- `CHECK(direction IN ('in','out'))`
- `CHECK(nature IN (...5 valores...))`
- `CHECK` compatibilidad dirección/naturaleza: `NOT (direction = 'in' AND nature IN ('asset_purchase','inventory_purchase'))`
- Sin clave única sobre `name`.

Índices: solo PK. La lista se ordena por `(name, id)` sin índice adicional; tabla pequeña y el orden no exige índice para corrección.

Mapeo físico:

| Concepto | SQLite (Drift) | PostgreSQL (TypeORM) |
|---|---|---|
| Tabla | `financial_categories` (`@DataClassName('FinancialCategoryRow')`) | `financial_categories` (`FinancialCategoryEntity`) |
| id | `TextColumn` | `@PrimaryColumn('uuid')` |
| name | `TextColumn` con CHECK longitud via `customConstraint` | `varchar(100)` |
| Campos comunes | hereda `CommonFields` | extiende `SyncProjectionEntity` |
| Checks | `customConstraints` | `@Check(...)` |

### 4.2 financial_entries

Lógico:

| Columna | Regla |
|---|---|
| `id` | UUID v4, PK, estable en reintentos de la misma intención |
| `category_id` | UUID, NOT NULL, **FK → financial_categories(id) con ON DELETE RESTRICT** |
| `category_name_snapshot` | TEXT/VARCHAR(100), NOT NULL (nombre al capturar) |
| `direction` | Snapshot `in`/`out`, NOT NULL, validado contra categoría al aplicar |
| `nature` | Snapshot (5 valores), NOT NULL, validado contra categoría al aplicar |
| `amount_minor` | BIGINT/INTEGER, NOT NULL, `CHECK(1..9007199254740991)` |
| `currency` | `'MXN'`, NOT NULL, `CHECK(currency = 'MXN')` |
| `method` | `cash`/`transfer`, NOT NULL |
| `occurred_at_ms` | BIGINT/INTEGER, NOT NULL, `CHECK(>0 y <= 9007199254740991)` |
| `notes` | Nullable, ≤500 code points |
| `reference` | Nullable, ≤500 code points |
| `active`, `version`, `created_event_id`, `last_event_id`, `last_server_sequence` | Convención común (version 1; solo avanza `last_server_sequence`) |

Índices y las consultas que los justifican:

- `ix_financial_entries_period ON financial_entries(occurred_at_ms, id)` — consulta del informe por período: `WHERE occurred_at_ms >= ? AND occurred_at_ms < ? ORDER BY occurred_at_ms, id` (igual en SQLite local y PostgreSQL central).
- `ix_financial_entries_category ON financial_entries(category_id, occurred_at_ms, id)` — detalle por categoría (todas las entradas de una categoría ordenadas por fecha) y cubre el lookup de la FK `category_id`.
- PK `id` cubre duplicados/identidad e idempotencia por `created_event_id`.

Mapeo físico: iguales convenciones que 4.1; `amount_minor`/`occurred_at_ms`/`last_server_sequence` como `bigint` en PostgreSQL (string en el runtime TypeORM) y `int` (`IntColumn`) en SQLite. `notes`/`reference` como `text`/`TextColumn`. `category_id` como uuid/TextColumn con `references(FinancialCategories, #id, onDelete: KeyAction.restrict)` en Drift y FK en TypeORM.

No existen columnas de caja, venta, abono ni reversa.

## 5. Payloads definitivos

### 5.1 `categoria_financiera_creada`

```json
{
  "name": "Renta",
  "direction": "out",
  "nature": "operating"
}
```

Validación por campo (aplicar en Dart `fromJson`, TS `fromJson` y validaciones del command):

| Campo | Regla | Error canónico |
|---|---|---|
| `name` | string, NFKC+trim, 1..100 code points | `El nombre de la categoría financiera es obligatorio.` / `name debe tener entre 1 y 100 caracteres.` |
| `direction` | string `in`/`out` | `direction debe ser in u out.` |
| `nature` | string de los 5 valores | `nature no está permitida.` |
| dirección+naturaleza | `asset_purchase`/`inventory_purchase` solo `out` | `nature no es compatible con la dirección.` |

### 5.2 `movimiento_financiero_registrado`

```json
{
  "category_id": "11111111-1111-4111-8111-111111111111",
  "category_event_id": "22222222-2222-4222-8222-222222222222",
  "category_name_snapshot": "Renta",
  "direction": "out",
  "nature": "operating",
  "amount_minor": 350000,
  "currency": "MXN",
  "method": "transfer",
  "occurred_at_ms": 1790258400000,
  "notes": "Renta de septiembre",
  "reference": null
}
```

| Campo | Regla | Error canónico |
|---|---|---|
| `category_id` | UUID v4 | `category_id debe ser un UUID v4.` |
| `category_event_id` | UUID v4 | `category_event_id debe ser un UUID v4.` |
| `category_name_snapshot` | string, NFKC+trim, 1..100 code points | `category_name_snapshot debe tener entre 1 y 100 caracteres.` |
| `direction` | `in`/`out`, debe ser igual a la categoría | `direction del registro no coincide con la categoría.` |
| `nature` | 5 valores, debe ser igual a la categoría | `nature del registro no coincide con la categoría.` |
| `amount_minor` | entero seguro 1..9007199254740991 | `amount_minor debe ser un entero positivo en centavos.` |
| `currency` | `'MXN'` | `Moneda inválida.` |
| `method` | `cash`/`transfer` | `method debe ser cash o transfer.` |
| `occurred_at_ms` | entero seguro >0 y <= max | `occurred_at_ms debe ser un instante válido.` |
| `notes` | string|null; NFKC+trim, vacío→null, ≤500 code points | `notes debe tener entre 1 y 500 caracteres.` |
| `reference` | igual que `notes` | `reference debe tener entre 1 y 500 caracteres.` |

Los payloads tipados (clase por archivo, `aggregateType`/`eventType` estáticos, `fromJson`/`toJson`) deben reutilizar las constantes y helpers citados en §2.2/§2.3; no duplicar literales.

## 6. Invariantes y política de conflictos

### 6.1 Validación y rechazo

- Payload inválido → `rejected` (servidor) / `FormatException` (payloads Dart), **sin crear evento ni proyección**.
- Sobre inválido (`aggregate_type`/`event_type` que no corresponden, `base_version != 1`, `base_server_sequence != null`) → `rejected` «Sobre de [categoría financiera|registro financiero] inválido.»
- Servidor: `validateBaseEvent` debe reconocer los pares `categoria_financiera_creada ↔ financial_category` y `movimiento_financiero_registrado ↔ financial_entry`; eventos no soportados → `rejected`.

### 6.2 Idempotencia y reintentos

- Mismo `event_id` + mismo contenido (intención repetida) → no se crea nada nuevo; se devuelve la identidad/estado anterior (command idempotente por `aggregate_id`, como `CreditoCommandService.registrarAbono`).
- Mismo `event_id` + contenido distinto → `StateError` local / `rejected` en servidor; **nunca** se aplica dos veces.
- Servidor: `event_id` duplicado → `duplicate` con `original_sync_status` (preserva `pending|synced|rejected|conflict` original; ver `sync.service.ts` `processEvent`/`toResult`).
- Push con respuesta perdida → el evento queda `pending`; el reintento recibe `duplicate` con `original_sync_status` y el cliente queda `delivered` sin reaplicar.
- Una segunda operación intencional usa una nueva identidad (`aggregate_id`/`event_id` nuevos).

### 6.3 Aceptación de categoría

Pasos en el handler `categoria_financiera_creada` (servidor, transaccional):

1. Sobreválido → payload válido (si no, `rejected`).
2. `event_id` ya existente → `duplicate` + `original_sync_status`.
3. Existe `financial_categories.id == aggregate_id` con `created_event_id != event_id` → **conflicto** (`aggregate_id_conflict` de identidad): motivo canónico `Ya existe una categoría financiera con este id.`, `defaultWinnerEventId = created_event_id` del existente, ref `financial_category`/category_id, `conflictType 'financial_category_identity'`. **No** sobrescribir.
4. Si no: guardar evento `SYNCED` + proyección (`version 1`, `created_event_id = event_id`, `last_event_id = event_id`, `last_server_sequence = server_sequence`) + refs canónicas `affects`. Respuesta `accepted`.

Carrera 23505 en inserción → resultado controlado `conflict` (motivo `Identidad de categoría financiera ya registrada.`), nunca 500.

### 6.4 Aceptación de registro

Pasos en `movimiento_financiero_registrado` (servidor, transaccional):

1. Sobreválido → payload válido (si no, `rejected`).
2. `event_id` duplicado → `duplicate` + `original_sync_status`.
3. Existe `financial_entries.id == aggregate_id` con `created_event_id != event_id` → **conflicto** de identidad: motivo `Identidad de registro financiero ya registrada.`, ref `financial_category`/`category_id` del payload, `defaultWinnerEventId = null` (hechos financieros distintos; no hay ganador), `conflictType 'financial_entry_identity'`. **No** sobrescribir el hecho existente.
4. Dependencia: debe existir `financial_categories.category_id` **y** `events.category_event_id` con `sync_status = 'synced'`, y `category.created_event_id == category_event_id`. Si no → **conflicto** `financial_entry_dependency`, motivo `La categoría del registro no está disponible en el servidor.`. El servidor **no crea** la categoría.
5. Snapshots: si `payload.direction != category.direction` o `payload.nature != category.nature` → **conflicto**, motivo `La clasificación del registro no coincide con la categoría oficial.` (defensa: la categoría es inmutable; una divergencia indica payload corrupto).
6. Si todo válido: guardar evento `SYNCED` + proyección (`amount_minor`, `currency`, `method`, `occurred_at_ms`, snapshots, `created_event_id`, `last_event_id`, `last_server_sequence`) + refs canónicas (`affects` financial_entry, `uses` financial_category). Respuesta `accepted`. No se modifica la categoría (ni su versión).

Carrera 23505 → `conflict` controlado (mismo motivo que 3), nunca 500.

### 6.5 Conservación del dinero

- Un `rejected`/`conflict` de **entrega** no elimina ni revierte un registro que quedó **aplicado localmente**: se separa error de aplicación (rollback del lote) de error de entrega (estado con incidencia).
- `restore` de la revalidación local para registros es **no-op** («Un cobro nunca se deshace...»; mismo patrón que `SalePendingEventValidator.restore`). Nunca se borra una `financial_entry` por un problema de entrega.
- El limpiador de conflictos (`SyncConflictProjectionCleaner`) **no** copia las restauraciones destructivas de catálogo (que borran la proyección creada por el evento conflictivo): no recibe casos destructivos para `financial_*` (ver §7).

### 6.6 Colisión de identidad (pull / convivencia con categoría oficial)

- **Categoría**: si por pull llega un `categoria_financiera_creada` oficial cuyo `aggregate_id` coincide con una fila local de otra creación (la local fue marcada `conflict`), el oficial **reemplaza la proyección** de la categoría (misma identidad; entries conservan FK por `category_id` y sus snapshots). `created_event_id`/`last_event_id` pasan a ser los del oficial. No se borran `financial_entries`. Los eventos quedan: local `conflict` + oficial `delivered` (auditoría intacta).
- **Registro**: por pull llega un `movimiento_financiero_registrado` oficial cuyo `aggregate_id` coincide con una fila local de distinto `created_event_id` (hecho distinto) → el evento entrante se guarda localmente como `conflict` (`Identidad de registro financiero ya registrada.`) **sin reemplazar** la proyección local ni revertir la página. El hecho financiero local se conserva con su incidencia.
- Ninguna de las dos reglas silencia una superposición de hechos financieros distintos.

### 6.7 Limpieza de categoría conflictiva

No hay operación que borre `financial_entries`. La FK `ON DELETE RESTRICT` protege los registros; el flujo de sesión 4 debe probar: categoría local con entradas referenciadas que queda `conflict` → las filas de `financial_entries` permanecen y la UI muestra incidencia vía `delivery_status` de sus eventos. No reutilizar `deleteCreatedByEvent` de catálogo para este agregado.

### 6.8 Inicialización de otro cliente

Verificado: **no existe snapshot/bootstrap de servidor** (`POST /sync/bootstrap` no está implementado; solo pull incremental `since=0`). Un cliente nuevo se inicializa con pull desde 0 (server_sync) o restore de Google Drive (standalone). Este módulo no inventa un bootstrap: solo requiere que los eventos nuevos sean consumibles por el pull existente (sesión 4).

## 7. Comportamiento local (Flutter) por evento

### 7.1 Handlers y proyecciones

- `FinancialCategoryEventHandler` / `FinancialEntryEventHandler` idempotentes por `event_id` (`created_event_id`), registrados en `EventProcessor` (vía `application_dependencies.dart`).
- En `financial_entries`, la proyección usa `occurred_at_ms` y snapshots tal cual el payload. version 1; `acknowledge` solo avanza `last_server_sequence` del registro (por `created_event_id`), nunca reaplica montos ni toca la categoría.
- En `financial_categories`, `acknowledge` avanza `last_server_sequence` de la categoría (por `created_event_id = event_id`).

### 7.2 Revalidación local

Nuevo `FinancialPendingEventValidator` (patrón `PendingEventValidator`):

- Para `movimiento_financiero_registrado`: dependencias = `dependencyEventIds`; si una dependencia no existe localmente, está `conflict`/`rejected`/`not_required`, o está en `conflictedEventIds` → `PendingConflict('Operación registrada: la categoría financiera no se puede sincronizar. Requiere atención.')`. `restore`: no-op.
- Para `categoria_financiera_creada`: si existe proyección con el mismo id y distinto `created_event_id` → `PendingConflict('Ya existe una categoría financiera con este id.')`, `restore`: no-op (no borrar; la categoría recibe el oficial por pull, §6.6).
- Registrar ambos `eventType` en `PendingEventRevalidator._validators`.

### 7.3 Push, preflight, ecos

- `_dependsOnEventIds`: nuevo caso para `movimiento_financiero_registrado` (§3.4).
- Preflight: las refs con `relationship != 'affects'` (`uses` de categoría) ya activan preflight genérico (`_requiresPreflight`, `sync_preflight_service.dart`); sin cambios adicionales.
- `ServerEchoAcknowledger`: nuevos casos para ambos `eventType` (§7.1). El eco no reaplica importes ni cambia identidad/versión de negocio.

## 8. Puertos/repositorios para UI e informe

### 8.1 Dominio Flutter (sin Drift)

Modelos en `lib/domain/finanzas/`:

- `FinancialCategory { id, name, direction, nature }`
- `FinancialEntry { id, categoryId, categoryNameSnapshot, direction, nature, amountMinor (int), currency, method, occurredAtMs, notes?, reference?, deliveryStatus, rejectionReason?, eventId, userId, deviceId }`
- `FinancialReport { entries, incomeMinor, expenseMinor, cashMinor, transferMinor, netMinor (todos BigInt) }`
- Enums de dominio: `FinancialDirection` (`in`/`out`) y `FinancialNature` (5 valores) con `code` y etiqueta; `method` se conserva como string `cash`/`transfer` (convención actual).

Repositorios (interfaces en `lib/domain/repositories/`):

- `FinancialCategoryRepository`:
  - `Stream<List<FinancialCategory>> watchCategories()` — orden `(name, id)`.
- `FinancialEntryRepository`:
  - `Stream<FinancialReport> watchFinancialReport({int fromMs, int toMs, String? method, String? direction, String? categoryId})` — intervalo `[fromMs, toMs)` sobre `occurred_at_ms`; totales con `BigInt`; orden `occurred_at_ms DESC, id`; incluye aplicadas con cualquier `delivery_status` (pendientes/incidencia visibles).
  - Firma del detalle por categoría: misma consulta con `categoryId` (usa `ix_financial_entries_category`).

La UI consume solo estos repositorios; los widgets no tocan Drift.

### 8.2 Informe central

`GET /reports/financial?from_ms=&to_ms=&method=&direction=&category_id=`

- `from_ms`, `to_ms`: obligatorios, enteros seguros, `>= 0`, `to > from`; si no → `400` `Período inválido: usa from_ms y to_ms exclusivos.`
- `method` opcional `cash`/`transfer`; `direction` opcional `in`/`out`; `category_id` opcional UUID v4. Parámetro desconocido/inválido → `400`.
- Fuente: **solo proyecciones oficialmente aceptadas** (`financial_entries` con evento `synced`), unión con `events` para `user_id`/`device_id`/fecha.
- Respuesta (totales como string decimal con `BigInt`):

```json
{
  "from_ms": 1788220800000,
  "to_ms": 1790812800000,
  "currency": "MXN",
  "income_minor": "200000",
  "expense_minor": "200000",
  "cash_minor": "250000",
  "transfer_minor": "150000",
  "net_minor": "0",
  "movements": [
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "event_id": "66666666-6666-4666-8666-666666666666",
      "category_id": "11111111-1111-4111-8111-111111111111",
      "category_name_snapshot": "Renta",
      "direction": "out",
      "nature": "operating",
      "amount_minor": "150000",
      "currency": "MXN",
      "method": "transfer",
      "occurred_at_ms": 1789929000000,
      "notes": "Renta de septiembre",
      "reference": "SPEI-2026-09-20",
      "user_id": "usuario-1",
      "device_id": "dispositivo-1",
      "created_at_server": "2026-09-24T14:38:05.000Z"
    }
  ]
}
```

Los totales del ejemplo corresponden al dataset de `Fixtures/reportes/` (§10): ingreso 200000 (cash), renta cash 50000, renta transfer 150000; neto 0.

- Orden: `occurred_at_ms DESC, id`; `amount_minor` de movimientos como string decimal (serialización bigint del driver, consistente con `collections-report.service.ts`).
- No altera `GET /reports/collections` ni su significado.

### 8.3 Diferencias local/central (documentadas en UI/estado)

| Aspecto | Local (dispositivo) | Central (servidor) |
|---|---|---|
| Población | Proyecciones aplicadas localmente | Proyecciones oficialmente aceptadas |
| Pendientes/incidencia | Visibles (con `delivery_status`/motivo) | No existen (no son oficiales) |
| Cobertura | Dispositivo concreto | Todos los dispositivos sincronizados |
| Intervalo/moneda/orden/sumas | Idénticos a central | Idénticos a local |

Los totales pueden diferir solo por registros locales pendientes/incidentes que aún no son oficiales; no por redondeo.

## 9. Puntos de integración y orden de actualización

### 9.1 Servidor (NestJS) — sesión 2

1. Payloads: `src/sync/payloads/categoria-financiera-creada.payload.ts` y `movimiento-financiero-registrado.payload.ts` (una clase por archivo; constantes y helpers de §5).
2. Entidades: `src/entities/financial-category.entity.ts` y `financial-entry.entity.ts` (extienden `SyncProjectionEntity`; checks e índices de §4); registrar ambas en `TypeOrmModule` de `src/app.module.ts`.
3. Handlers: `src/sync/financial-category-event.handler.ts` y `financial-entry-event.handler.ts` (responsabilidades separadas); providers en `AppModule`; inyección `@Optional()` y despacho en `SyncService.processEvent` (`supports`, transacción, y manejo de colisión 23505 por handler).
4. `validateBaseEvent`: pares `categoria_financiera_creada ↔ financial_category` y `movimiento_financiero_registrado ↔ financial_entry`.
5. Refs: derivadas del payload (§3.3), guardadas con `source='server'`.
6. Informe: `src/reports/financial-report.service.ts` + `financial-report.controller.ts` (§8.2), registrados en `AppModule`.
7. Preflight/pull: sin cambios (genéricos; el ref `uses` ya activa preflight; el pull sirve los nuevos eventos como cualquier otro).

### 9.2 Cliente (Flutter) — sesiones 3 y 4

1. Payloads: `lib/application/sync/payloads/categoria_financiera_creada_payload.dart` y `movimiento_financiero_registrado_payload.dart`.
2. Tablas Drift: `lib/data/local/drift/tables/financial_categories.dart` y `financial_entries.dart` (`CommonFields`, FK restrict, checks, índices) + registro en `AppDatabase`. **No** subir `schemaVersion` ni añadir `onUpgrade`; mantener política `_resetDatabaseOnStartup` de desarrollo (AGENTS.md Flutter).
3. Stores de proyección + handlers (§7.1), registro en `EventProcessor`.
4. Command services: `lib/application/commands/finanzas/` (categoría y registro) con `LocalCommandContext`, normalización, `appendAndApply` con refs; identidad estable por captura.
5. `_dependsOnEventIds` (§3.4), `PendingEventRevalidator` (§7.2), `SyncConflictProjectionCleaner` (solo no-ops para `financial_*`), `ServerEchoAcknowledger` (§7.1).
6. Repositorios de dominio (§8.1) e impl en `data/repositories/` + DI (`data_dependencies.dart`, `application_dependencies.dart`).
7. UI (sesión 5): pantalla «Ingresos y gastos», selector por dirección con «Nueva categoría», formulario, lista/detalle con estado de entrega.

### 9.3 Orden de actualización (para la sesión 6, no desplegar aquí)

1. Esquema y servidor receptores (sesiones 1–2) → 2. actualizar **todos** los clientes receptores (sesiones 3–4) → 3. habilitar captura (sesión 5–6).
- Un cliente anterior al módulo **no** debe recibir `categoria_financiera_creada`/`movimiento_financiero_registrado` por pull antes de actualizarse: `EventProcessor` lanza `UnsupportedError` ante tipos desconocidos y podría detener su pull. La habilitación de captura en cualquier dispositivo depende de que servidor y todos los clientes estén coordinados (ver `Plan de implementacion.md`, «Esquemas y puesta en marcha»).

## 10. Fixtures

Carpeta `Fixtures/` junto a este documento (chunk `08 - Roadmap/Ingresos y gastos por sesiones/Fixtures/`), con `index.md` que declara validez esperada y resultado por archivo. Contiene:

- Sobres push completos válidos de categoría y de registro (cash y transfer).
- Payloads de categoría: gasto operativo, aportación, nombres NFKC/límites, dirección/naturaleza inválidas, dirección-naturaleza incompatible.
- Payloads de registro: notas/referencia null, vacías, espacios, límite 500/501; importes cero, negativos, fraccionarios, superiores al máximo; moneda/método/dirección/naturaleza inválidos; dependencia inexistente.
- Flujo offline: categoría nueva + dos registros dependientes con IDs y `local_sequence` causales coherentes.
- Duplicado (mismo `event_id`) y colisión (mismo `aggregate_id`, distinto `event_id`) con resultado esperado.
- Dataset de registros + períodos `[inicio, fin)` con sumas esperadas (cubre límites de período y desglose por método/dirección).

Todos los archivos JSON son sintácticamente válidos (verificado). Dart y TypeScript deben consumir la misma revisión/checklist de fixtures; si se copian a un repo, documentar origen y verificar igualdad (p. ej. checksum sha256 del archivo).

## 11. Criterios de aceptación verificables

| # | Criterio |
|---|---|
| 1 | Standalone crea categoría y registro sin red: eventos/proyección persistidos, refs validadas en memoria, `event_refs` vacía, `not_required`, sin servicios de red. |
| 2 | Server_sync captura categoría + 2 registros offline: los 3 locales; los registros esperan la entrega de la categoría (`category_event_id`). |
| 3 | Dos registros comparten categoría: ambos aceptados sin conflicto de versión de categoría; la versión de categoría no cambia. |
| 4 | Push con respuesta perdida y reintento: un registro/un importe; `duplicate` respeta `original_sync_status`. |
| 5 | Pull a segundo dispositivo: misma identidad, monto, método, fecha, clasificación, notas, referencia. |
| 6 | Eco al primer dispositivo: solo metadatos/`last_server_sequence`; no importe/identidad/versión. |
| 7 | Dependencia rechazada/conflictiva: registro local visible con incidencia; no se aplica oficialmente en servidor; no se borran entries. |
| 8 | Página pull falla a mitad: rollback de página y checkpoint; reintento coherente. |
| 9 | Fallo de escritura en captura: sin evento/proyección parciales; el formulario reintenta la misma intención. |
| 10 | Doble toque/reintento del mismo envío: una sola operación; otra intención usa nueva identidad. |
| 11 | Montos/método/dirección/naturaleza inválidos: rechazo coherente en payloads, comandos y servidor (fixtures). |
| 12 | Registros en límite de período o fecha anterior: `[from, to)` con zona horaria explícita y `occurred_at_ms`; fechas futuras rechazadas en command (> +5 min). |
| 13 | Reporte mezcla métodos/direcciones: desglose correcto; `transfer` no implica saldo de cajón; `net_minor` etiquetado «Neto de registros adicionales». |
| 14 | `sale_payments`/`customer_payments`: no cambian ni se duplican en `financial_entries`. |
| 15 | App nueva/base vacía: recibe los agregados por pull `since=0` (mecanismo existente), sin bootstrap inventado. |
| 16 | Clientes anteriores al módulo: no reciben tipos desconocidos antes de actualizarse/habilitarse coordinadamente (§9.3). |

## 12. Historial de cambios

### Revisión 0 → 1 (sesión 0, 2026-09-24)

**Decisiones de producto (derivadas del plan/draft, sin consulta bloqueante):**

- Naturaleza con 5 valores y compatibilidad de dirección (§2.1); predeterminado `operating`.
- Sin unicidad por nombre; orden `(name, id)`.
- Fechas: captura local «ahora», pasadas permitidas, futuro rechazado en command (> +5 min), períodos `[from, to)` UTC ms.
- `net_minor` permitido solo como «Neto de registros adicionales» (no utilidad/saldo).
- Reportes del informe adicional exclusivo de `financial_entries`; no altera cobros.

**Decisiones técnicas (revalidadas contra código):**

- Sobres: `base_version=1`, `base_server_sequence=null`; dependencia por `category_event_id` en payload + ref `uses`; si `EventProcessor`/`validateBaseEvent`/`_dependsOnEventIds` requieren integración explícita (§9).
- Refs canónicas reconstruidas por el servidor (patrón existente de abono/venta).
- El limpiador de conflictos NO borra dinero; la categoría se reemplaza por el oficial vía pull (convivencia §6.6); el registro entrante en colisión se marca `conflict` local sin reemplazar.
- Auditoría: retención de events sin purga (verificado); el reporte une con `events` para estado/usuario/dispositivo; backup/restore SQLite y cliente nuevo por pull `since=0` (mecanismo real, no bootstrap).
- Índices justificados por `[from,to)` y detalle por categoría (§4.2).
- Montos/totales con `BigInt` y strings decimales en API (patrón `collections-report.service.ts`).

**Verificaciones de la sesión 0:** ramas/HEAD verificados (Análisis `main` `424c8bb…`, Flutter `main` `0b3c523…`, NestJS `main` `91c5ab1…`), código referencia inspeccionado (lista completa en `Estado y continuidad.md`); video del usuario consultado a través de la transcripción de fotogramas del plan (no se procesó el archivo de video en esta sesión). Fixtures JSON validados sintácticamente. No se ejecutó código de aplicación ni se modificó esquema.