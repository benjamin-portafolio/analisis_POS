---
tipo: plan_implementacion
estado: planificado
revision: 1
actualizado: 2026-10-08
---

# Impresión de tickets desde Android

## Objetivo y solicitud

Habilitar la impresión directa desde el POS Flutter de recibos de venta y
cotizaciones, usando impresoras térmicas Bluetooth. Permitir configurar varias
impresoras y elegir una predeterminada por instalación. Las primeras pruebas
físicas se realizarán con la impresora de 58 mm del usuario.

Este documento es un plan: la impresión todavía no está implementada. La
continuidad se registra en [[08 - Roadmap/Impresion de tickets/Estado y continuidad|Estado y continuidad]].

## Alcance de la primera versión

1. Android y térmicas compatibles con ESC/POS por Bluetooth. La conexión inicial
   candidata es Bluetooth Classic/SPP; comprobar el transporte real de la
   impresora del usuario antes de declarar compatibilidad. El nombre Bluetooth
   y la publicación comercial no demuestran por sí solos ese transporte.
2. Varias impresoras guardadas, con una predeterminada y posibilidad de elegir
   otra para un envío. Una impresora por ticket y una operación activa en la app.
3. Perfiles de papel de 58 y 80 mm, con ancho imprimible y comando de imagen
   definidos por perfil. No identificar ni configurar una impresora solo por
   su nombre: distintos equipos pueden llamarse `BlueTooth Printer`.
4. Configuración accesible en `standalone` y `server_sync`; funcionamiento sin
   internet. Solicitar permisos al usar la función, sin conexiones al arrancar.
5. Impresión de prueba, impresión manual y reimpresión manual desde recibos y
   cotizaciones. Un envío interrumpido no se reintenta automáticamente.

Por ahora quedan fuera: USB, red/Wi-Fi, impresión desde iOS/macOS/Windows,
protocolos propietarios, impresoras de etiquetas, envío simultáneo a varios
destinos, comandas de cocina/barra, corte de caja, apertura de cajón,
impresión automática al cobrar y cola persistente de trabajos. Si la primera
impresora requiere BLE en lugar de SPP, ajustar y documentar el transporte
necesario para ese equipo dentro de la fase 1; no afirmar soporte BLE genérico.

Estas son decisiones de partida para implementar la solicitud. No son una
promesa de compatibilidad con cualquier impresora que tenga Bluetooth.

## Base real inspeccionada

Proyecto: `/Users/benjamin/Projects/POS/pos_flutter`, rama `main`, HEAD
`56ddbc4`, Flutter 3.41.6 y Dart 3.11.4. Hay cambios locales preexistentes en
Cotizaciones, Proveedores, DI, modelos y pantallas. Releer los AGENTS vigentes
y conservar ese trabajo en cada sesión; no tratar el HEAD como toda la base real.

| Punto | Estado observado | Trabajo previsto |
|---|---|---|
| `lib/presentation/pages/caja/sale_receipt_screen.dart` | Recibo con imagen y compartir; `Imprimir` deshabilitado | Incorporar acción de impresión inyectable y estados de envío |
| `lib/presentation/pages/cotizaciones/quotation_ticket_screen.dart` | Imagen/compartir y botón `Imprimir` con `onPressed: null` | Reutilizar el mismo servicio y selector |
| `lib/presentation/pages/caja/models/sale_receipt_display.dart` | Ticket tomado de `ConfirmedSale`, con snapshots del cobro | Imprimir esos datos sin consultar precios actuales |
| `lib/presentation/pages/cotizaciones/models/quotation_display.dart` | Selección durable más estimación temporal de precios vigentes | Capturar el documento visible para cada envío, sin persistir precios |
| `lib/presentation/tickets/ticket_document.dart` | Documento común inmutable, sin Flutter ni SQLite | Reubicar el modelo compartido fuera de presentation si lo consume application/data |
| `lib/presentation/tickets/ticket_image_generator.dart` | PNG de 440 unidades lógicas a escala 2: 880 píxeles de ancho | Conservar compartir; generar una salida térmica adaptada al papel |
| `lib/presentation/pages/pantalla_principal/sync_settings_screen.dart` | Configuración usada en ambos modos | Agregar acceso «Impresoras» fuera del bloque exclusivo del servidor |
| `lib/data/local/config/app_config_file_store.dart` | Patrón de archivo local en Application Support | Usar un archivo propio para impresoras, sin mezclarlo con negocio/sync |
| `lib/core/di/data_dependencies.dart` y `application_dependencies.dart` | Registro de adaptadores y servicios en GetIt | Registrar almacenamiento, gateway, encoder y servicio compartido |
| `pubspec.yaml` | Sin dependencia de impresión ni gestión Bluetooth | Seleccionar dependencia compatible y fijar versiones comprobadas |
| `android/app/src/main/AndroidManifest.xml` | Sin permisos Bluetooth explícitos | Declarar y comprobar permisos efectivos del manifest combinado |
| Pruebas actuales de recibo/cotización | Exigen que `Imprimir` esté deshabilitado | Actualizar esa expectativa y conservar cobertura de compartir/navegación |

Android usa AGP 8.11.1, Kotlin 2.2.20 y Gradle 8.14. La selección de dependencia
debe comprobar este conjunto, además de las restricciones Dart/Flutter.

### Equipo inicial y límites de la inspección

En `system_profiler SPBluetoothDataType -json` del Mac aparece
`BlueTooth Printer`, dirección `5A:4A:C6:68:99:9D`, clasificada como impresora
y desconectada. Es un dato de referencia, no una dirección a incrustar en código.
`adb devices -l` no mostró dispositivos Android conectados.

La [publicación proporcionada por el usuario](https://articulo.mercadolibre.com.mx/MLM-4411688024-impresora-termica-tickets-de-58mm-con-bluetooth-y-puerto-usb-6-rollos-papel-termico-de-58-mm-impresora-portatil-bluetooth-nergo-negro-_JM)
no pudo abrirse directamente. La ficha de catálogo con el mismo título describe
papel de 58 mm, USB/Bluetooth y emulación Epson ESC/POS. También contiene datos
inconsistentes de tecnología y velocidad; no tomarla como certificación técnica.
[Ficha comercial consultada](https://www.mercadolibre.com.mx/impresora-termica-tickets-de-58mm-con-bluetooth-y-puerto-usb-6-rollos-papel-termico-de-58-mm-impresora-portatil-bluetooth-nergo/p/MLM52919280).

Validar modelo, transporte, ancho imprimible y comandos mediante el manual,
autotest del equipo y pruebas en Android. El registro Bluetooth del Mac no
demuestra que sea el mismo equipo de la publicación ni que Android pueda imprimir.

## Experiencia prevista

### Configuración de impresoras

Desde Configuración → Impresoras:

1. Mostrar las impresoras guardadas, su papel y cuál es la predeterminada.
2. «Agregar impresora» lista dispositivos ya vinculados en Android. Si falta
   el equipo, explicar cómo vincularlo en los ajustes Bluetooth del sistema y
   ofrecer volver a cargar la lista. No iniciar descubrimiento continuamente.
3. Seleccionar un dispositivo, asignar alias y papel, y guardar su perfil.
   La dirección identifica el dispositivo; guardarlo otra vez edita su perfil.
4. «Imprimir prueba» envía un documento identificable con impresora/papel,
   caracteres españoles, nombre largo, importes, cantidades y marcas de margen.
5. Permitir editar el perfil, elegir predeterminada y quitarlo de esta app.
   Quitar un perfil no desvincula el dispositivo de Android. Si se quita la
   predeterminada, dejar la selección vacía; no elegir otro destino silenciosamente.

Alias y papel son ajustes del usuario. Ancho en puntos y método ESC/POS forman
parte del perfil de compatibilidad; mantenerlos fuera del flujo normal de venta.
La lista vinculada puede contener audífonos u otros equipos: seleccionarlos no
los convierte en impresoras compatibles. Manejar el rechazo sin bloquear la UI.

### Impresión desde un ticket

- Con documento disponible, Android soportado y servicio libre, habilitar
  «Imprimir». Sin impresoras guardadas, abrir el flujo de configuración.
- Con predeterminada, mostrar un diálogo breve con destino/papel, opción
  «Cambiar impresora» y botón de envío. Sin predeterminada, pedir selección.
  Elegir para este envío no cambia la predeterminada salvo acción explícita.
- Congelar el `TicketDocument` y el perfil al aceptar el envío. Un cambio de
  precios en Cotizaciones o de configuración no modifica un trabajo en curso.
- Mostrar «Enviando a …» y deshabilitar nuevos envíos mientras dure la operación,
  incluidos los de prueba y los de otras pantallas. No encolar pulsaciones repetidas.
- Al completar la escritura, mostrar «Ticket enviado a la impresora». La API de
  bytes no demuestra que haya papel o que el documento haya salido completo;
  no mostrar «Impresión confirmada» sin un acuse físico soportado y comprobado.
- Permitir reimpresión por una nueva acción del usuario. Abrir el recibo, volver
  de segundo plano o reiniciar la app nunca provoca otro envío.

No añadir un formulario de ticket ni recalcular importes. En ventas se imprimen
los snapshots confirmados. En cotizaciones se conservan la fecha de creación,
fecha del cálculo, leyenda de precios vigentes y aviso de que no representan
pago ni reserva. Mantener «Precio/Importe/Total no disponible» cuando corresponda.

## Diseño técnico

### Componentes y límites

| Componente propuesto | Responsabilidad |
|---|---|
| `application/printing/printer_profile.dart` | Perfil inmutable: dirección, alias, papel y parámetros de compatibilidad |
| `application/printing/printer_settings.dart` | Lista de perfiles y dirección predeterminada válida |
| `application/printing/printer_settings_store.dart` | Contrato de lectura/guardado local |
| `application/printing/printer_settings_controller.dart` | Cargar, validar, guardar y publicar ajustes solo tras escritura satisfactoria |
| `application/printing/printer_gateway.dart` | Contrato del hardware: disponibilidad, permisos, dispositivos vinculados, conexión/envío/cierre y resultados tipados |
| `application/tickets/ticket_document.dart` | Modelo existente reubicado; actualizar imports sin duplicarlo |
| `application/printing/ticket_encoder.dart` | Contrato que convierte documento/perfil en una secuencia imprimible acotada |
| `application/printing/ticket_print_service.dart` | Una operación activa global, snapshot, generación, envío y limpieza |
| `data/local/printing/printer_settings_file_store.dart` | Archivo local versionado `printer_settings.json` |
| `data/printing/*` | Adaptador Bluetooth y encoder ESC/POS con render térmico |
| `presentation/pages/impresoras/*` | Listado, edición y prueba de impresoras |
| `presentation/tickets/*` | Diálogo/acción compartidos por ventas y cotizaciones |

Son rutas sugeridas, no estructura ya existente. Mantener una clase principal
por archivo y ajustar los nombres al implementar. Application define contratos
sin importar plugins, Flutter, Drift ni presentation; data implementa los
adaptadores. El renderer térmico puede usar `dart:ui` en el adaptador concreto.
No crear adaptadores vacíos de USB/red ni un framework de dispositivos futuros.

```text
Ticket visible + perfil elegido
→ snapshot inmutable → TicketPrintService (una operación activa)
→ render térmico/encoder ESC/POS → gateway Bluetooth → impresora
→ resultado de envío → interfaz
```

### Dependencias: decisión de fase 1

La sugerencia inicial de usar la versión actual de `print_bluetooth_thermal`
requiere ajuste: la 1.2.5 declara Flutter >=3.44.0, incompatible con el 3.41.6
local. No actualizar Flutter/Gradle como efecto secundario de esta funcionalidad.
[Manifest del paquete](https://raw.githubusercontent.com/andresperezmelo/print_bluetooth_thermal/master/pubspec.yaml).

| Candidato | Evidencia al planificar | Comprobación necesaria |
|---|---|---|
| `print_bluetooth_thermal` **1.2.1 exacta** | Metadatos publicados: Flutter >=3.19.0; API de vinculados/conexión/bytes | Compilación, permisos denegados, tiempos de espera, cierre y escritura de tickets largos |
| `flutter_bluetooth_printer` **2.24.0** | Metadatos publicados: Flutter >=3.16.0; API de `printBytes` | Listado sin descubrimiento innecesario, permiso, transporte y semántica real de finalización |
| `esc_pos_utils_plus` **2.0.4** | Generación de texto/imagen ESC/POS y distintos comandos de imagen | Ancho real de perfil y comportamiento del comando en la primera impresora |

Fuentes: [API de metadatos de print_bluetooth_thermal](https://pub.dev/api/packages/print_bluetooth_thermal),
[API de metadatos de flutter_bluetooth_printer](https://pub.dev/api/packages/flutter_bluetooth_printer),
[documentación de flutter_bluetooth_printer](https://pub.dev/packages/flutter_bluetooth_printer)
y [esc_pos_utils_plus](https://pub.dev/packages/esc_pos_utils_plus).

Primero evaluar la 1.2.1 por su API de dispositivos vinculados. Su historial
indica correcciones de permisos y llamadas bloqueadas en la 1.2.4, por lo que
no basta con que resuelva dependencias. Si no cumple los casos de fase 1,
evaluar la alternativa. Registrar una sola elección y versión comprobada,
conservar `pubspec.lock` y retirar dependencias del intento descartado.
[Historial del paquete](https://pub.dev/packages/print_bluetooth_thermal/changelog).

No usar `^1.2.1` para el candidato anterior: permitiría resolver una versión
posterior incompatible. No editar `.pub-cache`. Si ningún paquete cumple el
contrato, implementar únicamente el puente Android necesario bajo el mismo
gateway y documentar esa decisión; no añadir dos backends activos por precaución.

### Permisos, conexión y ciclo de vida

- Consultar equipos vinculados, conectar y enviar solo por acción explícita.
  Bluetooth apagado permite abrir ajustes; no intentar activarlo silenciosamente.
- En Android 12+ solicitar `BLUETOOTH_CONNECT`. `BLUETOOTH_SCAN` solo cuando el
  adaptador real lo use/requiera, por ejemplo al cancelar descubrimiento.
  En versiones anteriores declarar los permisos Bluetooth de compatibilidad
  con límites de SDK correspondientes. Revisar el manifest combinado del APK.
- No añadir permiso de ubicación por esta función de equipos ya vinculados;
  si un plugin descubre equipos y exige ubicación, revisar esa elección.
  No iniciar solicitudes de permisos al arrancar o desde un worker.
- Conectar al destino capturado, enviar secuencialmente y cerrar al finalizar.
  Verificar que cambiar de impresora no reutilice un socket al destino anterior.
- Aplicar tiempos límite a permisos/conexión/envío. Un `Future.timeout` no
  cancela la operación nativa: no liberar el servicio para otro envío mientras
  todavía pueda haber una escritura anterior. Resolver cierre/cancelación o
  mantener el estado ocupado hasta su finalización efectiva; probar esa condición.
- Antes de iniciar la escritura, salir/cancelar descarta el intento cuando sea
  posible. Después de iniciarla, salir o pausar no equivale a deshacer impresión:
  el servicio conserva propiedad de la operación y descarta callbacks UI antiguos.
  Cerrar/reiniciar el proceso deja el resultado físico incierto, sin reproducción.
- La inyección debe liberar una conexión activa antes de reemplazar dependencias.
  `restartDependencyInjection` usa actualmente `getIt.reset(dispose: false)`:
  no asumir que ese reset cerrará el gateway. No dejar servicios en segundo plano.

[Reglas oficiales de permisos Bluetooth en Android](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions).

### Salida térmica

Conservar el PNG actual para compartir. La salida impresa se dibuja desde el
mismo documento, con fondo blanco y texto negro al ancho imprimible del perfil.
Evitar limitarse a reducir el PNG de 880 píxeles: en 58 mm puede quedar ilegible.

Para 58 mm, presentar nombre/variante en líneas completas y cantidad, precio e
importe debajo; para 80 mm, admitir columnas con ajuste de nombres largos.
Conservar todas las filas, detalles, resumen de pago, totales y pie del documento.
Los caracteres `ñ`, tildes y símbolos se renderizan como imagen, reduciendo la
dependencia de tablas de caracteres de cada firmware.

384 puntos para 58 mm y 576 para 80 mm son candidatos iniciales, no equivalencias
universales. Comprobarlos con el equipo y admitir el ancho validado en su perfil.
Seleccionar un método de imagen realmente soportado (`ESC *`, `GS v 0` o
`GS ( L`); el encoder no debe asumir que todos los ESC/POS admiten los tres.

Generar/enviar por bandas acotadas para tickets largos. Calibrar tamaño/pausa
de transporte en el adaptador, sin perder filas, reiniciar el ticket entre bandas
ni añadir avances repetidos. Una sola inicialización y avance final. Corte
desactivado por defecto; solo enviar corte en perfiles con capacidad comprobada.
No enviar comandos de apertura de cajón. Limitar memoria y trabajo de UI al
renderizar muchos artículos; comprobarlo con una carga larga reproducible.

### Persistencia y modos

Guardar perfiles en un archivo propio de Application Support, con formato
versionado, direcciones únicas y una predeterminada que exista en la lista.
Validar alias, papel, ancho y método conocidos; no guardar sockets ni estados
de conexión. Archivo ausente representa lista vacía. Ante corrupción, mostrar
el problema y ofrecer reconfigurar, conservando el archivo hasta una acción
explícita; no sobrescribirlo silenciosamente por leerlo.

Serializar guardados y escribir mediante archivo temporal/reemplazo para
evitar perder ajustes por escrituras concurrentes o interrumpidas. Si falla el
guardado, conservar el último estado confirmado y comunicar el error.

La configuración pertenece a la instalación. No se agrega al respaldo de negocio
ni a una sincronización de dispositivos; restaurar SQLite en el mismo dispositivo
no la reemplaza. En otro Android habrá que vincular y configurar sus impresoras.
Verificar el reinicio de DI tras restauración, sin arrancar impresión/conexión.

**Imprimir y configurar periféricos no modifican un agregado de negocio:** no
crean `SyncEvent`, filas en `events`/`event_refs` ni una nueva proyección. No
llevar esta operación al patrón de command services por similitud de nombres.
Las ventas/cotizaciones conservan sus eventos y reglas existentes. En
`standalone`, siguen `not_required` y sin refs; no se activan push, pull,
preflight, health checks ni WebSocket. En `server_sync`, imprimir no depende
de conexión o confirmación del servidor ni cambia la entrega de eventos.

No se prevén cambios en NestJS, PostgreSQL, tablas Drift, payloads de negocio,
stock, caja, pagos ni estados de venta/cotización.

### Errores y reimpresión

Distinguir: plataforma no soportada, Bluetooth apagado, permiso denegado,
dispositivo no vinculado, perfil inválido, fallo de generación, conexión fallida,
servicio ocupado y envío interrumpido/de resultado incierto. Ante fallo después
de comenzar la escritura, indicar: «El envío se interrumpió. Puede haberse
impreso una parte; revisa el ticket antes de reimprimir».

No prometer detección de falta de papel/tapa abierta si el adaptador no ofrece
un estado físico comprobado. Un retorno `true` de bytes no es un acuse de papel.
La venta/cotización sigue disponible; el usuario decide si reimprime. La primera
versión no guarda historial de intentos ni cambia un estado «impreso» del negocio.

## Fases y criterios de salida

Cuatro sesiones secuenciales; se pueden unir si cumplen sus criterios. La
disponibilidad del Android permite adelantar pruebas físicas, pero su ausencia
no bloquea contratos, interfaz o verificaciones automatizadas. Registrar los
casos físicos como pendientes, nunca como aprobados por usar un fake.

| Fase | Entrega | Criterio de salida |
|---|---|---|
| [[08 - Roadmap/Impresion de tickets/Sesiones/01 - Conexion y contratos\|1. Conexión y contratos]] | Dependencia compatible elegida, gateway, perfiles, exclusión global, conexión/prueba mínima | APK compila; permisos, errores, finalización nativa y concurrencia definidos y cubiertos; transporte físico confirmado o pendiente explícito |
| [[08 - Roadmap/Impresion de tickets/Sesiones/02 - Configuracion de impresoras\|2. Configuración de impresoras]] | Archivo local, controlador, listado/edición, predeterminada, acceso y prueba | Se guardan varios perfiles sin mezclar ajustes y sobreviven al reinicio; fallos no destruyen configuración |
| [[08 - Roadmap/Impresion de tickets/Sesiones/03 - Tickets e integracion\|3. Tickets e integración]] | Documento compartido, renderer térmico, envío por bandas, botones y selector | Ventas y cotizaciones envían el snapshot correcto, conservan compartir y no alteran negocio |
| [[08 - Roadmap/Impresion de tickets/Sesiones/04 - Verificacion y cierre\|4. Verificación y cierre]] | Matriz automatizada, compilación y evidencia física con el equipo de 58 mm | Resultados separados por plataforma/modelo; cierre automatizado y pendientes físicos trazables |

## Casos de aceptación

| ID | Caso | Resultado esperado / tipo de evidencia |
|---|---|---|
| I01 | Entrar en Impresoras en ambos modos sin internet | Mismo flujo local; no se inicia sync en standalone |
| I02 | Permiso concedido, denegado, denegado permanentemente o revocado | Estado útil, acceso a ajustes cuando proceda; sin bloqueo ni envío; física Android 12+ |
| I03 | Bluetooth apagado, hardware ausente o lista vacía | Explicación y recarga; no inventar una impresora |
| I04 | Guardar A de 58 mm y B de 80 mm, reiniciar | Perfiles y predeterminada preservados; automatizada y reinicio físico |
| I05 | Equipos con el mismo nombre o repetición de una dirección | Identificación por dirección, sin perfiles duplicados |
| I06 | Cambiar/quitar predeterminada o elegir otra solo para el envío | Destino explícito; no sustituirlo silenciosamente |
| I07 | Prueba en A → B → A | Dirección, ancho y comandos de cada perfil; física con segundo equipo pendiente si no está disponible |
| I08 | Dispositivo desvinculado, apagado o fuera de alcance | Error recuperable; no mandar a otra impresora ni alterar el ticket |
| I09 | Recibo de efectivo, transferencia y crédito | Importes/pago/cambio y snapshots conservados; no consultar precios actuales |
| I10 | Cotización y cambio de precios durante el envío | Documento capturado coherente; etiquetas/fechas/leyendas correctas, sin persistir la estimación |
| I11 | Cotización con precio/importe/total no disponible | Imprimir las mismas indicaciones de la pantalla; no convertirlas a cero |
| I12 | Nombre muy largo, variante, cantidades medidas, ñ/tildes/símbolos | Ajuste legible sin recortes en 58 mm y layout 80 mm; inspección raster y física |
| I13 | Ticket largo reproducible, por ejemplo 100 líneas variadas | Todas las filas/totales/pie, sin bandas perdidas; memoria y transmisión comprobadas |
| I14 | Muchas pulsaciones, prueba y recibo concurrentes, render lento | Una operación activa global; cero trabajos duplicados o encolados |
| I15 | Tiempo límite mientras la escritura nativa sigue activa | No empezar otro envío sobre esa escritura; cierre o finalización efectiva antes de liberar |
| I16 | Interrupción a mitad del ticket o retorno nativo incierto | Aviso de posible impresión parcial; sin reintento automático; reimpresión manual posible |
| I17 | Cerrar ruta, permisos pendientes, segundo plano y reinicio de proceso | Sin callbacks UI inválidos ni reproducción al regresar; estado físico incierto documentado |
| I18 | Cambiar perfil/predeterminada mientras se envía | Trabajo conserva destino/configuración capturados; cambio aplica al siguiente |
| I19 | Archivo ausente, inválido, escritura fallida/interrumpida | Lista vacía solo si ausente; no corrupción silenciosa ni pérdida del último estado válido |
| I20 | Restaurar respaldo/reiniciar DI | Perfiles locales preservados; conexión anterior cerrada; ningún envío automático |
| I21 | Imprimir/reimprimir/configurar, comparando estado antes/después | Cero nuevos eventos/refs/movimientos; mismas ventas y cotizaciones, en ambos modos |
| I22 | Compartir/WhatsApp, regresar y Nueva venta | Flujos existentes conservados; impresión no limpia ni recupera borradores |
| I23 | Abrir el POS en macOS/iOS u otra plataforma no habilitada | Estado no disponible sin llamadas Bluetooth de este flujo; sin regresión de arranque |
| I24 | Impresora sin papel o incapaz de reportar estado | No afirmar impresión física confirmada solo por escribir bytes |
| I25 | Margen derecho/izquierdo y avance final con la de 58 mm | Ancho medido sin recorte; texto legible y salida completa; evidencia física |

## Verificación y continuidad

Después de cada cambio funcional: `dart analyze` y `flutter test`, conforme al
AGENTS de Flutter. Añadir pruebas con fakes del gateway para condiciones reales
de espera/error, persistencia en directorio temporal, raster/encoder y widgets.
Para I21 usar repositorios/estado reales en un fixture, sin arrancar servicios
remotos: validar que la impresión no toca el flujo de eventos.

Compilar Android en fase 1 y en el cierre (`flutter build apk --debug`). Si la
dependencia registra código nativo en macOS, comprobar también la compilación
de desarrollo disponible y distinguir fallos preexistentes; no atribuirle soporte
de impresión por compilar. No ejecutar build_runner ni resetear SQLite por
esta función, salvo que un cambio real de entradas generadas lo requiera.

En la prueba física registrar: Android/versiones, nombre/dirección y modelo
confirmado de la impresora, papel/ancho en puntos, método de imagen, versión
del plugin, documento enviado, duración y resultado completo/parcial. Conservar
foto del ticket si se dispone de ella. El fake de B prueba selección/perfiles,
no certifica una impresora de 80 mm que todavía no se probó.

El cierre puede indicar «implementación y verificación automatizada completas;
verificación física pendiente». Declarar compatible un modelo solo al comprobar
su impresión real. La solicitud de plan no autoriza a presentar este documento
como una implementación o una prueba física completada.

Cada sesión actualiza [[08 - Roadmap/Impresion de tickets/Estado y continuidad|Estado y continuidad]]
con archivos, dependencia elegida, comandos/resultados, decisiones,
compatibilidad comprobada, pendientes y siguiente fase.
