---
tipo: seguimiento_implementacion
estado: implementacion_completada_verificacion_fisica_pendiente
revision_plan: 2
actualizado: 2026-10-10
---

# Estado y continuidad: escaneo en caja

## Sesión de planificación del 2026-10-04

Solicitud: preparar un plan, sin implementar todavía. Se inspeccionó el video
local de referencia y el código de Flutter. El usuario confirmó que otra
unidad del mismo producto requiere retirar y volver a presentar el código.

Documento principal:
[[08 - Roadmap/Escaneo en caja/Plan de implementacion|Plan de implementación, revisión 2]].

## Decisión vigente del usuario: requisito físico retirado

El 2026-10-04 el usuario indica: «quita ese requisito ya existe una pantalla en
donde se escanea y puedes basarte en ese funcionamiento».

Esta decisión reemplaza el requisito de revisión 1 y la indicación anterior de
conservar Caja deshabilitada por falta de dispositivo. La sesión 2 puede
ejecutarse con la consulta/compuerta ya implementadas y basándose en
`BarcodeScannerScreen` del editor de variantes para cámara, permisos, detección
y liberación. Los casos físicos quedan pendientes para la verificación final;
no son una condición para implementar la pantalla ni activar sus botones.

La [[08 - Roadmap/Escaneo en caja/Sesiones/02 - Pantalla e integracion|Sesión 2: pantalla e integración]]
quedó implementada el 2026-10-04, como se documenta al final de esta nota.
No repetir sesión 1 solo por falta de teléfono ni introducir otra condición
equivalente. La sesión 3 se cerró en su alcance automatizado y de compilación;
las pruebas físicas siguen pendientes y no se declaran aprobadas.

## Estado por fase

| Fase | Estado | Evidencia |
|---|---|---|
| Planificación | Documentada | Video muestreado visualmente; AGENTS, pantallas, comandos, tablas, repositorios, pruebas y plugin local leídos |
| 1. Consulta y control de lecturas | Implementada y verificada en su alcance automatizado | Consulta exacta, compuerta, lector mínimo, SQLite temporal, pruebas por modo y APK Android; casos físicos trasladados a sesión 3 |
| 2. Pantalla e integración | Implementada y verificada en su alcance automatizado | Ambos accesos activos, venta persistida, selector y cantidad; 30 pruebas nuevas y 151 de regresión aprobadas; análisis limpio |
| 3. Verificación y cierre | Implementación integrada; verificación automatizada completada, física pendiente | 248 pruebas de regresión aprobadas, análisis limpio, APK principal Android compilada y matriz E01–E20 registrada; 1132 aprobadas en suite global, 1 omitida y 1 fallo previo ajeno |

En la sesión de planificación no se modificó `pos_flutter` ni `pos-nest`. HEAD Flutter inspeccionado:
`65c07bc`; working tree limpio al revisar. El vault tenía cambios previos en
múltiples notas; se conservaron. Los cambios propios son esta carpeta y su
enlace en Mapa del vault.

## Hallazgos para retomar

- `Icons.barcode_reader` ya existe en Flutter instalado.
- `mobile_scanner` 7.4.2 y un lector de una lectura ya están integrados.
- La consulta exacta por barcode quedó implementada en sesión 1; este campo sigue sin unicidad global.
- El comando existente agrega y acumula por condiciones del snapshot.
- Los borradores son locales `not_required` en ambos modos; refs persistidas
  únicamente en `server_sync`.
- El modo `noDuplicates` no satisface retirada/reaparición del mismo código;
  las capturas vacías no llegan a Dart en Android/Darwin inspeccionados.
- La compuerta temporal conserva el límite de distinguir retirada de fallos
  de lectura. La comprobación física queda en sesión 3; no condiciona fase 2.

## Implementación de sesión 1 del 2026-10-04

Se leyeron los AGENTS vigentes de Flutter y del vault, las dos guías offline y
los tres documentos solicitados de este plan. Flutter comenzó en `main`, HEAD
`65c07bc`, con working tree limpio. La carpeta del plan estaba sin seguimiento
en Git del vault; se conservaron sus documentos y los demás cambios del vault.
No se modificó `pos-nest`, bases de uso, tablas, índices, `schemaVersion`,
migraciones, transporte ni contratos de eventos.

### Entrega

- `ProductoRepository.buscarVariantesPorCodigoBarras` normaliza con
  `CodigoBarras`, conserva ceros y devuelve cero/uno/todos los candidatos activos.
  Vacío devuelve lista vacía; entrada incompatible falla con `ArgumentError`.
- `ProductoRepositoryImpl` mapea un JOIN exacto de `ProductoDao`, sin cargar el
  catálogo ni buscar detalle por producto. El modelo `VariantePorCodigoBarras`
  incluye identidades, nombres, barcode, precio, `SaleConfiguration` y unidad
  completa, incluido su estado. El comando existente conserva la revalidación.
- `BarcodeReadGate` y `BarcodeReadProbeScreen` implementan la compuerta y el
  lector mínimo con cámara real de `mobile_scanner`, inyectable para tests.
- `tool/barcode_read_probe.dart` es una entrada independiente con dos fixtures y
  SQLite **en memoria**. Consulta y agrega mediante el comando, evento, handler
  y proyección existentes. Muestra cantidades confirmadas y registra cada
  incorporación. Desconocido/varios candidatos no escriben ni eligen el primero.
  No ejecuta `main.dart`, DI ni servicios de red. Cerrar/reabrir conserva compuerta
  y borrador en ese proceso; reiniciar descarta sus datos.
- El lector del editor sigue intacto y devuelve `String?`. Los dos botones de
  Caja y el acceso de Artículos siguen deshabilitados. El lector mínimo y la
  consulta se conservan como estructura solicitada de sesión 1, aún sin conexión
  al flujo definitivo. Selector, cantidad medida y diseño final no se adelantaron.

### Archivos propios en Flutter

Lectura de catálogo:

- `lib/domain/articulos/variante_por_codigo_barras.dart` (nuevo).
- `lib/domain/repositories/producto_repository.dart`.
- `lib/data/repositories/producto_repository_impl.dart`.
- `lib/data/local/drift/app_database.dart` (registro del DTO `part`, sin esquema).
- `lib/data/local/drift/daos/producto_codigo_barras_row.dart` (nuevo).
- `lib/data/local/drift/daos/producto_dao.dart`.

Compuerta y prototipo:

- `lib/presentation/pages/caja/barcode/barcode_read_gate.dart` (nuevo).
- `lib/presentation/pages/caja/barcode/barcode_read_probe_screen.dart` (nuevo).
- `tool/barcode_read_probe.dart` (nuevo).
- `docs/testing/barcode_read_probe.md` (nuevo; ejecución y matriz física).

Pruebas y fakes:

- `test/data/repositories/producto_codigo_barras_test.dart` (nuevo).
- `test/presentation/pages/caja/barcode/barcode_read_gate_test.dart` (nuevo).
- `test/presentation/pages/caja/barcode/barcode_read_probe_screen_test.dart` (nuevo).
- `test/presentation/pages/caja/barcode/barcode_draft_flow_test.dart` (nuevo).
- `test/support/fake_mobile_scanner_platform.dart` (registra el área nativa).
- `test/presentation/pages/articulos/article_search_screen_test.dart`.
- `test/presentation/pages/articulos/articles_screen_test.dart`.
- `test/presentation/pages/gestion_inventario/articulos/inventory_articles_tab_test.dart`.
- `test/presentation/pages/gestion_inventario/carga_masiva/bulk_import_screen_test.dart`.
- `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`.
- `test/presentation/pages/pantalla_principal/menu_lateral_test.dart`.

Los últimos seis archivos solo adaptan fakes a la interfaz nueva. Se regeneró
Drift; `app_database.g.dart` no presenta diferencias. Se revisaron referencias,
imports y `git diff --check`, sin código futuro ajeno a esta fase.

### Estrategia de rearmado

`mobile_scanner` 7.4.2, `DetectionSpeed.normal`, `detectionTimeoutMs: 200`, marco
horizontal y `scanWindow` nativo. La compuerta usa reloj monótono (`Stopwatch`) y
un umbral inicial de **1 segundo** sin observaciones positivas del mismo código,
con cámara activa. Solo otra observación puede admitir una acción; no hay
repetición por temporizador ni dependencia de capturas vacías.

Se consume la presentación antes de consultar/seleccionar/guardar, incluso si
termina en error, desconocido o cancelación. Las observaciones se actualizan
durante la operación, sin comandos concurrentes. Un código único distinto
delimita otra presentación, admitiendo A → B → A. Varios códigos no agregan y
actualizan la presencia del ya consumido; el aviso pide enfocar uno. Una
presentación vista durante un guardado necesita un callback nuevo cuando quede
libre: no se encolan lecturas que podrían haber desaparecido.

Diálogo, ruta que cubre el lector, segundo plano o error suspenden cámara y
rearmado. Al reanudar se conserva el código consumido y el primer callback
establece otra base temporal. Inicio/parada/dispose están serializados,
incluido permiso pendiente. Cerrar espera el guardado; no promete rollback.
Los callbacks de rutas cerradas se descartan.

**Limitación sin resolver físicamente:** un fallo de enfoque de al menos 1
segundo puede producir la misma ausencia de lecturas que una retirada y admitir
otra unidad. La prueba con reloj no distingue esos fenómenos. El umbral es de
calibración; no está aprobado para Caja. No se modificó `.pub-cache` ni se
implementó una adaptación nativa sin evidencia que motive ese cambio.

### Comandos y resultados

| Comando | Resultado |
|---|---|
| `dart run build_runner build` | OK, 20 s; sin cambios de esquema ni diferencias generadas en Git |
| `dart analyze` | OK, `No issues found!` |
| `flutter test test/data/repositories/producto_codigo_barras_test.dart test/presentation/pages/caja/barcode --reporter expanded` | 26 pruebas nuevas aprobadas |
| `flutter test --reporter expanded` | 1086 aprobadas, 1 omitida y 1 fallo previo en Inventario (exit 1) |
| `flutter test test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart --plain-name 'busca con debounce y conserva búsqueda y filtros al cambiar de pestaña'` | Falla también aisladamente en el árbol actual y en una copia limpia del HEAD original |
| `flutter build apk --debug -t tool/barcode_read_probe.dart` | OK; `build/app/outputs/flutter-apk/app-debug.apk`; compilación final 6,2 s; sin instalación |
| `flutter devices` | Dos simuladores iOS, macOS y Chrome; ningún Android físico ni dispositivo inalámbrico |
| `/Users/benjamin/Library/Android/sdk/platform-tools/adb devices -l` | Lista vacía |
| `git diff --check` | OK |

Las 26 pruebas cubren: consulta SQLite en archivo temporal (3), compuerta con
reloj controlado (11), lector con controller real y plataforma falsa (10), y
compuerta → consulta → comando/evento/proyección reales en ambos modos (2).
Incluyen ráfagas/20 s de observaciones positivas, silencio sin frames vacíos,
A → B → A, guardado lento, ambigüedad durante guardado, fallos/cancelación,
diálogos, rutas, segundo plano, reapertura, permiso pendiente y callbacks viejos.
Son evidencia de lógica, no aprobación física de retirada, foco o formatos.

En las pruebas de flujo se conserva un solo borrador, A ×3 y B ×1, cuatro
eventos `not_required` en ambos modos, cero refs en `standalone` y 16 refs en
`server_sync`. No hay eventos pendientes ni movimientos de inventario.

El fallo previo es `inventory_management_screen_test.dart`, prueba
«busca con debounce y conserva búsqueda y filtros al cambiar de pestaña»:
no encuentra `clear_article_search_button`. Se reprodujo en una copia de
`git archive HEAD` (`65c07bc`), fuera del proyecto, con `pubspec.lock` idéntico.
No se modificó esa búsqueda para resolver el acceso de Caja. Los logs están en
`Evidencia/2026-10-04-sesion-1/` junto a este documento.

## Historial: pendientes de sesión 1 bajo revisión 1

El orden y los requisitos de avance descritos en esta sección fueron
reemplazados por la decisión vigente de revisión 2 indicada al inicio.

1. **Continuar sesión 1 con Android físico**: registrar modelo/versión/formato,
   código detectado y cantidades. Ejecutar E04 (20 s inmóvil y variaciones de
   luz/enfoque), E05 (tres presentaciones con retirada) y E06 (A → B → A), más
   área, pausa/regreso y EAN-13/EAN-8/UPC-A disponibles. No hubo dispositivo;
   estos casos están pendientes y la fase **no está cerrada**.
2. Si la prueba temporal añade piezas extra o bloquea una relectura intencional,
   continuar esta fase evaluando una adaptación versionada de presencia/ausencia
   del detector y sus pruebas nativas. No editar `.pub-cache` ni reemplazar la
   decisión por repetición temporizada o botón manual.
3. La suite global conserva el fallo de Inventario demostrado en HEAD original;
   su corrección pertenece a un alcance propio. Las pruebas nuevas pasan.

Retomar [[08 - Roadmap/Escaneo en caja/Sesiones/01 - Consulta y control de lecturas|Sesión 1]]
y `docs/testing/barcode_read_probe.md` en Flutter. Antes de modificar, revalidar
HEAD, cambios locales y AGENTS. No avanzar automáticamente a sesión 2 ni
desplegar. Tampoco afirmar paridad iOS/macOS: solo se hicieron pruebas lógicas
del ciclo de vida, no prueba de cámara nativa en esas plataformas.

## Historial: revisión del requisito de sesión 2 del 2026-10-04

Esta revisión documenta la decisión anterior; su bloqueo físico queda revocado
por la instrucción posterior del usuario registrada al inicio de este documento.

Se solicitó implementar pantalla e integración, condicionadas a comprobar la
retirada/reaparición física de la sesión 1. Se leyeron los AGENTS vigentes de
Flutter y del análisis, las dos guías offline, el plan, este seguimiento y las
sesiones 1 y 2. Flutter sigue en HEAD `65c07bc`, con los cambios de sesión 1
presentes y sin commit; el vault conserva sus cambios anteriores.

**Decisión explícita del usuario al retomar:** «No tengo un dispositivo ahora;
registra el pendiente y conserva Caja sin activar». La sesión 2 queda **sin
iniciar**. No se creó la pantalla definitiva, el selector o el diálogo de
cantidad de este flujo, ni se conectaron los accesos ni cambiaron sus iconos o
tests. El lector de Artículos sigue deshabilitado; el editor conserva `String?`.
No se avanzó a sesión 3 ni se desplegó.

### Revisión de código y evidencia real

- Se inspeccionó la consulta `ProductoRepository` → implementación → DAO:
  normalización con `CodigoBarras`, igualdad textual mediante JOIN, productos y
  variantes activos, todos los candidatos y unidad completa. Sus tres pruebas
  usan SQLite en archivo temporal y comprueban ceros iniciales, cero/uno/varios,
  entradas incompatibles e inactivos sin generar eventos.
- Se inspeccionaron `BarcodeReadGate`, `BarcodeReadProbeScreen`, la entrada
  aislada de `tool/`, el fake de cámara y sus tests. La presencia se observa
  también durante el guardado; se consume antes de la operación y se preserva
  ante pausa, cancelación, ruta cubierta y segundo plano. El cierre espera la
  operación y serializa la liberación con un permiso pendiente.
- Se inspeccionó el código nativo instalado de `mobile_scanner` 7.4.2:
  `MobileScanner.kt` devuelve sin callback cuando `barcodeMap.isEmpty()`, y el
  procesamiento de cámara de `MobileScannerPlugin.swift` devuelve cuando
  `results.isEmpty`. La compuerta sigue dependiendo de observaciones positivas;
  **un segundo sin lecturas no demuestra retirada física**. No se modificó el
  plugin, su versión ni el umbral.
- Se leyeron los logs anteriores de pruebas, análisis, compilación Android y
  reproducción del fallo en HEAD original. No contienen una prueba física de
  retirada. La compilación de sesión 1 sigue siendo evidencia de compilación,
  no de cámara; no se repitió ni instaló en esta revisión.
- Se reejecutaron las 26 pruebas focalizadas: tres de consulta, once de
  compuerta, diez widgets con `FakeMobileScannerPlatform` y dos de flujo local
  con command service/evento/proyección reales. En ambos modos conservan un
  único borrador, cuatro eventos `not_required`, cero refs en `standalone` y
  dieciséis en `server_sync`, sin movimientos de inventario ni eventos pendientes.
  Son comprobaciones automatizadas; el retiro se **simula** con el reloj.

### Comandos y resultados de esta revisión

| Comando | Resultado |
|---|---|
| `dart analyze` | OK; `No issues found!`, exit 0 |
| `flutter test test/data/repositories/producto_codigo_barras_test.dart test/presentation/pages/caja/barcode --reporter expanded` | 26 aprobadas, exit 0 |
| `flutter test --reporter expanded` | 1086 aprobadas, 1 omitida, 1 fallo, exit 1; 49 s |
| `flutter devices` | iPhone 17 simulado, macOS y Chrome; ningún Android físico ni dispositivo inalámbrico |
| `/Users/benjamin/Library/Android/sdk/platform-tools/adb devices -l` | Lista vacía |
| `git diff --check` en Flutter | OK, exit 0 |
| Comparación SHA-256 de `lib`, `test`, `docs`, `tool`, AGENTS y pubspec antes/después | 630 archivos; cero archivos nuevos, modificados o eliminados en Flutter durante esta revisión |

La suite completa mantiene el fallo de Inventario ya registrado:
`inventory_management_screen_test.dart`, «busca con debounce y conserva búsqueda
y filtros al cambiar de pestaña», no encuentra `clear_article_search_button`.
Coincide con los logs de sesión 1 y de reproducción en HEAD original. No se
corrigió ese flujo ajeno al alcance. Caja, Artículos y el editor forman parte
de la suite ejecutada, sin nuevos fallos registrados.

### Archivos propios y siguiente paso

Solo se actualizó este documento y se añadieron los logs en
`Evidencia/2026-10-04-revision-prerequisito-sesion-2/`: `dart-analyze.log`,
`pruebas-focalizadas.log`, `suite-completa.log`, `dispositivos.log`,
`git-diff-check.log` y `conservacion-flutter.log`. Los cambios existentes en
Flutter y las demás notas se conservaron. No hubo cambios de código, esquema,
servidor ni sincronización; no correspondía regenerar Drift.

1. Continuar sesión 1 cuando haya Android físico: registrar modelo/versión,
   formato, valor detectado y cantidades para E04 (20 s inmóvil y variaciones
   de enfoque/luz), E05 (tres retiradas/reapariciones) y E06 (A → B → A), más
   área, pausa/regreso y EAN-13/EAN-8/UPC-A disponibles. La evidencia física
   continúa **pendiente**, no aprobada.
2. Si la estrategia temporal falla, evaluar la adaptación versionada de
   presencia/ausencia prevista en el plan dentro de sesión 1, antes de conectar
   Caja. Sin fallos físicos observados, no se eligió una adaptación especulativa.
3. Solo tras cerrar ese requisito, retomar la pantalla e integración solicitadas
   en sesión 2. Mantener sesión 3 sin iniciar y conservar el fallo de Inventario
   como pendiente de su propio alcance.

## Actualización del plan a revisión 2 del 2026-10-04

Se retiró el requisito físico previo en el plan, los prompts de sesiones y la
guía del prototipo Flutter. Se explicitó el lector existente como referencia
de integración y se actualizó el comentario de `BarcodeReadGate` para evitar
que una sesión futura interprete el pendiente físico como bloqueo de Caja.

No se cambió comportamiento de la app ni se ejecutó sesión 2 en esta actualización.
Las evidencias anteriores se conservan; ninguna prueba física pendiente pasó
a aprobada. No se modificaron servidor, esquema, sincronización ni resultados
históricos de pruebas. Los casos físicos permanecen en la matriz de verificación.

## Implementación de sesión 2 del 2026-10-04

Se completó la integración conforme a la revisión 2 y a la instrucción vigente
del usuario. Se leyeron los AGENTS de Flutter y del análisis, las guías offline,
el plan, el estado y la sesión 2. Flutter conserva HEAD `65c07bc` y los cambios
previos de sesión 1; también se conservaron las notas ajenas del vault. No se
desplegó, no se inició sesión 3 y no se ejecutó ninguna prueba física.

### Funcionamiento entregado

- Los dos botones de Caja usan `Icons.barcode_reader`, tooltip «Escanear código
  de barras» y el mismo método/ruta. La apertura se protege de dobles toques.
  `ArticleSearchBar.onScanBarcode` es opcional; Artículos no lo proporciona y
  conserva su lector deshabilitado y su búsqueda textual.
- `SaleBarcodeScannerScreen` mantiene la cámara arriba, marco y guía horizontal,
  tarjetas desplazables debajo, total y «Ir a caja (N artículos)». El diseño
  adapta las columnas al ancho y al texto ampliado. La venta vacía no crea un
  borrador y mantiene disponible cerrar.
- La pantalla observa `SaleDraftRepository.watchCurrentDraft()` y formatea con
  `SaleDraftDisplay`. Incluye las líneas agregadas antes de abrir, sus nombres,
  variantes, precios, cantidades y totales persistidos. Hay una tarjeta por
  línea; precios y unidades diferentes no se fusionan. El contador mantiene
  `articleCount` (variantes distintas), sin confundirlo con piezas o medidas.
- Una coincidencia activa única agrega una pieza por
  `VentaBorradorCommandService.agregar` y `AgregarProductoBorradorCommand`.
  Un barcode compartido abre `BarcodeProductSelectionDialog`, con producto,
  variante y precio. La venta medida reutiliza `SaleQuantityDialog` y envía
  `expectedUnitId`; el comando revalida la disponibilidad y la unidad.
- Desconocidos, incompatibles, varios códigos en el marco y fallos reciben
  avisos controlados. Cancelar selección/cantidad no escribe. No hay tarjetas
  ni cantidades optimistas, alta de productos ni enlace de códigos desconocidos.
- Se reutilizan la consulta exacta y `BarcodeReadGate`. El manejo de cámara se
  basa en `BarcodeScannerScreen` del editor y el prototipo de sesión 1:
  `autoStart: false`, `DetectionSpeed.normal`, 200 ms, formatos numéricos y
  `scanWindow` nativo. Inicio/parada/dispose quedan encadenados, incluidos
  permisos pendientes. Diálogos, rutas cubiertas y segundo plano suspenden
  cámara y compuerta; la pausa no se interpreta como retirada.
- Consulta, selector, cantidad y guardado forman una sola operación. Se observa
  presencia durante consulta/guardado, consumiendo la presentación antes de
  procesarla incluso si se cancela o falla. Los callbacks de una ruta cerrada
  se descartan. Todo regreso del sistema pasa por el cierre que espera la
  operación iniciada; lo confirmado queda en el mismo borrador de Caja.
  Caja conserva la compuerta al reabrir para no acreditar una retirada por cerrar.
- El lector del editor conserva su contrato `String?` y su implementación.
  No se modificaron application/commands, handlers, payloads, repositorios,
  esquema, dependencias, servidor, sincronización ni cobro en esta sesión.

### Archivos propios de sesión 2

En Flutter:

- `lib/presentation/pages/caja/sale_barcode_scanner_screen.dart` (nuevo).
- `lib/presentation/pages/caja/barcode/barcode_product_selection_dialog.dart` (nuevo).
- `lib/presentation/pages/caja/caja_screen.dart`.
- `lib/presentation/widgets/article_search_bar.dart`.
- `test/presentation/pages/caja/sale_barcode_scanner_screen_test.dart` (nuevo).
- `test/presentation/pages/caja/caja_screen_test.dart` (expectativa de ambos accesos habilitados).
- `AGENTS.md` (estado vigente de Caja y Artículos).

En el vault: este documento, el estado del frontmatter de
`Plan de implementacion.md` y los logs en `Evidencia/2026-10-04-sesion-2/`.
Los archivos previos de consulta/compuerta/prototipo y sus pruebas se reutilizaron
sin modificarlos. No hubo cambios de tablas ni entradas de generación en sesión
2; no correspondía ejecutar `dart run build_runner build`.

### Comandos y resultados

| Comando | Resultado |
|---|---|
| `dart format` sobre los archivos Dart propios | OK |
| `dart analyze` | OK, `No issues found!`, exit 0 |
| `flutter test test/data/repositories/producto_codigo_barras_test.dart test/presentation/pages/caja test/presentation/pages/articulos test/presentation/pages/gestion_inventario/articulos/variant_editor_barcode_test.dart --reporter expanded` | 151 aprobadas, exit 0 |
| `flutter test --reporter expanded` | 1116 aprobadas, 1 omitida, 1 fallo previo de Inventario, exit 1; 54 s |
| `git diff --check` en Flutter y en los documentos propios del vault | OK |

Las **30 pruebas nuevas** usan `FakeMobileScannerPlatform` con el widget y el
controller reales, SQLite en memoria, consulta del catálogo, comando, evento,
handler, proyección y repositorio reales. Las envolturas de prueba únicamente
controlan demora/fallo de consulta o comando; no sustituyen el flujo exitoso.
El arnés desmonta los widgets y drena la cancelación de watches antes de cerrar
Drift, evitando temporizadores pendientes en la verificación de Flutter.

Se verificaron ambos accesos, venta vacía/previa, normalización, callbacks
duplicados, 20 s de observaciones positivas, tres presentaciones con silencio
simulado y A → B → A, selector/cantidad y cancelaciones, errores, inactivos,
unidad cambiada durante el diálogo, consulta/guardado lentos, cierre por botón
y regreso del sistema, consulta descartada al cerrar, callbacks antiguos,
segundo plano/ruta cubierta, detección interrumpida, permiso denegado/cámara
ausente/permiso pendiente, reapertura, snapshots con precios/unidades distintos
y layouts 320×640 con texto ×2, 740×360 con texto ×1,3 y 1280×800.

La integración en ambos modos conserva un único borrador: con venta previa y
A → B → A termina en A ×3 y B ×1, total 550 centavos, cuatro eventos
`not_required`, cero refs en `standalone` y 16 en `server_sync`. Selección seguida
de cantidad medida también se prueba en ambos modos: un evento `not_required`,
cero refs en standalone y cinco refs en server_sync (incluida la unidad).
No hay eventos pendientes ni movimientos de inventario.

Las pruebas existentes de Artículos verifican que el control sigue inerte y
que el buscador manual conserva su comportamiento. Las del editor verifican
`String?`, cancelación, validación, captura, segundo plano y liberación con
permiso pendiente. Forman parte de las 151 de regresión y de la suite completa.

El único fallo global permanece en
`test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`,
«busca con debounce y conserva búsqueda y filtros al cambiar de pestaña»:
no encuentra `clear_article_search_button`. Coincide con la evidencia anterior
y la reproducción de sesión 1 en una copia limpia de HEAD `65c07bc`; no se
repitió esa copia ni se corrigió la búsqueda de Inventario en esta sesión.
**No quedaron fallos propios del escaneo en Caja.**

Logs guardados: `dart-analyze.log`, `pruebas-regresion.log`,
`suite-completa.log` y `git-diff-check.log`.

### Pendientes y límites

1. Prueba física E04/E05/E06: código inmóvil 20 s, pequeñas variaciones de
   luz/enfoque, tres retiradas/reapariciones y A → B → A. La compuerta conserva
   el umbral de 1 s de observaciones positivas; un intervalo sin lecturas puede
   ser retirada o desenfoque. Los tests simulan el reloj y **no demuestran**
   retirada física ni calibración del umbral.
2. Verificar área de detección, EAN-13/EAN-8/UPC-A y ceros iniciales, permisos
   reales, segundo plano/diálogos/regreso y liberación en dispositivos. Registrar
   modelo, sistema operativo, formato, valor detectado y cantidades. No se
   declara paridad nativa Android/iOS/macOS por usar el fake.
3. Compilación integrada y verificación/cierre de sesión 3 quedan sin ejecutar
   en esta sesión; la compilación del prototipo de sesión 1 es evidencia histórica,
   no de esta pantalla. No avanzar automáticamente ni desplegar.
4. El fallo previo de Inventario permanece pendiente de su propio alcance.

La integración de sesión 2 está completa: los pendientes físicos no dejan los
botones de Caja inertes ni reintroducen el requisito revocado por revisión 2.

## Verificación y cierre de sesión 3 del 2026-10-04

**Implementación completada e integrada. Verificación automatizada y compilación
Android completadas. Verificación física pendiente.** Ambos accesos de Caja
permanecen habilitados conforme a la revisión 2. No se desplegó ni publicó.

Se leyeron AGENTS vigentes, las dos guías offline de Flutter, el plan revisión 2,
este seguimiento y las sesiones 1, 2 y 3. Se contrastaron los archivos y pruebas
reales con los logs anteriores; no se asumió la finalización por el seguimiento.
Flutter permanece en `main`, HEAD `65c07bc393ef723c38b74c0b0928136f44bb426a`,
con los cambios anteriores sin commit conservados. Se conservaron también las
notas ajenas del vault. Esta sesión no modificó servidor, esquema, dependencias,
comandos de negocio, contratos de eventos, sincronización ni cobro.

### Correcciones realizadas

- **Consulta interrumpida:** una consulta iniciada antes de pasar a segundo
  plano o cubrir el lector con otra ruta podía agregar al terminar, incluso
  después de regresar. Tres tests nuevos reprodujeron el defecto antes de la
  corrección (`regresion-ciclo-vida-antes.log`). Ahora se invalida esa lectura y
  se descarta su resultado; reanudar no admite el mismo código consumido. Un
  guardado ya iniciado conserva exactamente un commit. Los diálogos propios
  siguen requiriendo confirmación explícita y permiten confirmar cantidad al
  volver, sin sumar por la reanudación.
- **Rotación con texto ampliado:** 320×640 → 640×320, texto ×2 y aviso de código
  desconocido producía un overflow de 40 px (`rotacion-antes.log`). Con poco
  alto, cámara, aviso y tarjetas comparten un desplazamiento; total y regreso
  siguen accesibles en el pie. Las tarjetas de ese modo se adaptan al contenido
  sin un segundo desplazamiento activo. El test final comprueba también que
  la cantidad puede hacerse visible y recibir interacción.

### Archivos propios de sesión 3

En Flutter:

- `lib/presentation/pages/caja/sale_barcode_scanner_screen.dart`: invalidación
  de consultas interrumpidas y distribución compacta desplazable.
- `test/presentation/pages/caja/sale_barcode_scanner_screen_test.dart`: **16
  tests nuevos**, 46 en total. Incluyen interrupciones, confirmación tras pausa,
  cancelación con venta previa, rollback SQLite, validación/declaración de refs,
  A×2/B×2 y reapertura del archivo, callbacks de formatos numéricos y rotación.
- `test/presentation/pages/caja/barcode/barcode_draft_flow_test.dart`: los dos
  tests usan ahora archivo temporal y `AppDatabase()` de producción, incluido
  su executor en otro isolate y `_resetDatabaseOnStartup`. Verifican A→B→A
  (A×2/B×1, 300 centavos), rearmado posterior, refs persistidas con identidades,
  relaciones/origen correctos y conservación después de cerrar y abrir la base.

En el vault: este documento, el estado y resumen vigente de
`Plan de implementacion.md`, y `Evidencia/2026-10-04-sesion-3/`.

La plataforma falsa reemplaza únicamente la cámara. Consulta, command service,
event store, contrato tipado, handler, proyección, repositorio y watch son reales.
El observador de `LocalEventStore` en widgets solo registra las refs entregadas
y delega íntegramente al store Drift. El fallo de persistencia se inyecta con un
trigger de SQLite temporal: se prueba el rollback dentro del flujo real, además
de las demoras y errores controlados de UI.

El reinicio de widgets recrea pantalla, repositorios y conexión a un archivo
SQLite temporal mediante `NativeDatabase`. El arranque completo del adaptador
de producción y su executor se ejecuta en los tests de flujo fuera del reloj
simulado de widgets. Los ensayos intermedios del arnés que usaban ese executor
dentro de `testWidgets` se interrumpieron/ajustaron y no cuentan como aprobados.
No se abrió ni modificó ninguna base de uso.

### Comandos y evidencia final

Entorno: Flutter 3.41.6, Dart 3.11.4, `mobile_scanner` 7.4.2; host macOS arm64.

| Comando | Resultado ejecutado | Log |
|---|---|---|
| `dart format` sobre los tres Dart propios | OK | Salida de herramientas de sesión |
| `dart analyze` | `No issues found!`, exit 0 | `dart-analyze.log` |
| `flutter test test/presentation/pages/caja/sale_barcode_scanner_screen_test.dart --reporter expanded` | 46 aprobadas, exit 0 | `widgets-final.log` |
| `flutter test test/data/repositories/producto_codigo_barras_test.dart test/presentation/pages/caja test/presentation/pages/articulos test/presentation/pages/gestion_inventario/articulos/variant_editor_barcode_test.dart test/application/commands/ventas/venta_borrador_command_service_test.dart test/application/commands/ventas/venta_command_service_test.dart --reporter expanded` | 248 aprobadas, exit 0; 22 s | `pruebas-regresion.log` |
| `flutter test test/presentation/pages/caja/barcode/barcode_draft_flow_test.dart --reporter expanded` | 2 aprobadas con arranque/reinicio de producción y comprobación explícita de refs y A→B→A, exit 0 | `flujo-executor-produccion.log` |
| `flutter test --reporter expanded` | 1132 aprobadas, 1 omitida, 1 fallo previo ajeno, exit 1; 59 s | `suite-completa.log` |
| `flutter build apk --debug -t lib/main.dart` | OK, exit 0; 13,4 s. **Aplicación principal integrada**, no entrada del prototipo | `compilacion-android.log` |
| `git archive HEAD` en directorio temporal; `flutter pub get --offline`; test aislado de Inventario en esa copia | Reproduce el mismo fallo previo, exit 1 | `fallo-head-original.log` |
| `flutter devices`; `adb devices -l` | Sin teléfono físico conectado ni dispositivo inalámbrico | `dispositivos.log` |
| `git diff --check` y revisión de imports/referencias con `rg` | OK; sin código propio muerto ni placeholders | `git-diff-check.log` |

APK: `build/app/outputs/flutter-apk/app-debug.apk`, SHA-256
`669594f6e49e367bc3423a3d689b6972b267430060d73de7c84433f8d72af5f1`.
No se instaló, distribuyó ni publicó. No cambiaron tablas, DAO ni entradas
generadas en esta sesión; no correspondía repetir `build_runner`. El generado
Drift, `schemaVersion`, dependencias y lector del editor no presentan cambios.

El único fallo global es «busca con debounce y conserva búsqueda y filtros al
cambiar de pestaña» en
`test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`:
no encuentra `clear_article_search_button`. La copia limpia del HEAD original
reproduce el mismo error; ambos `pubspec.lock` tienen SHA-1
`5155be754c0ebbc6d57b8c20921ddb683936f931`. No se corrigió Inventario en este
alcance. La prueba omitida es la integración remota de seguimiento de existencias
que requiere `POS_PHASE3_SYNC_URL`; no pertenece al lector y no se ejecutó.
**No quedan fallos propios del escaneo en las verificaciones finales.**

### Matriz E01–E20 ejecutada

«Automatizado OK» describe únicamente las comprobaciones ejecutadas en tests.
Ninguna fila marcada como física pendiente cuenta como aprobación nativa.

| ID | Evidencia automatizada ejecutada | Estado físico/nativo |
|---|---|---|
| E01 | Ambos accesos abren `SaleBarcodeScannerScreen`, un controller/cámara; dos iconos `barcode_reader` en Caja | Pendiente en teléfono |
| E02 | Apertura vacía no crea sales/events/refs; venta previa y nuevos artículos se muestran desde `watchCurrentDraft` real | Pendiente en teléfono |
| E03 | Coincidencia activa única pasa por comando/evento/proyección reales; tarjeta e importe después del commit | Pendiente en teléfono |
| E04 | 100 observaciones positivas simuladas durante 20 s: una incorporación; sin temporizador de sumas | **Pendientes 20 s inmóvil y variaciones de luz/enfoque reales** |
| E05 | Tres presentaciones con silencio simulado de 1100 ms: cantidad 3; no se emiten capturas vacías artificiales | **Pendiente retirada/reaparición física** |
| E06 | A→B→A desde vacío: A×2/B×1, 300 centavos; con A previa: A×3/B×1 y 550 centavos | Pendiente secuencia física |
| E07 | Ráfagas, consulta/guardado lento y observación durante operación: una acción por presentación, sin cola ni duplicación | Pendiente con detector nativo |
| E08 | Desconocido, inválido e inactivos: avisos y cero escrituras; igualdad textual y normalización probadas con SQLite temporal | Pendiente detección nativa |
| E09 | Barcode compartido: selector con nombres/variantes/precios; una selección agrega una variante; cancelar conserva incluso venta previa | Pendiente en teléfono |
| E10 | Captura de dos códigos no elige por orden; pide enfocar uno; `scanWindow` nativo configurado | Pendiente comprobar área real |
| E11 | Cantidad medida, conversión atómica, unidad esperada, cancelación y unidad cambiada/inactiva: flujo real sin tarjetas optimistas | Pendiente en teléfono |
| E12 | Callbacks etiquetados EAN-13, EAN-8 y UPC-A conservan texto/ceros; consulta exacta y editor conservan `012345678905` | **Pendiente decodificación nativa de los tres formatos y comparación editor/Caja** |
| E13 | Precio y unidad distintos mantienen snapshots/líneas/tarjetas separados y contador de variantes coherente | Pendiente en teléfono |
| E14 | Consulta/guardado fallidos y variante desactivada; trigger SQLite aborta proyección y revierte venta/eventos/refs; recuperación sin doble intento | Pendiente en teléfono |
| E15 | Cierre y regreso del sistema esperan guardado; callbacks viejos descartados; reapertura y archivo reconectado conservan líneas/cantidades/importes. A×2/B×2: dos artículos, cuatro unidades, 700 centavos en Caja y tras reinicio | **Pendiente reproducción física del video y reinicio de proceso/app en dispositivo** |
| E16 | Plataforma falsa: denegado, cámara ausente, permiso pendiente al cerrar; regreso visible y start/stop/dispose serializados | **Pendientes permisos y liberación reales del sistema** |
| E17 | Pausa, diálogo, ruta cubierta y reapertura no acreditan retirada; consultas interrumpidas descartadas; guardado iniciado se confirma una vez; cantidad tras pausa requiere acción explícita | **Pendiente ciclo de vida nativo con etiqueta delante** |
| E18 | Ambos modos con SQLite real: borradores `not_required`, refs declaradas/validadas y persistencia según modo; runtime standalone no instancia monitor sync en regresión existente | Comportamiento local verificado; ejecución offline nativa pendiente |
| E19 | 320×640 texto ×2; rotación a 640×320 texto ×2; 740×360 texto ×1,3; 1280×800. Sin overflow y tarjetas/total/regreso accesibles | Pendiente distribución y uso en teléfono/tablet reales |
| E20 | Regresión de editor `String?`, null/cancelación, primera lectura, ceros, permisos/ciclo de vida; Artículos conserva lector inerte y búsqueda textual; comandos/cobro existentes pasan | Pendiente comparación de cámaras nativas; fallo previo de búsqueda de Inventario documentado aparte |

### Flujo local y limpieza

Se observó la declaración de refs de venta/línea/producto/variante en **ambos
modos** y unidad en venta medida. Una identidad de producto vacía se rechaza
antes de llamar al event store y antes de escribir, también en standalone.
Las cuatro incorporaciones producen cuatro eventos `not_required`, cero refs
en standalone y 16 en server_sync. La incorporación medida produce cinco refs
en server_sync, incluida la unidad; standalone mantiene cero. Se comprueban
IDs, relaciones y origen `local_pending` de las refs persistidas. No hay eventos
de borrador pendientes ni movimientos de inventario. Cambiar configuración a
server_sync después del reinicio no promueve los eventos de borrador ni
reconstruye referencias históricas de standalone.

Se revisó `startConfiguredRuntimeServices`: standalone no instancia el monitor
de health/push/pull/preflight/WebSocket. La regresión existente de arranque y
venta standalone pasa con una fábrica de monitor que fallaría al instanciarse.
El lector solo consulta/agrega por los puertos actuales y no incorpora servicios
de transporte ni escrituras Drift desde UI.

Se revisaron imports, clases/helpers, consumidores y diferencias con HEAD.
El prototipo `BarcodeReadProbeScreen`, `tool/barcode_read_probe.dart` y su guía
siguen teniendo uso como diagnóstico solicitado y con pruebas propias; no son
placeholders ni el flujo utilizado para compilar la aplicación principal.
Se conservaron todos los cambios previos de fases 1/2 y los ajenos del vault.

### Estrategia final y pruebas físicas pendientes

Se conserva `DetectionSpeed.normal`, observación cada 200 ms y compuerta de
**1 segundo** de ausencia de observaciones positivas con cámara activa. Otro
código único delimita una presentación; el mismo se readmite solo en una nueva
observación tras ese silencio. Diálogos/pausas/rutas/reapertura conservan el
código consumido y no acreditan retirada. Se consume antes de consultar y no
se rearma por cancelar/fallar. No hubo cambios de dependencia ni `.pub-cache`.

**Límite pendiente de prueba real:** un desenfoque de al menos 1 segundo puede
parecer retirada. Los tests de reloj no prueban retirada física ni calibran el
umbral. No se declara paridad nativa Android/iOS/macOS.

Inventario de dispositivos ejecutado: iPhone 17 con iOS 26.4 **simulador**,
macOS 27.0.1 (26A434) y Chrome 154; `adb devices -l` vacío y sin inalámbricos.
No hubo teléfono físico disponible. No se ejecutó cámara nativa ni se atribuye
un modelo/sistema/formato físico a los callbacks simulados.

1. En un teléfono físico, registrar modelo, sistema/versión y formato/valor
   detectado. A dos veces retirando/presentando, B dos veces de la misma forma;
   volver a Caja y comprobar dos artículos/cuatro unidades y total según precios.
   Comparar también después de cerrar/reabrir y reiniciar la app.
2. Mantener código inmóvil 20 s, variar ligeramente luz/enfoque, tres retiradas
   del mismo código y A→B→A. Registrar tiempos y cantidades antes/después.
   Si hay sumas extra o bloqueo de relecturas, corregir desde esa evidencia y
   evaluar una adaptación versionada solo si hace falta.
3. Probar marco con una/dos etiquetas, desconocido, selector/cancelación,
   cantidad medida/cancelación y guardado lento/error; verificar permisos
   denegados/pendientes, segundo plano, diálogos y liberación de cámara.
4. Probar EAN-13/EAN-8/UPC-A disponibles, incluidos ceros iniciales, en Caja y
   editor. Registrar valor textual sin convertirlo a número ni ajustar ceros.
5. Verificar teléfono pequeño, tablet, ambas orientaciones y texto ampliado
   con cámaras reales. Android/iOS/macOS requieren evidencia propia.
6. El fallo previo de búsqueda de Inventario permanece para su alcance propio.

No hay trabajo funcional ni compilación pendiente en este alcance. Las pruebas
físicas continúan pendientes, sin desactivar botones ni revertir la integración.


## Lector físico de Caja y verificación de escritorio — 2026-10-10

La implementación del modo HID se documenta en
[[08 - Roadmap/Lector fisico en caja/Plan de implementacion|Lector físico en Caja, revisión 4]].
Sus fases 1/2 reutilizan `SaleBarcodeReadCoordinator`, el borrador observado,
comandos y eventos actuales. El modo de macOS/Windows empieza desactivado,
usa campo dedicado y Enter, FIFO de lecturas completas y barreras antes de
cámara, búsqueda, cobro, limpieza, cotización y navegación. La cámara conserva
su compuerta; el editor conserva `String?`; Artículos conserva su acceso de
cámara deshabilitado. No se añadieron tablas, dependencias ni transporte remoto.

La fase 3 tiene **cierre parcial**. `dart analyze` limpio, suite actual con
1766 aprobadas/10 omitidas/0 fallidas y `flutter build macos --debug` aprobado.
Se ejercitó la app principal macOS en un bundle/sandbox/base de prueba separados,
con entrada simulada y capturas SQLite. Incluye apertura/cierre de la ruta de
cámara y conservación del mismo borrador, sin presentar etiquetas ni acreditar
formatos, permisos interactivos o retirada/enfoque. El preview observado fue negro;
el log registra inicialización/captura y parada. No se altera la historia ni se
convierte esa navegación en aprobación de la matriz física E01–E20 anterior.

El usuario confirmó que no hay lector real ni equipo Windows: compilación/app
Windows, HID/sufijo Enter, modelo/configuración, repeticiones rápidas físicas,
foco y desconexión/reconexión quedan pendientes, con USB/Bluetooth separados.
Drenaje/descarte con consultas/comandos retenidos pasa en tests; el escenario
retenido nativo y el contraste manual de pegado continúan identificados en la
matriz. Evidencia completa: [[08 - Roadmap/Lector fisico en caja/Verificacion fase 3|Verificación de fase 3 del lector físico]].

**Limitación HID vigente:** pausar el modo evita agregados desde el lector,
pero un dispositivo en modo teclado puede escribir en otro campo enfocado,
incluidos cantidad o efectivo. La app no distingue su origen ni bloquea el
teclado físicamente. Los pendientes de cámara real anteriores se conservan.
