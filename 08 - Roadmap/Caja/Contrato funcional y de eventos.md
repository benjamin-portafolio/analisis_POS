# Apertura y corte de caja — contrato revisión 3

Fecha: 2026-09-25. Este módulo autoriza la gestión de caja excluida del contrato anterior de ingresos/gastos; no cambia el significado de aquellos informes. Referencias contrastadas: AGENTS de ambos repositorios, CommonFields/SyncProjectionEntity, handlers de ventas/abonos/finanzas, appendAndApply transaccional, push causal, preflight, ecos y detección de respaldo SQLite. No se considera verificación el solo hecho de encontrar código.

Revisión 2 (2026-09-26): la captura deja de depender de la bandera de compilación `CASH_MANAGEMENT_ENABLED`. Ver [[02 - Decisiones/ADR-0015 Corte de caja siempre habilitado|ADR-0015]].

Revisión 3 (2026-09-26): la habilitacion es un ajuste persistente de la instalacion, controlable desde la pantalla donde se elige el modo. Ver [[02 - Decisiones/ADR-0016 Habilitacion de caja por instalacion|ADR-0016]].

## Alcance y habilitacion

Una caja operativa por device_id; índice parcial único impide dos sesiones `open` del mismo dispositivo. Solo el dispositivo propietario registra operaciones y cierre. Otros dispositivos reciben por pull y consultan. Sin caja compartida, cierre remoto, reapertura, edición, transferencias entre cajas ni contabilidad.

La captura se habilita por instalacion con `AppConfig.cashEnabled`, persistido como `cash_enabled` junto a `mode`, `auth_provider`, `sync_provider` y `backup_provider`; default `true`. No hay bandera de compilacion: `CASH_MANAGEMENT_ENABLED` y `bool.fromEnvironment` se eliminan. La pantalla de modo y la de ajustes de sincronizacion muestran un interruptor «Corte de caja» con el estado vigente; el ajuste solo es operable sin sesion de caja abierta. Una configuracion guardada sin la clave `cash_enabled` se lee como habilitada, para que una actualizacion no apague la captura en una terminal en uso. Es configuracion local: no es evento, no se sincroniza y el servidor no lo valida.

Habilitado: ventas y abonos cash exigen apertura. Finanzas exige selección explícita «Este efectivo entra/sale de esta caja», por defecto fuera de caja; transfer nunca afecta caja. No hay asignación retrospectiva ni por fecha.

Deshabilitado: la entrada de menu de caja se oculta, `abrir` y `cerrar` se rechazan con «La captura de caja aun no esta habilitada.» y la venta o abono `cash` se registra sin el campo `cash`, es decir como operacion capturada sin caja. El servidor lo acepta y esos importes no suman a ninguna caja.

## Datos e invariantes

`cash_sessions`: id UUID, CommonFields/SyncProjectionEntity (active siempre true), device_id, opened_by_user_id, closed_by_user_id nullable, status open/closed, opened_at_ms, closed_at_ms nullable, opening_minor entero seguro >=0, counted_minor nullable entero seguro >=0, income_minor/expense_minor/expected_minor/difference_minor como decimal exacto nullable al abrir, close_snapshot JSON nullable, previous_close_event_id nullable. created_event_id apertura, last_event_id apertura/cierre. La entrega vive en events, no en status operativo. Solo closed tiene todos los datos de cierre. Nota opcional normalizada NFKC/trim/vacío null, <=500 caracteres.

`cash_movements`: id UUID, campos comunes, session_id FK RESTRICT, direction in/out, amount_minor entero seguro >0, exactamente uno de sale_payment_id/customer_payment_id/financial_entry_id FK RESTRICT y UNIQUE (también cada origen globalmente único). created_event_id es el evento de la operación real, no un evento financiero inventado. Importe y método se contrastan con ese origen al insertar. Índice session_id. La apertura no genera movimiento.

Centavos MXN enteros. Acumulación BigInt; totales decimal-string en contrato y proyecciones (PG numeric/SQLite text). esperado = fondo + entradas - salidas; diferencia = contado - esperado. Se suman exclusivamente cash_movements; jamás nuevamente los orígenes. Venta cash usa total aplicado = recibido - cambio; crédito/transfer no producen movimiento. Venta de total cero no produce movimiento.

## Eventos y compatibilidad

Sobre común existente, UUID v4, base_version=1, base_server_sequence=null. `cash_session` / `caja_abierta`: `{opening_minor, opened_at_ms, previous_close_event_id?}`. Identidad/dispositivo/responsable del sobre. La apertura sucesiva referencia el último cierre de su dispositivo, aun pendiente; servidor verifica la cadena y que no haya sesión abierta.

`cash_session` / `caja_cerrada`: `{opening_event_id, closed_at_ms, counted_minor, income_minor, expense_minor, expected_minor, difference_minor, notes, movements}`. Cada evidencia en movements: `{movement_id,event_id,direction,amount_minor,source_type,source_id}`; orden lexicográfico por movement_id, sin duplicados. source_type: sale_payment/customer_payment/financial_entry. La lista completa es la instantánea verificable (no un mero timestamp o hash opaco). opening_event_id y todos los event_id de movimientos son dependencias causales. El servidor comprueba estado synced de cada dependencia, igualdad exacta del conjunto/evidencia real y recalcula todos los totales. Cierre vacío válido.

Los contratos existentes venta_confirmada, abono_cliente_registrado, movimiento_financiero_registrado admiten campo opcional `cash`: `{session_id, opening_event_id, movement_id}`. Ausencia/null significa operación histórica o capturada sin caja; jamás reconstruye movimiento. El campo solo es válido con método cash y monto aplicado positivo. Los contratos tipados conservan el campo al serializar. Dependencia adicional: apertura. Refs: affects cash_session en apertura/cierre; uses cash_session y affects cash_movement en operaciones; requires_unique cash_device en apertura (preflight); uses cash_session en cierre y apertura encadenada según corresponda.

## Atomicidad, conflictos y recepción tardía

Local: comandos declaran/validan refs en ambos modos. appendAndApply guarda evento, refs (solo server_sync), origen y movimiento en la misma transacción; handler revalida apertura y device_id dentro de esa transacción. Cierre también revalida conjunto y estado bajo la misma exclusión transaccional. Carrera operación/cierre: gana una transacción; si la operación gana y cambia el conjunto se vuelve a consultar antes de cerrar, si gana cierre la operación revierte completa. Doble toque bloqueado; apertura/cierre usan identidad estable para reintento idéntico.

Servidor: lock transaccional por dispositivo para aperturas y lock por sesión para operación/cierre. `pending` de transporte, sin aceptar ni persistir un evento terminal, si falta una dependencia: reintento con mismo ID cuando llegue. Dependencia conflict/rejected, sesión/propietario incorrectos, conjunto divergente, operación tardía tras cierre: evento conflict con payload financiero intacto y motivo, sin alterar un corte oficial. El hecho aplicado en el cliente no se borra ni restaura; queda en auditoría central como evento conflict. Nunca se reabre caja por entrega. No hay resolución financiera automática ni movimiento a la sesión siguiente.

Mismo evento repetido responde duplicate con original_sync_status; el contenido no puede mutar. Eco local aplicado solo avanza metadatos, nunca reabre ni reaplica importes. Un cierre local permanece closed aunque pendiente/conflict. Es posible abrir nueva sesión offline: apertura nueva depende del cierre anterior; el conflicto se propaga a la cadena conservando hechos y cierres locales. No se acepta definitivamente un cierre con operaciones pendientes/conflictivas.

Standalone: not_required, cero event_refs persistidas, sin push/pull/preflight/health/WebSocket. Server_sync: pending/delivered/conflict/rejected separados de open/closed. Sin importación silenciosa de eventos standalone.

## Pantallas, respaldo y puesta en marcha

Apertura/fondo; caja actual (entradas, salidas, esperado y movimientos); cierre contado/diferencia/nota; historial y detalle inmutables, entrega/motivo de cada operación y corte. UI consume comandos/repositorios, sin Drift; éxito tras commit, formularios conservados ante errores, botones deshabilitados al guardar. La pantalla de configuración inicial y la de ajustes de sincronizacion incluyen el interruptor «Corte de caja»; el menu lateral solo muestra la entrada de caja cuando `cash_enabled` es verdadero, y la UI de caja escucha `AppConfigController.changes` para el cambio en caliente.

Política local vigente: schemaVersion fijo 7, sin nueva migración onUpgrade; detección de esquema nuevo por _resetDatabaseOnStartup. Bases de desarrollo incompatibles se recrean; respaldo restaurado incompatible falla explícitamente sin borrarse. Pruebas solo con archivos temporales. El respaldo SQLite incluye sesiones, movimientos, eventos y evidencias. Restaurar identidad de dispositivo requiere conservar identidad original; no autoriza escritores clonados simultáneos. `cash_enabled` forma parte de la configuracion local y se restaura con el respaldo; tras una restauracion puede quedar deshabilitado aunque la caja estuviera habilitada antes.

Puesta en marcha: migración PG/servidor receptor → TODOS los clientes en uso actualizados. La actualización de clientes es requisito previo, no secuencia de despliegue: no hay compilación especial ni paso de activación, solo el interruptor por instalación. Clientes viejos no entienden caja_abierta/caja_cerrada y su pull podría detenerse; no emitirlos antes de actualizar. No desplegar ni iniciar app sobre datos de uso durante esta implementación.
