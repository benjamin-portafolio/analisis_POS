---
tipo: plantilla
estado: activo
---

# Plantilla funcionalidad offline first

## Alcance

- Agregado:
- Evento principal:
- Solo local o incluye sync remota:
- Operaciones fuera de alcance:

## Decisiones previas

- [ ] El usuario confirmo el agregado.
- [ ] No se agregaran otros agregados.
- [ ] Se identificaron las `LocalEventRef` del agregado y sus claves de negocio.
- [ ] Se definio si hay reglas de unicidad.

## Implementacion

- [ ] Modelo/enums de dominio.
- [ ] Tabla Drift.
- [ ] DAO.
- [ ] Repository y mapeo Drift -> dominio.
- [ ] Command.
- [ ] CommandService.
- [ ] Contrato `XPayload` con campos tipados.
- [ ] `aggregateType` y `eventType` centralizados en el contrato.
- [ ] `fromJson` valida y normaliza el payload.
- [ ] `toJson` produce la representacion canonica.
- [ ] CommandService construye `XPayload` y usa `toJson`.
- [ ] Evento en `events`.
- [ ] `LocalEventRef` declaradas y validadas en ambos modos.
- [ ] Referencias persistidas en `event_refs` solo en `server_sync`.
- [ ] Evento standalone con `delivery_status = not_required` y sin filas en `event_refs`.
- [ ] Registro en `EventProcessor`.
- [ ] Registro usa `XPayload.eventType`.
- [ ] Handler idempotente.
- [ ] Handler decodifica una vez con `XPayload.fromJson`.
- [ ] Revalidadores reutilizan el contrato para campos especificos.
- [ ] UI convierte `FormResult` a command.

## Verificacion

- [ ] `dart run build_runner build`
- [ ] `dart analyze`
- [ ] `flutter test`
- [ ] Probar serializacion, deserializacion, campos invalidos y compatibilidad
      legada del payload.
- [ ] Revisar que `domain` no importe `data`.
- [ ] Revisar que no se haya agregado sync remota no solicitada.
- [ ] Confirmar que standalone no inicia push, pull, preflight, health checks ni WebSocket.
