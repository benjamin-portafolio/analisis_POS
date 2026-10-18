---
tipo: sesion_implementacion
estado: pendiente
fase: 3
actualizado: 2026-10-08
---

# Fase 3: tickets e integración

Leer el [[08 - Roadmap/Impresion de tickets/Plan de implementacion|plan vigente]]
y el [[08 - Roadmap/Impresion de tickets/Estado y continuidad|estado]].
Reutilizar configuración/gateway/servicio anteriores y el ticket común real.

## Entrega

1. Reubicar el `TicketDocument` existente en `application/tickets` para que
   application/data no importen presentation. Actualizar todos sus consumidores
   y pruebas; no duplicar el modelo ni dejar un archivo puente sin propósito.
2. Implementar renderer térmico y encoder ESC/POS bajo el contrato `TicketEncoder`.
   Fondo blanco, texto negro, ancho del perfil, nombres largos y caracteres
   españoles. 58 mm con bloques legibles; 80 mm con columnas ajustables.
3. Preservar el PNG compartido de 880 píxeles. No reutilizarlo mediante reducción
   simple como única solución térmica; compartir y WhatsApp deben conservarse.
4. Generación/envío acotados por bandas, una inicialización y avance final;
   corte únicamente si el perfil lo soporta. No comandos de cajón.
5. Acción/selector compartidos en recibo de venta y cotización. Capturar el
   documento y perfil al enviar; estado ocupado global, destino visible,
   cambio de impresora y errores con posible impresión parcial.
6. Habilitar Imprimir en Android con ticket disponible; sin perfiles abre
   configuración. En otras plataformas, explicar indisponibilidad sin llamar
   al plugin. Descartar resultados UI antiguos al salir/pausar.
7. Actualizar pruebas que hoy esperan Imprimir deshabilitado. No cambiar
   confirmación de venta, recuperación/nueva captura o estimación de cotización.

## Verificación

Raster/encoder con nombres largos, ñ/tildes, dinero, cantidades medidas,
resumen/pie y documento largo. Comprobar ancho, bandas, orden y terminación,
además de inspeccionar imágenes térmicas producidas para 58 y 80 mm.

Widgets/servicio con inyección: un envío con el documento correcto, doble toque,
cancelación antes del envío, cierre de ruta, perfil modificado y cotización
actualizada durante la generación. Recibo de efectivo/transferencia/crédito y
cotización incompleta conservan sus datos reales.

Fixture local real en ambos modos: impresión/configuración/reimpresión dejan
iguales eventos, refs, ventas, cotizaciones y movimientos. Sin iniciar sync.
Ejecutar `dart analyze` y `flutter test`.

## Criterio de salida

Ambos botones conectados al mismo servicio, perfiles independientes y tickets
legibles en los renders revisados, sin alteración de negocio ni de compartir.
La ausencia de hardware mantiene las pruebas físicas pendientes, no botones
deshabilitados por decisión automática. Actualizar continuidad para fase 4.
