# Sesión 2: pantalla e integración

## Solicitud para una nueva sesión

```text
Implementa la fase 2 del escaneo de códigos de barras en Caja.

Vault:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /
Flutter:
/Users/benjamin/Projects/POS/pos_flutter

Lee AGENTS vigentes y las guías offline de Flutter. En el vault lee:
- 08 - Roadmap/Escaneo en caja/Plan de implementacion.md
- 08 - Roadmap/Escaneo en caja/Estado y continuidad.md
- 08 - Roadmap/Escaneo en caja/Sesiones/01 - Consulta y control de lecturas.md

Revisa el código y la evidencia automatizada de fase 1: consulta exacta y
compuerta de lecturas. El usuario eliminó la validación física como requisito
previo a esta sesión. Continúa la integración y conecta Caja aunque no haya
dispositivo; registra las pruebas físicas pendientes para la verificación final.

Basa el funcionamiento de cámara, permisos, detección y liberación en
lib/presentation/pages/gestion_inventario/articulos/widgets/barcode_scanner_screen.dart,
que ya usa mobile_scanner. Reutiliza BarcodeReadGate y el manejo aplicable de
BarcodeReadProbeScreen de la sesión 1. Conserva el contrato String? del editor.

Crea la pantalla de escaneo para ventas: cámara superior con guía, tarjetas
desplazables debajo observando watchCurrentDraft(), total y botón Ir a caja.
Incluye los productos previos de la venta y snapshots persistidos. No crees
un carrito ni calcules incrementos optimistas. Conserva líneas distintas con
precios/unidades diferentes. Reutiliza SaleDraftDisplay.

Conecta ambos botones de barcode de Caja a la misma ruta y cambia su icono a
Icons.barcode_reader. ArticleSearchBar debe recibir callback opcional; no
habilites el flujo en Artículos ni cambies su buscador textual.

Lectura única activa: usa VentaBorradorCommandService.agregar y
AgregarProductoBorradorCommand. Para coincidencias múltiples usa selector;
para venta medida reutiliza SaleQuantityDialog con expectedUnitId. Desconocido,
incompatible o error: aviso sin escrituras y recuperación controlada.
Respeta compuerta y serialización de fase 1, incluidas cancelaciones y diálogos.

Conserva el lector del editor de variantes con su contrato String?. Maneja
permisos, ruta visible, segundo plano, solicitud pendiente al cerrar y
liberación de cámara. No trates una pausa como retirada; el cierre debe resolver
el guardado iniciado y preservar lo ya agregado. Sigue reglas de eventos/refs
por modo, sin introducir sync, servidor, cambios de esquema ni cobro nuevo.

Agrega pruebas de widgets con FakeMobileScannerPlatform y de integración local
con comando/proyección reales. Actualiza los tests que esperan los botones de
Caja deshabilitados; conserva la expectativa de Artículos. Ejecuta dart analyze
y flutter test. Actualiza Estado y continuidad con evidencia y pendientes.
No despliegues ni declares verificado físicamente lo que solo se simuló.
La ausencia de prueba física no justifica mantener los botones de Caja inertes.
```

## Criterio de salida

Ambos accesos de Caja muestran una sola cámara y la misma venta persistida.
Agregar, elegir variante, medir, cancelar y volver producen resultados coherentes
con el borrador real. Tarjetas y Caja coinciden en cantidades y total. El lector
del editor y la navegación/búsqueda de Artículos conservan sus contratos.
