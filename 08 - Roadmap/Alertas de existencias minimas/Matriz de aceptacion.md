---
tipo: matriz_aceptacion
estado: pendiente_verificacion_fisica
revision_plan: 1
actualizado: 2026-10-19
---

# Matriz de aceptación: alertas de existencias mínimas

Plan: [[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion|Revisión 1]].
Sesiones 1–5 ejecutadas el 2026-10-19. A01–A41 verificados en sus alcances
con evidencia individual; A42 parcial por falta de teléfono/tablet físico.
La sesión 5 añade restore integrado con informe/SQLite en disco en ambos modos
y recorrido manual de la app macOS aislada, incluidas dos reaperturas de proceso.
Flutter final: 2567 aprobadas, 23 de ellas HTTP reales, cero fallos/omisiones.
PostgreSQL/build/tests Nest de sesión 3 siguen vigentes por comparación SHA256;
no se repiten sin cambios. No hay cierre total mientras falte la prueba física.
Cada localizador remite al test, log y límite concreto en la evidencia de sesión 5.
La sesión 6 complementaria (2026-10-19, 09:48–09:49, America/Mexico_City)
confirma mediante Flutter/ADB/devicectl/xctrace/USB que no hay móvil físico
accesible. Las fuentes acreditadas siguen idénticas por SHA256; no se repiten
suites. A01–A41 conservan su estado; A42 sigue parcial con prueba física pendiente.

| Caso | Entrada o condición | Resultado esperado | Sesión | Estado | Evidencia concreta |
|---|---|---|---|---|---|
| A01 | Mínimo null y saldo positivo, cero o negativo | No genera aviso configurado | 2, 4 | Verificado dominio y widgets/SQLite: null sin aviso con saldo positivo, cero y negativo en ambos modos | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A01\|A01]] |
| A02 | Mínimo 5; saldos 6, 5 y 4 | Sin aviso, aviso y aviso respectivamente | 2, 4 | Verificado dominio y widgets/SQLite: sin aviso encima, aviso en igualdad y debajo; comparación compartida | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A02\|A02]] |
| A03 | Mínimo 0; saldos 1, 0 y -1 | Sin aviso, aviso y aviso respectivamente | 2, 4 | Verificado dominio y widgets/SQLite: captura 0 real, aviso en cero/negativo y sin aviso en positivo; vacío retira | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A03\|A03]] |
| A04 | Reposición o ajuste supera el mínimo | Desaparece el aviso y actualiza contador/filtro | 4 | Verificado widgets/SQLite: ajuste y recepción masiva actualizan balance; última fila del filtro desaparece y contador llega a cero | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A04\|A04]] |
| A05 | Venta confirmada deja saldo igual al mínimo | Aparece el aviso por el balance; no crea otro evento de alerta | 4, 5 | Verificado widgets/SQLite en ambos modos: venta confirmada lleva 7 a 6 con mínimo 6 y aparece el distintivo/contador; sin evento de alerta | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A05\|A05]] |
| A06 | Variante medida: mínimo 1.5 kg y saldo 1500/1501 átomos | Guarda 1500 y compara exactamente en átomos de masa | 1, 2, 4 | Verificado contrato/comando y UI con SQLite: 1,5 kg guarda 1500; saldos 1500/1501 exactos; venta en gramos conserva inventario kg | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A06\|A06]] |
| A07 | Negativo, fracción de pieza, precisión excesiva o desbordamiento | Rechazo sin escrituras; Dart y TypeScript equivalentes | 1, 2 | Verificado: contratos y comando rechazan sin alterar ninguna tabla SQLite en ambos modos | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A07\|A07]] |
| A08 | JSON string, booleano, fracción o número fuera de rango | Contratos rechazan sin coerción | 1, 3 | Verificado: contratos y receptor PostgreSQL/HTTP rechazan string, booleano, fracción y desbordamiento sin alterar catálogo; canónico aceptado intacto | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A08\|A08]] |
| A09 | Null, cero y máximo común en SQL | SQLite/PostgreSQL admiten; negativos y exceso de rango no | 1 | Verificado en SQLite y PostgreSQL reales | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A09\|A09]] |
| A10 | Snapshot legado sin campo | Round-trip conserva ausencia; creación aplica mínimo null | 1, 2, 3 | Verificado local y PostgreSQL/HTTP: alta legada guarda SQL null, conserva JSON ausente y conocimiento al hacer pull/replay | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A10\|A10]] |
| A11 | Snapshot actual con null/cero/positivo | Round-trip conserva presencia y valor | 1, 3 | Verificado en contratos, PostgreSQL/HTTP y dos clientes: presencia/valor null, cero, positivo, 1500 medido y máximo común; reentrega intacta | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A11\|A11]] |
| A12 | Campo declarado en solo parte de variantes o conocimiento distinto before/after | Contratos rechazan snapshot parcial/degradación | 1, 3 | Verificado en contratos y receptor PostgreSQL/HTTP: rechaza snapshot parcial, before/after mixtos y degradación; no elimina el campo para canonicalizar | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A12\|A12]] |
| A13 | Cliente actual edita una base realmente legada | Promoción explícita a mínimos conocidos null; demás campos y base exactos | 2, 3 | Verificado local y PostgreSQL/HTTP: promoción explícita completa y exacta; mantiene checks de evento, versión, secuencia y demás campos | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A13\|A13]] |
| A14 | Escritor legado edita base aún legada y mínimos null | Se acepta sin inventar mínimos ni convertir JSON a conocido | 2, 3 | Verificado local y PostgreSQL/HTTP: edición sobre base legada acepta y conserva omisión; intento actual rechazado no acredita conocimiento | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A14\|A14]] |
| A15 | Escritor legado edita o borra producto con base que ya declara mínimos | Rechazo claro que requiere app actualizada; valores conservados | 2, 3 | Verificado local y PostgreSQL/HTTP: edición/borrado legados sobre mínimo conocido (también null) exigen Actualiza la app; protección física con metadata legada activa/retirada | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A15\|A15]] |
| A16 | Cambiar solo el mínimo y luego repetir el mismo valor | Un producto_actualizado por el cambio; cero eventos por repetición | 2 | Verificado en ambos modos: un evento por cambio, cero por repetición y guardado idéntico | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A16\|A16]] |
| A17 | Promover conocimiento legado sin cambio de negocio | No emite evento solo por presencia del campo | 2 | Verificado: promoción a null sin negocio no escribe eventos ni undo ni cambia presencia persistida | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A17\|A17]] |
| A18 | Intenciones conservar, establecer 0/positivo y retirar | Tres operaciones inequívocas; null por defecto antiguo no borra | 2 | Verificado: conservar por defecto, establecer cero/positivo y establecer(null) para retirar | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A18\|A18]] |
| A19 | Alta sencilla/avanzada sin mínimo o con mínimo válido y seguimiento | Null por defecto; valor solicitado persiste con identidades actuales | 2, 4 | Verificado UI/SQLite en ambos modos: alta sencilla null; avanzada con mínimos 0/5, dos variantes/recursos con identidades propias | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A19\|A19]] |
| A20 | Editar barcode por formulario, escáner o lector físico | Conserva mínimo y las otras variantes | 2, 4 | Verificado core y UI: edición de barcode conserva mínimo/otras variantes; sobre legado no promueve conocimiento. Recorridos existentes de lector en regresión; sin prueba física nueva | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A20\|A20]] |
| A21 | CSV vigente: diez columnas solo altas; doce altas/actualización/variantes omitidas | Encabezados sin cambios; altas null y existentes conservados | 2 | Verificado: suite CSV ampliada con mínimo directo, variantes omitidas, legado/conocido y lotes; encabezados intactos | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A21\|A21]] |
| A22 | Edición comercial masiva de costo/venta/proveedor | Conserva mínimo, orden, recetas y demás parejas | 2 | Verificado: suite comercial ampliada con mínimo, recetas, orden y proveedores; legado conservado | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A22\|A22]] |
| A23 | Recepción masiva con entrada y/o campos comerciales | Conserva mínimo; entrada recalcula aviso por saldo; atomicidad vigente | 2, 4 | Verificado core y widgets/SQLite: recepción masiva real conserva mínimo y retira aviso al superar umbral; contador/filtro reactivos. Atomicidad/reapertura/backup en suites existentes | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A23\|A23]] |
| A24 | Cambiar mínimo durante una venta abierta | No cambia clave de consumo ni bloquea venta por esa configuración | 2, 5 | Verificado: cambiar solo mínimo conserva clave, saldo/movimientos; venta abierta confirma sin revisión de consumo | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A24\|A24]] |
| A25 | Desvincular seguimiento o pasar a receta y después recuperar vínculo compatible | Mínimo se conserva sin aviso intermedio; se evalúa al recuperar | 2, 4 | Verificado core y UI/SQLite: desactivar conserva mínimo dormido incluso con captura pendiente; Artículos lo precarga y recupera vínculo/aviso. Receta/recuperación compatible en core | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A25\|A25]] |
| A26 | Producto/variante retirados o recurso no disponible | Excluidos de aviso y contador; no pérdidas por filtrar presentación | 2, 4 | Verificado dominio y widgets/SQLite: recurso inactivo, variante retirada y producto inactivo salen del contador/aviso; recetas/sin vínculo excluidos; mínimos físicos conservados | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A26\|A26]] |
| A27 | Error después de proyectar, lote fallido o evento aplicado dos veces | Rollback completo o idempotencia; ningún saldo cambia por el mínimo | 2, 3 | Verificado local y remoto: PostgreSQL revierte evento/refs/catálogo tras fallo inyectado; reentregas HTTP idempotentes; inventario/ventas intactos al cambiar mínimo | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A27\|A27]] |
| A28 | Dos clientes editan el mismo producto, incluso variantes distintas | Base/versión/secuencia vigentes deciden conflicto; no sobrescritura silenciosa | 2, 3 | Verificado: concurrencia real PostgreSQL deja un aceptado y un conflicto; dos clientes HTTP con mínimo/otra variante y cadena pendiente restauran ganador por preflight | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A28\|A28]] |
| A29 | Rechazo, conflicto o borrado optimista rechazado | Snapshot/undo restaura mínimo y conocimiento exactos | 2, 3 | Verificado local y HTTP: rechazo real, conflictos y borrado optimista legado rechazado restauran valor/conocimiento desde undo, también tras reapertura en disco | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A29\|A29]] |
| A30 | Restauración tardía tras otro evento aceptado | No pisa estado posterior ni su mínimo | 2, 3 | Verificado local y HTTP: limpieza/restauración tardía tras resolución y sucesor aceptado no pisa mínimo ni estado posterior; reapertura incluida | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A30\|A30]] |
| A31 | Cambio local en standalone | not_required, refs declaradas/validadas pero no persistidas, cero actividad remota | 2, 5 | Verificado local: refs declaradas/validadas, cero filas refs y not_required; guardas de runtime/transporte en regresión | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A31\|A31]] |
| A32 | Cambio local server_sync | Refs/dependencias actuales, sin agregado ni referencia de alerta nuevos | 2, 3 | Verificado local y HTTP: refs/dependencias de producto existentes, cadenas pendientes y confirmaciones; sin agregado/referencia de alerta adicionales | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A32\|A32]] |
| A33 | Push y pull entre dos clientes actuales | Valor/presencia canónicos preservados y mismo aviso al converger saldos | 3 | Verificado PostgreSQL/HTTP: push/pull entre clientes actuales A/B, cliente C desde cero y comparación de versión/evento/secuencia, presencia/valor, saldos y condición de dominio | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A33\|A33]] |
| A34 | Reproducción ordenada de historia legada seguida de actual y reentrega duplicada | Misma proyección final; reentrega no borra mínimo | 2, 3 | Verificado local y PostgreSQL/HTTP: historia legada→actual, replay ordenado y reentrega duplicada conservan proyección, conocimiento y valor | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A34\|A34]] |
| A35 | Migración PostgreSQL sobre esquema previo con datos | Nueva columna null; IDs, eventos, balances y movimientos íntegros | 1 | Verificado en sesión 1 y regresión PostgreSQL de sesión 3: up, constraints, down y conservación íntegra en esquemas aislados | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A35\|A35]] |
| A36 | Arranque/restore con esquema SQLite anterior | Detector no lo acepta como actual; respeta política de reset/protección restaurada | 1, 5 | Verificado: detector, reset y protección de restore en SQLite temporal | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A36\|A36]] |
| A37 | Reapertura y respaldo/restore del esquema nuevo | Conserva mínimo y vuelve a derivar el mismo aviso, en ambos modos | 2, 5 | Verificado en ambos modos: reapertura, snapshot/restore, mínimo medido/null/ausencia legada y undo; informe/contador/filtro tras restore y segunda reapertura idénticos. Manual macOS con proceso cerrado/reabierto | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A37\|A37]] |
| A38 | Editor compartido abierto desde Artículos e informe | Precarga mínimo/unidad correctos, vacío desactiva y 0 es válido | 4 | Verificado widgets/SQLite en ambos accesos y modos: precarga, unidad visible, teclado/precisión, cero/vacío; kg con venta en gramos. Tamaños 320/1024 y texto x2; físico pendiente | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A38\|A38]] |
| A39 | Cancelar edición del mínimo o guardar después de base obsoleta | Cancelación sin cambios; base obsoleta rechazada sin reemplazo automático | 4 | Verificado widgets/SQLite en ambos modos: cancelar variante/artículo no escribe mínimo; base obsoleta se informa y dos reintentos mantienen la misma base/captura. Movimiento independiente permanece | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A39\|A39]] |
| A40 | Filtro Todas/Existencias bajas, sin coincidencias y cambio observable | Filas y contador coinciden; vacío específico; navegación sigue funcionando | 4 | Verificado widgets/SQLite: Todas/Existencias bajas, contador coherente, vacío específico al reponer última fila y navegación de tarjeta/informe/editor conservada | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A40\|A40]] |
| A41 | Consultar/reconstruir la vista de avisos varias veces | Cero eventos/escrituras; sin temporizadores, red ni sumas de movimientos por fila | 2, 4 | Verificado widgets/SQLite: consultar, alternar filtros y guardar sin cambios no modifica foto de tablas; legado conserva ausencia. Stream existente y política pura, sin temporizadores/red/consultas por fila | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A41\|A41]] |
| A42 | Regresión funcional y prueba física | Checks reales documentados; físico pendiente si no hay dispositivo, sin declararlo aprobado | 5, 6 | Parcial; físico pendiente: regresión de sesión 5 conservada por hashes. Sesión 6 no detecta móvil físico; sin instalación ni recorrido. Faltan metadatos, aislamiento y captura/teclado/precisión, texto grande/scroll/navegación, venta/reposición/edición/vacío/reapertura en piezas/kg, contador/filtros/cancelación/offline físicos | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A42\|Regresión]]; [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion6/README#A42\|Físico y pendientes de sesión 6]] |

Registrar evidencia por caso o grupo: archivo de prueba, comando y resultado.
Usar «parcial» cuando solo se acredita widget, almacenamiento o receptor;
una prueba con mocks no acredita PostgreSQL ni dos clientes sobre HTTP.

## Evidencia de sesión 1 — 2026-10-19

Archivos, comandos completos, hashes y límites:
[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion1/README|Registro de ejecución]].

| Alcance | Evidencia real | Resultado |
|---|---|---|
| A06–A15, solo contrato/comparación y codec existente | Flutter `test/application/sync/minimum_stock_contract_test.dart`; Nest `src/sync/payloads/minimum-stock-contract.spec.ts`; fixtures JSON idénticos en ambos repositorios | Ausencia/null/cero/positivo/medido/máximo, inválidos, parcial, degradación, borrado y proveedores; sin acreditar comando/receptor | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A06–A15, solo contrato/comparación y codec existente|A06–A15, solo contrato/comparación y codec existente]] |
| A09/A36 y parte de A37 | Flutter `test/data/local/drift/minimum_stock_schema_test.dart` | SQL real, copias/JSON Drift, reset de desarrollo, restaurado incompatible intacto, rechazo previo al reemplazo, reapertura/snapshot/restore de la columna | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A09/A36 y parte de A37|A09/A36 y parte de A37]] |
| A09/A35 | Nest `src/migrations/1792368000000-AddVariantMinimumStock.postgres.spec.ts` | Entidades reales; esquema previo con productos/variantes/recursos/balances/movimientos/eventos, mínimo nuevo null, conservación literal, runMigrations/up repetido/down y rangos | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A09/A35|A09/A35]] |
| Generación y análisis | `dart run build_runner build`; `dart analyze`; `npm run build` | Aprobados; schemaVersion sigue en 8 y no hay onUpgrade nuevo |
| Focalizadas Flutter | `flutter test test/application/sync/minimum_stock_contract_test.dart test/data/local/drift/minimum_stock_schema_test.dart` | 57 aprobadas, cero fallos/omisiones |
| Regresión Flutter | `flutter test` | 2492 aprobadas; 16 integraciones HTTP omitidas por falta de POS_BULK_SYNC_URL, POS_SUPPLIER_SYNC_URL y POS_PHASE3_SYNC_URL; no se cuentan como aprobadas |
| Regresión Nest con PostgreSQL temporal | `RUN_POSTGRES_INTEGRATION=1 ... npm test -- --runInBand` | 50 suites / 567 pruebas aprobadas; cero fallos/omisiones |

`sameState` considera equivalentes ausencia y null del mínimo en negocio;
`sameEditingBase` valida por separado presencia y admite solo promoción a null.
La compatibilidad de proveedores se conserva independiente. No se modificaron
checks de evento/versión/secuencia. El rechazo claro «actualiza la app», la
reconstrucción del conocimiento desde eventos base y su persistencia aún deben
integrarse en sesiones 2–3. A13–A15 no se declaran completos por pasar el parser.

PostgreSQL fue una instancia nativa temporal propia, no la conexión del .env.
No hubo migración operativa, despliegue ni captura pública. Ninguna prueba
manual o física se contabiliza. Los archivos ajenos de editor/informe conservan
sus hashes iniciales; ver manifest.json. El siguiente paso es sesión 2.

## Evidencia de sesión 2 — 2026-10-19

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion2/README|Archivos, comandos, resultados y límites]].

- `test/application/commands/articulos/minimum_stock_local_test.dart`: 25 casos
  sobre arneses existentes, SQLite real y ambos modos. Cubre intenciones,
  validación exacta, no-op, modo/refs, venta abierta, barcode, seguimiento/receta,
  conflicto entre variantes, fallo inyectado, replay, undo y reapertura en disco.
- `actualizar_articulo_csv_test.dart`, `editar_articulo_comercial_test.dart` y
  `test/support/recepcion_masiva_fixture.dart`: fixtures extendidos con mínimos
  reales; verificaciones existentes de copia completa, rollback, undo y modos.
- `recepcion_reapertura_test.dart`: reapertura, crash antes/después de commit y
  snapshot/restore completos con mínimos creados por comandos, en ambos modos.
- La restauración se corrigió para escribir null explícito con
  `toCompanion(false)`; conserva last_event_id de base y no pisa un sucesor.
- No cambió ninguna tabla ni schemaVersion; no se ejecutó build_runner.
  NestJS/receptor y captura pública siguen fuera de esta sesión.

`dart analyze` sin incidencias. Regresión final: 2517 aprobadas, cero fallos y
16 integraciones HTTP omitidas por URLs ausentes; no se cuentan aprobadas.
Focalizadas: 110 aprobadas; compatibilidad: 79 y 92 aprobadas. El registro detalla
las corridas intermedias corregidas. Las pruebas locales no acreditan despliegue,
dos clientes actuales por HTTP ni hardware.

## Evidencia de sesión 3 — 2026-10-19

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion3/README|Archivos, comandos, URLs, resultados y límites]].

- Nest `ProductoEventHandler`: persistencia/reconstrucción del mínimo desde la
  base aceptada vigente, protección de valores físicos activos/retirados,
  rechazo legado claro y canonicalización que conserva presencia/valor.
- `product-suppliers.postgres.spec.ts`: veinte casos nuevos reutilizan el arnés
  PostgreSQL/SyncService real. Incluyen compatibilidad, falsificación de base,
  rangos, retiro/alta/borrado de variantes, rollback y concurrencia real.
- Flutter `minimum_stock_server_test.dart`: siete recorridos sobre los arneses
  existentes, HTTP real, dos clientes actuales y replay a cliente vacío, SQLite
  en disco, pendientes, rechazo, conflictos, nueva edición y undo tardío.
- Se comparan en PostgreSQL recursos, balances, movimientos, ventas, líneas y
  pagos no vacíos antes/después de cambiar solo mínimo. La clave de consumo
  permanece igual y una venta abierta confirma después del cambio.
- Cada suite HTTP usa su propia URL/schema y las cuatro variables URL quedan
  habilitadas; los schemas PostgreSQL usados por proveedores/recepción/mínimos
  también se configuran. No se contabilizan mocks ni skips como aceptación remota.
- Build Nest aprobado: 50 suites/587 pruebas con PostgreSQL. Analyze limpio y
  Flutter 2540 aprobadas (23 HTTP), cero fallos/omisiones. No se habilitó captura
  pública, endpoint, cron ni mensaje WebSocket de alertas.

Receptor/esquema compatibles deben desplegarse antes de habilitar escritores
nuevos. Esta sesión no despliega ni migra bases operativas. Siguiente: sesión 4;
verificación manual/física y cierre global permanecen en sesión 5.

## Evidencia de sesión 4 — 2026-10-19

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion4/README|Archivos, comandos, resultados, incidencias y límites]].

| Casos | Prueba real | Alcance acreditado |
|---|---|---|
| A01–A03, A18–A20, A38 | `minimum_stock_ui_test.dart`: precarga/cero/vacío, alta sencilla/avanzada y kg con venta en gramos | Widgets → formulario/comando → evento/proyección → SQLite, ambos modos; precisión y unidad de inventario | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A01–A03, A18–A20, A38|A01–A03, A18–A20, A38]] |
| A02/A04/A05/A23/A40 | Misma suite: venta confirmada, ajuste y recepción masiva | Aviso por igualdad/debajo; reposición supera umbral y quita última fila; contador/tarjeta/vacío y Todas coherentes | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A02/A04/A05/A23/A40|A02/A04/A05/A23/A40]] |
| A25/A26 | Misma suite: mínimo dormido recuperado en Artículos y exclusión de inactivos | Valor guardado conserva al ocultar/desactivar incluso con captura pendiente; recurso/vínculo/receta y catálogo filtran presentación | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A25/A26|A25/A26]] |
| A38/A39 | Misma suite: cancelar/reintentar en informe y Artículos, y movimiento independiente | Foto de todas las tablas intacta al cancelar/fallar; dos intentos mantienen la base original; movimiento ya guardado no se revierte | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A38/A39|A38/A39]] |
| A14/A20/A41 | Misma suite: creación legada, lectura/filtros/no-op y barcode | Omisión preservada en before/after/evento; consulta sin escrituras ni promoción por campo sin editar | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A14/A20/A41|A14/A20/A41]] |
| A38/A40, diseño | Misma suite, 320×740 y 1024×768, texto x2; `reports_screen_test.dart` | Lista/editor accesibles sin desbordamiento; calendario desplazable y navegable; no equivale a prueba física | [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos#A38/A40, diseño|A38/A40, diseño]] |

25 nuevas aprobadas en SQLite real aislada con los arneses existentes; 85 de
regresión inicial editor/informe y 6 de calendario final. `dart analyze` limpio.
Regresión definitiva: 2542 aprobadas, cero fallos y 23 HTTP omitidas por URLs
ausentes (`flutter-completo-final.log`), que no se cuentan aprobadas.
No se repite ni se inventa aceptación remota: el respaldo HTTP/PostgreSQL es de
sesión 3. A42 y el cierre global permanecen pendientes de sesión 5.

## Evidencia de sesión 5 — 2026-10-19

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|Registro final]],
[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos|Evidencia individual A01–A42]] y
[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Manual|Recorrido manual y lecturas SQLite]].

Dos pruebas nuevas de restore integrado pasan en standalone y server_sync:
escritura desde informe, cierre/reapertura, snapshot, retirada, restore real,
protección restaurada, ausencia legada/null conocido, undo, aviso/contador/filtro,
segunda reapertura y foto literal de todas las tablas. Se conservan los tests de
esquema anterior y rechazo previo al reemplazo. No cambió código funcional.

La regresión final incluye CSV diez/doce columnas, masiva/recepción, legado,
rechazo/conflicto/undo, reentregas y restauraciones tardías. Las cuatro URLs/schemas
HTTP propios se habilitaron; 2567 aprobadas, cero fallos y cero omisiones.
Analyze sin incidencias; build macOS de main de producción aprobado. Nest no cambió:
se conservan build/50 suites/587 de sesión 3 mediante hashes verificables.

Manual en app completa macOS con directorios temporales: mínimo cinco en piezas/kg,
venta confirmada 6→5, ambos avisos, reposición 5→6, retirada/contador cero/vacío,
edición a 6 pza/6.001 kg, reapertura con avisos, retirada explícita y nueva reapertura
con Sin mínimo. Las ediciones dejan balances/movimientos/ventas/líneas/pagos idénticos.
Este recorrido no acredita teclado ni navegación de hardware móvil. A42 parcial;
único paso de aceptación pendiente: prueba física descrita en el registro final.

## Evidencia de sesión 6 complementaria — 2026-10-19

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion6/README|Registro de detección, pasos pendientes y preservación]].

Cinco enumeraciones reales con exit 0: ningún teléfono/tablet físico accesible.
El iPhone conectado en CoreDevice tiene `reality=simulated` y Flutter lo marca
`emulator=true`; ADB está vacío. No se ejecuta la prueba sobre simulador/macOS
como sustituto. Modelo/SO/versión instalada/idioma/teclado/escala físicos y el
recorrido completo quedan pendientes. Sin código funcional nuevo, sin suites
repetidas y sin instalaciones, bases operativas, commit, push o despliegue.
Los checks de sesión 5 siguen siendo evidencia histórica vigente por hashes;
no son resultados ejecutados nuevamente en sesión 6. No hay cierre total.
