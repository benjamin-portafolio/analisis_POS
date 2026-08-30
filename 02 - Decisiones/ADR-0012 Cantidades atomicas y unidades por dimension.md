---
tipo: ADR
id: ADR-0012
estado: decidido
fecha: 2026-08-19
actualizado: 2026-08-19
---

# ADR-0012 Cantidades atomicas y unidades por dimension

## Contexto

El POS debe capturar cantidades para existencias, entradas, ajustes y ventas a
granel. La interfaz necesita admitir valores como `0.25 kg`, pero SQLite,
PostgreSQL, Dart y TypeScript no deben depender de
`double`, `REAL` ni numeros JSON fraccionarios para la cantidad canonica.

La analogia con moneda es util porque ambas magnitudes se persisten como
enteros, pero una moneda tiene una escala propia y las cantidades fisicas
necesitan una escala distinta por dimension. Un factor global de mil no sirve
simultaneamente para masa, volumen, conteo ni precisiones futuras.

## Decision

- Toda cantidad canonica de inventario y venta medida se persiste como
  entero atomico de 64 bits.
- Cada dimension define un atomo operativo. El catalogo inicial usa:
  - masa: gramo (`g`);
  - volumen: mililitro (`ml`);
  - conteo: pieza.
- Cada unidad registrada declara `dimension`, `atomic_factor` entero positivo
  y `max_fraction_digits`. `atomic_factor` indica cuantos atomos representa una
  unidad completa.
- El catalogo inicial solo admite factores que sean potencias de diez y
  conversiones exactas: `kg = 1000 g`, `g = 1 g`, `L = 1000 ml`, `ml = 1 ml`
  y `pieza = 1 pieza`.
- La UI captura una cadena decimal en la unidad seleccionada. El command
  service la convierte exactamente a entero antes de crear el evento. Los
  payloads transportan el entero atomico; nunca transportan la fraccion como
  `double`.
- Una conversion se rechaza si usa mas decimales de los permitidos, no produce
  un numero entero de atomos, es cero/negativa cuando se requiere una salida
  positiva o excede el rango seguro compartido.
- `sale_mode = unit` conserva conteos enteros y no usa una unidad de venta.
  `sale_mode = measured` exige una unidad registrada activa para captura y una
  cantidad de referencia atomica positiva para el precio.
- Un `inventory_item` elige una unidad predeterminada de captura/presentacion;
  su saldo y todos sus movimientos se persisten en los atomos de la dimension.
- Una venta medida aplica proporcionalmente el precio con aritmetica entera.
  Los calculos intermedios usan precision ampliada y el resultado se redondea
  una sola vez con `half-up` a unidad monetaria menor para el total.
- Codigo, dimension, factor y precision de una unidad son inmutables desde que
  la unidad ha sido referenciada. Desactivarla impide nuevas configuraciones, pero no
  invalida productos, recursos, eventos o ventas historicas.
- Los empaques contextuales como caja, costal o paquete no son unidades
  fisicas globales. Una conversion como "caja de 24 piezas" pertenece al
  articulo de inventario o a una presentacion futura, no al catalogo universal
  de unidades.

## Ejemplo

Con `kg.atomic_factor = 1000` y atomo de masa igual a un gramo:

```text
captura                  0.25 kg
cantidad atomica         250 g
precio                   20000 centavos por 1000 g
total                    round_half_up(20000 * 250 / 1000)
total persistido         5000 centavos
```

Si una necesidad futura exige fracciones menores a un gramo o mililitro, debe
aprobarse y migrarse una escala mas fina antes de registrar datos con ella. No
se reinterpreta silenciosamente un entero historico.

## Consecuencias

- `units.conversion_to_base` decimal se reemplaza por `atomic_factor` entero.
- La unidad seleccionada es de captura/presentacion; el entero almacenado se
  interpreta mediante su dimension y factor, no por su apariencia en la base.
- Entradas y ajustes pueden mostrar decimales sin persistir
  fracciones binarias.
- Solo se ofrecen conversiones entre unidades de la misma dimension. Masa y
  volumen no se convierten sin una regla de densidad explicita, fuera del
  alcance inicial.
- Las lineas de venta deben capturar snapshots suficientes de unidad, factor y
  referencia para reproducir sus calculos historicos.
- El catalogo de unidades y sus proyecciones locales son dependencias previas
  para habilitar venta medida o captura de inventario.

## Enlaces

- [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]]
- [[03 - Dominio/Modulos/Articulos|Modulo Articulos]]
- [[05 - Datos/Catalogo e inventario|Catalogo e inventario]]
- [[02 - Decisiones/ADR-0004 Inventario por movimientos|Inventario por movimientos]]
