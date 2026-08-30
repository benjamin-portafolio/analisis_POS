---
tipo: contexto
estado: decidido
actualizado: 2026-07-16
---

# Modos de operacion

El POS debe poder ejecutarse con la misma base de codigo en dos modos principales:

```text
standalone
server_sync
```

La diferencia entre modos no debe estar en las reglas de negocio principales, sino en los adaptadores externos que se activan.

## Core compartido

Ambos modos comparten:

- SQLite local como almacenamiento operativo.
- Eventos locales inmutables.
- Tablas de lectura/proyecciones.
- Command services por agregado.
- `device_id` local estable.
- Identidad de usuario para auditoria.
- Handlers de eventos reutilizables.
- Validaciones locales basicas.

La UI no debe escribir directamente tablas de lectura. Debe ejecutar comandos que generen eventos y esos eventos deben actualizar las proyecciones locales.

## Modo `standalone`

Pensado para una instalacion personal, un solo dispositivo o una operacion donde no se requiere sincronizacion multi-dispositivo.

Caracteristicas:

- SQLite local es la fuente principal de verdad operativa.
- No se requiere servidor NestJS/PostgreSQL.
- La sincronizacion remota queda desactivada.
- La tabla de eventos funciona como auditoria, trazabilidad y base para posibles respaldos/restauraciones.
- La autenticacion puede ser local, por ejemplo usuario propietario, PIN local o sesion local simple.
- Google Drive es obligatorio en la configuracion inicial de `standalone`: la
  app debe autenticar la cuenta, buscar un respaldo compatible para restaurarlo
  o crear y subir el respaldo inicial antes de completar el alta.
- Google Drive funciona unicamente como respaldo/restauracion; no es un
  servidor transaccional ni habilita sincronizacion multi-dispositivo.
- La app debe ocultar o reemplazar pantallas de servidor por pantallas de respaldo.

En este modo, campos como `server_sequence`, `created_at_server` y checkpoints de pull pueden permanecer nulos o sin uso.

## Modo `server_sync`

Pensado para varios dispositivos sincronizados contra un servidor propio.

Caracteristicas:

- SQLite local sigue siendo el primer lugar donde se escriben los cambios.
- El servidor NestJS/PostgreSQL valida eventos, asigna `server_sequence` y coordina multiples dispositivos.
- La autenticacion del backend identifica usuarios, roles, tienda/sucursal y permisos.
- Los eventos locales pendientes se envian por `preflight -> revalidar -> push -> pull final`.
- WebSocket solo avisa que hay eventos disponibles; no transporta la verdad historica.
- Los conflictos se registran y consultan de forma centralizada.

## Configuracion

El modo debe poder decidirse por configuracion de compilacion o configuracion instalada:

```text
POS_MODE=standalone
POS_MODE=server_sync
```

Ejemplo conceptual:

```json
{
  "mode": "standalone",
  "auth_provider": "google",
  "sync_provider": "none",
  "backup_provider": "google_drive"
}
```

```json
{
  "mode": "server_sync",
  "auth_provider": "backend_jwt",
  "sync_provider": "pos_server",
  "backup_provider": "none"
}
```

La configuracion debe seleccionar implementaciones de interfaces, no propagar condicionales de modo en toda la aplicacion.

## Adaptadores esperados

```text
AuthProvider
  GoogleAuthProvider
  BackendAuthProvider

SyncProvider
  NoSyncProvider
  ServerSyncProvider

BackupProvider
  GoogleDriveBackupProvider
```

## Regla de diseno

El core del POS no debe saber si un evento terminara solo en SQLite, en un respaldo de Drive o en PostgreSQL. El core solo debe:

1. validar localmente,
2. crear eventos,
3. guardarlos en SQLite,
4. aplicar proyecciones.

Los adaptadores externos deciden que pasa despues.

## Politica vigente de respaldo standalone

- `backup_provider = google_drive` es obligatorio para completar la
  configuracion inicial.
- Si la autenticacion de Google no esta disponible, la instalacion standalone
  no se considera configurada.
- Si existe un respaldo compatible de la misma cuenta, se restaura; si no
  existe, se crea la base local y se sube el respaldo inicial.
- Esta obligatoriedad pertenece al respaldo y recuperacion de una instalacion;
  no cambia la regla de que el POS opera localmente sin servidor de sync.
- Proveedores alternativos o la operacion sin respaldo externo requeriran una
  nueva decision y cambios explicitos en onboarding y configuracion.

## Migracion entre modos

Una instalacion standalone podria migrarse a `server_sync` si se conserva:

- historial de eventos locales,
- `device_id`,
- usuario local o mapeo hacia usuario de servidor,
- metadatos de negocio necesarios para crear tenant/tienda/sucursal,
- reglas de importacion y deduplicacion.

Esa migracion debe tratarse como un flujo explicito de bootstrap/importacion, no como sincronizacion automatica contra Drive.

## Enlaces

- [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011 Dos modos de app sobre el mismo core offline first]]
- [[04 - Sincronizacion/Vision general|Vision general]]
- [[04 - Sincronizacion/Flujo local de comandos y eventos|Flujo local de comandos y eventos]]
- [[05 - Datos/Eventos|Eventos]]
