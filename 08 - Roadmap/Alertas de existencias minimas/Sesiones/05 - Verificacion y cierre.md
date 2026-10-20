---
estado: parcial_pendiente_fisico
ejecutada: 2026-10-19
---

# Sesión 5: verificación y cierre

Completa la sesión 5 sin reiniciar el trabajo anterior. Lee AGENTS de ambos
proyectos, el [[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion|Plan]],
la [[08 - Roadmap/Alertas de existencias minimas/Matriz de aceptacion|Matriz]]
y [[08 - Roadmap/Alertas de existencias minimas/Estado y continuidad|Continuidad]].
Revisa Git y preserva cambios ajenos.

Resuelve la matriz A01–A42 con evidencia identificable, priorizando límites,
compatibilidad legada, conservación en escritores existentes y restauración.
Completa pruebas aún no ejecutadas; no repitas sin motivo checks ya aprobados
si no hubo cambios nuevos ni dudas pendientes. Las pruebas finales deben
corresponder al código final y cualquier corrección exige su regresión.

Comprueba reapertura en disco y respaldo/restore de esquema nuevo en ambos
modos, detector de esquema anterior y protección de base restaurada.
Revisa que mínimo no afecta clave de consumo, venta abierta, saldos, reservas,
historial de movimientos ni el contenido de encabezados CSV. Incluye pruebas
de rechazo/conflicto/undo y de reentrega posteriores al cambio.

Ejecuta recorrido manual sobre base aislada: crear seguimiento con mínimo
cinco, vender hasta cinco, observar aviso, reponer a seis, observar retirada,
editar mínimo desde el informe, vaciarlo, reabrir; repetir con variante medida.
Si existe dispositivo conectado, verificar teclado decimal, legibilidad,
scroll y navegación en teléfono/tablet. Si no, deja A42 parcial con la prueba
física concreta pendiente; no acreditarla con renders o widgets de escritorio.

Conserva pruebas automatizadas de PostgreSQL y HTTP de sesión 3 o vuelve a
ejecutarlas si cambió ese código. Ejecuta checks finales de los proyectos
modificados y revisa código sin uso. No uses lint con autofix global para
limpiar cambios ajenos. Registra comandos, revisiones, casos ejecutados,
omitidos, fallos preexistentes y limitaciones reales.

Actualiza notas canónicas pertinentes de Artículos, catálogo e inventario y
payloads de producto para que distingan implementación de propuestas.
Actualiza estado de cada sesión, matriz y mapa del vault sin alterar otros
planes. Deja evidencia en una subcarpeta fechada solo con resultados reales.

Criterio de salida: mínimo editable y conservado en todos los escritores,
aviso/contador/filtro correctos offline y sincronización acreditada sin
pérdida. Si falta entorno o hardware, declara pendiente específico y siguiente
paso en vez de cierre total. No hagas commit, push, despliegue ni migración
operativa como consecuencia automática de esta solicitud.

## Resultado registrado

Verificación automatizada y recorrido manual de escritorio completados. La [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|verificación final de sesión 5]] integra los casos y conserva A42 parcial por falta de teléfono/tablet físico; no declara cierre total.
