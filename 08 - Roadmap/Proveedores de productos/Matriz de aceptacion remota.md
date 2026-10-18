---
tipo: matriz_aceptacion
estado: aceptacion_remota_satisfecha
revision_plan: 1
actualizado: 2026-10-08
---

# Matriz de aceptación remota · fase 7

Resultado: 1578 pruebas Flutter aprobadas sin omisiones, incluidos nueve casos
nuevos contra NestJS/PostgreSQL con HTTP/WebSocket reales y la regresión real
preexistente de seguimiento. NestJS: 507 pruebas PostgreSQL aprobadas, sin
omisiones. [Informe, comandos y límites](Verificacion%20remota%20-%20fase%207.md).
Terminales lógicas con SQLite y device_id independientes; ninguna prueba física.

| ID | Caso | Resultado | Prueba/evidencia |
|---|---|---|---|
| S01 | Catálogo y relaciones offline en server_sync | Aprobado | DI real sin conexiones al guardar; comandos/repositorios/SQLite; primer caso HTTP |
| S02 | Alta offline precede a producto y edición causal espera base | Aprobado | HTTP: alta offline, cadena causal, reinicio, ecos y terminal nueva |
| S03 | Nombre/notas no cambian precios ni alta causal | Aprobado | Primer caso HTTP; assert depends_on_event_id = alta original |
| S04 | Precios y retiro del último proveedor | Aprobado | Primer caso HTTP: precio/fecha y [] convergen en A/B/C |
| S05 | Confirmaciones propias no sobrescriben cambios posteriores | Aprobado | Ecos repetidos durante edición optimista; versión de proveedor 2 permanece |
| S06 | Reintento real sin duplicados | Aprobado | Push HTTP duplicate/original_sync_status=synced; replay de ecos; conteos existentes |
| S07 | Concurrencia por producto completo | Aprobado | HTTP: dos precios concurrentes y edición posterior; perdedores explícitos y restauración |
| S08 | Conflictos de proveedor | Aprobado | HTTP: ganador de catálogo y dos ediciones locales deshechas en orden inverso |
| S09 | Alta/base fallida bloquea dependientes | Aprobado | HTTP: alta inválida rechazada, producto/edición no enviados; base de producto rechazada |
| S10 | FK y cadenas inversas | Aprobado | HTTP: colisión de alta oficial y alta offline, producto/edición/alta retirados antes de FK RESTRICT |
| S11 | Producto, variantes, recetas, proveedores/precios restaurados juntos | Aprobado | HTTP: recetas, seguimiento, precios, fechas y venta sobreviven conflicto completo |
| S12 | Secuencias oficiales conservadas al restaurar | Aprobado | Regresión HTTP de seguimiento; rechazo de base compara versión y lastServerSequence |
| S13 | Precios/fechas de rango completo | Aprobado | HTTP mixto: quoted_price_minor/quoted_at_ms = 9007199254740991; cero y variantes independientes |
| S14 | Ventas, costos, saldos y movimientos conservados | Aprobado | HTTP mixto con venta transfer y receta/directo; snapshot antes/después; regresiones completas |
| S15 | No exigir entrega de dependencias retiradas de after | Aprobado | Contratos Dart/TS y PostgreSQL; command usa after, alta original histórica no condiciona retiro |
| S16 | Desconexión, reinicio con pendientes y recuperación | Aprobado | Primer caso HTTP: endpoint cerrado, pendientes/ref intactos, reapertura SQLite y entrega |
| S17 | WebSocket y reconexión existentes | Aprobado | HTTP/WebSocket real: sync:events_available y connectionEstablished; pull tras reconectar |
| S18 | Inicialización de otra terminal | Aprobado | Pull paginado desde cero en C; catálogo/conjuntos/versión/secuencia completos |
| S19 | Legacy: ausencia distinta de [] y promoción de base | Aprobado | HTTP legado y fixtures Dart/TS; replay con campo ausente y edición completa [] |
| S20 | Cliente legado no pierde conjunto conocido | Aprobado | HTTP legado: parser sintético retira campos y el servidor rechaza sin pérdida |
| S21 | Servidor previo no recibe nuevos datos | Aprobado, protección complementaria | HttpServer sintético sin capability: solo GET health, cero POST; no acredita integración NestJS |
| S22 | Actualización coordinada de clientes | Documentado como requisito operativo | Ambos contratos: todos los lectores actualizados antes de usar proveedores; pull no filtra por versión |
| S23 | Evento desconocido no avanza cursor ni deja página parcial | Aprobado | PostgreSQL sintético + pull HTTP real: fixture futuro se rechaza; finally limpia y reintento funciona |
| S24 | Fallo de handler conserva evento/proyección/checkpoint | Aprobado, protección complementaria | RemoteEventApplier + SQLite: rollback de página completa y reintento válido |
| S25 | Standalone intacto | Aprobado | Suite local/DI con HTTP/WebSocket bloqueados; applied/not_required, refs=0, pendientes=0 |
| S26 | Cambiar modo no importa ni promueve historial | Aprobado | Comandos rechazan bases/altas standalone; eventos not_required no cambian |
| S27 | Respaldo/restauración y regresiones locales | Aprobado | Suite Flutter completa conserva aceptación de fase 5 y respaldos sintéticos |
| S28 | Pruebas físicas | No ejecutado | Sin Android/iOS/tablet físico; no se atribuye la prueba lógica a un dispositivo |
| S29 | Despliegue/actualización real de clientes | No ejecutado | No se desplegó servidor ni se cambió una base/instalación del usuario |

Pruebas: [integración real](/Users/benjamin/Projects/POS/pos_flutter/test/integration/product_suppliers_server_test.dart),
[protecciones complementarias](/Users/benjamin/Projects/POS/pos_flutter/test/application/sync/product_suppliers_transport_safety_test.dart),
[regresión real de seguimiento](/Users/benjamin/Projects/POS/pos_flutter/test/integration/variant_tracking_server_test.dart).
Resultados exactos en [results-summary.json](Evidencia/2026-10-08-fase7/results-summary.json)
y [flutter-cases.json](Evidencia/2026-10-08-fase7/flutter-cases.json).
