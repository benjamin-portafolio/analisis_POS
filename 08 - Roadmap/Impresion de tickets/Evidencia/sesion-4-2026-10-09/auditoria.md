# Auditoría de integración — sesión 4

Fecha: 2026-10-09, America/Mexico_City. Base Flutter `main`, HEAD `fe509f6` más cambios
locales de fases 1–3 conservados. Se leyeron los AGENTS de análisis y Flutter,
plan, continuidad y sesión 04. No existen AGENTS adicionales bajo lib/test/packages.

## Defectos demostrados y correcciones

1. **Prueba de configuración fuera del renderer/perfil.** `printTest` construía
   ASCII mediante `PrinterTestPayload`, reemplazando ñ/tildes por `?` y sin
   usar `imageCommand`. La nueva regresión antes del arreglo falló con
   `Bad state: No element` al comprobar `encoder.profiles.single`:
   [log real previo](logs/probe-before-fix.log). Ahora crea un `TicketDocument`
   de calibración y llama `printTicket` dentro del mismo servicio. Identifica
   alias/dirección/papel/ancho/método; incluye nombre largo, variante, 0.750 kg,
   importe, total, reglas y pie con caracteres españoles. Reutiliza los tres
   métodos existentes, bandas, permisos, exclusión y limpieza. No agrega un flujo.
2. **Deadline nativo de permiso liberaba el futuro antes de terminar el diálogo.**
   El `Runnable` de 30 s llamaba `permissionReply.error("timeout", ...)` y dejaba
   `permissionPending=true`. Así terminaba el future del canal y el servicio Dart
   podía liberar su exclusión aunque Android siguiera esperando al usuario.
   Los fakes de Dart anteriores no ejercitaban ese Runnable. `PrinterPermissionRequest`
   mantiene el future pendiente al expirar y termina con timeout solo al recibir
   callback o detach definitivo. Dart avisa a los 35 s y drena el futuro real;
   nunca continúa con generación/envío después de ese timeout.
   Una rotación conserva la solicitud y listener al reattach; un detach por
   cambio de configuración no se trata como cierre definitivo del diálogo.
   El guard de ocupado se comprueba antes de devolver permiso ya concedido.
   Tres JVM prueban esa barrera de future y finalización única. El comportamiento
   del diálogo del sistema y rotación reales sigue pendiente de Android.

El paquete conserva la versión local **0.1.0**. No se añaden dependencias ni se
calibran ancho, método, pausa o caudal sin papel observado. Renderer/encoder de
ventas/cotizaciones no tuvieron cambios funcionales.

## Garantías inspeccionadas

| Garantía | Comprobación y límite |
|---|---|
| A58/B80/A58 | UI captura por dirección/default; nueva prueba integra servicio y renderer/encoder de producción, decodifica cada trabajo al ancho/método de su perfil y exige connect/close por ticket. JVM comprueba sockets distintos. Destinos sintéticos, ninguna compatibilidad comercial. |
| Una operación global | `_active` se asigna antes de preflight y generación; singleton DI usado por recibo/cotización/prueba. Rechazo inmediato de ocupado, sin cola. Futuros lentos de permiso, renderer, write y close verifican exclusión. |
| Una conexión y backpressure | `StreamIterator.moveNext` solo después de await write anterior; encoder/renderer `async*`, `_blocks` lazy. Producción escribe secuencialmente; test controlado cuenta exactamente una banda producida mientras write/flush está pendiente. Nueva prueba con renderer real bloquea primera escritura de cada destino. |
| Deadline y cierre | Dart drena operación original sin escribir tras un connect/render/permiso tardío. Native I/O cierra desde otro executor y close espera abort y worker. Cierre fallido conserva cuarentena. DI no reemplaza servicio/gateway hasta terminar dispose/cierre. Un driver bloqueado puede conservar ocupado indefinidamente. |
| Salida parcial/reimpresión | Desde el primer write, `mayHavePrinted=true`; fallo posterior no envía el final ni reintenta. UI advierte salida parcial y solo una nueva pulsación reimprime. `sent`/flush no son acuse de papel. |
| Snapshots | Documento copia listas anidadas y perfil es inmutable. Callback de confirmación toma documento visible/perfil vigentes. Venta usa ConfirmedSale; cotización usa selección y estimación visible con fechas/leyendas, sin persistir precios. Cambios posteriores no reemplazan el trabajo. |
| Archivo/configuración | Archivo local v1, direcciones únicas/default validada, escrituras serializadas, temporal/flush/rename. Ausente ≠ corrupto. Recuperación explícita preserva original, errores conservan último estado confirmado. |
| Restore/reinicio DI | Tests restauran SQLite real aislado y comparan printer_settings.json byte a byte; profiles/default más recientes sobreviven. Servicio viejo drena antes del reset. Cero envío/Bluetooth al arrancar. |
| Negocio y standalone | Fixtures reales con efectivo/transferencia/crédito y cotización: 8 trabajos por modo, contenido de TODAS las tablas idéntico tras cada envío/reimpresión. Standalone: not_required, cero refs, cero HTTP; DI configurado no inicia sync. Configurar impresoras tampoco cambia tablas. No se editó Drift/eventos/sync/backup/NestJS. |
| Compartir/navegación | Documento reubicado conserva import único; PNG de 880 px sigue separado. Suite verifica compartir/WhatsApp mediante callbacks inyectados, regresar/cerrar/nueva venta/captura. No se abrió WhatsApp real. |
| Plataformas | UI habilita Android nativo únicamente; gateway no soportado no invoca canal ni close. Plugin solo Android. macOS es build de desarrollo, sin soporte de impresión; no se compiló iOS/Windows/web. |

## Renderer, encoder y memoria

- Anchos iniciales 384/576 dots; perfil admite múltiplos de 8 dentro de 8–2048.
  Se respeta el ancho seleccionado y las pruebas también usan 368/560 dots.
  58 mm: filas completas; 80 mm: columnas con wrap, sin maxLines/ellipsis.
- Se preservan nombres/variante, cantidades/unidades, ñ/tildes/símbolos,
  Precio/Importe no disponible, textos de totales y pie. El modelo y widgets
  de cotización comprueban también Total no disponible, sin sustituir por cero.
- Cada banda ≤120 dots (múltiplo de 24); la misma salida con bandas de 96/120.
  Pruebas de 100 filas: 188 bandas a 384 y 216 a 576. Decoder independiente
  consume longitudes y reconstruye todos los bits en orden en ESC *, GS v 0 y GS ( L;
  ESC * solo añade padding blanco de la última franja de 24 dots.
- Una inicialización, un avance final. ESC * configura motion unit/line spacing
  y restaura ESC 2 al terminar. GS ( L emite almacenamiento/impresión por banda.
  Corte solo si supportsCut, ninguno por defecto; sin apertura de cajón.
- Renderer conserva una banda y un bloque de texto; raster máximo 5760 bytes
  a 384, 8640 a 576, más comandos/copia de transporte. RGBA de esa banda:
  184320/276480 bytes; layout de una fila y objetos nativos adicionales.
  Para el ancho máximo admitido 2048, la banda raster es 30720 bytes y RGBA
  983040 bytes. Se mantienen acotados por ancho/banda, sin bitmap del ticket completo.
  Esto es inspección/cálculo del código; **no es un perfil de heap en Android**.
- El acumulado largo/PNG se construye solo en pruebas de evidencia. No se
  introducen cola persistente, reintentos, impresión al cobrar ni replay al iniciar.
- Transporte conserva bloques de 1024 bytes y pausas de 20 ms entre bloques,
  flush por write/banda; calibración física pendiente. No se promete una duración real.

## Renders y documentos

Diez PNG en `renders/`, inventario de dimensiones/SHA-256 en
[renders/inventario.json](renders/inventario.json). Se inspeccionaron ambos
recibos, cotizaciones, calibraciones y finales largos. Los ocho PNG anteriores
coinciden byte a byte con fase 3. Los dos nuevos de calibración miden 384×794 y
576×836. Las filas 100, totales y pie largo permanecen completos.

Fuente de exportación: `test/data/printing/esc_pos_ticket_encoder_test.dart`,
`POS_THERMAL_RENDER_DIR`. Usa Arial de macOS bajo el nombre Roboto para evitar
Ahem; producción usa Roboto, por lo que no se afirma tipografía idéntica.

Ocho JSON en `documentos/` identifican perfil y documento sintéticos (recibo,
cotización, calibración y 100 filas, por ancho). Direcciones AA:BB:... son fakes.
El fixture térmico/100 filas fija importes/totales para probar presentación;
no es una factura ni valida suma de esos datos sintéticos. Los importes de negocio
sí se prueban con snapshots reales aislados en T11 y pantallas de T12/T13.

## Evidencia física disponible y pendientes exactos

**Ninguna conexión Android/SPP, ticket en papel, foto, duración física ni modelo
compatible se obtuvo en la sesión.** `adb devices -l` vacío y `flutter devices`
solo macOS/Chrome. El Mac lista `BlueTooth Printer` / `5A:4A:C6:68:99:9D` como
no conectado; los campos comerciales/firmware de ese registro no se toman como
modelo/firmware confirmado ni prueban SPP. No se intentó imprimir desde macOS.

Para cerrar la parte física se necesita una instalación/datos de prueba aislados:

1. Registrar Android/API, versión app, modelo/firmware desde manual/autotest,
   nombre/dirección reales, transporte SPP, papel, ancho imprimible y comando
   admitido. No asumir una secuencia universal de autotest.
2. Permisos concedidos/denegados/permanentes/revocados, diálogo lento y rotación;
   Bluetooth apagado, vinculación/lista/recarga y persistencia al reiniciar.
3. Prueba raster + recibos efectivo/transferencia/crédito y cotizaciones
   normales/sin precio: ñ/tildes, nombres largos, medidas, márgenes, totales y pie.
4. Tickets consecutivos y 100 filas: todas las bandas, particularmente ESC *,
   duración, memoria/estabilidad observadas y calibración solo por lo visto.
5. Interrumpir envío; revisar salida parcial y aviso; reimpresión manual sin retry.
   Segundo plano, cierre, regreso y reinicio sin reproducción automática.
6. Internet desactivado y Bluetooth activo en ambos modos; abrir/imprimir/reimprimir
   y volver a Caja sin cambiar documentos ni arrancar sync standalone.
7. A58/B80/A58 físicamente si hay segundo equipo; sin él B/80 mm sigue pendiente.

No borrar ni alterar datos reales para preparar fixtures. No certificar todas
las ESC/POS, 80 mm, BLE ni otros transportes. Sin API/acuse comprobados, papel y
tapa se revisan manualmente; envío exitoso nunca significa impresión confirmada.
