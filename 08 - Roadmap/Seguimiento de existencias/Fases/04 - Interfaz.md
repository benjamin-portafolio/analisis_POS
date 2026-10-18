---
tipo: fase_implementacion
fase: 4
estado: pendiente_prerrequisito_core_verificado
actualizado: 2026-10-04
---

# Fase 4 — Interfaz

El core de fase 3 fue corregido y verificado el 2026-10-04. La interfaz sigue
pendiente; esta sesión no la conectó. Revalidar árbol pendiente y evidencia antes
de comenzar: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].

## Solicitud para una nueva sesión

```text
Implementa la fase 4 del plan de seguimiento de existencias. Lee este documento,
el Plan de implementacion, el Contrato funcional y de eventos, los Casos de
aceptacion y el Estado y continuidad en:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Seguimiento de existencias/
Verifica que la fase 3 satisface recuperación, descarte y conflictos. Lee AGENTS.md
de Flutter. Conecta exclusivamente el editor y la selección legada acotada;
registra pruebas de widgets/integración, revisión visual y continuidad.
```

## Entrada y alcance

Proyecto: `/Users/benjamin/Projects/POS/pos_flutter`. Revalidar código y cambios
ajenos. El core de fase 3 debe estar verificado antes de conectar el botón.
No añadir una pantalla general de limpieza, fusión de balances, unidad editable
ni confirmación obligatoria de descarte automático elegible.

Referencias iniciales: `variant_editor_screen.dart`, `articulo_preview_form.dart`,
`articulo_form_result.dart`, `article_form_screen.dart` e
`inventory_management_screen.dart`, dentro de gestión de inventario.

## Trabajo

1. Al abrir una variante, cargar la posibilidad de recuperar su recurso mediante
   el puerto/repositorio de fase 3. Diferenciar recurso actual, recordado y nuevo
   en estado de formulario; no leer/escribir Drift desde presentation.
2. Apagar y encender en la misma edición conserva la identidad original. Guardar
   apagado y reabrir no depende de un campo transitorio `linkedInventoryItemId`:
   usar la memoria durable y la resolución al guardar.
3. Para recurso recuperable mostrar saldo vigente y acceso a movimientos existentes.
   No mostrar existencia inicial editable. Para creación realmente nueva mantener
   captura inicial actual y conversión atómica exacta.
4. Adaptar `FormResult` y commands para selección existente validada. La resolución
   del command al guardar prevalece sobre lo observado al abrir; manejar ocupación,
   inactividad o incompatibilidad surgidas durante la edición sin generar otro ID.
5. Si el legado es ambiguo, ofrecer selección explícita de recurso compatible y
   sin otro vínculo directo, con información suficiente de nombre, unidad y saldo.
   Una selección establece la memoria al guardar. No fusionar recursos ni elegir
   automáticamente por nombre, reloj o «mayor saldo».
6. Mostrar estados de carga/error de resolución; bloquear doble toque mientras
   guarda. Conservar captura ante error y no emitir eventos al cancelar el editor
   o el formulario. Mantener sin cambios el flujo existente de alta independiente
   desde recetas; no atribuirlo a una recuperación automática.
7. Explicar que quitar seguimiento detiene futuros descuentos de la variante y
   que el saldo/historial se conservará cuando corresponda. Informar descarte vacío
   solo después del commit real. Los textos no mencionan tablas ni detalles técnicos.
8. Mantener visibles/accesibles recursos activos sin vínculo para consultas y
   movimientos. Revisar filtros existentes para no confundir procedencia con uso
   actual; no ocultar un recurso conservado para simular su eliminación.
9. Probar el flujo unitario y medido, directo/ninguno/receta y variantes múltiples.
   Un cambio solo visual del interruptor no prueba la edición guardada y reabierta.

## Verificación y salida

Ejecutar `dart analyze` y `flutter test`; añadir pruebas de widgets y al menos una
integración que atraviese UI → command → event store → tablas → reapertura.
Casos esenciales SEG-05, SEG-07, SEG-17–19, SEG-22 y SEG-26–27; confirmar SEG-30.

Revisar visualmente el editor en resolución de tablet, carga/error, saldo existente
y selección legada. Registrar capturas o el método realmente utilizado; no afirmar
prueba táctil/física si solo se usaron widgets o renderizado.

Criterio esencial: el usuario puede guardar apagado, cerrar y recuperar el mismo
recurso después, con saldo real y sin inicial duplicada; cancelación/doble toque
no crean filas ni eventos extra y los casos no disponibles tienen salida clara.

Actualizar Estado y continuidad, con pruebas y limitaciones visuales reales.
Próximo:
[[08 - Roadmap/Seguimiento de existencias/Fases/05 - Verificacion y cierre|Fase 5 — Verificación y cierre]].
