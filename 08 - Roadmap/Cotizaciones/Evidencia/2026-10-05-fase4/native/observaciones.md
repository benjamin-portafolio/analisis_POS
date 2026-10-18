# Ensayo nativo de C35 — 2026-10-05

App macOS debug, `QuotationTicketScreen` y `SharePlus.instance.share` reales;
base `probe.sqlite` en directorio temporal independiente. Entry point guardado
como `../native_probe.dart`; sin DI, sin runtime de sincronización ni respaldo
remoto. El primer `flutter run` se interrumpió antes de compartir; el binario
del mismo probe se abrió luego mediante CUA y generó un nuevo fixture temporal.
Por ello el ID de los JSON de este ensayo difiere del primer `native-run.log`.

Se observó el ticket con ID `fb077c1a-1e72-4972-801d-66d6bf51c98a`, tres líneas,
nombres largos, 0.750 kg y total $134.01. Compartir abrió `ShareSheet.Popover`
con `cotizacion-fb077c1a-1e72-4972-801d-66d6bf51c98a.png` (PNG, ~138 KB).
Destinos visibles: AirDrop, Mail, Messages, Notes, Add to Photos, Freeform,
Journal, Reminders y Copy; WhatsApp no apareció. No se eligió ningún destino.

Se invocó la acción Cancel del popover. Resultado real `dismissed`, SQLite
intacta (`share-1.json`). El botón WhatsApp reabrió el mismo selector con nombre
`.png`; se canceló también: `dismissed`, mismas 29 tablas (`share-2.json`).
Cerrar volvió a la pantalla raíz del probe. Una lectura SQLite independiente
comparó las 29 tablas con `before.json`, todas iguales (`regreso.json`). Se
conserva `probe.sqlite` como evidencia sintética; no contiene datos de uso.

Las observaciones de UI se hicieron con CUA (AX y screenshots inspeccionados).
No se exportaron esas capturas de pantalla: el registro durable es este reporte,
los resultados reales del plugin y la comparación de SQLite. Los cinco PNG
completos de cotización/recibos siguen en fase 3 y fueron reinspeccionados.

Pendiente: dispositivo/tablet con destino WhatsApp disponible y errores reales
nativos del plugin. Errores/cancelación/reintento y callbacks tras cierre tienen
pruebas de widget aprobadas, pero no acreditan ejecución de WhatsApp ni entrega.
Impresión física no se probó. El probe fue cerrado y se recompiló la app con el
entrypoint normal (`build-macos-final.log`).
