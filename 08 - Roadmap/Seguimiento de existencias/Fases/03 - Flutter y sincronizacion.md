---
tipo: fase_implementacion
fase: 3
estado: completada_y_verificada_en_su_alcance
actualizado: 2026-10-04
---

# Fase 3 — Flutter y sincronización

Corrección del 2026-10-04: core y transporte verificados. 43 pruebas SQLite
nuevas + 1 HTTP real, 44 PG pertinentes y checks de build/análisis correctos.
Suite Flutter 1061/1/0: la búsqueda restante es preexistente, con evidencia HEAD.
No se implementó fase 4 ni se inició fase 5. Evidencia y límites: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].

## Solicitud para una nueva sesión

```text
Implementa la fase 3 del plan de seguimiento de existencias. Lee este documento,
el Plan de implementacion, el Contrato funcional y de eventos, los Casos de
aceptacion y el Estado y continuidad en:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Seguimiento de existencias/
Verifica la evidencia de fases 1–2, lee AGENTS.md y las guías offline de Flutter.
Completa core, restauración y sincronización, sin conectar todavía la interfaz.
Registra evidencia real; si hace falta otra sesión, continúa esta misma fase.
```

## Entrada y alcance

Prerrequisitos: contratos/esquemas y servidor completos. Proyecto:
`/Users/benjamin/Projects/POS/pos_flutter`. Leer también el servidor como referencia
para validar paridad; corregir allí solo discrepancias acotadas documentadas.
Conservar cambios ajenos. No ampliar a purga masiva, eliminación de categorías,
fusión de inventario, importación de modos ni nuevos servicios de red.

Esta fase puede ocupar dos sesiones: primero resolución de recurso/memoria y
restauración; después descarte standalone e integración de transporte. Mantener
la fase en curso hasta verificar ambos bloques; no conectar UI a un core parcial.

## Trabajo

1. Añadir a puertos/proyecciones/repositorios procedencia y lectura de memoria,
   con resultados de recuperación tipados: nuevo, recuperable, selección requerida
   y no disponible con motivo. Domain/application no importan Drift.
2. Implementar la resolución del §3 del contrato en `ProductoCommandService`.
   Conservar ID actual, recuperar memoria o seleccionar recurso existente; solo
   crear con ausencia demostrada o descarte válido. Declarar dependencias de un
   recurso recuperado y esperar alta pendiente antes de push.
3. Registrar memoria en creación/actualización local y recepción remota de producto.
   Preservarla al pasar a ninguno/receta. Reconstruir faltantes legados con evidencia
   disponible; datos incompletos no equivalen a una variante nunca seguida.
4. Ampliar respaldo/restauración de `product_update_undo` a toda actualización que
   cambie o siembre memoria. Guardar fila previa exacta o ausencia, no solo ID.
   Conflictos restauran vínculo, memoria, fuente y secuencia en una transacción.
5. Ajustar revalidadores, `SyncConflictProjectionCleaner` y applier remoto para
   cadenas y ecos. Deshacer en orden inverso; evitar que un eco antiguo reemplace
   memoria nueva. Conservar hechos de ventas ya cobradas, incluso del evento perdedor.
6. Standalone: evaluar candidatos dentro del límite transaccional del comando y
   con el estado de producto posterior previsto. Si no son elegibles, emitir solo
   la edición y conservar recurso/memoria. Si lo son, añadir descarte después de
   la edición en el mismo lote; el handler vuelve a validar antes del `delete`.
7. Implementar `recurso_inventario_descartado` y su registro local con prueba del
   disparador, base y §4 completo. Cascadas quitan balance y memoria propios.
   Un error técnico revierte el lote; no registrar un descarte exitoso que no borró.
8. Implementar idempotencia/tombstone basada en el evento aplicado de descarte,
   evitando resurrección por altas antiguas repetidas. Reproducir desde cero el
   lote/historial y verificar el mismo estado. No reutilizar UUID descartados.
9. Elegibilidad consulta vínculos/recetas inactivos, memorias de otras variantes,
   ambos saldos, movimientos y capturas/eventos operativos tipados. No usar
   `event_refs` como única evidencia ni interpretar `COALESCE(balance, 0)` como
   autorización para borrar un recurso con saldo faltante.
10. Server sync: el command nunca emite descarte y SQLite conserva el mismo recurso
    que PG. Integrar origen/recuperación con push, preflight, pull y dependencias.
    Una recepción remota de descarte se rechaza explícitamente; no aplicar política
    standalone a un evento de servidor.
11. Mantener LocalEventRef declaradas/validadas en ambos modos, persistidas solo
    server_sync. Standalone usa not_required y no inicia push/pull/preflight/health
    checks/WebSocket; no transformar su historial en pendiente.
12. Mantener activo el recurso conservado, sus lecturas normales y movimientos.
    No alterar por este plan los efectos de desactivar producto/variante.

## Verificación y salida

Ejecutar build_runner si cambian DAOs/tablas, `dart analyze` y `flutter test`.
Consumir fixtures compartidos y agregar pruebas de integración de event store
para atomicidad real, no solo tests que repitan el predicado de elegibilidad.

Casos esenciales: SEG-05–12, SEG-15–24, SEG-28–30 y ausencia de red/refs standalone.
Verificar server sync con el servidor de fase 2 y datos aislados, incluida una
venta tardía. El E2E completo de dos terminales se repite en fase 5 con UI.

Criterio esencial: recuperar mismo ID sin nuevos saldos/iniciales; descartar solo
el caso standalone permitido; rollback/replay/eco preservan memoria y hechos;
server sync conserva el recurso y aplica la venta histórica. No marcar completa
con restauración o transporte pendientes.

Actualizar Estado y continuidad con ambos bloques y evidencia. Próximo:
[[08 - Roadmap/Seguimiento de existencias/Fases/04 - Interfaz|Fase 4 — Interfaz]].
