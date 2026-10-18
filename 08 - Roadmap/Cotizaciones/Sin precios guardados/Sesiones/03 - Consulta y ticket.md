---
tipo: sesion_implementacion
estado: completada
revision_plan: 3
actualizado: 2026-10-06
---

# Sesión 3: consulta y ticket

## Entrada

Core/esquema de sesión 2 completados. Precios/total visibles y calculados al
consultar/compartir, según decisión confirmada del usuario.
Leer Plan, Casos Pxx, Continuidad, esta sesión y AGENTS de Flutter.

## Trabajo

1. Con precios visibles: observar el catálogo y unidades además del documento
   para actualizar estimaciones sin escribir quotation ni events. Mostrar total
   completo únicamente con todas las líneas calculables. Explicar artículos
   retirados sin ocultarlos ni convertir su precio en cero.
2. Ajustar QuotationDisplay/listado/detalle/ticket. Distinguir fecha de creación
   del momento de cálculo, etiquetar estimación/precios vigentes y comunicar
   que la recuperación obtiene precios actuales. Eliminar textos que prometan
   conservar el precio anterior o una reimpresión monetaria idéntica.
3. Invalidar caché de `_display`/`_image` según el contenido de la estimación.
   Probar generación, cambio de catálogo y nueva generación desde la misma
   pantalla. Cada PNG corresponde a una lectura coherente; compartir mantiene
   esos bytes durante su operación sin congelar las siguientes generaciones.
4. Mantener columnas de precio/importes y recibos existentes completos. Adaptar
   el renderizador común solo en los datos/etiquetas necesarios para identificar
   la estimación de cotización; conservar los recibos de ventas capturadas.
5. Conservar filtros, estados, menú y navegación a la Caja existente. Continuar
   no repuebla ni recalcula un borrador. Guardar/compartir/error no eliminan la
   selección; limpieza desde ticket conserva el control de revisión de origen.
6. Actualizar pruebas de widgets/navegación/ticket y generar PNGs con piezas,
   medidas, nombres largos y muchas líneas. Inspeccionarlos visualmente y
   corregir truncamientos/desbordes. Mantener recibos cash/transfer/credit.
7. Retirar imports/helpers/DI sin uso y ejecutar analyze/flutter test después
   de los cambios funcionales. Registrar evidencia y relevo.

## Criterio de salida

P09/P10/P15/P26/P27 aprobados en lo automatizable, PNGs nuevos inspeccionados y
ausencia de escrituras al consultar/compartir probada. Ningún precio mostrado
depende de columnas eliminadas o de la venta origen. Si falta dispositivo para
selector nativo móvil, registrar ese límite con precisión; no confundir mock
de compartir con envío real a WhatsApp.

## Prompt de ejecución

```text
Ejecuta la sesión 3 de Cotizaciones/Sin precios guardados, revisión 3.
Usa el core de sesión 2 y la preferencia registrada en continuidad. Completa
consulta/listado/detalle y ticket con precios/total vigentes calculados sin
persistencia, según decisión confirmada del usuario. Corrige
reactividad y caché PNG; conserva selección, estados, navegación y recibos.
Verifica cambios de catálogo, líneas indisponibles, compartir y callbacks;
genera e inspecciona PNGs nuevos. Ejecuta analyze/flutter test y actualiza
continuidad y casos Pxx con evidencia, sin tocar bases de uso.
```


## Resultado — 2026-10-06

Fase 3 completada sobre el core de fase 2. P09/P10/P15/P26/P27 verificados en el
alcance automatizable; ocho PNG nuevos inspeccionados y selector Android abierto/
cancelado desde ambos botones. Sin WhatsApp instalado, dispositivo físico ni
prueba de selector iOS o entrega real. 1300 tests aprobados, 1 integración omitida;
analyze y diff --check pasan. Fase 4 pendiente y no ejecutada.

Detalle: [[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-3-consulta-y-ticket|Evidencia fase 3]].
