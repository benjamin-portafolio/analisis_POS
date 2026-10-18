# Ajuste de transmisión tras evidencia física — 2026-10-09

**Ajuste implementado para revalidar; incidencia física todavía abierta.**
La foto del usuario se conserva [sin editar](foto-usuario-original.png), con
[observaciones y SHA-256](foto-observaciones.json). No se presentó un fake como
impresión física ni se declaró compatibilidad completa del modelo.

## Lo visible en la fotografía

- La prueba raster es legible en el área fotografiada: ñ/tildes, nombre largo,
  medida, total y pie. Su perfil impreso: BlueTooth Printer,
  `5A:4A:C6:68:99:9D`, papel seleccionado 58 mm, ancho 384 puntos, `gsV0`.
- La cotización conserva título y parte de su identificador, presenta símbolos
  y vuelve a mostrar fecha/moneda/leyendas legibles. En el fragmento de recibo
  también hay símbolos seguidos de fecha/resumen/importe/producto legibles.
- El recibo muestra un producto y monto $10.00: no se considera un problema
  demostrado exclusivamente de tickets largos. La alternancia es compatible
  con una desalineación de bytes de imagen; **la causa física no está confirmada**.
- El alias y la dirección no identifican fabricante/modelo/firmware. No se
  conoce versión Android, ancho real medido ni buffer del firmware.

## Cambio preparado

El transporte anterior enviaba hasta 1024 bytes por write nativo y pausaba
20 ms solo si quedaban bytes en esa llamada. Después del último bloque,
flush/completado permitían comenzar de inmediato la siguiente banda. Completar
write/flush no significa que el firmware hubiera procesado esos bytes.

El transporte actual limita cada bloque a **256 bytes** y espera **40 ms después
de cada bloque**, incluyendo el último. El future no termina hasta esa pausa y
flush: el servicio mantiene su backpressure/exclusión entre bandas. Esto reduce
las ráfagas contra el receptor; no constituye medición/calibración definitiva
del buffer. La duración de envío aumenta y requiere observación en el equipo.

Si hay cierre/timeout durante la pausa final, el worker comprueba `closing`
antes de flush y la barrera de close espera su terminación. No se añaden bytes,
feed/reset entre bandas, reintentos, cola ni cambio de destino. No se cambia
`gsV0`/384 ni se aplica un método alternativo automáticamente. Renderer y encoder
permanecen byte a byte; no hacen falta nuevos renders por esta modificación.

Archivos propios en `/Users/benjamin/Projects/POS/pos_flutter`:

- `packages/pos_bluetooth_printer/android/src/main/kotlin/com/pos/printing/PrinterTransport.kt`.
- `packages/pos_bluetooth_printer/android/src/test/kotlin/com/pos/printing/PrinterTransportTest.kt`.
- `packages/pos_bluetooth_printer/README.md`.

Se conserva el working tree anterior. No se cambia Drift/eventos/sync/backups ni
configuración persistida. Pausa inyectable únicamente en el transporte interno
para probar la barrera sin temporizadores frágiles; producción usa Thread.sleep.

## Cobertura específica

Dos nuevas JVM verifican:

1. El último bloque también conserva write pendiente, rechaza otro write/connect
   y libera únicamente después de terminar la pausa/flush.
2. Tres bloques 256/256/1 pasan exactamente tres pausas sin duplicar/alterar bytes;
   un cierre durante la última pausa aborta sin flush posterior y espera al worker.

La prueba existente de 2050 bytes conserva el snapshot y orden completo con
8 bloques de 256 + 2 bytes y flush pendiente. Las pruebas de timeout, cierre,
permiso, socket tardío y cambio de destino se mantienen.

Los resultados actuales de comandos y builds se registran en [resultados](resultados.md).
El APK incluye Kotlin nuevo: hot reload/hot restart de Dart no sustituye el plugin
Android ya cargado. Es necesario volver a compilar/instalar la app completa.

## Revalidación física pendiente

Actualizar la app Android sin borrar datos ni perfiles. En el mismo destino
58 mm/384/gsV0, reimprimir manualmente la prueba y los recibos/cotizaciones que
salieron mal; observar todos los tramos y el pie. Fotografiar resultado y anotar
modelo/Android/duración. Después comprobar consecutivos/100 líneas e interrupción.
No se dispone de Android físico en ADB (solo emulator-5554), por lo que el agente
no instaló ni imprimió este ajuste. No se declara resuelta la incidencia hasta
que se observe nuevamente papel correcto en ese equipo.
