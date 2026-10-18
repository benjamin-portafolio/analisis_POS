---
tipo: especificacion_modulo
modulo: unidades_y_cantidades
estado: contrato_confirmado_pendiente_implementacion
actualizado: 2026-08-29
---

# Unidades y cantidades

Esta nota define el contrato transversal usado por Inventario, Articulos y
Ventas. La decision arquitectonica vive en
[[02 - Decisiones/ADR-0012 Cantidades atomicas y unidades por dimension|ADR-0012]].

## Separacion de conceptos

| Concepto | Responsabilidad |
|---|---|
| Dimension | Determina que cantidades son compatibles: masa, volumen o conteo |
| Atomo | Menor incremento persistible de una dimension |
| Unidad registrada | Forma permitida de capturar y mostrar una cantidad |
| Factor atomico | Numero entero de atomos contenidos en una unidad completa |
| Cantidad decimal de UI | Texto temporal escrito por el usuario; no se persiste ni sincroniza |
| Cantidad atomica | Entero canonico usado en eventos, proyecciones, saldos y movimientos |
| Cantidad de referencia | Cantidad atomica a la que corresponden el precio de venta y el costo estandar medidos |

No existe una escala global de cantidades. La escala pertenece a la dimension
y cada unidad expresa su relacion exacta con el atomo de esa dimension.

## Catalogo inicial

| Codigo | Nombre | Simbolo | Dimension | `atomic_factor` | `max_fraction_digits` |
|---|---|---|---|---:|---:|
| `piece` | Pieza | pza | `count` | 1 | 0 |
| `g` | Gramo | g | `mass` | 1 | 0 |
| `kg` | Kilogramo | kg | `mass` | 1000 | 3 |
| `ml` | Mililitro | ml | `volume` | 1 | 0 |
| `l` | Litro | L | `volume` | 1000 | 3 |

Los codigos son estables y unicos. El primer alcance no incluye libras,
onzas, galones, densidades ni unidades contextuales como caja, paquete o
costal. Incorporarlas exige una decision de precision y conversion propia.

Las cinco filas iniciales son datos de referencia del sistema con IDs estables
compartidos por SQLite y PostgreSQL; inician activas y no tienen CRUD de
usuario en el MVP. Por ello `units` no hereda inicialmente los campos de una
proyeccion mutable. Una futura administracion o personalizacion de unidades
debera definir comandos, eventos, versiones y conflictos antes de habilitarse;
no autoriza escrituras directas a la tabla.

## Tabla `units`

| Columna | SQLite/Drift | PostgreSQL/TypeORM | Regla |
|---|---|---|---|
| `unit_id` | `TEXT` | `uuid` | PK estable |
| `code` | `TEXT` | `varchar(32)` | Unico, canonico e inmutable al ser referenciado |
| `name` | `TEXT` | `varchar(80)` | Nombre visible |
| `symbol` | `TEXT` | `varchar(16)` | Simbolo visible |
| `dimension` | `TEXT` | `varchar(16)` | `count`, `mass` o `volume`; inmutable al ser referenciada |
| `atomic_factor` | `INTEGER` | `bigint` | Entero positivo, potencia de diez en el alcance inicial |
| `max_fraction_digits` | `INTEGER` | `integer` | `0..6`; no puede producir fracciones de atomo |
| `active` | entero booleano | `boolean` | Solo las activas se ofrecen en configuraciones nuevas |

Restricciones iniciales:

```text
UNIQUE units(code)
CHECK dimension IN ('count', 'mass', 'volume')
CHECK atomic_factor > 0
CHECK max_fraction_digits BETWEEN 0 AND 6
CHECK atomic_factor IN (1, 10, 100, 1000, 10000, 100000, 1000000)
DOMAIN RULE max_fraction_digits <= decimal_exponent(atomic_factor)
```

La ultima linea es una regla de dominio, no SQL portable. Se valida en command
service y servidor. El catalogo inicial fija el maximo exactamente a la
precision util de cada unidad.

Una unidad inactiva sigue disponible para leer y formatear datos historicos.
No puede elegirse al crear un producto medido, un articulo de inventario o una
nueva captura. Codigo, dimension, factor y precision no se editan cuando la
unidad ya fue usada; se crea otra unidad o una migracion explicita.

## Articulos de inventario

`inventory_items.default_unit_id` referencia la unidad usada por defecto en
entradas y ajustes. La dimension de esa unidad determina el atomo del recurso.
`inventory_balances` e `inventory_movements` solo guardan enteros atomicos.

El usuario puede cambiar temporalmente la unidad de captura solamente por otra
unidad activa de la misma dimension. Esa preferencia de pantalla no cambia el
entero canonico ni se necesita en el movimiento una vez convertido. No se
convierte masa a volumen ni conteo a masa.

La unidad predeterminada de un recurso es inmutable durante la edición porque
su historial ya utiliza esa referencia. Una unidad distinta puede servir solo
como unidad temporal de captura dentro de la misma dimensión y debe convertirse
al átomo canónico sin modificar `default_unit_id`. Para cambiar la referencia
predeterminada se crea otro recurso o se ejecuta una migración explícita.

## Conversion exacta desde la UI

La UI conserva la entrada como texto y respeta el separador decimal de la
configuracion regional. Antes de crear un comando se normaliza a un decimal
canonico sin separadores de millares.

```text
atomic = parse_decimal_exact(input_text) * unit.atomic_factor
```

La operacion es valida solo si el resultado es entero. Para `kg`:

```text
"2"     -> 2000
"0.25"  -> 250
"0.001" -> 1
"0.0005" -> error: precision no representable con atomo gramo
```

La implementacion no convierte primero a `double`. Puede separar parte entera
y fraccionaria o usar un decimal exacto, y debe comprobar el limite de entero
seguro antes de serializar el payload.

## Venta por unidad y venta medida

| Modo | Captura | Persistencia |
|---|---|---|
| `unit` | Conteo entero positivo | `sale_items.quantity` |
| `measured` | Decimal en `sale_unit_id` activa | `sale_items.measured_quantity_atomic` |

En `measured`, el precio de venta y el costo estandar opcional corresponden a
`price_reference_quantity_atomic`. La unidad elegida controla captura y
presentacion, mientras la referencia y la cantidad vendida usan atomos de la
misma dimension.

Formula del total de linea:

```text
unit:
  total_minor = unit_price_minor * quantity

measured:
  total_minor = round_half_up(
    unit_price_minor * measured_quantity_atomic
    / price_reference_quantity_atomic
  )
```

Los productos medidos no usan `quantity`. Todos los operandos son enteros y la
multiplicacion intermedia usa `BigInt` o equivalente para detectar overflow.
El redondeo monetario ocurre una vez sobre el total actual de la linea, no por
cada incremento de la interfaz.

Cuando `standard_cost_minor_snapshot` existe, el costo estandar de la linea se
calcula sustituyendo `unit_price_minor` por ese snapshot en la misma formula.
El resultado sirve para margen de referencia y nunca cambia el total cobrado.

Ejemplo:

```text
unidad de captura       kg
factor                   1000 g/kg
precio                   20000 centavos
referencia               1000 g
captura                   0.25 kg
venta atomica             250 g
total                    5000 centavos
```

## Snapshots historicos

Una linea medida debe conservar al menos:

- `sale_mode_snapshot`;
- `measured_quantity_atomic`;
- `unit_price_minor`;
- `standard_cost_minor_snapshot`, nulable;
- `price_reference_quantity_atomic_snapshot`;
- `sale_unit_code_snapshot`;
- `sale_unit_symbol_snapshot`;
- `sale_unit_atomic_factor_snapshot`.

El snapshot permite imprimir `0.25 kg` y reproducir el total aunque la unidad
se desactive.

Todas las lineas, incluidas las `unit`, guardan
`standard_cost_minor_snapshot` con el valor conocido al agregarlas. En una
linea medida, ese valor usa la cantidad de referencia incluida en la lista
anterior.

## Sincronizacion y modos

- Los comandos declaran y validan `LocalEventRef` para cada unidad e
  `inventory_item` utilizado en `standalone` y `server_sync`.
- La app solo persiste esas referencias en `event_refs` bajo `server_sync`.
- En `standalone`, el evento usa `delivery_status = not_required`, se aplica a
  la proyeccion local y no genera filas en `event_refs`.
- Push, pull, preflight, health checks y WebSocket no se ejecutan en
  `standalone`.
- Una importacion futura de historial reconstruye referencias explicitamente;
  no convierte silenciosamente eventos locales en pendientes.

## Criterios de aceptacion

- `0.25 kg` se convierte exactamente en `250` atomos de masa con la escala
  inicial.
- `0.001 kg` es valido y `0.0005 kg` se rechaza antes de crear un evento.
- `250 g`, `0.25 kg`, `250 ml` y `0.25 L` no usan `double` en dominio ni en
  payloads.
- Una unidad desactivada no aparece en altas nuevas y sigue renderizando
  historicos.
- Cambiar nombre o simbolo no modifica cantidades; cambiar dimension, factor o
  precision usados exige migracion explicita.
- El precio medido usa la cantidad de referencia y una regla de redondeo
  determinista.
- El costo estandar medido usa la misma referencia y regla; su ausencia no
  impide la venta y permanece representada como `null`.

## Enlaces

- [[02 - Decisiones/ADR-0012 Cantidades atomicas y unidades por dimension|ADR-0012]]
- [[02 - Decisiones/ADR-0013 Costo estandar opcional por variante|ADR-0013]]
- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[05 - Datos/Catalogo e inventario|Catalogo e inventario]]
- [[06 - API/Validaciones servidor|Validaciones servidor]]
