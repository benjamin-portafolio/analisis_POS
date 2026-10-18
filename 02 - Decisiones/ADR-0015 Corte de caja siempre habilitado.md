---
tipo: ADR
id: ADR-0015
estado: parcialmente_reemplazado
fecha: 2026-09-26
actualizado: 2026-09-26
reemplazada_por: ADR-0016
---

# ADR-0015 Corte de caja siempre habilitado

> **Reemplazada en parte por [[02 - Decisiones/ADR-0016 Habilitacion de caja por instalacion|ADR-0016]]**
> (2026-09-26). Se mantiene la eliminación de la bandera de **compilación** y el
> nuevo orden de puesta en marcha. Se deroga la parte que prohibía una
> habilitación por instalación: la captura pasa a ser un ajuste persistente que
> el operador controla en la pantalla de modo.

## Contexto

La revisión 1 del contrato de caja condicionaba la captura a la bandera de
compilación `CASH_MANAGEMENT_ENABLED=true` en Flutter, con valor por defecto
`false`, y preveía un paso final de «habilitar captura» en el orden de puesta en
marcha. La razón era práctica: los clientes antiguos no entienden
`caja_abierta` ni `caja_cerrada`, y su `pull` podría detenerse si el servidor
emitía esos eventos. La bandera separaba, en el tiempo, el despliegue del
servidor del despliegue de los clientes emisores.

El contrato ya está cerrado en etapas 1 a 6 con evidencia, y el servidor receptor
ya existe y no tiene gating: `CashEventHandler` esta siempre registrado y
`cash_sessions`/`cash_movements` no dependen de ninguna configuracion.

Correccion de contexto (2026-09-26, verificada en
`/Users/benjamin/Projects/POS/pos_flutter`): la bandera **sí** estaba
implementada en el cliente, no solo documentada. `CajaCommandService` la recibe
como `enabled` con default `false`
(`lib/core/di/application_dependencies.dart:200`,
`const bool.fromEnvironment('CASH_MANAGEMENT_ENABLED')`) y la usa en
`_checkEnabled()` y en `binding()`. Con la bandera apagada, `abrir` y `cerrar`
lanzan `StateError` y `binding()` devuelve `null`, de modo que la venta y el
abono en efectivo se registran **sin** movimiento de caja. Eliminar la bandera
exige por tanto un cambio de codigo, no solo de contrato.

Mantener la bandera obliga a compilar dos variantes del cliente, impide validar
paridad offline real (en la variante sin caja no hay corte que probar), y deja
un estado intermedio donde el servidor acepta caja y el cliente no la captura.

## Decisión

- La captura de caja es siempre activa. Se elimina `CASH_MANAGEMENT_ENABLED` y
  cualquier otra bandera o parámetro de compilación que la condicione.
  *Derogado en parte por ADR-0016:* queda además un ajuste de instalación
  (`cash_enabled`).
- El menú y las pantallas de caja existen en toda compilación, incluida la
  variante `standalone` (ADR-0011). Que la caja esté activa no habilita la
  sincronización: `standalone` conserva `not_required` y cero `event_refs`.
  *Derogado en parte por ADR-0016:* la entrada de menú se oculta cuando
  `cash_enabled` es falso.
- La compatibilidad con clientes antiguos pasa a ser una restricción de
  despliegue, no de compilación: el servidor no emite `caja_abierta` ni
  `caja_cerrada` hasta que todos los clientes en uso estén actualizados. El
  orden queda como migración PG/servidor receptor → clientes actualizados, sin
  paso de activación.
- No cambia nada del modelo de dominio: una caja operativa por `device_id`, el
  índice parcial único, el propietario único de operaciones y cierre, ni la
  obligación de apertura previa para ventas y abonos cash. La ausencia de
  apertura sigue siendo una operación rechazada, no una operación sin caja.

## Consecuencias

- Se elimina el estado intermedio servidor-con-caja / cliente-sin-caja, que era
  la unica razon del flag. Un corte generado localmente ya no depende de con que
  se compile la app.
- Cada dispositivo debe abrir su caja antes de vender o abonar en efectivo; el
  equipo de trabajo ve el paso de apertura todos los dias, sin excepción por
  instalacion.
- Perder la salvaguarda de compilacion traslada el riesgo al proceso de
  despliegue: si un cliente antiguo queda en servicio y el servidor emite caja,
  su `pull` puede detenerse. El control es verificar la version de todos los
  clientes activos antes de emitir.
- La paridad operativa offline del corte se puede verificar en una sola
  compilacion, sin duplicar pruebas por variante.

## Alcance aplicado

- `[[08 - Roadmap/Caja/Contrato funcional y de eventos]]` sube a revisión 2
  (ahora revisión 3 por ADR-0016): se reescribe el apartado de alcance y se
  elimina el paso de activación del orden de puesta en marcha.
- `[[08 - Roadmap/Caja/Estado y continuidad]]` refleja la revisión vigente.
- El servidor `pos-nest` no requiere cambios: no existe gating de caja que
  retirar.
- El cliente `pos_flutter` **sí** requiere cambios: eliminar
  `bool.fromEnvironment` en `lib/core/di/application_dependencies.dart:200` y
  resolver `enabled` desde la configuración instalada. Pendiente, ver ADR-0016.

## Enlaces

- [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011]]
- [[02 - Decisiones/ADR-0007 Paridad operativa offline salvo operaciones imposibles|ADR-0007]]
- [[08 - Roadmap/Caja/Contrato funcional y de eventos|Contrato funcional y de eventos]]
- [[08 - Roadmap/Caja/Estado y continuidad|Estado y continuidad]]
