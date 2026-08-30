---
tipo: sincronizacion
estado: decidido
actualizado: 2026-07-23
---

# Patron para nuevas funcionalidades offline first

Esta nota resume el patron que debe seguirse cuando se agregue una funcionalidad local similar a `espacio_creado`.

## Objetivo

Reducir ambiguedad y mantener una arquitectura consistente entre funcionalidades. La accion debe poder ejecutarse localmente, guardar su evento y actualizar la proyeccion local sin depender del servidor.

El patron es comun a `standalone` y `server_sync`.

## Flujo base

```text
UI
  -> FormResult de presentation
  -> Command de application
  -> CommandService
  -> construir payload tipado
  -> crear SyncEvent
  -> guardar events
  -> guardar event_refs solo en server_sync
  -> EventProcessor.apply(event)
  -> EventHandler decodifica payload tipado
  -> EventHandler idempotente
  -> actualizar tabla local
  -> Repository mapea Drift a dominio
  -> UI observa Repository
```

## Capas

| Capa | Responsabilidad |
|---|---|
| `presentation` | Pantallas, dialogs y modelos de formulario |
| `domain` | Modelos y conceptos de negocio, sin dependencia a Drift |
| `application/commands` | Comandos y servicios que convierten acciones en eventos |
| `application/sync` | `SyncEvent`, payloads tipados, `EventProcessor` y handlers que aplican eventos |
| `data/local/drift` | Tablas, DAOs, migraciones y base local |
| `data/repositories` | Mapeo entre Drift y modelos de dominio |

## Reglas

- No implementar sincronizacion remota si el alcance solicitado es solo local.
- No acoplar la nueva funcionalidad a un modo especifico si puede vivir en el core comun.
- No agregar otro agregado si no fue solicitado o analizado.
- La UI no debe insertar directo en Drift.
- Las pantallas deben prepararse para crecimiento incremental sin acumular
  responsabilidades: menus, formularios, selectores y widgets que puedan
  evolucionar por separado deben vivir en archivos propios, y la pantalla
  principal debe limitarse a coordinarlos.
- `domain` no debe importar `data`.
- Los handlers deben ser idempotentes.
- `SyncEvent.payload` permanece como mapa generico para poder transportar y
  persistir eventos heterogeneos.
- Cada `event_type` implementado debe tener un contrato tipado en
  `application/sync/payloads`, con `fromJson`, `toJson`, `aggregateType` y
  `eventType`.
- El command service construye el payload tipado y usa `toJson`; el handler lo
  decodifica una vez con `fromJson` antes de aplicar el evento.
- El registro y los command services reutilizan las constantes del contrato;
  no duplican literales de tipo de agregado o evento.
- Revalidadores y otros consumidores de campos especificos reutilizan el mismo
  contrato y no interpretan manualmente `event.payload`.
- Los formatos legados se aceptan solo de forma explicita y con pruebas.
- Cada comando debe declarar al menos una `LocalEventRef` para el agregado principal en ambos modos.
- Si una clave de negocio debe validarse como unica, declarar una referencia con `relationship = requires_unique`.
- En `server_sync`, persistir las referencias en `event_refs` para preflight y conflictos.
- En `standalone`, validar las referencias pero no persistirlas; guardar el evento con `delivery_status = not_required`.
- No iniciar push, pull, preflight, health checks ni WebSocket en standalone.
- Una futura importacion de historial standalone debe reconstruir referencias explicitamente.

## Ejemplo actual

El flujo de referencia implementado en el proyecto Flutter es:

```text
EspacioFormResult
  -> CrearEspacioCommand
  -> EspacioCommandService
  -> EspacioCreadoPayload.toJson
  -> events / event_refs solo en server_sync
  -> EventProcessor
  -> EspacioCreadoPayload.fromJson
  -> EspacioEventHandler
  -> espacios
  -> EspacioRepository
```

Los contratos implementados actualmente son:

| Evento | Contrato |
|---|---|
| `espacio_creado` | `EspacioCreadoPayload` |
| `categoria_creada` | `CategoriaCreadaPayload` |
| `categoria_actualizada` | `CategoriaActualizadaPayload` |
| `categoria_movida` | `CategoriaMovidaPayload` |

## Verificacion

```text
dart run build_runner build
dart analyze
flutter test
```

## Enlaces

- [[04 - Sincronizacion/Flujo local de comandos y eventos|Flujo local de comandos y eventos]]
- [[02 - Decisiones/ADR-0009 Command services por agregado y aplicacion compartida de eventos|ADR-0009]]
- [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011]]
- [[Plantillas/Plantilla funcionalidad offline first|Plantilla funcionalidad offline first]]
