---
tipo: sesion_implementacion
estado: historico_revision_2
revision_plan: 2
actualizado: 2026-10-06
---

# Sesión 3: historial y ticket

> Sesión histórica de revisión 2, ya implementada. Usar
> [[08 - Roadmap/Cotizaciones/Sin precios guardados/Sesiones/03 - Consulta y ticket|la sesión 3 de revisión 3]]
> para adaptar la presentación al documento sin precios persistidos.

## Objetivo y prerrequisito

Nueva pantalla desde el menú lateral para ver y recuperar cotizaciones.
Integrar creación desde Caja y ticket persistente. Requiere sesiones 1 y 2.

## Solicitud para ejecutar

```text
Implementa sesión 3, revisión 2, de cotizaciones guardadas.
Flutter: /Users/benjamin/Projects/POS/pos_flutter
Documentación:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Cotizaciones/

Lee AGENTS/guías vigentes, plan/matriz/continuidad y sesiones 1–3.
Verifica persistencia y recuperación implementadas; conserva escaneo y demás
cambios previos en Caja, menú y pruebas.

Añade Cotizaciones a MenuLateral. Cierra drawer y abre QuotationsScreen nueva,
observando QuotationRepository del usuario/dispositivo actuales. Vista inicial
Recuperables (Disponible/En venta), filtro Todas con Vendida. Muestra ID,
fecha, total y estado; detalle con documento/PNG y sus líneas. Incluye carga,
vacío, error/reintento, orden por fecha y filtros conservados al regresar.

Disponible ofrece Recuperar en Caja; En venta, Continuar venta; Vendida, ver
cotización/venta sin recuperar otra vez. La acción llama al comando y navega
solo tras commit. Si hay otra captura, explica que debe resolverla primero;
no la descarta. Si cambió solo precio de catálogo, informa que se conserva el
cotizado. Artículo/unidad incompatible muestra error por línea conservando
documento. Estados vienen del repositorio, no de booleanos al pulsar.

Usa resultado de navegación o callback explícito para volver al Home existente
y seleccionar Caja. No apiles otro Home ni mantengas un carrito distinto.
Caja observa el borrador comprometido; continuar usa el mismo ID y ediciones.

Integra Cotizar junto a Cobrar en Caja, llamando guardar con identidad estable,
origen/revisión/total vistos. Ticket solo después de commit. Un borrador ya
vinculado permite consultar su documento sin guardar otro. Nueva captura
desde emisión usa revisión esperada para limpiar; guarda el documento aunque
el dibujo falle. Abrir/cerrar un ticket histórico no limpia capturas.

Extrae dibujo común independiente de ConfirmedSale. La pantalla del ticket
carga por quotationId y reproduce ID, fecha, líneas y precios guardados tras
reinicio. PNG completo con COTIZACIÓN y leyenda del plan, sin datos de cobro.
Conserva SaleReceiptScreen y recibos existentes. Compartir/WhatsApp usa
cotizacion-ID.png, sin inferir entrega por cierre del selector.

Serializa pulsaciones/compartir/limpiar/recuperar y maneja callbacks tras dispose.
Prueba menú/listado/detalle, filtros/errores, recuperar/continuar/vendida,
navegación sin duplicar Home, ticket durable, compartir/cancelar, limpieza y
acciones lentas. Repite regresiones Caja/escaneo/recibos/menú. Exporta e inspecciona
PNG de cotización y recibos con nombres largos y unidades medidas.
Ejecuta dart analyze y flutter test y actualiza continuidad.
Sin editor nuevo de cotizaciones, backend ni impresión física.
```

## Criterio de salida

Menú abre la pantalla solicitada de consulta/recuperación. Cotizaciones
guardadas accesibles tras reinicio, disponibles recuperables y ventas iniciadas
continuables; vendidas sin duplicación. PNG histórico inmutable y flujos actuales
sin regresiones. Evidencia de widgets C01, C05–C15, C17–C20, C23, C26, C29, C35–C36;
C11–C12 y recibos también con inspección visual.
