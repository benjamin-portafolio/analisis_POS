# Estado y continuidad — Caja

2026-09-25. Trabajo en curso, sin despliegue. Contrato revisión 3 (2026-09-26: la habilitacion de caja pasa a ser un ajuste persistente de la instalacion, controlable desde la pantalla de modo; ver [[02 - Decisiones/ADR-0016 Habilitacion de caja por instalacion|ADR-0016]], que reemplaza en parte a [[02 - Decisiones/ADR-0015 Corte de caja siempre habilitado|ADR-0015]]). Cambio **implementado en `pos_flutter`** el 2026-09-26; ver la seccion final de este documento.

## Inspección y precauciones

Leídos AGENTS de análisis, Flutter y NestJS y documentos solicitados. Working trees tienen cambios ajenos de finanzas/clientes/documentación; se conservan. Servidor watch PID 35237 y proceso 35247 pausados con SIGSTOP antes de modificar código; synchronize=true en app.module. No reanudar contra base de uso con entidades nuevas sin actualización coordinada. No se han modificado bases de uso.

## Etapas

1. Contrato y fixtures: contrato creado; fixtures/verificación en curso.
2. Esquemas: pendiente.
3. Backend: pendiente.
4. Core Flutter/operaciones: pendiente.
5. Sincronización: pendiente.
6. Pantallas: pendiente.
7. Verificación transversal: pendiente. No se atribuyen pruebas de sesiones anteriores a esta implementación.

No se han ejecutado pruebas físicas ni desplegado. Actualizar este documento al terminar cada etapa con resultados realmente obtenidos.

## Evidencia de etapas 1–3

- Etapa 1: contrato rev 1 y 4 fixtures JSON creados. `close-valid` y `close-wrong-total` consumidos por TypeScript: verificación válida y rechazo semántico real. Fixtures restantes se consumirán en tests Flutter.
- Etapa 2: entidades `CashSessionEntity`/`CashMovementEntity`, migración `1790337600000-CreateCashSessions.ts`, tablas Drift `cash_sessions.dart`/`cash_movements.dart`, registro y detección de esquema en AppDatabase. `dart run build_runner build` PASS; `schemaVersion=7` intacto. `flutter test test/data/local/drift/cash_schema_test.dart` 1 PASS (unicidad por dispositivo/origen obligatorio/cierre incompleto). Migración up/down protegido probada en esquema temporal dentro de base temporal, no base de uso.
- Etapa 3: payloads tipados apertura/cierre/evidencia/asociación, contratos de operaciones extendidos, `CashEventHandler` integrado en `SyncService` y AppModule, respuesta `pending` transitoria sin aceptar cierre incompleto. `npm run build` PASS después de corregir tipado TypeORM de JSON. `cash-events.postgres.spec.ts`: 8 PASS con PostgreSQL real en `pos_cash_test_20260925` (fixtures, apertura concurrente/duplicate, cash in/out y transfer, corte/retry/tardío, dependencia pendiente y reintento, dependencia conflictiva/segundo escritor, carrera operación/cierre, evidencia alterada, migración). No HTTP ni dispositivo físico en estas 8 pruebas; servicio real contra PostgreSQL.
- Etapas 4–5 en curso: core, integración y sync ya conectados; `dart analyze` PASS (0 issues). Todavía faltan pruebas de los flujos completos antes de declarar estas etapas completas.

## Evidencia de etapas 4–6

- Etapa 4: `CajaCommandService`, comandos abrir/cerrar, payloads tipados y puertos de proyección, adaptador Drift y handler de caja. Ventas/abonos cash se asocian al habilitar caja; finanzas usa `affectsDrawer` explícito. `flutter test test/application/commands/caja test/application/commands/ventas/venta_command_service_test.dart`: **63 PASS**, incluye 9 tests nuevos del core y 3 de integración real local de venta/abono. Verificados cambio sin doble conteo, crédito/transfer sin movimiento, retry de abono tras cerrar y rollback conjunto con fallo inyectado. No dispositivo físico.
- Etapa 5: selección causal push, respuesta pending, propagación conflict/rejected, revalidación no destructiva, ecos y DI. `cash_sync_test.dart`: **5 PASS**, HTTP simulado (lotes causales, respuesta perdida/duplicate, ecos repetidos, dependencia fallida y nueva apertura, conservación del corte). `cash_sync_e2e_test.dart`: **1 PASS**, HTTP real contra NestJS en puerto 3211 con base **pos_cash_test_e2e**: dos SQLite independientes A/B, apertura + ingresos/gasto + transfer/fuera de cajón + corte + nueva apertura offline; preflight/push/pull real, duplicate original_sync_status, ecos, segundo cliente solo consulta y checkpoint.
- Etapa 6: repositorio/dominio CashSession/CashMovement; pantallas `cash_management_screen`, `cash_form_screen`, `cash_detail_screen`, `cash_session_content`; selección explícita en formulario financiero, menú y DI. `cash_management_test.dart`: **6 PASS** (parseo exacto/cero, apertura tras commit, cierre/diferencia/historial inmutable, doble toque/fallo conservando formulario, motivo de incidencia y selección financiera cash/transfer). Pendiente revisión visual con fuentes reales y compilación de app.
- Prueba de respaldo: snapshot VACUUM INTO y restore con SHA-256 reales sobre archivos temporales (sin Google Drive remoto); reinicio, conservación de evidencia/entrega/not_required y apertura siguiente, reset de esquema antiguo temporal y rechazo protegido de respaldo antiguo. Tests ejecutados junto a UI, se repetirán de manera aislada para registrar resultado separado tras corregir el teardown de streams de widgets.
- Suite global NestJS tras corregir regresión detectada en reintento de venta inválida histórica: **38 suites / 304 tests PASS**, `RUN_POSTGRES_INTEGRATION=1`, exclusivamente base temporal `pos_cash_test_20260925`/esquemas temporales. Incluye migraciones y prueba de origen real sale_payment + customer_payment ligada al corte. Sin despliegue.
## Habilitacion por instalacion (2026-09-26)

- Etapa 6 (pantallas) y el ajuste de habilitacion quedan implementados en
  `pos_flutter`. Contrato revision 3. Ver
  [[02 - Decisiones/ADR-0016 Habilitacion de caja por instalacion|ADR-0016]].
- Se elimino la bandera de compilacion `CASH_MANAGEMENT_ENABLED`
  (`bool.fromEnvironment`) de `application_dependencies.dart`. La captura la
  decide `AppConfig.cashEnabled`, persistido como `cash_enabled` en la
  configuracion local.
- `CajaCommandService` ya no recibe `enabled` por constructor: lo lee de
  `AppConfigController.config.cashEnabled` en cada uso, asi que el cambio aplica
  sin reiniciar la app.
- Interruptor «Corte de caja» en `first_run_setup_screen.dart` (instalacion) y en
  `sync_settings_screen.dart` (cambio posterior). En ajustes se rechaza el
  cambio si hay sesion de caja abierta en el dispositivo, con el motivo
  visible. La entrada de menu «Apertura y corte de caja» se oculta cuando el
  ajuste esta apagado y escucha `AppConfigController.changes`.
- Default `true`; una instalacion sin la clave se lee como habilitada. Riesgo de
  migracion anotado en el ADR: las terminales que hoy funcionan con la caja
  apagada pasaron a exigir apertura para el efectivo.
- Pruebas: `cash_enabled_test.dart` nuevo (6 casos: default, rechazo de
  `abrir`/`cerrar`, `binding` nulo, efectivo fuera del cajón, rechazo de entrada
  al cajon, rehabilitacion en caliente); `app_config_test.dart` con 4 casos de
  persistencia y default; `menu_lateral_test.dart` con 3 casos (entrada
  visible/oculta, cambio guardado, rechazo con caja abierta) y un arreglo del
  desplazamiento del drawer. `dart analyze` sin incidencias y `flutter test` con
  **733 PASS**.
- La unica falla de la suite,
  `movimiento_financiero_form_screen_test.dart: error de onSave`, se reprodujo
  con estos cambios apartados: es previa y ajena a caja.
- `pos-nest` sin cambios.
