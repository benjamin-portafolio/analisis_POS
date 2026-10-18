---
tipo: plan_implementacion
estado: fase_3_verificada_fase_4_pendiente_cierre_abierto
revision: 1
actualizado: 2026-10-04
---

# Seguimiento de existencias: plan de implementación

## Objetivo y alcance

Evitar que deshabilitar y habilitar seguimiento directo cree recursos nuevos
innecesariamente. Recuperar identidad, saldo e historial anteriores, y descartar
solo recursos autogenerados realmente vacíos en `standalone`, conforme a
[[02 - Decisiones/ADR-0017 Reutilizacion y descarte seguro de recursos de inventario|ADR-0017]].

La sesión inicial del 2026-10-02 dejó la especificación. Estado actual del
2026-10-04: fases 1–2 verificadas en su alcance; fase 3 corregida y verificada en
core/transporte; fase 4 pendiente; fase 5 no iniciada. El plan **no está completo
ni listo para habilitar**. Evidencia: [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].

## Documentos de trabajo

- [[08 - Roadmap/Seguimiento de existencias/Contrato funcional y de eventos|Contrato funcional y de eventos, revisión 1]]: reglas y diseño técnico de referencia.
- [[08 - Roadmap/Seguimiento de existencias/Casos de aceptacion|Casos de aceptación]]: matriz verificable común.
- [[08 - Roadmap/Seguimiento de existencias/Estado y continuidad|Estado y continuidad]]: evidencia real y próximo paso.
- Los cinco documentos de `Fases/`: instrucciones autocontenidas para sesiones futuras.

## Secuencia recomendada

Recomiendo cinco fases secuenciales, normalmente una sesión por fase. La fase 3
puede necesitar dos sesiones por su interacción con restauración de conflictos.
Si una fase queda incompleta, la siguiente sesión continúa esa misma fase. Se
pueden completar fases consecutivas en una sesión cuando sus comprobaciones
estén satisfechas; no se omiten pruebas ni se ejecutan simultáneamente sobre los
mismos directorios.

| Fase | Entrega | Dependencia | Criterio esencial de salida |
|---|---|---|---|
| [[08 - Roadmap/Seguimiento de existencias/Fases/01 - Contratos y esquemas\|1. Contratos y esquemas]] | Payloads Dart/TS, fixtures comunes, procedencia y memoria en ambas bases | Plan y contrato rev. 1 | Paridad de contratos y esquemas, migración PG aislada y esquema Drift regenerado |
| [[08 - Roadmap/Seguimiento de existencias/Fases/02 - Servidor\|2. Servidor]] | Proyección de memoria, validaciones y sincronización de procedencia; conservación remota | Fase 1 completa | Venta tardía después de desvincular aceptada y sin borrar recurso/balance |
| [[08 - Roadmap/Seguimiento de existencias/Fases/03 - Flutter y sincronizacion\|3. Flutter y sincronización]] | Recuperación en comandos, descarte standalone, replay y restauración de memoria | Fases 1–2 completas | Mismo recurso al reactivar; descarte atómico; conflicto restaura vínculo y memoria |
| [[08 - Roadmap/Seguimiento de existencias/Fases/04 - Interfaz\|4. Interfaz]] | Editor coherente con recuperación, mensajes y selección legada acotada | Fase 3 completa | Ciclo guardado/apertura/activación sin existencia inicial duplicada ni escrituras al cancelar |
| [[08 - Roadmap/Seguimiento de existencias/Fases/05 - Verificacion y cierre\|5. Verificación y cierre]] | Pruebas de dos terminales, respaldo, reinicio y documentación final | Fases 1–4 completas | Matriz de aceptación satisfecha, evidencia registrada y límites de puesta en marcha explícitos |

## Reglas comunes

1. Trabajar únicamente en seguimiento directo, memoria, procedencia y descarte
   seguro. Mantener el consumo de recetas y las ventas históricas existentes.
2. La ausencia de vínculo/componentes continúa expresando sin seguimiento. La
   memoria histórica no habilita consumo y no se utiliza para cobrar una venta.
3. No borrar movimientos ni convertir sus FK a cascada. Balance cero no equivale
   a ausencia de historial. No desactivar recursos por perder el vínculo directo.
4. No implementar un descarte remoto, un período de gracia, un cierre global de
   escritores, una purga masiva ni una importación standalone como parte del plan.
5. Mantener contratos tipados y el flujo command → evento → handler → proyección
   → repositorio → UI. La UI no escribe Drift directamente.
6. Mantener las reglas de `LocalEventRef` por modo. Las consultas de elegibilidad
   leen dependencias de dominio y eventos tipados, no solo `event_refs`.
7. Conservar cambios ajenos. El vault ya tenía modificaciones previas en muchas
   notas al iniciar este plan; no usar `git reset`, restauraciones masivas ni
   asumir que todo el diff de Git pertenece a esta funcionalidad.
8. Leer los `AGENTS.md` vigentes de cada proyecto y las guías offline de Flutter
   al iniciar. Usar una clase principal por archivo y eliminar código propio sin uso.

## Proyectos y referencias

```text
Vault: /Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /
Flutter: /Users/benjamin/Projects/POS/pos_flutter
NestJS: /Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest
```

El directorio `analisis ` termina en un espacio. Estas rutas son las fuentes de
trabajo; los nombres de archivos siguientes son puntos de partida que se deben
revalidar, no una fotografía inmutable del código.

| Responsabilidad | Referencias actuales |
|---|---|
| Preparación de vínculos nuevos | Flutter: `lib/application/commands/articulos/producto_command_service.dart` |
| Contratos de recurso y producto | Flutter: `lib/application/sync/payloads/`; NestJS: `src/sync/payloads/` |
| Aplicación y restauración de productos | Flutter: `producto_event_handler.dart`, `drift_producto_projection_store.dart`, `producto_dao.dart`, `sync_conflict_projection_cleaner.dart` |
| Inventario local | Flutter: `inventory_event_handler.dart`, `inventory_projection_store.dart`, `drift_inventory_projection_store.dart`, `inventory_dao.dart` |
| Bases y detección de esquema | Flutter: `lib/data/local/drift/tables/`, `app_database.dart`; NestJS: `src/entities/`, `src/migrations/` |
| Preflight, push, pull y revalidación | Flutter: `lib/application/sync/`; NestJS: `src/sync/sync.service.ts` |
| Editor y adaptación a command | Flutter: `variant_editor_screen.dart`, `articulo_preview_form.dart`, `articulo_form_result.dart`, `inventory_management_screen.dart` |
| Ventas históricas | NestJS: `src/sync/venta-event.handler.ts`; Flutter: handlers/comandos de Ventas |

## Esquemas y compatibilidad

- En Flutter, respetar la política vigente de desarrollo: conservar el valor de
  `schemaVersion` que exista al ejecutar, sin añadir `onUpgrade` por este cambio;
  adaptar `_resetDatabaseOnStartup`. En la inspección del 2026-10-02 el valor es
  **8**, aunque otras notas históricas mencionen 7. No fijarlo usando este texto.
- Verificar con bases temporales la detección de columnas/tablas, la conservación
  entre siguientes arranques y el rechazo de respaldos incompatibles protegidos.
  No abrir una base de uso para provocar su reinicio.
- En PostgreSQL escribir una migración que preserve filas, movimientos, saldos y
  eventos existentes. Probarla en una base aislada; no activar `synchronize`
  contra datos de uso para verificarla.
- Procedencia ausente en eventos legados significa desconocida. No editar eventos
  existentes para hacerlos parecer nuevos. La memoria legada tiene reconstrucción
  explícita y conservadora; no depende de nombres ni de tiempos de reloj.
- Si el bootstrap con snapshot aún no está implementado, documentar ese límite y
  su contrato futuro; verificar la reconstrucción por el pull real disponible.
  Este plan no implementa un subsistema completo de bootstrap.
- Preparar servidor receptor/esquema y todos los clientes que usarán la nueva
  función antes de su puesta en marcha. Una fase compilable no significa que la
  función esté lista para instalaciones en uso.

## Verificación y relevo entre sesiones

Antes de avanzar, inspeccionar archivos y evidencia de la fase previa, además de
su estado escrito. Después de cambios funcionales de Flutter ejecutar
`dart analyze` y `flutter test`; si cambia Drift ejecutar antes
`dart run build_runner build`. En NestJS ejecutar `npm run build`, pruebas
pertinentes y pruebas PostgreSQL reales para restricciones/carreras. Una prueba
omitida o sin infraestructura se registra como pendiente, no como aprobada.

Al terminar cada sesión actualizar Estado y continuidad con fase, revisión del
contrato, archivos propios, comandos y resultados reales, límites, rama/HEAD o
commits, y siguiente documento. No iniciar otra fase con un criterio esencial
pendiente. No hacer despliegues ni publicar cambios como efecto de estos prompts.

Para iniciar la implementación abrir
[[08 - Roadmap/Seguimiento de existencias/Fases/01 - Contratos y esquemas|Fase 1 — Contratos y esquemas]]
y utilizar su bloque «Solicitud para una nueva sesión».
