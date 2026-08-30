# Contexto del proyecto

Cuando se hable de dispositivos moviles, app movil, Flutter, SQLite local o POS en tablet, usar como referencia:

```text
/Users/benjamin/Projects/POS/pos_flutter
```

Cuando se hable del servidor, API, sync server, NestJS, PostgreSQL o backend, usar como referencia:

```text
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest
```

La carpeta actual contiene el analisis y documentacion de sincronizacion offline first. Usar esos proyectos externos como codigo fuente de referencia para validar implementacion, esquemas y comportamiento real.

## Regla de referencias por modo

- Los command services declaran y validan `LocalEventRef` en `standalone` y
  `server_sync`.
- La app Flutter solo persiste `event_refs` en `server_sync`, donde sirven para
  preflight y conflictos.
- En `standalone`, el evento usa `delivery_status = not_required`, se aplica a
  la proyeccion local y no genera filas en `event_refs`.
- Push, pull, preflight, health checks y WebSocket no deben ejecutarse en
  standalone.
- Una futura importacion de historial standalone debe reconstruir referencias
  explicitamente; no debe convertir silenciosamente eventos locales en
  pendientes de sincronizacion.
