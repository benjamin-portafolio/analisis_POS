# Matriz I01–I25 — sesión 4, 2026-10-09

Resultado global: **verificación automatizada completa; verificación física pendiente**.
Los resultados automatizados se respaldan con los comandos actuales en [resultados](resultados.md).
**Ningún caso de impresión física se declara aprobado.** `sent` demuestra escritura/flush;
no demuestra papel, tapa, entrega completa ni compatibilidad de un firmware.

Raíz de código: `/Users/benjamin/Projects/POS/pos_flutter`, `main`, HEAD
`fe509f6dc9cca738faf52c7615d0ae4b01cd2f92` más working tree conservado y ajustes de esta sesión.

| ID | Caso | Resultado | Tipo de comprobación | Evidencia | Pendientes/límite |
|---|---|---|---|---|---|
| I01 | Entrar en Impresoras, ambos modos/sin red | Aprobado automatizado; uso real offline pendiente | Widget + SQLite/DI reales aislados + auditoría | T2, T6, T9 | Abrir configuración sin internet con Bluetooth activo en Android, standalone y server_sync. |
| I02 | Permisos concedidos/denegados/permanentes/revocados | Aprobado automatizado; Android real pendiente | Canal simulado + política JVM + ciclo nativo | T1, T2, T3, T4, T5, J1/J2 | Diálogos Android 12+, revocación real, espera >35 s y giro con diálogo pendiente. |
| I03 | Apagado/hardware ausente/lista vacía | Aprobado automatizado; hardware pendiente | Widgets y gateway controlado | T2, T3, T4 | Bluetooth apagado y recarga en Android; hardware real. |
| I04 | A58/B80, persistencia y reinicio | Aprobado automatizado; reinicio real pendiente | Archivo temporal real, controlador, restauración/DI | T2, T6, T7 | Reiniciar proceso Android y comprobar ambos perfiles/default. |
| I05 | Mismo nombre/dirección repetida | Aprobado automatizado | Modelo, archivo real y widgets | T2, T7, T8 | Ninguno automatizado; identidad de equipos reales se comprueba al vincular. |
| I06 | Predeterminada/quitar/elegir por envío | Aprobado automatizado | Widgets + persistencia + snapshots | T1, T2, T7, T8 | Confirmar UX en dispositivo; nunca se escoge otro destino silenciosamente. |
| I07 | A58 → B80 → A58 | Aprobado automatizado; dos equipos pendientes | Encoder/renderer de producción + gateway fake + sockets JVM | T2, T10, J1 | Dos impresoras físicas; identidad, ancho y comando real por destino. |
| I08 | Desvinculada/apagada/fuera de alcance | Aprobado automatizado; interrupción real pendiente | Errores controlados/typed channel + widgets | T1, T2, T3, T4, J1 | Desvincular/apagar/alejar impresora; observar error y preservar ticket. |
| I09 | Efectivo/transferencia/crédito | Aprobado automatizado; papel pendiente | Repositorios/SQLite reales en fixture, widgets, raster | T1, T11, T12 | Imprimir tres recibos; revisar pago/importes/cambio en papel. |
| I10 | Cotización/precios durante envío | Aprobado automatizado; papel pendiente | Widget + SQLite real, captura antes de cambiar catálogo | T1, T11, T13 | Imprimir cotización y cambiar precio sin alterar trabajo capturado. |
| I11 | Precio/importe/total no disponible | Aprobado automatizado; papel pendiente | Documentos/widget + raster de valores no disponibles | T1, T10, T13 | Cotización sin precio y total disponibles en papel, sin ceros inventados. |
| I12 | Texto largo/español/medidas/símbolos | Raster aprobado; legibilidad física pendiente | Inspección PNG binario y pruebas de ancho/márgenes | T10, renders/receipt-*.png, renders/calibration-*.png | Legibilidad de Roboto en Android/papel; recortes/tamaño/variante. |
| I13 | 100 líneas y memoria acotada | Aprobado automatizado; duración/memoria física pendientes | Raster idéntico 96/120 dots; decoder independiente; código lazy | T5, T10, renders/long-100-*.png | 100 líneas impresas, duración, estabilidad/memoria observadas y continuidad ESC *. |
| I14 | Pulsaciones/concurrencia/render lento | Aprobado automatizado | Futures pendientes, widgets y backpressure | T1, T2, T3, T5, T10 | Comprobar pulsaciones durante permisos/render/envío/cierre en dispositivo. |
| I15 | Timeout con I/O nativo activo | Aprobado automatizado; driver real pendiente | Dart conserva future; sockets/flush/close JVM pendientes | T3, T5, T6, J1/J2 | Bloqueo/timeout real Bluetooth, exclusión hasta retorno/cierre efectivo. |
| I16 | Envío interrumpido/resultado incierto | Aprobado automatizado; interrupción física pendiente | Fallo tras primera banda, warning UI, nueva acción manual | T1, T2, T3, T5, J1 | Interrumpir a mitad, inspeccionar papel parcial y reimprimir manualmente. |
| I17 | Ruta/permiso/segundo plano/reinicio | Aprobado automatizado; ciclo físico pendiente | Widgets + DI; auditoría de detach/configuration change | T1, T2, T5, T6, J2 | Background/cierre/rotación/regreso/reinicio reales; nunca reproducción automática. |
| I18 | Cambiar perfil/default durante trabajo | Aprobado automatizado | Snapshots de documento y perfil inmutables | T1, T5, T7 | Verificar siguiente envío manual al nuevo perfil en Android. |
| I19 | Archivo ausente/corrupto/fallo/interrupción | Aprobado automatizado | Archivos temporales reales, rename, recuperación preservada | T2, T7 | Ninguno automatizado; fallo del almacenamiento/terminación real del SO no ensayado. |
| I20 | Restaurar SQLite/reiniciar DI | Aprobado automatizado; proceso Android pendiente | Snapshot/restore SQLite reales + archivo byte a byte + cierre | T6 | Restauración/reinicio en instalación de prueba Android; ninguna impresión de arranque. |
| I21 | Cero cambios de negocio y sync | Aprobado automatizado | Contenido de todas las tablas antes/después, ambos modos; HTTP prohibido | T6, T9, T11 | Repetir offline en instalación aislada; no alterar datos reales para fixtures. |
| I22 | Compartir/WhatsApp/navegación | Aprobado automatizado; apps externas pendientes | Widget/pantallas reales con acciones compartir inyectadas | T12, T13 | Selector Android/WhatsApp reales y navegación con hardware. |
| I23 | Plataformas no habilitadas | Aprobado automatizado; build macOS registrado en resultados | Gateway no soportado sin llamadas, widget y registro del plugin | T1, T4, resultados.md | No se compiló iOS/Windows/web; no se declara soporte de impresión en ellos ni macOS. |
| I24 | Papel/tapa/acuse | Semántica automatizada aprobada; estado físico no soportado/comprobado | Mensajes y contrato write/flush; sin API de sensores | T1, T2, T3; auditoria.md | No afirmar detección papel/tapa ni impresión completa; revisar salida manualmente. |
| I25 | Márgenes/avance final 58 mm | Pendiente físico; raster/terminación aprobados | Márgenes blancos y un avance final por decoder | T10, renders/calibration-mm58.png | Medir ancho real y márgenes; autotest/manual, salida completa y papel legible. |

## Referencias de prueba

Todos los archivos siguientes pertenecen a la raíz Flutter indicada. T1–T13 se ejecutaron
en la suite completa final; T1–T8/T10/T11 también en las 111 pruebas dirigidas
(salvo T9/T12/T13 que pertenecen a otras suites). J1/J2: 13 pruebas JVM totales.

| Ref. | Archivo / evidencia verificable |
|---|---|
| T1 | `test/presentation/tickets/ticket_print_action_test.dart`: 17 widgets; selector, snapshots, pausa/ruta, permiso pendiente >35 s, parcial, tres pagos y cotización |
| T2 | `test/presentation/pages/impresoras/printer_settings_screen_test.dart`: 16 widgets, CRUD/default, A58/B80/A58, permiso/error/ocupado |
| T3 | `test/application/printing/ticket_print_service_test.dart`: permisos, destino, write/close/connect pendientes, timeout/cuarentena/dispose |
| T4 | `test/data/printing/android_bluetooth_printer_gateway_test.dart`: canal y errores tipados, plataforma no soportada sin plugin |
| T5 | `test/application/printing/ticket_generation_service_test.dart`: 10 pruebas; snapshots, banda siguiente después de write, permiso/render lento, generación parcial y prueba raster |
| T6 | `test/core/di/printing_dependencies_test.dart`: 6 pruebas, singleton, cero red/negocio, restore/DI, cierre pendiente/fallido |
| T7 | `test/data/printing/printer_settings_file_store_test.dart` (11) y `test/application/printing/printer_settings_controller_test.dart` (4) |
| T8 | `test/application/printing/printer_profile_test.dart`: 3 pruebas de identidad/invariantes/documento de calibración |
| T9 | `test/presentation/pages/pantalla_principal/menu_lateral_test.dart`: acceso y dependencias en ambos modos |
| T10 | `test/data/printing/esc_pos_ticket_encoder_test.dart`: 7 pruebas; A58/B80/A58 de producción, ambos anchos, 100 filas/3 comandos, corte, orientación, final; `logs/renderer.log`, diez PNG, ocho JSON sintéticos |
| T11 | `test/data/printing/ticket_business_isolation_test.dart`: 2 fixtures SQLite reales, ambos modos, 8 envíos manuales por modo; todas las tablas iguales; standalone sin refs y not_required; cero HTTP |
| T12 | `test/presentation/pages/caja/sale_receipt_test.dart`: PNG de 880 px/compartir/cancelar/reintento manual/nueva venta/regreso |
| T13 | `test/presentation/pages/cotizaciones/quotation_ticket_test.dart`: estimación, valores no disponibles, compartir/WhatsApp y navegación sin alterar captura |
| J1 | `packages/pos_bluetooth_printer/android/src/test/kotlin/com/pos/printing/PrinterTransportTest.kt`: 10 pruebas con sockets/worker/flush/cierre controlados |
| J2 | `packages/pos_bluetooth_printer/android/src/test/kotlin/com/pos/printing/PrinterPermissionRequestTest.kt`: 3 pruebas del futuro pendiente al expirar, callback y detach; **no es un diálogo Android real** |

Los endpoints NestJS/PostgreSQL requeridos por 10 pruebas de integración preexistentes
no estaban configurados: quedaron omitidas, fuera del flujo de impresión.

## Evidencia física recibida después de esta matriz

El usuario aportó foto: prueba raster legible a 58 mm/384/gsV0, pero recibo y
cotización con tramos corruptos. **I09/I10: fallo físico observado, todavía abierto**;
la aprobación de esta tabla es automatizada y anterior a ese ensayo.
Se preparó transmisión 256 bytes/40 ms incluyendo último bloque, conservando
método y raster; falta comprobar si corrige el papel.
Ver [[08 - Roadmap/Impresion de tickets/Evidencia/2026-10-09-ajuste-transmision/README|Foto y ajuste actual]].
