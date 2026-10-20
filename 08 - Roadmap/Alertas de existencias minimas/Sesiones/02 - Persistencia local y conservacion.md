---
estado: completada_en_su_alcance
ejecutada: 2026-10-19
---

# Sesión 2: persistencia local y conservación

Continúa la sesión 2 sin rehacer la anterior. Lee AGENTS y las guías offline,
el [[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion|Plan]],
la [[08 - Roadmap/Alertas de existencias minimas/Matriz de aceptacion|Matriz]]
y [[08 - Roadmap/Alertas de existencias minimas/Estado y continuidad|Continuidad]].
Revisa Git y conserva los cambios ajenos.

Implementa conservar/establecer/retirar mínimo mediante comandos de Artículos.
Normaliza cantidades con el codec y valida unidad/dimensión. Incluye el valor
en proyecciones de variantes, insert/update, snapshot, DTOs de dominio,
DAOs, repositorios, before/after, respaldo undo y restauración. Incluye una
regla de dominio para decidir existencia baja sin importar Drift.

Audita cada reconstrucción/copia de variante: alta, edición completa,
asignación de barcode, CSV, edición comercial masiva, recepción, proveedores,
recetas y retirada de variantes. Los caminos que no editan el mínimo deben
conservarlo, incluida su presencia legada. Mantén encabezados CSV actuales y
sin captura masiva del nuevo campo. Quitar seguimiento conserva el valor
dormido; recuperarlo evalúa saldo vigente.

Aplica las reglas de compatibilidad en snapshot/handler/sameEditingBase,
sin depender de event_refs en standalone. No emitir evento por una promoción
de conocimiento sin cambio de negocio ni por un guardado idéntico. Cambiar
solo el mínimo sí emite un producto_actualizado y no cambia clave de consumo,
saldo ni movimientos. Mantén bases confirmadas y concurrencia por producto.

Prueba SQLite real en ambos modos: A01–A07, A10–A30 y A34/A37/A41 en su
alcance local, con fallo inyectado, duplicado y reapertura en disco. Acredita
especialmente conservación por CSV/masiva y restauraciones que no pisan una
base posterior. Extiende pruebas existentes antes de duplicar arneses.

Comprueba A31–A32: refs declaradas/validadas en ambos modos; persistidas solo
en server_sync; standalone not_required y cero actividad remota. No conviertas
historial local a pendiente. No agregues infraestructura de alertas.

Ejecuta dart analyze y flutter test, y build_runner si cambian tablas. Deja la
captura pública para sesión 4. Actualiza matriz/continuidad con evidencia real;
lo remoto sigue pendiente hasta sesión 3. Sin commit/push/despliegue automático.

## Resultado registrado

Completada en su alcance. Evidencia histórica conservada: [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion2/README|Sesión 2]]. La [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|verificación final de sesión 5]] integra los casos y conserva A42 parcial por falta de teléfono/tablet físico; no declara cierre total.
