---
tipo: evidencia_implementacion
estado: fase_4_completada_alcance_local
revision_plan: 3
fecha_inicio: 2026-10-06
fecha_cierre: 2026-10-07
---

# Fase 4: verificación y cierre, revisión 3

Se ejecutó únicamente la fase 4 sobre el árbol de trabajo de Flutter.
El cierre local cumple sus criterios: P01–P28 tienen resultado y evidencia nueva
o límite concreto. La entrega real a WhatsApp, QA móvil física/iOS y el build
universal macOS permanecen pendientes; no se presentan como aprobados.

## Base y preservación

Flutter: main, HEAD inicial/final
`56ddbc49f7369b2598aabe3c67b03135b7c89b46`. Los **826 archivos iniciales**
coincidían exactamente con el cierre de fase 3: reconstrucción de sus hashes
iniciales más sus cambios finales, cero diferencias
(`fase-4-revalidacion-fase3.json`). Se leyeron AGENTS de análisis/Flutter,
guías offline, Plan, Mapeo, Casos, Continuidad, Sesiones/04, contratos, inventarios
y evidencias de fases 2–3. Las verificaciones anteriores siguen válidas;
la suite final volvió a ejecutar sus casos sobre la versión final.

En Flutter se modificaron únicamente tres tests y se añadió uno:
quotation_verification_test, quotation_backup_test, quotation_dependencies_test
y quotation_mode_verification_test. **823 archivos iniciales intactos**, ninguno
eliminado. No hubo regresión funcional encontrada ni corrección de producción
necesaria. La auditoría no encontró otros imports/helpers/registros muertos;
los retirados en fase 2 siguen ausentes. No cambió el esquema ni el archivo
generado: no se regeneró Drift.

NestJS: HEAD `e451d1b4d9b9a4182aa41d3e8a525bf60c465c3e`, limpio e intacto,
173 archivos con hashes conservados. Búsqueda quotation/cotizacion en src/test
sin resultados. No se ejecutó suite Nest, no se añadieron contratos ni sync remota.
No checkout, restore, stash, commit ni apertura/reset de bases de uso.

La entrada temporal de QA nativa fue retirada; su copia queda en
`fase-4-native-probe.dart.txt`. No inicializa DI, SQLite, sync ni comandos.
Registros completos: `fase-4-arboles-iniciales.json`,
`fase-4-preservacion.json`, estados inicial/final y `fase-4-archivos.md`.
Las evidencias históricas de revisiones/fases anteriores permanecen intactas.
En análisis se modificaron diez archivos propios; .obsidian/workspace.json
varió fuera de las ediciones del trabajo y se conserva sin restaurarlo, con
su diferencia registrada aparte en fase-4-preservacion.json.

## SQLite, payloads y precios de venta

`fase-4-auditar.py` abre **solo las copias de evidencia, en modo de lectura**:
11 bases del esquema actual, seis escenarios de cobro y dos fixtures core.
Audita el esquema exacto, DDL, índices, integridad/FK y todas las claves de cada
payload quotation, incluyendo líneas/selection/mapas de identidad anidados.
Las listas cerradas y tipos escalares impiden introducir otra copia monetaria
dentro de un objeto permitido. Resultado:
`fase-4-auditoria-sqlite.json` / `fase-4-auditoria-sqlite.txt`.

- quotations: 12 columnas; quotation_items: 17. Ausentes físicamente las siete
  columnas y sus CHECKs retirados; no hay otra columna, tabla o caché de
  estimación persistida. Selección/nombres/orden/cantidad/unidad permanecen.
- Guardado y vínculo formato 2, sin moneda, precio, costo, importe, denominador
  de precio, consumo ni snapshot de venta. Decoders rechazan legado,
  legado etiquetado 2, extras y copias anidadas.
- Catálogo conserva precio/costo; sales conserva total y sale_items
  precio/costo/referencia/total/consumo. La moneda pertenece al snapshot de
  venta/evento/recibo; **sales no declara una columna currency**.
- Fixture de dos líneas: dos piezas a $120 = $240; 500 g a $30/100 g = $150;
  venta $390, versión 2, dos eventos sale_draft + vínculo y 0/13 refs nuevas.
  `fase-4-core/fase-2-sqlite-standalone.json` y serverSync son exportaciones
  **nuevas de esta ejecución**; el nombre fase-2 procede del exporter existente.
- Confirmación conserva el snapshot habitual y su elegibilidad de pendientes;
  no refs quotation ni dependencia remota de guardado/vínculo. Borradores y
  cotizaciones siguen not_required y nunca son pendientes de push.

El primer intento del auditor Python asumió currency en sales y falló.
Se corrigió esa expectativa de la herramienta, no el producto; el log inicial
se conserva en fase-4-auditoria-sqlite-inicial.txt. El resultado final pasó.

## Recuperación, modos y efectos

La suite vuelve a verificar varias líneas/cantidades absolutas, bases 0..N−1,
IDs estables y created/last de borrador. Inyecta fallo en evento/línea intermedia,
refs de borrador, evento/refs de vínculo, actualización del vínculo y después
del handler final: revierte todas las tablas, events, refs y secuencias. Retry
después del commit simula respuesta perdida; doble toque/continuación con
edición y catálogo cambiado conservan la venta existente. Limpiar habilita
otra intención/precio; replay antiguo no resucita ni regresa el vínculo.
Vendida bloquea recuperar aun con pending/conflict/rejected.

La nueva prueba quotation_mode_verification_test registra las refs que reciben
los command services **antes** de Drift. En ambos modos se declaran y validan;
refs inválidas de los contratos se rechazan sin cambiar tablas. Para tres líneas:
guardado declara 5; recuperación 4+4+5+5 = 18. Persistencia exacta en server_sync
y cero filas en standalone. Exportaciones `fase-4-sqlite/refs-*.json`.

El test de runtime llama las rutas reales startConfiguredRuntimeServices y stop:
standalone no resuelve ni inicia SyncAvailabilityMonitor; solo inicia respaldo.
El monitor es el iniciador de health/preflight/push/pull/WebSocket. Código de
arranque y acciones manuales de sync siguen limitados a server_sync.
Se reutiliza la regresión completa de config/store/push/orchestrator/monitor;
no se hicieron llamadas a un servidor para estimar/recuperar/confirmar.

Los seis cobros (tres métodos × dos modos) parten de deuda/caja/inventario no vacíos.
Guardar/limpiar/estimar/recuperar conservan todas las tablas de negocio y saldos;
compartir/generar compara todas las tablas en quotation_navigation_test.
Solo confirmar produce los efectos. Antes de guardar: venta origen $134.01;
después del cambio de precio/costo: recuperación **$294.01**; otro cambio eleva
estimación a **$304.01**, mientras confirmación/recibo conservan $294.01.

| Método | Cuenta antes → después, minor | Caja esperada antes → después, minor | Efectos del cobro |
|---|---|---|---|
| cash | −13401 → −13401 | 33401 → 62802 | Un pago de efectivo y un movimiento de caja |
| transfer | −13401 → −13401 | 33401 → 33401 | Un pago, referencia SPEI-123; sin movimiento efectivo |
| credit | −13401 → −42802 | 33401 → 33401 | Una deuda; sin pago ni movimiento efectivo |

En cada cobro: consumo −1 directo, −3 receta y −750 medido; saldos finales
984 piezas y 2000 átomos medidos; disponible = onHand. Duplicar confirmación
se rechaza y reaplicar el handler conserva contenido/saldos exactos.
ConfirmedSaleRepository + SaleReceiptDisplay leen la confirmación real:
precios [12000,2400,20001], costos [1300,900,1700], total 29401,
método/cliente/referencia correctos. `fase-4-sqlite/saldos-{modo}-{método}.json`
incluye todas las filas antes/después y el texto del recibo.

## Reinicio, respaldo y legado

AppDatabase() usa path_provider mock a Directory.systemTemp: ejecuta la ruta
real _resetDatabaseOnStartup. Ninguna prueba sustituye esa ruta por memoria.

- Seis archivos (dos modos × Disponible/En venta/Vendida): igualdad de todas las
  tablas después del reinicio normal, restore por DriftDatabaseRestoreService
  y segundo reinicio; estado/vínculo/selección/eventos/ref preservados.
  `fase-4-sqlite/backup-*.sqlite/json`.
- Cuatro historias de recuperación editada (dos modos × En venta/Vendida):
  dos intenciones, limpiar primera, editar segunda, restore/replay antiguo y
  continuación o rechazo de Vendida; marcador con contenido e integridad intactos.
  `fase-4-sqlite/restore-*.sqlite/json`.
- Se repiten las 14 pruebas de cada columna antigua protegida/no protegida,
  además de ausencia de tablas/índice/columna requerida.
- Dos pruebas nuevas agregan las **siete columnas a la vez** a la estructura
  nueva versión 8, catálogo/venta/evento monetario legado y marcador con contenido.
  Copia no protegida reinicia toda la base: desaparecen catálogo, venta,
  cotización, evento legado y marcador; nueva estructura sigue en 8.
  Copia restaurada mediante el servicio real, con marcador .pos_db_restored,
  se rechaza al abrir y permanece con SHA-256 exacto y las siete columnas,
  evento y marcador legados. `legacy-all-columns-protected-{false,true}.*`.
  La copia protegida incompatible se conserva como evidencia del rechazo;
  se excluye deliberadamente de la auditoría de bases compatibles.

Mantener schemaVersion 8 no hace compatible una base antigua. La política
de desarrollo reinicia **toda la base antigua no protegida**, no solo precios.
No se migró historial ni se promovieron eventos locales a pendientes de sync.

## PNG y selector nativo

Se regeneraron e inspeccionaron los ocho PNG con el rasterizador real Flutter:
piezas/kg/L/nombres largos, 18 líneas completas, indisponibilidad y recibos de
los tres métodos. Misma pantalla/SQLite genera $145.01 y luego $315.01 después
del cambio de precio; las solicitudes conservan sus propios bytes, la siguiente
usa los nuevos. Fecha original/cálculo y leyendas correctas, sin truncamientos.
`fase-4-png/`, manifiesto con tamaños/hashes y tests finales. Los PNG de tests
cargan Arial como Roboto para evitar Ahem; el PNG nativo usa las fuentes del runtime.

macOS 27.0.1 arm64: se compiló/ejecutó la entrada temporal; Compartir y WhatsApp
abrieron NSSSharingServicePicker con PNG (137 KB). Se cancelaron con Escape,
y Compartir se volvió a abrir, acreditando que los controles se habilitan.
No se eligió destino. Se inspeccionó el PNG completo de share_plus, 880×1328,
y los tres archivos de las tres aperturas tienen exactamente el mismo hash.
Capturas/AX/resultado en fase-4-native-*; PNG `fase-4-native-shared.png`.

WhatsApp está instalado en el host según inventario CUA pero no aparece entre
los destinos ofrecidos. No se prueba entrega/recepción real, destinatario,
dispositivo físico Android/iOS ni selector iOS. Se conserva la apertura/cancelación
Android nativa de fase 3 como evidencia válida; no se volvió a ejecutar ese AVD.
P27 queda verificado para concurrencia/callbacks/cancelación y selector disponible,
con esos límites explícitos.

## Checks finales

| Comando | Resultado / log |
|---|---|
| dart analyze | Exit 0, No issues found; fase-4-dart-analyze.txt |
| flutter test --no-pub --reporter expanded | Exit 0, **1306 aprobadas y 1 omitida**; fase-4-flutter-test.txt |
| Selección core inicial | Exit 0, 124 aprobadas; fase-4-core-inicial.txt |
| Cobro/backup ampliados | Exit 0, 38 aprobadas; fase-4-cobro-backup.txt |
| Python auditor de evidencia | Exit 0, bases/esquema/JSON/cobros pasan; fase-4-auditoria-sqlite.* |
| Fixtures/validar_fixtures.py | Exit 0, 11 JSON verificados; fase-4-fixtures.txt |
| git diff --check | Exit 0 Flutter/análisis; fase-4-git-diff-check.txt / fase-4-analisis-diff-check.txt |
| flutter build macos --debug --no-pub | Exit 0; fase-4-build-macos-debug.txt |
| FLUTTER_XCODE_ARCHS=arm64 flutter build macos --release --no-pub | Exit 0, app 32 MB; fase-4-build-macos-arm64.txt |
| flutter build macos --release --no-pub (universal) | Exit 1, comprobación lipo; fase-4-build-macos.txt |

La prueba omitida es variant_tracking_server_test.dart, requiere servidor
Nest/PostgreSQL aislado y POS_PHASE3_SYNC_URL. No pertenece al corte local.
Los warnings de Drift en aperturas protegidas fallidas y los warnings nativos
de dependencias se conservan en logs; no ocultaron fallos de tests.

El intento universal falló en release_unpack_macos: lipo -info enumera arm64/x86_64,
pero lipo con -verify_arch arm64 x86_64 devuelve exit 1; por separado ambas
verificaciones pasan. Diagnóstico reproducido en fase-4-lipo-diagnostico.json.
El override soportado FLUTTER_XCODE_ARCHS afecta solo la invocación. No se
editó SDK, proyecto Xcode, entitlements ni configuración permanente. Build de
la plataforma arm64 disponible satisfecho; universal Intel/Apple permanece pendiente.

## Cierre y pendientes concretos

Matriz por caso:
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Casos de aceptacion|P01–P28 resueltos]].
Plan, Mapeo, Matriz, Continuidad, Sesiones/04 e índice actualizados con este alcance.

1. Ejecutar envío/recepción real de PNG en WhatsApp con destinatario autorizado.
2. Probar dispositivo físico Android/iOS y selector iOS cuando estén disponibles.
3. Resolver/revalidar el build release universal con un toolchain que acepte
   la verificación conjunta de lipo; el release arm64 y debug ya están aprobados.

No quedan tareas funcionales de cotización pendientes ni decisiones de producto.
Los tres puntos anteriores permanecen abiertos y separados del cierre local.
