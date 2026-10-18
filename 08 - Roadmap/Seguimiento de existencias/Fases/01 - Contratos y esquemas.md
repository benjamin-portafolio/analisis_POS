---
tipo: fase_implementacion
fase: 1
estado: completa
actualizado: 2026-10-02
---

# Fase 1 — Contratos y esquemas

> **Completada el 2026-10-02.** El contrato siguió en revisión 1: no hizo falta
> revisión nueva. Evidencia completa (archivos, comandos, resultados, límites) en
> [[08 - Roadmap/Seguimiento de existencias/Estado y continuidad|Estado y continuidad]];
> detalle físico en
> [[08 - Roadmap/Seguimiento de existencias/Mapeo fisico de esquemas|Mapeo físico de esquemas]].
> La función sigue deshabilitada y no se conectó UI.

## Solicitud para una nueva sesión

```text
Implementa la fase 1 del plan de seguimiento de existencias. Lee este documento,
el Plan de implementacion, el Contrato funcional y de eventos, los Casos de
aceptacion y el Estado y continuidad en:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Seguimiento de existencias/
Lee los AGENTS.md vigentes de Flutter/NestJS y las guías offline de Flutter.
Completa exclusivamente contratos y esquemas según este relevo; registra
evidencia real y el siguiente paso en Estado y continuidad.
```

## Entrada y alcance

Prerrequisito: contrato rev. 1 y ADR-0017 disponibles. Verificar los HEAD, cambios
pendientes y código actual; conservar trabajo ajeno. Fuentes:

- Flutter: `/Users/benjamin/Projects/POS/pos_flutter`.
- NestJS: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`.

Esta fase implementa estructuras y contratos; no conecta botones ni emite
descartes. Las estructuras sin consumidor son una entrega intermedia explícita
para fases 2–3, no una ampliación especulativa.

## Trabajo

1. Contrastar §5–7 del contrato con puertos/proyecciones, registros y backups
   reales. Cerrar cualquier ajuste necesario en una revisión nueva **antes** de
   implementar versiones incompatibles. No cambiar las reglas funcionales de modos.
2. Extender `RecursoInventarioCreadoPayload` en Dart/TS con origen opcional,
   constante compartida por contrato, lectura legada y roundtrip que no lo pierda.
   Mantener inicial `manual_adjustment` legado y `initial_balance` nuevo.
3. Añadir contrato tipado de `recurso_inventario_descartado` con campos del §6.3,
   forma/base/disparador y versión de política. No registrarlo como emisor ni
   hacer que el servidor lo aplique a inventario.
4. Crear `Fixtures/` e índice conforme a Casos de aceptación; consumir payloads
   válidos/inválidos desde tests de Dart/TS. Las secuencias deben usar formas reales
   de `producto_actualizado` y venta, no mocks de un contrato distinto.
5. Agregar origen nullable e índice no único a inventario, y tabla
   `variant_inventory_memory` con PK/FK/cascadas/índice y comentarios del contrato.
   La tabla auxiliar tiene trazabilidad sin ciclo/versión independiente; documentar
   por qué no usa CommonFields. Registrar tablas/entidades y DTOs necesarios.
6. PostgreSQL: migración que preserve todos los datos. Origen legado permanece
   nulo; sembrar memoria de vínculos actuales con evento/secuencia acreditados.
   La reconstrucción de variantes ya desvinculadas se completa en fase 2.
7. Verificar migración con vínculos activos/inactivos, recetas y movimientos;
   comprobar que borrar una memoria no borra recurso y que cascadas de memoria
   nunca borran variante. Un downgrade no se presenta como recuperación de datos
   de memoria/procedencia que elimina: describir sus pérdidas expresamente.
8. Flutter: mantener schemaVersion vigente y política de reset de desarrollo.
   Adaptar detección y protección de respaldo incompatible, usando archivos
   temporales. No abrir una base real del usuario para probar el reinicio.
9. Documentar el mapeo físico exacto SQLite/PG y el tratamiento de snapshot futuro
   junto al contrato. Si cambia algún nombre, actualizar esta fase y las siguientes.

## Verificación y salida

- Drift: `dart run build_runner build`, `dart analyze`, `flutter test` según AGENTS.
- NestJS: `npm run build`, pruebas de payload y migración sobre PG aislado.
- Casos mínimos: SEG-01–04, SEG-10 en restricciones, SEG-18 en forma de contrato,
  y SEG-28 en detección de esquema/respaldo. El comportamiento completo llegará
  en sus fases; no atribuirlo a tests de formato.

Criterio esencial: payloads y esquema de ambos proyectos coinciden con una sola
revisión y fixtures verificables; las bases antiguas PG conservan datos y la
política SQLite está probada. No avanzar con PG omitido o esquema sin regenerar.

Al terminar actualizar Estado y continuidad, registrar archivos/pruebas/límites
y marcar esta fase completa cuando corresponda. Próximo:
[[08 - Roadmap/Seguimiento de existencias/Fases/02 - Servidor|Fase 2 — Servidor]].
No desplegar ni habilitar UI como parte de esta fase.
