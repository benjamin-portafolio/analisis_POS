---
tipo: casos_aceptacion
estado: auditado_parcial_con_pendientes_esenciales
revision_contrato: 1
actualizado: 2026-10-04
---

# Seguimiento de existencias: casos de aceptación

Los casos siguientes son requisitos de las fases, no resultados aprobados.
Las matrices al final conservan la auditoría inicial y registran después la
corrección de fase 3, distinguiendo core probado de UI/físico pendiente. Cada implementación debe registrar prueba/archivo, comando ejecutado y resultado
en [[08 - Roadmap/Seguimiento de existencias/Estado y continuidad|Estado y continuidad]].
Las precondiciones «autogenerado» y «memoria» se refieren al
[[08 - Roadmap/Seguimiento de existencias/Contrato funcional y de eventos|contrato rev. 1]].

| ID | Modo / nivel | Escenario | Resultado requerido | Fases |
|---|---|---|---|---|
| SEG-01 | Ambos / contrato | Alta directa nueva con cero | Un recurso con origen, un balance cero, memoria y ningún movimiento | 1–3 |
| SEG-02 | Ambos / contrato | Alta directa con inicial positiva | Un `initial_balance`; deshabilitar posteriormente conserva recurso y balance | 1–3 |
| SEG-03 | Ambos / contrato | Recurso independiente o alta legada sin origen | Origen `NULL`, roundtrip conserva compatibilidad; no descarte automático | 1–3 |
| SEG-04 | Ambos / persistencia | Vínculo directo antiguo con recurso existente; última metadata puede venir de Categorías | Migración/reconstrucción siembra memoria con evidencia de producto comprobable, sin cambiar origen ni eventos | 1–3 |
| SEG-05 | Ambos / core | Deshabilitar con movimientos y reactivar en otro guardado | Mismo ID, saldo e historial; ninguna alta ni inicial adicionales | 2–4 |
| SEG-06 | Standalone / core | Deshabilitar autogenerado sin movimientos, saldos cero y sin dependencias | Edición + descarte atómicos; sin recurso, balance ni su memoria; eventos conservados | 3 |
| SEG-07 | Standalone / core | Activar después de SEG-06 | UUID nuevo por descarte demostrado; sin resucitar el anterior | 3–4 |
| SEG-08 | Standalone / core | Movimientos cuya suma es cero | Conservar recurso, balance y memoria | 3 |
| SEG-09 | Standalone / core | Otra receta, incluso del mismo producto, usa el recurso | Desvincular directo y conservar; receta permanece válida | 3 |
| SEG-10 | Standalone / esquema | Referencia de variante inactiva o memoria de otra variante | Contar la referencia y conservar el recurso; sin violar FK | 1, 3 |
| SEG-11 | Standalone / core | Captura de venta dependiente aún abierta | Conservar mientras deba revisarse/resolverse la configuración capturada | 3–4 |
| SEG-12 | Standalone / core | Balance falta o alguno de los dos saldos no es cero | Nunca interpretar como recurso vacío ni borrar; inconsistencia visible si falta balance | 3 |
| SEG-13 | Server sync / A-B | A desvincula; B cobra offline con configuración anterior; llega después | Venta histórica aceptada una vez y saldo antiguo actualizado; recurso conservado | 2–3, 5 |
| SEG-14 | Server sync / A-B | Deshabilitar sin movimientos oficiales mientras B está desconectada | Conservar en A y servidor; ningún evento de descarte remoto ni temporizador | 2–3, 5 |
| SEG-15 | Server sync / conflictos | Recuperación o cambio de fuente compite con edición oficial | Conflicto normal; restaurar vínculo y memoria exactos, incluso ausencia de memoria previa | 2–3 |
| SEG-16 | Server sync / eco | Eco de evento anterior llega después de nueva edición local | Solo avanzar metadata correspondiente; no reemplazar memoria reciente | 2–3 |
| SEG-17 | Ambos / validación | Recurso recordado ocupado, inactivo o incompatible | Bloquear recuperación con motivo; no generar reemplazo silencioso | 2–4 |
| SEG-18 | Ambos / validación | Recuperar recurso con existencia inicial capturada | Rechazar cantidad inicial; dirigir corrección a movimientos habituales | 1, 3–4 |
| SEG-19 | Ambos / core | Directo → receta que usa el mismo recurso → directo | Conservar/reutilizar el ID y quitar componentes de la variante al volver a directo | 2–4 |
| SEG-20 | Ambos / idempotencia | Repetir alta, edición, recuperación y descarte | No duplicar filas/deltas; descarte faltante requiere prueba del mismo evento aplicado | 1–3 |
| SEG-21 | Standalone / replay | Reconstrucción completa y alta antigua repetida después del descarte | Mismo estado final; el recurso descartado no resucita | 3, 5 |
| SEG-22 | Ambos / legado | Varios recursos plausibles o cadena histórica incompleta | Selección explícita compatible o incidencia; conservar candidatos y nunca elegir por nombre/reloj | 2–4 |
| SEG-23 | Server sync / carrera | Dos altas de recurso de origen común preceden a ediciones concurrentes | Solo configuración ganadora; recursos/hechos conservados; ambigüedad identificable | 2–3, 5 |
| SEG-24 | Standalone / atomicidad | Error al aplicar el descarte o al persistir memoria | Sin edición parcialmente aplicada, eventos de éxito falsos ni tombstone falso | 3 |
| SEG-25 | Server sync / API | Cliente intenta subir `recurso_inventario_descartado` | Rechazo funcional; ninguna mutación de inventario ni distribución por pull | 2 |
| SEG-26 | Ambos / UI | Apagar/encender sin guardar; cancelar; doble toque | Conservar ID en formulario; cancelar sin eventos; un solo commit al guardar | 4 |
| SEG-27 | Ambos / UI | Guardar apagado, cerrar, reabrir y encender | Mostrar recurso recuperable y saldo vigente; inicial solo para creación nueva | 4 |
| SEG-28 | Standalone / respaldo | Reinicio y restauración de respaldo compatible | Memoria/procedencia/descarte conservados; eventos `not_required`, cero `event_refs`, sin red | 1, 3, 5 |
| SEG-29 | Server sync / hidratación | Terminal nueva recibe eventos desde pull real disponible | Reconstruye memoria y origen; repetir pull no cambia identidades ni saldos | 2–3, 5 |
| SEG-30 | Ambos / alcance | Desactivar producto/variante o eliminar categoría | No disparar descarte de esta funcionalidad ni alterar reglas históricas existentes | 2–4 |

## Fixtures comunes que produce la fase 1

Guardar en `Fixtures/` junto al contrato, con un `index.md` que declare validez
esperada, propósito y resultado. La fase 1 produjo 33 JSON; la auditoría de entrada
a fase 5 confirmó su lectura/parsing y consumo desde los contratos Dart/TS.
La sintaxis válida de un fixture no acredita su escenario funcional.

1. Alta autogenerada con origen válido, sin cantidad, y con inicial positiva.
2. Alta independiente y alta legada sin el campo; inicial `manual_adjustment` legado.
3. Origen inválido, UUID incorrecto y actualización que intenta mutar procedencia.
4. Actualización de directo a ninguno/receta y recuperación del mismo ID.
5. Descarte válido, disparador incorrecto, base incorrecta y `policy_version` inválida.
6. Recuperación de memoria legada y estado de memoria antes/después de conflicto.
7. Venta tardía: configuración histórica, consumo original y desvinculación posterior.

Los fixtures de payload se comparten entre Dart/TypeScript. Los de secuencias
indican estado previo, eventos y estado esperado; no inventan campos de negocio
para facilitar los tests. Consultar y conservar las configuraciones de venta
reales al construirlos.

## Resultados históricos de entrada a fase 5 — 2026-10-04, antes de la corrección

**Registro histórico anterior a la petición de corregir fase 3.** La matriz actual
de core/transporte se encuentra en el bloque posterior. Fase 5 no iniciada.
«Parcial» acredita solo el alcance nombrado; «pendiente» no es una prueba aprobada.
Ninguna fila acredita pruebas físicas/tablet ni dos clientes reales. Comandos,
revisiones, errores y nombres completos en [[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-prerrequisitos-fase5/Resultados|Auditoría de entrada a fase 5, 2026-10-04]].

Referencias de evidencia ejecutada:

- **C-Dart / C-TS:** payloads de recurso creado/descartado; 14/17 Dart y 17/15 TS.
- **S-SQLite:** variant_inventory_memory_schema_test (5) y variant_memory_schema_reset_test (3).
- **PG-M1 / PG-M2:** specs de migraciones 1790774400000 (6) y 1790860800000 (8).
- **PG-Mem:** variant-inventory-memory.postgres.spec.ts (19).
- **PG-Venta:** variant-tracking-late-sale.postgres.spec.ts (3), SyncService y PostgreSQL real, gateway simulado.
- **PG-Prod:** producto-event.handler.postgres.spec.ts (8).
- **Sonda:** core_prerequisites_test.dart.txt / core-prerequisites.log, SQLite real en memoria y puertos completos, 8 fallidas.
- **Suite-Flutter:** flutter-test.jsonl (1002 aprobadas, 16 fallidas); listado por caso en resumen-pruebas.json.

| ID | Resultado comprobado | Evidencia y trabajo que falta |
|---|---|---|
| SEG-01 | **Fallido en Flutter** | Sonda: alta por handlers no escribe memoria en ambos modos. C-Dart/TS y PG-Mem pasan sus porciones. Falta alta integrada con memoria y cantidades exactas. |
| SEG-02 | **Parcial** | C-Dart/TS aceptan inicial positiva; Sonda prepara historial legado con inicial, pero reactivar cambia ID. Falta ciclo integrado con memoria e inicial única. |
| SEG-03 | **Parcial** | C-Dart/TS conservan legado sin origen; PG-M1/M2 no fabrican procedencia; PG-Mem acepta recurso desconocido. Falta comprobar exclusión del descarte ejecutable, hoy ausente. |
| SEG-04 | **Parcial; Flutter pendiente** | PG-M1 siembra con evento de producto acreditado aunque la metadata sea de Categorías; PG-M2 reconstruye legado. Sonda no recibe memoria por eventos Flutter. |
| SEG-05 | **Fallido en legado Flutter** | Sonda en ambos modos: reactivar tras guardar apagado cambia UUID con historial. PG-Mem recupera mismo recurso en servidor. Falta saldo cero con movimientos, reapertura y UI. |
| SEG-06 | **Fallido** | Sonda: command crea autogenerado vacío y apagar lo conserva; no hay descarte/tombstone aplicado. Falta lote atómico, balance/memoria ausentes y eventos conservados. |
| SEG-07 | **Bloqueado por SEG-06** | No existe descarte previo comprobado; pendiente UUID nuevo y no resurrección. |
| SEG-08 | **Pendiente** | Sin handler de descarte no se ha probado la elegibilidad frente a movimientos con suma cero. Implementar y probar conservación por historial. |
| SEG-09 | **Parcial** | PG-Mem conserva al pasar a receta y reutiliza; falta elegibilidad SQLite con recetas de otras variantes, incluso del mismo producto. |
| SEG-10 | **Parcial de esquema** | S-SQLite/PG-M1 acreditan FK/cascadas y vínculos inactivos en siembra. Falta descarte ejecutable bloqueado por referencia inactiva o memoria ajena. |
| SEG-11 | **Pendiente** | Helpers de consulta de capturas no tienen consumidor de descarte. Falta borrador capturado dependiente en evaluación transaccional y UI. |
| SEG-12 | **Pendiente** | Falta probar balance ausente y ambos saldos por separado contra el descarte real; ausencia no puede transformarse en cero. |
| SEG-13 | **Parcial del receptor** | PG-Venta acepta consumo histórico una vez tras desvincular. No se ejecutó A/B con dos SQLite clientes/UI ni entrega offline tardía real. |
| SEG-14 | **Parcial del receptor** | PG-Mem conserva recurso/balance al desvincular y rechaza descarte. Falta cliente A con saldo cero y B desconectada; ninguna verificación física. |
| SEG-15 | **Fallido en Flutter** | Sonda: backup sin memoria deja la fila añadida al restaurar. PG-Mem/PG-Prod ejercitan conflictos de servidor; falta memoria exacta, fuente/secuencia y cadenas cliente. |
| SEG-16 | **Parcial** | PG-Mem prueba eco de base vieja; Flutter no avanza metadata de memoria ni protege una posterior mediante ese store. Falta eco integrado/pending chain. |
| SEG-17 | **Parcial** | PG-Mem rechaza ocupación, inactividad, unidad incompatible y origen ajeno; resolver Flutter valida parcialmente. Falta vínculo actual/selección completa y revalidación UI al guardar. |
| SEG-18 | **Parcial** | Command contiene rechazo de inicial para recurso recuperado; C-Dart/TS cubren formas de alta. No se acreditó flujo UI recuperado → movimiento; suite de widgets de movimientos falla. |
| SEG-19 | **Parcial** | PG-Mem prueba receta → mismo directo. Suite-Flutter falla «edita seguimiento y receta…» por puertos; falta ciclo con memoria y UI. |
| SEG-20 | **Parcial; descarte pendiente** | PG-Mem/PG-Venta acreditan repetición de hechos del servidor. Falta idempotencia SQLite del descarte y error de recurso faltante sin prueba del mismo evento aplicado. |
| SEG-21 | **Pendiente** | Tabla/DAO de tombstone sin consumidor ni guarda en alta. No se realizó replay completo ni repetición de alta antigua después de un descarte. |
| SEG-22 | **Fallido para historia incompleta Flutter** | Sonda devuelve nuevo en ambos modos cuando debe pedir selección. PG-M2 informa evidencia insuficiente; pendiente selector explícito informado y validado. |
| SEG-23 | **Parcial de esquema/concurrencia** | PG-M1 admite origen no único; PG-Mem convierte carrera de producto en conflicto. Falta escenario de dos altas previas, hechos cobrados y ambigüedad en clientes. |
| SEG-24 | **Pendiente** | No existe descarte/memoria derivados para inyectar fallos al aplicar. Falta comprobar rollback de todo el lote, eventos y tombstone. |
| SEG-25 | **Verificado en receptor** | PG-Mem: «rechaza el descarte por push sin borrar nada ni distribuirlo», SyncService con PG real. No se lanzó instancia HTTP; recepción cliente externa sigue en fase 3. |
| SEG-26 | **No implementado / pendiente** | No se conectó UI de recuperación. Cancelación/doble toque/apagar-encender del nuevo flujo y commit único no se acreditaron; widgets de movimientos existentes fallan. |
| SEG-27 | **No implementado / pendiente** | Editor usa linkedInventoryItemId del formulario, sin cargar memoria durable ni selector. Falta guardar apagado/cerrar/reabrir con saldo e inicial correcta, unitario y medido. |
| SEG-28 | **Parcial** | S-SQLite prueba reapertura de archivo compatible con memoria/origen sembrados y rechazo protegido del antiguo. Guardas generales standalone/refs pasan en suite. Falta respaldo/restauración con descarte efectivamente aplicado, sus eventos y ausencia de red integrada. |
| SEG-29 | **Pendiente** | Hay endpoint GET /sync/pull y su test general pasa; handler Flutter no escribe memoria. No se hidrató terminal nueva por pull real, ni se validó repetición/identidad/saldo. No hay bootstrap de snapshot en SyncController. |
| SEG-30 | **Parcial, comportamiento histórico conservado** | PG-Mem prueba desactivación sin perder vínculo/memoria; Suite-Flutter pasa los seis casos de eliminación histórica none/inventory/recipe en ambos modos. Revalidar con el descarte ya implementado; hoy no tiene emisor. |

Relevo histórico: completar primero la fase 3 y la interfaz, después reemplazar cada
resultado parcial/pendiente/fallido por evidencia del criterio íntegro. La única
aprobación acotada aquí (SEG-25 en receptor) no cierra el flujo completo.

## Resultados actuales — corrección de fase 3, 2026-10-04

[[08 - Roadmap/Seguimiento de existencias/Evidencia/2026-10-04-correccion-fase3/Resultados|Corrección y verificación de fase 3, 2026-10-04]]. **La fase 3 satisface su criterio core/transporte. La aceptación global
sigue incompleta: fase 4 pendiente y fase 5 no iniciada.** Estas filas actualizan
el registro anterior solo con la evidencia mencionada, sin acreditar tablets,
interacción física ni UI. 43-SQLite = test permanente variant_tracking_phase3;
HTTP = test permanente variant_tracking_server, SyncController/SyncService/PG
reales y tres clientes SQLite headless. PG-M1/M2/Mem/Venta/Prod = los cinco specs
pertinentes reejecutados (44/0/0). Suite completa 1061/1/0; la búsqueda fallida
está probada preexistente en HEAD.

| ID | Resultado actual | Evidencia y límites |
|---|---|---|
| SEG-01 | **Verificado core ambos modos** | Alta vacía por comandos/handlers; memoria/origen/balance, descarte solo standalone. UI fuera de este resultado. |
| SEG-02 | **Verificado core ambos modos** | Inicial positiva única; off/on mantiene UUID, un balance y una inicial; 43-SQLite. |
| SEG-03 | **Verificado contratos y exclusión core** | Contratos compartidos Dart/TS; off de origen NULL conserva e informa motivo. |
| SEG-04 | **PG verificado; reconstrucción Flutter acotada** | PG-M1/M2 reejecutados; Flutter reconstruye cadena completa sin memoria/origen y siembra desde producto. Caso específico metadata Categorías permanece acreditado en PG. |
| SEG-05 | **Core verificado; UI pendiente** | Mismo UUID con movimientos y saldo cero en ambos modos; recuperación medida. Falta ciclo visible de fase 4. |
| SEG-06 | **Verificado SQLite** | Edición/descarte dentro de transacción exterior; cascadas y eventos conservados; resultado tras commit. |
| SEG-07 | **Core verificado; UI pendiente** | Alta posterior al descarte usa UUID nuevo; no resurrección por alta histórica. |
| SEG-08 | **Verificado SQLite** | Inicial + ajuste opuesto: saldo cero conserva recurso, balance y memoria. |
| SEG-09 | **Verificado SQLite** | Receta propia y receta de otra variante inactiva protegen; retorno a directo quita componentes propios. |
| SEG-10 | **Verificado SQLite/PG** | Vínculo inactivo y memoria ajena cuentan; FK/cascadas mantienen invariantes. |
| SEG-11 | **Core verificado; UI pendiente** | Borrador real sin event_refs protege; JSON inconsistente provoca rollback; evento operativo no aplicado protege. |
| SEG-12 | **Core verificado; presentación pendiente** | Balance faltante, on_hand y available por separado conservan; command devuelve motivo. Mostrar la incidencia corresponde a fase 4. |
| SEG-13 | **Verificado software HTTP A/B/C; físico/UI pendiente** | B cobra offline, A desvincula, B entrega por HTTP real con PG; duplicate no agrega consumo/pago; SQL 9/9, 1 consumo/venta/pago. |
| SEG-14 | **Core verificado; E2E UI pendiente** | SQLite server_sync vacío conserva y no emite descarte; PG conserva. A/B HTTP usa inicial 10; escenario A/B vacío con UI queda para fase 5. |
| SEG-15 | **Verificado core/conflictos HTTP** | Undo ausencia exacta, fuente/secuencia, cadenas inversas y pull oficial; B recibe conflicto de dos ediciones sin perder su cobro. |
| SEG-16 | **Verificado core SQLite/PG** | Push acredita fuente y snapshots; eco antiguo no sustituye memoria con fuente/recurso posteriores ni reduce secuencia. |
| SEG-17 | **Core verificado; UI pendiente** | Bloqueos por ocupado inactivo, inactividad, unidad, origen ajeno y balance faltante; no alta silenciosa. |
| SEG-18 | **Core verificado; UI pendiente** | Inicial capturada para recurso existente se rechaza sin eventos extra. Widgets previos de movimientos ya pasan; mensaje/entrada nueva de recuperación pendiente. |
| SEG-19 | **Core verificado; UI pendiente** | Directo-receta del mismo recurso-directo mantiene UUID y retira componentes de la variante. |
| SEG-20 | **Verificado handlers/transportes** | Repetición de descarte y alta histórica; otro descarte/adulteración/falta de prueba falla; venta HTTP duplicada no agrega delta. |
| SEG-21 | **Verificado replay SQLite; repetición final pendiente** | Reconstrucción vacía registra/aplica secuencialmente alta/producto/off/descarte y reproduce estado; no precarga tombstones. |
| SEG-22 | **Core verificado; selector UI pendiente** | Cadena incompleta pide selección; elección validada mantiene saldo. Dos orígenes plausibles con historia insuficiente requieren selección. |
| SEG-23 | **Core SQLite + PG verificado; E2E UI pendiente** | Dos altas de mismo origen y configuración oficial/optimista: gana oficial, memoria correcta, recursos y cobro perdedor conservados; PG prueba concurrencia. |
| SEG-24 | **Verificado rollback SQL** | RAISE(ABORT) real al insertar memoria y después de delete revierte edición/eventos/proyecciones/tombstone. |
| SEG-25 | **Verificado receptor PG y rechazo cliente** | 44-PG incluye push de descarte rechazado sin distribución; cliente rechaza lote remoto incluso como eco. No se acredita UI. |
| SEG-26 | **Pendiente fase 4** | Cancelación, doble toque e identidad en el formulario nuevo no implementados ni probados. |
| SEG-27 | **Pendiente fase 4** | Core entre guardados funciona; apertura/editor visible con saldo, selector e inicial correcta no implementados. |
| SEG-28 | **Verificado servicios/datos; sin prueba física** | Snapshot/restore reales con SHA/integridad y paths temporales; conserva memoria/origen/descarte/not_required/sin refs. Guardas generales standalone pasan; detección compatible/incompatible en suite. |
| SEG-29 | **Verificado pull HTTP real hasta SQLite** | C hidrata desde cero memoria/origen/saldo por GET /sync/pull; segundo pull sin cambios. No existe bootstrap snapshot. |
| SEG-30 | **Core histórico revalidado; UI pendiente** | Eliminación lógica standalone conserva recurso/memoria sin descarte; tests históricos de retirada/categorías y servidor pasan. No se cambia alcance de esos flujos. |
