---
tipo: sesion_implementacion
estado: pendiente
fase: 2
actualizado: 2026-10-08
---

# Fase 2: configuración de impresoras

Leer el [[08 - Roadmap/Impresion de tickets/Plan de implementacion|plan vigente]]
y el [[08 - Roadmap/Impresion de tickets/Estado y continuidad|estado]].
Partir de los contratos y la dependencia verificados en fase 1.

## Entrega

1. Implementar `PrinterSettingsStore` y archivo propio `printer_settings.json`
   en Application Support, con formato versionado, guardados serializados y
   reemplazo mediante temporal. No mezclarlo con AppConfig, SQLite o respaldo.
2. Controlador que valida perfiles/direcciones/predeterminada y publica cambios
   solo después del guardado. Archivo ausente: vacío; corrupción: aviso y
   recuperación explícita, preservando el archivo original.
3. Pantalla Impresoras accesible desde Configuración en ambos modos, fuera del
   bloque de servidor. Dispositivos vinculados con nombre y dirección; recarga
   y explicación para vincular en ajustes del sistema.
4. Guardar/editar varios perfiles de 58/80 mm; predeterminada explícita,
   selección para un envío y retirada del perfil sin desvincular Android.
   No elegir otra predeterminada automáticamente al quitar la anterior.
5. Conectar «Imprimir prueba» al servicio de fase 1. Mostrar destino y resultado
   de envío; excluir cualquier operación concurrente y evitar reintentos.
6. Registrar store/gateway/controlador/servicio en DI. Conservar perfiles después
   de restaurar SQLite/reiniciar DI y cerrar una conexión antes de reemplazarla.

## Verificación

Directorio temporal: múltiples perfiles, misma dirección, mismo nombre,
persistencia tras recarga, predeterminada inexistente, corrupción y fallo de
escritura. Widgets: permisos/lista vacía/recarga, edición/cancelación,
predeterminada, quitar perfil y prueba ocupada/fallida.

Comprobar ajustes independientes A58/B80 con gateway fake. La prueba física
A → B → A queda pendiente cuando solo existe A; no certificar B con el fake.
Ejecutar `dart analyze` y `flutter test`.

## Criterio de salida

Configurar y recordar varios perfiles sin perder ajustes, con acceso en ambos
modos y prueba manual por un único servicio. Cero eventos/refs o cambios de
esquema por configuración. Actualizar continuidad antes de la fase 3.
