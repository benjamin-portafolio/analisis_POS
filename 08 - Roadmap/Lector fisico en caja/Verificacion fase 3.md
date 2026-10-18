---
tipo: verificacion
estado: cierre_parcial
actualizado: 2026-10-10
---

# Verificación de fase 3: lector físico en Caja

**Cierre parcial.** Análisis y suite completos aprobados, compilación macOS debug
aprobada y aplicación principal ejercitada en una instalación aislada con entrada
simulada. El usuario confirmó que no hay lector físico ni equipo Windows. La
matriz distingue los casos automatizados, nativos y físicos; los pendientes no
cuentan como aprobados. No se declara verificación completa de escritorio/hardware.

## Estado verificado

Trabajo iniciado el 2026-10-09 y continuado el 2026-10-10, fechas del usuario en
America/Mexico_City. HEAD `a10df777e078394cca3068c049972bebf4211ad2`, con 9 archivos
modificados y 3 sin seguimiento de la fase 2. Se guardaron diff, copias de los 3
archivos nuevos y SHA-256 de los 12 contenidos iniciales. El HEAD por sí solo no
representa la integración: conservar también `cambios-previos.patch`,
`archivos-previos/` y `estado-inicial.json`. No se modificó código Flutter en
fase 3, ni se añadió funcionalidad, dependencia, esquema o sincronización.

Entorno real: macOS 27.0.1 (26A434), arm64; Flutter 3.41.6 stable, framework
`db50e20168`, engine `425cfb54d0`; Dart 3.11.4; Xcode 27.0 (27A266a).

Se leyeron AGENTS de Flutter y del vault, el plan completo con sus fases 1/2 y
ambas guías offline. Se revisaron campo/controlador/coordinador, barreras de
Caja/Home/menú, cámara, editor y Artículos. No se repitió la implementación.

## Comandos y comparación con fase 2

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| `dart analyze` | Aprobado: sin incidencias, exit 0 | [Log](Evidencia/2026-10-09-fase-3/dart-analyze.log), resultado JSON |
| `flutter test --reporter=json` | Aprobado: 1766 aprobadas, 10 omitidas, 0 fallidas, exit 0 | [Resumen](Evidencia/2026-10-09-fase-3/flutter-test.result.json), `flutter-test.jsonl`, listado `flutter-test.log` |
| `flutter build macos --debug` | Aprobado: app principal debug generada, exit 0 | [Log](Evidencia/2026-10-09-fase-3/flutter-build-macos-debug.log) |
| `flutter build windows --debug` | Pendiente: no ejecutado, sin equipo Windows | [Registro](Evidencia/2026-10-09-fase-3/windows-debug.log) |
| `git diff --check`; contenido previo; base habitual | Sin errores; conservación de huellas | `git-diff-check.log`, `conservacion.json` |

La fase 2 registró análisis limpio y **1766 aprobadas/10 omitidas**. La corrida
actual coincide y no reproduce el timeout previo de proveedores. Las 10 omitidas
se detallan en `pruebas-omitidas.json`; no se presentan como ejecutadas. No hubo
fallos automatizados ni correcciones funcionales. El contraste nativo de pegado
permanece no concluyente, como se detalla en N20. No corresponde
`build_runner` porque no hubo cambios en tablas/DAOs/esquema.

La compilación macOS registra una advertencia en el plugin instalado
`mobile_scanner 7.4.2`: `AVCaptureDevice.devices(for:)` deprecado. No impide compilar;
no se modificó el plugin ni se amplió el alcance. macOS no acredita Windows.

## Aplicación nativa y datos

La copia usa `lib/main.dart` y el mismo código Dart compilado, con bundle ID y
sandbox propios. Antes del primer arranque se verificaron firma/entitlements y
la ruta separada prevista; después se confirmó el contenedor real. Se preparó
catálogo desechable en esa base. No se abrió la app habitual para el ensayo.
Se verificó su base por SHA-256 antes y después; no se ejecutó el reinicio de
esquema sobre datos habituales. Identidad, rutas y huellas están en
[aislamiento-app.json](Evidencia/2026-10-09-fase-3/aislamiento-app.json).

El [registro de la aplicación](Evidencia/2026-10-09-fase-3/aplicacion-macos.md)
contiene acciones/observaciones y puntos de comprobación SQLite. Las capturas
n01–n13 conservan cantidades, eventos y las tres identidades sucesivas de venta.
N01 muestra A×1; N02 A×3; N03 A×5/B×1 con los eventos A/B/A en secuencias 4–6.
La selección añade solo C; cantidad medida confirma 500 átomos de kg. Cobro usa
$113 y cotización $115 después de otra B. Nueva captura y limpieza no heredan
líneas de la venta anterior.

Computer Use sufrió un bloqueo del Mac y después se retomó la prueba reabriendo
solo la copia; el borrador se conservó. El ensayo de segundo plano se realizó
además de forma explícita mediante Cmd-H y regreso desde Window. El texto
incompleto se limpió y el lector exigió reanudación.

## Matriz de resultados

En filas automatizadas, el dispositivo real es el host macOS arm64; los targets
macOS/Windows son overrides de widgets, y standalone/server_sync usan comandos,
handlers, SQLite y repositorios reales. No son compilaciones Windows.
`regresion-lector-y-pantallas.json` contiene nombres y resultados de cada test,
extraídos de la corrida completa. Incluye 32 widgets físicos, 37 tests del
controlador, 15 del coordinador, 11 de menú, 46 de cámara de Caja, 2 de flujo,
20 del editor y 20 de Artículos/búsqueda.

| ID | Caso | Plataforma y dispositivo | Tipo | Resultado | Evidencia/motivo |
| --- | --- | --- | --- | --- | --- |
| A01 | Inicio desactivado; activar muestra campo/foco y estado | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; physical_barcode_reader_test.dart: activar una vez y Enter FIFO/repetidos |
| A02 | Código + Enter confirma comando y borrador reabierto | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; physical_barcode_reader_test.dart: activar una vez; barcode_draft_flow_test.dart |
| A03 | Tres iguales son tres intenciones/eventos, sin deduplicar | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; physical_barcode_reader_controller_test.dart: tres códigos iguales durante guardado |
| A04 | A → B → A en FIFO durante consulta/guardado retenidos | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; physical_barcode_reader_controller_test.dart: FIFO; widget activar una vez |
| A05 | Vacío/repetido no agrega; rechazo íntegro y límite 32 | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; physical_barcode_reader_test.dart: vacío/repetido, inválidos íntegros, límite sin truncado y NFKC |
| A06 | Ceros iniciales, trim/NFKC y desconocido seguido de conocido | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; controlador trim/NFKC y desconocido; widget vacío/repetido |
| A07 | Selector: confirmar una variante/cancelar conserva FIFO | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget selector propio conserva FIFO y foco, cancelar=false/true; coordinador varias coincidencias |
| A08 | Cantidad medida, unidad y cancelación | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget cantidad propia; coordinador cantidad/expectedUnitId y unidad cambiada/inactiva |
| A09 | Error SQLite/consulta y respuesta incierta: pausa sin reintentar | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; controlador error real SQLite y después de commit; widget error final del drenaje, commit=false/true |
| A10 | Búsqueda manual y retorno coordinado | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget búsqueda textual vuelve con modo/foco; pérdida de ventana durante búsqueda |
| A11 | Cámara espera lector; conserva contrato y retorno | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget cámara espera lector; sale_barcode_scanner_screen_test.dart (46); barcode_draft_flow_test.dart (2) |
| A12 | Edición usa la revisión posterior al drenaje | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget edición recibe cantidad posterior al drenaje |
| A13 | Menú, módulo, rutas externas y regreso sin sesión vieja | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget Home/menú/ruta externa/cerrar menú; menu_lateral_test.dart (11) |
| A14 | Cobro, limpieza y cotización resuelven cola antes de leer revisión | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget cobro drena cola; limpieza espera cola; cotización guarda revisión drenada |
| A15 | Pérdida de ventana/app limpia fragmento y exige reanudación | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget perder ventana/aplicación; pausa externa durante cantidad; interrupción durante búsqueda |
| A16 | Tab respeta foco accesible sin recuperación continua | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget Tab respeta foco de botones y permite reanudación |
| A17 | Desactivar/drenar/descartar espera commit e invalida lo no iniciado | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget desactivar drena, Home espera guardado y descarte, menú espera consulta; controlador descartar durante guardado |
| A18 | Nueva venta no recibe cola anterior; sesiones obsoletas se descartan | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; widget limpieza/nueva captura; controlador una consulta de la sesión anterior y respuestas tardías |
| A19 | not_required en ambos modos; refs persistidas solo en server_sync; idempotencia | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; coordinador pieza, contrato e idempotencia reales en standalone/serverSync; widget combinaciones de plataforma/modo |
| A20 | Editor de variantes y Artículos conservan contratos | Host macOS arm64; overrides macOS/Windows donde aplica | Automatizada | aprobado | `regresion-lector-y-pantallas.json`; variant_editor_barcode_test.dart (20); articles_screen_test.dart (5), article_search_screen_test.dart (9), article_search_item_test.dart (6) |
| N01 | Modo inicialmente off; activar/foco/listo | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Registro nativo, pasos 1 y 6; n01 |
| N02 | 001 + Enter: una unidad persistida y campo limpio | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | n01-una-lectura.json |
| N03 | Tres iguales consecutivas sin clic entre lecturas | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | n02-tres-iguales.json: A×3 y 3 eventos |
| N04 | Ráfaga A → B → A y orden de eventos | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | n03-rapidas-aba.json: secuencias 4–6 A/B/A; A×5/B×1 |
| N05 | Vacío/repetido, 001A y 33 dígitos | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | n04-vacio-invalidos.json: conserva 6 eventos |
| N06 | Ceros iniciales y desconocido 999 | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | fixtures-app.json barcode=001; n01; n05 conserva venta |
| N07 | Selector C/D: cancelación y elección exclusiva de C | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | n05 y n06-selector-cantidad.json; D ausente |
| N08 | Cantidad 0.5 kg y cancelación | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | n06-selector-cantidad.json: M=500 átomos, total $110 |
| N09 | Tab limpia fragmento y permite salir del campo | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Registro nativo paso 8; pausa, campo vacío y foco visual de botón de edición |
| N10 | Segundo plano/retorno exige reanudación y no concatena | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Registro nativo paso 8: Cmd-H/Window/Reanudar; B×2 en n07 |
| N11 | Búsqueda textual y regreso, sin capturas desde el buscador | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Registro nativo paso 9; n07-tab-segundo-plano-busqueda.json |
| N12 | Edición recibe cantidad actualizada y cerrar conserva venta | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Registro nativo paso 10: A=6 en editor; n08-navegacion-cobro.json |
| N13 | Abrir/cerrar cámara mantiene mismo borrador | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Registro nativo paso 11; n08; camara-native-diagnostico.log. Se acredita navegación, no decodificación. |
| N14 | Menú/Artículos/regreso: restaura o termina modo según ruta | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Registro nativo paso 12; al volver de Artículos, off y $113 |
| N15 | Cobro obtiene total actualizado y cancelar conserva captura | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Efectivo $113; n08-navegacion-cobro.json; no se confirmó pago |
| N16 | Cotización y nueva captura con revisión actualizada | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | n09-cotizacion.json: B×3, total $115; n10-nueva-captura.json |
| N17 | Desactivar conserva guardado; limpiar y crear otra venta | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | n11-desactivar-nueva-venta.json, n12-limpiar.json, n13-venta-posterior.json |
| N18 | Standalone mantiene not_required y cero refs | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | aprobado | Capturas n01–n13; AppConfig standalone; no transporte de servidor |
| N19 | Retener consulta/guardado nativo para comprobar drenaje/descarte/cola | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | pendiente | La app se probó con latencias normales; no hubo retención controlada nativa. A04/A14/A17/A18 aprobados automatizadamente. |
| N20 | Pegado ASCII y NFKC con envío nativo | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | pendiente | n14/n15: texto mostrado y limpiado sin evento adicional; escritura ASCII sí agrega. Requiere contraste manual solicitado; NFKC y entradas textuales pasan en A05/A06. |
| N21 | Decodificación, formatos y permisos interactivos de cámara | macOS 27.0.1 arm64; POS Fase 3 aislada | Aplicación con entrada simulada | pendiente | No se presentó etiqueta ni se ejercitó un permiso interactivo; preview negro. A11/A20 cubren contratos con plataforma falsa. |
| H01 | Modelo/SO/conexión/configuración de lector; modo teclado HID y sufijo Enter en editor | USB/Bluetooth sin dispositivo | Lector real | pendiente | No hay lector disponible, confirmado por el usuario; lector-real.log |
| H02 | Conservar ceros en salida física | USB/Bluetooth sin dispositivo | Lector real | pendiente | Pendiente en lector real; los ceros por teclado/simulación no acreditan HID |
| H03 | Lecturas consecutivas, rápidas e iguales e incremento por lectura | USB/Bluetooth sin dispositivo | Lector real | pendiente | Pendiente en lector real; A03/A04 y N03/N04 son otros tipos de prueba |
| H04 | Foco, pausas y reanudación con lector real | USB/Bluetooth sin dispositivo | Lector real | pendiente | Pendiente; N09/N10 no usaron lector |
| H05 | Desconexión y reconexión USB | USB sin dispositivo | Lector real | pendiente | No se conectó un lector USB; inventario USB no acredita transporte |
| H06 | Desconexión y reconexión Bluetooth | Bluetooth sin dispositivo | Lector real | pendiente | No se conectó un lector Bluetooth; USB no acreditaría Bluetooth |
| W01 | flutter build windows --debug y ensayo nativo Windows | Windows sin equipo | Compilación/app nativa | pendiente | No hay equipo Windows disponible, confirmado por el usuario; windows-debug.log |

## Limitación vigente y pendientes

Pausar el modo evita agregados desde el lector a la venta, pero **un dispositivo
HID puede escribir como teclado en otro campo enfocado** (cantidad, efectivo o
búsqueda). No se identifica el dispositivo ni se bloquea físicamente su entrada.

1. Compilar y ejecutar Windows en un equipo Windows; guardar su log y resultados.
2. Probar un lector real: modelo/configuración, HID + Enter en editor, ceros,
   iguales/rápidas, foco/pausas y desconexión/reconexión. Registrar USB y Bluetooth
   por separado según el transporte realmente usado.
3. Completar N19 en la app nativa con una operación retenida de forma trazable:
   drenaje/descarte/reanudación antes de cobro, limpieza, cotización y navegación.
   La lógica está aprobada en los tests A04/A14/A17/A18; el ensayo de latencias
   normales no acredita esa condición nativa.
4. Contrastar N20 con pegado manual: la herramienta mostró texto sin confirmar
   un nuevo evento, mientras la escritura ASCII sí agregó. No se atribuye ese
   resultado al lector sin aislar foco/automatización. NFKC sigue aprobado en tests.
5. La cámara conserva pendientes físicos de su plan: etiqueta real, formatos,
   retirada/enfoque, permisos y comparación editor/Caja. Abrir/cerrar la ruta no
   acredita esas comprobaciones. El ensayo nativo de este lector fue standalone;
   server_sync se verificó automatizadamente sin añadir un servidor.

No se corrige un defecto hipotético a partir de una limitación de automatización.
La fase 3 conserva evidencia de lo disponible y deja cada condición no comprobada
marcada. Las fases 1 y 2 y las comprobaciones físicas pendientes de la cámara
mantienen su historia.
