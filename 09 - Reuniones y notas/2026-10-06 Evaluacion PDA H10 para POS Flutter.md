---
tipo: evaluacion_hardware
fecha: 2026-10-06
estado: en_revision
producto: POS STORE H10
publicacion: MLM1981534865
precio_observado_mxn: 4790
---

# Evaluación del PDA H10 para el POS Flutter

**Recomendación: considerar una unidad piloto para ventas móviles; posponer la compra de varias unidades hasta validar la variante, la impresión y una jornada real.** Para una caja fija con captura constante, inventario y reportes, preferiría una pantalla mayor con impresora separada. La conveniencia del H10 depende de cuánto valore el negocio llevar pantalla e impresora en una mano.

Esta evaluación contrasta fuentes públicas y el código actual de `/Users/benjamin/Projects/POS/pos_flutter`, incluidos cambios locales presentes al revisarlo. No se instaló la app en el H10 ni se midieron velocidad, batería, temperatura o vida útil. No se modificó el código de la aplicación. No encontré un ensayo independiente reproducible de la variante POS STORE de esta publicación; las fichas de equipos parecidos no identifican de forma concluyente la unidad que se entregaría.

La [publicación de Mercado Libre](https://www.mercadolibre.com.mx/pos-pda-terminal-portatil-android-13-e-impresora-de-recibos/up/MLMU2469477602) anuncia marca POS STORE, modelo H10, Android 13, 3 GB de RAM, 32 GB de almacenamiento y ocho núcleos a 2 GHz. En la descripción mezcla una referencia a recibos de 80 mm con una impresora de 58 mm a 80 mm/s. También presenta el escáner dedicado como opcional. Estas características son declaraciones comerciales pendientes de corroborar en la unidad.

**El nombre H10 no fija la configuración.** La [tienda POS Store de Estados Unidos](https://posstore.com/products/h10-android-point-of-sale) presenta un H10 con MTK6761 de cuatro núcleos y variantes básica, NFC y escáner profesional. No está acreditado que ese sitio y POSSTOREMX entreguen la misma variante. La discrepancia exige confirmar el número de parte y el procesador del lote mexicano; no demuestra por sí misma que la publicación sea falsa.

Como referencia de familia, la [ficha R330/H10](https://pdt.static.globalsources.com/IMAGES/PDT/SPEC/378/K1211066378.pdf) describe Android 13, ocho núcleos, memoria 2+16 o 3+32, impresora de 58 mm, lector opcional y batería removible de 7.7 V/3000 mAh. El [H10S de Senraise](https://www.senraise.com/products/senraise-h10s-handheld-pos-terminal.html) tiene otra configuración: cuatro núcleos y 2+32. Estas referencias ayudan a distinguir variantes, pero no acreditan el fabricante OEM ni el firmware del producto mexicano.

| Aspecto | Evaluación para esta app | Qué falta comprobar |
|---|---|---|
| Android y Flutter | Compatibilidad probable | Instalación de un APK release y arquitectura real del sistema |
| Ventas con SQLite local | Arquitectura apropiada | Latencia con catálogo e historial representativos |
| RAM y almacenamiento | 3+32 parece suficiente para operación sencilla | RAM física, espacio libre y comportamiento con cámara e informes |
| Impresora incorporada | Ventaja portátil importante, con integración pendiente | SDK del firmware exacto y recuperación ante fallos |
| Pantalla de 5.5 pulgadas | Adecuada para movilidad; menos cómoda para administración prolongada | Táctil, teclado, texto ampliado y velocidad del operador |
| Escaneo | La app ya usa cámara | Autofoco real; presencia e interfaz del lector dedicado |
| Respaldo en Drive | Depende del entorno Google del equipo | Certificación y autorización/restauración reales |
| Batería y reparación | Evidencia insuficiente | Jornada medida, batería disponible y reparación local |

**El rendimiento esperado es suficiente para evaluar, pero no para prometer fluidez.** Una [ficha técnica de Barway para H10](https://www.barwaybarcode.com/H10-Intelligent-POS-Terminal-Touch-Screen-Android-11-System-8-Core-Pos-Machine-Portable-Wireless-Wifi-4G-POS-pd519431358.html) identifica MTK6762 en la versión de ocho núcleos. Si el equipo mexicano usa ese chip, corresponde a la plataforma Helio P22: MediaTek documenta ocho Cortex-A53 a hasta 2 GHz y su [lanzamiento en mayo de 2018](https://www.mediatek.com/press-room/mediatek-unveils-new-helio-p22-chipset-to-power-mid-range-new-premium-smartphones). La [ficha del chip](https://www.mediatek.com/hubfs/MediaTek-Helio-P22-Product-Brief-PDFHP22PB-052118.pdf?hsLang=zh-cn) especifica proceso de 12 nm. Android 13 no convierte esa plataforma en un procesador reciente.

Mi inferencia es que ventas normales, búsqueda y guardado local pueden funcionar razonablemente con 3 GB. El riesgo de pausas aumenta al combinar cámara, tickets extensos, importaciones, informes e historial grande. No asigno tiempos ni límites de catálogo sin medir. Si se recibe 2 GB o cuatro núcleos cuando se compró 3 GB y ocho, reevaluaría la compra por discrepancia y menor margen operativo. Para hardware que se estandarizará durante años, buscaría más memoria y un calendario de soporte claro.

En el código, `AppDatabase` utiliza `NativeDatabase.createInBackground(file)`, lo que favorece mantener las consultas fuera del isolate de UI. El mínimo Android se hereda del SDK Flutter; el SDK local revisado define API 24. Android 13 queda dentro de las [plataformas compatibles con Flutter](https://docs.flutter.dev/reference/supported-platforms). Esto acredita compatibilidad general, no los controladores de cámara, gráficos, escáner o impresora de una ROM particular.

**La integración de impresión es el principal trabajo pendiente.** `pubspec.yaml` no declara un controlador de impresoras; `MainActivity.kt` es una `FlutterActivity` sin puente propio. El botón «Imprimir» de ventas está deshabilitado: su callback solo habilita compartir y WhatsApp. Cotizaciones también muestra imprimir con `onPressed: null`.

Existe el [paquete comunitario senraise_printer](https://pub.dev/packages/senraise_printer). Su [implementación Android](https://github.com/Mrkrabss/flutter_senraise_printer_sdk/blob/master/android/src/main/java/com/senraise/senraise_printer/SenraisePrinterPlugin.java) conecta con un servicio específico del firmware: `recieptservice.com.recieptservice.service.PrinterService`. No prueba compatibilidad con el POS STORE mexicano. En ese código, algunas excepciones solo se registran y no completan la respuesta al canal Flutter; una llamada puede quedar esperando. Usaría ese trabajo como referencia y verificaría conexión, errores y recuperación antes de incorporarlo. La [FAQ de Senraise](https://www.senraise.com/faq.html) ofrece SDK/API, sin demostrar que sea el SDK adecuado para esta unidad.

La integración debería imprimir desde una venta ya confirmada, conservarla cuando falta papel y permitir reimprimir identificando el mismo recibo. Un fallo de impresión no debe volver a ejecutar el cobro. Hay que verificar estados de papel, tapa, temperatura, desconexión del servicio y comportamiento tras reiniciar.

El generador actual dibuja tickets a 440 unidades y escala ×2: produce PNG de 880 píxeles de ancho. La imagen sirve para compartir, pero habrá que diseñar la salida térmica al ancho útil y resolución reales. Reducirla directamente puede volver demasiado pequeñas las cuatro columnas. Imprimir texto/tablas del SDK o generar una imagen específica son opciones a medir; enviar imágenes grandes también tiene un costo de memoria y tiempo.

**La app ya tiene escaneo por cámara; un lector dedicado requeriría otra integración.** `SaleBarcodeScannerScreen` usa `MobileScannerController`; el proyecto no activa el detector descargable. La [documentación de la versión 7.4.2](https://pub.dev/packages/mobile_scanner/versions/7.4.2) indica que el detector Android viene incluido por defecto, coherente con operar offline desde el primer uso. La cámara de 5 MP no acredita rapidez de lectura. Hay que ensayar etiquetas pequeñas, reflejos, poca luz y códigos dañados. Si el equipo incluye lector físico, comprobar si entrega texto como teclado, mediante broadcast o con SDK, y conectarlo al control de lecturas de Caja.

**El hardware encaja con el diseño offline first, sujeto a pruebas de persistencia.** En `standalone`, los command services declaran y validan referencias; `DriftLocalEventStore` guarda el evento con `delivery_status = not_required`, aplica la proyección y omite filas de `event_refs`. El arranque de servicios habilita detección de servidor solo en `server_sync`. No corresponde ejecutar push, pull, preflight, health checks o WebSocket en standalone. Tampoco corresponde convertir su historial silenciosamente en eventos pendientes si posteriormente se cambia el despliegue.

En `server_sync`, comprobar pérdida y recuperación de red, suspensión y reapertura. [Android documenta que Doze puede diferir tareas y suspender acceso a red](https://developer.android.com/training/monitoring-device-state/doze-standby). Es una condición a probar; no demuestra un defecto del H10. Tener 4G tampoco garantiza acceso a un backend alojado en una LAN: hacen falta una ruta accesible y configuración de conexión apropiada. «5G WiFi» en estas fichas refiere a la banda Wi-Fi de 5 GHz, no a telefonía móvil 5G.

**Google es relevante para el respaldo, aunque la venta local no necesita Drive.** `GoogleDriveAuthService` usa `google_sign_in` y autorización al espacio de datos de Drive. Solicitar evidencia de Play Protect certificado y probar autorización, respaldo y restauración con la app. [Google advierte que en dispositivos sin certificación algunas aplicaciones y funciones pueden fallar](https://support.google.com/googleplay/answer/7165974?hl=es). Ver el icono de Play Store no sustituye esa prueba.

La app programa trabajo de respaldo Android con intervalo de una hora y requisito de red. No debe interpretarse como garantía de ejecución puntual con pantalla apagada. Antes de uso productivo también hay asuntos de software independientes del PDA: el build release conserva firma de desarrollo y `_resetDatabaseOnStartup` puede borrar una base cuyo esquema no reconoce, salvo el flujo explícito de preservación de un respaldo restaurado. Una base actual se conserva entre arranques. Los pilotos deben utilizar datos de prueba mientras se formaliza la política de actualización.

**Autonomía y servicio pueden cambiar la decisión más que la CPU.** No hay medición confirmada de una jornada con pantalla, cámara, Wi-Fi y tickets. Los 7.7 V/3000 mAh de la ficha de familia equivalen a 23.1 Wh; no se deben comparar solo los mAh con un teléfono de distinto voltaje ni trasladar esa batería al lote mexicano sin verificar la etiqueta. Medir uso mientras carga, calentamiento, apagado por batería baja y recuperación de datos. Confirmar precio y disponibilidad de batería, cabezal, rodillo, tapa y cargador, plazo de reparación y costo de envío. La garantía comercial anunciada no acredita disponibilidad de repuestos. Tampoco hay aquí certificación de protección ante caídas o agua del ejemplar ofrecido.

Por $4,790 MXN, la compra puede ser razonable si aporta movilidad, impresión fiable y servicio local. Sin SDK del lote, el costo de desarrollar y mantener un adaptador propietario puede eliminar el ahorro de hardware. Una impresora externa permite reemplazar pantalla e impresora por separado; un equipo integrado reduce accesorios pero acopla sus fallos. Como referencia de documentación, [SUNMI publica instrucciones de impresión](https://cdn.sunmi.com/public/generalfile/mgt-document/841c6680d673447ba9c5d9b1e1131d01.pdf) con conexión, callbacks, estados y diferencias por modelo. Eso es el nivel de información que pediría, sin asumir que cualquier SUNMI tenga mejor rendimiento o compatibilidad.

| Uso previsto | Conveniencia del H10 |
|---|---|
| Cobrar o tomar pedidos caminando | Buena posibilidad, si impresión y batería pasan el piloto |
| Negocio pequeño con tickets sencillos | Posible; evaluar comodidad y lectura de códigos |
| Caja fija con mucha captura | Menor atractivo frente a pantalla grande e impresora separada |
| Administración, inventario y reportes prolongados | Pantalla limitada; preferir otro puesto de trabajo |
| Flota de varias cajas | Posponer hasta fijar número de parte, firmware y soporte |

Antes de comprar, pediría al proveedor estas evidencias:

1. Número de parte, fabricante/OEM, revisión y captura real de procesador, RAM física, almacenamiento, versión Android, arquitectura y fecha del parche del lote disponible.
2. SDK, licencia y aplicación de ejemplo que impriman en ese mismo firmware. Confirmación de APK propio y acceso de depuración, sin dependencia obligatoria de una app comercial del vendedor.
3. Ancho de papel y ancho imprimible, resolución, diámetro del rollo, corte manual/automático y método para conocer fallos de impresora. Confirmación expresa de si incluye lector dedicado y cómo entrega lecturas.
4. Estado de certificación Play Protect, disponibilidad de Google Play Services y política de actualizaciones del firmware.
5. Condiciones locales de garantía/devolución, repuestos, batería reemplazable y plazo de reparación. Comprobar las condiciones vigentes de la compra concreta.

La siguiente es una propuesta de aceptación del piloto; sus cantidades son pruebas sugeridas, no capacidad demostrada:

| Prueba | Condición para aceptar |
|---|---|
| Instalar APK release propio | Arranque, cámara, SQLite y reinicio correctos |
| Catálogo e historial del tamaño esperado | Buscar, agregar y confirmar sin pausas que afecten al operador; registrar percentiles de latencia |
| 50–100 tickets seguidos, cortos y largos | Importes, acentos, ñ y códigos legibles; memoria y temperatura estables |
| Quitar papel y reiniciar servicio/app | Venta conservada, error visible y reimpresión sin nuevo cobro |
| Jornada real de trabajo | Autonomía suficiente o carga compatible con el uso, sin calor incómodo |
| Red ausente y suspensión | Ventas locales persistidas; recuperación de sync solo en server_sync |
| Respaldo y restauración | Autorización Google y recuperación verificadas si se usará Drive |
| Operador con teclado y texto ampliado | Flujos esenciales sin botones ocultos ni errores por falta de espacio |

Descartaría esta variante si impide instalar la app propia, no permite controlar la impresora de forma fiable, no cumple la configuración contratada o falla requisitos operativos de autonomía/lectura. Si Drive forma parte del despliegue elegido, su funcionamiento también es criterio de aceptación. Tras un piloto aprobado, fijaría proveedor, número de parte y firmware antes de repetir compras.

Fuentes de código local para reproducir la revisión:

- [Dependencias](</Users/benjamin/Projects/POS/pos_flutter/pubspec.yaml:10>) y [configuración Android](</Users/benjamin/Projects/POS/pos_flutter/android/app/build.gradle.kts:23>).
- [Botón de impresión de ventas](</Users/benjamin/Projects/POS/pos_flutter/lib/presentation/pages/caja/sale_receipt_screen.dart:187>) y [generador de ticket](</Users/benjamin/Projects/POS/pos_flutter/lib/presentation/tickets/ticket_image_generator.dart:10>).
- [Persistencia por modo](</Users/benjamin/Projects/POS/pos_flutter/lib/data/local/drift/drift_local_event_store.dart:82>) y [arranque de servicios](</Users/benjamin/Projects/POS/pos_flutter/lib/core/di/injection.dart:30>).
- [Conexión y política de esquema SQLite](</Users/benjamin/Projects/POS/pos_flutter/lib/data/local/drift/app_database.dart:227>).
- [Cámara en Caja](</Users/benjamin/Projects/POS/pos_flutter/lib/presentation/pages/caja/sale_barcode_scanner_screen.dart:55>) y [autorización de Drive](</Users/benjamin/Projects/POS/pos_flutter/lib/data/google_drive/google_drive_auth_service.dart:15>).
