# Fixtures — Ingresos y gastos (contrato revisión 1)

Carpeta de fixtures JSON compartidos del contrato «Contrato funcional y de eventos» (§10). Dart y TypeScript deben consumir la misma revisión y checklist; si se copian a un repo, documentar origen y verificar igualdad (p. ej. checksum sha256 del archivo).

Todos los archivos JSON son sintácticamente válidos (verificado con `json.load` de Python sobre los 51 archivos).

## Contenido

| Subcarpeta | Qué cubre | Archivos |
|---|---|---|
| `categoria_financiera/` | Payloads y sobres de `categoria_financiera_creada` | 17 |
| `registro/` | Payloads y sobres de `movimiento_financiero_registrado` | 26 |
| `offline/` | Escenario de categoría nueva + dos registros sin red e IDs de referencia | 2 |
| `conflictos/` | Duplicado por `event_id` y colisiones por `aggregate_id` | 3 |
| `reportes/` | Dataset de registros y períodos `[from, to)` con sumas esperadas | 3 |

## Identidades estables (mismas en todos los archivos)

| Concepto | ID |
|---|---|
| Categoría «Renta» (`out`/`operating`) | `11111111-1111-4111-8111-111111111111` |
| Evento de creación de Renta | `22222222-2222-4222-8222-222222222222` |
| Categoría «Ingresos varios» (`in`/`operating`) | `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa` |
| Evento de creación de Ingresos varios | `bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb` |
| Registro cash «Renta en efectivo» (50000) | `33333333-3333-4333-8333-333333333333` |
| Evento del registro cash | `44444444-4444-4444-8444-444444444444` |
| Registro transfer «Renta de septiembre» (150000) | `55555555-5555-4555-8555-555555555555` |
| Evento del registro transfer | `66666666-6666-4666-8666-666666666666` |
| Registro ingreso «Ingreso operativo de la semana» (200000) | `77777777-7777-4777-8777-777777777777` |
| Evento del registro ingreso | `88888888-8888-4888-8888-888888888888` |

- Dispositivo: `dispositivo-1` · Usuario: `usuario-1` · `created_at_local`: `2026-09-24T12:00:00.000Z`.
- `local_sequence` causal del escenario offline: categoría 1 → registro cash 2 → registro transfer 3.

### Timestamps clave (epoch ms UTC)

| Instante | ms | Nota |
|---|---|---|
| `from_sep` | `1788220800000` | 2026-09-01T00:00:00Z, inclusivo |
| `to_oct` | `1790812800000` | 2026-10-01T00:00:00Z, exclusivo |
| Registro cash | `1789041600000` | 2026-09-10T12:00:00Z |
| Registro ingreso | `1789463700000` | 2026-09-15T09:15:00Z |
| Registro transfer | `1789929000000` | 2026-09-20T18:30:00Z |
| `futuro` | `1798804800000` | 2027-01-01T12:00:00Z, rechazado en command (> now + 5 min) |

## Matriz de validez y resultados esperados

Convención: `VÁLIDO` = debe aplicarse/aceptarse; `PAYLOAD INVALID` = repele el payload (Dart `FormatException` / servidor `rejected`); `SOBRE INVALID` = rechaza el sobre (`rejected`, «Sobre de [categoría financiera|registro financiero] inválido.»).

### categoria_financiera/

| Archivo | Validez | Resultado esperado / error canónico |
|---|---|---|
| `payload-renta-valid.json` | VÁLIDO | Aplica; categoría gasto operativo `out`. |
| `payload-aportacion-valid.json` | VÁLIDO | Aplica; `in` + `nature=capital`. |
| `payload-renta-nfkc-valid.json` | VÁLIDO | Normalización NFKC+trim antes de validar longitud. |
| `payload-nombre-100-valid.json` | VÁLIDO | 100 code points aceptados. |
| `payload-nombre-101-invalid.json` | PAYLOAD INVALID | `name debe tener entre 1 y 100 caracteres.` |
| `payload-nombre-vacio-invalid.json` | PAYLOAD INVALID | `El nombre de la categoría financiera es obligatorio.` |
| `payload-nombre-no-string-invalid.json` | PAYLOAD INVALID | `El nombre de la categoría financiera es obligatorio.` |
| `payload-direction-invalid.json` | PAYLOAD INVALID | `direction debe ser in u out.` |
| `payload-direction-ausente-invalid.json` | PAYLOAD INVALID | `direction debe ser in u out.` |
| `payload-nature-invalid.json` | PAYLOAD INVALID | `nature no está permitida.` |
| `payload-nature-incompatible-invalid.json` | PAYLOAD INVALID | `nature no es compatible con la dirección.` (`asset_purchase`/`inventory_purchase` con `in`) |
| `sobre-renta-valid.json` | VÁLIDO | Sobrepush completo aceptado por servidor; refs `affects` categoría. |
| `sobre-aportacion-valid.json` | VÁLIDO | Igual al anterior con payload de aportación. |
| `sobre-base-version-invalid.json` | SOBRE INVALID | `base_version != 1`. |
| `sobre-base-server-sequence-invalid.json` | SOBRE INVALID | `base_server_sequence != null`. |
| `sobre-aggregate-type-invalid.json` | SOBRE INVALID | `aggregate_type` no corresponde (`financial_entry` en categoría). |
| `sobre-event-type-invalid.json` | SOBRE INVALID | `event_type` no corresponde (`otro_evento`). |

### registro/

| Archivo | Validez | Resultado esperado / error canónico |
|---|---|---|
| `entry-renta-cash-valid.json` | VÁLIDO | Aplica; cash de Renta, 50000. |
| `entry-renta-transfer-valid.json` | VÁLIDO | Aplica; transfer de Renta, 150000, referencia SPEI. |
| `entry-ingreso-cash-valid.json` | VÁLIDO | Aplica; ingreso 200000 de «Ingresos varios». |
| `entry-null-notes-reference-valid.json` | VÁLIDO | `notes`/`reference` null aceptados. |
| `entry-referencia-vacia-valid.json` | VÁLIDO | Cadena vacía → `null` tras normalización. |
| `entry-referencia-espacios-valid.json` | VÁLIDO | Solo espacios → `null` tras normalización. |
| `entry-notas-500-valid.json` | VÁLIDO | 500 code points aceptados. |
| `entry-notas-501-invalid.json` | PAYLOAD INVALID | `notes debe tener entre 1 y 500 caracteres.` |
| `entry-monto-cero-invalid.json` | PAYLOAD INVALID | `amount_minor debe ser un entero positivo en centavos.` |
| `entry-monto-negativo-invalid.json` | PAYLOAD INVALID | `amount_minor debe ser un entero positivo en centavos.` |
| `entry-monto-fraccionario-invalid.json` | PAYLOAD INVALID | `amount_minor debe ser un entero positivo en centavos.` (no entero) |
| `entry-monto-maximo-valid.json` | VÁLIDO | `9007199254740991` aceptado (entero seguro). |
| `entry-monto-superior-invalid.json` | PAYLOAD INVALID | `amount_minor debe ser un entero positivo en centavos.` (> máx. seguro). |
| `entry-moneda-invalid.json` | PAYLOAD INVALID | `Moneda inválida.` |
| `entry-metodo-invalid.json` | PAYLOAD INVALID | `method debe ser cash o transfer.` |
| `entry-direction-snapshot-invalid.json` | PAYLOAD INVALID | `direction del registro no coincide con la categoría.` |
| `entry-nature-snapshot-invalid.json` | PAYLOAD INVALID | `nature del registro no coincide con la categoría.` |
| `entry-occurred-cero-invalid.json` | PAYLOAD INVALID | `occurred_at_ms debe ser un instante válido.` |
| `entry-category-id-invalid.json` | PAYLOAD INVALID | `category_id debe ser un UUID v4.` |
| `entry-dependencia-inexistente.json` | CONFLICTO (entrega) | `La categoría del registro no está disponible en el servidor.`; no se crea la categoría; el registro local no se borra. |
| `sobre-entry-cash-valid.json` | VÁLIDO | Sobrepush completo del registro cash. |
| `sobre-entry-transfer-valid.json` | VÁLIDO | Sobrepush completo del registro transfer. |
| `sobre-base-version-invalid.json` | SOBRE INVALID | `base_version != 1`. |
| `sobre-base-server-sequence-invalid.json` | SOBRE INVALID | `base_server_sequence != null`. |
| `sobre-aggregate-type-invalid.json` | SOBRE INVALID | `aggregate_type` no corresponde. |
| `sobre-event-type-invalid.json` | SOBRE INVALID | `event_type` no corresponde. |

### offline/

| Archivo | Resultado esperado |
|---|---|
| `categoria-y-dos-registros.json` | Tres eventos locales `applied (pending push)`; los registros dependen de `category_event_id`; orden de push: categoría → cash → transfer. `dependency_event_ids`: `ev_entry_cash → ev_cat_renta`, `ev_entry_transfer → ev_cat_renta`. |
| `ids-referencia.json` | Tabla canónica de IDs y `local_sequence` para usar en pruebas y esperadas. |

### conflictos/

| Archivo | Resultado esperado |
|---|---|
| `duplicado-mismo-event-id.json` | Envío 1 → `accepted`. Envío 2 (reintento, misma identidad/contenido) → `duplicate` con `original_sync_status`. Exactamente 1 fila de `financial_entries`, monto total 50000. |
| `colision-categoria-mismo-aggregate-id.json` | Mismo `aggregate_id`, distinto `event_id` → `conflict`, motivo `Ya existe una categoría financiera con este id.`, `defaultWinnerEventId` = evento existente, `conflictType financial_category_identity`. **No** sobrescribir; la categoría local recibe el oficial por pull (§6.6). |
| `colision-registro-mismo-aggregate-id.json` | Mismo `aggregate_id`, distinto `event_id` → `conflict`, motivo `Identidad de registro financiero ya registrada.`, `defaultWinnerEventId = null`, `conflictType financial_entry_identity`. **No** sobrescribir; monto original 50000 conservado. |

### reportes/

| Archivo | Resultado esperado |
|---|---|
| `dataset-septiembre-2026.json` | Dataset del ejemplo de respuesta de §8.2 (3 registros incluidos + 2 bordes). |
| `periodo-septiembre-2026-expected.json` | `[from=1788220800000, to=1790812800000)`; `income_minor=200000`, `expense_minor=200000`, `cash_minor=250000`, `transfer_minor=150000`, `net_minor=0`; incluye cash/ingreso/transfer, excluye `exact_to` y `antes_de_from`. |
| `periodo-limite-expected.json` | Límites `[from, to)`: inclusivo en `from`, exclusivo en `to` (casos `to_ms`, `to_ms−1`, `from_ms−1`, `from_ms`); futuro rechazado a nivel command (> now + 5 min). |

## Uso

1. Las pruebas de Dart (`payloads`, comandos) y TypeScript (servidor) usan la misma lista de archivos de esta matriz.
2. Los sobres inválidos demuestran que `validateBaseEvent`/`EventProcessor` rechazan pares `aggregate_type`/`event_type` ajenos y campos base exigidos por el contrato (§6.1).
3. `reportes/dataset-septiembre-2026.json` alimenta tanto el informe central (§8.2) como las consultas por período del repositorio local (§8.1); las esperadas son invariantes entre motores salvo por la visibilidad de pendientes/incidencias (§8.3).
4. Si se copian archivos a otro repo, conservar el nombre y registrar el checksum sha256 para verificar igualdad.