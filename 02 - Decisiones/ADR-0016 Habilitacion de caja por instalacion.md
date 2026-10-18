---
tipo: ADR
id: ADR-0016
estado: decidido
fecha: 2026-09-26
actualizado: 2026-09-26
amenda: ADR-0015
---

# ADR-0016 Habilitacion de caja por instalacion

## Contexto

[[02 - Decisiones/ADR-0015 Corte de caja siempre habilitado|ADR-0015]] elimino la
bandera de compilacion y dejo la captura siempre activa. El operador pidio
controlarla desde la pantalla donde se elige el modo de operacion, para poder
habilitar el dispositivo cuando no la tenga.

Verificado en `/Users/benjamin/Projects/POS/pos_flutter`:

- `lib/core/di/application_dependencies.dart:200` inyecta
  `enabled: const bool.fromEnvironment('CASH_MANAGEMENT_ENABLED')` en
  `CajaCommandService`. Sin `--dart-define`, el valor es `false`.
- `CajaCommandService` (`lib/application/commands/caja/caja_command_service.dart`)
  usa `enabled` en dos lugares: `_checkEnabled()` bloquea `abrir` y `cerrar`, y
  `binding()` devuelve `null` cuando esta apagada.
- La configuracion instalada persiste en `AppConfig`
  (`lib/application/config/app_config.dart`) y se edita en
  `lib/presentation/onboarding/first_run_setup_screen.dart` (primer arranque) y
  `lib/presentation/pages/pantalla_principal/sync_settings_screen.dart` (cambio
  posterior de modo). `AppConfigController` expone la config viva y un stream de
  cambios.
- La entrada de menu `CashManagementScreen` esta en
  `lib/presentation/pages/pantalla_principal/menu_lateral.dart:97`, hoy sin
  condicion.

El problema de una bandera de compilacion es que obliga a compilar dos variantes
y deja un estado intermedio imposible de reproducir. El problema de no tener
ninguna opcion es que el operador no puede dejar un dispositivo sin captura de
caja, por ejemplo una terminal que solo cataloga o que comparte espacio con otra
que si la tiene.

## Decisión

- La habilitacion de caja es un **ajuste persistente de la instalacion**, no una
  bandera de compilacion. Se elimina `CASH_MANAGEMENT_ENABLED` y
  `bool.fromEnvironment`; ya no se usa `--dart-define` para caja.
- `AppConfig` agrega `cashEnabled`, persistido como `cash_enabled` en el mismo
  JSON de configuracion local, junto a `mode`, `auth_provider`,
  `sync_provider` y `backup_provider`. `AppConfig.initial` lo deja en `true`: una
  instalacion nueva puede cobrar en efectivo de inmediato.
- La pantalla de modo agrega un interruptor «Corte de caja» junto al selector de
  modo, con el estado actual visible. Sirve para los dos sentidos: habilitar un
  dispositivo que no lo tiene y desactivar uno que no lo necesita.
- `CajaCommandService` deja de recibir `enabled` por constructor. Pasa a leerlo
  de `AppConfigController.config.cashEnabled` en el momento de usarlo, para que
  el cambio aplique sin reiniciar el contenedor de inyeccion. La UI de caja
  escucha `AppConfigController.changes`.
- El interruptor solo es operable cuando **no hay sesion de caja abierta** en el
  dispositivo. Con sesion abierta se rechaza y se muestra el motivo, porque la
  sesion en curso quedaria descrita por un ajuste que ya no la habilita.
- Con la caja habilitada se conserva el contrato vigente sin cambios: una caja
  por `device_id`, apertura previa obligatoria para venta y abono `cash`,
  finanzas solo con seleccion explicita, cierre con evidencia completa.
- Con la caja deshabilitada: la entrada de menu de caja se oculta,
  `abrir`/`cerrar` lanzan el error vigente «La captura de caja aun no esta
  habilitada.» y la venta o el abono `cash` se registra **sin** binding `cash`,
  es decir como operacion capturada sin caja.
- El ajuste es local: no es un evento, no se sincroniza y el servidor no lo
  valida. `pos-nest` no recibe cambios; `CashEventHandler` ya acepta eventos sin
  campo `cash`.

## Consecuencias

- Desactivar la caja no bloquea la venta en efectivo: la venta se guarda y llega
  al servidor, pero **no suma a ninguna caja**. Los totales de caja dejaran de
  cuadrar con la venta real sin que nada lo señale, porque el servidor trata la
  ausencia de `cash` como operacion historica o capturada sin caja. La
  integridad depende de que el operador no desactive la caja en un dispositivo
  que vende efectivo. Ver el punto abierto 1.
- Se pierde la garantia de que toda venta en efectivo este en una caja. Es
  exactamente lo que ADR-0015 elimino; la diferencia es que ahora es una decision
  visible y persistida, no un accidente de compilacion.
- Cada dispositivo puede tener la caja en un estado distinto. No existe
  verificacion central: el servidor no sabe ni le importa.
- Se mantiene la restriccion de despliegue: el servidor no emite
  `caja_abierta` ni `caja_cerrada` hasta que todos los clientes en uso
  entiendan esos eventos, sin importar si su caja esta habilitada.
- Perder el flag de compilacion elimina la prueba de paridad por variante, pero
  la lista de pruebas de caja ahora debe cubrir los dos estados del ajuste.

## Implementacion

Aplicada en `/Users/benjamin/Projects/POS/pos_flutter` el 2026-09-26.

- `AppConfig` (`lib/application/config/app_config.dart`): campo `cashEnabled`
  con default `true` en el constructor, en `initial`, en `copyWith` (conserva el
  valor si no se indica), en `toJson` como `cash_enabled` y en `fromJson` como
  `json['cash_enabled'] != false`. La ultima forma es deliberada: una
  instalacion previa sin la clave queda habilitada, para que una actualizacion no
  apague la captura en silencio.
- `CajaCommandService` (`lib/application/commands/caja/caja_command_service.dart`):
  el parametro `enabled` se sustituye por `AppConfigController config` y
  `enabled` pasa a ser un getter que lee `config.config.cashEnabled` en cada
  uso. No hay estado cacheado que reiniciar.
- `lib/core/di/application_dependencies.dart`: se elimina
  `enabled: const bool.fromEnvironment('CASH_MANAGEMENT_ENABLED')` y se inyecta
  `config: getIt<AppConfigController>()`. `CASH_MANAGEMENT_ENABLED` ya no existe
  como bandera.
- `first_run_setup_screen.dart`: seccion «Caja» con `SwitchListTile` «Corte de
  caja» entre la descripcion del modo y «Datos iniciales»; el valor viaja en el
  `AppConfig` que ya se guarda al terminar.
- `sync_settings_screen.dart`: seccion «Caja» con el mismo interruptor. Cambia
  con `AppConfigStore.saveConfig` y `AppConfigController.update`. Antes consulta
  `CashProjectionStore.current(deviceId)` y, si hay sesion abierta, no cambia
  nada y muestra «Cierra la caja de esta terminal antes de cambiar el ajuste.»
- `menu_lateral.dart`: la entrada «Apertura y corte de caja» pasa a
  `_CashMenuTile`, un widget privado que escucha `AppConfigController.changes` y
  se oculta cuando `cashEnabled` es `false`.

### Resolucion del punto abierto 1

Al implementar se confirmo que el bloqueo ya existia y es asimetrico por
construccion en `CajaCommandService`:

- Caja **habilitada** sin apertura previa: `binding()` lanza «Abre la caja de
  esta terminal antes de registrar efectivo.» El efectivo no existe fuera de
  una caja.
- Caja **deshabilitada**: `binding()` devuelve `null` y la venta o el abono se
  registra sin movimiento de caja. Aqui no hay bloqueo.

Se decide conservar este comportamiento: bloquea el caso que el operador quiere
controlar (caja activa y olvidada) y deja pasar el caso que el operador pidio
explicito (terminal sin caja). El riesgo de integridad es real y queda
mitigado solo por la UI: el subtitulo del interruptor advierte que al
desactivarlo el efectivo no suma a ninguna caja. Un bloqueo total obligaria a
usar `transfer` en una terminal sin caja, que es una regla de negocio que no se
ha analizado.

### Riesgo de migracion del valor por defecto

`cashEnabled` por defecto `true` cambia el comportamiento de las instalaciones
existentes. Antes, sin `--dart-define`, la caja estaba apagada en todas; al
actualizar, la venta en efectivo pasara a exigir apertura de caja. Es el
contrato vigente, pero es un cambio perceptible en terminales ya instaladas y
debe anunciarse antes de desplegar. Si se prefiere conservar el comportamiento
anterior, el default pasa a `false` y la eleccion queda como
instalacion-por-instalacion.

## Puntos abiertos

1. Resuelto en implementacion. Se conserva el registro sin caja cuando la
   captura esta deshabilitada, con la advertencia visible en la UI. Ver
   «Resolucion del punto abierto 1».
2. Definir si el cambio de `cash_enabled` debe quedar auditado como evento en
   `server_sync`, o si permanece solo como configuracion local sin trazabilidad.
3. Confirmar el valor por defecto ante el riesgo de migracion. Se eligio `true`;
   queda por decidir si las instalaciones existentes se migran a `true` o a
   `false` de forma explicita.

## Alcance aplicado

- `[[08 - Roadmap/Caja/Contrato funcional y de eventos]]` sube a revisión 3 con
  la habilitacion por instalacion y el comportamiento al estar deshabilitada.
- `[[05 - Datos/Modelo de tablas]]` agrega `cash_enabled` a la configuracion
  local sugerida.
- `[[02 - Decisiones/ADR-0015 Corte de caja siempre habilitado|ADR-0015]]` queda
  marcada como parcialmente reemplazada por esta.
- `pos-nest` sin cambios: la captura se decide en el cliente.
- `pos_flutter`: implementado y verificado. `dart analyze` sin incidencias y
  `flutter test` con 733 PASS. La unica falla,
  `movimiento_financiero_form_screen_test.dart: error de onSave`, se reprodujo
  con los cambios de esta sesion apartados y es previa.

## Enlaces

- [[02 - Decisiones/ADR-0015 Corte de caja siempre habilitado|ADR-0015]]
- [[02 - Decisiones/ADR-0011 Dos modos de app sobre el mismo core offline first|ADR-0011]]
- [[01 - Contexto/Modos de operacion|Modos de operacion]]
- [[08 - Roadmap/Caja/Contrato funcional y de eventos|Contrato funcional y de eventos]]
- [[08 - Roadmap/Caja/Estado y continuidad|Estado y continuidad]]

