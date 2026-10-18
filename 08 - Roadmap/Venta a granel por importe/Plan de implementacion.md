---
tipo: plan_implementacion
estado: sesion_2_implementada_verificacion_fisica_pendiente
revision: 1
actualizado: 2026-10-15
---

# Venta a granel por importe objetivo

## Objetivo y decisión del usuario

En la ventana actual de venta medida, permitir escribir primero un importe en
pesos, calcular la cantidad física vendible y cobrar el importe correspondiente
a esa cantidad. Conservar la captura directa de cantidad y el flujo offline
actual de Caja.

El usuario propuso y pidió planificar este comportamiento el 2026-10-15:
con precio de $60.00/kg, ingresar $20.00 propone 334 g y el cobro es $20.04.
La regla elegida es redondear la cantidad física hacia arriba al siguiente
átomo representable, no al gramo más cercano. Si la conversión ya es exacta,
no se agrega un átomo extra. El importe definitivo debe ser visible antes de
pulsar Agregar; no aparecer como sorpresa en la pantalla de cobro.

Es una opción coherente con el modelo actual: el importe escrito orienta la
cantidad y el peso sigue determinando venta, consumo y ticket. No asegura un
presupuesto máximo. El excedente depende del precio de un átomo y no siempre
es de pocos centavos; mostrar importe solicitado, cantidad propuesta y cobro
resultante permite aceptarlo o corregir la cantidad.

## Base real revisada

Proyecto: `/Users/benjamin/Projects/POS/pos_flutter`.

| Componente | Situación actual | Cambio previsto |
| --- | --- | --- |
| `presentation/pages/articulos/sale_quantity_dialog.dart` | Recibe nombre/unidad y devuelve `String?` de cantidad | Dos campos, precio/referencia, vista previa y resultado de formulario tipado |
| `presentation/pages/articulos/article_search_screen.dart` | Abre el diálogo desde búsqueda textual | Pasar condiciones del precio y convertir el resultado a comando |
| `presentation/pages/caja/sale_barcode_scanner_screen.dart` | Usa el mismo diálogo en cámara | Integrar la misma captura por importe |
| `presentation/pages/caja/barcode/physical_barcode_reader.dart` | Usa el mismo diálogo en lector físico | Integrar sin cambiar cola, pausas ni recuperación de foco |
| `presentation/pages/caja/barcode/sale_barcode_read_coordinator.dart` | Su callback de cantidad devuelve `String?` | Adaptar el callback al resultado tipado de presentación |
| `application/commands/ventas/agregar_producto_borrador_command.dart` | Admite texto de cantidad y unidad esperada | Admitir alternativamente importe objetivo en centavos y condiciones esperadas de precio |
| `application/commands/ventas/venta_borrador_command_service.dart` | Convierte cantidad, acumula líneas y registra evento local | Resolver importe a átomos dentro de la transacción existente |
| `application/sync/payloads/sale_item_snapshot.dart` | Calcula total proporcional con BigInt y half-up | Compartir aritmética sin cambiar formato ni resultado histórico |
| `presentation/pages/caja/draft_item_edit_sheet.dart` | Edita cantidad con precio del snapshot | Conservar la edición actual por cantidad; captura por pesos aquí queda fuera |

La escala actual es un gramo para masa y un mililitro para volumen. `kg`
representa 1000 átomos y acepta tres decimales; `g` representa un átomo y no
acepta fracciones. La misma conversión por importe debe funcionar para los
productos medidos existentes en kg, g, L o ml, usando su referencia de precio.

Estado observado de Flutter al planificar: cambios previos en `pubspec.lock`
y carpeta no versionada `packages/pos_bluetooth_printer/android/.gradle/`.
Conservarlos y volver a revisar el estado real al implementar. El vault de
análisis también contiene cambios previos; no modificarlos ni atribuirlos a
este plan.

## Contrato de cálculo

Para operandos positivos:

```text
A = importe objetivo en centavos
P = precio de venta en centavos
R = cantidad atómica a la que corresponde P

Q = ceil(A * R / P)
  = (A * R + P - 1) ~/ P

C = halfUp(P * Q / R)
  = (2 * P * Q + R) ~/ (2 * R)
```

Todos los productos y sumas intermedias se hacen con BigInt. Entradas y
resultados persistibles deben estar entre 1 y 9 007 199 254 740 991 cuando
se requiere positividad. Conservar las reglas existentes para el total de una
captura directa por cantidad, incluido un total que redondea a cero.
No usar double, REAL ni fracciones de átomo. Validar el rango del peso y el
importe, incluyendo el posible excedente sobre A después de aplicar ceil.

La cantidad visible es Q expresada en la unidad del producto mediante el
codec existente. El redondeo hacia arriba se aplica solamente al convertir
un importe a cantidad. La captura manual de peso conserva su conversión
exacta y el cobro conserva half-up a centavos.

| Precio y referencia | Captura | Cantidad resultante | Cobro de esa cantidad |
| --- | --- | --- | --- |
| $60.00 por 1000 g | $20.00 | 334 g / 0.334 kg | $20.04 |
| $80.00 por 1000 g | $20.00 | 250 g / 0.250 kg | $20.00 |
| $60.00 por 1000 g | 333 g manuales | 333 g / 0.333 kg | $19.98 |
| $12.00 por 100 g | $20.00 | 167 g | $20.04 |
| $40.00 por 1000 ml | $15.00 | 375 ml / 0.375 L | $15.00 |
| $60.00 por 1000 g | $0.01 | 1 g | $0.06 |

### Acumulación

Conservar `sameConditions`, `plus` y el redondeo una sola vez sobre toda la
línea. Dos capturas de $20.00 a $60/kg agregan 334 g cada una: la línea queda
en 668 g y $40.08. No sumar los importes objetivo ni fusionar cantidades en
la UI. El importe objetivo no forma parte de las condiciones de agrupación.

En precios que producen fracciones de centavo, el total acumulado puede
diferir de la suma de las vistas previas individuales. Ejemplo: precio de
1 centavo por 3 g, importe objetivo de 1 centavo agrega 3 g a una línea
previa de 1 g; el total de la línea de 4 g es 1 centavo. Se mantiene la regla
actual. La vista previa debe identificar el importe de la cantidad capturada
y, si se incorpora a una línea existente, mostrar también el total previsto
de esa línea calculado sobre su cantidad acumulada. Caja y el ticket leen
siempre el total persistido. No cambiar agrupación ni redondear por operación
para forzar la suma de vistas previas.

## Contrato de aplicación y persistencia

1. Crear una calculadora pura en `domain/ventas`, por ejemplo
   `MeasuredSaleCalculator`, reutilizable por comandos, snapshots y UI.
   Centralizar el cálculo proporcional medido que usa `SaleItemSnapshot`
   sin cambiar la aritmética de piezas ni el comportamiento histórico.
2. Extender `AgregarProductoBorradorCommand` con `targetAmountMinor` opcional
   y condiciones esperadas de precio y referencia. En una venta medida debe
   venir exactamente una fuente: `measuredQuantity` o `targetAmountMinor`.
   Rechazar ambas, ninguna, importes no positivos, fuera de rango o captura
   por importe para un producto por piezas.
3. Una captura por importe debe incluir `expectedUnitId`, precio esperado y
   referencia esperada. Releer catálogo y comparar dentro de la operación
   atómica: si cambian, rechazar sin escrituras y pedir revisar el artículo.
   La nueva UI enviará también las condiciones de precio al capturar peso,
   porque ya habrá mostrado una vista previa monetaria.
4. Mantener compatibles los llamadores actuales de cantidad: las nuevas
   condiciones de precio son opcionales para ese camino legado, pero deben
   venir completas si se proporciona alguna. No volver obligatorios los
   campos nuevos para las ventas por piezas existentes.
5. El servicio convierte el importe a Q usando el catálogo validado y crea
   el mismo `SaleItemSnapshot` y `ProductoAgregadoBorradorPayload` actuales.
   La UI no entrega un peso precalculado como única prueba de la intención
   por importe; envía el importe para que el servicio lo resuelva también.
6. A no se persiste: es entrada temporal. El evento conserva Q y snapshots
   de precio, referencia y unidad. No se agregan campos al payload, eventos,
   tablas, migraciones, versiones de esquema ni cambios de servidor.
7. Conservar declaración/validación de refs en ambos modos, persistencia solo
   en `server_sync`, borradores `not_required` en ambos modos y ausencia de
   actividad remota en standalone. No alterar confirmación ni inventario.

## Interacción de la ventana

1. Abrir con campo «Importe solicitado ($)» vacío, arriba y con foco inicial;
   debajo «Cantidad (unidad)». Mostrar producto/variante y precio por su
   referencia real, no asumir que todo precio corresponde a un kilo.
2. Al escribir pesos, conservar ese texto mientras se edita, calcular Q y
   mostrar el peso. Mostrar aparte «Cobro por esta cantidad: $20.04» y,
   cuando corresponda, «Ajuste por peso: +$0.04». El total no se oculta hasta
   aceptar ni sobrescribe los $20.00 que se están escribiendo.
3. Al editar cantidad manualmente, esa pasa a ser la fuente de la intención;
   actualizar el importe correspondiente y limpiar la condición anterior de
   importe objetivo. Solo las ediciones manuales cambian la fuente; las
   actualizaciones de controllers no disparan conversiones de vuelta en bucle.
4. Aceptar dinero con hasta dos decimales y normalización de trim/coma o
   punto, sin separadores de millares ni conversión a double. Tratar vacío,
   texto incompleto o inválido como estado temporal, sin dejar una cantidad
   anterior habilitada para guardarse por accidente.
5. Habilitar Agregar únicamente con una intención válida y su cobro visible.
   Enter usa esa intención; bloquear doble envío. Cancelar no crea eventos.
   No añadir un segundo modal de confirmación.
6. Observar el borrador para la vista de acumulación, usando las condiciones
   de agrupación del dominio. Si cambia mientras está abierta la ventana,
   refrescar esa vista; no mantener un carrito paralelo. Ante un cambio de
   precio/unidad/referencia, descartar la aceptación obsoleta y requerir una
   nueva revisión visible, sin guardar silenciosamente al precio nuevo.
7. El resultado del formulario vive en `presentation`, en archivo propio.
   Buscador, cámara y lector físico lo convierten al comando. Conservar las
   barreras actuales de lectura, cancelación, ciclo de vida y pausa del HID.
8. La edición posterior de una línea sigue por peso con los snapshots
   existentes; no ampliar esa pantalla a captura monetaria en estas fases.

## Sesiones de implementación

### Sesión 1: cálculo compartido y comando local

Implementar calculadora, reutilización desde `SaleItemSnapshot`, entrada
alternativa del comando, validación de condiciones y resolución dentro de
`VentaBorradorCommandService.agregar`. No modificar presentation ni callbacks
de lectores todavía. Los campos nuevos quedan disponibles y probados como
base solicitada para la sesión 2; indicarlo en el relevo.

Pruebas necesarias:

- Casos de la tabla, conversión exacta sin átomo adicional, medio centavo y
  equivalencia de unidades/referencias distintas de 1 kg.
- Cero, negativos, límites seguros, overflow intermedio manejado con BigInt
  y resultado fuera de rango. No cambiar el caso existente de peso manual
  cuyo total redondea a cero.
- Una sola fuente, condiciones esperadas completas, precio/referencia/unidad
  cambiados y producto por piezas: rechazo sin eventos ni proyecciones nuevas.
- Comandos reales con SQLite temporal: snapshots, total, acumulación y
  replay idempotente; ambos modos para refs y `not_required`. Conservar la
  captura manual y los comandos de actualizar/eliminar existentes.

Salida: $20 a $60/kg genera 334 átomos y 2004 centavos mediante el comando
real; se conserva el formato de evento. Ejecutar `dart analyze` y
`flutter test`, registrar resultados reales y cambios ajenos sin mezclarlos.
No corresponde build_runner si no se cambia esquema/generados.

Prompt: [[08 - Roadmap/Venta a granel por importe/Prompts/01 - Conversion y comandos|Sesión 1]].

### Sesión 2: ventana, tres accesos y verificación

Implementar el formulario tipado, dos campos, foco, vista previa por captura
y acumulada, validación del texto y estados de envío. Conectar buscador,
cámara y lector físico con la API de sesión 1. Reutilizar la calculadora,
el codec y el repositorio del borrador, sin duplicar fórmulas ni persistencia.

Probar widgets del diálogo y los tres accesos, cancelación, cambios de fuente,
condiciones obsoletas, repetición de producto, liberación/retorno de foco y
pausas existentes. Verificar con flujo real que el peso/total coinciden en
Caja, confirmación, ticket y consumo de inventario donde corresponda; incluir
una lectura tras reiniciar la base temporal. Ejecutar `dart analyze` y
`flutter test`.

Comprobar manualmente en una plataforma disponible foco inicial, teclado,
legibilidad del ajuste y ausencia de overflow con teclado/texto ampliado.
Registrar por separado lo automatizado y cualquier prueba física pendiente;
no atribuir una prueba simulada a hardware real.

Prompt: [[08 - Roadmap/Venta a granel por importe/Prompts/02 - Ventana e integracion|Sesión 2]].

## Límites y continuidad

No incluye báscula electrónica, captura de peso desde códigos variables,
descuentos para forzar el importe objetivo, nuevos incrementos de peso,
fracciones de gramo, precios modificados, edición por pesos de líneas ya
agregadas, cambios de cotizaciones, servidor, dependencias ni sincronización.

Al completar cada sesión, actualizar este documento con archivos propios,
pruebas ejecutadas/resultados, limitaciones y próximo paso. No marcar la
sesión 2 como completada por haber terminado solo el núcleo.

Estado al 2026-10-15: sesiones 1 y 2 implementadas. Captura por importe
habilitada en búsqueda, cámara y lector físico. Verificación automatizada de
sesión 2 aprobada; comprobación manual parcial y pruebas físicas pendientes,
detalladas en su resultado. Los fakes de cámara/HID no acreditan hardware.

## Resultado de sesión 1 — 2026-10-15

Trabajo realizado en Flutter sobre rama `main`, HEAD inicial
`672361f327588aa1fe2abd73b1fa468f11d1753f`, sin commit ni despliegue.
Se leyeron ambos `AGENTS.md`, el prompt de sesión 1 y los tres documentos
de arquitectura/checklist indicados. Se conservaron los cambios previos de
`pubspec.lock` y `packages/pos_bluetooth_printer/android/.gradle/`, así como
los cambios ajenos del vault de análisis. En el vault solo se editó este plan.

### Implementación y archivos propios

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`:

- Nuevo `lib/domain/ventas/measured_sale_calculator.dart`:
  `MeasuredSaleCalculator.quantityAtomicForAmount` aplica ceil con BigInt;
  `totalMinor` aplica half-up sobre la cantidad completa. Valida operandos
  positivos, cantidad e importe resultantes hasta 9 007 199 254 740 991,
  incluyendo el excedente causado por el átomo adicional. El total
  proporcional de una cantidad manual puede seguir siendo cero.
- `lib/application/sync/payloads/sale_item_snapshot.dart`: la rama medida
  reutiliza la calculadora. Conserva piezas, JSON, snapshots,
  `sameConditions`, `plus` y un solo redondeo sobre el total de la línea.
- `lib/application/commands/ventas/agregar_producto_borrador_command.dart`:
  agrega `targetAmountMinor`, `expectedUnitPriceMinor` y
  `expectedPriceReferenceQuantityAtomic`. Por importe exige esos campos y
  `expectedUnitId`; por peso las condiciones monetarias siguen opcionales,
  pero deben enviarse completas si se proporciona alguna.
- `lib/application/commands/ventas/venta_borrador_command_service.dart`:
  relee catálogo, valida condiciones y resuelve la fuente de cantidad dentro
  de `store.atomic`. Una venta medida exige exactamente una fuente. Rechaza
  condiciones obsoletas antes de registrar eventos. El importe objetivo
  permanece como entrada temporal; persiste el mismo evento con cantidad
  atómica y snapshots existentes.
- Nuevo `test/domain/ventas/measured_sale_calculator_test.dart`.
- Nuevo `test/application/sync/payloads/sale_item_snapshot_test.dart`.
- Ampliado
  `test/application/commands/ventas/venta_borrador_command_service_test.dart`.

Las pruebas reales con SQLite temporal en memoria verificaron, en ambos
modos, los ejemplos del contrato, kg/g/L/ml, referencia de 100 g, ceil exacto
y fraccionario, half-up, límites e intermedios mayores que int64. Incluyen
rechazos de entradas incompatibles, condiciones incompletas, precio,
referencia o unidad obsoletos y comparación de eventos, refs, ventas, líneas
y movimientos antes/después para comprobar ausencia de cambios persistidos.

Resultado del comando real: $20.00 a $60/kg guarda 334 átomos y 2004 centavos;
dos capturas conservan una línea con 668 átomos y 4008 centavos. La mezcla
de captura manual e importe conserva el redondeo sobre la cantidad acumulada.
Reaplicar eventos antiguos o recientes conserva cantidades, total y versión.
Los eventos de borrador siguen `not_required` en ambos modos; las cinco refs
de la captura medida se persisten solo en `server_sync`. Se mantuvieron las
regresiones de captura manual, total cero, actualizar y eliminar.

### Verificación ejecutada

Inspección inicial y final con `git status --short`, `git branch
--show-current`, `git rev-parse HEAD`, `git diff` y búsquedas `rg`.
`git diff --check` terminó sin errores. Se revisaron imports y referencias de
los campos y métodos nuevos; todos tienen uso en esta sesión o forman parte
de la API solicitada para sesión 2.

```sh
dart format lib/domain/ventas/measured_sale_calculator.dart lib/application/sync/payloads/sale_item_snapshot.dart lib/application/commands/ventas/agregar_producto_borrador_command.dart lib/application/commands/ventas/venta_borrador_command_service.dart test/domain/ventas/measured_sale_calculator_test.dart test/application/sync/payloads/sale_item_snapshot_test.dart test/application/commands/ventas/venta_borrador_command_service_test.dart
flutter test test/domain/ventas/measured_sale_calculator_test.dart test/application/sync/payloads/sale_item_snapshot_test.dart test/application/commands/ventas/venta_borrador_command_service_test.dart
dart analyze
flutter test > /tmp/pos-granel-session1-flutter-test.log 2>&1
```

- Pruebas enfocadas: 108 aprobadas, salida 0.
- `dart analyze`: `No issues found!`, salida 0.
- `flutter test`: 1923 aprobadas y 10 omitidas, salida 0, `All tests passed!`.
  Las omitidas son una prueba de `variant_tracking_server_test.dart`, que
  requiere `POS_PHASE3_SYNC_URL`, y nueve de
  `product_suppliers_server_test.dart`, que requieren `POS_SUPPLIER_SYNC_URL`.
  Esas integraciones con NestJS/PostgreSQL aislados no se ejecutaron.
- Se retiraron del diff los cambios de formato que afectaban métodos y
  pruebas anteriores fuera de la modificación funcional.
- Sin cambios Drift/generados, por lo que no correspondió `build_runner`.

### Límites y relevo a sesión 2

La sesión 1 entrega cálculo y API de comandos probados. La captura por importe
todavía no está habilitada en pantalla. Se conservaron presentación,
`SaleQuantityDialog`, callbacks/coordinadores de lectores y edición de líneas.
También se conservaron payloads (salvo reutilización interna de aritmética en
el snapshot), tablas, schemaVersion, dependencias, impresión, cotizaciones,
confirmación, inventario, servidor y sincronización. No se ejecutó la app ni
se abrió o reinició una base de uso, y no hubo pruebas físicas.

Para continuar, implementar únicamente la sesión 2 cuando se solicite:

1. Crear el resultado de formulario en `presentation` y adaptar diálogo,
   buscador, cámara y lector físico, conservando sus barreras y pausas.
2. Para importe, enviar `targetAmountMinor`, `expectedUnitId`,
   `expectedUnitPriceMinor` y `expectedPriceReferenceQuantityAtomic`, dejando
   `measuredQuantity` en null. Para peso, enviar el texto con las mismas
   condiciones esperadas y dejar `targetAmountMinor` en null.
3. Reutilizar `quantityAtomicForAmount`, `totalMinor` y el codec existente
   para mostrar cantidad y cobro. Observar el borrador para mostrar también
   el total acumulado con sus condiciones de agrupación, sin sumar objetivos
   o redondeos de capturas individuales.
4. Mostrar el rechazo de condiciones obsoletas y requerir una revisión visible.
   Verificar widgets, los tres accesos, persistencia tras reinicio temporal,
   Caja/confirmación/ticket/consumo y pruebas manuales previstas por el plan.

## Resultado de sesión 2 — 2026-10-15

Implementada únicamente la ventana y su integración, sin delegar. Rama `main`,
HEAD inicial y final `672361f327588aa1fe2abd73b1fa468f11d1753f`, sin commit ni
despliegue. Se conservaron los cambios pendientes del núcleo de sesión 1,
`pubspec.lock` y `packages/pos_bluetooth_printer/android/.gradle/`. En el
análisis se editó únicamente este plan.

### Implementación y archivos propios

Rutas relativas a `/Users/benjamin/Projects/POS/pos_flutter`:

- `lib/presentation/pages/articulos/sale_quantity_dialog.dart`: pesos vacío
  arriba con autofocus, cantidad editable debajo, producto/variante y precio
  por referencia real. Conserva el texto monetario solicitado y muestra cobro
  y ajuste. Solo la edición manual cambia la fuente. Usa enteros/BigInt,
  trim, coma/punto y hasta dos decimales. Vacío, incompleto, inválido o fuera
  de rango deshabilita Agregar y limpia el campo derivado. Peso manual con
  cobro cero sigue permitido. Enter usa la intención válida revisada, con
  bloqueo de doble aceptación. Una revisión de edición impide que Enter o
  un callback anterior acepten una cantidad cuyo nuevo cobro aún no se haya
  renderizado. Contenido desplazable para teclado/ventanas
  pequeñas/texto ampliado.
- Nuevos `sale_quantity_form_result.dart` y `measured_sale_preview.dart` en
  esa carpeta: resultado tipado con una sola fuente y condiciones esperadas
  completas; adaptación al comando existente. La vista previa reutiliza
  `SaleItemSnapshot.sameConditions` y `plus`, con la calculadora de sesión 1.
  No duplica fórmulas proporcionales ni mantiene un carrito paralelo.
- Nuevo `lib/domain/ventas/measured_sale_conditions.dart` y extensión mínima
  de `domain/repositories/producto_repository.dart` y
  `data/repositories/producto_repository_impl.dart`: lectura consistente del
  catálogo en transacción, con nombres, unidad, precio, referencia, costo y
  clave real de consumo. Cada apertura relee las condiciones.
- `lib/domain/ventas/sale_draft_item.dart`,
  `lib/data/repositories/sale_draft_repository_impl.dart` y
  `confirmed_sale_repository_impl.dart`: exponen la clave de consumo que ya
  está persistida. Conservan null explícito de snapshots legados; no inventan
  una clave. Las demás condiciones ya existían en la lectura.
- `article_search_screen.dart`, `caja/sale_barcode_scanner_screen.dart`,
  `caja/barcode/physical_barcode_reader.dart`, su controlador, coordinador y
  resultado, y `caja/caja_screen.dart`: integran el resultado y el borrador
  observado. Por importe envían `targetAmountMinor` y cantidad null; por peso
  envían el texto y objetivo null. Ambos llevan unidad, precio y referencia
  esperados. Piezas conserva el comando sin diálogo monetario. Se mantienen
  selección, cancelación, FIFO, compuerta, pausas, ciclo de vida y retorno de
  foco. El aviso del HID muestra también el motivo concreto de rechazo, con
  su mensaje general y reanudación explícita. Su unidad procede de la captura
  revisada.

La vista acumulada observa el borrador y usa la primera línea compatible,
en el mismo orden del repositorio/comando. Compara todas las condiciones,
incluidos costo, nombres y configuración de consumo. No suma objetivos ni
subtotales redondeados. Un desborde acumulado impide aceptar. Ante precio,
referencia o unidad obsoletos, el servicio rechaza sin escrituras y el acceso
informa el error. Reabrir muestra condiciones nuevas y campos vacíos para una
nueva aceptación; no reenvía automáticamente al precio nuevo ni agrega otro
modal de confirmación.

Pruebas nuevas:

- `test/presentation/pages/articulos/sale_quantity_dialog_test.dart`
  (37 pruebas de formulario/vista previa).
- `test/presentation/pages/articulos/measured_sale_flow_test.dart`
  (2 flujos con SQLite de archivo temporal, uno por modo).
- `test/presentation/pages/articulos/measured_sale_stale_conditions_test.dart`
  (precio, referencia y unidad obsoletos, sin escrituras y con recuperación).

Pruebas ampliadas: `article_search_screen_test.dart`,
`sale_barcode_scanner_screen_test.dart`, `physical_barcode_reader_test.dart`,
`barcode/sale_barcode_read_coordinator_test.dart`,
`barcode/physical_barcode_reader_controller_test.dart` y
`test/support/barcode_sale_fixture.dart`. Los fakes de catálogo en
`articles_screen_test.dart`, `inventory_articles_tab_test.dart`,
`bulk_import_screen_test.dart`, `inventory_management_screen_test.dart` y
`menu_lateral_test.dart` heredan el fake compartido para seguir fallando
explícitamente ante consultas nuevas inesperadas. No cambian sus negocios.

### Verificación automatizada real

La suite final incluye 50 pruebas adicionales respecto de sesión 1.
Verifica foco en pesos; $20 a $60/kg → 0.334 kg/$20.04; $20 a $80/kg →
0.25 kg/$20.00; 0.333 kg manuales → $19.98; referencia de 100 g; kg/g/L/ml;
texto parcial, coma/punto, limpieza, rango máximo, desborde, cambio de fuente,
Enter, cancelar y doble pulsación. Mantiene el caso manual de total cero.
Incluye texto 2× y ventana 390×700 con inset de teclado de 280.

Los tres accesos conservan sus regresiones. Cámara/HID agregan por importe,
comprueban pausa, foco/retorno y rechazo de precio obsoleto con reapertura.
Búsqueda comprueba también referencia/unidad obsoletas sin eventos ni
proyecciones. La cámara conserva la observación fresca tras reanudar y el
intervalo de ausencia; un frame vacío no acredita retirada física.

Los flujos de archivo temporal recorren búsqueda → formulario → comando →
evento → proyección → repositorio → Caja. Dos capturas guardan una línea de
668 átomos y 4008 centavos. Antes del cobro no hay movimientos; confirmar
conserva 668 g/$40.08 y descuenta exactamente 668 átomos de inventario directo.
Selección de método y efectivo reciben también 4008 centavos, el ID de venta
y la revisión observada, comprobados en sus widgets reales.
Tras cerrar/reabrir SQLite se leen los mismos valores de venta, filas del
ticket y movimiento. Los eventos de borrador son `not_required` en ambos
modos; las diez refs de dos capturas solo se persisten en `server_sync`.
Las fracciones de centavo conservan 4 g/$0.01 y se prueban todas las
condiciones que impiden agrupar líneas incompatibles.

Comandos ejecutados (además de lecturas obligatorias, búsquedas `rg`,
inspección de `git status`, rama/HEAD y diffs):

```sh
dart format lib/presentation/pages/articulos/sale_quantity_dialog.dart test/presentation/pages/articulos/sale_quantity_dialog_test.dart
dart format test/presentation/pages/articulos/measured_sale_flow_test.dart
flutter test test/presentation/pages/articulos/sale_quantity_dialog_test.dart
flutter test test/presentation/pages/articulos/article_search_screen_test.dart test/presentation/pages/caja/sale_barcode_scanner_screen_test.dart test/presentation/pages/caja/physical_barcode_reader_test.dart test/presentation/pages/caja/barcode/sale_barcode_read_coordinator_test.dart test/presentation/pages/caja/barcode/physical_barcode_reader_controller_test.dart
flutter test test/presentation/pages/caja/physical_barcode_reader_test.dart --plain-name 'error durante drenaje permite reanudar'
flutter test test/presentation/pages/articulos/measured_sale_flow_test.dart test/presentation/pages/articulos/measured_sale_stale_conditions_test.dart test/presentation/pages/articulos/sale_quantity_dialog_test.dart
dart analyze > /tmp/pos-granel-session2-analyze.log 2>&1
flutter test > /tmp/pos-granel-session2-flutter-test.log 2>&1
git diff --check
```

Las corridas enfocadas iniciales detectaron ajustes en fakes, esperas de
render/validación y fixtures; se corrigieron y la suite completa final los
cubre. Una corrida previa se interrumpió por timeout en una prueba de
drenaje; pasó después enfocada en los tres sistemas simulados y en la suite
final. No se atribuye ese timeout a una causa externa confirmada ni se
acredita aquella corrida como aprobada.

Otra repetición completa registró un `pumpAndSettle timed out` en la prueba
existente `seleccionar, guardar, reabrir, cambiar precio y retirar último
desde UI`, de `product_supplier_ui_flow_test.dart:220` (helper `click:88`).
No se modificó ese archivo ni el flujo de proveedores. La corrida terminó
con 1972 aprobadas, 10 omitidas y 1 fallida; su evidencia se conserva en
`/tmp/pos-granel-session2-flutter-test-provider-timeout.log`. No se acredita
esa corrida como aprobada ni se atribuye una causa concreta sin evidencia.
La repetición enfocada posterior pasó las 49 pruebas de proveedores,
formulario, condiciones obsoletas y flujo/reapertura, con salida 0:

```sh
flutter test test/presentation/pages/gestion_inventario/articulos/product_supplier_ui_flow_test.dart test/presentation/pages/articulos/measured_sale_flow_test.dart test/presentation/pages/articulos/measured_sale_stale_conditions_test.dart test/presentation/pages/articulos/sale_quantity_dialog_test.dart > /tmp/pos-granel-session2-final-focused.log 2>&1
```

Resultados finales:

- `dart analyze`: `No issues found!`, salida 0, repetido tras ordenar imports.
- `flutter test`: **1973 aprobadas, 10 omitidas**, salida 0,
  `All tests passed!`, duración informada 1 min 50 s, repetida tras la protección de Enter y la
  comprobación de las pantallas de pago. Esta última corrida completa no
  registró fallos.
- Nueve omitidas requieren `POS_SUPPLIER_SYNC_URL` y una
  `POS_PHASE3_SYNC_URL`, con NestJS/PostgreSQL aislados. No se ejecutaron esas
  integraciones externas.
- `git diff --check`: sin errores. Revisión de referencias/imports sin código
  futuro ni callbacks antiguos de cantidad `String?` en los accesos adaptados.
- No se cambiaron tablas, schemaVersion ni generados; no correspondió
  `build_runner`. Se conservaron el núcleo de sesión 1, formato de eventos y
  payloads, dependencias, servidor, sincronización, confirmación, reglas de
  consumo, impresión, cotizaciones y edición de líneas por peso. La lectura
  del cobro solo incorpora la clave ya persistida.

### Comprobación nativa observada y pendientes

`flutter devices` encontró macOS, Chrome y simuladores de iPhone/iPad.
Se creó `/tmp/pos_granel_session2_probe.dart`, entrada temporal que evita
`main.dart`, DI y archivos de datos: usa `AppDatabase.forTesting` con
`NativeDatabase.memory()` y artículos de prueba a $60/kg y $80/kg.

```sh
flutter run -d macos -t /tmp/pos_granel_session2_probe.dart --no-pub
```

La compilación macOS terminó correctamente; el pod sqlite3 emitió warnings
C, sin cambios de dependencia. Para distinguir la prueba de una app POS ya
abierta se copió el bundle a `/tmp/pos-granel-session2.app`, con identificador
y nombre separados (`Granel Session 2`) y firma ad hoc local. El control
nativo observó el catálogo aislado y el diálogo con producto, precio
$60.00/1 kg, pesos vacío arriba con indicador de foco, cantidad debajo y
Agregar deshabilitado. Se cerró la app de prueba. No se interactuó con datos
de la instalación de uso ni se abrió/reinició su base.

La edición posterior mediante el control nativo no produjo una secuencia
visual consistente para acreditar cálculo/Enter/guardado manuales. Esa parte
queda **pendiente**, aunque esté cubierta por widgets y SQLite. No se
presenta como prueba manual completa ni se atribuye al producto una causa
no demostrada.

Pendientes manuales/físicos:

1. Completar escritura, alternancia, Enter, cancelación y revisión visual del
   ajuste/acumulación en una ejecución nativa aislada.
2. Revisar con teclado en pantalla real, ventana pequeña/orientaciones y
   escala de texto del dispositivo; insets y texto ampliado se comprobaron
   de forma automatizada.
3. Probar cámara y lector HID reales: cesión/retorno de foco, FIFO, pausas,
   ciclo de vida y retirada frente a desenfoque según el plan de escaneo.
   Los fakes no acreditan hardware.

Estado: sesión 2 implementada y verificada automáticamente, con revisión
manual parcial y comprobaciones físicas pendientes. Búsqueda, cámara y HID
quedan habilitados con captura por importe. Sin commit ni despliegue.

## Referencias

- `AGENTS.md` de Flutter y del análisis.
- `docs/architecture/offline_feature_flow.md`.
- `docs/templates/new_offline_feature_checklist.md`.
- `docs/architecture/cash_sale_confirmation.md`.
- [[02 - Decisiones/ADR-0012 Cantidades atomicas y unidades por dimension|ADR-0012]].
- [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]].
