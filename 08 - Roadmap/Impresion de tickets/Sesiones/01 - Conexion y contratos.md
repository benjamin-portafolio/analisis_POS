---
tipo: sesion_implementacion
estado: pendiente
fase: 1
actualizado: 2026-10-08
---

# Fase 1: conexión y contratos

Leer el [[08 - Roadmap/Impresion de tickets/Plan de implementacion|plan vigente]]
y el [[08 - Roadmap/Impresion de tickets/Estado y continuidad|estado]].
Proyecto: `/Users/benjamin/Projects/POS/pos_flutter`. Conservar cambios ajenos.

## Entrega

1. Revisar AGENTS, Flutter/Dart, AGP/Kotlin y working tree reales.
2. Evaluar `print_bluetooth_thermal` 1.2.1 exacta y comprobar permisos/futuros
   bloqueados; si no cumple, evaluar la alternativa documentada. No actualizar
   el SDK ni fijar una versión incompatible. Registrar una sola elección.
3. Definir modelos de perfil/resultados y `PrinterGateway`, encapsulando plugin,
   permisos, vinculados, conexión, escritura y cierre. Application sin Flutter.
4. Implementar la exclusión global de `TicketPrintService`: aceptar un intento,
   rechazar ocupado y no liberar antes de la finalización nativa efectiva.
5. Crear un envío mínimo de prueba reutilizable en la fase 2, sin activar todavía
   impresión en ventas/cotizaciones ni crear pantallas experimentales permanentes.
6. Declarar permisos Android necesarios y verificar el manifest combinado.
   Proteger plataformas no habilitadas y reinicio de DI/cierre de conexiones.
7. Si Android/impresora están disponibles, comprobar vinculados y transporte,
   enviar una prueba corta y registrar resultado. Si no, marcar física pendiente.

## Verificación

Pruebas del gateway/servicio con permisos denegados, Bluetooth apagado, error,
escritura lenta, tiempo límite con escritura pendiente y dos llamadas concurrentes.
Las garantías de conexión/cancelación no pueden apoyarse solo en `Future.timeout`.
Inspeccionar también el comportamiento del código nativo de la versión elegida.

Ejecutar `dart analyze`, `flutter test` y `flutter build apk --debug`.
Si la dependencia afecta el registro nativo macOS, comprobar la compilación de
desarrollo disponible sin ampliar el soporte funcional. No modificar Drift,
eventos, NestJS ni código de negocio.

## Criterio de salida

Una dependencia compatible seleccionada y compilada; gateway y exclusión global
con errores/cierre verificables. Documentar SPP/BLE real si se pudo comprobar, o
la comprobación pendiente. No exigir Android conectado para comenzar fase 2
cuando el contrato y la verificación automatizada están satisfechos.

Actualizar continuidad con dependencia, permisos, archivos, resultados y límites.
