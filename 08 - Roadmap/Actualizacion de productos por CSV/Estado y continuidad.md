---
tipo: seguimiento_implementacion
estado: planificado
revision_plan: 1
actualizado: 2026-10-18
---

# Estado y continuidad: actualización por CSV

Plan: [[08 - Roadmap/Actualizacion de productos por CSV/Plan de implementacion|Revisión 1]].
Aceptación: [[08 - Roadmap/Actualizacion de productos por CSV/Matriz de aceptacion|C01–C44]].

## Estado actual

| Etapa | Estado |
|---|---|
| Planificación y lectura del código | Completadas |
| 1. Contrato y detección | Pendiente |
| 2. Comandos y lotes | Pendiente |
| 3. Interfaz y recorrido completo | Pendiente |
| 4. Verificación y rendimiento | Pendiente |
| Medición en tablet | Pendiente; no realizada al planificar |

La solicitud actual fue preparar el plan. No se cambió código Flutter/NestJS,
no se ejecutaron pruebas funcionales y no se midió rendimiento. Solo se
crearon estas notas, cuatro instrucciones de sesión y el enlace en el mapa.

El usuario aceptó usar IDs. El alcance de primera entrega contempla altas y
ediciones de datos comerciales sobre productos/variantes existentes, no
cambios de estructura ni de existencias. Los CSV anteriores siguen siendo de
alta; nunca se actualiza por coincidencia de nombre o barcode.

## Estado observado de los repositorios

- Flutter en `/Users/benjamin/Projects/POS/pos_flutter`, HEAD `e5d9c7b`.
  Cambio ajeno observado en
  `lib/presentation/pages/caja/sale_barcode_scanner_screen.dart`.
- El vault de análisis estaba en HEAD `424c8bb` con múltiples cambios ajenos,
  incluidos `00 - Inicio/Mapa del vault.md`, documentación, `.obsidian` y
  archivos sin seguimiento. Se preservaron; el mapa recibe solo un enlace más
  y la fecha de actualización de esta sesión.
- Estos datos son históricos. Releer `git status --short` en ambos al retomar;
  no restaurar archivos de otro trabajo ni asumir árbol limpio.

## Próximo paso

Ejecutar [[08 - Roadmap/Actualizacion de productos por CSV/Sesiones/01 - Contrato y deteccion|Sesión 1]].
Primero capturar una referencia reproducible del alta actual antes de cambiar
el importador. Usar bases/fixtures aislados, leer AGENTS y las guías offline.
Después implementar contrato, lectura y detección según el plan.

Las cuatro etapas pueden ejecutarse seguidas, sin saltarse pruebas ni
fronteras de atomicidad. No se requiere crear otros chats para ello.

## Riesgos que debe recordar la siguiente sesión

1. `actualizarArticulo` recibe el agregado completo; no pasarle directamente
   las filas parciales del CSV ni comandos de alta con defaults de inventario.
2. Las existencias de un export antiguo no deben generar ajustes ni errores
   por diferir del saldo vivo. El seguimiento debe conservarse.
3. Los IDs no incluyen revisión de exportación. La protección contra
   concurrencia comienza al preparar/confirmar y usa la base observada.
4. `sameState` requiere estados completos, con semántica legada de proveedores.
   Comparar solo los campos editables para detectar; preservar lo demás al guardar.
5. No perder el camino rápido de altas ni generar escrituras para omitidos.

## Registro por sesión

Al cerrar cada implementación, añadir fecha, revisión, archivos cambiados,
casos resueltos, comandos/resultados, mediciones o pendientes y próximo paso.
No marcar como aprobada una prueba de tablet a partir de resultados de escritorio.
