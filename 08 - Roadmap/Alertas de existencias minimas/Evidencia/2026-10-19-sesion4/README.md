# Sesión 4: editor e informe — 2026-10-19

Sesión 4 implementada y verificada en su alcance automatizado. Captura compartida
y aviso observable integrados sobre el core/receptor de sesiones 1–3.
La verificación física, recorrido manual y cierre integral siguen para sesión 5.

## Instrucciones y preservación

Se leyeron solicitud de sesión 4, plan, matriz, continuidad, evidencias de sesiones
1–3, AGENTS de vault/Flutter/Nest y las dos guías offline de Flutter. No se usan
subagentes. Se inspeccionó Git y se guardó una línea base con SHA256 antes de
editar; `baseline.json` conserva HEAD/rutas/hashes y `preservation.json` compara
los archivos previos. El backup temporal de trabajo no forma parte de la entrega.

Flutter sigue en HEAD 3e8e1ed, Nest en dcc2907. Los cambios previos de core,
contratos, esquema, sincronización, fixtures, pruebas y archivos ajenos se
conservan; solo los archivos de editor/informe/documentación enumerados se
extienden. El coordinador `remaining_stock_variant_editor.dart` conserva su hash.
NestJS no cambia. Los archivos anteriores de evidencia/plan/sesiones permanecen
intactos, y las notas canónicas solo actualizan el estado de esta característica.
No hubo commit, push, despliegue, migración operativa ni nuevas dependencias.

## Archivos y comportamiento

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`:

- `lib/presentation/pages/gestion_inventario/articulos/models/articulo_form_result.dart`:
  valor persistido `minimumStockAtomic` separado de intención `minimumStock`;
  conservar por defecto en ambos constructores y copia que mantiene intención.
- `.../models/articulo_preview_form.dart`: precarga atomicidad/valor, también
  dormido, sin convertirlo en intención de escritura ni inferir conocimiento.
- `.../models/articulo_form_command.dart`: transmite CambioExplicito al comando
  existente, sin tocar identidad, base ni campos ajenos.
- `.../widgets/variant_editor_screen.dart`: Existencia mínima con unidad siempre
  visible, teclado/formatter de precisión de inventario, codec exacto y 0 válido.
  Vacío editado retira; campo intacto conserva; reabrir borrador conserva su
  intención. Quitar seguimiento/activar receta conserva mínimo guardado dormido.
- `.../article_form_screen.dart`: detecta cambios del mínimo, conserva la intención
  al reconstruir una variante sencilla y usa unidad original del inventario en
  edición. Expone mensaje de base obsoleta sin sustituirla automáticamente.
- `lib/presentation/pages/gestion_inventario/inventory_management_screen.dart`:
  incluye las unidades de recursos precargados. Conserva el resto del flujo.
- `lib/presentation/pages/informes/models/remaining_stock_item.dart`: consulta
  `MinimumStockPolicy` con saldo/umbral y elegibilidad vigentes.
- `.../remaining_stock_screen.dart`: mínimo/unidad o Sin mínimo, Existencia baja,
  Todas/Existencias bajas, contador y vacío específico; navegación/scroll/editor
  existentes. El mismo stream de catálogo y balances mueve la vista.
- `.../widgets/remaining_stock_report_card.dart`: conserva el total seguido y
  añade contador de existencias bajas usando el mismo modelo/política.
- `test/presentation/pages/informes/minimum_stock_ui_test.dart`: 25 pruebas nuevas
  con arneses ProductSupplierHarness/RemainingStockFixture existentes. Widgets,
  comandos/eventos/proyecciones y SQLite real en memoria aislada; no mocks de
  guardado/balances/ventas/recepción. Ambos modos, incluidas sus guardas de refs.
- `test/presentation/pages/informes/reports_screen_test.dart`: desplaza hasta el
  calendario antes de tocar, necesario con la segunda línea y texto grande.
- `docs/architecture/minimum_stock_contract.md` y `offline_feature_flow.md`:
  separación consulta/intención, editor, informe y alcance de verificación.

Vault: matriz, continuidad, notas canónicas de Artículos/catálogo/sincronización
y esta evidencia. No cambia el plan ni contratos/SQL/core/backend. No hay tablas,
generación Drift, consultas por fila, red, temporizadores ni eventos de alerta.
CSV y captura masiva no se amplían.

## Casos acreditados

Un test de constructores/copyWith/conversión y doce recorridos por modo:

1. Precarga 7, teclado de piezas, rechazo de fracción/signo, guarda 0 y después
   vacío/null. Aviso de cero en saldo cero/negativo; null sin aviso en saldo
   negativo/cero/positivo. Las otras variantes, proveedores, receta, barcode,
   precios, categoría y forma de venta conservan estado.
2. Mínimo 6/saldo 7: venta confirmada lleva a 6 y avisa, ajuste a 5 mantiene
   aviso, recepción masiva real de 2 deja 7 y quita la última fila del filtro.
   Contador pasa 1→0, vacío específico, Todas recupera filas y tarjeta se actualiza.
   Cambiar mínimo 6→7 actualiza de nuevo el contador. No hay evento de alerta.
3. Cancelar mínimo desde informe conserva foto de todas las tablas; un cambio
   concurrente en otra variante causa rechazo claro con base fija en dos intentos.
4. Artículos guarda primero borrador, lo precarga al reabrir y cancelar artículo
   no escribe. Un concurrente produce el mismo error y conserva la base original.
5. Desactivar seguimiento después de capturar otro mínimo conserva el guardado
   dormido; recuperarlo desde Artículos precarga 7 y evalúa el saldo actual.
6. Inventario kg con venta en gramos: precarga 1.5, compara 1500/1501 exactos;
   acepta coma con tres decimales y rechaza el cuarto; guardar en informe y
   Artículos conserva recurso/referencia de venta y persiste 1501/1500.
7. Alta sencilla con null y avanzada con dos variantes (mínimos 0/5), IDs y
   recursos propios; filtro/contador cuentan ambas variantes nuevas.
8. Movimiento guardado desde editor lleva 7→8; cancelar mínimo 100 conserva
   mínimo previo 7 y movimiento. La alerta se retira por saldo.
9. Creación histórica sin mínimo, alternar filtros/abrir/guardar sin editar no
   escribe; editar barcode conserva omisión en before/after y base legada.
10. Tamaño 320×740 con texto x2: lista, filtros, distintivo y campo accesibles.
11. Tamaño 1024×768 con texto x2: mismo recorrido sin desbordamiento.
12. Recurso inactivo, variante retirada y producto inactivo excluyen aviso y
    contador; los mínimos físicos no se borran por filtrar presentación.

A01–A06, A19–A20, A23, A25–A26 y A38–A41 acreditados en su alcance de widgets y
persistencia local, junto a la evidencia previa. A14/A18 se refuerzan. Los
recorridos de escáner/lector conservan sus suites existentes; no se prueba un
lector físico nuevo. La regla de receta/recuperación compatible está además en
las pruebas de core de sesión 2, conservadas en la regresión.

## Comandos y resultados

Desde Flutter, con el runtime registrado en `environment-public.json`:

| Comando | Resultado | Log |
|---|---|---|
| `dart analyze` definitivo | Exit 0, sin incidencias | dart-analyze-definitivo.log |
| `flutter test test/presentation/pages/informes/minimum_stock_ui_test.dart --reporter expanded` | Exit 0, 25 aprobadas | flutter-minimos-final.log |
| `flutter test` de remaining_stock_screen_test, remaining_stock_variant_edit_test, article_form_screen_test y variant_editor_barcode_test, `--reporter expanded` | Exit 0, 85 aprobadas en la primera verificación | flutter-regresion-editor-informe.log |
| `flutter test test/presentation/pages/informes/reports_screen_test.dart --reporter expanded` | Exit 0, 6 aprobadas | flutter-reports-final.log |
| `flutter test --reporter expanded` definitivo | Exit 0, 2542 aprobadas, cero fallos, 23 HTTP omitidas | flutter-completo-final.log |
| `dart format --output=none --set-exit-if-changed` de archivos Dart de sesión 4 | Exit 0, ningún cambio pendiente | checks.log |
| `git diff --check` en Flutter, vault y Nest | Exit 0 en los tres árboles | checks.log |

La regresión final incluye las 25 pruebas nuevas. Flutter 3.41.6 / Dart 3.11.4;
versiones completas en environment-public.json. `manifest.json` registra archivos
finales y hashes; `session4-existing-files.diff` permite revisar las extensiones
contra la línea base sin confundirlas con cambios previos aún sin commit.

No se ejecutó build_runner: no se modificaron tablas ni generado Drift. No se
repitieron build/tests Nest porque no cambió backend. Los 25 y los 85 son partes
superpuestas de la regresión, no conteos adicionales a la suite completa.

Las 23 integraciones HTTP quedan omitidas: faltan POS_MINIMUM_SYNC_URL (7),
POS_PHASE3_SYNC_URL (1), POS_SUPPLIER_SYNC_URL (9) y POS_BULK_SYNC_URL (6).
No se cuentan aprobadas. No se cargó .env ni se conectó a PostgreSQL operativo; tampoco se inició el
arnés Nest de integración o un cluster PostgreSQL en esta sesión. La aceptación HTTP/PostgreSQL de
sesión 3 se conserva como evidencia histórica; para repetirla, usar sus cuatro
instancias y schemas aislados. No atribuir HTTP a estas pruebas de widgets.

## Incidencias intermedias

- Compilación inicial del test nuevo usó `TextFormField.decoration`, propiedad
  no expuesta; se inspecciona el TextField interno. Dos logs de compilación
  conservados (`flutter-minimos-inicial.log`, `flutter-minimos-segunda.log`).
- Fixture de historia legada inicialmente omitía dependencias inventory_item;
  al declararlas se detectó que intentaba compartir un recurso directo ya usado.
  El fixture final crea su propio recurso con comando real y declara su
  dependencia. No se relajó el contrato ni validación de vínculo para aceptarlo.
  Corridas tercera/cuarta/quinta conservan esos fallos; final 25/25.
- Analyze intermedio del test: dos `!` innecesarios y un if sin llaves,
  corregidos; `dart-analyze.log` histórico y definitivo limpio separado.
- Suite completa inicial: 2541 aprobadas, 23 omitidas y un fallo en teléfono/texto
  x2 de Informes. El calendario quedaba fuera de pantalla con la nueva línea;
  se desplaza la vista antes del toque en el helper de prueba. Calendario final
  6/6 y se repite la suite completa en `flutter-completo-final.log`.

## Límites y siguiente sesión

Solo bases SQLite aisladas en memoria; no se abren instalaciones ni respaldos
operativos. La suite existente también comprueba reapertura/backup en temporales,
pero no se presenta como un recorrido manual de esta interfaz. No se realizaron
prueba física, capturas de dispositivo ni teclado real. Texto grande y tamaños de
widget no acreditan hardware.

Siguiente: sesión 5 para recorrido manual/físico, reapertura/restore integrado y
cierre de matriz. Mantener la secuencia de despliegue futura: receptor/esquema
compatibles antes de habilitar escritores nuevos. Esta sesión no despliega.
