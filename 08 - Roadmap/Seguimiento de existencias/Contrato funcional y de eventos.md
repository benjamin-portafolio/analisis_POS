---
tipo: contrato_funcional
estado: contrato_core_implementado_interfaz_pendiente
revision: 1
actualizado: 2026-10-04
---

# Seguimiento de existencias: contrato funcional y de eventos

## 1. Estado y autoridad

Decisión funcional confirmada el 2026-10-02, conforme a
[[02 - Decisiones/ADR-0017 Reutilizacion y descarte seguro de recursos de inventario|ADR-0017]].
Esta revisión es normativa. Al 2026-10-04, fases 1–3 están implementadas y
verificadas en contratos, core y transporte, tras corregir los fallos de memoria,
legado, descarte y undo de la auditoría inicial. La UI sigue pendiente y no se
inició verificación final. Comportamiento, pruebas y límites: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].
La matriz distingue evidencia de core de aceptación completa/UI/física.
Si necesita cambiar un nombre o estructura, aumenta esta revisión y actualiza
esquemas, casos y consumidores; no deja dos variantes del contrato.

## 2. Invariantes y términos

- Seguimiento directo: `product_variants.inventory_item_id != NULL`, sin receta.
- Sin seguimiento: vínculo directo nulo y receta vacía. La memoria no modifica
  esta interpretación ni se usa para determinar consumos de una venta.
- Recurso autogenerado: creado por el command de seguimiento directo y marcado
  expresamente con su variante de origen. Un nombre similar no demuestra origen.
- Memoria: último recurso directo conocido de una variante, recuperable entre
  guardados, reinicios y dispositivos. No reserva el vínculo directo único.
- Descarte: elimina solo un recurso autogenerado vacío y su balance, por evento
  standalone. No elimina historial ni es un ajuste de stock a cero.
- Se conservan unicidad del vínculo directo, unidades compatibles, cantidades
  atómicas, historial inmutable y FK `RESTRICT` de variantes, recetas y movimientos.
- Las variantes inactivas que conservan referencias también cuentan al validar
  usos. Desactivar producto/variante no equivale a quitar seguimiento.

## 3. Activación y recuperación

### 3.1 Resolución del recurso

1. Si la variante ya tiene un vínculo directo válido y el usuario mantiene el
   seguimiento, conservar su ID. Nunca recapturar una existencia inicial.
2. Si está sin seguimiento o por receta y se solicita seguimiento directo,
   consultar primero la memoria durable, no solo `before.inventory_item_id`.
3. Con memoria disponible, usar el recurso recordado si existe, está activo,
   cumple las reglas de unidad y no tiene otro vínculo directo, incluso inactivo.
   El uso en recetas no impide recuperarlo; continúa siendo un recurso compartido.
4. Si no hay memoria, buscar evidencia inequívoca según §8. Una selección legada
   explícita y validada también puede establecer el recurso que se recuperará.
5. Si existe evidencia de un recurso anterior pero está ocupado, inactivo,
   incompatible o la evidencia es ambigua, devolver un resultado de recuperación
   no disponible o de selección requerida. No crear silenciosamente otro.
6. Crear recurso nuevo solo si no hubo recurso anterior recuperable ni evidencia
   pendiente de resolver, o si hay un descarte standalone aplicado que demuestra
   que el anterior fue eliminado válidamente. Usar UUID nuevos para recurso y evento.

El command de variante admite una selección opcional de recurso existente para
recuperación (`existingInventoryItemId` en Dart), sin exponer un CRUD adicional.
El command service valida el ID y resuelve dependencias. El payload final de
producto conserva el campo operativo existente `inventory_item_id`; no necesita
un enum o bandera de «recuperado».

### 3.2 Cantidad y efectos

- Recuperar no crea `recurso_inventario_creado`, balance ni `initial_balance`.
- Una existencia inicial no vacía para un recurso existente se rechaza: cambiar
  su stock exige el movimiento de inventario habitual.
- El formulario muestra saldo actual desde el repositorio. La información de
  memoria o saldo presentada no sustituye la validación al guardar.
- Al pasar de receta a directo se quitan componentes y se aplica el vínculo en
  la misma transacción de producto. El resto de las recetas del catálogo permanece.
- El nombre previo del recurso no se cambia implícitamente al renombrar el artículo.

## 4. Deshabilitación y elegibilidad del descarte

El guardado de una variante existente de directo a sin seguimiento o a receta
libera el vínculo operativo y recuerda el recurso anterior. Si la receta nueva
todavía usa ese recurso, no es candidato a descarte.

En `standalone`, un candidato se descarta automáticamente solo si todas estas
condiciones se cumplen en la transacción y después del nuevo estado de producto:

1. Tiene `origin_variant_id` explícito igual a la variante que se desvincula.
2. No tiene vínculos directos ni componentes de recetas en ninguna variante,
   incluyendo filas inactivas y otras variantes del mismo producto.
3. No tiene movimientos de ningún tipo. Un `initial_balance`, una entrada, una
   venta, una corrección o una reversión lo excluyen, aunque la suma sea cero.
4. Existe su balance y `quantity_on_hand_atomic = 0` y
   `quantity_available_atomic = 0`. Saldo faltante significa inconsistencia,
   no elegibilidad; conservar y reportar para reparación.
5. No hay captura de venta ni evento operativo aplicable que todavía lo necesite.
   Verificar también borradores mediante sus configuraciones capturadas y los
   payloads tipados; `event_refs` no existe en standalone. Los eventos históricos
   de alta y de configuración desvinculada se conservan y no cuentan por sí solos
   como uso operativo actual.
6. No hay memoria de otra variante apuntando al recurso. La memoria de la propia
   variante se elimina con el recurso; no se considera un bloqueo circular.
7. El recurso sigue activo y su base coincide con la observada por el comando.

Si una condición no se cumple, guardar la deshabilitación y conservar recurso,
balance y memoria. Fallar la comprobación por un error técnico no autoriza borrar.
La decisión de conservar se distingue de una transacción incompleta.

En `server_sync` conservar siempre recurso y balance. No programar borrado
posterior, temporizador ni purga por una consulta de `event_refs`. Una tablet
desconectada puede tener ventas históricas todavía desconocidas por el servidor.

La eliminación lógica de producto, la eliminación/inactivación de variantes y
la eliminación de categorías quedan fuera de los disparadores de descarte.

## 5. Diseño persistente de referencia

### 5.1 Procedencia en `inventory_items`

Agregar `origin_variant_id` nullable (UUID en PostgreSQL/texto UUID en SQLite).
Solo `recurso_inventario_creado` puede establecerlo; edición de nombre y movimientos
no lo modifican. Recursos independientes y eventos legados lo dejan en `NULL`.

Es una identidad de procedencia, no una FK: el evento de recurso se aplica antes
de que exista la variante y el recurso conserva su propio ciclo de vida. Validar
forma UUID v4 y, al aplicar el producto que crea el vínculo autogenerado, coherencia
con la variante destinataria. No generar una dependencia hacia una variante aún
no creada ni invertir el orden causal recurso → producto.

Agregar un índice no único por `origin_variant_id`. No imponer unicidad de
procedencia: pueden existir recursos históricos o creaciones concurrentes con
el mismo origen; la unicidad normativa sigue siendo la del vínculo directo.
Más de un candidato no autoriza escoger arbitrariamente el más nuevo.

### 5.2 Tabla `variant_inventory_memory`

Proyección auxiliar del agregado producto/variante en ambas bases:

| Campo | Regla |
|---|---|
| `variant_id` | PK, FK a la variante con `ON DELETE CASCADE` |
| `inventory_item_id` | Último recurso directo conocido, NOT NULL, FK a recurso con `ON DELETE CASCADE` |
| `source_event_id` | Evento de producto cuya configuración anterior o posterior acredita esa memoria, NOT NULL |
| `source_server_sequence` | Secuencia oficial de ese evento, nullable para estado local |

Índice no único en `inventory_item_id` para detectar memorias de otras variantes.
`source_event_id` no introduce una FK SQL al historial de eventos. La tabla no
usa `CommonFields`, `active` ni versión independiente: su identidad es la variante
y la concurrencia la controla el agregado producto. Documentar esta excepción.

La cascada del recurso elimina únicamente la memoria; nunca elimina la variante.
La cascada de variante elimina únicamente su memoria; nunca elimina el recurso.
La memoria no tiene restricción única sobre `inventory_item_id` ni reserva stock.

El handler de producto establece memoria al aplicar un vínculo directo nuevo o
recuperado. Si el vínculo se mantiene, conserva la memoria existente; si falta,
la reconstruye desde la configuración directa acreditada por el evento.
Al desvincular, asegura primero una memoria del vínculo anterior y la conserva.
Cambios de nombre, precio o receta sin nuevo vínculo directo no cambian el recurso
recordado. Un eco solo avanza la secuencia cuando `source_event_id` coincide.

No agregar memoria a los snapshots comerciales `before`/`after` como segunda
configuración de consumo. Es una proyección derivada de los eventos de producto;
necesita respaldo exacto para deshacer optimismo local y representación explícita
en los futuros snapshots de bootstrap. No volver a consultar todo el historial
en cada render ni en cada lectura ordinaria de existencias.

## 6. Contratos de eventos

### 6.1 Alta de recurso: extensión compatible

`recurso_inventario_creado`, `aggregate_type = inventory_item`, conserva el sobre
y añade el campo opcional dentro de `inventory_item`:

```json
{
  "inventory_item": {
    "inventory_item_id": "00000000-0000-4000-8000-000000000030",
    "name": "Artículo / Variante",
    "default_unit_id": "00000000-0000-4000-8000-000000000040",
    "origin_variant_id": "00000000-0000-4000-8000-000000000020"
  },
  "initial_movement": null
}
```

Omitir `origin_variant_id` al emitir recursos independientes; el lector acepta
ausencia o `null` como desconocido. Rechazar un valor presente inválido. No perder
el campo al canonicalizar, hacer `toJson`, push, pull o replay. Mantener la
compatibilidad explícita de `manual_adjustment` inicial legado.

Las referencias actuales permanecen: recurso `affects`, unidad `uses` y movimiento
`affects` si existe. El origen futuro es metadata y no un `uses` hacia una variante
inexistente.

### 6.2 Configuración de producto

`producto_creado` y `producto_actualizado` mantienen vínculo directo nullable,
componentes y dependencias de inventario. Un recurso recuperado se declara como
dependencia normal. Si su alta está pendiente, push espera su aceptación.
La memoria se deriva de los estados de configuración y no tiene evento propio.

### 6.3 `recurso_inventario_descartado`: solo standalone

Nuevo contrato tipado, `aggregate_type = inventory_item`, `aggregate_id` igual al
recurso. El sobre usa versión/base del recurso y `delivery_status = not_required`:

```json
{
  "base_event_id": "00000000-0000-4000-8000-000000000031",
  "trigger_product_id": "00000000-0000-4000-8000-000000000010",
  "trigger_product_event_id": "00000000-0000-4000-8000-000000000011",
  "origin_variant_id": "00000000-0000-4000-8000-000000000020",
  "policy_version": 1
}
```

`trigger_product_event_id` debe ser el evento de producto aplicado que acaba de
quitar el vínculo de esa variante; comprobar agregado, identidad y transición.
No aceptar `delete_product` ni una variante simplemente retirada como disparador.
`policy_version` admite exactamente `1`. Validar UUID, base y elegibilidad (§4).

Referencias declaradas y validadas: `inventory_item affects`, `product uses` y
`product_variant uses`. No se persisten en standalone.

El command evalúa y prepara el lote dentro del mismo límite transaccional, usando
el estado posterior previsto, y añade el descarte después de `producto_actualizado`.
No abrir un intervalo entre comprobar elegibilidad y guardar ambos eventos.
Usar `appendAndApplyAll` o el mecanismo atómico vigente. El handler vuelve a comprobar el estado,
borra el recurso y deja que las cascadas retiren balance y memoria. Si el lote no
puede aplicarse íntegro, ninguna de sus proyecciones queda parcialmente modificada.
No usar un `delete` directo posterior al commit del artículo.

Un evento de descarte recibido por el servidor se rechaza de forma funcional,
sin borrar nada; no se publica por pull. Una app `server_sync` no lo genera ni
acepta como evento remoto aplicable. No existe conversión automática del historial
standalone para enviar este evento al servidor.

## 7. Idempotencia, concurrencia y restauración

- Repetir un guardado/evento no crea otro recurso, movimiento ni balance.
- Un descarte repetido es idempotente solo si hay evidencia persistida de que
  ese mismo descarte ya se aplicó. Un recurso faltante sin esa prueba es error.
- La prueba histórica del descarte impide que reaplicar su antigua alta resucite
  el recurso. Los UUID descartados no se reutilizan; un alta futura usa otro UUID.
- Reconstruir desde cero aplica eventos en orden causal: alta, vínculos,
  desvinculación y descarte; obtiene el mismo resultado. No inferir orden por reloj.
  En el destino vacío, registrar/aplicar secuencialmente; no precargar descartes
  futuros como ya aplicados y luego impedir el alta requerida por eventos anteriores.
- En NestJS el lock de producto serializa cambios de configuración y memoria.
  Las validaciones de vínculos y recursos mantienen un orden de locks consistente
  con Inventario/Ventas. Convertir carreras en conflicto funcional, sin error 500.
- Dos terminales pueden crear recursos antes de competir por una edición del
  producto. Este plan no promete unicidad global de origen ni elimina el recurso
  aceptado de la edición perdedora; conserva hechos y detecta ambigüedad.
- Deshacer una edición local en conflicto restaura **vínculo y memoria exactos**,
  incluidos ausencia de fila, fuente y secuencia. Ampliar `product_update_undo`
  para cambios de memoria, no solo eliminación de producto o variantes.
- Aplicar cadenas pendientes y deshacerlas en orden inverso. Un eco antiguo no
  sobrescribe una memoria establecida por una edición posterior.
- Las ventas históricas consumen el recurso capturado en su configuración,
  aunque el vínculo actual sea nulo. En `server_sync` siempre existe su balance;
  no cambiar esta regla para hacer aceptable un borrado.

## 8. Datos legados, reinicio y recuperación

1. Migración PostgreSQL: añadir origen nullable sin fabricar procedencia. Sembrar
   memoria de vínculos directos actuales, incluidos inactivos, con evento de
   configuración y secuencia demostrables. No copiar ciegamente `last_event_id`:
   podría corresponder a una operación de Categorías u otro evento sin configuración.
   Buscar la evidencia de producto pertinente; si falta, no fabricar una fuente.
   Una edición posterior que incluya el vínculo actual en `before` puede acreditar
   la memoria con su propio evento de producto al desvincular.
2. Para variantes ya desvinculadas, reconstruir memoria solo desde una cadena
   demostrable de eventos aceptados de producto, en orden de versión/causalidad
   y secuencia oficial. Usar el último vínculo directo de esa variante; no el
   último recurso global creado. Historia incompleta o divergente es ambigüedad.
3. Separar la reconstrucción legada explícita de la aplicación de eventos nuevos.
   El resultado es una proyección; no modifica payloads históricos ni marca
   recursos legados como autogenerados. La fase 2 incluye esa reconstrucción.
4. Si la memoria falta en el cliente, verificar historia disponible y recursos de
   origen explícito. Una selección legada acotada puede resolver la ambigüedad;
   no hay purga ni reasignación masiva. Si no se puede demostrar ausencia de un
   recurso anterior, pedir selección en vez de crear silenciosamente otro.
5. Una variante realmente sin seguimiento previo puede crear su primer recurso.
   La fase 3 distingue ausencia demostrada de datos incompletos en su resultado.
6. Respaldos SQLite incluyen origen, memoria y eventos de descarte. Restaurar un
   respaldo compatible debe conservar memoria y permitir recuperación. Seguir la
   política de esquema de desarrollo descrita en el plan para versiones antiguas.
7. El contrato de bootstrap deberá transportar `variant_inventory_memory`. Si
   no existe bootstrap implementado, no añadir uno completo: documentar el límite
   y verificar la reconstrucción mediante el pull de eventos real.

## 9. Interfaz y fuera de alcance

- Apagar y volver a encender antes de guardar conserva el recurso del formulario.
  Guardar apagado, cerrar y reabrir debe recuperarlo mediante el servicio de dominio.
- Mostrar existencia vigente para recuperación y existencia inicial solo para
  creación nueva. Una consulta asíncrona o doble toque no duplica el guardado.
- Explicar al deshabilitar: el producto dejará de descontar; existencias e historial
  se conservan cuando corresponde. Si se descarta un recurso vacío, informar ese
  resultado después del commit. No añadir confirmación obligatoria para un descarte
  automático que satisface el contrato.
- Conservar acceso a recursos activos sin vínculo para consultas y movimientos.
  No ocultarlos ni volverlos inactivos como sustituto de la limpieza segura.
- La selección legada permite elegir un recurso compatible y disponible para
  recuperar. No incluye fusionar balances, mover movimientos, modificar unidad,
  empezar de cero conservando stock oculto ni «eliminar con historial».
- No se implementan reversiones, cancelaciones, cierre global de dispositivos,
  purga remota, compactación de eventos ni importación de modos.

## Enlaces

- [[08 - Roadmap/Seguimiento de existencias/Plan de implementacion|Plan de implementación]]
- [[08 - Roadmap/Seguimiento de existencias/Casos de aceptacion|Casos de aceptación]]
- [[08 - Roadmap/Seguimiento de existencias/Estado y continuidad|Estado y continuidad]]
