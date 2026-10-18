# Resultados actuales — sesión 4, 2026-10-09

**Verificación automatizada completa; verificación física pendiente.**
La integración se comprobó sobre el working tree final; las compilaciones de
fase 1 conservadas en continuidad son históricas y no se usaron como aceptación actual.

Entorno: Flutter 3.41.6 / Dart 3.11.4, macOS 27.0.1 (26A434) arm64,
Xcode 27.0 (27A266a), Java del shell OpenJDK 21.0.11; AGP 8.11.1,
Kotlin 2.2.20, Gradle wrapper 8.14. App 0.1.0+1; único plugin de impresión
local `pos_bluetooth_printer` 0.1.0, solo Android API 24+, SPP/RFCOMM seguro.
Direcciones/perfiles de fixtures son sintéticos; no hay Android/modelo/firmware
validado físicamente. [Entorno completo](logs/environment.log).

Todos los horarios de esta tabla son America/Mexico_City, 2026-10-09.
Directorio de trabajo: `/Users/benjamin/Projects/POS/pos_flutter`, excepto Gradle
que se ejecutó desde su subdirectorio `android`. Cada JSON conserva comando,
cwd, inicio/fin, duración y exit code. La exportación aplica su variable de entorno.

| Comando | Horario local | Duración | Exit | Resultado/evidencia |
|---|---|---|---|---|
| `dart analyze` | 09:28:59–09:29:07 | 7.65 s | 0 | No issues found; [log](logs/analyze-final.log), [metadatos](logs/analyze-final.json) |
| `flutter test --reporter expanded` | 09:29:00–09:30:29 | 88.58 s | 0 | 1681 pasaron, 10 omitidas preexistentes, 0 fallos; [log](logs/full-test-final.log), [metadatos](logs/full-test-final.json) |
| `flutter test test/application/printing test/data/printing test/core/di/printing_dependencies_test.dart test/presentation/pages/impresoras test/presentation/tickets --reporter expanded` | 09:26:41–09:26:48 | 6.47 s | 0 | 111 pasaron, 0 fallos; [log](logs/targeted-final.log), [metadatos](logs/targeted-final.json) |
| `POS_THERMAL_RENDER_DIR="/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Impresion de tickets/Evidencia/sesion-4-2026-10-09/renders" flutter test test/data/printing/esc_pos_ticket_encoder_test.dart --reporter expanded` | 09:28:04–09:28:15 | 11.24 s | 0 | 7 pasaron; diez PNG y ocho JSON; [log](logs/renderer.log), [metadatos](logs/renderer.json) |
| `./gradlew :pos_bluetooth_printer:testDebugUnitTest` | 09:28:26–09:28:29 | 2.77 s | 0 | 13 JVM: 10 transporte + 3 permisos; 0 omitidas/fallos/errores; [log](logs/jvm-final.log), [metadatos](logs/jvm-final.json) |
| `flutter build apk --debug` | 09:31:58–09:32:10 | 12.27 s | 0 | APK debug compilado; [log](logs/apk.log), [metadatos](logs/apk.json) |
| `flutter build macos --debug` | 09:34:01–09:34:19 | 17.7 s | 0 | macOS debug compilado; no soporte de impresión; [log](logs/macos.log), [metadatos](logs/macos.json) |

## Comprobaciones adicionales

- Manifest debug combinado y APK real: BLUETOOTH maxSdkVersion=30,
  BLUETOOTH_CONNECT y hardware Bluetooth opcional. Sin SCAN/ADMIN/ADVERTISE
  ni FINE/COARSE_LOCATION. Permisos adicionales de cámara/backups/red/biometría
  preexistentes se conservan. [Manifest](manifest/AndroidManifest-debug.xml),
  [merge](manifest/manifest-merger-debug-report.txt),
  [aapt2 sobre APK](manifest/apk-permissions.txt).
- `print_bluetooth_thermal`, `flutter_bluetooth_printer` y `esc_pos_utils_plus`
  ausentes en pubspec, lock, package_config y metadatos de plugins. Plugin de
  impresión registrado solo en Android. Pubspec/lock/DI/registro macOS idénticos
  al inicio; application puro y un único TicketDocument en application/tickets.
- `git diff --check` aprobado en Flutter y análisis. Auditoría/hashes de archivos
  comparados con el inicio: [comprobaciones](logs/auditoria-estatica.json),
  [archivos propios](logs/archivos-sesion.json). No se editó negocio/Drift/eventos/
  sync/backups/NestJS; ni se ejecutó build_runner ni se inició un POS sobre datos reales.
- [Reportes XML JVM](jvm/TEST-com.pos.printing.PrinterPermissionRequestTest.xml)
  y [transporte](jvm/TEST-com.pos.printing.PrinterTransportTest.xml): 13 pasaron.
- `adb devices -l`: lista vacía. `flutter devices`: macOS y Chrome únicamente.
  Bluetooth del Mac: impresora registrada no conectada; no es prueba de SPP,
  modelo ni disponibilidad para Android. No hubo papel/fotos/tiempos físicos.

## Artefactos de compilación

- APK: `/Users/benjamin/Projects/POS/pos_flutter/build/app/outputs/flutter-apk/app-debug.apk`.
- macOS: `/Users/benjamin/Projects/POS/pos_flutter/build/macos/Build/Products/Debug/pos_flutter.app`.
- [SHA-256/tamaños actuales](logs/artefactos-build.json). No se instalaron/ejecutaron
  estos artefactos en un Android/impresora ni se abrió el POS de producción en el Mac.
  Compilar macOS no habilita impresión allí. iOS/Windows/web no se compilaron.

## Fallos propios, preexistentes y limitaciones

- Dos defectos propios demostrados corregidos: prueba ASCII sin método/raster y
  timeout nativo de permisos que terminaba el canal antes del diálogo; ver
  [auditoría](auditoria.md). Dos nuevas regresiones Dart y tres JVM.
- Durante ajustes, la primera ejecución dirigida falló por expectativas de la
  antigua prueba ASCII y por un widget que esperaba que la calibración no usara
  encoder. Se actualizaron esos fixtures y la espera DI para el renderer asíncrono;
  las dirigidas y la suite completa final pasan. Logs previos se conservan como
  diagnóstico (`probe-before-fix.log`, `targeted.log`), no como resultado final.
- La primera suite completa pasó y se repitió después de los últimos ajustes
  de exportación de evidencia/puente para verificar el estado final. Resultado
  final en `full-test-final.log`; no quedó fallo abierto automatizado.
- Diez omisiones existentes: nueve integraciones de proveedores requieren
  POS_SUPPLIER_SYNC_URL y una requiere POS_PHASE3_SYNC_URL contra Nest/PostgreSQL
  aislados. No se levantó servidor ni se modificó sincronización para esta sesión.
- Gradle avisa de APIs obsoletas para Gradle 9; el wrapper sigue en 8.14 y los
  13 JVM/compilación pasan. APK y macOS actuales no emitieron otros warnings.
- Pruebas de plugin JVM son lógica de futuros/sockets controlados, no Bluetooth
  ni diálogo de permisos real. Falta Android y papel para confirmar el stack,
  firmware, ancho/método, caudal y ciclo de vida. Ningún modelo se declara compatible.

La [matriz I01–I25](matriz-I01-I25.md) separa automatizado y físico por caso;
la [auditoría](auditoria.md) detalla garantías, memoria, renders y pendientes físicos.
