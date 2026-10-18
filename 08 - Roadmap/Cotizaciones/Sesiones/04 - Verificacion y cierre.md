---
tipo: sesion_implementacion
estado: historico_revision_2
revision_plan: 2
actualizado: 2026-10-06
---

# Sesión 4: verificación y cierre

> Sesión histórica de revisión 2; su cierre y límite móvil están registrados
> en la continuidad anterior. La modificación sin precios se verifica con
> [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/04 - Verificacion y cierre|la sesión 4 de revisión 3]]
> y sus casos P01–P28. No reutilizar resultados previos como evidencia del cambio.

## Objetivo y prerrequisito

Cerrar la matriz de persistencia, recuperación y cobro, con respaldo/reinicio
y evidencia visual. Requiere las sesiones 1–3 integradas.

## Solicitud para ejecutar

```text
Ejecuta sesión 4, revisión 2, de cotizaciones guardadas.
Flutter: /Users/benjamin/Projects/POS/pos_flutter
Documentación:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Cotizaciones/

Lee AGENTS/guías vigentes, plan/matriz/continuidad y cuatro sesiones.
Revisa evidencias previas y completa solo faltantes o correcciones justificadas.

Cubre C01–C36 con fixtures de origen activo/limpiado, Disponible, En venta,
Vendida e incidencia de sync. Usando SQLite real temporal, compara contenido
y saldos para demostrar que guardar/recuperar no mueven dinero, deuda, inventario
o caja. Incluir inventario directo, receta y medidas; solo cobrar genera esos
efectos una vez. Precio cotizado, configuración vigente y revalidación del
cobro deben coexistir sin cambios de payload remoto.

Verifica double tap/reintentos/colisiones, revisión obsoleta, otra captura
preservada, continuación de la misma, rollback, limpieza y eventos históricos
sin resurrección. Confirma que cotizar el origen y cobrarlo directamente marca
Vendida; un conflicto/rechazo de sync no habilita otra recuperación.

Prueba guardar/reiniciar/reimprimir, recuperar/reiniciar/continuar, limpiar
y volver a recuperar y vendido/reiniciar. Audita y prueba respaldo/restauración
actual con documento/líneas/vínculos/eventos. En server_sync los dos nuevos
event types siguen not_required y fuera de push; la venta confirmada sí usa
dependencias usuales. En standalone no hay event_refs ni servicios de sync.
Ningún reset debe ejecutarse en el segundo arranque de una base actualizada.

Inspecciona PNG de cotización y recibos. Si hay plataforma nativa disponible,
prueba selector/WhatsApp, cancelar/error y volver; si falta, registra tramo
pendiente sin afirmar entrega ni impresión. Revisa menú y retorno al Home/Caja
existentes, sin otra captura ni cambios de otros flujos.

Ejecuta dart analyze y flutter test después de las correcciones; regenera
Drift si cambió esquema. Compila para plataforma de desarrollo ya disponible
si el entorno lo permite y registra resultado, sin usar bases de uso.
Identifica fallos previos ajenos con evidencia, separados de esta funcionalidad.

Actualiza continuidad con resultado C01–C36, comandos, PNG, respaldo/reinicio,
compatibilidad/reset y pendientes nativos. Marca código completo solo cuando
persistencia, menú/listado y recuperación funcionan y están probados.
No despliegues, implementes sync de cotizaciones o dejes historial/recuperación
como estructura futura. Impresión física sigue fuera de esta entrega.
```

## Criterio de cierre

Documento durable, listado solicitado y recuperación completos; invariantes
SQLite en ambos modos y cobro/regresiones aprobados. Matriz por caso con
evidencia, PNG inspeccionados y respaldos/reinicios verificados.

Si solo falta selector nativo, distinguir implementación completada de
verificación nativa pendiente. Fallos de persistencia, precio, duplicación o
sobrescritura de capturas mantienen abierto el cierre.
