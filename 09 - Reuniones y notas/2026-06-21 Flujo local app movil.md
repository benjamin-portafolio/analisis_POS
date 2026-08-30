---
tipo: nota
fecha: 2026-06-21
estado: activo
---

# 2026-06-21 Flujo local app movil

Se decide implementar primero el flujo local de la app movil, dejando pendiente la sincronizacion remota.

## Decisiones

- Agregar capa `application/commands`.
- Crear command services por agregado, no por pantalla.
- Compartir `eventProcessor.apply(event)` para eventos propios y eventos futuros del servidor.
- Mantener la subida y descarga con servidor fuera del alcance inmediato.

## Impacto inicial

- `EspacioCommandService` crea eventos `espacio_creado`.
- `MesaCommandService` crea eventos `mesa_creada`.
- Los handlers actualizan las tablas locales.
- La pantalla de gestion de mesas puede usar ambos servicios.
