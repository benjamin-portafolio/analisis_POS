---
tipo: fase_implementacion
fase: 2
estado: completa
actualizado: 2026-10-03
---

# Fase 2 — Servidor

## Solicitud para una nueva sesión

```text
Implementa la fase 2 del plan de seguimiento de existencias. Lee este documento,
el Plan de implementacion, el Contrato funcional y de eventos, los Casos de
aceptacion y el Estado y continuidad en:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Seguimiento de existencias/
Verifica la evidencia de la fase 1 y lee AGENTS.md del servidor. Trabaja en
NestJS y continuidad documental; registra pruebas reales y el próximo paso.
```

## Entrada y alcance

Prerrequisito: fase 1 completa con payloads, fixtures y migración probada.
Proyecto: `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest`.
Revalidar archivos, ramas y cambios; conservar trabajo ajeno. No implementar
Flutter, nuevos endpoints CRUD, bootstrap completo ni un descarte remoto.

## Trabajo

1. Persistir origen en `InventoryEventHandler` y conservarlo en la canonicalización
   de altas. Validar coherencia de un origen autogenerado con la variante al aplicar
   su vínculo de producto, sin exigir que la variante exista antes del recurso.
   Edición y movimientos no pueden cambiar origen ni unidad.
2. `ProductoEventHandler` mantiene la memoria transaccional de configuración con
   el lock de producto existente: crea/actualiza al enlazar y preserva al desvincular.
   No cambiar la unicidad del vínculo directo ni borrar recursos por quitarlo.
3. Implementar reconstrucción legada explícita e idempotente del §8: vínculos
   actuales primero; variantes ya desvinculadas solo con cadena oficial demostrable.
   Dejar constancia de casos incompletos/ambiguos; no marcar origen por inferencia.
   Elegir una vía única de ejecución controlada para la reconstrucción (migración
   de datos o comando de mantenimiento documentado), probarla y registrar cuál se usó.
4. Validar recursos recuperados existentes/activos/compatibles/no ocupados. La
   memoria es evidencia para recuperar, no autorización para saltar esas reglas.
   Mantener las dependencias pendientes y el rechazo/conflicto funcional existentes.
5. Mantener recursos y balances tras desvinculación, incluso sin movimientos.
   Probar ventas de otra terminal con configuración histórica: deben actualizar
   el recurso capturado y aceptar una sola vez el consumo.
6. Rechazar funcionalmente el intento de push de `recurso_inventario_descartado`,
   preservando todas las proyecciones; no asignarle aceptación ni exponerlo por pull.
7. Revisar preflight/pull/dispatch y refs canónicas para procedencia y recuperación.
   No inventar dependencia de origen a una variante futura. La memoria queda
   derivada del evento de producto, no en un evento independiente.
8. Probar carreras de vínculo y edición usando PostgreSQL real. Respetar el orden
   de locks de Inventario/Ventas; convertir unicidad/stale base en conflicto y
   evitar errores 500. No prometer un solo recurso por origen en una carrera.
9. Añadir memoria al contrato de snapshot futuro y a cualquier hidratación ya
   existente. Si bootstrap no está implementado, registrar el límite sin construir
   uno completo como efecto colateral. Pull de eventos permite reconstruir memoria.
10. No alterar ventas financieras ya aplicadas, precios capturados, recetas ajenas
    ni el manejo de conflictos que conserva hechos de venta.

## Verificación y salida

Ejecutar `npm run build`, pruebas de contratos/handlers y PG aislado para migración,
memoria, carreras, referencias inactivas y venta tardía. Casos esenciales SEG-05,
SEG-13–17, SEG-19–20, SEG-22–23, SEG-25 y SEG-30. Registrar los casos de UI/core
que todavía necesitan Flutter; un test unitario del servidor no los completa.

Criterio esencial: servidor conserva recurso y saldo tras quitar seguimiento,
acepta venta tardía con configuración histórica, recupera vínculos y mantiene
memoria idempotente; PG verifica las restricciones y carreras reales.

Actualizar Estado y continuidad con la vía de reconstrucción legada, contratos,
pruebas reales y límites. Próximo:
[[08 - Roadmap/Seguimiento de existencias/Fases/03 - Flutter y sincronizacion|Fase 3 — Flutter y sincronización]].
No desplegar ni tocar bases de uso.

## Resultado de la sesión 2026-10-03

Criterio esencial cumplido. El servidor conserva recurso y saldo tras quitar el
seguimiento, acepta la venta tardía contra su configuración histórica, recupera
vínculos y mantiene memoria idempotente, verificado contra PostgreSQL real.

### Vía elegida para la reconstrucción legada

Migración de datos `1790860800000-ReconstructLegacyVariantInventoryMemory.ts`,
ejecutada **a mano** como las demás migraciones del proyecto (no hay nada que las
registre automáticamente). Lee `events` de producto ya sincronizados, ordena la
evidencia por `server_sequence` descendente y, dentro de un mismo evento, da
precedencia a `after` sobre `before`; exige variante del mismo producto y recurso
existente, y escribe solo con `ON CONFLICT DO NOTHING` sobre candidatos ya
filtrados por memoria ausente. Su `down` es un no-op deliberado: las filas que
crea son indistinguibles de las que escriben los handlers y borrarlas destruiría
la proyección.

Los casos que no puede resolver no se inventan: quedan sin memoria y se reportan
como informe JSON por consola (`filas_de_memoria`, `variantes_sin_memoria`,
`variantes_con_evidencia_incompleta`, `variantes_sin_evidencia_demostrable` con
ejemplos). No se creó tabla de incidencias porque ampliaría el esquema más allá
de lo pactado.

### Comportamiento implementado

- `InventoryEventHandler` persiste `origin_variant_id` y lo conserva en la
  canonicalización del alta; edición y movimientos no pueden cambiarlo.
- `ProductoEventHandler` mantiene `variant_inventory_memory` dentro de la misma
  transacción y el lock de producto ya existentes: acredita al vincular por
  primera vez, asegura el vínculo anterior al desvincular, deja la fila intacta
  cuando el recurso no cambia y la sustituye cuando el vínculo cambia a otro.
  `delete_product` conserva vínculo y memoria. El estado `before` se toma de las
  variantes ya persistidas y bloqueadas, nunca del `before` del cliente.
- Coherencia de procedencia: un recurso generado para otra variante se rechaza
  con motivo; `null` (procedencia desconocida) se acepta, y la ausencia de la
  columna se trata igual que `null`.
- Descarte por push: `recurso_inventario_descartado` se rechaza en
  `validateBaseEvent`, antes de abrir transacción. No se persiste, no borra
  nada, no aparece en pull y no dispara `notify`.

### Verificación realmente ejecutada

```text
npm run build                                     -> OK (excluye specs)
npm test                                          -> 247 aprobadas, 139 omitidas
RUN_POSTGRES_INTEGRATION=1 npx jest               -> 369 aprobadas, 17 fallidas
RUN_POSTGRES_INTEGRATION=1 npx jest
  sync/variant-inventory-memory.postgres.spec.ts  -> 19/19
  sync/variant-tracking-late-sale.postgres.spec.ts -> 3/3
  migrations/1790860800000-*.postgres.spec.ts     -> 8/8
```

Las 17 fallidas son las 2 suites preexistentes (`cash-events.postgres.spec.ts`,
`account-balance-baselines.postgres.spec.ts`) que exigen bases `pos_cash_test_*`;
no se tocaron ni se adaptaron.

### Límites declarados

- No hay subsistema de snapshot ni bootstrap en el servidor: la memoria entra por
  replay de eventos (`pull`), y un futuro contrato de snapshot debe incluirla.
  No se construyó uno como efecto colateral.
- No se aplicó ninguna migración a la base dev `pos_nest`: siguen pendientes
  `1790774400000-AddInventoryOriginAndVariantMemory` (decisión de la fase 1) y
  ahora `1790860800000-ReconstructLegacyVariantInventoryMemory`.

### Decisiones que el contrato todavía no resuelve

1. **Memoria al desvincular.** §5.2 dice «asegura primero una memoria del vínculo
   anterior y la conserva», y eso es lo implementado y probado (la fila no se
   reacredita). Pero `Fixtures/memoria/memoria-despues-conflicto.json` espera
   `source_event_id` igual al evento de desvinculación. Si la lectura correcta es
   «reacreditar siempre con el evento de producto vigente», hay que cambiar el
   comportamiento y el fixture, no el test.
2. **Identificadores malformados.** `venta-tardia-consumo-original.json` declara
   `base_version: null` y toda venta confirmada exige `base_version: 1` con
   `base_server_sequence` nulo: regla vigente del servidor, anterior a este plan.
   El spec corrige el sobre de forma explícita y documentada; el fixture sigue
   con `null`.
3. **Recurso en gramos con venta por unidad.** Los fixtures compartidos combinan
   `sale_configuration.mode: unit` con un recurso en gramos, combinación que la
   validación preexistente rechaza. Esos fixtures solo se aplican en
   transiciones cuyo `after` no tiene vínculo directo; los casos de vínculo y de
   recuperación usan identidades locales con recursos en piezas.
