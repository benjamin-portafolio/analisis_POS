---
estado: completada_en_su_alcance
ejecutada: 2026-10-19
---

# Sesión 1: contratos y esquemas

Implementa la sesión 1 de Alertas de existencias mínimas. Lee AGENTS de
Flutter/NestJS, las guías offline de Flutter y el
[[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion|Plan]],
la [[08 - Roadmap/Alertas de existencias minimas/Matriz de aceptacion|Matriz]]
y [[08 - Roadmap/Alertas de existencias minimas/Estado y continuidad|Continuidad]].
Revisa Git y preserva los cambios ajenos, incluido el informe aún no
versionado si continúa así. Esta sesión no habilita captura pública.

Agrega `minimum_stock_atomic` nullable a la tabla Drift y entidad PostgreSQL,
con rango 0..9007199254740991. Documenta el campo. Actualiza detector de esquema
de arranque/restore; respeta reset de desarrollo y versión fija según AGENTS,
sin onUpgrade nuevo. Regenera Drift. Crea y registra migración PostgreSQL
aditiva; verifica up/constraints/down sobre esquema aislado previo con datos,
sin tocar la base operativa ni cambiar eventos históricos.

Extiende contratos tipados Dart/TypeScript de creación/actualización,
validadores, toJson/fromJson, copias y comparación de estados. Distingue
ausencia legada de null explícito y rechaza snapshots parciales. Deja
especificada y cubierta la transición permitida desde base legada, junto con
el rechazo de escritores legados sobre base conocida. No relajes versión,
evento, secuencia ni comparación de los demás campos, incluidos proveedores.
No uses null por defecto como intención de borrar en comandos anteriores.

Prepara fixtures equivalentes en ambos proyectos para legado, null, cero,
positivo, medido, inválidos y degradación. Si consumidores actuales requieren
ajustes de firmas para compilar, haz los mínimos cambios que preserven datos;
la persistencia funcional y todos los escritores se completan en sesión 2.

Verifica A06–A15 en contratos, A09, A35 y A36 en esquemas. No declares
aprobados los recorridos de comando/receptor solo por pasar pruebas del parser.
Ejecuta build_runner, dart analyze, flutter test, build NestJS y los tests
pertinentes, habilitando PostgreSQL aislado donde corresponda.

Criterio de salida: contrato equivalente en ambos lenguajes, rango SQL
verificado, bases previas detectadas y migración con conservación demostrada.
Actualiza matriz/continuidad con archivos, comandos, resultados y pendientes.
El siguiente paso es sesión 2; no hagas commit, push ni despliegue automático.

## Resultado registrado

Completada en su alcance. Evidencia histórica conservada: [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion1/README|Sesión 1]]. La [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|verificación final de sesión 5]] integra los casos y conserva A42 parcial por falta de teléfono/tablet físico; no declara cierre total.
