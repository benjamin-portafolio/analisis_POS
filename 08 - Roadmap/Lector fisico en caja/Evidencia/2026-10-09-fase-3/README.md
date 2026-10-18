# Evidencia de fase 3

Inicio 2026-10-09; continuidad/cierre parcial 2026-10-10. La fecha de la carpeta
corresponde al inicio. [Matriz e informe](../../Verificacion%20fase%203.md).

| Archivo | Uso |
| --- | --- |
| `estado-inicial.json`, `cambios-previos.patch`, `archivos-previos/` | HEAD y los 12 contenidos locales conservados (9 modificados, 3 nuevos) |
| `entorno.log`, `dart-version.log`, `macos-version.log`, `xcode.log` | Versiones y plataforma efectivamente usadas |
| `dart-analyze.log` y `.result.json` | Análisis limpio con timestamps y exit code |
| `flutter-test.jsonl`, `flutter-test-stderr.log`, `flutter-test.result.json` | Salida original y resumen: 1766 aprobadas/10 omitidas/0 fallidas |
| `flutter-test.log`, `regresion-lector-y-pantallas.json`, `pruebas-omitidas.json` | Lista de tests/resultados extraída de esa misma corrida, sin repetir tests |
| `flutter-build-macos-debug.log` y `.result.json` | Compilación nativa macOS debug de la aplicación principal |
| `windows-debug.log`, `lector-real.log`, `disponibilidad.json` | Pendientes y confirmaciones del usuario; no contienen una ejecución aprobada |
| `aislamiento-app.json`, `config-prueba.json`, `fixtures-app.json` | Identidad, firma, sandbox y fixture local exclusivo de prueba |
| `aplicacion-macos.md` | Registro de observaciones nativas; distingue simulación, teclado y hardware |
| `n01-*.json` hasta `n13-*.json` | Persistencia en SQLite de las lecturas y operaciones nativas descritas |
| `n14-*.json`, `n15-*.json`, `n16-*.json` | Contraste de pegado/Unicode no concluyente frente a escritura ASCII confirmada |
| `app-aislada.sqlite` | Snapshot consistente y completo de la base de fixtures; no es base habitual |
| `capturar_sqlite.py` | Helper utilizado para las capturas de solo lectura del contenedor aislado |
| `camara-native-diagnostico.log` | Log macOS limitado al PID de la copia de prueba: captura y parada; no acredita lectura de etiqueta |
| `usb-inventario.json` | Inventario disponible sin seriales; no acredita ausencia global ni prueba de lector |
| `conservacion.json`, `git-status-final.log`, `git-diff-check.log` | Huellas de contenidos/base habitual intactas y revisión de diferencias |

Los JSON de resultados llevan tiempos UTC de ejecución. Las fechas de las notas
usan America/Mexico_City del usuario. Los controles nativos se enviaron mediante
Computer Use; ninguna lectura se originó en un lector USB/Bluetooth real.
La copia nativa conserva `not_required` y cero `event_refs` en standalone.

No hay modificaciones funcionales propias de fase 3; no se generó esquema Drift.
La app aislada conserva la base de fixtures para poder realizar el contraste
manual solicitado. No se publica, distribuye ni se modifica la instalación habitual.
