---
tipo: fase_implementacion
fase: 5
estado: bloqueada_no_iniciada_por_fase_4
actualizado: 2026-10-04
---

# Fase 5 — Verificación y cierre

**No iniciada.** La auditoría inicial de entrada falló en fase 3. La petición
posterior corrigió y verificó ese core/transporte, documentado en [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]].
Fase 4 todavía no está implementada. Mantener esta fase sin iniciar hasta
satisfacer toda la entrada y repetir entonces la verificación integrada con UI.

## Solicitud para una nueva sesión

```text
Completa la fase 5 del plan de seguimiento de existencias. Lee este documento,
el Plan de implementacion, el Contrato funcional y de eventos, los Casos de
aceptacion y el Estado y continuidad en:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Seguimiento de existencias/
Revalida evidencia de fases 1–4 y AGENTS.md de ambos proyectos. Verifica el flujo
integrado con datos aislados, corrige defectos de este alcance y registra evidencia
final. Actualiza documentación y puesta en marcha; no despliegues.
```

## Entrada y alcance

Fases 1–4 completas y verificadas, misma revisión de contrato y fixtures.
Proyectos: Flutter `/Users/benjamin/Projects/POS/pos_flutter` y NestJS
`/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`.
Conservar trabajo ajeno. Usar bases, copias de respaldo e identidades temporales;
no limpiar recursos de uso ni abrir la app para resetear datos del usuario.

## Verificación integrada

1. Standalone vacío: crear seguimiento cero, guardar sin seguimiento, comprobar
   desaparición conjunta de recurso/balance/memoria y conservación de eventos;
   reactivar con UUID nuevo. Repetir evento y reconstrucción no resucitan el anterior.
2. Standalone con historial: crear inicial positiva, registrar movimientos hasta
   saldo cero, deshabilitar y recuperar. Comprobar mismos UUID/movimientos/saldo y
   cero filas nuevas de balance o inicial. Repetir con receta compartida.
3. Comprobar que borradores dependientes, referencias inactivas, origen desconocido,
   memoria de otra variante y balance faltante no permiten el descarte.
4. Server sync con dos terminales aisladas A/B: ambas conocen una configuración
   directa; B queda offline y cobra; A deshabilita y sincroniza; B entrega después.
   La venta, el consumo y el saldo histórico se aplican una sola vez. A recupera
   el mismo recurso. Verificar también que A no borra cuando todavía ve saldo cero.
5. Dos terminales compiten por recuperación/edición; comprobar conflicto, orden
   inverso de restauración y memoria exacta. Probar eco antiguo y recursos de origen
   común creados antes de competir por producto, sin pérdida de ventas cobradas.
6. Recurso legado desvinculado: reconstrucción comprobable, cadena incompleta y
   candidatos múltiples. Resolver con selección válida; conservar todos los saldos
   e historiales. No borrar los «duplicados antiguos» en esta fase.
7. Reiniciar y restaurar una copia compatible: memoria, origen, eventos y resultado
   del descarte permanecen. Respaldo antiguo protegido falla según la política
   vigente, sin borrarlo. Revalidar detección de esquema con archivos temporales.
8. Terminal nueva mediante el pull real disponible: origen/memoria se reconstruyen
   y permiten recuperación. Si bootstrap sigue pendiente, documentarlo como límite
   existente; no declarar verificado un endpoint inexistente.
9. Standalone: cero filas `event_refs`, entrega `not_required`, cero llamadas a
   push/pull/preflight/health/WebSocket. Server sync nunca emite descartes; un
   intento externo es rechazado y no se distribuye como evento aplicable.
10. Revisar interfaz de tablet, flujos unitario/medido, doble toque/cancelación,
    conservación de recursos accesibles y ausencia de inicial para recuperación.

## Pruebas y documentación

- Ejecutar checks requeridos por AGENTS de Flutter y build/tests de NestJS, con
  PostgreSQL real aislado donde intervengan migraciones, locks y restricciones.
- Completar la matriz SEG-01–30 con evidencia por caso; no declarar cobertura
  completa por contar tests ni presentar casos omitidos como aprobados.
- Corregir defectos de esta funcionalidad y verificar sus regresiones. Revisar
  imports/helpers/DI y eliminar código propio sin consumidor; mantener el alcance.
- Actualizar ADR-0017, contrato, Catálogo e inventario, Artículos, modelo/eventos,
  validaciones de servidor, mapa y continuidad con estado **implementado** solo
  donde la evidencia lo confirme. Sustituir propuestas físicas por el esquema real.

## Salida y puesta en marcha

Criterio esencial: flujo integrado de recuperación y descarte standalone probado,
venta tardía A/B aceptada y sin borrado remoto, restauración/legado/respaldo
verificados, interfaz usable y matriz completa sin pendientes esenciales.

Documentar el orden de puesta en marcha: respaldo y verificación de compatibilidad,
esquema/servidor receptor preparados, clientes coordinados y checks funcionales.
La política actual de reset de desarrollo impide prometer una actualización
SQLite sin pérdida sobre instalaciones en uso: si hace falta preservar sus bases
de esquema antiguo, registrar esa necesidad como trabajo específico antes de
habilitar allí. No ejecutarlo mediante este plan por inferencia.

Registrar limitaciones reales: sin purga server_sync, sin fusión de legado, sin
importación de modos y cualquier infraestructura/visualización no verificada.
Si falta un caso esencial, dejar la fase en curso y precisar la siguiente sesión.
Cuando todos pasen, Estado y continuidad registra la implementación completa y
las versiones/commits correspondientes; el cierre del plan no despliega nada.
