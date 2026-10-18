---
tipo: seguimiento_implementacion
estado: fase_4_verificacion_automatizada_completa_fisica_pendiente
revision_plan: 1
actualizado: 2026-10-09
---

# Estado y continuidad: impresión de tickets

## Planificación del 2026-10-08

Solicitud: preparar un plan para imprimir directamente desde el POS Android,
admitiendo varias impresoras. Las pruebas iniciales usarán la térmica Bluetooth
de 58 mm que ya funciona con apps externas en el Android del usuario.

Plan vigente: [[08 - Roadmap/Impresion de tickets/Plan de implementacion|Plan de implementación, revisión 1]].

Se inspeccionaron pantallas, modelos de ticket, configuración, DI, dependencias,
permisos Android y pruebas existentes del proyecto Flutter real. Se consultaron
metadatos y documentación primaria de las dependencias y la ficha comercial.
Solo se creó/actualizó documentación de análisis; no se implementó impresión,
no se modificó código Flutter/NestJS, no se instaló una librería y no se imprimió.

## Estado por fase

| Fase | Estado | Evidencia |
|---|---|---|
| Planificación | Completa | Plan rev. 1, sesiones y referencias al código real |
| 1. Conexión y contratos | Implementación y verificación automatizada completas; física pendiente | Puente Android local 0.1.0, contratos, exclusión, 42 tests Dart nuevos y 10 JVM; APK y macOS debug compilan |
| 2. Configuración de impresoras | Implementación y verificación automatizada completas; física pendiente | Archivo versionado, controlador, UI en ambos modos, prueba global, 35 tests nuevos; 1645 tests pasan |
| 3. Tickets e integración | Implementación y verificación automatizada completas; física pendiente | Renderer 58/80 mm por bandas, tres comandos de imagen, selector compartido y snapshots; 34 tests nuevos, 1679 pasan |
| 4. Verificación y cierre | Verificación automatizada completa; incidencia física abierta, revalidación pendiente | Matriz I01–I25, dos defectos corregidos y ajuste de transmisión tras foto; 1681 Dart y 15 JVM pasan; APK/macOS debug actuales compilan; ningún modelo certificado |

## Hechos y decisiones de partida

1. Primera plataforma: Android; múltiples perfiles Bluetooth ESC/POS y una
   impresora por envío. Transporte SPP candidato, pendiente de verificar en el
   equipo inicial. USB/red/BLE genérico y comandas no forman parte del alcance.
2. 58/80 mm, selección explícita y predeterminada por instalación. Dirección y
   parámetros nunca fijos en el código. Los 80 mm siguen sin prueba física.
3. Ventas/cotizaciones usan el documento visible correspondiente; reimpresión
   manual, sin reintentos automáticos ni eventos nuevos de negocio.
4. Impresión local en ambos modos; en standalone no activar servicios de sync.
5. Flutter 3.41.6 / Dart 3.11.4, HEAD `56ddbc4`, con cambios locales ajenos.
   La versión 1.2.5 de `print_bluetooth_thermal` exige Flutter >=3.44.0.
   Evaluar 1.2.1 exacta y sus límites de permisos/finalización, o la alternativa
   documentada, antes de seleccionar una única dependencia.
6. El Mac registra `BlueTooth Printer` / `5A:4A:C6:68:99:9D` como desconectada.
   `adb devices -l` no muestra Android conectado. Estos datos no certifican
   fabricante, transporte, ancho de cabeza ni compatibilidad de impresión.

## Fase 1 implementada el 2026-10-08

### Base y alcance conservados

Se leyeron los AGENTS de Flutter y análisis y los tres documentos solicitados.
Al comenzar, Flutter estaba en `main`, HEAD `fe509f6`, **working tree limpio**;
los cambios ajenos descritos al planificar ya estaban integrados en ese commit.
El vault de análisis conserva sus cambios locales previos: solo se editó este
archivo de continuidad en esta sesión.

Versiones ejecutadas/inspeccionadas: Flutter **3.41.6**, Dart **3.11.4**,
Gradle **8.14** (`./gradlew --version`), AGP **8.11.1** y Kotlin del plugin
Android **2.2.20** (`android/settings.gradle.kts`). El Kotlin **2.0.21** que muestra
`gradlew --version` corresponde al runtime de Gradle; no reemplaza la versión
del plugin Kotlin de la app. Java del launcher/daemon: **21.0.11**; bytecode
Java/Kotlin: **17**. APK combinado: minSdk **24**, targetSdk **36**.
No se actualizaron SDK, Gradle, AGP, Kotlin ni dependencias ajenas.

No se modificaron Drift, eventos, `event_refs`, negocio, sincronización, NestJS
ni PostgreSQL. No se ejecutó build_runner. Ventas y cotizaciones conservan sus
botones Imprimir deshabilitados y los flujos de compartir. No se creó pantalla,
almacenamiento de impresoras, renderer térmico ni integración de tickets.

### Elección de dependencia y evaluación nativa

Se descargaron e inspeccionaron **los archivos publicados exactos**, fuera de
`.pub-cache`, antes de decidir. No se instalaron los candidatos descartados.

| Candidato | Resultado de inspección |
|---|---|
| `print_bluetooth_thermal` **1.2.1** | Compatible por restricciones de SDK (Flutter >=3.19), pero su Kotlin retorna sin responder cuando falta CONNECT; `writebytes` escribe/flush en el hilo principal; conserva solo OutputStream, sin propiedad ni barrera de cierre del BluetoothSocket. No cumple permiso revocado, llamada bloqueada y cierre verificable. |
| `flutter_bluetooth_printer` **2.24.0** | Compatible por restricciones de SDK (Flutter >=3.16), pero `connect` en Dart depende de discovery; Android inicia descubrimiento y solicita ubicación en API antiguas. Conexión/escritura/desconexión comparten `synchronized`, de modo que cerrar espera una escritura bloqueada. No cumple el flujo de vinculados ni cancelación requerida. |
| `pos_bluetooth_printer` **0.1.0**, dependencia local por path y versión exacta | **Elegida**, aplicando el puente Android mínimo autorizado por el plan cuando ninguno cumple. Código propio revisable en `packages/pos_bluetooth_printer`; una sola implementación nativa activa, sin paquetes de impresión descartados en pubspec/lock. |

`pubspec.lock` conserva las versiones ajenas e incorpora únicamente el paquete
local; la restricción Flutter del lock pasa a >=3.41.6 por el mínimo declarado
por ese paquete. No se editó `.pub-cache`. La 1.2.5 no se instaló por la
incompatibilidad Flutter >=3.44 descrita en el plan.

Referencias primarias de los archivos inspeccionados:
[archivo de 1.2.1](https://pub.dev/api/archives/print_bluetooth_thermal-1.2.1.tar.gz),
[archivo de 2.24.0](https://pub.dev/api/archives/flutter_bluetooth_printer-2.24.0.tar.gz),
[permisos Bluetooth Android](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions)
y [BluetoothSocket/cierre desde otro hilo](https://developer.android.com/reference/android/bluetooth/BluetoothSocket).

### Implementación y garantías

- `PrinterProfile` inmutable: dirección validada/normalizada, alias, papel
  58/80 mm, ancho en puntos, método de imagen y corte desactivado por defecto.
  `PrinterSettings` admite varios destinos con direcciones únicas y una
  predeterminada válida; no selecciona otra impresora silenciosamente.
- `PrinterGateway` y resultados/errores tipados cubren disponibilidad, estado y
  solicitud de permiso, dispositivos vinculados, conexión, escritura y cierre.
  **Application es Dart puro**, sin Flutter, plugins, data ni presentation.
- `TicketPrintService` se registra como singleton compartido, independiente del
  modo. `printTest(profile)` y `send(profile: ..., bytes: ...)` capturan destino
  y bytes; una operación activa, rechazo inmediato de concurrencia y cero cola
  o reintentos de impresión. Los futuros consumidores deben usar esa instancia.
- El puente Android usa RFCOMM/SPP seguro, UUID estándar; lista solo vinculados,
  no realiza discovery, no activa Bluetooth y no conecta/solicita permisos al
  registrar el plugin, arrancar la app o crear DI. No hay dirección de equipo
  fija en producción. El mismo nombre Bluetooth no determina la identidad.
- Conexión/escritura van a un worker. Se escribe el snapshot por bloques de
  transporte de 1024 bytes, con pausa inicial de 20 ms entre bloques y un flush
  final. No se agregan bytes ni reenvían bloques. Esos parámetros requieren
  calibración real; no equivalen al renderer/encoder de fase 3.
- El permiso se revisa antes de vinculados/conexión y cada bloque. Se distinguen
  no hardware, apagado, denegado/permanente, revocación, equipo ausente, fallo de
  conexión/escritura/cierre, ocupado, timeout y plataforma no soportada.
- Plazos nativos: permiso 30 s, conexión 10 s, escritura 20 s. Al vencer I/O,
  otro executor cierra el socket para abortar; **close no completa hasta que
  también termina el worker y el executor de cierre**. Un socket creado tarde
  durante un cierre no puede conectar/escribir ni escapar de la limpieza.
- Plazos en application: permisos/listados 35 s, conexión 15 s, escritura 30 s,
  cierre 10 s. `Future.timeout` informa al llamador y conserva la propiedad del
  future original: permanece ocupado hasta finalización y limpieza reales.
  Una conexión tardía no continúa con escritura. Cierre tardío exitoso libera;
  cierre fallido mantiene cuarentena. Un driver que siga bloqueado deja la app
  ocupada; no se promete recuperación acotada en ese caso.
- `dispose` deja de aceptar envíos y espera operación/cierre. El reinicio de DI
  lo espera **antes** de `getIt.reset(dispose: false)`; fallo de cierre detiene
  el reset y conserva gateway/servicio anteriores. No se interpreta reset como
  cancelación nativa. Las rutas de UI aún no participan en impresión.
- Prueba mínima reutilizable: ESC/POS ASCII con inicialización, alias sanitizado,
  dirección capturada, papel/ancho y avance final. No manda corte ni cajón.
  Los caracteres españoles como raster y la prueba de márgenes siguen pendientes
  de fases siguientes. `sent` significa escritura de bytes; `mayHavePrinted`
  advierte incertidumbre tras iniciar write. No confirma papel ni salida física.

### Archivos propios modificados/agregados

Todas las rutas de código siguientes pertenecen a
`/Users/benjamin/Projects/POS/pos_flutter`:

| Archivos | Cambio |
|---|---|
| `pubspec.yaml`, `pubspec.lock` | Única dependencia local `pos_bluetooth_printer: 0.1.0` |
| `android/app/src/main/AndroidManifest.xml` | CONNECT, Bluetooth legado hasta SDK 30 y hardware opcional |
| `lib/core/di/data_dependencies.dart`, `application_dependencies.dart`, `injection.dart` | Gateway/servicio compartidos y cierre previo a reinicio |
| `lib/application/printing/printer_profile.dart`, `printer_settings.dart`, `printer_device.dart` | Modelos de compatibilidad/destinos, sin persistencia |
| `lib/application/printing/printer_exception.dart`, `printer_gateway.dart`, `ticket_print_result.dart` | Contratos y resultados tipados |
| `lib/application/printing/printer_test_payload.dart`, `ticket_print_service.dart` | Prueba mínima, snapshot, exclusión y finalización |
| `lib/data/printing/android_bluetooth_printer_gateway.dart` | Único adaptador, canal/errores y protección de plataformas |
| `packages/pos_bluetooth_printer/pubspec.yaml`, `README.md`, `lib/pos_bluetooth_printer.dart` | Paquete local fijado, contrato del canal y límites documentados |
| `packages/pos_bluetooth_printer/android/build.gradle`, `src/main/AndroidManifest.xml` | Registro/compilación Android, sin permisos extra del plugin |
| `packages/pos_bluetooth_printer/android/src/main/kotlin/com/pos/printing/PosBluetoothPrinterPlugin.kt`, `PrinterPermissionPolicy.kt`, `PrinterTransport.kt` | Permisos con Activity, SPP, worker, deadline y barrera de cierre |
| `packages/pos_bluetooth_printer/android/src/test/kotlin/com/pos/printing/PrinterTransportTest.kt` | 10 pruebas JVM con sockets controlados |
| `test/application/printing/printer_profile_test.dart`, `ticket_print_service_test.dart` | Validación, prueba mínima, errores, concurrencia, timeout y cierre |
| `test/data/printing/android_bluetooth_printer_gateway_test.dart` | Traducción del canal, permisos, errores, bytes y futures reales pendientes |
| `test/core/di/printing_dependencies_test.dart`, `test/support/fake_printer_gateway.dart` | Singleton/DI, aislamiento en ambos modos y bloqueo de reset |

En análisis se modificó solamente
`08 - Roadmap/Impresion de tickets/Estado y continuidad.md`.

### Verificación automatizada ejecutada

| Comando/comprobación | Resultado final |
|---|---|
| `flutter --version`, `dart --version`, `android/gradlew --version` | Versiones anteriores confirmadas; SDK intacto |
| `flutter pub get` | Resuelto y lock conservado; sin candidatos descartados ni actualización de dependencias ajenas |
| `dart analyze` | **No issues found** |
| `flutter test test/application/printing test/data/printing` | **38 tests pasaron** |
| `flutter test test/core/di/printing_dependencies_test.dart` | **4 tests pasaron** |
| `flutter test` (ejecución final completa) | **1610 tests pasaron, 10 omitidos existentes**, sin fallos |
| `cd android && ./gradlew :pos_bluetooth_printer:testDebugUnitTest` | **10 JVM tests pasaron**, 0 omitidos/fallos/errores |
| `flutter build apk --debug` | **Compiló**; `build/app/outputs/flutter-apk/app-debug.apk` |
| Manifest combinado debug y reporte de merge, más comprobación XML | **BLUETOOTH maxSdk=30 + CONNECT**, hardware Bluetooth opcional; **sin SCAN, ADMIN, ADVERTISE, FINE/COARSE_LOCATION** |
| `flutter build macos --debug` | **Compiló**; `build/macos/Build/Products/Debug/pos_flutter.app`. Sin cambios en registro nativo macOS ni soporte funcional de impresión allí |
| `git diff --check`, revisión de imports y archivos de alcance | Sin errores de whitespace; application puro; botones y capas excluidas intactos |
| `adb devices -l`, `flutter devices` | **Sin Android conectado**; solo macOS/Chrome disponibles |

Los tests nuevos cubren permiso concedido/denegado/permanente/revocado, apagado,
hardware/plataforma ausentes, destino ausente, conexión fallida, escritura lenta,
flush pendiente, timeout con I/O aún activo, cierre pendiente/fallido/tardío,
concurrencia, A→B→A y socket creado después de comenzar el cierre. Las pruebas
DI verifican igualdad de todas las tablas antes/después de la prueba en ambos
modos, cero llamadas HTTP de impresión, ausencia de llamadas Bluetooth al
arrancar y rechazo de reset hasta cerrar. En standalone el arranque configurado
del fixture no inicia sincronización.

Incidencias durante verificación: se corrigió el fixture nuevo de reinicio para
que la lectura preexistente de config standalone (que selecciona Google Drive)
no arrancara un respaldo ajeno al test. Una primera ejecución completa, en
paralelo con compilación macOS, tuvo además `pumpAndSettle timed out` en
`product_supplier_ui_flow_test`; esa suite pasó sola (7 tests) y la ejecución
completa posterior pasó sin cambios a proveedores. No hay fallo automatizado
final abierto. macOS emitió warnings del SQLite/CocoaPods existente; Gradle
avisó de APIs obsoletas para Gradle 9, manteniéndose el build exitoso con 8.14.

### Evidencia física y aceptación

**No se imprimió ni se abrió una conexión física en esta sesión.** No hubo
Android disponible. El transporte del equipo del usuario, modelo/firmware,
ancho real de 58 mm, tiempos/caudal, caracteres, márgenes, papel/tapa, revocación
real, pérdida de alcance y segundo destino de 80 mm siguen **pendientes**.
SPP es lo implementado por el puente, no un transporte certificado para esa
impresora. BLE no se implementó ni se declaró compatible. El registro Bluetooth
del Mac de la planificación no cambia estas conclusiones.

| Casos del plan | Estado tras fase 1 |
|---|---|
| I01 | Base local y DI comprobadas en ambos modos sin impresión remota; pantalla de configuración pendiente de fase 2 |
| I02–I03, I08 | Contratos/errores automatizados; diálogos, revocación/apagado reales y hardware pendientes de Android |
| I05–I06, I18 | Identidad/default/snapshot cubiertos en modelos/servicio; edición/selector persistente pendientes de fase 2 |
| I07 | A→B→A automatizado en gateway/servicio/transporte controlado; dos equipos físicos pendientes |
| I14–I16 | Exclusión, deadline, barrera y resultado incierto cubiertos automáticamente; interrupción física pendiente |
| I17 | Propiedad del servicio y cierre de engine/Activity implementados; rutas de impresión aún sin UI y ciclo de vida físico pendiente |
| I20 | Reset espera cierre y se bloquea si falla; persistencia de perfiles/restauración integral pendiente de fases 2/4 |
| I21 | Base de datos real sin cambios por prueba en ambos modos, sin conexión remota; integración ventas/cotizaciones pendiente de fase 3 |
| I23–I24 | Protección de plataformas y semántica de bytes cubiertas; build macOS aprobado; no hay acuse físico ni detección de papel |
| I04, I09–I13, I19, I22, I25 | Fuera de fase 1; persistencia, tickets/render/layout, compartir integrado y márgenes físicos pendientes |

No se presenta un fake, prueba JVM o compilación como certificación de una
impresora comercial. El tamaño/pausa de bloques está fijado como inicio de
transporte, pendiente de calibrar; discovery iniciado por otra app/sistema puede
ralentizar la conexión, porque este puente no lo cancela ni solicita SCAN.

## Fase 2 implementada el 2026-10-09

### Base y alcance conservados

Se leyeron los AGENTS aplicables de Flutter y análisis, el plan, este estado y
la sesión 02. Flutter sigue en `main`, HEAD `fe509f6`. El working tree inicial
contenía todos los cambios locales de fase 1: manifest, pubspec/lock, DI,
contratos/servicio, gateway, paquete local y pruebas. Se conservaron; no se
repitió la selección de paquetes ni se reconstruyó la infraestructura.

Se reutilizan `PrinterProfile`, `PrinterSettings`, el único `PrinterGateway`,
la instancia global de `TicketPrintService` y `pos_bluetooth_printer` **0.1.0**.
No se añadieron dependencias, transportes ni cambios nativos. En los modelos
existentes solo se actualizó el comentario de `PrinterSettings`, sin alterar
sus validaciones. La barrera de cierre de fase 1 se conserva.

No se modificaron Drift, SQLite de producción, eventos, `event_refs`, sync,
NestJS ni respaldos de negocio. Los botones Imprimir de ventas/cotizaciones
siguen deshabilitados; no hay renderer de fase 3. No se ejecutó build_runner.
El vault conservó todos sus cambios previos; en esta fase solo se editó este
archivo de continuidad.

### Implementación y garantías

- `PrinterSettingsStore` y `PrinterSettingsFileStore`: archivo propio
  `printer_settings.json` en Application Support, formato JSON **versión 1**.
  Guarda perfiles/dirección predeterminada y parámetros de compatibilidad,
  nunca sockets ni estados de conexión. Archivo ausente significa vacío y
  leerlo no crea un archivo.
- Lectura, guardado y recuperación se serializan en el adaptador. Escritura
  en temporal del mismo directorio con `flush`, seguida de `rename` para
  reemplazar sin borrar primero el destino. Un temporal de envío interrumpido
  no se interpreta como configuración confirmada.
- Corrupción de JSON/UTF-8, perfiles inválidos, direcciones duplicadas y default
  inexistente se rechazan; una versión desconocida produce un aviso distinto.
  Leer o guardar normalmente no sobrescribe ninguno de esos originales.
  Si la corrupción aparece después de cargar y se detecta al guardar, se
  bloquean nuevos cambios y se ofrece la misma recuperación explícita.
  Fallos de lectura por I/O ofrecen recarga, sin proponer recuperación de formato.
- Recuperación exclusivamente por acción confirmada en la pantalla: copia
  del original a `printer_settings.json.preserved-<identificador>` antes de
  reemplazarlo por una configuración vacía. Se muestra la ubicación conservada.
  Si falla el guardado o la recuperación, el controlador conserva su último
  estado confirmado; un error no rompe la cola de siguientes operaciones.
- `PrinterSettingsController` mantiene snapshots inmutables y serializa las
  intenciones contra el último estado guardado. Reutiliza las validaciones
  de los modelos; publicar ocurre después del guardado satisfactorio.
  La dirección normalizada es la identidad: guardarla otra vez edita; nombres
  iguales admiten equipos distintos. Quitar default deja la selección vacía.
  `dispose` drena los guardados ya aceptados antes de cerrar el stream.
- Configuración → Impresoras está fuera del bloque `server_sync`. Listado de
  perfiles, alias, dirección, papel y predeterminada; agregar/editar/cancelar,
  quitar solo de esta app y elegir/quitar predeterminada explícitamente.
  Se guardan perfiles de 58/80 mm; al cambiar papel se proponen 384/576 puntos,
  que siguen siendo valores iniciales pendientes de validación física.
  Al editar el alias sin cambiar el papel se conservan los parámetros previos.
  El corte permanece desactivado por defecto, sin habilitarlo desde esta UI.
- Agregar consulta únicamente dispositivos ya vinculados, con nombre y dirección,
  recarga e instrucciones para vincular en Ajustes del sistema. Maneja permisos,
  denegación permanente, Bluetooth apagado, hardware ausente, lista vacía,
  timeout y plataforma no soportada. No inicia discovery ni conecta al listar.
  Entrar/cargar configuración no consulta Bluetooth ni solicita permisos.
- Cada perfil ofrece Imprimir prueba hacia ese destino capturado, sin cambiar
  default. Se llama a la instancia global existente mediante `printTest(profile)`.
  Destino/progreso/resultado permanecen visibles en un panel de la pantalla.
  Ocupado se rechaza sin cola; los errores de envío conservan `mayHavePrinted`
  y advierten posible salida parcial, sin reintento automático. Éxito significa
  bytes enviados, con aviso explícito de que debe revisarse el papel.
- El preflight de permisos de la UI comprueba que la ruta siga vigente después
  de cada espera. Al cerrar la ruta con permiso pendiente no se inicia un
  listado/conexión/envío tardío. Una impresión ya entregada al servicio conserva
  su propiedad y limpieza global; su resultado no llama callbacks de UI cerrada.
- DI registra un store/controlador y reutiliza el gateway/servicio previos.
  Carga al iniciar sin permisos/conexión. Reiniciar DI espera primero el cierre
  real de impresión y después drena el controlador antes de reemplazarlo.
  Cierre fallido sigue impidiendo reset. Restaurar SQLite no reemplaza este
  archivo; el controlador nuevo vuelve a cargar sus perfiles locales.

### Archivos agregados/modificados de fase 2

Todas las rutas siguientes pertenecen a
`/Users/benjamin/Projects/POS/pos_flutter`:

| Archivos | Cambio propio de fase 2 |
|---|---|
| `lib/application/printing/printer_settings_store.dart`, `printer_settings_exception.dart` | Contrato y fallos tipados de persistencia |
| `lib/application/printing/printer_settings_controller.dart` | Carga, serialización, edición/default, recuperación y publicación confirmada |
| `lib/application/printing/printer_settings.dart` | Comentario actualizado; validaciones existentes conservadas |
| `lib/data/local/printing/printer_settings_file_store.dart` | JSON versionado, temporal/reemplazo y original preservado |
| `lib/presentation/pages/impresoras/printer_settings_screen.dart` | Perfiles, default, recuperación explícita y prueba global |
| `lib/presentation/pages/impresoras/bonded_printers_screen.dart` | Vinculados, recarga y estados Bluetooth |
| `lib/presentation/pages/impresoras/printer_profile_dialog.dart` | Edición validada de alias/papel |
| `lib/presentation/pages/impresoras/printer_access.dart`, `printer_failure_message.dart` | Preflight protegido y mensajes de resultados tipados |
| `lib/presentation/pages/pantalla_principal/sync_settings_screen.dart` | Acceso Impresoras en ambos modos |
| `lib/core/di/data_dependencies.dart`, `application_dependencies.dart`, `injection.dart` | Store/controlador, carga local y drenado previo a reset |
| `test/application/printing/printer_settings_controller_test.dart` | 4 pruebas de identidad, publicación, fallo/recuperación y cierre |
| `test/data/printing/printer_settings_file_store_test.dart` | 11 pruebas con directorios temporales, corrupción/versiones y fallos |
| `test/presentation/pages/impresoras/printer_settings_screen_test.dart` | 16 widgets: permisos/recarga, CRUD/default, resultados, exclusión y cierre |
| `test/core/di/printing_dependencies_test.dart` | Extensión de aislamiento con configuración; 2 pruebas nuevas de restauración SQLite/DI |
| `test/presentation/pages/pantalla_principal/menu_lateral_test.dart` | 2 pruebas nuevas de navegación e identidad de dependencias en ambos modos |
| `test/support/fake_printer_settings_store.dart` | Escritura pendiente/fallida y recuperación controladas para pruebas |

En análisis se actualizó únicamente
`08 - Roadmap/Impresion de tickets/Estado y continuidad.md`.

### Verificación ejecutada y resultados

| Comando/comprobación | Resultado final |
|---|---|
| Pruebas nuevas de store/controlador | **15 pasaron**; múltiples perfiles, nombres iguales/dirección repetida, recarga/default, corrupción JSON/UTF-8, versión desconocida, invariantes, fallo de escritura y cola intacta |
| `flutter test test/presentation/pages/impresoras/printer_settings_screen_test.dart` | **16 pasaron**; A58 → B80 → A58, papel/ancho/dirección capturados, default intacta, ocupado, posible salida parcial, cierre y permiso pendiente |
| `flutter test test/core/di/printing_dependencies_test.dart test/presentation/pages/pantalla_principal/menu_lateral_test.dart` | **16 pasaron**; incluye 6 DI y 10 menú/configuración, con 4 pruebas nuevas de fase 2 |
| `dart analyze` (final) | **No issues found** |
| `flutter test` (final completo) | **1645 pasaron, 10 omitidos existentes**, sin fallos; **35 pruebas nuevas** respecto a fase 1 |
| Fixture real de negocio en ambos modos | Tablas completas antes/después de guardar perfiles/default y probar: **idénticas**; cero llamadas HTTP por impresión/configuración y cero Bluetooth de arranque |
| Restauración real SQLite + reinicio DI en ambos modos | Snapshot SQLite anterior a B80; configuración más reciente A58/B80 y default B80 **preservadas byte a byte**, sin envío automático |
| Barrera de fase 1 | Pruebas existentes de cierre pendiente/fallido siguen pasando; reset no reemplaza gateway hasta cerrar |
| `git diff --check`, revisión de capas/imports/alcance | Sin whitespace inválido; application de configuración sigue siendo Dart puro; ninguna dependencia nueva |
| `adb devices -l`, `flutter devices` | **Sin Android disponible**; solo macOS y Chrome. No se abrió conexión física |

Incidencias resueltas durante los tests nuevos: el fixture de widgets se ajustó
para crear y disponer controlador/streams en el mismo contexto asíncrono del
test; no quedó un cierre pendiente al pasar a teardown. La prueba A→B→A necesitó
un frame después de desplazar antes de tocar, y el resultado se movió a un panel
visible para no ocultarlo al final de una lista de perfiles. No hay fallo final
abierto. No se reejecutaron builds APK/macOS ni pruebas JVM en esta fase: el
puente nativo permanece igual que en fase 1 y sus resultados allí son históricos.

### Evidencia física y casos de aceptación

**No se imprimió físicamente en esta fase.** Quedan pendientes en un Android
real: configurar/vincular, conceder/revocar permisos, reiniciar la app, verificar
persistencia y envío mínimo. Confirmar SPP del equipo del usuario sigue pendiente
y no bloqueó fase 2. El fake verifica selección, aislamiento y datos del perfil;
no certifica ESC/POS, ancho físico, caudal ni compatibilidad comercial de 58/80 mm.

La prueba reutilizada sigue siendo la mínima ASCII de fase 1. Reporta alias,
dirección, papel y ancho; no es un renderer térmico, no prueba comandos de imagen,
caracteres españoles como raster ni márgenes físicos. Corte/cajón no se envían.

| Casos del plan | Estado tras fase 2 |
|---|---|
| I01 | Pantalla accesible y local en ambos modos; fixture sin HTTP y standalone sin arranque de sync |
| I02–I03, I08, I23 | UI automatizada para permiso/denegación/permanente, apagado/ausente/vacío y plataforma no soportada; gateway/servicio de fase 1 conservan los errores; hardware físico pendiente |
| I04–I06, I19 | Persistencia, varios destinos, identidad por dirección, default explícita/quitar sin sustitución y recuperación/fallo cubiertos automáticamente; reinicio Android pendiente |
| I07, I18 | A58→B80→A58 con gateway fake y perfiles independientes; elegir prueba no cambia default, snapshot del servicio intacto; dos equipos físicos pendientes |
| I14–I17, I24 | Una instancia global, rechazo ocupado, progreso/resultados, advertencia parcial y rutas/permisos pendientes cubiertos; deadlines/limpieza de fase 1 pasan de nuevo; ciclo de vida y salida físicos pendientes |
| I20–I21 | Restauración SQLite real/DI y tablas antes/después cubiertos en ambos modos; profiles no pertenecen al respaldo ni al negocio |
| I09–I13, I22, I25 | Fase 3/4 pendientes: renderer, integración ventas/cotizaciones, raster/tickets largos/márgenes físicos; compartir y navegación existentes pasan en suite completa |

## Fase 3 implementada el 2026-10-09

### Base, alcance y dependencias

Se leyeron los AGENTS aplicables, el plan, este estado y la sesión 03. Flutter
sigue en `main`, HEAD `fe509f6`, **Flutter 3.41.6 / Dart 3.11.4**. El working tree
inicial contenía las fases 1/2 sin commit: manifest, pubspec/lock, DI, contratos,
gateway, puente local, configuración/controlador, pantallas y pruebas. Se
conservaron esos cambios. Los cambios previos del vault también se conservaron.

Se reutilizan los perfiles, archivo/controlador, pantallas, permisos/errores,
gateway y el singleton global `TicketPrintService`. La única dependencia de
transporte continúa siendo **pos_bluetooth_printer 0.1.0**, local por path.
**No se agregó ninguna dependencia de codificación**: el renderer usa Flutter
painting/dart:ui y el encoder implementa los tres comandos de imagen acotados.
No se repitió la selección de paquetes Bluetooth ni se modificaron el puente,
Flutter, Gradle, AGP o Kotlin. `pubspec.yaml` y `pubspec.lock` conservan sus
cambios anteriores de fase 1; no hubo un cambio propio de fase 3 allí.

Los formatos se contrastaron con referencias primarias de Epson:
[GS v 0](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lv_0.html),
[GS ( L, función 112](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn112.html),
[función 50](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn50.html)
y [ESC *](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_asterisk.html).
Consultar estos formatos no acredita que un firmware comercial admita todos
los métodos. El método efectivo sigue siendo el elegido en el perfil.

No se modificaron Drift, contratos/eventos, command services, cobro,
recuperación/estimación de cotizaciones, sync, NestJS ni respaldos. No se ejecutó
build_runner. No se añadieron transportes, cola persistente, historial de
impresión ni envío automático. En análisis se actualizó este estado y se
agregaron los ocho PNG de evidencia de esta fase.

### Implementación y garantías

- `TicketDocument` se movió a `application/tickets/ticket_document.dart` sin
  cambiar el modelo. Se actualizaron todos los consumidores; no queda copia ni
  archivo puente en presentation. Las filas anidadas, totales, detalles y resumen
  conservan sus listas inmutables. Application sigue siendo Dart puro.
- `TicketEncoder` entrega un stream perezoso de bloques de bytes en orden.
  `ThermalTicketRenderer` dibuja directamente al ancho en puntos del perfil,
  blanco opaco y negro, con margen de 8 puntos para los anchos habituales.
  No escala ni decodifica el PNG compartido para obtener la salida térmica.
- 58 mm: nombre/variante en todo el ancho; cantidad, precio e importe debajo.
  80 mm: columnas proporcionales al ancho, con espacio para cantidades medidas
  y ajuste de texto completo. Anchos menores de 480 puntos usan el bloque
  estrecho para conservar legibilidad. No se truncan filas, leyendas ni valores
  no disponibles. Cabecera, detalles, resumen de pago, totales y pie se dibujan.
  Ñ, tildes y símbolos se convierten a puntos, sin depender de una tabla de
  caracteres de firmware.
- Un bitmap de **hasta 120 filas de puntos** y una fila semántica a la vez.
  Una fila alta se pinta en las bandas sucesivas, sin reducirla o recortarla.
  Se liberan TextPainter, Picture, Image y la grabación parcial al finalizar
  o cancelar. El servicio espera cada escritura/flush antes de solicitar la
  banda siguiente; no acumula el ticket completo en un buffer de impresión.
- `EscPosTicketEncoder` respeta `gsV0`, `gsL` o `escStar`. `gsL` almacena y
  ejecuta las funciones 112/50 por banda. `escStar` convierte a columnas de
  24 puntos, con avance de esas líneas, y solo rellena de blanco la última
  franja incompleta. Configura unidades verticales de 1/203 pulgadas y espacio
  de 24 unidades para ese método; su equivalencia física requiere validación
  en el firmware real. Las bandas completas son múltiplos de 24.
- Una inicialización al comienzo y un avance final después del último contenido.
  El corte se incluye exclusivamente si `supportsCut` es verdadero. No hay
  comandos de cajón. Los comandos de imagen avanzan lo necesario para sus
  propios puntos, sin avances en blanco entre bandas ni reinicios del ticket.
- El PNG para compartir/WhatsApp conserva su renderer, **880 píxeles de ancho**,
  nombres, importes y flujo existentes. Su único cambio propio es el import
  del modelo reubicado.
- `printTicket(document, profile)` reserva el mismo servicio global antes del
  preflight y de generar la primera banda. Pruebas de Configuración y tickets
  concurrentes se rechazan, sin cola. Se mantiene **una conexión y un trabajo**
  durante todas las bandas, con un único cierre del intento.
- Se mantienen los deadlines previos de permisos/conexión/escritura/cierre y
  se agrega un límite de generación de 30 segundos por bloque. Un timeout
  responde al llamador, pero drena el futuro original y conserva la exclusión
  hasta generación/I/O/cierre efectivos. No se envía un resultado tardío de la
  primera banda. Un fallo después de escribir conserva `mayHavePrinted`; un
  fallo de cierre conserva la cuarentena. No hay reintentos automáticos.
- El helper de permisos se reutiliza dentro de la operación exclusiva con su
  timeout interno desactivado: el servicio es dueño del deadline y del futuro
  nativo pendiente. Así, ni un permiso que tarde más de 35 segundos libera el
  bloqueo antes de terminar. El listado de vinculados mantiene su límite previo.
- Acción y diálogo compartidos: destino, dirección, papel, predeterminada y
  Cambiar impresora. Elegir otro destino no escribe la predeterminada. Sin
  perfiles/error de configuración se permite abrir la pantalla existente.
  Un perfil quitado del selector no se sustituye silenciosamente.
- Documento y perfil se capturan **dentro del callback de confirmar**. Ventas
  toman exclusivamente `ConfirmedSale`; cotizaciones usan la selección y la
  estimación visible, con sus fechas/leyendas y textos no disponibles. Cambios
  posteriores de precios o perfiles no reemplazan lo entregado al encoder.
- La barra de acciones de cotización permanece fuera del subárbol asíncrono
  de estimación/imagen. Recalcular el preview no desmonta una intención ya
  confirmada ni pierde su progreso/resultado. No se persiste la estimación.
- Imprimir queda habilitado en Android con documento y servicio libre, incluso
  sin perfil o si falla únicamente el PNG de compartir. Otras plataformas
  muestran indisponibilidad y no llaman al gateway/plugin. Permisos, selección,
  cancelación, pausa y cierre descartan intenciones/resultados antiguos.
  Antes de empezar a escribir, cerrar la ruta cancela el intento; después, el
  servicio mantiene la propiedad del trabajo y su limpieza global.
- Se muestran progreso, destino y resultado de envío. «Ticket enviado a la
  impresora» incluye que el envío no confirma impresión física. Una interrupción
  advierte posible salida parcial y deja la reimpresión como acción manual.
  Abrir, reconstruir, reanudar o reiniciar no envía un ticket por sí solo.

### Archivos propios de fase 3

Las rutas de código pertenecen a `/Users/benjamin/Projects/POS/pos_flutter`.
Los archivos de infraestructura que aparecen en esta lista ya existían como
cambios locales; solo se adaptaron en los puntos indicados.

| Archivos | Cambio propio |
|---|---|
| `lib/application/tickets/ticket_document.dart` | Modelo existente reubicado; archivo anterior eliminado |
| `lib/application/printing/ticket_encoder.dart` | Contrato puro de generación acotada |
| `lib/application/printing/ticket_print_service.dart`, `printer_exception.dart` | Generación/envío exclusivos, stream de ocupación, guardas y errores de generación/cancelación |
| `lib/data/printing/thermal_ticket_band.dart`, `thermal_ticket_renderer.dart`, `esc_pos_ticket_encoder.dart` | Raster acotado, layouts y tres comandos de imagen |
| `lib/core/di/data_dependencies.dart`, `application_dependencies.dart` | Registro del encoder e inyección en el singleton existente |
| `lib/presentation/tickets/ticket_print_action.dart`, `ticket_printer_dialog.dart` | Acción manual, selector, snapshot, progreso/resultados y ciclo de vida |
| `lib/presentation/tickets/ticket_image_generator.dart` | Solo import del modelo; PNG compartido conservado |
| `lib/presentation/pages/caja/sale_receipt_screen.dart`, `models/sale_receipt_display.dart` | Acción inyectable y consumo del modelo reubicado |
| `lib/presentation/pages/cotizaciones/quotation_ticket_screen.dart`, `models/quotation_display.dart` | Acción estable durante estimación/preview y consumo del modelo reubicado |
| `lib/presentation/pages/impresoras/printer_settings_screen.dart`, `printer_access.dart`, `printer_failure_message.dart` | Prueba dentro de la exclusión, ocupación global y nuevos mensajes/propiedad del deadline |
| `test/application/printing/ticket_generation_service_test.dart` | 9 pruebas de snapshots, exclusión, backpressure, timeout, cancelación y salida parcial |
| `test/data/printing/esc_pos_ticket_encoder_test.dart` | 6 pruebas de raster, 100 filas, límites de banda, comandos y corte; exportación de PNG |
| `test/data/printing/ticket_business_isolation_test.dart` | 2 fixtures reales, ambos modos, tres pagos y cotización, impresión/reimpresión sin escrituras/sync |
| `test/presentation/tickets/ticket_print_action_test.dart` | 17 widgets de selección, precios/perfiles, concurrencia, permiso lento, pausa/cierre, resultados y pantallas reales |
| `test/presentation/pages/caja/sale_receipt_test.dart`, `test/presentation/pages/cotizaciones/quotation_ticket_test.dart` | Expectativas de Imprimir actualizadas; compartir/navegación conservados |
| `test/support/fake_ticket_encoder.dart`, `thermal_ticket_fixtures.dart` | Generación pendiente/controlada y documento largo reproducible |
| `08 - Roadmap/Impresion de tickets/Renders/fase 3/*.png` (análisis) | Ocho renders de evidencia, sin uso como fuente de impresión |

### Verificación ejecutada y resultados

| Comando/comprobación | Resultado final |
|---|---|
| `dart analyze` | **No issues found** |
| `flutter test --reporter expanded` | **1679 pasaron, 10 omitidos existentes**, sin fallos; **34 pruebas nuevas** respecto a fase 2 |
| `flutter test test/presentation/tickets/ticket_print_action_test.dart test/presentation/pages/impresoras/printer_settings_screen_test.dart --reporter expanded` | **33 pasaron**; 17 de acción/tickets y 16 de Configuración |
| `flutter test test/application/printing test/data/printing/esc_pos_ticket_encoder_test.dart --reporter expanded` | **43 pasaron**; servicio anterior más generación, modelos/controlador y raster/encoder |
| `test/data/printing/ticket_business_isolation_test.dart` en ejecución dirigida conjunta y suite completa | **2 pasaron**; contenido completo de todas las tablas idéntico después de cada envío/reimpresión en ambos modos; cero clientes HTTP |
| Exportación con `POS_THERMAL_RENDER_DIR` y `flutter test test/data/printing/esc_pos_ticket_encoder_test.dart --reporter expanded` | **6 pasaron**, ocho PNG regenerados e inspección visual de recibos/cotizaciones y finales largos |
| Ticket sintético de 100 filas, ambos anchos | Raster idéntico con bandas de 96/120 puntos; decoder independiente reconstruye todas las bandas en orden en los tres métodos; solo padding blanco final en ESC * |
| Backpressure y transporte controlado | Siguiente bloque no se genera mientras el write/flush anterior sigue pendiente; una conexión y cierre por ticket; sin final/reintento después de interrupción |
| Fixtures reales de negocio | Efectivo/transferencia/crédito y cotización, dos envíos manuales cada uno: ocho trabajos por modo; precios actuales cambiados después de capturar, snapshots intactos |
| Garantías de fase 1/2 y DI | Tests existentes de timeout, close pendiente/fallido, reset/restauración y persistencia siguen pasando en la suite completa |
| `git diff --check`, imports y alcance | Sin whitespace inválido; application puro; no queda el modelo antiguo ni cambios propios en capas excluidas |
| `adb devices -l`, `flutter devices` | **Sin Android conectado**; macOS y Chrome únicamente |

La comprobación aislada del fixture se ejecutó junto con renderer/widgets y
volvió a ejecutarse por la suite completa. No se ejecutaron builds APK/macOS ni
pruebas JVM en esta fase; los resultados de fase 1 son históricos y no se
presentan como una compilación nueva de esta integración.

Incidencias resueltas: las expectativas antiguas de Imprimir deshabilitado se
actualizaron; el progreso del selector se separó del envío para no mantener una
animación mientras se decide el destino; se evitó cancelar de nuevo un iterador
ya terminado y los flujos de bytes de prueba conservan cancelación propia. La
barra de cotización se estabilizó después de detectar que la recalculación
podía desmontar la acción. Se añadió un caso de permiso nativo pendiente más
allá del límite habitual para comprobar el drenado del preflight. No queda un
fallo automatizado abierto en la ejecución final.

### Renders inspeccionados

Directorio: `08 - Roadmap/Impresion de tickets/Renders/fase 3`.
La fuente de exportación reproducible es
`test/data/printing/esc_pos_ticket_encoder_test.dart`. Para exportar en macOS,
la prueba carga Arial del sistema bajo el nombre Roboto para evitar la fuente
Ahem de flutter_test; en la app se usa la familia Roboto. No se agregó una
fuente como dependencia ni se afirma equivalencia exacta entre esas tipografías.
Los PNG térmicos reflejan el raster binario efectivamente codificado.

| Imagen | Dimensiones | Inspección |
|---|---|---|
| `receipt-mm58.png` | 384 × 1324 | Nombre/variante completos, ñ/tildes/símbolos, resumen de transferencia, medidas, valores no disponibles, totales y pie |
| `receipt-mm80.png` | 576 × 1376 | Columnas, cantidad/unidad juntas, precio medido completo, valores no disponibles y margen |
| `quotation-mm58.png` | 384 × 1098 | Fechas de creación/cálculo, leyendas, precios vigentes, medidas, total y aviso de no pago/reserva |
| `quotation-mm80.png` | 576 × 860 | Mismos datos y leyendas en columnas ajustadas |
| `long-100-mm58.png` | 384 × 22470 | Exportación completa; validación de todos los puntos por prueba de bandas; 188 bandas de producción |
| `long-100-mm80.png` | 576 × 25820 | Exportación completa; validación de todos los puntos por prueba de bandas; 216 bandas de producción |
| `long-100-end-mm58.png` | 384 × 870 | Inspección visual de últimas filas, fila 100, totales y pie |
| `long-100-end-mm80.png` | 576 × 860 | Inspección visual del final, fila 100, totales y pie |

Las exportaciones completas largas se construyen **solo en la prueba** para
inspección; no implican un bitmap de esa altura en el envío de producción.
En producción, el raster de cada banda máxima pesa 5760 bytes a 384 puntos o
8640 bytes a 576, más los encabezados ESC/POS. El tamaño/pausa de bloques del
puente nativo permanecen como en fase 1, pendientes de calibración física.

### Evidencia física y aceptación

**No hubo impresión ni conexión física en esta fase.** No se dispuso de Android.
SPP del equipo del usuario, método admitido por su firmware, ancho real,
márgenes, continuidad entre franjas ESC *, legibilidad en papel, caudal,
corte cuando corresponda, pérdida de alcance/papel/tapa, permisos reales y
segundo destino de 80 mm siguen pendientes. Los fakes, la reconstrucción de
bytes y los PNG no certifican una impresora comercial ni confirman papel.

| Casos del plan | Estado tras fase 3 |
|---|---|
| I01–I08, I19–I20 | Evidencia previa conservada y revalidada por suite; persistencia, selección sin sustitución, errores y reset; dispositivos/permisos físicos pendientes |
| I09 | Tres métodos de cobro desde snapshots confirmados en pantallas y fixture real, sin consultar precios nuevos |
| I10–I11 | Cotización capturada con fechas/leyendas, cambio posterior de precios y textos no disponibles, sin persistir estimación |
| I12–I13 | Raster 58/80 inspeccionado, filas largas, caracteres, medidas y 100 líneas por bandas; legibilidad/continuidad en papel pendientes |
| I14–I18 | Exclusión durante permisos/generación/envío/cierre, rechazo sin cola, timeout drenado, selección/profile snapshot, pausa y rutas; interrupciones físicas pendientes |
| I21 | Todas las tablas iguales antes/después de impresión/reimpresión en standalone/server_sync; standalone sin refs y con not_required; cero HTTP por impresión |
| I22 | PNG compartido de 880 px y compartir/WhatsApp, Regresar/Cerrar, Nueva venta/Nueva captura conservados por pruebas actuales |
| I23–I24 | Android habilitado; otras plataformas explicadas sin gateway/plugin; mensaje de bytes enviados y advertencia parcial sin afirmar impresión física |
| I25 | Márgenes raster revisados; calibración/autotest físico pendiente de fase 4 |

## Fase 4 verificada el 2026-10-09

**Cierre: verificación automatizada completa; verificación física pendiente.**
Se ejecutó únicamente la sesión 04 sobre Flutter `main`, HEAD `fe509f6` más
working tree de fases 1–3. Se conservaron todos los cambios preexistentes,
comprobados por hashes antes/después. No se reconstruyeron las fases previas.
AGENTS de Flutter/análisis y plan/sesión 04 leídos; no hay instrucciones adicionales
bajo las carpetas intervenidas. La dependencia sigue siendo el puente local
`pos_bluetooth_printer` **0.1.0**, Flutter 3.41.6/Dart 3.11.4, sin nuevas librerías.

Evidencia actual: [[08 - Roadmap/Impresion de tickets/Evidencia/sesion-4-2026-10-09/README|Índice de evidencia]],
[[08 - Roadmap/Impresion de tickets/Evidencia/sesion-4-2026-10-09/resultados|Comandos y resultados]],
[[08 - Roadmap/Impresion de tickets/Evidencia/sesion-4-2026-10-09/matriz-I01-I25|Matriz completa I01–I25]],
[[08 - Roadmap/Impresion de tickets/Evidencia/sesion-4-2026-10-09/auditoria|Auditoría y pendientes físicos]].
Los reportes separan código/widgets/SQLite/archivo real, canal/socket controlado,
raster e impresión física. No existe un caso físico aprobado por usar un fake o PNG.

### Ajustes concretos de cierre

1. **Prueba de configuración ASCII sin raster/método del perfil.** La regresión
   previa falló al no llegar ningún perfil/documento al encoder. `printTest`
   ahora crea un TicketDocument identificable y usa el mismo renderer/encoder
   por bandas que los tickets. Incluye ñ/tildes, nombre/variante largos,
   cantidad medida, importes/totales, reglas de margen y pie. La prueba integrada
   A58 → B80 → A58 decodifica cada trabajo con su ancho/método y comprueba
   una conexión/cierre por ticket y write pendiente sin nuevas escrituras.
2. **Timeout nativo de permiso con diálogo aún activo.** Antes, el deadline
   de 30 s terminaba el canal aunque el diálogo siguiera abierto. Ahora solo
   marca expiración y conserva el future hasta callback/detach definitivo.
   Application puede avisar a los 35 s y conserva exclusión mientras lo drena.
   Rotación/reattach no finalizan ese diálogo prematuramente. Tres pruebas JVM
   comprueban el future pendiente, resultado temprano y terminación tardía única.
   El diálogo/rotación reales permanecen pendientes de dispositivo Android.

Se adaptaron expectativas de la antigua prueba ASCII y la espera del fixture DI
al renderer asíncrono. Se agregaron únicamente **dos regresiones Dart y tres JVM**
para estos riesgos. La exportación opcional de documentos sintéticos vive en
las pruebas, nunca en producción. No se modificó funcionalmente el renderer o
encoder térmico existente, ni se calibraron parámetros sin evidencia física.

### Archivos finales propios de sesión 4

Raíz de código: `/Users/benjamin/Projects/POS/pos_flutter`. La lista representa
los cambios de esta sesión respecto al estado inicial, no todo el diff contra HEAD.

| Archivos | Ajuste |
|---|---|
| `lib/application/printing/printer_test_payload.dart`, `ticket_print_service.dart` | Documento de calibración por renderer/encoder del perfil, con exclusión existente |
| `packages/pos_bluetooth_printer/android/src/main/kotlin/com/pos/printing/PrinterPermissionRequest.kt` (nuevo), `PosBluetoothPrinterPlugin.kt` | Future de permiso drenado hasta callback/detach; rotación conserva solicitud |
| `packages/pos_bluetooth_printer/android/src/test/kotlin/com/pos/printing/PrinterPermissionRequestTest.kt` (nuevo) | Tres regresiones JVM del deadline/barrera de permiso |
| `packages/pos_bluetooth_printer/README.md` | Contrato actual de prueba raster y deadline nativo |
| `test/application/printing/ticket_generation_service_test.dart` | Nueva regresión del probe/documento/perfil españoles |
| `test/data/printing/esc_pos_ticket_encoder_test.dart` | A58/B80/A58 con encoder/renderer real y exportación opcional de documentos/PNG |
| `test/application/printing/printer_profile_test.dart`, `ticket_print_service_test.dart` | Expectativas y encoder controlado de la prueba de calibración |
| `test/presentation/pages/impresoras/printer_settings_screen_test.dart`, `test/presentation/tickets/ticket_print_action_test.dart` | Perfil/documento capturados y ocupación compartida del probe raster |
| `test/core/di/printing_dependencies_test.dart` | Esperar primer write del renderer asíncrono antes de reiniciar DI |

En análisis se actualizan este archivo y el estado de sesión 04; se agrega
`Evidencia/sesion-4-2026-10-09/` con matriz, resultados/auditoría, logs/JSON,
reportes XML JVM, manifest/merge/permisos APK, ocho documentos sintéticos y diez PNG.
Los ocho PNG anteriores coinciden byte a byte con fase 3; solo las dos calibraciones
son nuevas. Se conserva el directorio original de renders. Inventarios/hashes
permiten revisar el alcance exacto.

No se alteraron Drift, datos reales, eventos/refs, sincronización, respaldos de
negocio o NestJS; ni se ejecutó build_runner. Pubspec/lock, DI y registro macOS
son idénticos al inicio. No se agregaron transportes, colas, reintentos, impresión
automática ni nuevos flujos de negocio. Sin arranque del POS sobre datos reales.

### Comandos y resultados actuales sobre estado final

Todos ejecutados el 2026-10-09; logs guardados con cwd/horario local/duración/exit.
Las compilaciones previas de fases 1–3 son históricas y no sustituyen estos resultados.

| Comando/comprobación | Resultado actual |
|---|---|
| `dart analyze` | **No issues found**, exit 0 |
| `flutter test --reporter expanded` | **1681 pasaron, 10 omitidas preexistentes, cero fallos**, exit 0 |
| `flutter test test/application/printing test/data/printing test/core/di/printing_dependencies_test.dart test/presentation/pages/impresoras test/presentation/tickets --reporter expanded` | **111 pasaron**, exit 0 |
| `POS_THERMAL_RENDER_DIR=... flutter test test/data/printing/esc_pos_ticket_encoder_test.dart --reporter expanded` | **7 pasaron**; diez PNG/ocho documentos exportados e inspección de calibraciones, recibos, cotizaciones y finales largos |
| Desde `android`: `./gradlew :pos_bluetooth_printer:testDebugUnitTest` | **13 JVM pasaron** (10 transporte + 3 permisos), cero omitidas/fallos/errores; XML guardados |
| `flutter build apk --debug` | **Compiló**, exit 0; `build/app/outputs/flutter-apk/app-debug.apk` actual |
| `flutter build macos --debug` | **Compiló**, exit 0; `build/macos/Build/Products/Debug/pos_flutter.app`, únicamente desarrollo, sin soporte de impresión |
| Manifest combinado debug + `aapt2 dump permissions` del APK | BLUETOOTH maxSdk=30, CONNECT, hardware opcional; sin SCAN/ADMIN/ADVERTISE/FINE/COARSE_LOCATION |
| Pubspec/lock/package_config/metadatos plugins | Una dependencia de impresión local 0.1.0, solo Android; candidatos descartados ausentes |
| `git diff --check`, hashes iniciales/finales y capas | Aprobados; cambios previos conservados, application puro y documento único reubicado |
| `adb devices -l`, `flutter devices`, Bluetooth Mac | Sin Android; macOS/Chrome. BlueTooth Printer registrada como no conectada; no hubo conexión física |

La primera dirigida tuvo errores propios de adaptación de tests ASCII/expectativas
y se corrigieron. La suite completa se repitió tras los últimos ajustes de
exportación/puente: el resultado final anterior es sobre el estado final.
No quedó fallo automatizado abierto. Las 10 omisiones son integraciones existentes
con Nest/PostgreSQL aislados sin POS_SUPPLIER_SYNC_URL/POS_PHASE3_SYNC_URL;
no pertenecen a impresión. Gradle conserva advertencia de APIs obsoletas para 9
con wrapper 8.14; builds APK/macOS actuales sin otros warnings. No se compilaron
iOS/Windows/web ni se ejecutó macOS sobre datos de negocio para esta sesión.

### Matriz I01–I25 y garantías

La [[08 - Roadmap/Impresion de tickets/Evidencia/sesion-4-2026-10-09/matriz-I01-I25|matriz completa]]
contiene resultado, tipo de comprobación, archivos/logs y pendiente de **cada caso**.
Resumen del cierre:

| Caso | Verificación automatizada | Evidencia física / pendiente |
|---|---|---|
| I01 | Ambos modos, acceso local y standalone sin sync | Sin internet/Bluetooth activo en Android |
| I02 | Estados/permisos/revocación y future nativo del deadline | Diálogos Android 12+, revocación, demora y rotación reales |
| I03 | Apagado/hardware ausente/lista vacía, recarga/error | Android/impresora reales |
| I04 | Archivo A58/B80/default y reinicio/restore DI | Reinicio del proceso Android |
| I05 | Nombre igual/dirección repetida sin duplicados | Identidad real al vincular |
| I06 | Default/quitar/elegir por envío sin sustitución | UX en dispositivo |
| I07 | A58/B80/A58, comandos/raster/destinos/cierre propios | Dos equipos; ningún 80 mm certificado |
| I08 | Desvinculada/apagada/conexión fallida sin otro destino | Fuera de alcance/apagado/desvinculación físicos |
| I09 | Tres pagos y snapshots confirmados | Tres recibos en papel |
| I10 | Snapshot de cotización con fechas/leyendas y cambio posterior | Cotización real y revisión de salida |
| I11 | Precio/Importe/Total no disponible, sin cero | Papel con valores no disponibles |
| I12 | Ambos anchos, nombres/español/medidas, raster inspeccionado | Legibilidad/Roboto/papel y recortes reales |
| I13 | 100 líneas, 96/120 dots y orden íntegro en tres métodos | Duración, memoria/estabilidad y continuidad ESC * físicas |
| I14 | Exclusión en permiso/render/write/close, sin cola | Pulsaciones/cargas en Android |
| I15 | Deadlines drenados, worker/abort/close y cuarentena | Driver Bluetooth y cierre real |
| I16 | Parcial advertido, sin final/retry, nueva acción manual | Interrupción a mitad y revisión del papel |
| I17 | Ruta/pausa/permisos/DI sin envío tardío o replay | Background/rotación/cierre/regreso/reinicio físicos |
| I18 | Perfil/documento inmutables, cambio solo siguiente envío | Confirmar destino siguiente en Android |
| I19 | Ausente/corrupto/fallo/interrupción y recuperación preservada | Fallo/terminación real del SO no ensayados |
| I20 | Restore SQLite real aislado, archivo byte a byte, cierre antes de reset | Instalación de prueba Android |
| I21 | TODAS las tablas iguales tras 8 trabajos por modo; cero HTTP, standalone not_required/sin refs | Repetición offline aislada |
| I22 | PNG/compartir/WhatsApp/navegación por widgets | Selector/WhatsApp externos reales |
| I23 | Otras plataformas sin plugin/gateway; macOS debug compila | iOS/Windows/web no compilados; impresión solo Android |
| I24 | Nunca afirmar papel/tapa/impresión confirmada por write/flush | Sin sensor/acuse físico; inspección manual |
| I25 | Márgenes blancos, final/corte por perfil por decoder | **Pendiente físico:** ancho medido sin recorte/legibilidad/pie |

Garantías principales auditadas: snapshot al confirmar, singleton global,
una conexión por ticket, siguiente generación después de write/flush anterior,
deadlines sin liberar trabajo pendiente, cuarentena si falla close, salida parcial
sin reintento, archivo preservado en recuperación/restore, cero cambios de negocio
y cero sync en standalone. Compartir/WhatsApp/regreso/nueva venta/captura pasan.
Application no importa Flutter/plugin/data/presentation; modelo anterior ausente.

En producción se mantiene una banda ≤120 dots y un bloque de texto; raster máximo
5760/8640 bytes a 384/576, más comandos/copia/imagen temporal. No se acumula el
bitmap completo. El acumulado largo solo pertenece al test/exportación.
Memoria/caudal físicos no medidos. Bandas de transporte de 1024 bytes con pausas
20 ms permanecen sin calibración. Cierre/driver bloqueado puede mantener ocupado
indefinidamente; no se promete recuperación acotada ni acuse de papel.

### Compatibilidad y pendientes físicos

**Ningún modelo se declara compatible físicamente.** No hubo Android/SPP,
papel/fotos, manual/autotest, duración ni memoria de Android observados.
El registro Bluetooth del Mac no demuestra modelo, firmware, transporte SPP,
ancho o método. macOS compilado no habilita impresión allí.

La lista física exacta se conserva en la auditoría: confirmar modelo/firmware,
Android/API, SPP, papel/ancho/método por manual/autotest; permisos y Bluetooth,
vinculación y persistencia; prueba/efectivo/transferencia/crédito/cotizaciones,
español/nombres/medidas/márgenes/totales/pie; consecutivos y 100 filas/ESC */caudal/
estabilidad; interrupción/reimpresión manual; segundo plano/cierre/rotación/
regreso/reinicio sin replay; sin internet en ambos modos; A58/B80/A58 si existe
segunda impresora. Usar una instalación y datos de prueba aislados, sin borrar
ni cambiar datos reales. Calibrar solo a partir del resultado físico.

## Incidencia física y ajuste de transmisión (2026-10-09)

**Abierta; ajuste preparado, pendiente de reimpresión física.** El usuario
aportó fotografía: la prueba raster es legible y declara BlueTooth Printer,
`5A:4A:C6:68:99:9D`, 58 mm/384 dots/`gsV0`. Cotización y recibo alternan datos
legibles y símbolos; la corrupción no ocupa toda la salida. El recibo visible
incluye un producto y $10.00, por lo que no se atribuye exclusivamente a longitud.
Modelo/firmware/Android siguen desconocidos. La foto no certifica todas las
salidas de ese perfil; evidencia parcial de prueba correcta y documentos fallidos.

La inspección encuentra que los bloques de 1024 bytes/20 ms no tenían pausa
tras el último bloque de cada write. Se preparó un ritmo conservador de
**256 bytes/40 ms después de todos los bloques**, incluido el último: el future
permanece pendiente hasta esa pausa y flush, preservando exclusión/backpressure.
Cierre durante la pausa aborta sin flush posterior y espera al worker.
No se confirma aún que el buffer/caudal sea la causa física. La reimpresión
en el mismo equipo debe confirmar o descartar este ajuste.

No se cambian método/ancho/render/encoder ni se agregan feed/reset entre bandas,
reintentos/cola. Se modifican únicamente PrinterTransport.kt, sus pruebas y
README del paquete. Dos JVM nuevas; la suite actual de 15 JVM pasa y Flutter
mantiene 1681 aprobadas/10 omitidas preexistentes; analyze sin problemas.
Las compilaciones actuales, manifest, hashes y foto sin editar se registran en
[[08 - Roadmap/Impresion de tickets/Evidencia/2026-10-09-ajuste-transmision/README|Evidencia del ajuste]]
y [[08 - Roadmap/Impresion de tickets/Evidencia/2026-10-09-ajuste-transmision/resultados|Resultados actuales]].

Los checks de sesión 4 quedan como registro histórico anterior al ajuste;
los resultados vinculados son sobre el código actual. Renderer/encoder intactos:
no se regeneran PNG sin cambio raster. Pubspec/lock/DI/negocio/sync permanecen
iguales al inicio de esta intervención. ADB solo muestra emulator-5554; no
se instaló/imprimió la corrección por el agente en un Android físico.

I09/I10: fallo de impresión física observado en fotografía, revalidación pendiente.
I12: caracteres/nombre/medida legibles en prueba, sin aprobación integral de
recibos. I13: 100 líneas y estabilidad aún pendientes. I14/I15: pausa final y
cierre regresionados por JVM, driver físico pendiente. I25: márgenes/ancho medidos
todavía pendientes. No se declara ningún modelo completamente compatible.

La modificación es Kotlin nativo: actualizar la app completa/reiniciar su proceso;
hot reload de Dart no aplica la pausa del plugin. Mantener datos/perfiles y
reimprimir manualmente los mismos documentos. Registrar salida completa/parcial,
duración, modelo/Android y nuevos fallos; nunca reintentar automáticamente.

## Próximo paso

La sesión 4 termina con **verificación automatizada completa; verificación física
pendiente**. La siguiente ejecución debe primero revalidar el ajuste de transmisión en los
recibos/cotizaciones que fallaron y después completar la lista física anterior
con Android y la impresora disponibles, registrar documentos/fotos/parámetros/
resultado completo o parcial y corregir únicamente fallos observados.
No hay que reconstruir fases 1–3 ni repetir suites sin un cambio/fallo nuevo.
Declarar compatible solo el modelo/parámetros ensayados; mantener 80 mm y otros
firmwares/transportes pendientes hasta disponer de evidencia real.

## Registro requerido al terminar una fase

- Fecha, fase, archivos propios y cambios ajenos conservados.
- Dependencia/versiones y motivo de cualquier ajuste al plan.
- Comandos y resultados realmente ejecutados; incidencias preexistentes.
- Casos I01–I25 satisfechos, pendientes o fallidos, con tipo de evidencia.
- Impresoras/transportes comprobados y límites de la compatibilidad.
- Siguiente fase o trabajo necesario para completar el criterio actual.
