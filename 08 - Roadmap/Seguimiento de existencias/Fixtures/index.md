---
tipo: documentacion
relacionado: contrato revision 1
fase: 1
actualizado: 2026-10-02
---

# Fixtures — Seguimiento de existencias (contrato revisión 1)

Carpeta de fixtures JSON compartidos del «Contrato funcional y de eventos» rev. 1
(§5–§8) y de los «Casos de aceptacion». Dart (`pos_flutter`) y TypeScript
(`pos-nest`) consumen **la misma revisión**: cada archivo vive una sola vez aquí
y los dos repos lo leen por ruta. No se copian a los repos de código.

- Dart: `test/fixtures/variant_tracking_fixture_loader.dart`.
- TypeScript: `src/testing/variant-tracking-fixtures.ts`.
- Redirección por variable de entorno: `POS_VARIANT_FIXTURES` (ambos).
- Origen de los archivos: `generar_fixtures.py`, que los emite con `json.dump`
  (indent 2, `ensure_ascii=False`, salto final) para garantizar JSON válido y una
  forma canónica estable. Regenerar con `python3 generar_fixtures.py`.

Los 33 archivos son sintácticamente válidos (verificado con `json.load`).

## Contenido

| Subcarpeta | Qué cubre | Archivos |
|---|---|---|
| `alta/` | Sobres de `recurso_inventario_creado`: origen válido, independiente, legado e inválido | 8 |
| `producto/` | Transiciones reales de `producto_actualizado` (directo → ninguno → receta → directo) y memoria derivada | 4 |
| `descarte/` | Contrato `recurso_inventario_descartado` y sus rechazos | 7 |
| `memoria/` | Memoria de variante: recuperación legada y estado antes/después de conflicto | 3 |
| `venta_tardia/` | Venta posterior a la desvinculación: configuración histórica, consumo original y esperado | 4 |
| `escenarios/` | Casos de descarte no descartables y actualización que intenta mutar el origen | 7 |

## Identidades estables (ninguna prueba debe inventar otras)

| Prefijo | Concepto | ID |
|---|---|---|
| `a1…` | Producto «Café molido» | `a1000000-0000-4000-8000-000000000001` |
| `a1…` | Producto «Café en grano» | `a1000000-0000-4000-8000-000000000002` |
| `a2…` | Variante 250 g (directa) | `a2000000-0000-4000-8000-000000000001` |
| `a2…` | Variante 1 kg (sin vínculo directo) | `a2000000-0000-4000-8000-000000000002` |
| `a2…` | Variante de grano 1 kg | `a2000000-0000-4000-8000-000000000003` |
| `a2…` | Variante retirada | `a2000000-0000-4000-8000-000000000004` |
| `a3…` | Recurso autogenerado «Café molido 250 g» | `a3000000-0000-4000-8000-000000000001` |
| `a3…` | Recurso independiente «Vela aromática» | `a3000000-0000-4000-8000-000000000002` |
| `a3…` | Recurso legado «Café molido (2019)» | `a3000000-0000-4000-8000-000000000003` |
| `a4…` | Recurso de receta «Café en grano 1 kg» | `a4000000-0000-4000-8000-000000000001` |
| `a5…` | Unidad pza / g / kg | `a5000000-…-000000000001/2/3` |
| `b1…` | Evento de alta autogenerado / independiente / legado / receta | `b1000000-…-000000000001…4` |
| `b2…` | Evento de movimiento inicial (250 g / legado) | `b2000000-…-000000000001/2` |
| `b3…` | Evento de producto: creado, creado grano, desvincula, directo→receta, recupera, **descarte** | `b3000000-…-000000000001…6` |
| `b4…` | Evento de venta tardía | `b4000000-0000-4000-8000-000000000001` |
| `b5…` | Evento de movimiento de consumo tardío | `b5000000-0000-4000-8000-000000000001` |
| `b6…` | Venta tardía | `b6000000-0000-4000-8000-000000000001` |
| `b7…` | Línea de la venta tardía | `b7000000-0000-4000-8000-000000000001` |
| `b8…` | Pago de la venta tardía | `b8000000-0000-4000-8000-000000000001` |
| `b9…` | Actualización que intenta mutar el origen | `b9000000-0000-4000-8000-000000000001` |
| `c1…` | Evento de categoría ajeno (usado por la migración) | `c1000000-0000-4000-8000-000000000001` |

- Dispositivo: `dispositivo-1` · Usuario: `usuario-1` · `created_at_local`:
  `2026-10-01T12:00:00.000Z`.
- El sobre de push **no** lleva `base_event_id` ni `delivery_status`: el evento
  base viaja dentro del payload y el estado de entrega es una fila local.
- `b3000000-…-000000000006` es el `event_id` del descarte. Comparte prefijo de
  producto por coherencia de escenario, pero su `aggregate_type` es
  `inventory_item`: el disparador nunca puede ser su propio `base_event_id`.

## Matriz de validez y resultados esperados

Convención: `VÁLIDO` = el contrato lo acepta; `PAYLOAD INVALID` = el payload se
rechaza en el contrato (Dart `FormatException`, TS `Error`) antes de tocar la
proyección; `ESCENARIO FASE n` = fixture de comportamiento que solo cobra
sentido cuando exista el código de esa fase.

### alta/ — procedencia del recurso

| Archivo | Validez | Resultado esperado / error canónico |
|---|---|---|
| `alta-autogenerada-origen-valido.json` | VÁLIDO | `origin_variant_id` = variante 250 g; roundtrip lo conserva; `initial_movement` `null`. |
| `alta-autogenerada-inicial-positiva.json` | VÁLIDO | Recurso con origen e `initial_balance` positivo; un solo movimiento inicial. |
| `alta-independiente.json` | VÁLIDO | Sin `origin_variant_id`; el roundtrip **omite** la clave y no inventa procedencia. |
| `alta-legada-sin-origen.json` | VÁLIDO | Alta legado con `manual_adjustment`; origen desconocido y movimiento conservado tal cual. |
| `alta-legada-uuid-incorrecto.json` | PAYLOAD INVALID | `inventory_item_id` con versión de UUID 1: `UUID v4`. No se degrada a `null`. |
| `alta-autogenerada-origen-no-string.json` | PAYLOAD INVALID | `origin_variant_id: 42`: «debe ser un UUID v4 o null». |
| `alta-autogenerada-origen-no-uuid.json` | PAYLOAD INVALID | `origin_variant_id: "variante-250g"`: `UUID v4`. |
| `sobre-alta-valido.json` | VÁLIDO | Sobre completo del alta autogenerada; `aggregate_type`/`aggregate_id` = recurso. |

### descarte/ — contrato de descarte

| Archivo | Validez | Resultado esperado / error canónico |
|---|---|---|
| `descarte-valido.json` | VÁLIDO | Forma completa; roundtrip idéntico. **No** borra nada por sí sola. |
| `sobre-descarte-valido.json` | VÁLIDO | Sobre completo con `aggregate_id` = recurso. |
| `descarte-policy-version-cero.json` | PAYLOAD INVALID | `policy_version: 0`: «policy_version solo admite 1». |
| `descarte-policy-version-invalida.json` | PAYLOAD INVALID | `policy_version: 2`: «policy_version solo admite 1». |
| `descarte-trigger-igual-base.json` | PAYLOAD INVALID | `trigger_product_event_id == base_event_id`: «El disparador del descarte no puede ser el alta del recurso». |
| `descarte-origen-no-uuid.json` | PAYLOAD INVALID | `origin_variant_id` versión 1: `UUID v4`. Aquí la procedencia es **obligatoria**. |
| `descarte-campo-desconocido.json` | PAYLOAD INVALID | `force: true`: «contiene campos no permitidos: force». Validación estricta de claves. |

### producto/ — transiciones y memoria derivada

| Archivo | Validez | Resultado esperado |
|---|---|---|
| `producto-directo-a-ninguno.json` | VÁLIDO | `producto_actualizado` real con `before`/`after` completos y `base_server_sequence: 41`. Deja la variante sin vínculo directo. |
| `producto-directo-a-receta.json` | VÁLIDO | El vínculo directo pasa a receta con `inventory_configuration.components`. |
| `producto-recuperacion-mismo-id.json` | VÁLIDO | Vuelta a directo conservando el mismo `inventory_item_id`. |
| `producto-origen-en-antes.json` | ESCENARIO FASE 2 | Estado previo + evento + estado esperado: al desvincular se crea la memoria acreditada por `EV_PRODUCTO_DIRECTO_A_NINGUNO` (seq. 41) y el recurso se conserva. |

### memoria/

| Archivo | Resultado esperado |
|---|---|
| `memoria-legada-recuperable.json` | Vínculo desvinculado antes de existir la tabla: la evidencia es el `before` del propio evento. Se crea memoria con `source_server_sequence: 41`. Límite declarado: sin `origin_variant_id` la procedencia sigue desconocida y no habilita descarte automático. |
| `memoria-antes-conflicto.json` | Memoria acreditada por `EV_PRODUCTO_CREADO_MOLIDO` con vínculo directo vigente. |
| `memoria-despues-conflicto.json` | Tras el conflicto gana la edición oficial: vínculo `null` y memoria acreditada por el evento que desvinculó. No se borra la fila. |

### venta_tardia/

| Archivo | Resultado esperado |
|---|---|
| `venta-tardia-configuracion-historica.json` | Configuración capturada antes de la desvinculación: única fuente admisible del consumo histórico. |
| `venta-tardia-consumo-original.json` | `venta_confirmada` de 9000 por transferencia, con `consumptions` contra el recurso capturado. |
| `venta-tardia-deshincular.json` | Alias del evento de desvinculación: el orden causal es alta → producto creado → desvincula → venta. |
| `venta-tardia-esperado.json` | Saldo final 248/248, recurso conservado, `descarte_generado: false`, memoria acreditada por la desvinculación. |

### escenarios/

| Archivo | Validez | Resultado esperado |
|---|---|---|
| `actualizacion-intenta-mutar-origen.json` | PAYLOAD INVALID | `recurso_inventario_actualizado` con `changed_fields: ["origin_variant_id"]`: solo admite `[name]`. La procedencia solo la establece el alta. |
| `descarte-trigger-delete-product.json` | ESCENARIO FASE 3 | Disparador cuyo evento también eliminó el producto: rechazo por regla de disparador, no se borra nada. |
| `descarte-trigger-variante-retirada.json` | ESCENARIO FASE 3 | La variante se retiró sin transición de desvinculación: el recurso no se descarta. |
| `descarte-base-no-creacion.json` | ESCENARIO FASE 3 | `base_event_id` que no es el alta y versión/secuencia base que no coinciden: rechazo sin borrar recurso ni balance. |
| `descarte-recurso-con-movimientos.json` | ESCENARIO FASE 3 | Suma de movimientos cero pero con historial: se conservan recurso, balance y memoria; no es candidato. |
| `descarte-saldos-no-cero.json` | ESCENARIO FASE 3 | Saldos 4/4: se conservan recurso, balance y memoria. |
| `descarte-memoria-de-otra-variante.json` | ESCENARIO FASE 3 (SEG-10) | Otra variante recuerda el mismo recurso: se cuenta la referencia, el recurso se conserva y no hay violación de FK. |

## Matriz de casos de aceptación

| Caso | Cobertura en fase 1 |
|---|---|
| SEG-01, SEG-02 | `alta/alta-autogenerada-origen-valido.json`, `alta/alta-autogenerada-inicial-positiva.json` (forma de contrato; el alta real es fase 3). |
| SEG-03 | `alta/alta-independiente.json`, `alta/alta-legada-sin-origen.json` y la prueba de roundtrip sin clave. |
| SEG-04 | Spec de migración PostgreSQL con vínculo directo antiguo, `last_event_id` ajeno y evento de producto acreditado. |
| SEG-10 | `escenarios/descarte-memoria-de-otra-variante.json` + prueba de índice no único y cascadas de `variant_inventory_memory`. |
| SEG-18 | `recurso_inventario_actualizado` rechaza cualquier campo distinto de `name`; `escenarios/actualizacion-intenta-mutar-origen.json`. |
| SEG-28 | Detección de esquema y respaldo restaurado en SQLite (`variant_memory_schema_reset_test.dart`), con archivos temporales. |

Los casos restantes (SEG-05 a SEG-17, SEG-19 a SEG-27, SEG-29, SEG-30) dependen de
servidor, command services o UI y llegan en sus fases. Sus fixtures ya están
listados arriba, pero **no** se consumen todavía.

## Uso

1. Cada archivo se lee por ruta relativa desde la raíz; nunca se edita a mano en
   un repo de código.
2. Para regenerar: `python3 generar_fixtures.py`. El script es la fuente de
   verdad de la forma canónica; un fixture nuevo se añade ahí, no en el JSON.
3. Si los fixtures se copian a otro repo, conservar el nombre y registrar el
   checksum sha256 para verificar igualdad.