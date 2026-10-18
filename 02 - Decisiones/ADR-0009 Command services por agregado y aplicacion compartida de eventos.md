---
tipo: ADR
id: ADR-0009
estado: decidido
fecha: 2026-06-21
---

# ADR-0009 Command services por agregado y aplicacion compartida de eventos

## Contexto

La UI puede tener pantallas que administran varias entidades al mismo tiempo. Por ejemplo, una pantalla de gestion de mesas puede crear espacios y mesas. Si se crea un servicio por pantalla, la logica de negocio queda acoplada a la forma visual actual.

Ademas, un mismo evento puede nacer localmente desde la UI o llegar despues desde el servidor. Ambos caminos deben producir el mismo estado local.

## Decision

Los command services se organizaran por agregado o modulo de negocio, no por pantalla.

Los comandos de entrada (`Command`) y el servicio que los procesa
(`CommandService`) comparten una subcarpeta por funcionalidad dentro de
`application/commands`, con una clase principal por archivo.
`LocalCommandContext` permanece en la raiz como contexto compartido.

Ejemplos:

```text
application/commands/espacios/crear_espacio_command.dart
application/commands/espacios/espacio_command_service.dart
application/commands/categorias/categoria_command_service.dart
application/commands/articulos/producto_command_service.dart
application/commands/inventario/inventory_command_service.dart
application/commands/ventas/venta_borrador_command_service.dart
application/commands/local_command_context.dart
```

La UI llamara al command service correspondiente. El command service construye el evento, lo guarda como pendiente y lo manda al procesador de eventos.

## Flujo local

```text
UI
  -> application/commands
  -> crear evento
  -> guardar evento pending
  -> eventProcessor.apply(event)
  -> handler del agregado
  -> actualizar tablas locales
```

## Flujo futuro desde servidor

```text
WebSocket
  -> recibir aviso de eventos disponibles
  -> SyncService ejecuta /sync/pull desde last_full_pull_server_sequence
  -> parsear JSON como evento
  -> guardar evento synced
  -> eventProcessor.apply(event)
  -> handler del agregado
  -> actualizar tablas locales
```

Si el evento llega como respuesta de `/sync/preflight` o `/sync/pull`, entra al mismo camino desde `SyncService`.

## Parte compartida

La parte compartida entre eventos propios y eventos del servidor es:

```text
eventProcessor.apply(event)
```

Este metodo debe ser idempotente y delegar al handler adecuado segun `event_type`.

## Consecuencias

- La pantalla puede usar varios command services.
- Los handlers de eventos no dependen de widgets ni formularios.
- La logica de sincronizacion futura podra reutilizar los mismos handlers.
- La capa `presentation` no debe insertar directamente en tablas de lectura.
- La sincronizacion remota puede quedar pendiente sin bloquear el flujo local.

## Enlaces

- [[04 - Sincronizacion/Flujo local de comandos y eventos|Flujo local de comandos y eventos]]
- [[04 - Sincronizacion/Protocolo de eventos|Protocolo de eventos]]
- [[02 - Decisiones/ADR-0008 Flujo de sincronizacion con preflight antes de push|ADR-0008]]
- [[02 - Decisiones/ADR-0010 WebSocket como aviso de eventos disponibles|ADR-0010]]
