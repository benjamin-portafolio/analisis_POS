---
tipo: estado_implementacion
estado: pendiente_verificacion_fisica
revision_plan: 1
actualizado: 2026-10-19
---

# Estado y continuidad: alertas de existencias mínimas

## Estado actual

Sesiones 1–4 completadas; sesión 5 verifica A01–A41 y deja A42 parcial únicamente
por falta de teléfono/tablet físico. La sesión 6 complementaria vuelve a comprobar
hardware el 2026-10-19, 09:48–09:49 (America/Mexico_City): ningún móvil físico
accesible por Flutter, ADB o herramientas Apple. A42 sigue parcial, con la prueba
física pendiente; no se ejecutó el recorrido en simulador como sustituto.
Contratos, esquemas, conservación, core,
editor/informe y sincronización están implementados y acreditados. No hay cierre
total ni despliegue. Los cambios previos sin commit se conservan.

Flutter final: dart analyze sin incidencias, 2567 pruebas aprobadas, incluidas
las 23 HTTP sobre cuatro URLs/schemas propios; cero fallos/omisiones. Build macOS
del main de producción aprobado. Nest no cambia: sus hashes coinciden con las
sesiones 1/3 y conservan build/50 suites/587 pruebas PostgreSQL aprobadas.

La prueba nueva integra edición desde informe, SQLite en disco, snapshot/restore,
protección de base restaurada y aviso/contador/filtro en ambos modos; conserva
mínimo medido, null conocido, ausencia legada, refs/entrega y undo. Manual en app
completa macOS aislada: 6→5 por venta, aviso con mínimo cinco, 5→6 por reposición,
retirada, edición desde informe, vacío y reapertura. Se repite con kg y captura
decimal exacta. Ver [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|Comandos, resultados y límites]] y [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos|A01–A42]].

Lecturas:

- [[08 - Roadmap/Alertas de existencias minimas/Plan de implementacion|Plan completo]].
- [[08 - Roadmap/Alertas de existencias minimas/Matriz de aceptacion|Matriz actualizada por alcance]].
- [[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion1/README|Archivos, comandos, resultados, incidencias y hashes de sesión 1]].

## Sesiones

| Sesión | Estado | Evidencia |
|---|---|---|
| 1. Contratos y esquemas | Completada en su alcance | 57 focalizadas Flutter; 2492 regresión Flutter (16 HTTP omitidas); 50 suites/567 Nest con PostgreSQL, cero omisiones Nest |
| 2. Persistencia local y conservación | Completada en su alcance local | 25 casos nuevos; analyze limpio; 2517 regresión Flutter aprobadas, 16 HTTP omitidas; ver evidencia |
| 3. Servidor y sincronización | Completada en su alcance | Nest build/50 suites/587 aprobadas; analyze limpio; Flutter 2540 aprobadas (23 HTTP), cero omisiones; evidencia de sesión 3 |
| 4. Editor e informe | Completada en su alcance automatizado | 25 nuevas widgets/SQLite; analyze limpio; 2542 aprobadas, cero fallos, 23 HTTP omitidas; evidencia |
| 5. Verificación y cierre | Parcial: pendiente físico A42 | Restore integrado ambos modos; manual macOS; analyze limpio/build; 2567 Flutter incluidas 23 HTTP sin omisiones; Nest conservado por hashes |
| 6. Verificación física complementaria | Pendiente de hardware; A42 no cerrado | Detección Flutter/ADB/devicectl/xctrace/USB sin móvil físico; fuentes previas idénticas por SHA256; sin instalación ni cambios funcionales; ver evidencia de sesión 6 |

## Resultado técnico y límites de sesión 1

- SQLite y PostgreSQL reales admiten null, cero y máximo común y rechazan
  negativos, fracciones no enteras y exceso de rango. SQLite exige tipo integer.
- Dart usa minimumStockAtomic y knowsMinimumStock; TypeScript usa campo opcional
  minimumStockAtomic (undefined legado/null conocido). Constructores anteriores
  conservan desconocimiento; null por defecto no expresa intención de borrar.
- withKnownMinimumStock promueve legado a null conocido sin cambiar proveedores,
  recetas ni dependencias. withKnownSuppliers conserva mínimo/presencia.
- sameState compara valores y equipara ausencia/null en negocio. sameEditingBase
  valida presencia aparte, rechaza legacy sobre base conocida y permite solo
  promoción exacta desde legado a null. Proveedores siguen su política original.
- No se cambiaron los checks existentes de evento, versión o secuencia. Falta
  integrar el recorrido al cerrar sesión 1. La sesión 2 completa reconstrucción
  local y mensaje; receptor continúa pendiente (A13–A15 locales verificados).
- Los fixtures idénticos incluyen 15 creaciones, 9 ediciones y 19 comparaciones.
  Se valida valor entero seguro; 1.0 y 1 son equivalentes entre runtimes.
- schemaVersion sigue en 8 y no hay onUpgrade nuevo. Se prueba reset de una base
  local sin columna y protección con hash intacto de una restaurada incompatible,
  además de rechazo antes del reemplazo y backup/restore directo del campo.
- Migración 1792368000000: columna null sin default para variantes anteriores,
  conservación literal de IDs/eventos/recursos/saldos/movimientos y up repetido.
  Down rechaza mínimos no nulos (incluido cero); con todos null revierte sin
  afectar datos previos. AppModule registra la clase y migrationsRun=false,
  conservando synchronize=true de desarrollo. No hubo migración operativa.

## Verificación de sesión 1 (histórica)

`dart run build_runner build`, `dart analyze`, `npm run build`, Prettier de los
archivos TypeScript y git diff --check aprobados. Flutter focalizado: 57/57.
`flutter test`: 2492 aprobadas, cero fallos y 16 integraciones HTTP omitidas por
falta de POS_BULK_SYNC_URL, POS_SUPPLIER_SYNC_URL y POS_PHASE3_SYNC_URL; no se
cuentan como aprobadas. Nest con RUN_POSTGRES_INTEGRATION=1: 50 suites / 567
pruebas aprobadas, cero fallos/omisiones.

Comandos completos y resultados intermedios corregidos están en la evidencia.
PostgreSQL 18.4 se inició en un cluster temporal propio (127.0.0.1:57079), sin
cargar .env ni conectar a datos del usuario, y se detuvo/eliminó al terminar.
SQLite usó memoria y archivos temporales. No hay verificación del nuevo mínimo
sobre HTTP, dos clientes ni dispositivo físico. No hubo commit, push o despliegue.

## Árboles y archivos

Flutter HEAD sigue en 3e8e1ed y NestJS en dcc2907; no se hicieron commits.
El manifest de evidencia contiene los HEAD completos y SHA256 de los archivos.

Flutter modificó únicamente contratos de producto creado/actualizado, tabla de
variantes, detector y app_database.g.dart; añadió fixtures/pruebas de contratos y
esquema y documentación técnica (incluido enlace en la guía offline).
NestJS modificó esos dos contratos, entidad de variante y AppModule; añadió
migración/prueba PostgreSQL, prueba de contrato, fixtures y documentación.
Las rutas exactas están en el registro de evidencia y manifest.json.

Los 15 archivos ajenos de Flutter conservan su hash inicial, incluidos
variant_editor_screen.dart, inventory_management_screen.dart, reports_screen.dart,
articulo_form_command.dart y los archivos/pruebas aún no versionados del informe
de existencias. No restaurarlos desde HEAD ni duplicar el informe. También se
conservaron los cambios previos del vault en mapa, CSV y edición masiva/recepción.
Revisar Git y AGENTS de nuevo al retomar; los cambios de esta sesión no están
committeados y forman parte de la base de trabajo de sesión 2.

## Reglas que debe conservar la implementación

1. Null desactiva; cero es válido. Aviso derivado: saldo físico <= mínimo.
2. Átomos exactos del recurso; sin floats, unidad independiente ni cambios a
   movimientos, precios o clave de consumo por configurar el umbral.
3. Evaluar solo producto/variante activos con seguimiento directo vigente;
   desvincular conserva mínimo dormido y recetas no calculan producción.
4. Reutilizar producto_creado/producto_actualizado, editor e informe existentes.
5. Campo ausente legado y null explícito son distintos. Una base conocida debe
   rechazar escritor legado incluso para borrar; no prometer edición antigua.
6. CSV y edición masiva conservan valor/presencia sin nueva captura o columnas.
7. Conservar rollback, undo, base confirmada, idempotencia y concurrencia por producto.
8. Refs declaradas/validadas en ambos modos; solo server_sync las persiste.
   Standalone mantiene not_required y cero tareas remotas, sin promover historia.
9. Reset local de desarrollo/version fija; migraciones PostgreSQL y pruebas
   únicamente aisladas en esta etapa.

## Resultado y verificación de sesión 2

Registro con archivos y comandos completos:
[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion2/README|Evidencia de persistencia local]].

- `minimumStock` usa el tipo existente `CambioExplicito<String?>`: conservar por
  defecto, establecer cantidad con codec en unidad de inventario, establecer
  null para retirar. Cambiarlo exige seguimiento directo válido; conservar
  mantiene el mínimo dormido al desvincular o pasar a receta.
- Las altas actuales declaran null/valor en todas las variantes. Ediciones de
  historia legada conservan ausencia salvo intención explícita. Una promoción
  sin cambio de negocio no genera evento, undo ni escritura de presencia.
- La base vigente acredita conocimiento mediante helpers del contrato. Se
  protegen también valores físicos con metadata legada y variantes retiradas.
  Las lecturas observables unen el evento base sin consultas por fila.
- Snapshots, DTOs, comandos acotados, undo y restauración conservan valores.
  `toCompanion(false)` evita que un null de respaldo sea omitido por Drift.
  La guarda de last_event_id protege frente a restauraciones tardías.
- Ref/entrega por modo intactas; no hay actividad remota nueva ni promoción
  implícita de historial standalone. Sin tablas ni build_runner en sesión 2.
- Se ampliaron arneses/pruebas existentes, sin crear otro arnés de sync. SQLite
  temporal acredita fallo tras proyección, duplicados, conflictos, undo,
  restauración tardía y reapertura en ambos modos; recepción acredita backup real.
- Los archivos ajenos de editor/informe y el esquema/fixtures de sesión 1 se
  conservaron. Se añadió un helper de conocimiento al contrato actualizado y
  se extendió su documentación; no se rehizo el contrato ni se modificó backend.

`dart analyze`: sin incidencias. `flutter test --reporter expanded`: 2517
aprobadas, cero fallos y 16 omisiones HTTP por falta de URLs de prueba.
Focalizadas: 110 aprobadas; regresiones de compatibilidad: 79 y 92 aprobadas.
Las corridas intermedias corregidas están en la evidencia. La aceptación remota que simulan algunos
casos locales solo prueba la guarda de restauración; no acredita HTTP.

## Resultado y verificación de sesión 3

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion3/README|Registro de ejecución, comandos, variables, hashes y límites]].

- Nest `src/sync/producto-event.handler.ts`: reconstrucción del snapshot con el
  mínimo; consulta solo el evento aceptado señalado por la base vigente. SQL
  null no inventa conocimiento y un intento rechazado no promueve historia.
  Un valor físico no null, también de variantes retiradas, bloquea escritores
  legados. Before actual debe coincidir con cualquier valor físico existente.
- Alta/edición persisten bigint/null; retiro y borrado lógico conservan umbral.
  Payload canónico/pull preservan presencia/valor, sin borrar campos para aceptar
  snapshots parciales. La deduplicación compartida con proveedores ahora incluye
  también eventos que declaran mínimos sin proveedores; mismo ID y otro contenido
  se rechaza. No se relajaron evento, versión, secuencia ni proveedores.
- `product-suppliers.postgres.spec.ts` incorpora veinte casos sobre arnés real,
  incluido fallo transaccional y dos pushes concurrentes con un solo ganador.
  Regresión Nest: build correcto, 50 suites/587 pruebas, cero omisiones.
- Flutter solo añade pruebas HTTP y actualiza documentación. Se conservan todos
  los contratos, esquemas, código funcional y archivos ajenos de sesiones 1–2.
  Los siete recorridos usan ProductSupplierHarness/VariantTrackingHarness,
  transporte real y SQLite en disco; no hay nuevo arnés de sincronización.
- Se verifica rechazo y rollback de cadenas, borrado optimista rechazado,
  reporte de conflictos y nueva edición sobre la base oficial, reapertura,
  reentregas/eco/replay y protección frente a restauración tardía.
- SQL real compara recursos, balances, movimientos, ventas/líneas/pagos antes y
  después del cambio de mínimo. Se conserva clave de consumo y una venta abierta
  confirma usando el saldo vigente. Standalone conserva las guardas existentes:
  not_required, cero refs persistidos y sin actividad remota.
- Las cuatro suites HTTP tienen URL/schema propios. Se habilitan las tres URLs
  históricas y POS_MINIMUM_SYNC_URL, con sus variables de schema y DATABASE_*.
  Flutter final: analyze limpio y 2540 pruebas aprobadas, incluidas 23 HTTP,
  cero fallos/omisiones. Incidencias intermedias corregidas en el registro.

## Resultado y verificación de sesión 4

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion4/README|Archivos, comandos, resultados, hashes y límites]].

- `articulo_form_result.dart` separa el valor atómico precargado de la intención
  `minimumStock: CambioExplicito<String?>`, conservar por defecto en ambos
  constructores. `articulo_preview_form.dart` carga incluso mínimos dormidos;
  `copyWith` y `articulo_form_command.dart` preservan/transmiten la intención.
- `variant_editor_screen.dart` captura Existencia mínima con unidad siempre
  visible, teclado/precisión de inventario y codec exacto. Campo sin editar
  conserva, cero establece y vacío explícito retira. Reabrir el borrador retiene
  su intención; desactivar seguimiento/activar receta conserva el mínimo guardado.
- `article_form_screen.dart` detecta cambios solo del mínimo y mantiene intención
  al reconstruir el modo sencillo. Para variantes existentes usa su unidad de
  inventario, aunque la venta sea en gramos; `inventory_management_screen.dart`
  incluye unidades de los recursos cargados. Base obsoleta muestra el error sin
  refrescar automáticamente la base. El coordinador de edición del informe
  existente se conserva íntegro, con su base fija y todas las otras variantes.
- `RemainingStockItem.isLow` reutiliza MinimumStockPolicy. Informe y tarjeta
  comparten esa evaluación: mínimo/unidad, distintivo, Todas/Existencias bajas,
  contador y vacío específico. Se observa catálogo con balances, sin nuevo flujo,
  temporizadores, red, eventos de alerta ni consultas/sumas por fila.
- `minimum_stock_ui_test.dart`: 25 pruebas, un caso de intenciones y doce
  recorridos por modo con widgets y SQLite real. Ventas confirmadas, ajustes y
  recepción masiva actualizan aviso/contador/filtro; reponer la última fila deja
  el vacío específico. Cero/null/medidos, altas, cancelación, base obsoleta,
  barcode legado, mínimo dormido y movimiento independiente están cubiertos.
- `reports_screen_test.dart` asegura que el calendario esté visible antes de
  tocarlo en teléfono con texto x2: la segunda línea de la tarjeta lo desplaza.
  Se conserva el orden/navegación de la pantalla; no se debilita la prueba del
  calendario. Documentación Flutter y notas canónicas actualizadas.
- Se preservan contratos, tablas/generado Drift, comandos/core, receptor, fixtures
  y pruebas anteriores salvo ese ajuste de visibilidad. No se ejecutó build_runner
  porque no hubo cambios Drift. No se amplía CSV ni captura masiva.

`dart analyze`: sin incidencias (`dart-analyze-definitivo.log`). Focalizada nueva:
25 aprobadas; regresión inicial editor/informe: 85 aprobadas; calendario final:
6 aprobadas. `flutter test --reporter expanded` definitivo: exit 0, 2542 aprobadas,
cero fallos y 23 integraciones HTTP omitidas por URLs ausentes, que no cuentan
aprobadas (`flutter-completo-final.log`).
La corrida completa inicial detectó un único fallo de toque fuera de pantalla
(2541 aprobadas/23 omitidas/1 fallo); se corrigió la visibilidad del calendario y
se repitió la suite completa. Incidencias de fixtures/lint intermedias documentadas.

No se abre una base operativa: SQLite aislada en memoria y arneses existentes.
Los tamaños 320/1024 y texto x2 acreditan widgets de escritorio; no prueban teclado,
scroll o dispositivo físico. No hubo commit, push, despliegue ni migración.

## Resultado y verificación de sesión 5

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/README|Registro completo]],
[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Casos|Localizador por caso]] y
[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion5/Manual|Manual]].

No hubo fallo funcional nuevo atribuible a mínimos ni cambio de código productivo.
Se añadió `minimum_stock_restore_test.dart`: dos recorridos reales de disco y
restore con el informe. La primera corrida tuvo una espera virtual insuficiente
para SQLite en disco; se corrigió la espera del test, sin relajar sus aserciones.
Focalizada final 2/2 y regresión 2567/2567, cero skips. Se reforzaron después las
aserciones de mínimo/presencia en CSV y edición comercial: ambas suites afectadas
aprueban 68 pruebas y analyze definitivo sigue limpio; no cambió código productivo. No hubo build_runner porque
no cambiaron tablas/generado. Backend sin cambios: no se repiten sus checks ya
acreditados. Cuatro servidores/schemas y cluster HTTP de sesión 5 cerrados/retirados.

Los cambios de mínimo posteriores a la reposición conservan literalmente
balances, movimientos, ventas, líneas, pagos y clave de consumo. El proceso de
la app se cierra/reabre con umbrales configurados y otra vez con null explícitos.
El entrypoint temporal solo cambia rutas/semilla; la navegación, venta, editor y
movimientos son la app de producción. Se archiva la semilla y la SQLite de prueba,
se retira el entrypoint de Flutter y se reconstruye el main normal sin ejecutarlo.

## Resultado y verificación de sesión 6

[[08 - Roadmap/Alertas de existencias minimas/Evidencia/2026-10-19-sesion6/README|Detección, A42, pasos pendientes y preservación]].

Los cinco comandos de detección terminan con exit 0. Flutter muestra iPhone 17
con `emulator=true`, macOS y Chrome; ADB no lista dispositivos, ni siquiera
`unauthorized`/`offline`. `devicectl` solo registra cuatro simuladores
(`reality=simulated`), `xctrace` solo el Mac en Devices y móviles en Simulators;
USB no devuelve entradas. No hay teléfono/tablet físico accesible en esta sesión.

Modelo/SO, versión instalada, idioma/teclado y escala de texto físicos no se
pueden registrar. `pubspec.yaml` declara `0.1.0+1`; no acredita una instalación.
No se instala ni abre la app, no se crea una base de prueba y no se accede a datos
operativos. A42 conserva la regresión acreditada en sesión 5, pero todos los pasos
del recorrido físico solicitado siguen pendientes, incluidos contador/filtros,
cancelación y offline en el dispositivo.

El manifest final de sesión 5 coincide en sus 48 archivos Flutter, 12 Nest y 276
documentales/evidencias antes de esta actualización. No se detecta un defecto
nuevo ni se modifica código funcional; no hay motivo para repetir analyze,
tests, builds o generación Drift. La evidencia de sesión 6 registra hashes
antes/después de los tres árboles y conserva cambios previos sin commit.

## Próximo paso concreto

Conectar un teléfono o tablet físico y ejecutar A42 en base aislada: capturar
mínimo decimal en kg, verificar teclado decimal real/coma y precisión, legibilidad,
scroll hasta mínimo/proveedores con texto grande y navegación Artículos → editor
→ informe → Caja → regreso, repetir venta/reposición/vacío y reapertura. Registrar
modelo, SO, tamaño/texto, comandos y resultados; después actualizar A42 y decidir
cierre total. El simulador iPhone disponible y widgets 320/1024 no acreditan este paso.
No rehacer los recorridos automatizados terminados salvo cambio de código o duda.
La instalación móvil deberá tener un applicationId/bundle ID exclusivo y datos
propios, sin reemplazar la app operativa. Registrar además versión instalada,
idioma/teclado y escala efectiva; completar contador/filtros/cancelación y offline
en el mismo dispositivo. El checklist exacto está en la evidencia de sesión 6.

Secuencia futura: esquema/receptor compatibles desplegados y verificados antes de
habilitar escritores nuevos. Servidor antiguo no soporta el contrato. Esta tarea
no hizo commit, push, despliegue ni migraciones operativas.

## Registro de ejecución

- 2026-10-19: planificación documental inicial, 42 casos y cinco sesiones.
- 2026-10-19: sesión 1 implementada y verificada en contratos/esquemas, con
  límites y corridas intermedias registrados; siguiente sesión 2.
- 2026-10-19: sesión 2 implementada en persistencia/conservación local; siguiente sesión 3, sin habilitar captura pública.
- 2026-10-19: sesión 3 implementada y verificada con PostgreSQL/HTTP aislados; siguiente sesión 4, captura pública aún cerrada.

- 2026-10-19: sesión 4 implementada en editor/informe y verificada con widgets/SQLite en ambos modos; siguiente sesión 5, físico y cierre integral pendientes.

- 2026-10-19: sesión 5 verificada con 2567 Flutter sin omisiones, restore/informe ambos modos y recorrido manual macOS; A01–A41 verificados, A42 parcial por hardware físico ausente.
- 2026-10-19: sesión 6 complementaria ejecuta detección física sin encontrar móvil accesible; conserva fuentes/evidencia anterior por hashes y deja A42 parcial, prueba física pendiente. Sin cierre total.
