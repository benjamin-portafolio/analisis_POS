---
tipo: ADR
id: ADR-0005
estado: decidido
fecha: 2026-06-09
---

# ADR-0005 Bootstrap con snapshot para dispositivos nuevos

## Contexto

Si un nuevo dispositivo se agrega sin registros locales, reconstruir su estado reproduciendo todos los eventos historicos podria ser lento. Ademas, la tabla `events` crecera constantemente porque cada accion sincronizable queda registrada.

## Decision

Un dispositivo nuevo no descargara todos los eventos desde el inicio. El alta inicial usara un snapshot del estado actual y guardara como cursor el `server_sequence` existente al momento del snapshot.

El flujo base sera:

1. El servidor obtiene el `server_sequence` actual.
2. El servidor genera un snapshot de estado operativo.
3. El dispositivo guarda el snapshot en SQLite.
4. El dispositivo registra `last_full_pull_server_sequence = snapshot_sequence`.
5. Desde ese momento usa sincronizacion normal con eventos posteriores al snapshot.

## Consecuencias

- El alta de dispositivos nuevos es rapida.
- No se pierde el modelo basado en eventos.
- Los eventos historicos siguen disponibles en el servidor para auditoria, reportes y reconstruccion.
- Se requiere un endpoint o proceso de bootstrap.
- Se debe definir que entidades entran en el snapshot inicial.

## Snapshot inicial sugerido

- Catalogo actual.
- Categorias actuales.
- Usuarios y permisos necesarios.
- Roles y configuracion de permisos.
- Dispositivos registrados.
- Ventas abiertas.
- Comandas abiertas o pendientes.
- Inventario actual.
- Cajas abiertas o sesiones de caja activas.
- Configuracion operativa.

## Regla clave

El snapshot no reemplaza el historial. Solo sirve para inicializar rapidamente un dispositivo vacio.

## Enlaces

- [[04 - Sincronizacion/Inicializacion de nuevos dispositivos|Inicializacion de nuevos dispositivos]]
- [[05 - Datos/Crecimiento y retencion de eventos|Crecimiento y retencion de eventos]]
- [[06 - API/Endpoints sync|Endpoints sync]]
