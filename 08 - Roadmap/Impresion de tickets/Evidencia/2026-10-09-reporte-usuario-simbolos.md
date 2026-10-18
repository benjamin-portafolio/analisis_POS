# Incidencia física reportada: símbolos en recibos/cotizaciones

Fecha de registro: 2026-10-09. Fuente física: **reporte del usuario**, sin foto,
manual, Android/modelo/dirección/método todavía identificados. No es una
observación directa del agente ni un ensayo de compatibilidad completo.

El usuario informa conexión con la impresora y estos resultados:

- Imprimir prueba: legible. Confirmó el documento actual con «PRUEBA DE
  IMPRESIÓN», café, 0.750 kg y ñ/tildes; no es la antigua prueba ASCII.
- Recibo/cotización: caracteres extraños. Falta saber si empiezan desde la
  primera banda o aparecen después de una parte correcta, y si el selector
  usa exactamente el mismo destino/perfil que la prueba.

La incidencia física sigue **abierta**. Las aprobaciones automatizadas de
sesión 4 no demuestran que los recibos se impriman bien en este equipo.

Auditoría actual: prueba y tickets llaman a printTicket y usan el mismo
encoder/renderer/transporte; el perfil de cada envío lo elige su llamador.
La UI muestra dirección/papel en el selector, pero no ancho/método. La prueba
raster identifica ambos parámetros en papel. El transporte escribe bloques
1024 bytes con pausas 20 ms dentro de cada write; el ritmo/buffer físico no
se ha medido. Causa todavía no confirmada; no se cambiaron comandos/pausas
ni se añadieron reintentos para intentar ocultarla.

Reverificación ejecutada, raíz `/Users/benjamin/Projects/POS/pos_flutter`:
`flutter test test/data/printing/esc_pos_ticket_encoder_test.dart test/data/printing/android_bluetooth_printer_gateway_test.dart --reporter expanded`
Resultado: **21 pruebas pasaron**. Son raster/decoder y canal controlado,
no la reproducción física del defecto.

`adb devices -l` solo mostró emulator-5554; ningún Android físico accesible
para esta investigación. No se instalaron/ejecutaron builds en el emulador
ni se modificó el código o datos de negocio.

Referencia técnica: [GS v 0 de Epson](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lv_0.html)
define bytes raster y condiciones de buffer/inicio de línea; [ESC *](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_asterisk.html)
define imagen por columnas; estas referencias permiten revisar el encoder,
pero no certifican un firmware desconocido.

Pendiente: ubicación de la primera corrupción, modelo/Android y método/ancho
impresos en la prueba; comparar con el perfil escogido por recibo/cotización.
Con esos datos se podrá elegir una corrección/prueba física específica.

## Actualización: fotografía recibida

La foto confirma la prueba legible con `gsV0`, perfil de 58 mm/384 dots y
`5A:4A:C6:68:99:9D`, y tramos alternados correctos/símbolos en cotización y recibo.
Se preparó transmisión más lenta (256 bytes/40 ms incluyendo último bloque),
sin cambiar método ni documentos. Es un ajuste pendiente de revalidación física,
no una causa confirmada ni una certificación del modelo.
Ver [[08 - Roadmap/Impresion de tickets/Evidencia/2026-10-09-ajuste-transmision/README|Foto, ajuste y verificaciones actuales]].
