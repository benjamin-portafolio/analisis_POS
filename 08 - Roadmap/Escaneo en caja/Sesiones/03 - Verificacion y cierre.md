# Sesión 3: verificación y cierre

## Solicitud para una nueva sesión

```text
Verifica y cierra la implementación del escaneo de códigos de barras en Caja.

Vault:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /
Flutter:
/Users/benjamin/Projects/POS/pos_flutter

Lee AGENTS vigentes y las guías offline de Flutter. En el vault lee:
- 08 - Roadmap/Escaneo en caja/Plan de implementacion.md
- 08 - Roadmap/Escaneo en caja/Estado y continuidad.md
- Los documentos de sesiones 1 y 2 de esa carpeta.

Revisa código y evidencia de las fases anteriores; no confíes solo en estados
escritos. Completa la matriz E01–E20 del plan y corrige fallos dentro de este
alcance. Verifica búsqueda SQLite, compuerta, navegación y guardado real local
en standalone y server_sync, sin depender de internet.

Comprueba eventos de borrador not_required en ambos modos, refs declaradas y
validadas, event_refs ausentes en standalone y presentes según flujo existente
en server_sync. No inicies push/pull/preflight/health/WebSocket en standalone
ni promociones borradores a pendientes remotos. No requiere cambios en NestJS.

Ejecuta dart analyze y flutter test. Compila Android con el comando apropiado
para el proyecto vigente. Si hay dispositivo, reproduce físicamente el video: escanea A,
retira y vuelve a presentar A, escanea B dos veces con retirada, vuelve a Caja
y comprueba dos artículos/cuatro unidades y total. Prueba además código fijo
20 segundos, enfoque variable, desconocido, barcode duplicado, venta medida,
cancelación, permiso denegado, segundo plano y reapertura sin sumas fantasma.

Verifica EAN-13/EAN-8/UPC-A, conservación de ceros y compatibilidad de lectura
entre el editor y Caja. Prueba teléfono/tablet y texto ampliado; documenta
plataformas y dispositivos realmente comprobados. No infieras funcionamiento
de iOS/macOS a partir de Android ni de la cámara fake.

Revisa que solo cambió el alcance planeado y no quedó código propio sin uso.
Actualiza Estado y continuidad con comandos/resultados, casos físicos,
modelo/versión del dispositivo, estrategia final de rearmado y límites.
Si falta dispositivo, completa la verificación automatizada y la compilación,
registra los casos físicos pendientes y distingue implementación completada de
verificación física pendiente. No reviertas la integración ni desactives los
botones por ese motivo: el usuario eliminó ese requisito previo en revisión 2.
No despliegues ni publiques como efecto de esta sesión.
```

## Criterio de cierre

Los casos aplicables de aceptación están satisfechos con evidencia diferenciada
entre pruebas automatizadas y físicas. Escanear conserva el flujo local de
venta, cantidades e importes. El lector se libera al salir y no incorpora
unidades por mantener el código, cancelar un diálogo o reanudar la aplicación.

Una compilación correcta o pruebas con fake no sustituyen las pruebas reales
de retirada, enfoque y permisos. Documentar cualquier plataforma no verificada
y dejar esos casos pendientes sin bloquear la funcionalidad implementada.
