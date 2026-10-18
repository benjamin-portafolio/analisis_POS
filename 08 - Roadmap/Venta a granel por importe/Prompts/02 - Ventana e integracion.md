# Prompt de implementación: sesión 2, ventana e integración

Implementa únicamente la sesión 2 del plan Venta a granel por importe,
revisión 1. Trabaja en `/Users/benjamin/Projects/POS/pos_flutter`.

Lee primero:

- `/Users/benjamin/Projects/POS/pos_flutter/AGENTS.md`.
- `/Users/benjamin/Projects/POS/pos_flutter/docs/architecture/offline_feature_flow.md`.
- `/Users/benjamin/Projects/POS/pos_flutter/docs/templates/new_offline_feature_checklist.md`.
- `/Users/benjamin/Projects/POS/pos_flutter/docs/architecture/cash_sale_confirmation.md`.
- `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /AGENTS.md`.
- `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Venta a granel por importe/Plan de implementacion.md`, incluido el resultado y relevo de sesión 1.

El directorio `analisis ` tiene un espacio final. Inspecciona rama, HEAD y
cambios pendientes; conserva la implementación de sesión 1 y los cambios
ajenos de lockfile/impresión que sigan presentes. No crees otra tarea ni
delegues. No rehagas el núcleo ya implementado.

Prerrequisito registrado: sesión 1 completada, con calculadora compartida,
campos del comando y validación transaccional de precio/referencia/unidad.
Sus verificaciones registradas son 108 pruebas enfocadas aprobadas,
`dart analyze` sin incidencias y suite completa con 1923 aprobadas y 10
omitidas. Son resultados históricos; revisa el código real y ejecuta las
verificaciones de esta sesión antes de informar el estado actual.

Decisión funcional vigente: a $60/kg, escribir $20 propone 334 g y muestra
$20.04 antes de aceptar. A $80/kg propone 250 g y $20.00. El importe es un
objetivo, no un máximo; conservar ceil a átomos y half-up a centavos.

Implementa:

1. Adapta `SaleQuantityDialog` con «Importe solicitado ($)» arriba, vacío y
   con foco inicial; «Cantidad (unidad)» debajo. Muestra producto/variante
   y precio por su referencia real. Debe servir para kg, g, L y ml.
2. Al escribir pesos, conserva el texto solicitado, calcula cantidad y
   muestra aparte el cobro de esa cantidad y el ajuste cuando exista. Al
   editar cantidad manualmente, actualiza el importe y cambia la fuente
   de la intención a peso. Evita conversiones en bucle por actualizaciones
   de controllers y no muevas el foco continuamente.
3. Reutiliza `MeasuredSaleCalculator.quantityAtomicForAmount`, `totalMinor`
   e `InventoryQuantityCodec`; no copies las fórmulas. Dinero con trim,
   coma/punto y hasta dos decimales, sin millares ni double. Entradas vacías,
   incompletas, inválidas o fuera de rango deshabilitan Agregar sin conservar
   una cantidad previa que pueda guardarse accidentalmente. Preserva el
   caso válido de peso manual cuyo total redondea a cero.
4. Crea un resultado de formulario tipado, propio de `presentation` y en
   archivo separado. Para importe, envía `targetAmountMinor` y deja
   `measuredQuantity` en null; para peso, envía el texto y deja el importe
   objetivo en null. En ambos casos incluye `expectedUnitId`,
   `expectedUnitPriceMinor` y `expectedPriceReferenceQuantityAtomic` con
   las condiciones mostradas. El servicio vuelve a resolver y validar;
   no sustituyas la intención monetaria por un peso precalculado en UI.
5. Integra la búsqueda (`ArticleSearchScreen`), cámara
   (`SaleBarcodeScannerScreen`) y lector físico (`PhysicalBarcodeReader`).
   Adapta el callback de `SaleBarcodeReadCoordinator`, el controlador del
   lector físico, resultados/mensajes y pruebas/fakes afectados. Conserva
   el agregado por piezas, la selección de variantes, cancelación, cola,
   pausas, compuerta, ciclo de vida y retorno de foco actuales. El lector
   físico debe ceder foco al campo de pesos mientras el diálogo está abierto.
6. Observa el borrador para mostrar, cuando corresponda, el total previsto
   de la línea acumulada además del cobro de la cantidad capturada. Respeta
   todas las condiciones reales de `sameConditions` y el redondeo sobre la
   cantidad completa; no agrupes solo por variante ni sumes objetivos o
   subtotales redondeados. Si faltan datos de lectura para determinar esa
   compatibilidad, obténlos mediante una extensión mínima de repositorio y
   modelos de lectura, sin inventarlos, cambiar tablas o consultar Drift
   desde UI. No mantengas un carrito paralelo.
7. Si el borrador cambia, refresca la vista acumulada. Si el servicio rechaza
   precio, referencia o unidad obsoletos, muestra el error y permite revisar
   de nuevo las condiciones visibles antes de reintentar, sin guardar al
   precio nuevo silenciosamente. Enter usa la intención válida y el cobro
   visible; evita doble envío. Cancelar no registra eventos. No agregues
   otro modal de confirmación.
8. Mantén pantallas utilizables con teclado visible, ventanas pequeñas y
   texto ampliado. Separa helpers/widgets con responsabilidad propia y
   elimina cualquier ruta vieja, import o estructura que quede sin uso.

Verifica con pruebas de widgets y flujo real:

- Foco inicial en pesos; casos $20 -> 334 g/$20.04 y $20 -> 250 g/$20.00;
  captura manual de 333 g -> $19.98, referencia de 100 g y volumen.
- Alternancia entre campos, texto parcial, coma/punto, limpieza de entrada,
  límites, Enter, cancelar y doble pulsación.
- Los tres accesos, piezas sin diálogo monetario, pausa/retorno de lectores,
  condiciones obsoletas sin escrituras y recuperación tras error.
- Acumulación de dos capturas: 668 g/$40.08 a $60/kg; caso de fracciones de
  centavo del plan y separación de líneas con condiciones distintas.
- Comando/evento/proyección/repositorio con SQLite temporal: coincidencia
  de peso y total en Caja, confirmación, ticket y consumo de inventario
  cuando corresponda; lectura después de cerrar/reabrir la base temporal.
  Ambos modos conservan refs según configuración y eventos not_required.

Ejecuta `dart analyze` y `flutter test`. No cambies reglas de sesión 1 para
acomodar una UI incorrecta. Conserva tablas, schemaVersion, formato de
payloads/eventos, servidor, dependencias, impresión, cotizaciones, edición
por peso de líneas existentes y sincronización. No hace falta build_runner
sin cambios Drift; no se planifica ninguno.

Realiza la comprobación manual prevista si hay una plataforma disponible,
usando una base/instalación aislada. No abras ni reinicies una base de uso.
Registra lo automatizado, lo manual realmente observado y lo físico pendiente
por separado. Una prueba simulada no acredita cámara/HID reales. Si aparece
un fallo ajeno, documéntalo con evidencia sin mezclar correcciones fuera de
alcance ni afirmar que pasó toda la suite.

Actualiza el plan con archivos propios, comandos ejecutados, resultados,
limitaciones y estado de sesión 2. Explica qué accesos quedaron habilitados
y qué comprobaciones siguen pendientes. No hagas commit ni despliegues.
Presenta cualquier duda necesaria como lista numerada.
