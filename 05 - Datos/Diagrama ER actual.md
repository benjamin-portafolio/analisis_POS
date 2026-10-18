---
tipo: datos
estado: alineado_con_codigo
actualizado: 2026-10-01
---

# Diagrama ER actual

Este diagrama describe el esquema que existe hoy en el codigo, no el modelo
propuesto. Se reconstruyo leyendo las definiciones reales:

```text
SQLite local:
  pos_flutter/lib/data/local/drift/tables/*.dart
  pos_flutter/lib/data/local/drift/app_database.dart   (schemaVersion = 8)

PostgreSQL central:
  pos-nest/src/entities/*.ts
  pos-nest/src/migrations/*.ts
```

Si este diagrama contradice a [[05 - Datos/Modelo de tablas|Modelo de tablas]] o a
[[05 - Datos/Catalogo e inventario|Catalogo e inventario]], prevalece este
documento y hay que actualizar aquellos.

## Inventario de tablas

| Ambito | Tablas | Cantidad |
|---|---|---:|
| Nucleo compartido | clientes, categories, products, product_variants, recipe_components, espacios, events, event_refs, units, inventory_items, inventory_balances, inventory_movements, sales, sale_items, sale_payments, credit_sales, customer_payments, credit_allocations, financial_categories, financial_entries, cash_sessions, cash_movements, account_balance_baselines | 23 |
| Solo SQLite local | sync_checkpoints, product_update_undo | 2 |
| Solo PostgreSQL | sync_conflicts, sync_conflict_participants | 2 |
| Total | | 27 |

## Diagrama general

Relaciones derivadas de las llaves foraneas reales. Las lineas marcadas como
logica no tienen FK en la base.

```mermaid
erDiagram
    CATEGORIES o|--o{ PRODUCTS : "opcional, RESTRICT"
    UNITS o|--o{ PRODUCTS : "opcional, RESTRICT"
    PRODUCTS ||--|{ PRODUCT_VARIANTS : "CASCADE"
    PRODUCT_VARIANTS o|--o| INVENTORY_ITEMS : "seguimiento directo, UNIQUE"
    PRODUCT_VARIANTS ||--o{ RECIPE_COMPONENTS : "CASCADE"
    INVENTORY_ITEMS ||--o{ RECIPE_COMPONENTS : "RESTRICT"
    UNITS ||--o{ INVENTORY_ITEMS : "RESTRICT"
    INVENTORY_ITEMS ||--o| INVENTORY_BALANCES : "CASCADE"
    INVENTORY_ITEMS ||--o{ INVENTORY_MOVEMENTS : "RESTRICT"
    INVENTORY_MOVEMENTS o|--o{ INVENTORY_MOVEMENTS : "reversal_of, RESTRICT"

    CLIENTES o|--o{ SALES : "opcional, RESTRICT"
    SALES ||--|{ SALE_ITEMS : "RESTRICT"
    PRODUCT_VARIANTS ||--o{ SALE_ITEMS : "RESTRICT"
    SALES ||--o| SALE_PAYMENTS : "UNIQUE, RESTRICT"
    SALE_ITEMS o|--o{ INVENTORY_MOVEMENTS : "RESTRICT"
    SALES ||--o| CREDIT_SALES : "UNIQUE, RESTRICT"
    CLIENTES ||--o{ CREDIT_SALES : "RESTRICT"
    CLIENTES ||--o{ CUSTOMER_PAYMENTS : "RESTRICT"
    CUSTOMER_PAYMENTS ||--o{ CREDIT_ALLOCATIONS : "RESTRICT"
    CREDIT_SALES ||--o{ CREDIT_ALLOCATIONS : "RESTRICT"

    FINANCIAL_CATEGORIES ||--o{ FINANCIAL_ENTRIES : "RESTRICT"
    CASH_SESSIONS ||--o{ CASH_MOVEMENTS : "RESTRICT"
    SALE_PAYMENTS o|--o| CASH_MOVEMENTS : "excluyente, UNIQUE"
    CUSTOMER_PAYMENTS o|--o| CASH_MOVEMENTS : "excluyente, UNIQUE"
    FINANCIAL_ENTRIES o|--o| CASH_MOVEMENTS : "excluyente, UNIQUE"

    EVENTS o|--o{ EVENT_REFS : "logica, sin FK"
    EVENTS o|--o{ INVENTORY_MOVEMENTS : "event_id, sin FK"
    EVENTS o|--o{ SYNC_CONFLICT_PARTICIPANTS : "logica, sin FK"
    SYNC_CONFLICTS ||--o{ SYNC_CONFLICT_PARTICIPANTS : "logica, sin FK"
```

`ESPACIOS`, `UNITS`, `ACCOUNT_BALANCE_BASELINES`, `SYNC_CHECKPOINTS` y
`PRODUCT_UPDATE_UNDO` son agregados independientes: no tienen FK de salida hacia
otra tabla de negocio. Los identificadores de usuario, dispositivo y rol viajan
como texto dentro de `events`, `sales` y `cash_sessions`; no existen tablas
`users`, `roles` ni `devices`.

`events.aggregate_id` es una referencia polimorfica y por eso no se dibuja como
relacion: apunta al agregado afectado segun `aggregate_type`, y ninguna FK puede
expresarlo. Lo mismo aplica a `event_refs.ref_id`, `sync_conflicts.ref_id` y
`cash_sessions.device_id`.

## Nucleo de eventos

```mermaid
erDiagram
    EVENTS {
        uuid event_id PK
        text aggregate_type
        uuid aggregate_id
        text event_type
        text device_id
        text user_id
        int local_sequence "autoincremento en SQLite"
        bigint server_sequence "unico y generado en PG"
        bigint base_server_sequence "nullable"
        int base_version "nullable"
        ts created_at_local
        ts created_at_server "nullable en SQLite"
        json payload
        text application_status "solo SQLite"
        text delivery_status "solo SQLite"
        text sync_status "solo PostgreSQL"
        text rejection_reason "nullable"
        ts updated_at_server "solo PostgreSQL"
    }

    EVENT_REFS {
        uuid event_ref_id PK
        uuid event_id
        text ref_type
        text ref_id
        text relationship
        bigint server_sequence "nullable"
        text source
    }

    SYNC_CHECKPOINTS {
        text checkpoint_id PK
        int last_full_pull_server_sequence
        int last_preflight_server_sequence
        ts last_full_pull_at "nullable"
        ts last_preflight_at "nullable"
    }

    PRODUCT_UPDATE_UNDO {
        text event_id PK
        text product_id
        text snapshot_json
    }

    SYNC_CONFLICTS {
        uuid conflict_id PK
        text conflict_type
        text ref_type
        text ref_id
        text status "enum"
        uuid default_winner_event_id "nullable"
        uuid resolution_event_id "nullable"
        text reason "nullable"
        ts created_at_server
        ts updated_at_server
    }

    SYNC_CONFLICT_PARTICIPANTS {
        uuid participant_id PK
        uuid conflict_id
        uuid event_id
        text participant_role "enum"
        text aggregate_type
        uuid aggregate_id
        text event_type
        text sync_status
        bigint server_sequence "nullable"
        text reason "nullable"
        ts created_at_server
    }
```

`EVENT_REFS`, `PRODUCT_UPDATE_UNDO` y `SYNC_CONFLICT_PARTICIPANTS` no declaran FK
hacia `events`: son referencias de auditoria y preflight, no integridad.

## Catalogo

```mermaid
erDiagram
    CATEGORIES {
        uuid category_id PK
        varchar name "160"
        varchar color_key "default neutral"
        int sort_order
        bool active "heredado, sin uso funcional"
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    PRODUCTS {
        uuid product_id PK
        varchar name "160"
        uuid category_id FK "nullable"
        varchar sale_mode "unit, measured"
        uuid sale_unit_id FK "nullable"
        bigint price_reference_quantity_atomic "nullable"
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    PRODUCT_VARIANTS {
        uuid variant_id PK
        uuid product_id FK
        varchar name "160, nullable"
        varchar name_key "320, nullable"
        varchar barcode "32 digitos, nullable"
        bigint sale_price_minor "mayor que cero"
        bigint standard_cost_minor "nullable"
        uuid inventory_item_id FK "UNIQUE, nullable"
        int sort_order
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    UNITS {
        uuid unit_id PK
        varchar code UK "24"
        varchar name "80"
        varchar symbol "16"
        varchar dimension "count, mass, volume"
        bigint atomic_factor "mayor que cero"
        int max_fraction_digits
        bool active
    }

    ESPACIOS {
        uuid espacio_id PK
        varchar nombre "160"
        varchar identificacion "160, nullable, UNIQUE"
        int visibilidad
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }
```

`UNITS` es dato de referencia compartido, no proyeccion de evento: por eso no
hereda `active`, `version` ni trazabilidad. No existe columna `sku`; el
identificador de negocio de la variante es `barcode`.

## Inventario

```mermaid
erDiagram
    INVENTORY_ITEMS {
        uuid inventory_item_id PK
        uuid default_unit_id FK
        varchar name "160"
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    INVENTORY_BALANCES {
        uuid inventory_item_id PK
        bigint quantity_on_hand_atomic
        bigint quantity_available_atomic
        int version
        uuid last_event_id
        bigint last_server_sequence "nullable"
    }

    INVENTORY_MOVEMENTS {
        uuid movement_id PK
        uuid inventory_item_id FK
        uuid sale_item_id FK "nullable"
        uuid event_id "sin FK"
        uuid reversal_of_movement_id FK "nullable, autorreferencia"
        varchar movement_type "40"
        bigint quantity_delta_atomic "nunca cero"
        bigint total_cost_minor "nullable, siempre null hoy"
        varchar reason "500, nullable"
        ts created_at_local
        bigint server_sequence "nullable"
    }

    RECIPE_COMPONENTS {
        uuid variant_id PK
        uuid inventory_item_id PK
        bigint quantity_atomic "mayor que cero"
    }
```

`INVENTORY_BALANCES`, `INVENTORY_MOVEMENTS` y `RECIPE_COMPONENTS` no heredan los
campos comunes: el saldo usa la PK del recurso, y el movimiento y la receta son
hijos sin ciclo de vida propio.

Tipos de movimiento reales:

```text
initial_balance     delta positivo
stock_receipt       delta positivo
manual_adjustment   delta con signo, exige reason
reversal            exige reversal_of_movement_id
sale_consumption    delta negativo, exige sale_item_id
```

## Ventas

```mermaid
erDiagram
    SALES {
        uuid sale_id PK
        uuid cliente_id FK "nullable"
        text user_id
        text device_id
        text status "borrador, descartada, confirmada"
        bigint total_minor
        varchar currency "solo PostgreSQL"
        ts created_at_local "solo SQLite"
        ts updated_at_local "solo SQLite"
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    SALE_ITEMS {
        uuid sale_item_id PK
        uuid sale_id FK
        uuid variant_id FK
        text consumption_configuration_key "nullable, solo SQLite"
        text product_name_snapshot
        text variant_name_snapshot "nullable"
        text sale_mode_snapshot "unit, measured"
        int quantity "nullable en measured"
        int measured_quantity_atomic "nullable en unit"
        int unit_price_minor
        int standard_cost_minor_snapshot "nullable"
        int price_reference_quantity_atomic_snapshot "nullable en unit"
        text sale_unit_code_snapshot "nullable en unit"
        text sale_unit_symbol_snapshot "nullable en unit"
        int sale_unit_atomic_factor_snapshot "nullable en unit"
        int total_minor
        int sort_order
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    SALE_PAYMENTS {
        uuid payment_id PK
        uuid sale_id FK "UNIQUE"
        bigint amount_minor
        varchar method "cash, transfer"
        varchar reference "500, nullable"
        bigint received_minor
        bigint change_minor
        varchar currency "MXN"
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }
```

En PostgreSQL, `sale_items` no repite las once columnas de snapshot: las
contiene en una sola columna `snapshot jsonb`, cuyo tipo es la linea de venta
confirmada (`ConfirmedSaleLine`). SQLite si las materializa para consultarlas
sin parsear JSON.

## Credito de clientes

```mermaid
erDiagram
    CLIENTES {
        uuid cliente_id PK
        text nombre
        text telefono "nullable"
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    CREDIT_SALES {
        uuid id PK
        uuid sale_id FK "UNIQUE, mismo id que la venta"
        uuid cliente_id FK
        bigint amount_minor "deuda original, inmutable"
        bigint occurred_at_ms
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    CUSTOMER_PAYMENTS {
        uuid id PK
        uuid cliente_id FK
        bigint amount_minor
        text method "cash, transfer"
        text reference "nullable"
        bigint occurred_at_ms
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    CREDIT_ALLOCATIONS {
        uuid payment_id PK
        uuid credit_id PK
        bigint amount_minor "distribucion FIFO"
    }

    CLIENTES ||--o{ CREDIT_SALES : "RESTRICT"
    CLIENTES ||--o{ CUSTOMER_PAYMENTS : "RESTRICT"
    SALES ||--o| CREDIT_SALES : "UNIQUE, RESTRICT"
    CUSTOMER_PAYMENTS ||--o{ CREDIT_ALLOCATIONS : "RESTRICT"
    CREDIT_SALES ||--o{ CREDIT_ALLOCATIONS : "RESTRICT"
```

`CREDIT_ALLOCATIONS` es una proyeccion reconstruible: no tiene `active`, `version`
ni trazabilidad, y su identidad es el par abono, credito.

## Caja y finanzas

```mermaid
erDiagram
    CASH_SESSIONS {
        uuid id PK
        text device_id "UNIQUE mientras status open"
        text opened_by_user_id
        text closed_by_user_id "nullable"
        text status "open, closed"
        bigint opened_at_ms
        bigint closed_at_ms "nullable"
        bigint opening_minor "sin negativos"
        bigint counted_minor "nullable"
        numeric income_minor "nullable, decimal"
        numeric expense_minor "nullable, decimal"
        numeric expected_minor "nullable, decimal"
        numeric difference_minor "nullable, decimal"
        jsonb close_snapshot "nullable"
        uuid previous_close_event_id "nullable"
        text notes "500, nullable"
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    CASH_MOVEMENTS {
        uuid id PK
        uuid session_id FK
        text direction "in, out"
        bigint amount_minor "mayor que cero"
        uuid sale_payment_id FK "UNIQUE, nullable"
        uuid customer_payment_id FK "UNIQUE, nullable"
        uuid financial_entry_id FK "UNIQUE, nullable"
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    FINANCIAL_CATEGORIES {
        uuid id PK
        varchar name "100"
        text direction "in, out"
        text nature "operating, capital, asset_purchase, inventory_purchase, financing"
        bool active "no funcional"
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    FINANCIAL_ENTRIES {
        uuid id PK
        uuid category_id FK
        varchar category_name_snapshot "100"
        text direction "in, out"
        text nature "mismos cinco valores"
        bigint amount_minor "mayor que cero"
        varchar currency "MXN"
        text method "cash, transfer"
        bigint occurred_at_ms
        text notes "500, nullable"
        text reference "500, nullable"
        bool active
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    ACCOUNT_BALANCE_BASELINES {
        uuid id PK
        text device_id
        text declared_by_user_id
        bigint amount_minor "admite negativo"
        bigint as_of_ms
        bool active "indice unico parcial"
        int version
        uuid created_event_id "nullable"
        uuid last_event_id "nullable"
        bigint last_server_sequence "nullable"
    }

    CASH_SESSIONS ||--o{ CASH_MOVEMENTS : "RESTRICT"
    FINANCIAL_CATEGORIES ||--o{ FINANCIAL_ENTRIES : "RESTRICT"
    SALE_PAYMENTS o|--o| CASH_MOVEMENTS : "UNIQUE, RESTRICT"
    CUSTOMER_PAYMENTS o|--o| CASH_MOVEMENTS : "UNIQUE, RESTRICT"
    FINANCIAL_ENTRIES o|--o| CASH_MOVEMENTS : "UNIQUE, RESTRICT"
```

`CASH_MOVEMENTS` exige exactamente un origen: la restriccion cuenta los tres
origenes no nulos y exige el resultado `= 1`. Los totales de sesion
(`income_minor`, `expense_minor`, `expected_minor`, `difference_minor`) son
`numeric` y no `bigint` para evitar overflow acumulado.

`ACCOUNT_BALANCE_BASELINES` es el unico agregado que admite `amount_minor`
negativo: una cuenta puede estar sobregirada y recortarla a cero corromperia el
estimado en silencio.

## Diferencias entre SQLite local y PostgreSQL central

| Tabla | SQLite local | PostgreSQL central |
|---|---|---|
| `events` | `application_status`, `delivery_status`, `local_sequence` autoincremental, `server_sequence` nullable | `sync_status` enum, `updated_at_server`, `server_sequence` unico generado |
| `events.event_refs` | se persiste solo en `server_sync` | siempre se persiste |
| `sync_checkpoints` | existe | no existe |
| `product_update_undo` | existe | no existe |
| `sync_conflicts` | no existe | existe |
| `sync_conflict_participants` | no existe | existe |
| `sale_items` | once columnas de snapshot | una columna `snapshot jsonb` |
| `sale_items` | `consumption_configuration_key` | no existe |
| `sales` | `created_at_local`, `updated_at_local` | `currency` |
| `sales.status` default | `borrador` | `confirmada` |
| `inventory_movements.event_id` | `text` | `uuid` |
| Proyecciones | sin `created_at_server` ni `updated_at_server` | ambas presentes |
| Tipos de fecha | `datetime` | `timestamptz(3)` |
| Cantidades | `integer` | `bigint` como texto |

Las diferencias son intencionales: SQLite optimiza lecturas rapidas y permite
purgar eventos sin romper las proyecciones, PostgreSQL conserva la integridad
y el historial.

## Divergencias contra el documento Modelo de tablas

Estas diferencias ya existen en el codigo y deben corregirse en el documento
conceptual o explicarse como decision.

| Documento dice | El codigo tiene |
|---|---|
| Tabla `payments` | `sale_payments`, con una unica fila por venta |
| `sale_payments.amount` decimal | `amount_minor` entero, mas `received_minor` y `change_minor` |
| `sales.subtotal_minor`, `discount_total_minor`, `tax_total_minor`, `table_name`, `opened_at`, `closed_at`, `canceled_at` | no existen; solo `total_minor` y fechas locales |
| `sale_items.status`, `notes`, `canceled_event_id` | no existen; la baja logica es `active` |
| `product_variants.sku` | no existe; el identificador es `barcode` |
| `product_variants.is_default` | eliminado por migracion |
| Tablas `kitchen_tickets` y `kitchen_ticket_items` | no existen en ningun motor |
| Tablas `users`, `roles`, `devices`, `settings` | no existen |
| `ESPACIOS` hospeda ventas | no hay columna `espacio_id` en `sales`; el vinculo es logico |
| `sync_checkpoints.device_id`, `last_pushed_local_sequence`, `last_push_at`, `updated_at` | no existen; solo los dos cursores de pull y preflight |
| `SYNC_CONFLICTS` con `aggregate_type`, `aggregate_id`, `field_name`, `resolved_at` | solo `conflict_type`, `ref_type`, `ref_id`, `status` y los dos eventos |
| `SYNC_CONFLICT_PARTICIPANTS` con `device_id`, `user_id`, `payload_snapshot`, `joined_at` | solo rol, agregado, tipo, `sync_status`, `server_sequence` y `reason` |
| `SYNC_CONFLICTS` y participantes con FK hacia `events` | son `uuid` sin FK |
| Recetas y credito de clientes | no figuraban; ya estan implementados |
| `inventory_movements` sin `sale_consumption` | el tipo `sale_consumption` existe y tiene indice unico |

## Enlaces

- [[05 - Datos/Modelo de tablas|Modelo de tablas]]
- [[05 - Datos/Catalogo e inventario|Catalogo e inventario]]
- [[05 - Datos/Tablas de lectura|Tablas de lectura]]
- [[05 - Datos/Eventos|Eventos]]
- [[05 - Datos/Trazabilidad entre proyecciones y eventos|Trazabilidad entre proyecciones y eventos]]
