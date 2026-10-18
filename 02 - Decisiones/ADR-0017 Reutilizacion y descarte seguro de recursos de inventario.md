---
tipo: ADR
id: ADR-0017
estado: decidido_core_verificado_interfaz_pendiente
fecha: 2026-10-02
actualizado: 2026-10-04
---

# ADR-0017 Reutilizacion y descarte seguro de recursos de inventario

## Contexto

En el código revisado al planificar el 2026-10-02, quitar el seguimiento directo guarda
`product_variants.inventory_item_id = NULL` y conserva el recurso y su balance.
Activarlo en una edición posterior crea otro recurso porque el command service
solo consulta el vínculo presente en la base de edición. Los ciclos sucesivos
acumulan recursos y separan el saldo anterior del nuevo seguimiento.

El usuario aceptó corregir la reactivación y permitir una limpieza limitada de
recursos descartables. Ser el único producto vinculado no basta: existen recetas,
variantes inactivas, movimientos, capturas de venta y ventas de otras terminales
que todavía no han llegado al servidor.

## Decisión

1. La configuración operativa sigue derivándose del vínculo directo o de la
   receta; no se agrega un booleano de seguimiento ni saldo a la variante.
2. Guardar sin seguimiento libera el vínculo directo y conserva una memoria
   durable del último recurso directo. Al volver a activarlo se reutiliza ese
   recurso si existe, está activo, es compatible y no pertenece directamente a
   otra variante. Recuperar no crea balance ni movimiento inicial nuevos.
3. Los recursos nuevos creados automáticamente para seguimiento directo registran
   la variante de origen. Esa procedencia es inmutable, no equivale a un vínculo
   operativo y no restringe su uso en recetas. Los recursos independientes y
   legados sin procedencia demostrable no se descartan automáticamente.
4. En `standalone` se permite descartar un recurso autogenerado al quitar su
   seguimiento directo solo si, después de la edición, no conserva usos actuales,
   referencias de otras variantes ni capturas/eventos operativos dependientes;
   no tiene ningún movimiento y ambos saldos son exactamente cero.
5. La edición y el descarte local se registran como eventos de un lote atómico.
   Borrar el recurso elimina su balance por la cascada existente. No se borran
   movimientos, ventas, eventos ni referencias históricas para forzar elegibilidad.
6. En `server_sync` esta entrega no hace borrado físico automático, ni en SQLite
   ni en PostgreSQL, aunque el servidor todavía no tenga movimientos. Conserva
   recurso y balance para ventas tardías y recupera el mismo recurso al reactivar.
   Un futuro descarte remoto exige otro diseño que cierre la posibilidad de
   escritores offline; esperar un plazo o terminar un preflight no lo demuestra.
7. Desactivar o eliminar lógicamente producto/variante no dispara esta limpieza.
   Tampoco se amplía a eliminación de categorías, recetas o recursos independientes.
8. Conservar un recurso no lo desactiva automáticamente. Puede seguir siendo
   consultado, ajustado o utilizado por recetas conforme a las reglas vigentes.
9. Los casos legados ambiguos se conservan y requieren selección explícita de
   un recurso compatible. No se elige por nombre, fecha de reloj ni saldo, ni se
   crea silenciosamente otro recurso para ocultar el problema.

## Consecuencias

- Reemplaza parcialmente la prohibición absoluta de descarte de ADR-0014; la
  conservación de cualquier recurso con historial y las FK `RESTRICT` continúan.
- La memoria pertenece a la proyección de configuración de la variante. No es
  una reserva del vínculo único y debe restaurarse cuando una edición entra en
  conflicto. La procedencia pertenece al recurso de Inventario.
- Se necesita paridad de contratos, esquemas y recuperación en Flutter y NestJS.
- `LocalEventRef` se declara y valida en ambos modos. Solo `server_sync` persiste
  `event_refs`; `standalone` conserva `delivery_status = not_required` y no inicia
  servicios de red. No se convierten eventos locales en pendientes de sync.
- La importación futura de historial standalone deberá interpretar los descartes
  y reconstruir referencias expresamente; este plan no implementa esa importación.
- Al 2026-10-04, fases 1–3 verificadas en su alcance: memoria derivada,
  recuperación de identidad, descarte/undo transaccionales y transporte HTTP
  real con PostgreSQL aislado. 43 pruebas SQLite nuevas + 1 HTTP; 44 PG
  pertinentes. La suite Flutter conserva una búsqueda preexistente fallida.
  La UI no está implementada; la decisión no habilita ni cierra el plan.
  Evidencia: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].

## Especificación y ejecución

- [[08 - Roadmap/Seguimiento de existencias/Contrato funcional y de eventos|Contrato funcional y de eventos]]
- [[08 - Roadmap/Seguimiento de existencias/Plan de implementacion|Plan de implementación en cinco fases]]
- [[08 - Roadmap/Seguimiento de existencias/Estado y continuidad|Estado y continuidad]]
- [[02 - Decisiones/ADR-0014 Seguimiento directo de existencias por variante|ADR-0014]]
- [[02 - Decisiones/ADR-0004 Inventario por movimientos|ADR-0004]]

## Compatibilidad y puesta en marcha — pendiente

No hay despliegue ni migraciones aplicadas por esta auditoría a `pos_nest`.
Las migraciones 1790774400000 y 1790860800000 siguen pendientes allí. La primera
permite un down que pierde procedencia/memoria; no es recuperación de datos.
La segunda conserva su memoria en down. Respaldar y validar restauración antes
de cualquier ejecución futura autorizada.

SQLite mantiene schemaVersion 8 y recrea esquemas antiguos según la política de
desarrollo. Un respaldo antiguo marcado restaurado/incompatible falla protegido.
No se promete actualización sin pérdida a instalaciones en uso: la preservación
de esos datos necesita un trabajo explícito previo. El esquema SQLite actual
incluye inventory_item_discards, con aplicación/replay/rollback comprobados en fase 3.

Orden futuro: satisfacer fases 4–5; respaldo compatible y ensayo de restauración;
preparar esquema/receptor mediante el procedimiento de migración explícito;
coordinar versiones de todos los clientes; checks integrados con datos aislados;
habilitar únicamente con autorización correspondiente. No hay purga server_sync,
fusión de legado, importación entre modos ni bootstrap de snapshot implementado.
La venta tardía está acreditada por HTTP/PG/SQLite A-B-C con servicios reales y sin UI; no es prueba física A/B.
