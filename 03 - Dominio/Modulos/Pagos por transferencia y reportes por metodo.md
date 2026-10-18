---
tipo: modulo
estado: implementado_con_limites
actualizado: 2026-09-23
---

# Pagos por transferencia y reportes por método

## Alcance confirmado

Decisiones del usuario del 2026-09-23:

1. Cada venta usa un solo método y se paga íntegramente. Los pagos mixtos se
   implementarán después.
2. Al confirmar el cobro por transferencia se da por hecho que el dinero se
   recibió. No se agregan estados de transferencia ni una validación posterior.
3. La referencia de transferencia es opcional.

Implementado en Flutter y NestJS el 2026-09-23, sin despliegue. Caja confirma
transferencias y conserva método y referencia. Informes muestra efectivo,
transferencia y total recibido, con movimientos consultables por subtotal.

## Base anterior a esta implementación

- Caja permite efectivo y crédito del cliente. Transferencia bancaria aparece
  como una opción deshabilitada en `payment_method_screen.dart`.
- `ConfirmarVentaCommand` y `venta_confirmada` transportan `payment_method`, pero
  los contratos de Flutter y NestJS solo admiten `cash` y `credit`.
- SQLite guarda los pagos directos en `sale_payments`, sin columna de método
  ni referencia. PostgreSQL tiene `method`, pero `VentaEventHandler` escribe
  siempre `cash` para los pagos directos.
- `customer_payments` ya admite abonos y anticipos con `cash` o `transfer`,
  referencia opcional y fecha propia. No hace falta duplicar ese registro.
- El reporte de cobros suma ventas distintas de crédito y abonos, sin desglose
  por método. El recibo identifica toda venta distinta de crédito como efectivo.

Referencias de código:

- Flutter: `lib/presentation/pages/caja/payment_method_screen.dart`,
  `lib/application/commands/ventas/venta_command_service.dart`,
  `lib/application/sync/payloads/venta_confirmada_payload.dart`,
  `lib/data/local/drift/drift_confirmed_sale_store.dart`,
  `lib/data/local/drift/tables/sale_payments.dart`,
  `lib/presentation/pages/caja/models/sale_receipt_display.dart` y
  `lib/presentation/pages/informes/widgets/collections_report_card.dart`.
- NestJS: `src/sync/payloads/venta-confirmada.payload.ts`,
  `src/sync/venta-event.handler.ts` y `src/entities/sale-payment.entity.ts`.

Las rutas son relativas a los proyectos de referencia definidos en `AGENTS.md`.

## Flujo funcional implementado

1. En Cobrar, seleccionar Transferencia bancaria.
2. Mostrar el total a pagar y un campo de referencia opcional. El cliente sigue
   siendo opcional para el cobro directo.
3. Confirmar el cobro. El total completo se considera recibido por transferencia;
   no hay captura de cambio ni un paso posterior de validación bancaria.
4. Guardar evento, venta, líneas, pago y consumo de inventario en la misma
   transacción local. Abrir el recibo únicamente después del commit.
5. Mostrar Transferencia, importe y referencia cuando exista en el recibo y en
   el detalle consultable del cobro. No mostrar efectivo recibido ni cambio para
   este método.

El botón debe impedir dobles envíos mientras se registra. Un fallo conserva el
borrador mediante rollback; un reintento no puede duplicar pago ni inventario.

## Diseño técnico implementado

### Datos y contrato

- `venta_confirmada` confirma la venta completa y admite `cash`, `transfer` y
  `credit`. Efectivo y crédito conservan sus reglas anteriores.
- Comando y payload tipados incluyen referencia opcional `payment_reference`;
  ausencia, `null` o texto vacío tras trim equivale a no tener referencia.
- Normalizar la referencia en el comando con `trim` y convertir texto vacío en
  `null`. Reutilizar el límite de 500 caracteres existente en abonos.
- Agregar `method` y `reference` a `sale_payments` en Drift. En PostgreSQL,
  agregar `reference` y persistir el método recibido en lugar del literal `cash`.
- Conservar `payment_id`, importe aplicado en centavos y moneda MXN. La fecha,
  usuario y dispositivo se consultan mediante el evento de confirmación, sin
  duplicar esos datos innecesariamente en el pago.
- Para transferencia, representar el importe recibido con
  `received_minor = total_minor` y `change_minor = 0`; su significado es dinero
  recibido por el método indicado. Validar esta igualdad en ambos contratos y
  en las restricciones de pagos. Efectivo conserva recibido menos cambio igual
  al importe aplicado. Crédito conserva ausencia de pago directo y sus reglas.
- Mantener la unicidad de `sale_id` en pagos directos: una venta tiene como
  máximo un pago directo. No preparar ahora una lista de pagos ni quitar esa
  restricción para el futuro flujo mixto.
- La referencia opcional es descriptiva; no reemplaza `payment_id` o `event_id`
  para idempotencia ni acredita automáticamente una operación bancaria.

El crédito sigue siendo una forma de confirmar una venta con deuda. No se crea
un pago con método `credit`. Sus abonos posteriores conservan su método real en
`customer_payments` y su distribución en `credit_allocations`.

### Aplicación y sincronización

Se actualizaron los command services, contratos tipados, proyecciones, repositorios
y handlers de Flutter y NestJS. El método y la referencia deben conservarse al
reiniciar, hacer push y aplicar pull, sin volver a registrar dinero o consumo
al recibir un eco. Se aprovechan los endpoints y el flujo de eventos existentes.

Las referencias a venta, pago, líneas, catálogo, inventario y cliente opcional
mantienen la estructura actual. Los comandos declaran y validan `LocalEventRef`
en ambos modos:

- `standalone`: evento aplicado con `delivery_status = not_required`, sin filas
  en `event_refs` y sin push, pull, preflight, health checks o WebSocket.
- `server_sync`: referencias persistidas y entrega mediante el flujo actual.

No se agregan estados financieros para la transferencia. El estado de entrega
del evento sigue siendo independiente: un cobro pendiente de sincronizar o con
incidencia conserva el registro local del dinero recibido. El historial
standalone no se convierte silenciosamente en pendiente de sincronización.

## Reportes y rastreo

La consulta común de cobros implementada combina:

- Pagos directos de `sale_payments`, con su método, importe aplicado y fecha del
  evento de confirmación.
- Abonos y anticipos de `customer_payments`, con su método, importe recibido y
  `occurred_at_ms`.

No se requiere fusionar físicamente ambas tablas. El desglose por período debe
mostrar efectivo, transferencia y total recibido, con acceso a los movimientos
que componen cada importe. El detalle identifica origen, pago, venta o cliente
según corresponda, fecha, método, importe, referencia, usuario y dispositivo.
La incidencia de sincronización se puede consultar sin confundirla con un estado
de transferencia.

Reglas de cálculo:

- Cobros por método = pagos directos de ese método + abonos y anticipos de ese
  método recibidos en el período.
- Efectivo suma el importe aplicado, no el efectivo entregado antes de devolver
  cambio. Transferencia suma el total aplicado.
- Las ventas a crédito cuentan en ventas totales, pero no crean por sí mismas
  un cobro. El abono se cuenta en la fecha de su recepción, aunque la venta sea
  de otro período.
- Las aplicaciones de un abono a varias deudas no vuelven a sumar dinero; se
  cuenta una vez el registro original de `customer_payments`.
- Los anticipos se cuentan cuando se reciben y no otra vez cuando se aplican.
- Se conserva el criterio actual de incluir cobros aplicados localmente aunque
  su entrega al servidor esté pendiente o requiera atención.
- Usar importes enteros en centavos y acumulación segura, como en los reportes
  existentes. No inferir efectivo a partir de «no es crédito».

Ejemplo de un período:

| Método | Pagos directos | Abonos y anticipos | Total recibido |
|---|---:|---:|---:|
| Efectivo | $1,000 | $200 | $1,200 |
| Transferencia | $1,500 | $300 | $1,800 |
| Total | $2,500 | $500 | $3,000 |

## Compatibilidad y puesta en marcha

- Leer eventos anteriores sin referencia y conservar su método. Los pagos
  directos históricos existentes corresponden a efectivo; los abonos históricos
  conservan el método que ya tienen.
- Ajustar el esquema PostgreSQL y sus restricciones. En Flutter se sigue la
  política actual de desarrollo: recreación mediante `_resetDatabaseOnStartup`,
  `schemaVersion` fijo y regeneración Drift. Esa recreación pierde datos locales;
  preservar datos de instalaciones reales requeriría acordar otra estrategia.
- Actualizar servidor y tablets que reciben estos eventos antes de habilitar
  transferencias: las versiones actuales rechazan `transfer` en ventas directas.
- Migración PostgreSQL: `1790208000000-AddTransferSales`. Añade referencia
  `varchar(500)` y restricciones para método, MXN y transferencia sin cambio;
  conserva el método histórico y la unicidad de `sale_id`. El downgrade se
  rechaza si hay transferencias o referencias, para no perder datos.
- `_resetDatabaseOnStartup` detecta `sale_payments.method` y `reference`; mantiene
  `schemaVersion = 7`. Recrea bases de desarrollo anteriores. Un respaldo antiguo
  marcado como restaurado se rechaza y no se borra. No ejecutar esta versión sobre
  tablets con datos que deban preservarse sin resolver antes esa política local.
- Antes de habilitar el uso: respaldar y revisar bases existentes, aplicar el
  cambio PostgreSQL mediante el proceso de migraciones y actualizar todas las
  tablets receptoras. `AppModule` conserva `synchronize=true`; la operación
  productiva necesita controlar explícitamente el esquema. No se ejecutó el
  servidor de aplicación ni se modificaron bases de uso durante este trabajo.

## Lectura de cobros implementada

Flutter registra `CollectionRepositoryImpl` en DI. Una consulta `UNION ALL` une
`SalePayments` y `CustomerPayments` con `events`, `sales` y `clientes`. Solo exige
`application_status = applied`; no filtra por entrega. Los importes de cada
período se acumulan con `BigInt`. El detalle muestra pago, evento, origen, venta,
cliente, fecha, método, referencia, usuario, dispositivo y estado/motivo de entrega.
Los pagos de venta permiten abrir el recibo. Los nombres de cliente del reporte
son los de la proyección actual; el recibo conserva el snapshot de la venta.

NestJS expone `GET /reports/collections?from_ms=<inicio>&to_ms=<fin>` con intervalo
UTC `[inicio, fin)`. Devuelve `cash_minor`, `transfer_minor`, `total_minor`, moneda
MXN y `movements`. Los importes acumulados y los importes de movimientos se
serializan como cadenas decimales de centavos para conservar precisión.
La consulta usa el esquema configurado de TypeORM y un único snapshot SQL; no
une las aplicaciones FIFO. La app calcula sus informes en SQLite y no depende
de este endpoint para operar offline.

El informe central contiene únicamente cobros proyectados en el servidor: puede
diferir de una tablet con eventos pendientes o con incidencia. La fecha directa
es `events.created_at_local`; abonos usan `occurred_at_ms`. Se conserva la
precisión existente de segundos en fechas de eventos Drift. No se corrigen
relojes de dispositivos. No se agregan estados ni conciliación bancaria.

## Verificación ejecutada

- `dart run build_runner build`: esquema Drift regenerado sin cambiar versión.
- `dart analyze`: sin incidencias.
- `flutter test`: 518 pruebas aprobadas.
- `npm run build`: correcto; ESLint sobre todos los archivos TypeScript
  modificados y nuevos: sin incidencias.
- `RUN_POSTGRES_INTEGRATION=1 npm test -- --runInBand`: 31 suites y 231 pruebas
  aprobadas en PostgreSQL temporal aislado, incluyendo migraciones y reportes.
- Cobertura añadida: referencias ausente/null/vacía/espacios/texto/límite; método,
  importe, moneda y cambio inválidos; efectivo legado; ambos modos y refs;
  rollback tras movimientos, doble toque, reintento, reinicio, respuesta perdida,
  pull de otro dispositivo y eco sin duplicar cobros ni inventario; abonos,
  anticipos repartidos entre deudas, fechas propias, períodos distintos y cobros
  con incidencias; UI de transferencia, recibo PNG y detalle por subtotal.
- Push Flutter utiliza HTTP simulado; backend ejecuta SyncService y handlers
  contra PostgreSQL real. No se hizo una prueba entre dispositivos físicos,
  un despliegue ni cambios destructivos sobre bases de uso.

## Evolución posterior

Los pagos mixtos se implementarán después mediante un análisis propio: varios
pagos por venta, suma de importes, unicidad revisada y confirmación atómica del
conjunto. El desglose de reportes debe basarse en pagos para poder evolucionar
sin atribuir el total de una venta a varios métodos.

Ver [[03 - Dominio/Modulos/Creditos de clientes|Créditos de clientes]] y
[[04 - Sincronizacion/Confirmacion de ventas en efectivo|Confirmación en efectivo]].
