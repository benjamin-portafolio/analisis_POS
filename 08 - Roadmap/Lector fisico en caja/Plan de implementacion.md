---
tipo: plan_implementacion
estado: ajuste_automatico_implementado_hardware_pendiente
revision: 5
actualizado: 2026-10-10
---

# Lector físico de códigos de barras en Caja

## Objetivo

Incorporar un lector físico a Caja para que cada lectura completa agregue una
unidad al borrador actual. Windows y Android preparan automáticamente una
sesión con un campo dedicado; macOS conserva su activación manual. Conservar «Quiero vender…» para la búsqueda
manual y reutilizar el flujo local que ya utiliza la cámara.

Las fases 1 y 2 fueron implementadas por solicitud explícita del usuario el
2026-10-09. La fase 2 incorpora el modo físico en Caja y su navegación usando
la sesión y el coordinador existentes. La fase 3 se verificó el 2026-10-09/10
y tiene cierre parcial: análisis, suite, compilación macOS y ensayos nativos
con entrada simulada registrados; Windows y lector real pendientes. La matriz
actual distingue también las condiciones nativas no comprobadas.

Resultados históricos: [[08 - Roadmap/Lector fisico en caja/Verificacion fase 3|Verificación de fase 3]].

## Decisión vigente — 2026-10-10, revisión 5

El usuario pidió entrar en Caja y escanear directamente en Windows y Android,
sin habilitar un selector. Esta decisión reemplaza la activación manual de
Windows y la exclusión anterior de Android. macOS conserva su selector actual.
La cola FIFO, las pausas y las barreras del borrador siguen vigentes.

Sin lector conectado, Caja solo espera entrada en el campo: no abre cámara,
solicita permisos, descubre dispositivos ni inicia conexiones o sondeos. Ningún
fragmento sin Enter agrega productos. Android mantiene la interacción táctil,
la escritura y el pegado manual sin desconectar el teclado HID.

Los resultados de las fases 1–3 se conservan como historia de sus respectivas
revisiones; sus menciones a Windows manual y Android excluido no describen la
revisión 5. El resultado del ajuste actual se registra después de esas fases.

## Supuestos y comprobaciones pendientes

1. El lector funciona como teclado HID por USB o Bluetooth y envía un código
   seguido de Enter. Antes de la prueba física, verificar esa configuración
   en el manual del modelo y en un editor de texto.
2. El lector entrega códigos compatibles con `CodigoBarras`: hasta 32 dígitos,
   conservados como texto. Un dispositivo serial, un SDK propietario o un
   código que codifique peso/precio exigirían revisar el alcance.
3. El proyecto contiene destinos macOS, Windows y Android. La plataforma y el modelo
   realmente usados se registrarán en la verificación; una prueba en un sistema
   no acredita el otro. La ausencia de lector no impide implementar y probar
   la integración con entrada de teclado simulada.

## Base real revisada

Repositorio: `/Users/benjamin/Projects/POS/pos_flutter`.

| Componente | Comportamiento actual | Uso en este cambio |
| --- | --- | --- |
| `ArticleSearchBar` | «Quiero vender…» es de solo lectura y abre `ArticleSearchScreen` | Conservar acceso a la búsqueda textual |
| `ArticleSearchScreen` | Busca nombres de productos y variantes; agrega mediante comandos | Pausar el lector físico mientras está abierta |
| `CajaScreen` | Observa `watchCurrentDraft()`; los dos accesos barcode conservan la cámara; HID automático en Windows/Android y manual en macOS | Coordinar sesión, estados y barreras existentes |
| `SaleBarcodeScannerScreen` | Consulta candidatos, solicita selección/cantidad y ejecuta el comando | Compartir la resolución y agregado, manteniendo su cámara y compuerta |
| `ProductoRepository.buscarVariantesPorCodigoBarras` | Coincidencia local exacta, normalizada, de productos y variantes activos | Reutilizar consulta; un código puede tener varios candidatos |
| `CodigoBarras` | Trim, NFKC, hasta 32 dígitos y ceros iniciales | Reutilizar validación sin convertir el código a número |
| `VentaBorradorCommandService.agregar` | Agrega una pieza o cantidad medida y combina líneas con las mismas condiciones | Reutilizar cálculo, acumulación y persistencia |
| `ProductoAgregadoBorradorPayload` | Evento local `producto_agregado_borrador`, con cantidad absoluta | Conservar contrato e idempotencia |
| `HomeScreen` | Cambia de módulo y aloja la navegación superior | Coordinar salida de Caja con operaciones pendientes |

Se observaron cambios locales previos relacionados principalmente con impresión.
Al implementar, revisar nuevamente el estado del repositorio y conservarlos.
No atribuir esos cambios a este plan.

Referencias del proyecto:

- `AGENTS.md`.
- `docs/architecture/offline_feature_flow.md`.
- `docs/templates/new_offline_feature_checklist.md`.
- [[08 - Roadmap/Escaneo en caja/Plan de implementacion|Plan de cámara en Caja]].
- [[08 - Roadmap/Escaneo en caja/Estado y continuidad|Estado de cámara en Caja]].

## Comportamiento vigente de lectura (revisión 5)

### Activación y presentación

1. Windows y Android muestran «Lector físico» y preparan automáticamente una
   sesión al entrar en Caja. No presentan selector de habilitación. macOS
   conserva el selector y comienza desactivado.
2. Preparar el campo visible «Escanea un código y envía Enter» y solicitar foco
   una vez, cuando Caja esté visible, la app/ventana activas y no se esté
   finalizando una navegación. Una preparación diferida se cancela al salir;
   una interrupción de app/ventana requiere reanudación explícita. Con el campo
   listo se admiten lecturas consecutivas sin hacer clic entre ellas.
3. El campo también admite introducir o pegar un código y pulsar Enter.
   Esa entrada es una intención válida de agregar por código.
4. Mostrar «Listo para escanear» únicamente cuando el campo tenga foco, Caja
   esté visible y la aplicación esté activa. Mostrar «Guardando…» y el número
   de lecturas pendientes cuando corresponda.
5. Después de recibir Enter, tomar una copia del contenido, limpiar el campo
   inmediatamente y conservar su foco para la siguiente lectura. Actualizar
   cantidades y total cuando lo confirme el repositorio.
6. La activación es estado de presentación en memoria; no agregar una
   preferencia persistida. Salir del módulo termina la sesión; volver crea un
   controlador nuevo automáticamente en Windows/Android. macOS requiere activar
   de nuevo. Los botones existentes siguen abriendo la cámara.

### Teclado en Android

1. Solo el campo HID usa `TextInputType.none` mientras espera escaneos: permanece
   editable y conserva su conexión de entrada; no se convierte en `readOnly`.
2. El icono de teclado con tooltip/semántica «Escribir código» cambia ese campo
   a `TextInputType.text` y lo reconecta con foco para solicitar el teclado de
   forma explícita. «Usar lector físico» vuelve a `none`. El código manual o
   pegado usa la misma frontera Enter y la misma validación íntegra.
3. Búsqueda, cantidad medida, edición y efectivo conservan su configuración
   normal. No se modifica ningún ajuste global, permiso o dependencia Android.
4. La decisión se verificó contra Flutter 3.41.6, framework `db50e20168`,
   Dart 3.11.4 y la fuente Android incluida en ese SDK. `EditableText` crea una
   conexión para un campo editable; `TextInputPlugin.showTextInput` oculta el
   teclado virtual para `NONE` y mantiene `InputConnectionAdaptor` para editar.
   Las pruebas verifican la configuración enviada al canal y reciben texto y
   Enter simulados. Esto no demuestra el comportamiento de un Android/IME/HID real.

Referencia oficial: [TextInputType.none](https://api.flutter.dev/flutter/services/TextInputType/none-constant.html).

### Búsqueda manual y pausa

1. Pulsar «Quiero vender…» pausa la captura y abre el buscador actual. El
   lector físico no interpreta el texto escrito en esa pantalla. Volver a Caja
   restaura el modo y el foco si estaban activos, una vez finalizadas las
   operaciones anteriores.
2. Selector de variante, diálogo de cantidad, edición, cámara, cobro,
   cotización, limpieza, menú lateral y rutas externas suspenden la captura.
   El indicador debe reflejar la pausa antes de ceder el foco.
3. Un cambio de foco a un botón o control accesible no debe forzar el foco de
   vuelta continuamente. Mostrar «Lector en pausa» y permitir reanudar con el
   campo o un botón «Reanudar lector». Mantener Tab y la activación por teclado.
4. Al perder el foco de la ventana o pasar a segundo plano, borrar el código
   incompleto y suspender la admisión. Al volver, ofrecer reanudación explícita;
   no concatenar caracteres capturados antes y después de la pausa.
5. Al desactivar el selector de macOS, detener la admisión de lecturas nuevas. Finalizar
   las lecturas ya aceptadas y mostrar el progreso hasta quedar desactivado.

### Límite de la entrada como teclado

Flutter trata todos los teclados físicos como una misma fuente. Por eso el
modo utiliza un campo dedicado y no intenta reconocer un lector por la rapidez
de escritura. No se necesita configurar un prefijo para esta primera versión.

Pausar el modo evita agregar a la venta desde otros formularios, pero no
deshabilita físicamente el lector: escanear mientras un campo de cantidad o
efectivo tiene el foco puede escribir allí como cualquier teclado. El indicador
de pausa debe ser claro. Si posteriormente se requiere bloquear también esa
entrada, revisar una configuración de prefijo reconocible o un transporte que
identifique al dispositivo; no prometer esa distinción con HID sin prefijo.

Referencias oficiales:
[HardwareKeyboard](https://api.flutter.dev/flutter/services/HardwareKeyboard-class.html)
y [sistema de foco](https://docs.flutter.dev/ui/interactivity/focus).

## Captura y procesamiento de una lectura

```text
Campo de lector físico con foco
  -> contenido completo + Enter
  -> limpiar campo y validar con CodigoBarras
  -> cola FIFO de lecturas de esta sesión
  -> ProductoRepository.buscarVariantesPorCodigoBarras
  -> selección de variante / cantidad cuando corresponda
  -> AgregarProductoBorradorCommand
  -> VentaBorradorCommandService.agregar
  -> LocalEventStore.appendAndApply
  -> evento y proyección locales existentes
  -> SaleDraftRepository.watchCurrentDraft
  -> cantidades y total en Caja
```

### Reglas de captura

1. Enter delimita una lectura. No disparar agregado en `onChanged` ni usar el
   intervalo entre teclas como frontera. Una lectura vacía se ignora.
2. Usar el mecanismo de envío del campo una sola vez; no registrar además
   un segundo listener que agregue por el mismo Enter. Conservar el foco sin
   el comportamiento de finalizar edición que lo abandone automáticamente.
3. Validar el contenido completo con `CodigoBarras`. No aplicar un formatter
   que quite letras ni truncar a 32 caracteres: eso podría transformar una
   lectura inválida en el código válido de otro producto. Una lectura inválida
   se informa y no se encola ni persiste.
4. Aceptar A + Enter, A + Enter, A + Enter como tres intenciones independientes.
   No deduplicar por valor ni reutilizar `BarcodeReadGate`, que resuelve
   observaciones repetidas de cámara.
5. Enter repetido después de limpiar el campo no crea una segunda intención.
   Una pausa, cancelación o pérdida de foco limpia cualquier fragmento pendiente.
6. Enviar la lectura a una cola FIFO en memoria. Durante una consulta/guardado
   sin interacción, el campo sigue admitiendo lecturas completas; usar una
   cola, en vez de ignorarlas con un `if (busy) return`.

### Reglas de resolución y agregado

1. Procesar una lectura a la vez. Una coincidencia activa única por piezas
   ejecuta el comando y suma una unidad. La acumulación por precio, unidad y
   condiciones sigue siendo responsabilidad del command service.
2. Con cero candidatos, mostrar «No se encontró un artículo con este código»
   y continuar con la siguiente lectura. No crear ni enlazar productos.
3. Con varios candidatos, suspender nueva captura y mostrar
   `BarcodeProductSelectionDialog`. Cancelar descarta solo esa intención.
4. Para venta medida, suspender nueva captura y usar `SaleQuantityDialog` con
   la unidad visible y `expectedUnitId`. Cancelar no crea evento. No asumir
   una pieza ni extraer cantidades del código.
5. Durante esos diálogos conservar las otras lecturas completas ya aceptadas.
   Al resolver el diálogo, reanudar el procesamiento en orden y recuperar el
   foco del lector cuando Caja vuelva a estar disponible.
6. Informar un error de guardado y pausar las lecturas pendientes para que el
   usuario revise y reanude. No reintentar automáticamente la intención fallida:
   no se debe convertir una respuesta incierta en un agregado duplicado.
7. Mostrar confirmación breve después del guardado, por ejemplo «Agregado:
   Leche · 1 unidad». Actualizar un aviso único, evitando una cadena de snackbars.

### Operaciones pendientes y cambio de contexto

1. Antes de cobrar, limpiar, cotizar, abrir otro flujo o cambiar de módulo,
   detener admisión y terminar las lecturas aceptadas. Mantener esas acciones
   bloqueadas durante el procesamiento; no calcular el cobro sobre un total
   que aún tiene agregados pendientes.
2. Coordinar también las salidas desde `HomeScreen` y el menú. Los flags de
   `CajaScreen` por sí solos no protegen la navegación del contenedor.
3. Si hay un diálogo o un error que detiene la cola, el usuario puede resolver
   o descartar las lecturas aún no iniciadas. Mostrar cuántas descartará y
   solicitar confirmación mediante una opción concreta. No deshacer lo agregado.
4. Una pausa de la aplicación congela las lecturas que aún no iniciaron y
   deja finalizar el comando atómico en curso. Reanudar explícitamente la misma
   sesión o descartar lo pendiente antes de salir.
5. Usar identidad/generación de sesión para que una consulta antigua no abra
   diálogos ni ejecute un comando después de terminar esa sesión. Un comando
   ya iniciado puede finalizar; no intentar revertirlo desde la UI.
6. La cola no se persiste y no se reproduce al reiniciar la aplicación. Un
   cierre forzado puede perder lecturas aún no guardadas; la confirmación visual
   corresponde exclusivamente a agregados que el flujo local haya confirmado.

## Organización técnica propuesta

Una clase principal por archivo. Ajustar los nombres durante la implementación
sin crear capas o extensiones que no tengan un consumidor actual.

| Archivo | Responsabilidad |
| --- | --- |
| Nuevo `lib/presentation/pages/caja/barcode/physical_barcode_reader.dart` | Control de activación, campo visible, foco, envío y estado accesible |
| Nuevo `lib/presentation/pages/caja/barcode/physical_barcode_reader_controller.dart` | Sesión, admisión, cola FIFO, pausa, reanudación y finalización |
| Nuevo `lib/presentation/pages/caja/barcode/sale_barcode_read_coordinator.dart` | Consulta de candidatos y agregado compartido; solicita selección/cantidad mediante callbacks de presentación |
| `lib/presentation/pages/caja/caja_screen.dart` | Integra lector con borrador observado, acciones y navegación |
| `lib/presentation/pages/caja/sale_barcode_scanner_screen.dart` | Reutiliza resolución/agregado; conserva cámara, compuerta y mensajes aplicables |
| `lib/presentation/pages/pantalla_principal/home_screen.dart` | Coordina salidas y cambios de módulo con la sesión activa |
| `lib/presentation/widgets/article_search_bar.dart` | Notifica apertura/cierre del buscador si es necesario para la pausa; callback opcional solo desde Caja |

El coordinador compartido recibe `ProductoRepository` y
`VentaBorradorCommandService`. Los selectores siguen siendo widgets de
presentación; el coordinador no administra permisos de cámara, foco ni tiempos
de retirada. El resultado de presentación que necesiten ambos lectores deberá
tener su propio archivo si se convierte en un contrato importado.

Los enum de sesión/estado de lector son de presentación, porque describen la
interacción del dispositivo. No agregar conceptos de negocio nuevos para ellos.

## Persistencia y alcance

- Reutilizar `AgregarProductoBorradorCommand`, `producto_agregado_borrador`,
  el handler y las tablas existentes. Conservar los payloads tipados.
- Conservar `delivery_status = not_required` del borrador en ambos modos.
  Los comandos declaran y validan referencias en ambos; el store solo persiste
  `event_refs` en `server_sync`.
- Observar el mismo borrador persistido. No crear un carrito alternativo ni
  calcular aumentos optimistas en los widgets.
- Esta revisión concentra la implementación en presentación. No requiere
  esquema Drift, migraciones, servidor, sincronización remota, plugins de
  USB/Bluetooth ni nuevas dependencias para un lector en modo teclado.
- Mantener el lector del editor de variantes, la cámara de Caja y la búsqueda
  de Artículos con sus contratos actuales. El control físico se presenta en
  macOS, Windows y Android; no activar captura general en otros módulos o formularios.

## Fases de implementación

### Fase 1: resolución compartida y sesión de lecturas

1. Revisar AGENTS, guías offline y estado del repositorio.
2. Extraer únicamente consulta, selección/cantidad y agregado de la pantalla
   de cámara al coordinador de presentación, conservando su comportamiento.
3. Implementar el controlador de sesión y cola independiente de widgets.
4. Probar serialización, pausa, errores, cancelación y consultas obsoletas.
5. Ejecutar regresión de cámara, `dart analyze` y `flutter test`.

Criterio de salida: la cámara conserva sus reglas y el controlador procesa
intenciones completas en orden sin duplicar ni alterar eventos existentes.

#### Resultado de fase 1 — 2026-10-09

- `SaleBarcodeReadCoordinator` comparte consulta exacta, selección por callback,
  cantidad medida y agregado mediante el command service existente. Entrega
  `SaleBarcodeReadResult`/`SaleBarcodeReadOutcome` y confirma `added` únicamente
  después del comando. Desconocido, cancelación y unidad no disponible no escriben.
- `SaleBarcodeScannerScreen` consume el coordinador. Conserva permisos, cámara,
  ciclo de vida, compuerta, generación de lectura, validación de interrupciones
  y todos sus mensajes de retirada. Los diálogos siguen siendo los existentes.
- `PhysicalBarcodeReaderController` recibe códigos completos; valida con
  `CodigoBarras` sin filtrar letras ni truncar. Mantiene una cola FIFO en memoria
  y una operación a la vez, admitiendo lecturas durante consulta/guardado sin
  diálogo. Tres envíos iguales producen tres intenciones y tres eventos.
- `activate`, `pause` y `resume` controlan la sesión. Un diálogo suspende solo
  nueva admisión y conserva la cola; una pausa externa también congela pasos
  posteriores a consulta/diálogo y las intenciones aún no iniciadas. Un comando
  ya iniciado puede completar su operación atómica.
- `finish()` detiene admisión y drena lo aceptado. Una pausa/error necesita
  reanudación explícita. `finish(discardPending: true)` descarta la cola e
  invalida consultas/respuestas que aún no iniciaron comando, esperando cualquier
  comando en curso. Al finalizar libera los listeners; `done` confirma la
  liberación. Una sesión nueva requiere otro controlador.
- Los errores pausan la cola y nunca reinsertan ni reintentan la intención
  fallida, incluida una respuesta incierta después de un commit.
- No hay consumidor del controlador físico en producción todavía: es la
  estructura expresamente solicitada para fase 2. No se implementaron campo,
  Enter, foco, control «Lector físico», integración en Caja ni navegación.
- Eventos, payloads tipados, handlers, tablas y dependencias permanecen intactos.
  Las pruebas mantienen `not_required` en ambos modos, refs solo en `server_sync`
  e idempotencia del handler al reaplicar el evento.
- Se conservaron los cambios locales anteriores, incluidos los de impresión;
  se verificaron sus contenidos contra las huellas registradas antes del trabajo.

Pruebas y evidencia:

- Verificación previa sin modificaciones: `dart analyze` sin incidencias;
  `flutter test`: 1681 aprobadas y 10 omitidas.
- 52 pruebas nuevas aprobadas en
  `sale_barcode_read_coordinator_test.dart` y
  `physical_barcode_reader_controller_test.dart`, usando repositorio, comandos,
  SQLite en memoria y handler reales. Cubren FIFO, repetición, admisión durante
  guardado, NFKC/trim/ceros, vacío, rechazo íntegro y límite de 32 dígitos,
  selección, cantidad, cancelaciones, pausas, rollback SQLite, respuesta incierta,
  drenaje, descarte, consultas/diálogos obsoletos, sesiones sucesivas y liberación.
- Regresión inicial de cámara: 48 pruebas aprobadas entre
  `sale_barcode_scanner_screen_test.dart` y `barcode_draft_flow_test.dart`.
  Este último ahora prueba el coordinador compartido, incluyendo persistencia
  y reapertura del archivo SQLite temporal en ambos modos.
- Verificación final: `dart analyze` sin incidencias; `flutter test` completo:
  1733 pruebas aprobadas y las mismas 10 omitidas de la verificación previa.
  Incluye la regresión completa de cámara, editor de variantes y Artículos.
  `git diff --check` sin errores; revisión de imports y referencias sin código
  muerto adicional. No se requirió regenerar Drift porque no cambió el esquema.

Pendientes al cierre de fase 1: fases 2 y 3 completas, incluida captura por Enter, integración y
coordinación de navegación, compilación de escritorio y lector físico real.
Estas pruebas no acreditan conexión USB/Bluetooth ni comportamiento HID real.

### Fase 2: modo lector en Caja y navegación

1. Implementar el campo/control físico para macOS y Windows, inicialmente
   desactivado, con envío por Enter, estado visible y foco accesible.
2. Integrarlo en Caja usando el controlador y el coordinador de fase 1.
3. Coordinar búsqueda, cámara, diálogos, cobro, edición, limpieza, cotización,
   menú y cambios de módulo. Terminar o resolver lo pendiente antes de salir.
4. Mostrar estados de guardado, pausa y confirmación desde resultados reales.
5. Agregar pruebas de widgets con entrada física simulada y del flujo completo
   con repositorio, comando, SQLite temporal y handler reales.
6. Ejecutar `dart analyze` y `flutter test`; revisar imports y helpers sin uso.

Criterio de salida: activar una vez permite agregar varias piezas, incluidas
repeticiones consecutivas, y ninguna lectura pendiente termina en otra venta.

#### Resultado de fase 2 — 2026-10-09

- `PhysicalBarcodeReader` presenta «Lector físico» en macOS/Windows, inicialmente
  desactivado. Al activar muestra el campo «Escanea un código y envía Enter» y
  solicita foco. `onSubmitted` es la única frontera: copia y limpia inmediatamente
  el contenido, sin abandonar el foco al completar edición. Admite escritura y
  pegado; no filtra letras, trunca, mide velocidad ni deduplica códigos.
- Reutiliza `PhysicalBarcodeReaderController` y `SaleBarcodeReadCoordinator`.
  Durante consultas/guardados sin interacción sigue admitiendo lecturas para la
  FIFO. Vacío/Enter repetido no agregan. La validación íntegra conserva ceros y
  NFKC. Selección y cantidad usan los diálogos existentes, suspendiendo admisión
  sin convertir su pérdida de foco en una pausa externa.
- Caja sigue observando `SaleDraftRepository.watchCurrentDraft()`. Cantidades y
  total proceden del borrador persistido. El aviso único confirma solo resultados
  `added`; informa inválidos, desconocidos, cancelaciones, guardado, pausa,
  pendientes y errores sin encadenar snackbars.
- Tab y el foco de botones se respetan. La pérdida de foco de ventana o el paso
  a segundo plano limpia el fragmento y exige reanudación explícita. Recuperar
  foco de ventana o cerrar un diálogo tras esa interrupción no reanuda la cola
  automáticamente. Las rutas ajenas suspenden captura y requieren reanudación
  explícita al regresar.
- Búsqueda textual, cámara, edición, cobro, cotización, limpieza e historial
  cruzan una barrera de Caja que llama `finish()` y espera `done` antes de abrir
  el otro flujo. Una ruta propia restaura el modo con un controlador nuevo y
  recupera foco cuando corresponde; una interrupción de ventana/app durante la
  ruta conserva el modo pausado.
- `HomeScreen` coordina cambios de módulo, regreso y menú. El botón del menú
  resuelve lo aceptado antes de abrir; cada ruta de `MenuLateral` cruza también
  la barrera, incluso con apertura programática del drawer. Cerrar el menú sin
  navegar recupera modo/foco. Salir a otro módulo termina el modo y regresar a
  Caja comienza desactivado.
- `PhysicalBarcodeFinishDialog` ofrece reanudar pendientes o confirmar descarte
  cuando el drenaje se detiene. El número incluye una consulta/diálogo que aún
  no inició comando y excluye guardados iniciados y lecturas ya fallidas.
  `unstartedReadCount` y el callback `onCommandStarted` exponen ese dato sin
  repetir la implementación de fase 1. El descarte usa
  `finish(discardPending: true)`, invalida respuestas antiguas y espera un
  comando iniciado; no deshace guardados. Un selector ya visible se resuelve
  antes de mostrar el diálogo de drenaje, manteniendo una salida accesible.
- Un error no reintenta la intención fallida. Se pueden reanudar las otras
  aceptadas. Si falla la última intención durante el drenaje, un aviso informa
  el error antes de continuar a cobro, incluso ante respuesta incierta después
  del commit. Cobro obtiene total, venta y revisión después del drenaje;
  cotización, limpieza y edición también leen la revisión actualizada.
- Tablas, eventos, payloads, reglas de negocio y dependencias permanecen
  intactos. Se conserva `not_required` en ambos modos y refs persistidas solo
  en `server_sync`. El estado del modo no se persiste y no hay otra cola/carrito.
  La captura HID suspendida no impide físicamente escribir en otro campo.

Archivos de la integración:

- Nuevos: `lib/presentation/pages/caja/barcode/physical_barcode_reader.dart` y
  `physical_barcode_finish_dialog.dart`.
- Integración: `caja_screen.dart`, `pantalla_principal/home_screen.dart`,
  `pantalla_principal/menu_lateral.dart` y `presentation/widgets/article_search_bar.dart`
  (callback opcional de apertura; Artículos conserva su contrato).
- Ajuste de visibilidad del conteo: `physical_barcode_reader_controller.dart` y
  `sale_barcode_read_coordinator.dart`.
- Pruebas: nuevo `test/presentation/pages/caja/physical_barcode_reader_test.dart`,
  ampliación de `physical_barcode_reader_controller_test.dart` y
  `pantalla_principal/menu_lateral_test.dart`. `test/support/barcode_sale_fixture.dart`
  permite archivo SQLite temporal y reutiliza el handler real de limpieza.

Pruebas y evidencia:

- Estado inicial limpio (`git status`); verificación previa: `dart analyze` sin
  incidencias y `flutter test` con 1733 aprobadas, 10 omitidas.
- 32 pruebas nuevas de widgets del lector, con repositorio, comandos, handlers
  reales y archivo SQLite temporal. Simulan texto/pegado, teclas Enter/Tab y la
  acción de edición que el engine traduce desde Enter; no invocan `onSubmitted`
  directamente. Cubren las combinaciones macOS/Windows y standalone/server_sync,
  FIFO A → B → A, repeticiones, admisión durante guardado, vacío/Enter repetido,
  rechazo íntegro, 32 dígitos, ceros/NFKC, selección/cantidad/cancelación, error
  SQLite, foco/ventana/app, búsqueda, cámara, edición, limpieza, cotización,
  cobro actualizado, menú, rutas, salida de Home, reanudación y finalización.
- La reapertura del archivo comprueba cantidades y total persistidos. El flujo
  de limpieza/nueva captura comprueba que la venta nueva no recibe la cola de
  la anterior. Se prueban errores antes del guardado y después del commit sin
  reintentar la lectura. La regresión del controlador conserva idempotencia y
  agrega comprobaciones del conteo usado para confirmar el descarte.
- Una prueba adicional del menú comprueba que una ruta espera la barrera,
  respeta su denegación y navega al autorizarse: 33 pruebas nuevas en total.
- Verificación final con el código completo: `dart analyze` sin incidencias;
  `flutter test`: 1766 aprobadas y las mismas 10 omitidas. Incluye cámara de Caja,
  editor de variantes, Artículos y los demás flujos existentes. `git diff --check`
  sin errores; imports, callbacks y flags revisados, sin estructura pendiente.
- Una corrida completa registró un timeout en
  `product_supplier_ui_flow_test.dart`, archivo sin modificaciones. Sus 7 tests
  pasaron aislados y las siguientes corridas completas pasaron, incluida la
  final de 1766. No se amplió el alcance para modificar proveedores.
- No se requirió `build_runner`: no cambió el esquema Drift. No se ejecutaron
  compilaciones nativas ni pruebas con hardware, conforme al alcance de fase 2.

Pendientes de fase 2: ninguno funcional o automatizado. Pendiente la fase 3:
compilar macOS y Windows en sus equipos, probar el lector real y registrar
modelo/configuración, reconexión, sufijo Enter y comportamiento HID/foco.

### Fase 3: verificación de escritorio y documentación

1. Compilar macOS con `flutter build macos --debug` en el equipo disponible.
   Compilar/probar Windows en un equipo Windows; registrar como pendiente si
   no hay uno disponible, sin equiparar compilación macOS con verificación Windows.
2. Con lector real, verificar modo teclado, sufijo Enter, ceros iniciales,
   lecturas seguidas, repetidas, foco, pausas y reconexión.
3. Registrar plataforma, modelo, configuración, resultados y pendientes.
4. Actualizar este plan y las notas de escaneo de Caja con el modo implementado,
   pruebas realizadas y limitaciones que realmente permanezcan.

Criterio de salida: verificaciones automatizadas aprobadas y estado físico
documentado. Una prueba simulada no acredita conexión USB/Bluetooth real.

#### Resultado de fase 3 — 2026-10-09/10

**Cierre parcial, sin declarar verificación completa de escritorio/hardware.**
La evidencia está en [[08 - Roadmap/Lector fisico en caja/Verificacion fase 3|Verificación de fase 3]]
y `Evidencia/2026-10-09-fase-3/` (nombre por fecha de inicio).

- HEAD `a10df777e078394cca3068c049972bebf4211ad2`, con los 12 contenidos locales
  de fase 2 conservados y registrados por SHA-256, diff y copias de archivos nuevos.
  No se modificó código funcional, tablas, contratos, dependencias ni servidor.
- macOS 27.0.1 arm64, Flutter 3.41.6/Dart 3.11.4, Xcode 27.0.
  `dart analyze`: sin incidencias. `flutter test --reporter=json`: 1766 aprobadas,
  10 omitidas y 0 fallidas; coincide con fase 2. No se reprodujo el timeout
  histórico de proveedores. Nombres y omisiones se guardaron con los logs.
- `flutter build macos --debug`: aprobado. Advertencia de deprecación del plugin
  `mobile_scanner`, sin impedir compilación. Windows no se ejecutó: el usuario
  confirmó que no hay equipo disponible. La simulación de target no lo acredita.
- App principal macOS probada con bundle/sandbox/base propios, mismo Dart compilado,
  fixtures desechables y huella de base habitual conservada. Entrada simulada:
  modo/foco, 001 + Enter, tres iguales, A→B→A, vacío/invalidación/desconocido,
  selector/cantidad/cancelación, Tab, segundo plano/reanudación, búsqueda,
  edición, apertura/cierre de cámara, menú/módulo, cobro, cotización, nueva
  captura, limpieza y desactivación. Las cantidades/eventos/identidades de venta
  se guardaron en capturas SQLite. No se presentó etiqueta a la cámara ni se
  confirmó un pago real.
- La cola durante operaciones retenidas, drenaje/descarte, respuesta incierta,
  refs e idempotencia pasan en tests reales de SQLite. Los ensayos nativos usaron
  latencia normal; N19 conserva pendiente el escenario retenido nativo. N20
  conserva pendiente el contraste manual de pegado/NFKC por resultado no
  concluyente de la herramienta, sin atribuir un defecto al código.
- No hay lector real, confirmado por el usuario: HID/sufijo, modelo, transporte,
  ceros físicos, repeticiones, rapidez, foco y reconexión quedan pendientes.
  USB y Bluetooth requieren evidencia independiente.
- Se conserva la limitación HID: pausar evita agregados desde el lector, pero
  el dispositivo puede escribir como teclado en otro campo enfocado.

No se repitieron fases 1/2 ni se añadió un flujo de negocio. No correspondió
regenerar Drift. Ver matriz A01–A20/N01–N21/H01–H06/W01 para evidencia y motivo de
cada pendiente. Las verificaciones de cámara ajenas a este plan conservan sus
pendientes físicos anteriores.

## Ajuste de lectura automática — resultado de revisión 5, 2026-10-10

- `PhysicalBarcodeReader` prepara una sesión nueva automáticamente en Windows y
  Android, sin selector. macOS conserva activación/desactivación manual. La
  preparación y el foco esperan a que Caja esté disponible; la navegación cancela
  las preparaciones pendientes. Pausas, errores e interrupciones siguen exigiendo
  reanudación cuando corresponde. El foco no se recupera continuamente sobre botones.
- El lector Android espera HID con `TextInputType.none`, editable y conectado.
  El icono «Escribir código» ofrece teclado normal explícito; el icono «Usar lector
  físico» restaura la supresión. La acción comprueba identidad e interrupción antes
  de recuperar foco. No usa teclas globales ni tiempos de escritura.
- Código completo + Enter sigue siendo la única intención; el campo se copia y
  limpia inmediatamente. Se reutilizan `CodigoBarras`, FIFO, coordinador, comandos,
  eventos, contratos, handlers y el mismo borrador persistido. No se cambió esquema,
  dependencias, permisos, servidor ni sincronización. El borrador conserva
  `not_required` en ambos modos y `event_refs` solo en `server_sync`.
- Caja conserva barreras de búsqueda, cámara, edición, cobro, cotización y limpieza.
  `HomeScreen` protege Atrás también en Android; en la raíz solicita cerrar la
  actividad solo después de resolver la cola, sin quitar la única ruta de Flutter.
  Cambio de módulo finaliza lo aceptado antes de desmontar; regresar a Caja crea otra sesión. Clientes y rutas
  del menú restauran mediante el mismo control de generación, conservando cualquier
  interrupción de app/ventana. Cerrar el menú sin navegar también restaura.
- Se amplió la suite existente del lector a macOS/Windows/Android con SQLite en
  archivo temporal, más casos de espera sin lector ni Enter, preparación bajo
  otra ruta o app inactiva, cancelación de preparación al salir, configuración
  editable `none`, teclado explícito, búsqueda/cantidad/efectivo normales y regreso desde clientes/menú. FIFO,
  repetición, pausas, descarte, respuestas tardías, limpieza/nueva venta,
  cobro actualizado y cámara mantienen la cobertura previa.
- Los fixtures de las pruebas que alojan Caja Android ahora proporcionan catálogo
  y comandos; los doubles de pruebas sin lecturas fallan ante consultas/escrituras
  inesperadas. Se conserva la regresión de texto ampliado en teléfono estrecho;
  la acción de teclado vive en el propio campo para no añadir una fila fija.

Archivos funcionales modificados: `physical_barcode_reader.dart`, `caja_screen.dart`,
`pantalla_principal/home_screen.dart` y `pantalla_principal/menu_lateral.dart`.
Pruebas: lector físico, Caja, cotizaciones, Artículos/buscador, contenedor principal
y doubles de soporte. Los controladores/coordinador existentes no necesitaron cambios.

Evidencia del ajuste: `Evidencia/2026-10-10-lectura-automatica/`.

Verificación final del ajuste:

- `dart analyze`: sin incidencias.
- `flutter test --reporter json`: 1833 aprobadas, 10 omitidas y cero
  fallidas. El archivo del lector físico aporta 99 pruebas aprobadas; la suite
  completa incluye cámara de Caja, editor de variantes, Artículos, contratos,
  handlers e idempotencia. La comparación con el cierre histórico (1766/10)
  representa 67 casos adicionales y las mismas 10 omisiones.
- `flutter build apk --debug`: aprobado; salida
  `/Users/benjamin/Projects/POS/pos_flutter/build/app/outputs/flutter-apk/app-debug.apk`.
- `git diff --check` y comprobación de formato: aprobados. No hubo cambios Drift,
  por lo que no correspondió regenerar esquema.
- Se corrigieron los fallos vinculados a este ajuste: dependencias faltantes en
  fixtures que ahora alojan lector Android, espacio vertical con texto ampliado,
  preparación diferida sin frame solicitado y coordinación de las nuevas pruebas.
  No quedaron fallos ajenos ni se modificaron otros flujos de negocio.
- Logs completos, conteos por archivo/omisiones, SHA-256 del APK, estado Git y diff
  en la carpeta de evidencia. HEAD de referencia `04c807fe3fca269698718f16f0d11f54ab3d3ca0`; cambios sin commit.

Pendientes físicos (se mantienen separados de simulación/compilación):

1. Android real y lector HID: teclado virtual ausente al preparar, entrada física
   con `none`, Enter, ceros, rapidez/repeticiones, interacción táctil, escritura y
   pegado manual con lector conectado, permisos del sistema y reconexión USB/Bluetooth.
   `flutter devices` solo detectó macOS, Chrome y un simulador iOS; no hay Android
   conectado en esta sesión. No se hizo ensayo con lector real.
2. Windows real: compilación y entrada/foco HID, incluidas pausas y regreso al módulo.
   Este equipo es macOS; simular `TargetPlatform.windows` no acredita Windows nativo.
3. Permanecen los ensayos nativos/hardware pendientes documentados en fase 3
   (N19, N20, H01–H06, W01) y los pendientes físicos previos de cámara.

La pausa protege el agregado por este lector; un HID puede escribir en cualquier
otro campo enfocado como teclado. No se promete bloquear físicamente esas teclas.

## Matriz mínima de verificación

| Caso | Resultado esperado |
| --- | --- |
| Entrar en Windows/Android | Campo listo automáticamente, sin selector, sin lector conectado y sin escrituras |
| Fragmento sin Enter | Cero consultas/agregados |
| Android: preparación | Conexión editable con `none`; sin apertura automática del teclado virtual (hardware pendiente) |
| Android: «Escribir código» / otros formularios | Teclado explícito del campo; búsqueda/cantidad/efectivo mantienen teclado normal |
| macOS desactivado / activar selector | Sin captura al estar desactivado; al activar campo con foco y «Listo para escanear» |
| Código único por piezas + Enter | Una intención, un agregado y total actualizado |
| A + Enter tres veces seguidas | Tres unidades bajo las mismas condiciones; tres eventos aceptados |
| A → B → A antes de finalizar el primer comando | FIFO; ninguna lectura completa perdida |
| Código con ceros iniciales | Consulta exacta sin convertir a número |
| Dígitos de ancho completo | Normalización mediante `CodigoBarras` |
| Enter vacío/repetido | Cero agregados adicionales |
| Letras o más de 32 dígitos | Rechazo íntegro; cero escrituras y cero truncamiento |
| Código desconocido seguido de conocido | Aviso del primero y agregado correcto del segundo |
| Código compartido por variantes | Selector; solo agrega la selección confirmada |
| Cancelar selector o cantidad | Cero evento para esa intención; resto de la cola conserva orden |
| Artículo medido | Cantidad explícita y unidad validada por comando |
| Error de comando | Aviso, pausa, sin reintento automático ni confirmación de éxito |
| Abrir búsqueda manual y volver | Pausa, búsqueda textual normal y recuperación controlada del lector |
| Abrir cobro/limpieza/cotización con cola | Resolver pendientes antes de cambiar borrador o calcular total |
| Cambiar módulo/menú/Atrás Android | Resolver o descartar antes de salir; regreso al módulo prepara nueva sesión; sin comandos tardíos |
| Entrada con ruta cubierta o app inactiva | Sin activación/foco hasta disponibilidad; conservar reanudación exigida |
| Perder foco de ventana con código incompleto | Pausa y descarte del fragmento; reanudar no concatena |
| Pérdida de foco por Tab | Mantiene accesibilidad; no roba el foco continuamente |
| Desactivar macOS con operación en curso | Detiene admisión y termina lo aceptado sin deshacer guardados |
| `standalone` y `server_sync` | Borrador `not_required`; refs solo persistidas en `server_sync` |
| Reaplicar un evento ya guardado | Handler idempotente; no aumenta otra vez la cantidad |
| Cámara de Caja/editor de variantes/Artículos | Regresión aprobada de sus contratos actuales |

Usar SQLite temporal/en memoria en tests. Ejecutar la app normal puede reiniciar
la base local por `_resetDatabaseOnStartup`; la prueba física debe usar una
instalación/base de prueba y seguir esa regla vigente del proyecto.

## Criterio global de aceptación

Entrar en Caja en Windows o Android deja «Lector físico» listo sin activar un
selector; no recibir un código completo no cambia la venta. Android prepara el
campo sin abrir el teclado virtual y mantiene una acción explícita de escritura
manual. macOS conserva su selector. Con el lector listo, el usuario escanea
productos por piezas sin abrir la cámara ni pulsar agregar. Cada lectura completa válida agrega una
unidad, las lecturas rápidas conservan el orden, y Caja muestra el borrador
persistido. Búsqueda manual, diálogos y navegación pausan o finalizan la sesión
sin aplicar una lectura a otra venta. La evidencia distingue los tests
automatizados de las comprobaciones realizadas con el lector real.
