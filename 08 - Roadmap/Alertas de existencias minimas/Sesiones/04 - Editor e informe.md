---
estado: completada_en_su_alcance
ejecutada: 2026-10-19
---

# Sesión 4: editor e informe

Continúa la sesión 4 tras verificar core local y receptor. Lee AGENTS, el
[[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion|Plan]],
la [[08 - Roadmap/Alertas de existencias minimas/Matriz de aceptacion|Matriz]]
y [[08 - Roadmap/Alertas de existencias minimas/Estado y continuidad|Continuidad]].
Revisa Git y preserva los cambios existentes del editor y del informe.

Agrega «Existencia mínima» al editor compartido con la unidad de inventario
visible. Vacío desactiva, cero es válido y la precisión corresponde a la
unidad. Recarga el valor guardado mediante preview/form result/copyWith y
articulo_form_command; no dejes que el constructor de un camino anterior
transforme conservar en borrar. Ocultar seguimiento conserva el mínimo.

Integra la misma captura en alta/edición de Artículos y edición de variante
desde el informe. Conserva todas las variantes, base confirmada y campos no
editados. Cancelar no guarda el mínimo; base obsoleta se informa sin reemplazar
silenciosamente la base. No alteres la independencia de movimientos de
inventario que ya puedan guardarse desde el editor.

Extiende RemainingStockScreen/RemainingStockItem y su tarjeta actuales:
mostrar mínimo y distintivo «Existencia baja», filtros «Todas» y
«Existencias bajas», contador coherente y vacío específico sin coincidencias.
Conserva navegación/edición, búsqueda o filtros ya presentes al implementar.
Comparte la regla de dominio entre filas, filtro y contador.

Usa el stream existente de catálogo con balances. Ventas confirmadas,
reposiciones, ajustes y cambios del mínimo actualizan el aviso observado
sin temporizadores, eventos de alerta, consultas remotas ni sumas por fila.
No muestres aviso para inactivos, sin mínimo o sin seguimiento directo.

Verifica A01–A06, A19–A20, A23 y A25–A26, A38–A41 con widgets y persistencia
real donde se guarda. Cubre teclado/decimal, cero frente a vacío, cancelación,
varias variantes, filtro que pierde su última fila tras reponer y navegación
desde el informe. No amplíes CSV, edición masiva ni notificaciones emergentes.

Ejecuta dart analyze/flutter test y registra evidencia, archivos y casos en
continuidad/matriz. El recorrido visible no equivale a prueba física ni a
cierre completo. Siguiente paso: sesión 5, sin commit/push/despliegue automático.

## Resultado registrado

Completada en su alcance. Evidencia histórica conservada: [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion4/README|Sesión 4]]. La [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|verificación final de sesión 5]] integra los casos y conserva A42 parcial por falta de teléfono/tablet físico; no declara cierre total.
