# Evidencia individual A01–A42 — 2026-10-19

A01–A41 verificados en el alcance descrito; A42 parcial. El comando final
`flutter test --reporter expanded` ejecuta todos los archivos Flutter de este
localizador: [log completo](flutter-completo-final.log), exit 0, 2567 aprobadas,
cero fallos/omisiones, incluidas las 23 HTTP. Los nombres abreviados con «…»
son prefijos inequívocos de tests; los archivos siguientes son sus fuentes exactas.
Tras la corrida completa se reforzaron aserciones de presencia/valor en CSV y M:
[68 pruebas afectadas aprobadas](flutter-conservacion-final.log), mismo código
productivo y sin nuevas pruebas. No se suman corridas superpuestas. [Registro y límites](README.md).

## Archivos de referencia

- **L**: [test/application/commands/articulos/minimum_stock_local_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/application/commands/articulos/minimum_stock_local_test.dart>).
- **U**: [test/presentation/pages/informes/minimum_stock_ui_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/informes/minimum_stock_ui_test.dart>).
- **R**: [test/presentation/pages/informes/minimum_stock_restore_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/presentation/pages/informes/minimum_stock_restore_test.dart>).
- **H**: [test/integration/minimum_stock_server_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/integration/minimum_stock_server_test.dart>).
- **C**: [test/application/sync/minimum_stock_contract_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/application/sync/minimum_stock_contract_test.dart>).
- **S**: [test/data/local/drift/minimum_stock_schema_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/data/local/drift/minimum_stock_schema_test.dart>).
- **CSV**: [test/application/commands/articulos/actualizar_articulo_csv_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/application/commands/articulos/actualizar_articulo_csv_test.dart>).
- **CSV10**: [test/data/local/import/articulo_import_csv_vuelta_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/data/local/import/articulo_import_csv_vuelta_test.dart>).
- **CSV12**: [test/data/local/import/articulo_import_identity_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/data/local/import/articulo_import_identity_test.dart>).
- **EXP**: [test/data/local/export/drift_articulo_catalog_export_service_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/data/local/export/drift_articulo_catalog_export_service_test.dart>).
- **M**: [test/application/commands/articulos/editar_articulo_comercial_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/application/commands/articulos/editar_articulo_comercial_test.dart>).
- **B**: [test/application/commands/edicion_masiva/recepcion_reapertura_test.dart](</Users/benjamin/Projects/POS/pos_flutter/test/application/commands/edicion_masiva/recepcion_reapertura_test.dart>).
- **N**: [src/sync/product-suppliers.postgres.spec.ts](</Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest/src/sync/product-suppliers.postgres.spec.ts>).
- **NC**: [src/sync/payloads/minimum-stock-contract.spec.ts](</Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest/src/sync/payloads/minimum-stock-contract.spec.ts>).
- **NS**: [src/migrations/1792368000000-AddVariantMinimumStock.postgres.spec.ts](</Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest/src/migrations/1792368000000-AddVariantMinimumStock.postgres.spec.ts>).

N/NC/NS se acreditan con [Nest final de sesión 3](../2026-10-19-sesion3/nest-completo-final.log)
y [build](../2026-10-19-sesion3/nest-build-final.log): 50 suites/587, cero omisiones.
[Validación SHA256](previous-evidence-validation.json) conserva contratos, esquema,
migración, receptor y pruebas; las diferencias frente a sesiones anteriores son
los cambios posteriores ya documentados y documentación. No hay nuevo cambio Nest.
C/NC comparten [fixtures JSON](</Users/benjamin/Projects/POS/pos_flutter/test/fixtures/minimum_stock_v1/contracts.json>).
[Manual](Manual.md), sus JSON por etapa e [invariantes](manual-invariants.json)
son evidencia adicional de interacción real de escritorio; no hardware móvil.

## A01

U: «A03/A18/A38 precarga, cero, vacío y varias variantes»; L: «A01–A03/A26 regla compartida…».

Null no avisa con saldos positivos/cero/negativos, ambos modos.

## A02

L: «A01–A03/A26 regla compartida…»; U: «A02/A04/A05/A23/A40 venta, reposición y último resultado».

Saldos 6/5/4 frente a mínimo 5 exactos. Manual mínimo 5, venta y reposición: etapas 01–03.

## A03

U: «A03/A18/A38 precarga, cero, vacío y varias variantes»; L: regla compartida.

Captura cero real; 1/0/-1; retirar con vacío desactiva.

## A04

U: «A02/A04/A05/A23/A40 venta, reposición y último resultado».

Ajuste/recepción sobrepasan umbral, última fila y contador desaparecen. Manual etapa 03 y vacío observado.

## A05

L: «A05/A24 cambiar mínimo no invalida consumo capturado en venta abierta»; U: venta/reposición.

Venta confirmada produce igualdad y aviso sin evento de alerta. Manual etapas 01–02: 6→5 en pza/kg.

## A06

C: «codec existente: mínimo 1.5 kg son 1500 átomos y cero es válido»; L: «A06/A07/A19 unidad de inventario exacta y validación atómica»; U: «A06/A38 kg de inventario con venta en gramos en ambos accesos»; H: «A06/A08/A11/A12/A13 HTTP…».

1500/1501 exactos, kg con venta en gramos; manual 6,001 kg → 6001 átomos.

## A07

L: «A06/A07/A19 unidad de inventario exacta y validación atómica»; C/NC: fixtures inválidos.

Error sin escrituras; negativo, fracción de pieza, precisión y overflow. NC conservado de sesión 3, sin cambios de contrato.

## A08

C/NC: vectores inválidos; H: «A06/A08/A11/A12/A13 HTTP: medido, máximo, parciales y bases falsas no pierden canónico».

HTTP real rechaza tipos/rangos inválidos sin corromper catálogo; no coerción.

## A09

S: grupo «rango SQL real y Drift»; NS: «SQL admite…», «SQL rechaza…».

SQLite final y PostgreSQL de sesiones 1/3: null, cero y máximo; constraints reales. NS/entidad/migración con hashes vigentes.

## A10

C: fixture legacy; L: «A10/A13–A17 legado conserva presencia…»; H: «A10/A13/A14/A15/A34 HTTP…»; R.

Creación SQL null sin inventar presencia; round-trip, replay y restore preservan ausencia.

## A11

C/NC: fixtures actuales; H: «A11/A27/A30/A34 HTTP: pendientes en disco, cadena causal, ecos y replay desde cero» y «A06/A08/A11/A12/A13 HTTP…».

Presencia/valor null/cero/positivo/medido/máximo conservados. HTTP final; PostgreSQL de sesión 3 vigente.

## A12

C/NC: parciales/degradación; H: «A06/A08/A11/A12/A13 HTTP…».

Rechazo de parcial y mezcla before/after; no canonicalizar quitando campos.

## A13

L: «A10/A13–A17 legado conserva presencia…»; H: «A10/A13/A14/A15/A34 HTTP…» y «A06/A08/A11/A12/A13 HTTP…».

Promoción explícita completa con base exacta; sin relajar evento/versión/secuencia.

## A14

L: «A10/A13–A17 legado conserva presencia…»; U: «A14/A20/A41 lectura repetida y barcode no promueven base legada»; H: historia legada.

Edición sobre legado aceptada conserva omisión; intento rechazado no promueve.

## A15

L: «A15 valor físico con metadata legada impide borrado silencioso»; H: historia legada y «A15/A29 HTTP: borrado optimista legado rechazado restaura valores y presencia».

Rechazo claro incluso null conocido, borrado y variantes retiradas; restaura sin pérdida.

## A16

L: «A16/A18/A24/A31/A32 mínimo, no-op, conservar, cero y retirar».

Un producto_actualizado por cambio; repetir mismo umbral/guardar idéntico no crea evento.

## A17

L: «A10/A13–A17 legado conserva presencia, promoción sin evento y rechazo de escritor antiguo».

Promoción de presencia sin cambio de negocio no escribe evento/undo ni conocimiento.

## A18

L: «A16/A18/A24/A31/A32 mínimo, no-op, conservar, cero y retirar»; U: constructores/preview/copyWith y precarga/cero/vacío.

Conservar por defecto, establecer cero/positivo y null explícito para retirar. Manual etapas 04–07.

## A19

L: «A06/A07/A19 unidad de inventario exacta…» y «A19/A26/A28 variantes comparten base…»; U: «A19 alta sencilla sin mínimo y avanzada con dos mínimos».

Null por defecto, identidades/recursos propios y mínimos 0/5, ambos modos.

## A20

L: «A20/A25/A26 barcode, receta, retiro y recuperación conservan umbral dormido»; U: barcode legado; regresión de lector/escáner y remaining_stock_variant_edit_test.

El escritor común conserva mínimo y otras variantes; no se acredita operación de lector físico nuevo.

## A21

CSV: «edición parcial conserva datos exactos (medido=…)», «C43 exportar, editar, reabrir, repetir y revertir en disco», grupos de modos/legado/lotes; CSV10; CSV12: C28; EXP: «escribe una fila por variante con las doce columnas del contrato».

Diez columnas solo altas; doce alta/actualización. Snapshot completo preserva mínimo y omitidas; exportación/encabezados sin columna nueva.

## A22

M: «M07/M12/M23/M24 superpone solo lo pedido en un único evento», «M08/M09 costo sin proveedor y venta sola conservan parejas», «M15 conserva legado, conocido vacío y poblado», «M16 medido conserva configuración y referencia».

Fixtures con mínimo 5/medido, receta/orden/proveedores; foto exacta de variantes no editadas. Costo/venta/proveedor no borra mínimo.

## A23

U: venta/reposición; L: «A23/A41 repositorio observable y recepción evalúan saldo vigente sin eventos de alerta»; B: M30–M34.

Entrada real recalcula aviso, catálogo conserva mínimo; diario/atomicidad/backup/reapertura reales con fixture que declara mínimo.

## A24

L: «A05/A24 cambiar mínimo no invalida consumo capturado en venta abierta»; H: «A24/A27/A32/A33 HTTP: mínimo solo conserva inventario, ventas y clave; venta abierta confirma»; manual-invariants.json.

Cambiar mínimo no modifica clave, recursos, saldos, movimientos, ventas/líneas/pagos. Venta abierta confirma; SQL remoto y tablas locales reales.

## A25

L: «A20/A25/A26 barcode, receta, retiro y recuperación conservan umbral dormido»; U: «A25 mínimo dormido se conserva y se recupera desde Artículos».

Desvincular/receta conserva valor dormido, recuperar vínculo compatible usa saldo vigente; sin borrar por captura pendiente.

## A26

L: regla compartida, barcode/receta y «A19/A26/A28 variantes comparten base y retirada conserva mínimo»; U: «A26 contador excluye recurso inactivo, variante retirada y producto».

Sin aviso/contador para inactivos/receta/sin recurso; valor físico intacto.

## A27

L: «A27/A28 rollback después de proyectar, duplicado y base obsoleta»; H: A24/A27… y reentregas; N: fallo después de proyección.

Rollback evento/refs/catálogo; duplicado idempotente. N PostgreSQL conservado por hashes; HTTP final real.

## A28

L: A27/A28 y A19/A26/A28; H: «A28/A29/A30 HTTP: mínimo contra otra variante, preflight, dependientes y resolución posterior»; N: pushes concurrentes reales.

Un ganador; base/secuencia/version; resolución explícita sin sobrescritura silenciosa. N con código sin cambios.

## A29

L: «A29/A30 undo recupera ausencia exacta y una restauración tardía respeta base posterior»; H: A28/A29/A30, rechazo real y borrado legado; R.

Restaura ausencia/null/valor con undo, raíz/dependientes; reapertura y backup integrado conservan respaldo.

## A30

L: A29/A30 y A37/A41; H: «A29/A30 HTTP: rechazo real restaura mínimo y pendientes tras reapertura; undo tardío respeta sucesor».

Limpieza tardía no pisa mínimo/barcode del sucesor aceptado; disco y servidor reales.

## A31

L: «A16/A18/A24/A31/A32 mínimo, no-op, conservar, cero y retirar»; M: «M41 standalone no inicia transporte ni persiste refs»; R; manual-invariants.json.

Refs declaradas/validadas, cero filas persistidas y not_required; guardas de runtime/transporte, sin promover historia.

## A32

L: A16/A18/A24/A31/A32; H: «A24/A27/A32/A33 HTTP…»; R.

Refs/dependencias de producto, cadenas/confirmaciones preservadas, sin agregado de alerta.

## A33

H: «A24/A27/A32/A33 HTTP: mínimo solo conserva inventario, ventas y clave; venta abierta confirma» y «A11/A27/A30/A34 HTTP: pendientes en disco, cadena causal, ecos y replay desde cero»; N.

Clientes A/B y C vacío convergen en mínimo/presencia/base/saldo y condición de aviso; HTTP final sin skips.

## A34

L: «A34 reproducción legada seguida de actual y duplicados conserva estado»; H: «A10/A13/A14/A15/A34 HTTP…» y replay.

Reproducción ordenada/reentrega no pierde mínimo ni conocimiento; eco no pisa pendiente posterior.

## A35

NS: «runMigrations e up repetido agregan null sin tocar IDs, eventos, saldos ni movimientos» y «down protege mínimos (incluido cero) y revierte la adición cuando son null».

Sesiones 1/3, PostgreSQL real: migración aditiva/constraints/rollback en esquema aislado. Código/migración/entidad/config hashes vigentes; sin migración operativa.

## A36

S: «base sin columna actual; protegida=false/true» y «restore rechaza esquema sin columna antes de reemplazar datos»; R.

Detector compartido, reset solo desarrollo y restaurada incompatible intacta por hash; no reemplaza datos al rechazar. Nueva restaurada actual protegida sí reabre.

## A37

R: «A36/A37 disco y restore integrados conservan aviso, presencia y undo» en ambos modos; S/B; Manual etapas 04–07.

Informe → comando → disco → snapshot/restore → informe/filtro/contador → segunda reapertura. Todas las tablas idénticas; legado/null conocido/medido/undo/ref/entrega e integrity/FK correctos. Manual cierra proceso real, no hot reload.

## A38

U: «A03/A18/A38 precarga, cero, vacío y varias variantes», «A06/A38 kg de inventario con venta en gramos en ambos accesos», tamaños 320/1024; R; Manual.

Precarga/unidad/conservar/retirar/0 correctos en Artículos e informe; teclado declarado y precisión automatizados. Teclado móvil físico se reserva a A42.

## A39

U: «A39 cancelar mínimo y rechazar base obsoleta sin sustituirla», «A39 Artículos cancela el borrador y conserva la base al fallar», «A39 movimiento guardado sobrevive a cancelar el mínimo».

Cancelación sin escrituras; dos reintentos con base fija; movimiento independiente no se revierte.

## A40

U: venta/reposición/último resultado y tamaños; R; reports_screen_test; Manual.

Todas/bajas/contador/vacío/tarjeta y navegación del informe/editor correctos; actualizaciones observables. Manual contador 0→2→0 y filtro vacío.

## A41

L: «A23/A41 repositorio observable…» y «A37/A41 reapertura…»; U: «A14/A20/A41 lectura repetida y barcode no promueven base legada»; R.

Foto completa sin cambios por consultar/filtrar/reconstruir. Inspección código: stream/repository existentes y política pura; sin timers/red/sumas por fila.

## A42

dart-analyze-final.log; flutter-completo-final.log; flutter-build-final.log; devices.json; previous-evidence-validation.json; Manual.

Parcial: analyze/build limpios, 2567 aprobadas incluidas 23 HTTP, cero skips. Nest 50 suites/587 vigente por hashes. Falta teléfono/tablet físico: teclado decimal real, legibilidad, scroll y navegación; no lo acreditan widgets, macOS ni simulador.
