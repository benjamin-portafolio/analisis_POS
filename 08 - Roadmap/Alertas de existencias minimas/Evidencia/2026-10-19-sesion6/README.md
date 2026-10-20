# Sesión 6 complementaria: verificación física pendiente — 2026-10-19

**A42 parcial, prueba física pendiente; no hay cierre total.** No se detectó un
teléfono/tablet físico accesible. A01–A41 conservan su acreditación de sesión 5.
No se ejecutó el recorrido móvil ni se usó un simulador como sustituto.

Detección: **2026-10-19, 09:48:56–09:49:17, America/Mexico_City (UTC−06:00)**.
[Comandos, horas, salidas y exits](discovery.json),
[continuidad](../../Estado%20y%20continuidad.md),
[matriz](../../Matriz%20de%20aceptacion.md) y
[plan](../../Plan%20de%20implementacion.md).

## Lectura y estado vigente

Se leyó primero Estado y continuidad; después plan, matriz, evidencia de sesión 5
(README, Manual, A42 de Casos y manifest) y AGENTS del vault y Flutter.
No se usan subagentes. Flutter HEAD `3e8e1ed`, Nest `dcc2907`, vault `b077dc7`;
[baseline.json](baseline.json) registra los HEAD completos, estados Git y SHA256
de todos los archivos no ignorados existentes, incluidos cambios sin commit.
La carpeta de esta sesión se excluye del snapshot del vault para evitar autorreferencia.

[previous-evidence-validation.json](previous-evidence-validation.json) compara
el manifest final de sesión 5 contra los archivos vigentes **antes** de actualizar
la documentación: 48 Flutter, 12 Nest y 276 del vault coinciden, cero ausentes o
diferentes. Se conservan las pruebas aprobadas; no se les atribuye una nueva corrida.
No se identificó un defecto funcional nuevo: la ejecución física no pudo comenzar.

## Detección real

Comandos ejecutados desde `/Users/benjamin/Projects/POS/pos_flutter`. Todos exit 0,
sin stderr ni timeouts. Las rutas completas y tiempos están en discovery.json.

| Comando | Resultado observado | Evidencia |
|---|---|---|
| `flutter devices --machine --device-timeout 20` | iPhone 17 con `emulator=true` (iOS simulado 26.5); macOS y Chrome. Cero móviles físicos | [flutter-devices.log](flutter-devices.log) |
| `adb devices -l` | Solo cabecera; cero Android, tampoco entradas unauthorized/offline | [adb-devices.log](adb-devices.log) |
| `xcrun devicectl list devices --json-output <archivo de evidencia>` | Cuatro registros, todos `reality=simulated`; iPhone 17 conectado es un simulador, los otros apagados | [apple-devices.json](apple-devices.json), [salida](apple-devices.log) |
| `xcrun xctrace list devices` | Solo MacBook Air en Devices; iPhone/iPad exclusivamente en Simulators | [xctrace-devices.log](xctrace-devices.log) |
| `system_profiler SPUSBDataType -json` | `SPUSBDataType: []`; sin entradas USB reportadas | [usb-devices.log](usb-devices.log) |

La conclusión se limita a hardware accesible a este Mac en esa ventana.
No se afirma que el usuario no disponga de un equipo desconectado.
macOS y Chrome con emulator=false no son teléfono/tablet. El estado connected
de un registro Apple no demuestra hardware cuando reality indica simulated.

## Dispositivo e instalación

| Dato solicitado | Registro de esta sesión |
|---|---|
| Modelo y sistema operativo físicos | No disponibles: ningún móvil físico detectado |
| Versión/build de la app instalada en móvil | No verificable; no se instaló ni abrió la app |
| Versión declarada en el código | `pubspec.yaml:4`, `0.1.0+1`; no es evidencia de versión instalada |
| Idioma, teclado real y separador decimal | No verificables sin dispositivo |
| Escala efectiva de texto y dimensiones/orientación | No verificables sin dispositivo |
| Instalación y datos de prueba aislados | No creados: falta hardware; no se declara aislamiento móvil probado |

No se ejecutó flutter run/build/install, adb install, desinstalación, reset de
datos ni comandos de instalación/lanzamiento Apple. No se abrió ninguna SQLite
operativa, no se cargó .env y no se inició PostgreSQL/HTTP. No hay cuenta Drive ni
respaldo operativo involucrados. No se cambió código Flutter, backend o configuración
de paquetes. No hubo commit, push, despliegue, dependencia nueva o migración.

## A42

La parte de regresión permanece acreditada en sesión 5: analyze limpio, 2567
Flutter aprobadas (23 HTTP incluidas), cero fallos/omisiones, refuerzo final de
68 pruebas de conservación y build macOS. Nest conserva build/50 suites/587 de
sesión 3. Ver [A42 histórico](../2026-10-19-sesion5/Casos.md#A42).

**Ninguna prueba física de los pasos siguientes se ejecutó en sesión 6.**
Todos permanecen pendientes por el mismo prerrequisito: teléfono/tablet real
conectado y autorizado para desarrollo, con acceso a su pantalla y teclado.

| Paso pendiente | Ejecución y evidencia necesarias para aprobar |
|---|---|
| 1. Identificar hardware | Registrar modelo, SO/build, versión/build e identidad de la app instalada, idioma/región, teclado/separador, dimensiones/orientación y escala de texto efectiva |
| 2. Aislar instalación y datos | Antes de instalar, preparar applicationId/bundle ID exclusivo y nombre visible de prueba, con contenedor/base propios, sin reemplazar la instalación operativa. Usar standalone y datos ficticios, sin Drive ni endpoints operativos. Acreditar ambas identidades y la base aislada; no reutilizar el main normal con reset sobre datos del usuario |
| 3. Capturar mínimo en kg con teclado real | Abrir desde Artículos y registrar el teclado desplegado. Capturar punto y coma (`1.5`/`1,5`) y tres decimales (`1.001`/`1,001`), verificando 1500/1001 átomos en datos aislados. Registrar cómo se introduce cada separador; pegado o teclado externo no prueban por sí solos las teclas del teclado virtual. Comprobar precisión excedida (`1.0001`) sin guardar un mínimo incorrecto; cero válido y vacío explícito retira. Guardar/reabrir para acreditar el valor |
| 4. Texto grande y navegación | Registrar escala real, aumentar texto y verificar etiquetas/valores/botones sin recorte que impida uso; desplazar hasta Existencia mínima y Proveedores con teclado abierto/cerrado. Recorrer Artículos → editor → informe → Caja → regreso y comprobar conservación del estado. Registrar/restaurar los ajustes del dispositivo utilizados |
| 5. Recorrido con piezas | Datos iniciales seis, mínimo cinco; venta confirmada de una deja cinco y muestra aviso por igualdad. Reponer una a seis lo retira. Editar desde informe, reabrir con mínimo guardado, vaciar explícitamente y reabrir de nuevo con Sin mínimo. Guardar capturas y lecturas de la base aislada por etapa |
| 6. Repetición medida | Repetir configuración/venta/reposición/edición/vacío/reapertura con kg (seis → cinco → seis); añadir mínimo decimal exacto. La comparación debe usar átomos sin redondeo de float |
| 7. Contador, filtros y cancelación | En ambos recorridos cotejar tarjeta/contador y filas de Todas/Existencias bajas; comprobar vacío al retirar la última alerta. Modificar y cancelar desde Artículos/informe; reabrir y confirmar valor anterior y ausencia de eventos por cancelación |
| 8. Offline y preservación final | Ejecutar el recorrido con conectividad desactivada y standalone, documentando el estado de red y persistencia tras cerrar/reabrir. Comprobar not_required, cero event_refs y ausencia de actividad remota en esa instalación. Confirmar que instalación/datos operativos se conservaron y registrar limpieza limitada a pruebas |

Los pasos no sustituyen evidencia: cada uno requiere resultado observado,
capturas/logs y, cuando corresponda, lectura exclusiva de la base de prueba.
Si se detecta un defecto atribuible, corregirlo y ejecutar pruebas afectadas y
checks de AGENTS (dart analyze/flutter test; build_runner solo si cambia Drift).
El cierre total solo procede después de acreditar este recorrido físico.

## Checks y preservación de esta sesión

No hubo cambio funcional o de esquema; no se repiten analyze, flutter test,
builds, pruebas HTTP/Nest ni build_runner. La comparación de hashes no acredita
hardware; conserva la atribución de la regresión anterior.

[preservation.json](preservation.json) coteja baseline al finalizar: todos los
archivos previos Flutter/Nest conservados; en el vault solo se actualizan plan,
matriz y continuidad de esta funcionalidad, además de añadir esta evidencia.
Las evidencias 1–5 y los otros planes permanecen idénticos.
[checks.json](checks.json) registra git diff --check de los tres árboles y
validación de los enlaces locales nuevos. [manifest.json](manifest.json) contiene
hashes de las tres notas finales y de esta evidencia (excepto el propio manifest).

Próximo paso: conectar/desbloquear un teléfono o tablet físico y autorizar su
acceso de desarrollo; volver a enumerarlo y completar los pasos pendientes.
A42 no se promueve a verificado y el plan sigue implementado pendiente de
verificación física.
