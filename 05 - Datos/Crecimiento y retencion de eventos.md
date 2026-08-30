---
tipo: datos
estado: borrador
actualizado: 2026-07-08
---

# Crecimiento y retencion de eventos

## Observacion

La tabla `events` crecera mucho porque cada accion relevante queda registrada.

Ejemplo aproximado:

```text
500 ventas por dia
6 eventos promedio por venta
= 3,000 eventos diarios
= 90,000 eventos mensuales
= 1,080,000 eventos anuales
```

Este crecimiento es normal en un modelo basado en eventos.

Con paridad operativa offline, el volumen no viene solo de ventas. Tambien habra eventos de catalogo, caja, inventario, usuarios, roles, configuracion y resolucion de conflictos.

## Principio

La politica cambia por modo.

En `server_sync`, el servidor puede conservar historial amplio o completo. Los dispositivos moviles no necesitan conservar ni descargar toda la historia.

En `standalone`, el dispositivo es la fuente operativa principal. Por eso la retencion local debe ser mas conservadora y coordinarse con respaldos.

```text
Servidor:
  historial completo o archivado

Dispositivo:
  eventos pendientes
  eventos recientes necesarios
  estado actual en tablas de lectura
```

En standalone:

```text
Dispositivo:
  eventos necesarios para auditoria y restauracion
  estado actual en tablas de lectura
  respaldos consistentes
```

## Uso de eventos historicos

Los eventos historicos sirven para:

- Auditoria.
- Reportes.
- Reconstruccion de estado.
- Depuracion.
- Trazabilidad de pagos, ventas e inventario.
- Resolucion de conflictos.

## Estrategias de crecimiento

### Indices

Indices minimos recomendados:

```sql
create unique index ux_events_event_id on events(event_id);
create index ix_events_server_sequence on events(server_sequence);
create index ix_events_aggregate on events(aggregate_type, aggregate_id);
create index ix_events_created_at_server on events(created_at_server);
```

### Particionado

En el servidor de `server_sync`, considerar particionar `events` por mes o ano cuando el volumen lo justifique.

Ejemplos de particion:

- `events_2026_06`
- `events_2026_07`
- `events_2026_08`

### Archivado

Los eventos antiguos pueden moverse a almacenamiento de historico si ya no se consultan en operacion diaria.

Pendiente de definir:

- Cuanto tiempo quedan en tabla principal.
- Si se archivan por fecha o por `server_sequence`.
- Si los reportes historicos consultan archivo o tablas resumen.

### Compactacion mediante snapshots

Para dispositivos nuevos en `server_sync`, usar snapshot del estado actual y cursor inicial. Ver [[04 - Sincronizacion/Inicializacion de nuevos dispositivos|Inicializacion de nuevos dispositivos]].

Para `standalone`, un respaldo puede funcionar como snapshot de recuperacion, siempre que incluya metadatos suficientes de version, esquema y origen.

## Politica local sugerida en `server_sync`

En dispositivos moviles conservar:

- Eventos pendientes: siempre.
- Eventos rechazados o en conflicto: hasta resolucion.
- Eventos de ventas abiertas: completos.
- Eventos sincronizados recientes: 30, 60 o 90 dias, por definir.
- Ventas antiguas cerradas: resumen en tablas de lectura.

## Politica local sugerida en `standalone`

En standalone conservar:

- Eventos de auditoria necesarios: por definir.
- Eventos de ventas/caja/inventario: por un periodo amplio o completo segun capacidad.
- Respaldos periodicos: siempre antes de purgas o restauraciones.
- Metadatos de respaldo: version de app, version de esquema, `device_id`, fecha y conteos.

No ejecutar purgas locales sin una politica de respaldo validada.

## Referencias desde tablas locales

Aunque el dispositivo purgue eventos sincronizados antiguos, las tablas de lectura conservaran campos como `created_event_id`, `last_event_id` o `event_id`.

En SQLite local, estas referencias no requieren una llave foranea estricta hacia `events`. El objetivo es mantener trazabilidad hacia el servidor sin impedir la limpieza local.

## Regla importante

No usar `updated_at` como criterio principal de sincronizacion ni retencion. Para sincronizacion incremental en `server_sync`, usar `server_sequence`.

En `standalone`, no confundir fecha local con orden global si despues se importan datos a servidor.
