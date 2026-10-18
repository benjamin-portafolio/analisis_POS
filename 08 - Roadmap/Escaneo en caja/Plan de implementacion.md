---
tipo: plan_implementacion
estado: implementacion_completada_verificacion_fisica_pendiente
revision: 2
actualizado: 2026-10-10
---

# Escaneo de códigos de barras en caja

## Objetivo

Activar el botón situado junto a «Quiero vender…» en Caja. Al pulsarlo se
abrirá una pantalla con cámara en la parte superior y los artículos de la
venta actual debajo, siguiendo la interacción principal del video de referencia.
Cada lectura aceptada se incorporará inmediatamente al mismo borrador que usa
Caja. Volver a Caja conservará cantidades e importes.

Este plan se creó en la sesión de planificación del 2026-10-04, que inspeccionó
código y video y creó documentación. La implementación y el cierre automatizado
de las tres fases están completados; la evidencia y los casos físicos pendientes
se registran en [[08 - Roadmap/Escaneo en caja/Estado y continuidad|Estado y continuidad]].

**Actualización de alcance del 2026-10-04, revisión 2:** el usuario elimina la
validación física como requisito previo para integrar Caja e indica basarse
en la pantalla de escaneo existente. La consulta y compuerta de sesión 1 están
implementadas y la sesión 2 puede ejecutarse. Las comprobaciones físicas se
conservan para la verificación final, registradas como pendientes si no hay
dispositivo; su ausencia no bloquea crear la pantalla ni conectar los botones.

## Solicitud y referencia visual

Video local, duración aproximada de 19 segundos:

```text
/Users/benjamin/Downloads/Archivos-del-celular/Screenrecorder-2026-10-04-19-20-22-403.mp4
```

Se observan una cámara con guía horizontal, tarjetas debajo con nombre,
precio y cantidades ×1/×2, un aviso al leer un código desconocido y el regreso
a Caja con dos artículos y cuatro unidades. Es una referencia de interacción;
sus textos y opciones de crear o enlazar artículos no amplían la solicitud.

**Decisión confirmada por el usuario:** otra unidad del mismo producto se suma
al retirar y volver a presentar el código. Mantenerlo frente a la cámara no
debe incrementar continuamente la cantidad.

## Base real inspeccionada

Proyecto Flutter: `/Users/benjamin/Projects/POS/pos_flutter`, HEAD `65c07bc`,
sin cambios locales al inspeccionarlo. Revalidar este estado en cada sesión.

| Punto | Implementación actual | Consecuencia para el plan |
|---|---|---|
| Acceso principal | `lib/presentation/widgets/article_search_bar.dart`: `Icons.qr_code_scanner`, `onPressed: null` | Recibir un callback opcional y conectarlo desde Caja |
| Otros accesos | Caja tiene otro botón inerte junto a «Añadir artículo nuevo»; Artículos reutiliza `ArticleSearchBar` | Conectar también el segundo botón de Caja al mismo flujo; conservar Artículos sin activar su lector |
| Icono | Flutter local 3.41.6 incluye `Icons.barcode_reader` | Sustituir el QR sin agregar una librería de iconos |
| Cámara existente | `BarcodeScannerScreen` del editor de variantes, con `mobile_scanner` 7.4.2 | Reutilizar experiencia y manejo del ciclo de vida; conservar su contrato de una lectura que devuelve `String?` |
| Código almacenado | `product_variants.barcode`; `CodigoBarras` normaliza NFKC y trim, acepta hasta 32 dígitos y conserva ceros | Buscar texto exacto normalizado; nunca convertir a número |
| Consulta faltante | `ProductoRepository` no ofrece búsqueda por barcode; la búsqueda actual compara nombres | Agregar una consulta local específica, sin alterar la búsqueda por nombre |
| Códigos repetidos | La tabla no impone unicidad de barcode | La consulta devolverá todos los candidatos activos; la UI resolverá ambigüedad |
| Agregar a venta | `VentaBorradorCommandService.agregar(AgregarProductoBorradorCommand)` | Usar el mismo comando que el buscador manual |
| Acumulación | El command service combina líneas si sus snapshots tienen las mismas condiciones | No sumar cantidades ni fusionar precios en la UI |
| Venta medida | `ArticleSearchScreen` utiliza `SaleQuantityDialog` y `expectedUnitId` | Pedir cantidad con ese diálogo cuando corresponda |
| Estado de venta | `SaleDraftRepository.watchCurrentDraft()` | Mostrar estado persistido; no mantener un carrito paralelo |
| Eventos | Los cambios de borrador son `not_required` en ambos modos; se guardan refs solo en `server_sync` | Escanear no debe convertir borradores en pendientes remotos |

Referencias oficiales verificadas junto al código local:
[icono barcode_reader](https://api.flutter.dev/flutter/material/Icons/barcode_reader-constant.html)
y [DetectionSpeed de mobile_scanner 7.4.2](https://github.com/juliansteenbakker/mobile_scanner/blob/v7.4.2/lib/src/enums/detection_speed.dart).

## Comportamiento previsto

1. Ambos botones de código de barras de Caja abren la misma ruta. El icono
   será `Icons.barcode_reader` y el tooltip «Escanear código de barras».
2. La pantalla mostrará «Escanear artículos», regreso/cierre, cámara superior
   con marco horizontal y una instrucción breve. Debajo habrá una cuadrícula
   desplazable de los artículos de la venta actual, incluidos los que estaban
   agregados antes de abrir el lector.
3. Una coincidencia activa única por código agrega una pieza sin confirmación
   adicional. La pantalla continúa abierta para los siguientes escaneos.
4. Si es un artículo de venta medida, se suspende la admisión de lecturas y
   se utiliza `SaleQuantityDialog`. Confirmar ejecuta el comando existente;
   cancelar conserva la venta. No asumir una pieza ni interpretar peso/precio
   a partir de códigos variables.
5. Si varias variantes activas comparten el código, se suspende la admisión y
   se muestra un selector con producto, variante y precio. No elegir el primer
   resultado arbitrariamente. Cancelar no agrega nada.
6. Un código desconocido muestra «No se encontró un artículo con este código»
   y permite continuar escaneando. Una entrada incompatible con `CodigoBarras`
   recibe un aviso breve. No abrir alta ni enlazar automáticamente el código.
7. Una vez confirmado el guardado, las tarjetas muestran nombre, variante si
   existe, precio y cantidad. Usar snapshots del borrador y `SaleDraftDisplay`.
   Una tarjeta por línea de venta evita mezclar precios/unidades distintos
   de una misma variante; el contador de artículos conserva `articleCount`.
8. Pie fijo con total y «Ir a caja (N artículos)», habilitado con venta no vacía
   y sin operación pendiente. Regreso/cierre también conserva lo ya agregado.
   El cobro y la edición de líneas se realizan con los flujos actuales de Caja.
9. Mostrar confirmación breve de la lectura aceptada y estado de guardado;
   no encadenar snackbars ni avisos por cada frame repetido.
10. Sin permiso o cámara disponible, mantener visibles venta y regreso, con
    explicación para habilitar permiso o utilizar el buscador existente.

Estas reglas completan los detalles no definidos por el video. Pueden ajustarse
antes de implementar sin cambiar la decisión de retirar y volver a presentar.

## Control de lecturas repetidas

`DetectionSpeed.noDuplicates` no cumple la decisión del usuario: bloquea el
mismo valor hasta leer otro código distinto. Además, en las implementaciones
Android y Darwin de 7.4.2 inspeccionadas, los frames sin códigos no se envían
como capturas vacías a Dart. No basar un test en capturas vacías artificiales
que la cámara real no emite.

La sesión 1 implementó `DetectionSpeed.normal` con observaciones cada 200 ms
y `BarcodeReadGate`, separada del guardado, con aproximadamente 1 segundo sin
observar el código para admitir su reaparición. Reutilizar esa implementación
en sesión 2 y basar cámara, permisos y liberación en el lector existente del
editor de variantes. El umbral queda documentado para calibración posterior.

La compuerta deberá:

- Actualizar presencia incluso cuando una lectura no se acepta por repetición
  o por un comando en curso. El bloqueo de negocio no debe simular retirada.
- Admitir una sola acción por presentación, serializar consulta/selección/
  cantidad/comando y descartar callbacks antiguos de una ruta cerrada.
- No interpretar pausa de cámara, diálogo, cambio de ruta, segundo plano o
  error como retirada. Al reanudar, conservar la protección del último código;
  esperar observaciones nuevas de cámara activa antes de rearmar.
- Filtrar al área visible del lector. Si hay varios códigos válidos distintos
  dentro de esa área, pedir enfocar uno sin agregar varios productos por frame.
- Registrar el rechazo/cancelación de una presentación para evitar repetir
  indefinidamente un selector, error o diálogo mientras el código siga delante.

**Limitación conocida:** ausencia de lecturas positivas puede significar
desenfoque, no retirada física. La estrategia temporal es una aproximación que
necesita prueba real, especialmente manteniendo el mismo código inmóvil y con
pequeños cambios de luz/enfoque. No afirmar que el plugin detecta la retirada.

Si la verificación posterior reproduce cantidades extra o impide relecturas
intencionales, corregir el comportamiento observado y evaluar una adaptación
versionada del detector solo si resulta necesaria. Documentar cualquier cambio
de dependencia y cubrirlo con pruebas. No editar `.pub-cache` ni sustituir
silenciosamente la decisión del usuario por repetición temporizada o un botón
manual. La posibilidad de ese ajuste no es otro requisito para iniciar sesión 2.

## Diseño técnico acotado

### Lectura del catálogo

Extender `ProductoRepository` con una operación similar a
`buscarVariantesPorCodigoBarras(String codigo)`. Devolver una lista de modelos
de dominio con identidad de producto/variante, nombres, precio y configuración
de venta/unidad necesarios para seleccionar y agregar. Nombre exacto del DTO
a resolver al implementar; una clase principal por archivo.

Implementar en `ProductoDao` una consulta con igualdad sobre barcode y JOIN a
producto: solo variante y producto activos. Mapear en
`ProductoRepositoryImpl`, reutilizando mapeos de unidades cuando corresponda.
No cargar el catálogo completo ni consultar detalle de cada producto para
buscar un barcode. Cero, uno y varios resultados son estados válidos.

No se necesita cambiar tablas ni imponer una nueva unicidad global. No añadir
índices ni migraciones sin una necesidad demostrada. Actualizar los fakes de
`ProductoRepository` al extender su interfaz.

### Pantalla y navegación

Nueva pantalla sugerida:
`lib/presentation/pages/caja/sale_barcode_scanner_screen.dart`.
Aceptar repositorios/command service inyectables como las pantallas existentes.
`CajaScreen` coordinará la apertura; `ArticleSearchBar` recibirá `onScanBarcode`
opcional. El segundo botón de Caja reutilizará el mismo método de apertura.

Reutilizar `lib/presentation/pages/caja/barcode/barcode_read_gate.dart` y el
manejo de cámara del lector mínimo cuando corresponda. Usar
`lib/presentation/pages/gestion_inventario/articulos/widgets/barcode_scanner_screen.dart`
como referencia directa de permisos, inicio/parada, detección y liberación.
Compartir manejo de cámara o widgets pequeños donde haya reutilización real,
conservando la salida `String?` y las pruebas del lector del editor.

La lista observa `watchCurrentDraft()`. Los importes provienen de la proyección,
no de incrementos optimistas. El comando revalida disponibilidad y unidad
cuando se ejecuta; un cambio del catálogo entre consulta y guardado se muestra
como error y no crea una tarjeta ficticia. Si se inicia un guardado y el usuario
sale, definir cierre que espere esa operación; no afirmar rollback por cerrar
una pantalla.

### Persistencia y modos

```text
Cámara → normalización y compuerta → consulta local por barcode
       → selección/cantidad si corresponde
       → VentaBorradorCommandService.agregar
       → evento existente → proyección local → repositorio → tarjetas y Caja
```

Las consultas no generan eventos. Agregar conserva referencias declaradas y
validadas en ambos modos. En `standalone`: `delivery_status = not_required`,
sin filas en `event_refs` ni actividad de push/pull/preflight/health/WebSocket.
En `server_sync`: refs persistidas conforme al flujo existente; los eventos de
borrador siguen siendo locales `not_required`. La confirmación posterior de
venta mantiene su flujo actual.

No se prevén cambios en NestJS, contratos de eventos, esquema de base, inventario
ni cobro. Quedan fuera alta/enlace de códigos desconocidos, QR, códigos de peso
variable, escáner Bluetooth/USB y búsquedas textuales por barcode.

## Sesiones recomendadas

Tres sesiones secuenciales. La fase 1 ya dispone de consulta, compuerta,
prototipo y comprobaciones automatizadas. Continuar con la fase 2 basándose
en el lector existente, sin exigir disponer de teléfono para iniciar la
integración. Se pueden unir fases si sus criterios de salida están satisfechos.

| Sesión | Entrega | Criterio de salida |
|---|---|---|
| [[08 - Roadmap/Escaneo en caja/Sesiones/01 - Consulta y control de lecturas\|1. Consulta y control de lecturas]] | Búsqueda exacta local, normalización, resolución de resultados y compuerta probada en un lector mínimo | Consulta y compuerta verificadas con pruebas automatizadas; estrategia y límites registrados |
| [[08 - Roadmap/Escaneo en caja/Sesiones/02 - Pantalla e integracion\|2. Pantalla e integración]] | Iconos, ambos accesos de Caja, cámara arriba, tarjetas abajo, retorno y casos de selección/cantidad/error | Un único borrador persistido y navegación correcta; lector del editor y Artículos sin regresiones |
| [[08 - Roadmap/Escaneo en caja/Sesiones/03 - Verificacion y cierre\|3. Verificación y cierre]] | Pruebas locales por modo, suite, compilación y reproducción física del flujo | Matriz satisfecha y evidencia registrada; pendientes físicos no cuentan como aprobados |

La evidencia física pendiente de fase 1 se traslada a la verificación final.
La decisión vigente del usuario permite ejecutar fase 2 y conectar los botones
de Caja usando la implementación existente. No declarar aprobados los casos
físicos no ejecutados ni conservar el acceso deshabilitado por ese pendiente.

## Casos de aceptación

| ID | Caso | Resultado esperado |
|---|---|---|
| E01 | Abrir desde ambos botones de Caja | Misma pantalla, icono barcode y una sola cámara |
| E02 | Abrir con venta vacía o con productos previos | Estado correcto; no crear borrador por abrir |
| E03 | Código único activo | Una pieza y precio actual mediante el comando; tarjeta tras commit |
| E04 | Código inmóvil 20 segundos; pequeñas variaciones de luz/enfoque | Una incorporación, sin crecimiento automático |
| E05 | Tres presentaciones del mismo código, con retirada entre ellas | Tres incorporaciones; acumulación según snapshots existentes |
| E06 | Secuencia A → B → A | A con dos unidades y B con una cuando sus condiciones no cambian |
| E07 | Muchos callbacks seguidos y guardado lento | Una acción por presentación; sin comandos concurrentes ni duplicados |
| E08 | Código desconocido, inválido o solo filas inactivas | Aviso controlado y cero escrituras |
| E09 | Dos variantes activas comparten código | Selector; una elección agrega una sola variante; cancelar no escribe |
| E10 | Dos etiquetas distintas dentro del área | Pedir enfocar una; no elegir por orden del detector |
| E11 | Venta medida: confirmar/cancelar/cambiar unidad | Misma conversión exacta y validación que buscador manual |
| E12 | Ceros iniciales y UPC-A/EAN-13 | Lectura y captura del editor compatibles; no quitar/agregar ceros sin contrato explícito |
| E13 | Precio/configuración cambia entre incorporaciones | Conservar líneas y snapshots distintos, sin fusionar importes visualmente |
| E14 | Fallo de consulta o guardado; variante desactivada mientras se lee | Sin tarjeta optimista; mensaje y recuperación sin duplicar el intento |
| E15 | Cerrar, ir a Caja, reabrir y reiniciar app | Mismo borrador, cantidades y total persistidos |
| E16 | Permiso denegado, cámara ausente, permiso pendiente al cerrar | Error útil, regreso disponible y cámara liberada |
| E17 | Segundo plano/diálogo/regreso con mismo código delante | Sin incrementos por reanudar; operaciones de cámara serializadas |
| E18 | `standalone` y `server_sync`, sin internet | Mismo flujo local; eventos/refs conforme a la regla de modos |
| E19 | Teléfono pequeño, tablet, orientación y texto ampliado | Cámara y lista utilizables; total y regreso accesibles sin overflow |
| E20 | Regresión del editor de variantes y buscador manual | Una lectura sigue devolviendo `String?`; búsqueda y cobro conservan comportamiento |

Validar físicamente formatos numéricos ya admitidos, con prioridad a EAN-13,
EAN-8 y UPC-A. El alcance no amplía el contrato de hasta 32 dígitos para admitir
payloads alfanuméricos, GS1 con separadores o QR.

## Verificación y continuidad

Al implementar: pruebas de DAO/repositorio con SQLite temporal, pruebas de
compuerta con reloj controlado y secuencias reales del plugin, widgets con
`FakeMobileScannerPlatform`, e integración con command service/proyección
reales. El fake valida lógica y ciclo de vida; no sustituye prueba de retirada,
enfoque, formatos ni permisos del sistema en dispositivo.

Después de cambios funcionales ejecutar `dart analyze` y `flutter test` conforme
a AGENTS. Regenerar Drift si cambian entradas de generación, sin modificar el
esquema por esta consulta. Registrar compilación Android y pruebas físicas con
modelo, versión de Android, formatos, secuencias y resultado. En iOS/macOS
registrar lo efectivamente comprobado y sus límites, sin asumir paridad nativa.

Cada sesión actualiza [[08 - Roadmap/Escaneo en caja/Estado y continuidad|Estado y continuidad]]
con archivos propios, pruebas/comandos, resultados, pendientes,
estrategia de rearmado y siguiente fase. Leer AGENTS vigentes y conservar cambios
ajenos. La documentación existente de caja/inventario no demuestra que este
lector esté implementado ni probado.


## Continuidad con lector físico — 2026-10-10

Caja incorpora también el modo de teclado HID de escritorio, inicialmente
desactivado y con campo dedicado. La resolución de código, selección/cantidad y
agregado se comparte mediante `SaleBarcodeReadCoordinator`; la cámara conserva
`BarcodeReadGate`, ciclo de vida y contratos actuales. Búsqueda manual, cámara,
editor de variantes y Artículos tienen regresión aprobada en la suite actual
(1766 aprobadas, 10 omitidas, 0 fallidas). El historial de revisión 2 y los
resultados de las sesiones anteriores se conservan.

`flutter build macos --debug` y ensayos de navegación/captura de teclado en la
app principal aislada están registrados en [[08 - Roadmap/Lector fisico en caja/Verificacion fase 3|Verificación de fase 3 del lector físico]]. No se usó lector real ni
Windows, por ausencia de equipo confirmada por el usuario. Abrir/cerrar la
pantalla nativa de cámara no acredita decodificación, retirada/enfoque, formatos
ni permisos interactivos; esos pendientes físicos siguen vigentes.

Pausar el modo HID evita agregados a la venta desde el lector, pero no impide que
el dispositivo escriba como teclado en otro campo enfocado. USB y Bluetooth no
se acreditan con entrada simulada ni uno por la prueba del otro.
