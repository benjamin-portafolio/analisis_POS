# Resultados del ajuste de transmisión — 2026-10-09

**Verificación automatizada completa; revalidación física pendiente.** Estos
comandos se ejecutaron después del cambio a bloques de 256 bytes y pausas de
40 ms incluyendo el último bloque. Las horas son America/Mexico_City (UTC−06).

| Comando | Resultado | Hora y duración | Evidencia |
|---|---|---|---|
| `./gradlew :pos_bluetooth_printer:testDebugUnitTest` | 15 JVM aprobadas (12 transporte + 3 permisos), cero errores/fallos; exit 0 | 10:28:42–10:28:52 (9.89 s) | [Log](logs/jvm.log) / [metadatos](logs/jvm.json) |
| `dart analyze` | Sin problemas; exit 0 | 10:28:42–10:28:52 (9.72 s) | [Log](logs/analyze.log) / [metadatos](logs/analyze.json) |
| `flutter test --reporter expanded` | 1681 aprobadas, 10 omitidas preexistentes, cero fallos; exit 0 | 10:29:42–10:31:07 (85.32 s) | [Log](logs/flutter-test.log) / [metadatos](logs/flutter-test.json) |
| `flutter build apk --debug` | APK debug generado con el ajuste Kotlin; exit 0 | 10:31:35–10:31:51 (16.9 s) | [Log](logs/apk.log) / [metadatos](logs/apk.json) |
| `flutter build macos --debug` | Aplicación macOS debug generada; exit 0 | 10:32:59–10:33:24 (25.19 s) | [Log](logs/macos.log) / [metadatos](logs/macos.json) |

Los tests JVM incluyen las dos regresiones nuevas de pausa final/exclusión y
cierre durante esa pausa. Sus [XML](jvm/) tienen cero errores/fallos/omisiones.
Las 10 omisiones Flutter corresponden a integraciones que exigen un servidor
NestJS/PostgreSQL aislado: nueve `POS_SUPPLIER_SYNC_URL` y una
`POS_PHASE3_SYNC_URL`. No se levantó ni modificó backend.

Gradle emitió su aviso de APIs deprecadas para Gradle 9 y el build macOS avisó
que `mobile_scanner` usa `AVCaptureDevice.devices(for:)` deprecado. Ambos builds
terminaron correctamente; no se modificaron dependencias para esos avisos.

## Artefacto Android

[APK debug actualizado](/Users/benjamin/Projects/POS/pos_flutter/build/app/outputs/flutter-apk/app-debug.apk)

- Tamaño: 221345451 bytes.
- SHA-256: `16d6918fe1fd4cc4452a413bdae1e5bd6c52dc79347fd152b846829a748204f6`.
- [Registro del artefacto](logs/apk-artefacto.json).

El cambio es nativo Kotlin. Requiere instalar la app completa y reiniciar su
proceso; hot reload/hot restart de Dart no actualiza el plugin. Actualizar sin
borrar datos/perfiles y repetir manualmente la prueba, el recibo y la cotización
que fallaron. La pausa aumenta la duración de envío: observarla en el equipo.
Este APK no se instaló en un Android físico por el agente.

## Manifest y conservación de alcance

[Manifest debug fusionado](logs/AndroidManifest-debug.xml) y
[permisos extraídos](logs/manifest-permisos.json): `BLUETOOTH_CONNECT`,
`BLUETOOTH` limitado a SDK 30 y hardware Bluetooth opcional. Sin SCAN, ADMIN,
ADVERTISE ni permisos de ubicación. Ningún manifest/dependencia/configuración
persistida cambió durante esta intervención.

La comparación contra el [snapshot previo](logs/flutter-baseline.json) identifica
[solo tres archivos cambiados](logs/cambios-propios.json): transporte nativo,
sus pruebas y README del paquete. El resto del working tree previo se conserva,
incluido negocio, Drift, eventos, sync, backups, DI, renderer y encoder. `git diff
--check` terminó con exit 0 en Flutter y análisis. El [diff del transporte](logs/transporte.diff)
se conserva junto al original. No se añadieron transportes/reintentos/colas,
feed/reset entre bandas ni cambios de método/ancho.

## Límite de estos resultados

La [fotografía original](foto-usuario-original.png) demuestra salida corrupta
previa al ajuste y una prueba raster legible para 58 mm/384 puntos/gsV0. No es
una prueba del APK nuevo. ADB solo dispone del emulador; falta verificar el mismo
recibo/cotización en esa impresora. Modelo/firmware/Android y buffer siguen sin
identificar. La hipótesis de caudal/desalineación debe confirmarse o descartarse
con el resultado en papel; no se declara resuelta la incidencia ni compatible
un modelo por estos tests. Los casos físicos I09/I10 siguen abiertos; los demás
pendientes se mantienen en la [continuidad](../../Estado%20y%20continuidad.md).
