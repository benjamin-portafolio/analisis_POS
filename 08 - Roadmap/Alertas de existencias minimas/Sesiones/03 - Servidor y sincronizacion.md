---
estado: completada_en_su_alcance
ejecutada: 2026-10-19
---

# Sesión 3: servidor y sincronización

Continúa la sesión 3. Lee AGENTS de ambos proyectos y el
[[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion|Plan]],
la [[08 - Roadmap/Alertas de existencias minimas/Matriz de aceptacion|Matriz]]
y [[08 - Roadmap/Alertas de existencias minimas/Estado y continuidad|Continuidad]].
Revisa Git, conserva cambios ajenos y usa bases/esquemas de prueba aislados.

Integra el campo en el receptor de producto NestJS: snapshot actual,
validación de base, creación, actualización, variantes omitidas/retiradas,
canonicalización y respuesta persistida. Conserva rango seguro, null/cero,
semántica de conocimiento y contratos de proveedores existentes.

Prueba la política completa: creación legada sin mínimo; edición legada sobre
base aún legada; promoción explícita por cliente actual; rechazo de edición
o borrado legado sobre una base que ya declara mínimos; rechazo de snapshots
parciales y base falsa/obsoleta. No corrijas compatibilidad borrando el campo
en el payload canónico ni relajando versión, evento o secuencia.

Extiende los arneses existentes para push/pull entre dos clientes actuales,
evento reentregado, cambios concurrentes de mínimo y de otros campos,
pendientes y resolución/restauración de conflictos. Verifica que un cambio
solo del mínimo no altere movimientos, clave de consumo, ventas ni recursos.
Las alertas se calculan por cliente sobre datos sincronizados; no añadas
endpoint, cron ni mensaje WebSocket específico de stock bajo.

Acredita A08 y A10–A15 remotos, A27–A30 y A32–A35 según corresponda, en
PostgreSQL real y HTTP para los recorridos entre clientes. Registra variables
habilitadoras reales de los arneses sin publicar credenciales. Prueba que una
reentrega no pierde valor o presencia del campo.

Ejecuta npm run build y tests pertinentes con RUN_POSTGRES_INTEGRATION=1 en
entorno aislado, además de dart analyze/flutter test para cambios Flutter.
Los casos skip quedan pendientes, no aprobados. Verifica que standalone
continúa sin red. No habilites UI hasta completar este criterio.

Actualiza matriz/continuidad con comandos, evidencia y límites; deja indicada
la secuencia futura de despliegue receptor antes que escritores. Esta sesión
no autoriza desplegar ni migrar bases operativas. Siguiente paso: sesión 4.

## Resultado registrado

Completada en su alcance. Evidencia histórica conservada: [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion3/README|Sesión 3]]. La [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|verificación final de sesión 5]] integra los casos y conserva A42 parcial por falta de teléfono/tablet físico; no declara cierre total.
